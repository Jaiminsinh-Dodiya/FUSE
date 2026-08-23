import {
  app,
  BrowserWindow,
  WebContentsView,
  ipcMain,
  type WebContents,
  type IpcMainInvokeEvent,
} from "electron";
import { WindowController } from "./windows/WindowController";
import { ConfigurationManager } from "./config/ConfigurationManager";
import { SessionManager } from "./session/SessionManager";
import { SecurityPolicy } from "./security/SecurityPolicy";
import { DiagnosticsCollector } from "./diagnostics/DiagnosticsCollector";
import { buildSnapshot } from "./diagnostics/buildSnapshot";
import { attachNavigationPolicy } from "./security/attachNavigationPolicy";
import { attachDevToolsPolicy } from "./windows/attachDevToolsPolicy";
import { attachLifecyclePolicy, type LifecycleHandle } from "./applications/attachLifecyclePolicy";
import { AppRegistry } from "./applications/AppRegistry";
import type { AppDefinition } from "./applications/AppDefinition";
import type { AppSecurityConfig } from "./security/SecurityPolicy";
import { registerWindowControlsIpc } from "./windows/windowControlsIpc";
import { CommandRegistry } from "./commands/CommandRegistry";
import { registerMasterSearchShortcut, unregisterMasterSearchShortcut } from "./commands/globalShortcut";
import { githubAppDefinition, githubSecurityConfig } from "./applications/github";
import { youtubeMusicAppDefinition, youtubeMusicSecurityConfig } from "./applications/youtubeMusic";

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

const windowController = new WindowController();
const configManager = new ConfigurationManager();
const sessionManager = new SessionManager();
const appRegistry = new AppRegistry();
const diagnosticsCollector = new DiagnosticsCollector();
const commandRegistry = new CommandRegistry();

interface AppRuntime {
  view: WebContentsView;
  lifecycle: LifecycleHandle;
}
const appRuntimes = new Map<string, AppRuntime>();
let activeAppId: string | null = null;
let masterSearchRegistered = false;

// Both apps' configs known upfront, so SecurityPolicy is built once
// with the full map — no need for post-construction mutation.
const securityPolicy = new SecurityPolicy(
  new Map([
    ["github", githubSecurityConfig],
    ["youtube-music", youtubeMusicSecurityConfig],
  ]),
  diagnosticsCollector,
);

function isFromShellWindow(sender: WebContents): boolean {
  const shellWindow = windowController.get();
  return shellWindow?.webContents.id === sender.id;
}

function handleFromShell<R>(
  channel: string,
  fn: (event: IpcMainInvokeEvent, ...args: any[]) => R,
): void {
  ipcMain.handle(channel, (event, ...args) => {
    if (!isFromShellWindow(event.sender)) {
      console.error(`[security] rejected IPC from unexpected sender on "${channel}"`);
      throw new Error("unauthorized sender");
    }
    return fn(event, ...args);
  });
}

function switchApplication(appId: string): void {
  if (activeAppId === appId || !appRuntimes.has(appId)) return;

  for (const [id, runtime] of appRuntimes) {
    if (id !== appId) runtime.lifecycle.setBackgrounded(true);
  }
  appRuntimes.get(appId)!.lifecycle.setBackgrounded(false);

  activeAppId = appId;
  windowController.get()?.webContents.send("app:activeChanged", { appId });
}

function launchApplication(
  def: AppDefinition,
  secConfig: AppSecurityConfig,
  startVisible: boolean,
): void {
  if (!appRegistry.get(def.id)) {
    appRegistry.register(def);
  }
  const appSession = sessionManager.getOrCreate(def.id, secConfig);

  const view = new WebContentsView({
    webPreferences: {
      session: appSession,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  windowController.attachApplicationView(view);
  attachNavigationPolicy(view, def.id, securityPolicy);
  attachDevToolsPolicy(view);
  const lifecycle = attachLifecyclePolicy(view, def.id, def.url, appRegistry, windowController.get()!);

  appRuntimes.set(def.id, { view, lifecycle });
  if (!startVisible) {
    lifecycle.setBackgrounded(true);
  } else {
    activeAppId = def.id;
  }

  void view.webContents.loadURL(def.url);

  commandRegistry.register({
    id: `reload-${def.id}`,
    title: `Reload ${def.name}`,
    run: () => lifecycle.reload(),
  });
  commandRegistry.register({
    id: `switch-${def.id}`,
    title: `Switch to ${def.name}`,
    run: () => switchApplication(def.id),
  });

  if (!app.isPackaged) {
    commandRegistry.register({
      id: `test-crash-${def.id}`,
      title: `[TEST] Crash ${def.name} renderer`,
      run: () => view.webContents.forcefullyCrashRenderer(),
    });
    commandRegistry.register({
      id: `test-hang-${def.id}`,
      title: `[TEST] Hang ${def.name} renderer (8s)`,
      run: () =>
        void view.webContents.executeJavaScript(
          "const s=Date.now(); while(Date.now()-s<8000){}",
        ),
    });
  }
}

handleFromShell("diagnostics:get", () => {
  const shellWindow = windowController.get();
  if (!shellWindow || !activeAppId) return null;
  const active = appRuntimes.get(activeAppId);
  return buildSnapshot(
    shellWindow,
    active?.view ?? null,
    appRegistry,
    diagnosticsCollector,
    masterSearchRegistered,
    activeAppId,
  );
});

handleFromShell("commands:list", () => commandRegistry.list());
handleFromShell("commands:execute", (_event, id: string) => commandRegistry.execute(id));
handleFromShell("appview:setOverlayVisible", (_event, open: boolean) => {
  for (const runtime of appRuntimes.values()) {
    // Overlay applies regardless of which app is active — diagnostics/
    // palette should hide whichever app is currently visible.
    if (!open || runtime.lifecycle) runtime.lifecycle.setOverlayVisible(open);
  }
});
handleFromShell("applications:switch", (_event, appId: string) => {
  switchApplication(appId);
});
handleFromShell("applications:getActive", () => activeAppId);

app.whenReady().then(() => {
  registerWindowControlsIpc();
  windowController.create(configManager.getWindowBounds());
  windowController.onBoundsChanged = (bounds) => {
    configManager.setWindowBounds(bounds);
    configManager.save();
  };

  launchApplication(githubAppDefinition, githubSecurityConfig, true);
  launchApplication(youtubeMusicAppDefinition, youtubeMusicSecurityConfig, false);

  masterSearchRegistered = registerMasterSearchShortcut(windowController.get()!);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowController.create(configManager.getWindowBounds());
      launchApplication(githubAppDefinition, githubSecurityConfig, true);
      launchApplication(youtubeMusicAppDefinition, youtubeMusicSecurityConfig, false);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  const win = windowController.get();
  if (win) {
    configManager.setWindowBounds(win.getBounds());
    configManager.save();
  }
});

app.on("will-quit", () => {
  unregisterMasterSearchShortcut();
});

app.on("second-instance", () => {
  const win = windowController.get();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
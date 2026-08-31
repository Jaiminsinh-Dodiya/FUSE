import {app, BrowserWindow, ipcMain, type WebContents, type IpcMainInvokeEvent, } from "electron";
import { WindowController } from "./windows/WindowController";
import { ConfigurationManager } from "./config/ConfigurationManager";
import { SessionManager } from "./session/SessionManager";
import { SecurityPolicy } from "./security/SecurityPolicy";
import { DiagnosticsCollector } from "./diagnostics/DiagnosticsCollector";
import { buildSnapshot } from "./diagnostics/buildSnapshot";
import { attachNavigationPolicy } from "./security/attachNavigationPolicy";
import { attachDevToolsPolicy } from "./windows/attachDevToolsPolicy";
import { AppRegistry } from "./applications/AppRegistry";
import type { AppDefinition } from "./applications/AppDefinition";
import type { AppSecurityConfig } from "./security/SecurityPolicy";
import { ViewManager, type AppRuntime } from "./applications/ViewManager";
import { registerWindowControlsIpc } from "./windows/windowControlsIpc";
import { CommandRegistry } from "./commands/CommandRegistry";
import { registerMasterSearchShortcut, unregisterMasterSearchShortcut } from "./commands/globalShortcut";
import { githubAppDefinition, githubSecurityConfig } from "./applications/github";
import { youtubeMusicAppDefinition, youtubeMusicSecurityConfig } from "./applications/youtubeMusic";

import { CapabilityManager } from "./capabilities/CapabilityManager";

const KNOWN_APPLICATIONS: Record<
  string,
  { def: AppDefinition; securityConfig: AppSecurityConfig }
> = {
  github: { def: githubAppDefinition, securityConfig: githubSecurityConfig },
  "youtube-music": { def: youtubeMusicAppDefinition, securityConfig: youtubeMusicSecurityConfig },
};

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

const windowController = new WindowController();
const configManager = new ConfigurationManager();
const sessionManager = new SessionManager();
const appRegistry = new AppRegistry();
const diagnosticsCollector = new DiagnosticsCollector();
const capabilityManager = new CapabilityManager(diagnosticsCollector);
const commandRegistry = new CommandRegistry();

let activeAppId: string | null = null;
let masterSearchRegistered = false;

// Both apps' configs known upfront, so SecurityPolicy is built once
// with the full map — no need for post-construction mutation.
const securityPolicy = new SecurityPolicy(
  new Map(Object.entries(KNOWN_APPLICATIONS).map(([id, a]) => [id, a.securityConfig])),
  diagnosticsCollector,
);

const viewManager = new ViewManager(
  windowController,
  securityPolicy,
  appRegistry,
  capabilityManager,
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
  if (activeAppId === appId || !viewManager.get(appId)) return;

  for (const id of viewManager.list()) {
    if (id !== appId) {
      viewManager.get(id)?.lifecycle.setBackgrounded(true);
    }
  }
  viewManager.get(appId)!.lifecycle.setBackgrounded(false);

  activeAppId = appId;
  configManager.setActiveApplication(appId);
  configManager.save();
  windowController.get()?.webContents.send("app:activeChanged", { appId });
}

function launchApplication(
  def: AppDefinition,
  secConfig: AppSecurityConfig,
  startVisible: boolean,
): void {
  const appSession = sessionManager.getOrCreate(def.id, secConfig);
  const runtime = viewManager.launch(def, appSession, startVisible);

  if (startVisible) {
    activeAppId = def.id;
  }

  commandRegistry.register({
    id: `reload-${def.id}`,
    title: `Reload ${def.name}`,
    run: () => runtime.lifecycle.reload(),
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
      run: () => runtime.view.webContents.forcefullyCrashRenderer(),
    });
    commandRegistry.register({
      id: `test-hang-${def.id}`,
      title: `[TEST] Hang ${def.name} renderer (8s)`,
      run: () =>
        void runtime.view.webContents.executeJavaScript(
          "const s=Date.now(); while(Date.now()-s<8000){}",
        ),
    });
  }
}

function launchConfiguredApplications(): void {
  const ids = configManager.getApplicationIds();
  const preferredActive = configManager.getActiveApplication();

  const valid = ids.filter((id) => {
    if (!KNOWN_APPLICATIONS[id]) {
      console.warn(`[config] unknown application id "${id}" in fuse-config.json, skipping`);
      return false;
    }
    return true;
  });

  if (valid.length === 0) {
    console.warn("[config] no valid applications configured, falling back to github");
    valid.push("github");
  }

  for (const id of valid) {
    const app = KNOWN_APPLICATIONS[id];
    if (!app) continue;
    const { def, securityConfig } = app;
    const startVisible = id === preferredActive || (!preferredActive && id === valid[0]);
    launchApplication(def, securityConfig, startVisible);
  }
}

handleFromShell("diagnostics:get", () => {
  const shellWindow = windowController.get();
  if (!shellWindow || !activeAppId) return null;
  const active = viewManager.get(activeAppId);
  return buildSnapshot(
    shellWindow,
    active?.view ?? null,
    appRegistry,
    diagnosticsCollector,
    masterSearchRegistered,
    activeAppId,
    capabilityManager,
  );
});

handleFromShell("commands:list", () => commandRegistry.list());
handleFromShell("commands:execute", (_event, id: string) => commandRegistry.execute(id));
handleFromShell("appview:setOverlayVisible", (_event, open: boolean) => {
  for (const id of viewManager.list()) {
    viewManager.get(id)?.lifecycle.setOverlayVisible(open);
  }
});
handleFromShell("app:getState", (_event, appId: string) => {
  return appRegistry.get(appId)?.state ?? null;
});
handleFromShell("applications:getCapabilities", (_event, appId: string) => {
  return appRegistry.get(appId)?.definition.capabilities ?? null;
});
handleFromShell("window:setContentInsets", (_event, insets: any) => {
  windowController.setContentInsets(insets);
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

  launchConfiguredApplications();

  masterSearchRegistered = registerMasterSearchShortcut(windowController.get()!);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowController.create(configManager.getWindowBounds());
      launchConfiguredApplications();
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
  if (win && !win.isDestroyed()) {
    const isMaximized = win.isMaximized();
    const bounds = (isMaximized && win.getNormalBounds) ? win.getNormalBounds() : win.getBounds();
    configManager.setWindowBounds({
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized,
    });
    if (activeAppId) {
      configManager.setActiveApplication(activeAppId);
    }
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
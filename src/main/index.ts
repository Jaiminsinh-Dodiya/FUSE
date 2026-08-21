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
import { registerWindowControlsIpc } from "./windows/windowControlsIpc";
import { CommandRegistry } from "./commands/CommandRegistry";
import { registerMasterSearchShortcut, unregisterMasterSearchShortcut } from "./commands/globalShortcut";
import { githubAppDefinition, githubSecurityConfig } from "./applications/github";

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
let githubView: WebContentsView | null = null;
let githubLifecycle: LifecycleHandle | null = null;
let masterSearchRegistered = false;

const securityPolicy = new SecurityPolicy(
  new Map([["github", githubSecurityConfig]]),
  diagnosticsCollector,
);

/**
 * Explicit IPC sender validation (brief section 12). Previously this
 * boundary existed only "by accident" — no preload script runs on
 * the GitHub app view, so it had no way to reach ipcMain regardless.
 * This makes that assumption explicit and checkable instead of
 * leaving it implicit forever.
 */
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

function launchGithub(): void {
  if (!appRegistry.get("github")) {
    appRegistry.register(githubAppDefinition);
  }
  const appSession = sessionManager.getOrCreate("github", githubSecurityConfig);

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
  githubView = view;

  windowController.attachApplicationView(view);
  attachNavigationPolicy(view, "github", securityPolicy);
  attachDevToolsPolicy(view);
  const lifecycle = attachLifecyclePolicy(
    view,
    "github",
    githubAppDefinition.url,
    appRegistry,
    windowController.get()!,
  );
  githubLifecycle = lifecycle;
  void view.webContents.loadURL(githubAppDefinition.url);

  commandRegistry.register({
    id: "reload-github",
    title: "Reload GitHub",
    run: () => lifecycle.reload(),
  });
  commandRegistry.register({
    id: "focus-github",
    title: "Open GitHub",
    run: () => {
      const win = windowController.get();
      win?.show();
      win?.focus();
    },
  });

  // TEST-ONLY: verifies CRASHED/UNRESPONSIVE lifecycle handling for
  // real, rather than trusting code symmetry with the tested FAILED
  // path. Gated behind !app.isPackaged so these can never appear in
  // a real build — see brief section 51 on marking debugging
  // workarounds clearly and not shipping them.
  if (!app.isPackaged) {
    commandRegistry.register({
      id: "test-crash-github",
      title: "[TEST] Crash GitHub renderer",
      run: () => {
        view.webContents.forcefullyCrashRenderer();
      },
    });
    commandRegistry.register({
      id: "test-hang-github",
      title: "[TEST] Hang GitHub renderer (8s)",
      run: () => {
        void view.webContents.executeJavaScript(
          "const s=Date.now(); while(Date.now()-s<8000){}",
        );
      },
    });
  }
}

handleFromShell("diagnostics:get", () => {
  const shellWindow = windowController.get();
  if (!shellWindow) return null;
  return buildSnapshot(shellWindow, githubView, appRegistry, diagnosticsCollector, masterSearchRegistered);
});

handleFromShell("commands:list", () => commandRegistry.list());
handleFromShell("commands:execute", (_event, id: string) => commandRegistry.execute(id));
handleFromShell("appview:setOverlayVisible", (_event, open: boolean) => {
  githubLifecycle?.setOverlayVisible(open);
});

app.whenReady().then(() => {
  registerWindowControlsIpc();
  windowController.create(configManager.getWindowBounds());
  windowController.onBoundsChanged = (bounds) => {
    configManager.setWindowBounds(bounds);
    configManager.save();
  };
  launchGithub();
  masterSearchRegistered = registerMasterSearchShortcut(windowController.get()!);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowController.create(configManager.getWindowBounds());
      launchGithub();
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
  // Electron docs are explicit: unregister global shortcuts before
  // quit, or they can linger and block re-registration on relaunch.
  unregisterMasterSearchShortcut();
});

app.on("second-instance", () => {
  const win = windowController.get();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
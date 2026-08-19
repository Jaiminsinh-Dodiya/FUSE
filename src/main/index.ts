import { app, BrowserWindow, WebContentsView, ipcMain } from "electron";
import { WindowController } from "./windows/WindowController";
import { SessionManager } from "./session/SessionManager";
import { SecurityPolicy } from "./security/SecurityPolicy";
import { DiagnosticsCollector } from "./diagnostics/DiagnosticsCollector";
import { buildSnapshot } from "./diagnostics/buildSnapshot";
import { attachNavigationPolicy } from "./security/attachNavigationPolicy";
import { attachDevToolsPolicy } from "./windows/attachDevToolsPolicy";
import { attachLifecyclePolicy } from "./applications/attachLifecyclePolicy";
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
const sessionManager = new SessionManager();
const appRegistry = new AppRegistry();
const diagnosticsCollector = new DiagnosticsCollector();
const commandRegistry = new CommandRegistry();
let githubView: WebContentsView | null = null;
let masterSearchRegistered = false;

const securityPolicy = new SecurityPolicy(
  new Map([["github", githubSecurityConfig]]),
  diagnosticsCollector,
);

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
}

ipcMain.handle("diagnostics:get", () => {
  const shellWindow = windowController.get();
  if (!shellWindow) return null;
  return buildSnapshot(shellWindow, githubView, appRegistry, diagnosticsCollector, masterSearchRegistered);
});

ipcMain.handle("commands:list", () => commandRegistry.list());
ipcMain.handle("commands:execute", (_event, id: string) => commandRegistry.execute(id));

app.whenReady().then(() => {
  registerWindowControlsIpc();
  windowController.create();
  launchGithub();
  masterSearchRegistered = registerMasterSearchShortcut(windowController.get()!);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowController.create();
      launchGithub();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
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
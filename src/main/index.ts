import { app, BrowserWindow, WebContentsView } from "electron";
import { WindowController } from "./windows/WindowController";
import { SessionManager } from "./session/SessionManager";
import { SecurityPolicy } from "./security/SecurityPolicy";
import { ConsoleDiagnostics } from "./security/ConsoleDiagnostics";
import { attachNavigationPolicy } from "./security/attachNavigationPolicy";
import { attachDevToolsPolicy } from "./windows/attachDevToolsPolicy";
import { attachLifecyclePolicy } from "./applications/attachLifecyclePolicy";
import { AppRegistry } from "./applications/AppRegistry";
import { registerWindowControlsIpc } from "./windows/windowControlsIpc";
import { githubAppDefinition, githubSecurityConfig } from "./applications/github";

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

const windowController = new WindowController();
const sessionManager = new SessionManager();
const appRegistry = new AppRegistry();

const securityPolicy = new SecurityPolicy(
  new Map([["github", githubSecurityConfig]]),
  new ConsoleDiagnostics(),
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
      sandbox: true, // no preload runs in an app view, so ESM isn't a concern here
    },
  });

  windowController.attachApplicationView(view);
  attachNavigationPolicy(view, "github", securityPolicy);
  attachDevToolsPolicy(view);
attachLifecyclePolicy(view, "github", githubAppDefinition.url, appRegistry, windowController.get()!);  void view.webContents.loadURL(githubAppDefinition.url);

}

app.whenReady().then(() => {
  registerWindowControlsIpc();
  windowController.create();
  launchGithub();

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

app.on("second-instance", () => {
  const win = windowController.get();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
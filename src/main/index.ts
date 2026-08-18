import { app, BrowserWindow, WebContentsView } from "electron";
import { WindowController } from "./windows/WindowController";
import { SessionManager } from "./session/SessionManager";
import { SecurityPolicy } from "./security/SecurityPolicy";
import { ConsoleDiagnostics } from "./security/ConsoleDiagnostics";
import { attachNavigationPolicy } from "./security/attachNavigationPolicy";
import { githubAppDefinition, githubSecurityConfig } from "./applications/github";
import { attachDevToolsPolicy } from "./windows/attachDevToolsPolicy";

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

const windowController = new WindowController();
const sessionManager = new SessionManager();

const securityPolicy = new SecurityPolicy(
  new Map([["github", githubSecurityConfig]]),
  new ConsoleDiagnostics(),
);

function launchGithub(): void {
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
  attachDevToolsPolicy(view);
  void view.webContents.loadURL(githubAppDefinition.url);
}

app.whenReady().then(() => {
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
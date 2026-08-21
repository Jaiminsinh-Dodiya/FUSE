import { ipcMain, BrowserWindow } from "electron";

/**
 * Registers window-control IPC handlers once, globally. Each handler
 * resolves the calling window from the IPC event itself
 * (BrowserWindow.fromWebContents), so this works correctly no matter
 * how many shell windows exist later — no per-window channel naming
 * needed.
 *
 * Sender validation (brief section 12): only a real BrowserWindow's
 * own top-level webContents may call these — not an embedded
 * WebContentsView (like the GitHub app view), which has no way to
 * resolve to a BrowserWindow via fromWebContents at all. This makes
 * that boundary explicit and checkable rather than relying on the
 * absence of a preload bridge alone.
 */
export function registerWindowControlsIpc(): void {
  function resolveShellWindow(sender: Electron.WebContents): BrowserWindow | null {
    const win = BrowserWindow.fromWebContents(sender);
    if (!win) {
      console.error("[security] rejected window-control IPC from a non-window sender");
      return null;
    }
    return win;
  }

  ipcMain.handle("window:minimize", (event) => {
    resolveShellWindow(event.sender)?.minimize();
  });

  ipcMain.handle("window:maximize", (event) => {
    const win = resolveShellWindow(event.sender);
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.handle("window:close", (event) => {
    resolveShellWindow(event.sender)?.close();
  });

  ipcMain.handle("window:isMaximized", (event) => {
    return resolveShellWindow(event.sender)?.isMaximized() ?? false;
  });
}
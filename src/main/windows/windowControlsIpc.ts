import { ipcMain, BrowserWindow } from "electron";

/**
 * Registers window-control IPC handlers once, globally. Each handler
 * resolves the calling window from the IPC event itself
 * (BrowserWindow.fromWebContents), so this works correctly no matter
 * how many shell windows exist later — no per-window channel naming
 * needed.
 */
export function registerWindowControlsIpc(): void {
  ipcMain.handle("window:minimize", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.handle("window:maximize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.handle("window:close", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  ipcMain.handle("window:isMaximized", (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false;
  });
}
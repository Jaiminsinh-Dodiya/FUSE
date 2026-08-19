import { globalShortcut, type BrowserWindow } from "electron";

// FUSE's Master Search shortcut. Explicitly Win+Alt+Space, not
// Ctrl+K — Ctrl+K is commonly claimed by dev tools/editors already
// running alongside FUSE (brief section 26).
const ACCELERATOR = "Super+Alt+Space";

/** Returns whether registration actually succeeded — the OS or
 * another app may already own this combo. Diagnostics reports this
 * honestly rather than assuming success. */
export function registerMasterSearchShortcut(shellWindow: BrowserWindow): boolean {
  const success = globalShortcut.register(ACCELERATOR, () => {
    shellWindow.webContents.send("commands:togglePalette");
  });

  if (!success) {
    console.warn(
      `[shortcut] failed to register ${ACCELERATOR} — likely already claimed by the OS or another app`,
    );
  }

  return success;
}

export function unregisterMasterSearchShortcut(): void {
  globalShortcut.unregister(ACCELERATOR);
}
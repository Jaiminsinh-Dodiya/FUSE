import { BrowserWindow, shell } from "electron";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * Owns the single top-level FUSE shell window. Applications live
 * *inside* this window as WebContentsViews (added later) — FUSE 0.0
 * does not create additional BrowserWindows for applications.
 * See docs/architecture section 7.
 */
export class WindowController {
  private window: BrowserWindow | null = null;

  create(): BrowserWindow {
    if (this.window) {
      return this.window;
    }

    const win = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 960,
      minHeight: 600,
      show: false,
      // Custom title bar per the brief's shell design — no native
      // OS chrome duplicating FUSE's own sidebar/titlebar.
      titleBarStyle: "hidden",
      webPreferences: {
        preload: join(__dirname, "../preload/index.mjs"),
        // Non-negotiable security defaults (brief section 17):
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: true,
      },
    });

    win.once("ready-to-show", () => {
      win.show();
    });

    // electron-vite sets ELECTRON_RENDERER_URL in dev, pointing at
    // the Vite dev server (hot reload). In production there is no
    // dev server — load the built renderer HTML from disk instead.
    if (process.env.ELECTRON_RENDERER_URL) {
      void win.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
      void win.loadFile(join(__dirname, "../renderer/index.html"));
    }

    // Any attempt to open a new window from the shell's own renderer
    // (not an embedded application view — that's SecurityPolicy's
    // job once WebContentsViews exist) is redirected to the system
    // browser rather than creating a second Electron window.
    win.webContents.setWindowOpenHandler(({ url }) => {
      void shell.openExternal(url);
      return { action: "deny" };
    });

    win.on("closed", () => {
      this.window = null;
    });

    this.window = win;
    return win;
  }

  get(): BrowserWindow | null {
    return this.window;
  }
}
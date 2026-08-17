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
      titleBarStyle: "hidden",
      webPreferences: {
        preload: join(__dirname, "../preload/index.mjs"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: true,
      },
    });

    win.once("ready-to-show", () => {
      win.show();
    });

    if (process.env.ELECTRON_RENDERER_URL) {
      void win.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
      void win.loadFile(join(__dirname, "../renderer/index.html"));
    }

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

  attachApplicationView(view: import("electron").WebContentsView): void {
    if (!this.window) {
      throw new Error("WindowController: cannot attach a view before create()");
    }
    this.window.contentView.addChildView(view);
    const bounds = this.window.getContentBounds();
    view.setBounds({
      x: 0,
      y: 40,
      width: bounds.width,
      height: bounds.height - 40,
    });
    this.window.on("resize", () => {
      const b = this.window!.getContentBounds();
      view.setBounds({ x: 0, y: 40, width: b.width, height: b.height - 40 });
    });
  }
}
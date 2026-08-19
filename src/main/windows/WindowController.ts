import { BrowserWindow, shell } from "electron";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { TITLEBAR_HEIGHT, SIDEBAR_WIDTH } from "./chromeLayout";
import { registerWindowControlsIpc } from "./windowControlsIpc";

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
      frame: false,
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

    // Same issue as the app view's DevTools: the GitHub WebContentsView
    // sits on top of the shell's own content at fixed bounds that don't
    // shrink for a docked DevTools panel, burying it. Force detach here
    // too, for the same reason.
    win.webContents.on("before-input-event", (event, input) => {
      const isDevToolsShortcut =
        input.type === "keyDown" &&
        (input.key === "F12" ||
          (input.control && input.shift && input.key.toUpperCase() === "I"));

      if (!isDevToolsShortcut) return;

      event.preventDefault();
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      } else {
        win.webContents.openDevTools({ mode: "detach" });
      }
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
      x: SIDEBAR_WIDTH,
      y: TITLEBAR_HEIGHT,
      width: bounds.width - SIDEBAR_WIDTH,
      height: bounds.height - TITLEBAR_HEIGHT,
    });
    this.window.on("resize", () => {
      const b = this.window!.getContentBounds();
      view.setBounds({ x: SIDEBAR_WIDTH, y: TITLEBAR_HEIGHT, width: b.width - SIDEBAR_WIDTH, height: b.height - TITLEBAR_HEIGHT });
    });
  }
}
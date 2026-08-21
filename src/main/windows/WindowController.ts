import { BrowserWindow, shell } from "electron";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { TITLEBAR_HEIGHT, SIDEBAR_WIDTH } from "./chromeLayout";
import { registerWindowControlsIpc } from "./windowControlsIpc";
import type { WindowBounds } from "../config/ConfigurationManager";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * Owns the single top-level FUSE shell window. Applications live
 * *inside* this window as WebContentsViews — FUSE 0.0 does not
 * create additional BrowserWindows for applications.
 * See docs/architecture section 7.
 */
export class WindowController {
  private window: BrowserWindow | null = null;

  /** Assignable callback, set once by index.ts. Simple over an event
   * emitter — the smallest thing that works (Rule 3: don't abstract
   * until a second real use case exists). */
  onBoundsChanged: ((bounds: WindowBounds) => void) | null = null;

  create(initialBounds?: WindowBounds): BrowserWindow {
    if (this.window) {
      return this.window;
    }

    const win = new BrowserWindow({
      width: initialBounds?.width ?? 1280,
      height: initialBounds?.height ?? 800,
      x: initialBounds?.x,
      y: initialBounds?.y,
      minWidth: 960,
      minHeight: 600,
      show: false,
      frame: false,
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
    // job for app views) is redirected to the system browser rather
    // than creating a second Electron window.
    win.webContents.setWindowOpenHandler(({ url }) => {
      void shell.openExternal(url);
      return { action: "deny" };
    });

    // The GitHub WebContentsView sits on top of the shell's own
    // content at fixed bounds that don't shrink for a docked
    // DevTools panel, burying it. Force detach here for the same
    // reason the app view's DevTools needed it.
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

    // Debounced so dragging/resizing doesn't hammer disk writes —
    // only the final settled size/position matters for persistence.
    let saveTimer: NodeJS.Timeout | null = null;
    const scheduleBoundsSave = () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        this.onBoundsChanged?.(win.getBounds());
      }, 500);
    };
    win.on("resize", scheduleBoundsSave);
    win.on("move", scheduleBoundsSave);

    win.on("closed", () => {
      this.window = null;
    });

    this.window = win;
    return win;
  }

  get(): BrowserWindow | null {
    return this.window;
  }

  /**
   * Attaches an application's WebContentsView into the shell window,
   * sized to fill the content area below the titlebar and to the
   * right of the sidebar.
   */
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
      view.setBounds({
        x: SIDEBAR_WIDTH,
        y: TITLEBAR_HEIGHT,
        width: b.width - SIDEBAR_WIDTH,
        height: b.height - TITLEBAR_HEIGHT,
      });
    });
  }
}
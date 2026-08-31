import { BrowserWindow, shell, type WebContentsView } from "electron";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { TITLEBAR_HEIGHT, SIDEBAR_WIDTH } from "./chromeLayout";
import type { WindowBounds } from "../config/ConfigurationManager";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export interface ContentInsets {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export class WindowController {
  private window: BrowserWindow | null = null;
  private appViews: WebContentsView[] = [];
  private contentInsets: ContentInsets = {
    top: TITLEBAR_HEIGHT,
    left: SIDEBAR_WIDTH,
    right: 0,
    bottom: 0,
  };

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

    let saveTimer: NodeJS.Timeout | null = null;
    const scheduleBoundsSave = () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        this.onBoundsChanged?.(win.getBounds());
      }, 500);
    };
    win.on("resize", scheduleBoundsSave);
    win.on("move", scheduleBoundsSave);

    // Single resize listener repositioning ALL attached app views,
    // rather than one listener per attachApplicationView() call
    // (that would have accumulated a duplicate listener per app).
    win.on("resize", () => this.repositionViews());

    win.on("closed", () => {
      this.window = null;
    });

    this.window = win;
    return win;
  }

  get(): BrowserWindow | null {
    return this.window;
  }

  attachApplicationView(view: WebContentsView): void {
    if (!this.window) {
      throw new Error("WindowController: cannot attach a view before create()");
    }
    this.window.contentView.addChildView(view);
    this.appViews.push(view);
    this.repositionViews();
  }

  detachApplicationView(view: WebContentsView): void {
    if (!this.window) return;
    this.window.contentView.removeChildView(view);
    this.appViews = this.appViews.filter((v) => v !== view);
  }

  setContentInsets(insets: Partial<ContentInsets>): void {
    this.contentInsets = {
      ...this.contentInsets,
      ...insets,
    };
    this.repositionViews();
  }

  private repositionViews(): void {
    if (!this.window) return;
    const b = this.window.getContentBounds();
    const x = this.contentInsets.left;
    const y = this.contentInsets.top;
    const width = Math.max(0, b.width - this.contentInsets.left - this.contentInsets.right);
    const height = Math.max(0, b.height - this.contentInsets.top - this.contentInsets.bottom);

    for (const view of this.appViews) {
      view.setBounds({
        x,
        y,
        width,
        height,
      });
    }
  }
}
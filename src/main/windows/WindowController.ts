import { BrowserWindow, screen, shell, type WebContentsView } from "electron";
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

    let { width = 1280, height = 800, x, y, isMaximized } = initialBounds ?? {};

    // Validate coordinates against connected displays to avoid spawning off-screen
    if (typeof x === "number" && typeof y === "number") {
      const displays = screen.getAllDisplays();
      const onScreen = displays.some((d) => {
        const { x: dx, y: dy, width: dw, height: dh } = d.bounds;
        return x! >= dx && x! <= dx + dw - 100 && y! >= dy && y! <= dy + dh - 100;
      });
      if (!onScreen) {
        x = undefined;
        y = undefined;
      }
    }

    const win = new BrowserWindow({
      width,
      height,
      x,
      y,
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
      if (isMaximized) {
        win.maximize();
      }
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
        if (!win.isDestroyed()) {
          const max = win.isMaximized();
          const bounds = (max && win.getNormalBounds) ? win.getNormalBounds() : win.getBounds();
          this.onBoundsChanged?.({
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
            isMaximized: max,
          });
        }
      }, 500);
    };

    win.on("resize", scheduleBoundsSave);
    win.on("move", scheduleBoundsSave);
    win.on("maximize", scheduleBoundsSave);
    win.on("unmaximize", scheduleBoundsSave);

    // Single resize listener repositioning ALL attached app views
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
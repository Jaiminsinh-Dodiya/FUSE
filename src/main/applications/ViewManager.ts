import { WebContentsView, type Session } from "electron";
import type { WindowController } from "../windows/WindowController";
import type { SecurityPolicy } from "../security/SecurityPolicy";
import type { AppRegistry } from "./AppRegistry";
import type { AppDefinition } from "./AppDefinition";
import { attachNavigationPolicy } from "../security/attachNavigationPolicy";
import { attachDevToolsPolicy } from "../windows/attachDevToolsPolicy";
import { attachLifecyclePolicy, type LifecycleHandle } from "./attachLifecyclePolicy";

export interface AppRuntime {
  view: WebContentsView;
  lifecycle: LifecycleHandle;
}

/**
 * Owns WebContentsView creation, attachment, and lifecycle wiring for
 * every application. Extracted per brief section 25, once a second
 * real application (YouTube Music) existed to prove the abstraction
 * against — this is not speculative infrastructure, it's removing
 * duplication that was already real and identical across two apps.
 *
 * Positioning/resizing remains WindowController's job (it owns the
 * window and layout constants) — this class delegates to it rather
 * than duplicating that logic.
 */
export class ViewManager {
  private readonly runtimes = new Map<string, AppRuntime>();

  constructor(
    private readonly windowController: WindowController,
    private readonly securityPolicy: SecurityPolicy,
    private readonly appRegistry: AppRegistry,
  ) {}

  launch(def: AppDefinition, session: Session, startVisible: boolean): AppRuntime {
    if (this.runtimes.has(def.id)) {
      throw new Error(`ViewManager: "${def.id}" is already launched`);
    }
    if (!this.appRegistry.get(def.id)) {
      this.appRegistry.register(def);
    }

    const view = new WebContentsView({
      webPreferences: {
        session,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    });

    this.windowController.attachApplicationView(view);
    attachNavigationPolicy(view, def.id, this.securityPolicy);
    attachDevToolsPolicy(view);
    const lifecycle = attachLifecyclePolicy(
      view,
      def.id,
      def.url,
      this.appRegistry,
      this.windowController.get()!,
    );

    if (!startVisible) {
      lifecycle.setBackgrounded(true);
    }

    void view.webContents.loadURL(def.url);

    const runtime: AppRuntime = { view, lifecycle };
    this.runtimes.set(def.id, runtime);
    return runtime;
  }

  get(appId: string): AppRuntime | undefined {
    return this.runtimes.get(appId);
  }

  list(): string[] {
    return Array.from(this.runtimes.keys());
  }

  /**
   * Not currently called anywhere — no code path removes an
   * application today. Included because AppState's DESTROYED state
   * already exists and section 25 names destruction as an owned
   * responsibility, but this is genuinely unused until something
   * needs it (e.g. a future "remove application" UI action). Kept
   * minimal rather than building out a full teardown ceremony for a
   * capability nothing exercises yet.
   */
  destroy(appId: string): void {
    const runtime = this.runtimes.get(appId);
    if (!runtime) return;
    this.windowController.detachApplicationView(runtime.view);
    runtime.view.webContents.close();
    this.runtimes.delete(appId);
  }
}
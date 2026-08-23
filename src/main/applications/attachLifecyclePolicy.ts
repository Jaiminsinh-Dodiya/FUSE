import { ipcMain, type WebContentsView, type BrowserWindow } from "electron";
import type { AppRegistry } from "./AppRegistry";
import type { AppLifecycleState } from "./AppState";

const reloadHandlersRegistered = new Set<string>();

export interface LifecycleHandle {
  reload: () => void;
  setOverlayVisible: (open: boolean) => void;
  setBackgrounded: (backgrounded: boolean) => void;
}

/**
 * Wires a live WebContentsView's real Chromium events to AppRegistry
 * state transitions, and broadcasts each change to the renderer.
 *
 * Visibility is controlled by THREE independent concerns, all routed
 * through one applyVisibility() so they never fight each other:
 *  - a failure state (FAILED/CRASHED/UNRESPONSIVE)
 *  - a shell overlay being open (diagnostics/command palette)
 *  - the app being backgrounded by app-switching (multiple apps now
 *    exist as of FUSE 0.2 — YouTube Music)
 */
export function attachLifecyclePolicy(
  view: WebContentsView,
  appId: string,
  appURL: string,
  registry: AppRegistry,
  shellWindow: BrowserWindow,
): LifecycleHandle {
  const { webContents } = view;
  let isFailureState = false;
  let overlayOpen = false;
  let isBackgrounded = false;

  function applyVisibility(): void {
    view.setVisible(!isFailureState && !overlayOpen && !isBackgrounded);
  }

  function setState(state: AppLifecycleState): void {
    try {
      registry.transition(appId, state);
    } catch (err) {
      console.error(`[lifecycle] illegal transition for "${appId}":`, err);
      return;
    }

    isFailureState = state === "FAILED" || state === "CRASHED" || state === "UNRESPONSIVE";
    applyVisibility();

    shellWindow.webContents.send("app:stateChanged", { appId, state });
  }

  function setOverlayVisible(open: boolean): void {
    overlayOpen = open;
    applyVisibility();
  }

  function setBackgrounded(backgrounded: boolean): void {
    isBackgrounded = backgrounded;
    applyVisibility();
    // Only attempt the ACTIVE<->BACKGROUND transition from a state
    // where it's actually legal. Transient states (LOADING, etc.)
    // just get hidden/shown visually without a state transition —
    // did-finish-load below handles landing in the right state once
    // loading completes.
    const current = registry.get(appId)?.state;
    if (backgrounded && current === "ACTIVE") {
      setState("BACKGROUND");
    } else if (!backgrounded && current === "BACKGROUND") {
      setState("ACTIVE");
    }
  }

  function reload(): void {
    const current = registry.get(appId)?.state;
    const target: AppLifecycleState =
      current === "ACTIVE" || current === "BACKGROUND" || current === "RELOADING"
        ? "RELOADING"
        : "LOADING";
    setState(target);
    void webContents.loadURL(appURL);
  }

  setState("LOADING");

  webContents.on("did-finish-load", () => {
    const current = registry.get(appId)?.state;
    if (current === "LOADING" || current === "RELOADING") {
      // Land in the state that matches current visibility intent —
      // e.g. an app launched while another is active should finish
      // loading into BACKGROUND, not flash ACTIVE then get hidden.
      setState(isBackgrounded ? "BACKGROUND" : "ACTIVE");
    }
  });

  webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    if (errorCode === -3) return;
    console.warn(`[lifecycle] "${appId}" failed to load: ${errorDescription} (${errorCode})`);
    setState("FAILED");
  });

  webContents.on("render-process-gone", (_event, details) => {
    console.error(`[lifecycle] "${appId}" renderer process gone: ${details.reason}`);
    setState("CRASHED");
  });

  webContents.on("unresponsive", () => {
    setState("UNRESPONSIVE");
  });

  webContents.on("responsive", () => {
    if (registry.get(appId)?.state === "UNRESPONSIVE") {
      setState("ACTIVE");
    }
  });

  if (!reloadHandlersRegistered.has(appId)) {
    reloadHandlersRegistered.add(appId);
    ipcMain.handle(`app:reload:${appId}`, () => {
      reload();
    });
  }

  return { reload, setOverlayVisible, setBackgrounded };
}
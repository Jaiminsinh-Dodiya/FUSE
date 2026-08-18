import { ipcMain, type WebContentsView, type BrowserWindow } from "electron";
import type { AppRegistry } from "./AppRegistry";
import type { AppLifecycleState } from "./AppState";

const reloadHandlersRegistered = new Set<string>();

/**
 * Wires a live WebContentsView's real Chromium events to AppRegistry
 * state transitions, and broadcasts each change to the renderer so
 * RecoveryOverlay can react. This is what makes AppState's lifecycle
 * machine real instead of just types nothing ever touches.
 *
 * Important: a WebContentsView paints ABOVE the shell window's own
 * renderer content — it is a separate Electron layer, not part of
 * the DOM. So when an app fails, we must explicitly hide the view
 * (setVisible(false)) or the renderer's recovery UI underneath it
 * will never be seen, even though it's correctly rendered.
 */
export function attachLifecyclePolicy(
  view: WebContentsView,
  appId: string,
  appURL: string,
  registry: AppRegistry,
  shellWindow: BrowserWindow,
): void {
  const { webContents } = view;

  function setState(state: AppLifecycleState): void {
    try {
      registry.transition(appId, state);
    } catch (err) {
      console.error(`[lifecycle] illegal transition for "${appId}":`, err);
      return;
    }

    const isFailureState = state === "FAILED" || state === "CRASHED" || state === "UNRESPONSIVE";
    view.setVisible(!isFailureState);

    shellWindow.webContents.send("app:stateChanged", { appId, state });
  }

  setState("LOADING");

  webContents.on("did-finish-load", () => {
    // Chromium loads its own internal error page as content after a
    // failed navigation, and THAT page's load also fires
    // did-finish-load. Only treat this as real recovery if we were
    // actually expecting one (LOADING/RELOADING) — otherwise this is
    // just the error page finishing, not the app coming back.
    const current = registry.get(appId)?.state;
    if (current === "LOADING" || current === "RELOADING") {
      setState("ACTIVE");
    }
  });

  webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    // -3 is Chromium's "aborted" code, fired for cancelled/superseded
    // navigations (e.g. a redirect) — not a real failure.
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
    // Only auto-recover from UNRESPONSIVE. FAILED/CRASHED need an
    // explicit user-initiated reload — don't hide errors just to
    // make the UI look clean (brief section 23).
    if (registry.get(appId)?.state === "UNRESPONSIVE") {
      setState("ACTIVE");
    }
  });

  if (!reloadHandlersRegistered.has(appId)) {
    reloadHandlersRegistered.add(appId);
    ipcMain.handle(`app:reload:${appId}`, () => {
      const current = registry.get(appId)?.state;
      // FAILED/CRASHED/UNRESPONSIVE only permit LOADING; a healthy
      // app permits RELOADING. Route to whichever is actually legal.
      const target: AppLifecycleState =
        current === "ACTIVE" || current === "BACKGROUND" || current === "RELOADING"
          ? "RELOADING"
          : "LOADING";
      setState(target);// Explicitly navigate to the app's real URL rather than
      // reload() — reload() replays whatever was LAST attempted,
      // which after a failure is the broken URL itself, not the
      // app's actual destination.
      void webContents.loadURL(appURL);
    });
  }
}
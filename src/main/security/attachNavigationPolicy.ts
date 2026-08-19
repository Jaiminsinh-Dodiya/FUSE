import { shell, type WebContentsView } from "electron";
import type { SecurityPolicy } from "./SecurityPolicy";

/**
 * Wires a SecurityPolicy's decisions into a live WebContentsView's
 * navigation events. This is the enforcement point — before this
 * function is called, SecurityPolicy only makes decisions on paper;
 * nothing actually stops a navigation. See brief sections 17-19 and
 * docs/applications/github.md.
 */
export function attachNavigationPolicy(
  view: WebContentsView,
  appId: string,
  policy: SecurityPolicy,
): void {
  const { webContents } = view;

  // Top-level navigation within the view (e.g. clicking a link).
  webContents.on("will-navigate", (event, url) => {
    const decision = policy.evaluateNavigation(appId, url);
    if (!decision.allow) {
      event.preventDefault();
    }
  });

  // Server-side redirects (e.g. an OAuth hop) get the same check at
  // each hop, per the compatibility contract's redirect note.
  webContents.on("will-redirect", (event, url) => {
    const decision = policy.evaluateNavigation(appId, url);
    if (!decision.allow) {
      event.preventDefault();
    }
  });

  // window.open / target="_blank" / new-window requests. Per
  // SecurityPolicy.evaluateNewWindow's contract: never create a
  // second Electron window. If the destination is on this app's own
  // allowlist, load it in the same view; anything else opens in the
  // system's default browser.
  webContents.setWindowOpenHandler(({ url }) => {
    const decision = policy.evaluateNewWindow(appId, url);
    if (decision.allow) {
      void webContents.loadURL(url);
    } else {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });
}
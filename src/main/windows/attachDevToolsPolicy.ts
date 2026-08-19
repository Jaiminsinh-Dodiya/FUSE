import type { WebContentsView } from "electron";

/**
 * Application WebContentsViews have fixed bounds managed by
 * WindowController — they don't participate in Chromium's normal
 * docked-DevTools layout, so a docked panel ends up rendering behind
 * the app's own content instead of shrinking it out of the way.
 *
 * Simplest correct fix: never allow docked DevTools on an app view.
 * Intercept the open shortcut and force detach mode (its own native
 * window) instead of trying to keep bounds in sync with a docked
 * panel we don't control the size of.
 */
export function attachDevToolsPolicy(view: WebContentsView): void {
  const { webContents } = view;

  webContents.on("before-input-event", (event, input) => {
    const isDevToolsShortcut =
      input.type === "keyDown" &&
      ((input.key === "F12") ||
        (input.control && input.shift && input.key.toUpperCase() === "I"));

    if (!isDevToolsShortcut) {
      return;
    }

    event.preventDefault();

    if (webContents.isDevToolsOpened()) {
      webContents.closeDevTools();
    } else {
      webContents.openDevTools({ mode: "detach" });
    }
  });
}
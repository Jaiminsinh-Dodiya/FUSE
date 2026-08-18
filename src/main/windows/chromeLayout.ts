/** Shell chrome dimensions. Single source of truth — WindowController's
 * WebContentsView bounds and the renderer's own layout CSS must both
 * derive from these, or they'll drift out of sync. */
export const TITLEBAR_HEIGHT = 40;
export const SIDEBAR_WIDTH = 56;
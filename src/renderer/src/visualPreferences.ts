export type PerformanceTier = "low" | "balanced" | "high";

export interface VisualPreferences {
  performanceTier: PerformanceTier;
  reducedMotion: boolean;
  effectsEnabled: boolean;
  sidebarMode: "auto" | "collapsed" | "expanded";
}

export const DEFAULT_VISUAL_PREFERENCES: VisualPreferences = {
  performanceTier: "balanced",
  reducedMotion: false,
  effectsEnabled: true,
  sidebarMode: "auto",
};

/**
 * Checks system preferences for reduced motion and returns the initial visual config.
 */
export function getInitialVisualPreferences(): VisualPreferences {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return {
    ...DEFAULT_VISUAL_PREFERENCES,
    reducedMotion: prefersReduced || false,
  };
}

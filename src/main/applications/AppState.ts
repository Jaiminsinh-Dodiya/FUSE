/**
 * Application state machine, per docs/architecture section 16.
 *
 *   CREATED -> LOADING -> ACTIVE <-> BACKGROUND
 *   ACTIVE -> RELOADING -> ACTIVE
 *   any operational state -> FAILED
 *   renderer crash -> CRASHED
 *   security policy violation -> BLOCKED
 *   detected hang -> UNRESPONSIVE
 *   FAILED | CRASHED | BLOCKED | UNRESPONSIVE -> (recovery) -> DESTROYED
 *
 * No automatic aggressive recovery in 0.0 — failures must be visible,
 * with user-initiated retry/reset actions only.
 */
export type AppLifecycleState =
  | "CREATED"
  | "LOADING"
  | "ACTIVE"
  | "BACKGROUND"
  | "RELOADING"
  | "FAILED"
  | "CRASHED"
  | "BLOCKED"
  | "UNRESPONSIVE"
  | "DESTROYED";

const RECOVERABLE_STATES: ReadonlySet<AppLifecycleState> = new Set([
  "FAILED",
  "CRASHED",
  "BLOCKED",
  "UNRESPONSIVE",
]);

export function isRecoverableState(state: AppLifecycleState): boolean {
  return RECOVERABLE_STATES.has(state);
}

/** Explicit allowed transitions. Anything not listed here is rejected
 * by AppRegistry.transition() rather than silently permitted. */
const ALLOWED_TRANSITIONS: Readonly<Record<AppLifecycleState, readonly AppLifecycleState[]>> = {
  CREATED: ["LOADING", "FAILED"],
  LOADING: ["ACTIVE", "FAILED", "CRASHED", "UNRESPONSIVE"],
  ACTIVE: ["BACKGROUND", "RELOADING", "FAILED", "CRASHED", "BLOCKED", "UNRESPONSIVE"],
  BACKGROUND: ["ACTIVE", "FAILED", "CRASHED", "UNRESPONSIVE"],
  RELOADING: ["ACTIVE", "FAILED", "CRASHED", "UNRESPONSIVE"],
  FAILED: ["DESTROYED", "LOADING"],
  CRASHED: ["DESTROYED", "LOADING"],
  BLOCKED: ["DESTROYED"],
  UNRESPONSIVE: ["DESTROYED", "ACTIVE"],
  DESTROYED: [],
};

export function canTransition(from: AppLifecycleState, to: AppLifecycleState): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

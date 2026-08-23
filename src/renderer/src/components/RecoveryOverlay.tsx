import { useEffect, useState } from "react";

type LifecycleState =
  | "CREATED" | "LOADING" | "ACTIVE" | "BACKGROUND" | "RELOADING"
  | "FAILED" | "CRASHED" | "BLOCKED" | "UNRESPONSIVE" | "DESTROYED";

const FAILURE_STATES: LifecycleState[] = ["FAILED", "CRASHED", "UNRESPONSIVE"];

/**
 * Renders only when the given application's real lifecycle state is
 * a failure state. Fetches the CURRENT real state on mount/appId
 * change (via app:getState) rather than only relying on future
 * onStateChanged events — otherwise switching to an app that already
 * crashed while backgrounded would show a blank view with no
 * explanation, since no state-change EVENT fires just from switching.
 * That was a real bug, not a hypothetical: an app crashing while
 * backgrounded, then being switched to, previously showed nothing.
 */
export function RecoveryOverlay({ appId }: { appId: string }) {
  const [state, setState] = useState<LifecycleState | null>(null);

  useEffect(() => {
    let cancelled = false;

    void window.fuse.applications.getState(appId).then((current: string | null) => {
      if (!cancelled) setState((current as LifecycleState) ?? null);
    });

    const unsubscribe = window.fuse.applications.onStateChanged(
      (payload: { appId: string; state: string }) => {
        if (payload.appId === appId) {
          setState(payload.state as LifecycleState);
        }
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [appId]);

  if (!state || !FAILURE_STATES.includes(state)) {
    return null;
  }

  const message =
    state === "UNRESPONSIVE"
      ? "This application has stopped responding."
      : state === "CRASHED"
        ? "This application crashed."
        : "This application failed to load.";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "#111318",
        color: "#e6e6e6",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: 15, opacity: 0.85 }}>{message}</div>
      <button
        onClick={() => window.fuse.applications.reload(appId)}
        style={{
          padding: "8px 20px",
          borderRadius: 6,
          border: "1px solid #262b36",
          background: "#1c2129",
          color: "#e6e6e6",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        Reload
      </button>
    </div>
  );
}
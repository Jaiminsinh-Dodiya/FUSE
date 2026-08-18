import { useEffect, useState } from "react";

type LifecycleState =
  | "CREATED" | "LOADING" | "ACTIVE" | "BACKGROUND" | "RELOADING"
  | "FAILED" | "CRASHED" | "BLOCKED" | "UNRESPONSIVE" | "DESTROYED";

const FAILURE_STATES: LifecycleState[] = ["FAILED", "CRASHED", "UNRESPONSIVE"];

/**
 * Renders only when the given application's real lifecycle state
 * (broadcast from main via attachLifecyclePolicy) is a failure state.
 * The app's WebContentsView is hidden by the main process during
 * those states specifically so this overlay becomes visible — see
 * attachLifecyclePolicy's setState for the setVisible(false) call.
 */
export function RecoveryOverlay({ appId }: { appId: string }) {
  const [state, setState] = useState<LifecycleState>("LOADING");

  useEffect(() => {
    return window.fuse.applications.onStateChanged((payload) => {
      if (payload.appId === appId) {
        setState(payload.state as LifecycleState);
      }
    });
  }, [appId]);

  if (!FAILURE_STATES.includes(state)) {
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
import { useEffect, useState } from "react";

export function StatusDock({
  expanded,
  onToggleDiagnostics,
  isPlayingMedia,
}: {
  expanded: boolean;
  onToggleDiagnostics: () => void;
  isPlayingMedia?: boolean;
}) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
      setDate(now.toLocaleDateString(undefined, options));
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        marginTop: "auto",
        marginBottom: 12,
        width: expanded ? "calc(100% - 16px)" : 40,
        background: expanded ? "rgba(22, 26, 34, 0.75)" : "transparent",
        borderRadius: 8,
        padding: expanded ? "8px 10px" : "0",
        border: expanded ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
        backdropFilter: expanded ? "blur(8px)" : "none",
        display: "flex",
        flexDirection: expanded ? "column" : "column",
        alignItems: expanded ? "stretch" : "center",
        gap: 6,
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Clock & Date */}
      <div
        style={{
          display: "flex",
          flexDirection: expanded ? "row" : "column",
          justifyContent: expanded ? "space-between" : "center",
          alignItems: "center",
          fontFamily: "ui-monospace, monospace",
          fontSize: expanded ? 12 : 10,
          color: "#a0aab8",
          userSelect: "none",
        }}
      >
        <span style={{ fontWeight: 600, color: "#e6e6e6" }}>{time}</span>
        {expanded && <span style={{ fontSize: 10, opacity: 0.7 }}>{date}</span>}
      </div>

      {/* Audio Activity Badge (if media is active) */}
      {isPlayingMedia && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "#68d391",
            padding: expanded ? "2px 0" : "2px",
            justifyContent: expanded ? "flex-start" : "center",
          }}
          title="Audio Playing"
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#68d391",
              boxShadow: "0 0 8px #68d391",
              display: "inline-block",
            }}
          />
          {expanded && <span style={{ fontSize: 10, fontWeight: 500 }}>Playing Audio</span>}
        </div>
      )}

      {/* Diagnostics Trigger Button */}
      <button
        title="Diagnostics"
        onClick={onToggleDiagnostics}
        style={{
          width: expanded ? "100%" : 40,
          height: 32,
          borderRadius: 6,
          border: "none",
          background: "rgba(255, 255, 255, 0.04)",
          color: "#9aa5b5",
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          padding: expanded ? "0 8px" : 0,
          gap: 8,
          cursor: "pointer",
          fontSize: 11,
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.color = "#ffffff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
          e.currentTarget.style.color = "#9aa5b5";
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h4l3 8 4-16 3 8h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {expanded && <span>Diagnostics</span>}
      </button>
    </div>
  );
}

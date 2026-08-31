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
        background: expanded ? "#f1f5f9" : "transparent",
        borderRadius: 8,
        padding: expanded ? "8px 10px" : "0",
        border: expanded ? "1px solid #e2e8f0" : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: expanded ? "stretch" : "center",
        gap: 6,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
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
          color: "#475569",
          userSelect: "none",
        }}
      >
        <span style={{ fontWeight: 700, color: "#0f172a" }}>{time}</span>
        {expanded && <span style={{ fontSize: 10, opacity: 0.8, color: "#64748b" }}>{date}</span>}
      </div>

      {/* Audio Activity Badge (if media is active) */}
      {isPlayingMedia && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "#16a34a",
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
              backgroundColor: "#16a34a",
              boxShadow: "0 0 6px rgba(22, 163, 74, 0.5)",
              display: "inline-block",
            }}
          />
          {expanded && <span style={{ fontSize: 10, fontWeight: 600 }}>Playing Audio</span>}
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
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          padding: expanded ? "0 8px" : 0,
          gap: 8,
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 500,
          transition: "background 0.15s ease, color 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f1f5f9";
          e.currentTarget.style.color = "#0f172a";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.color = "#475569";
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

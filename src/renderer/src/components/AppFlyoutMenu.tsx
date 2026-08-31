import { memo } from "react";

interface AppFlyoutMenuProps {
  appId: string;
  label: string;
  top: number;
  open: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onSelectApp: (appId: string) => void;
  isPlayingMedia?: boolean;
}

export const AppFlyoutMenu = memo(function AppFlyoutMenu({
  appId,
  label,
  top,
  open,
  onMouseEnter,
  onMouseLeave,
  onSelectApp,
  isPlayingMedia,
}: AppFlyoutMenuProps) {
  if (!open) return null;

  const isYTM = appId === "youtube-music";

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "fixed",
        left: 64,
        top: Math.max(48, top - 10),
        width: 210,
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "8px 6px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05)",
        zIndex: 100,
        color: "#0f172a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        userSelect: "none",
        animation: "fuse-flyout-in 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes fuse-flyout-in {
          from { opacity: 0; transform: translateX(-8px) scale(0.96); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "4px 8px 8px 8px",
          borderBottom: "1px solid #f1f5f9",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{label}</span>
        <span
          style={{
            fontSize: 9,
            padding: "2px 6px",
            borderRadius: 4,
            background: "#f1f5f9",
            color: "#64748b",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {isYTM ? "Media" : "Dev"}
        </span>
      </div>

      {/* App-Specific Action Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {isYTM ? (
          <>
            <FlyoutItem
              icon={isPlayingMedia ? "⏸" : "▶"}
              label={isPlayingMedia ? "Pause Music" : "Play Music"}
              onClick={() => onSelectApp(appId)}
            />
            <FlyoutItem
              icon="⏭"
              label="Next Track"
              onClick={() => onSelectApp(appId)}
            />
            <FlyoutItem
              icon="⏮"
              label="Previous Track"
              onClick={() => onSelectApp(appId)}
            />
            <FlyoutItem
              icon="🔄"
              label="Reload Music"
              onClick={() => window.fuse.commands.execute("reload-youtube-music")}
            />
          </>
        ) : (
          <>
            <FlyoutItem
              icon="📂"
              label="Explore Repos"
              onClick={() => onSelectApp(appId)}
            />
            <FlyoutItem
              icon="🔔"
              label="Notifications"
              onClick={() => onSelectApp(appId)}
            />
            <FlyoutItem
              icon="🔄"
              label="Reload GitHub"
              onClick={() => window.fuse.commands.execute("reload-github")}
            />
          </>
        )}

        <div style={{ height: 1, background: "#f1f5f9", margin: "3px 0" }} />

        {/* Primary Switch Action */}
        <FlyoutItem
          icon="↗"
          label={`Switch to ${label}`}
          highlight
          onClick={() => onSelectApp(appId)}
        />
      </div>
    </div>
  );
});

function FlyoutItem({
  icon,
  label,
  onClick,
  highlight,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "6px 8px",
        borderRadius: 6,
        border: "none",
        background: highlight ? "#f1f5f9" : "transparent",
        color: highlight ? "#0f172a" : "#334155",
        fontSize: 12,
        fontWeight: highlight ? 600 : 500,
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        transition: "background 0.12s ease, color 0.12s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#e2e8f0";
        e.currentTarget.style.color = "#0f172a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = highlight ? "#f1f5f9" : "transparent";
        e.currentTarget.style.color = highlight ? "#0f172a" : "#334155";
      }}
    >
      <span style={{ fontSize: 13, width: 16, display: "flex", justifyContent: "center" }}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

import { useState } from "react";
import { TITLEBAR_HEIGHT } from "../chromeLayout";

export function Titlebar({
  onTogglePalette,
  onToggleMedia,
}: {
  onTogglePalette?: () => void;
  onToggleMedia?: () => void;
}) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [trafficHover, setTrafficHover] = useState(false);

  const handleMaximize = async () => {
    await window.fuse.windowControls.maximize();
    setIsMaximized(await window.fuse.windowControls.isMaximized());
  };

  return (
    <header
      style={{
        height: TITLEBAR_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(22, 26, 34, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        WebkitAppRegion: "drag",
        padding: "0 12px",
        boxSizing: "border-box",
        userSelect: "none",
        zIndex: 40,
      } as React.CSSProperties}
    >
      {/* Left: macOS Traffic Lights */}
      <div
        onMouseEnter={() => setTrafficHover(true)}
        onMouseLeave={() => setTrafficHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          WebkitAppRegion: "no-drag",
        } as React.CSSProperties}
      >
        <TrafficLight
          color="#ff5f56"
          hoverColor="#e0443e"
          glyph="✕"
          showGlyph={trafficHover}
          onClick={() => window.fuse.windowControls.close()}
          title="Close"
        />
        <TrafficLight
          color="#ffbd2e"
          hoverColor="#dea123"
          glyph="—"
          showGlyph={trafficHover}
          onClick={() => window.fuse.windowControls.minimize()}
          title="Minimize"
        />
        <TrafficLight
          color="#27c93f"
          hoverColor="#1aab29"
          glyph={isMaximized ? "❐" : "＋"}
          showGlyph={trafficHover}
          onClick={handleMaximize}
          title={isMaximized ? "Restore" : "Maximize"}
        />
      </div>

      {/* Center: Search Trigger / App Title */}
      <div
        onClick={onTogglePalette}
        style={{
          fontSize: 12,
          color: "#8c9ba8",
          fontWeight: 500,
          letterSpacing: 0.5,
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 10px",
          borderRadius: 6,
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          transition: "all 0.15s ease",
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)";
          e.currentTarget.style.color = "#ffffff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
          e.currentTarget.style.color = "#8c9ba8";
        }}
      >
        <span>FUSE</span>
        <span style={{ fontSize: 10, opacity: 0.5, fontFamily: "ui-monospace, monospace" }}>
          Win+Alt+Space
        </span>
      </div>

      {/* Right: Media Overlay Trigger Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          WebkitAppRegion: "no-drag",
        } as React.CSSProperties}
      >
        <button
          onClick={onToggleMedia}
          style={{
            background: "none",
            border: "none",
            color: "#8c9ba8",
            cursor: "pointer",
            fontSize: 13,
            padding: "4px 8px",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.15s ease",
          }}
          title="Toggle Global Media Controller"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#8c9ba8";
            e.currentTarget.style.background = "none";
          }}
        >
          <span>🎵</span>
        </button>
      </div>
    </header>
  );
}

function TrafficLight({
  color,
  glyph,
  showGlyph,
  onClick,
  title,
}: {
  color: string;
  hoverColor: string;
  glyph: string;
  showGlyph: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        backgroundColor: color,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        fontSize: 8,
        fontWeight: 700,
        color: "rgba(0, 0, 0, 0.65)",
        lineHeight: 1,
      }}
    >
      {showGlyph ? glyph : null}
    </button>
  );
}

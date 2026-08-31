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
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #e2e8f0",
        WebkitAppRegion: "drag",
        padding: "0 16px",
        boxSizing: "border-box",
        userSelect: "none",
        zIndex: 40,
      } as React.CSSProperties}
    >
      {/* Left: macOS Traffic Lights (Standard 14px size) */}
      <div
        onMouseEnter={() => setTrafficHover(true)}
        onMouseLeave={() => setTrafficHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          WebkitAppRegion: "no-drag",
        } as React.CSSProperties}
      >
        <TrafficLight
          color="#ff5f57"
          hoverColor="#e0443e"
          glyph="✕"
          showGlyph={trafficHover}
          onClick={() => window.fuse.windowControls.close()}
          title="Close"
        />
        <TrafficLight
          color="#febc2e"
          hoverColor="#dea123"
          glyph="—"
          showGlyph={trafficHover}
          onClick={() => window.fuse.windowControls.minimize()}
          title="Minimize"
        />
        <TrafficLight
          color="#28c840"
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
          color: "#475569",
          fontWeight: 600,
          letterSpacing: 0.5,
          cursor: "pointer",
          WebkitAppRegion: "no-drag",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 14px",
          borderRadius: 8,
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
          transition: "all 0.15s ease",
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#e2e8f0";
          e.currentTarget.style.color = "#0f172a";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#f1f5f9";
          e.currentTarget.style.color = "#475569";
        }}
      >
        <span>FUSE</span>
        <span style={{ fontSize: 11, opacity: 0.6, fontFamily: "ui-monospace, monospace", fontWeight: 500 }}>
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
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            color: "#475569",
            cursor: "pointer",
            fontSize: 13,
            padding: "4px 10px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.15s ease",
            fontWeight: 500,
          }}
          title="Toggle Global Media Controller"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#0f172a";
            e.currentTarget.style.background = "#e2e8f0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#475569";
            e.currentTarget.style.background = "#f1f5f9";
          }}
        >
          <span>🎵</span>
          <span style={{ fontSize: 11 }}>Media</span>
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
        width: 14,
        height: 14,
        borderRadius: "50%",
        backgroundColor: color,
        border: "1px solid rgba(0, 0, 0, 0.12)",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.4)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        fontSize: 9,
        fontWeight: 700,
        color: "rgba(0, 0, 0, 0.75)",
        lineHeight: 1,
        transition: "transform 0.1s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {showGlyph ? glyph : null}
    </button>
  );
}

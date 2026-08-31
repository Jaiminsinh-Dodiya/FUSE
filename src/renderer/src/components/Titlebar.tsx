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
      {/* Left: macOS Traffic Lights (Standard 14px size with exact SVG glyphs) */}
      <div
        onMouseEnter={() => setTrafficHover(true)}
        onMouseLeave={() => setTrafficHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          WebkitAppRegion: "no-drag",
          padding: "4px 0",
        } as React.CSSProperties}
      >
        {/* Red Close Button */}
        <TrafficLightButton
          color="#ff5f57"
          borderColor="#e0443e"
          onClick={() => window.fuse.windowControls.close()}
          title="Close"
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            style={{
              opacity: trafficHover ? 1 : 0,
              transition: "opacity 0.15s ease",
            }}
          >
            <path
              d="M1.5 1.5 L6.5 6.5 M6.5 1.5 L1.5 6.5"
              stroke="#4c0002"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </TrafficLightButton>

        {/* Yellow Minimize Button */}
        <TrafficLightButton
          color="#febc2e"
          borderColor="#d89e24"
          onClick={() => window.fuse.windowControls.minimize()}
          title="Minimize"
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            style={{
              opacity: trafficHover ? 1 : 0,
              transition: "opacity 0.15s ease",
            }}
          >
            <path
              d="M1 4 L7 4"
              stroke="#5c3d00"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </TrafficLightButton>

        {/* Green Maximize/Fullscreen Button */}
        <TrafficLightButton
          color="#28c840"
          borderColor="#1aab29"
          onClick={handleMaximize}
          title={isMaximized ? "Restore" : "Maximize"}
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            style={{
              opacity: trafficHover ? 1 : 0,
              transition: "opacity 0.15s ease",
            }}
          >
            {isMaximized ? (
              <path
                d="M1.5 6.5 L6.5 1.5 M1.5 3.5 L1.5 6.5 L4.5 6.5 M6.5 4.5 L6.5 1.5 L3.5 1.5"
                stroke="#004d11"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : (
              <>
                <polygon points="1,4.5 1,1 4.5,1" fill="#004d11" />
                <polygon points="7,3.5 7,7 3.5,7" fill="#004d11" />
              </>
            )}
          </svg>
        </TrafficLightButton>
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

function TrafficLightButton({
  color,
  borderColor,
  onClick,
  title,
  children,
}: {
  color: string;
  borderColor: string;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
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
        border: `1px solid ${borderColor}`,
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.4)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        transition: "transform 0.1s ease, filter 0.1s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.filter = "brightness(0.85)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.filter = "none";
      }}
    >
      {children}
    </button>
  );
}

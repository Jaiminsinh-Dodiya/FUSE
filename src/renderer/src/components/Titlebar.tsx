import { useState } from "react";
import { TITLEBAR_HEIGHT } from "../chromeLayout";

export function Titlebar() {
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
        justifyContent: "flex-start",
        background: "rgba(255, 255, 255, 0.98)",
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
      {/* Left: Minimalist macOS Traffic Lights */}
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

import { useState } from "react";
import { TITLEBAR_HEIGHT } from "../chromeLayout";

export function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMaximize = async () => {
    await window.fuse.windowControls.maximize();
    setIsMaximized(await window.fuse.windowControls.isMaximized());
  };

  return (
    <div
      style={{
        height: TITLEBAR_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#161a22",
        borderBottom: "1px solid #262b36",
        WebkitAppRegion: "drag",
      } as React.CSSProperties}
    >
      <div style={{ paddingLeft: 12, fontSize: 13, opacity: 0.7, fontWeight: 600 }}>
        FUSE
      </div>
      <div style={{ display: "flex", WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <TitlebarButton label="—" onClick={() => window.fuse.windowControls.minimize()} />
        <TitlebarButton label={isMaximized ? "❐" : "☐"} onClick={handleMaximize} />
        <TitlebarButton label="✕" onClick={() => window.fuse.windowControls.close()} danger />
      </div>
    </div>
  );
}

function TitlebarButton({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 44,
        height: TITLEBAR_HEIGHT,
        background: "transparent",
        border: "none",
        color: "#e6e6e6",
        cursor: "pointer",
        fontSize: 13,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? "#e5484d" : "#262b36";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {label}
    </button>
  );
}

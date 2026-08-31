import { useState } from "react";
import { SIDEBAR_WIDTH } from "../chromeLayout";
import { StatusDock } from "./StatusDock";

interface SidebarApp {
  id: string;
  label: string;
  category: string;
  glyph: React.ReactNode;
}

const APPS: SidebarApp[] = [
  { id: "github", label: "GitHub", category: "Dev", glyph: <GitHubGlyph /> },
  { id: "youtube-music", label: "YouTube Music", category: "Media", glyph: <MusicGlyph /> },
];

export function Sidebar({
  activeAppId,
  onSelectApp,
  onToggleDiagnostics,
  onAddApplication,
  isPlayingMedia,
  mode = "auto",
}: {
  activeAppId: string | null;
  onSelectApp: (appId: string) => void;
  onToggleDiagnostics: () => void;
  onAddApplication?: () => void;
  isPlayingMedia?: boolean;
  mode?: "auto" | "collapsed" | "expanded";
}) {
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = mode === "expanded" || (mode === "auto" && isHovered);

  const handleMouseEnter = () => {
    if (mode === "auto") {
      setIsHovered(true);
      void window.fuse.windowControls.setContentInsets({ left: 220 });
    }
  };

  const handleMouseLeave = () => {
    if (mode === "auto") {
      setIsHovered(false);
      void window.fuse.windowControls.setContentInsets({ left: SIDEBAR_WIDTH });
    }
  };

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: isExpanded ? 220 : SIDEBAR_WIDTH,
        height: "100%",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 12,
        boxSizing: "border-box",
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease",
        boxShadow: isExpanded ? "4px 0 20px rgba(0, 0, 0, 0.08)" : "none",
        zIndex: 50,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Application List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          width: "100%",
          padding: "0 8px",
          boxSizing: "border-box",
        }}
      >
        {APPS.map((appItem, index) => {
          const isActive = activeAppId === appItem.id;
          return (
            <button
              key={appItem.id}
              title={appItem.label}
              onClick={() => onSelectApp(appItem.id)}
              style={{
                height: 40,
                width: "100%",
                borderRadius: 8,
                border: "none",
                background: isActive ? "#e2e8f0" : "transparent",
                color: isActive ? "#0f172a" : "#475569",
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                gap: 12,
                cursor: "pointer",
                position: "relative",
                transition: "background 0.15s ease, color 0.15s ease",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 2,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    borderRadius: 2,
                    backgroundColor: "#6366f1",
                    boxShadow: "0 0 6px rgba(99, 102, 241, 0.5)",
                  }}
                />
              )}

              {/* App Icon */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: isActive ? "#0f172a" : "#64748b",
                }}
              >
                {appItem.glyph}
              </div>

              {/* Expanded App Name & Metadata */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flex: 1,
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? "translateX(0)" : "translateX(-8px)",
                  transition: "opacity 0.18s ease, transform 0.18s ease",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500 }}>
                  {appItem.label}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "#f1f5f9",
                    color: "#64748b",
                    fontFamily: "ui-monospace, monospace",
                    fontWeight: 600,
                  }}
                >
                  {index + 1}
                </span>
              </div>
            </button>
          );
        })}

        {/* Add Application Button */}
        {isExpanded && (
          <button
            onClick={() => onAddApplication?.()}
            style={{
              height: 36,
              width: "100%",
              borderRadius: 8,
              border: "1px dashed #cbd5e1",
              background: "transparent",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: 12,
              marginTop: 4,
              transition: "border-color 0.15s ease, color 0.15s ease, background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#94a3b8";
              e.currentTarget.style.color = "#0f172a";
              e.currentTarget.style.background = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ fontSize: 14 }}>+</span>
            <span>Add Application</span>
          </button>
        )}
      </div>

      {/* Decoupled Status & Telemetry Dock at bottom */}
      <StatusDock
        expanded={isExpanded}
        onToggleDiagnostics={onToggleDiagnostics}
        isPlayingMedia={isPlayingMedia}
      />
    </aside>
  );
}

function GitHubGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
        0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53
        .63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07
        -1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12
        0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04
        2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87
        3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38
        A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function MusicGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
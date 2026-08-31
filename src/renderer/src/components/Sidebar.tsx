import { useRef, useState } from "react";
import { SIDEBAR_WIDTH } from "../chromeLayout";
import { StatusDock } from "./StatusDock";
import { AppFlyoutMenu } from "./AppFlyoutMenu";

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
  isPlayingMedia,
}: {
  activeAppId: string | null;
  onSelectApp: (appId: string) => void;
  onToggleDiagnostics: () => void;
  isPlayingMedia?: boolean;
}) {
  const [hoveredApp, setHoveredApp] = useState<{ id: string; label: string; top: number } | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAppMouseEnter = (appItem: SidebarApp, event: React.MouseEvent<HTMLButtonElement>) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredApp({
      id: appItem.id,
      label: appItem.label,
      top: rect.top,
    });
  };

  const handleAppMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredApp(null);
    }, 180);
  };

  const handleFlyoutMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleFlyoutMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredApp(null);
    }, 180);
  };

  const handleSelectAndClose = (appId: string) => {
    setHoveredApp(null);
    onSelectApp(appId);
  };

  return (
    <>
      <aside
        style={{
          width: SIDEBAR_WIDTH,
          height: "100%",
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 12,
          boxSizing: "border-box",
          zIndex: 50,
          userSelect: "none",
          position: "relative",
        }}
      >
        {/* Application List */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
            padding: "0 8px",
            boxSizing: "border-box",
          }}
        >
          {APPS.map((appItem) => {
            const isActive = activeAppId === appItem.id;
            const isHovered = hoveredApp?.id === appItem.id;
            return (
              <button
                key={appItem.id}
                title={appItem.label}
                onClick={() => handleSelectAndClose(appItem.id)}
                onMouseEnter={(e) => handleAppMouseEnter(appItem, e)}
                onMouseLeave={handleAppMouseLeave}
                style={{
                  height: 40,
                  width: "100%",
                  borderRadius: 10,
                  border: "none",
                  background: isActive ? "#e2e8f0" : isHovered ? "#f1f5f9" : "transparent",
                  color: isActive ? "#0f172a" : "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                }}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: 2,
                      top: 10,
                      bottom: 10,
                      width: 3,
                      borderRadius: 2,
                      backgroundColor: "#6366f1",
                      boxShadow: "0 0 8px rgba(99, 102, 241, 0.6)",
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
                    color: isActive ? "#0f172a" : "#64748b",
                    transform: isHovered ? "scale(1.1)" : "scale(1)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  {appItem.glyph}
                </div>
              </button>
            );
          })}
        </div>

        {/* Decoupled Status & Telemetry Dock at bottom */}
        <StatusDock
          expanded={false}
          onToggleDiagnostics={onToggleDiagnostics}
          isPlayingMedia={isPlayingMedia}
        />
      </aside>

      {/* Arch-style Context Popover Flyout */}
      {hoveredApp && (
        <AppFlyoutMenu
          appId={hoveredApp.id}
          label={hoveredApp.label}
          top={hoveredApp.top}
          open={true}
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
          onSelectApp={handleSelectAndClose}
          isPlayingMedia={isPlayingMedia}
        />
      )}
    </>
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
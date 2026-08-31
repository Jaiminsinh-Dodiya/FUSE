import { useEffect, useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { RecoveryOverlay } from "./components/RecoveryOverlay";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import { CommandPalette } from "./components/CommandPalette";
import { AmbientGrid } from "./components/AmbientGrid";
import { MediaController } from "./components/MediaController";
import { getInitialVisualPreferences, type VisualPreferences } from "./visualPreferences";

export function App() {
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [visualPrefs] = useState<VisualPreferences>(getInitialVisualPreferences);

  useEffect(() => {
    void window.fuse.applications.getActive().then(setActiveAppId);
    return window.fuse.applications.onActiveChanged(({ appId }: { appId: string }) => {
      setActiveAppId(appId);
    });
  }, []);

  useEffect(() => {
    return window.fuse.commands.onTogglePalette(() => {
      setPaletteOpen((v) => !v);
    });
  }, []);

  useEffect(() => {
    void window.fuse.applications.setOverlayVisible(
      diagnosticsOpen || paletteOpen || mediaOpen,
    );
  }, [diagnosticsOpen, paletteOpen, mediaOpen]);

  return (
    <div style={{ height: "100vh", background: "#f8fafc", color: "#0f172a", overflow: "hidden", position: "relative" }}>
      {/* Layer 0: Ambient Background Visual Engine */}
      <AmbientGrid
        performanceTier={visualPrefs.performanceTier}
        reducedMotion={visualPrefs.reducedMotion}
        enabled={visualPrefs.effectsEnabled}
      />

      {/* Layer 1: Shell Navigation & Chrome */}
      <Titlebar
        onTogglePalette={() => setPaletteOpen((v) => !v)}
        onToggleMedia={() => setMediaOpen((v) => !v)}
      />
      <div style={{ display: "flex", height: "calc(100vh - 40px)", position: "relative", zIndex: 1 }}>
        <Sidebar
          activeAppId={activeAppId}
          onSelectApp={(id) => {
            setDiagnosticsOpen(false);
            setPaletteOpen(false);
            setMediaOpen(false);
            void window.fuse.applications.switch(id);
          }}
          onToggleDiagnostics={() => setDiagnosticsOpen((v) => !v)}
          onAddApplication={() => setPaletteOpen(true)}
          isPlayingMedia={activeAppId === "youtube-music"}
          mode={visualPrefs.sidebarMode}
        />
        <div style={{ flex: 1, position: "relative" }}>
          {activeAppId && <RecoveryOverlay appId={activeAppId} />}          
          {diagnosticsOpen && <DiagnosticsPanel onClose={() => setDiagnosticsOpen(false)} />}
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
          <MediaController open={mediaOpen} onClose={() => setMediaOpen(false)} />
        </div>
      </div>
    </div>
  );
}
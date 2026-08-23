import { useEffect, useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { RecoveryOverlay } from "./components/RecoveryOverlay";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import { CommandPalette } from "./components/CommandPalette";

export function App() {
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

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
    void window.fuse.applications.setOverlayVisible(diagnosticsOpen || paletteOpen);
  }, [diagnosticsOpen, paletteOpen]);

  return (
    <div style={{ height: "100vh", background: "#111318" }}>
      <Titlebar />
      <div style={{ display: "flex", height: "calc(100vh - 40px)" }}>
        <Sidebar
          activeAppId={activeAppId}
          onSelectApp={(id) => {
            setDiagnosticsOpen(false);
            setPaletteOpen(false);
            void window.fuse.applications.switch(id);
          }}
          onToggleDiagnostics={() => setDiagnosticsOpen((v) => !v)}
        />
        <div style={{ flex: 1, position: "relative" }}>
          <RecoveryOverlay appId={activeAppId ?? "github"} />
          {diagnosticsOpen && <DiagnosticsPanel onClose={() => setDiagnosticsOpen(false)} />}
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { RecoveryOverlay } from "./components/RecoveryOverlay";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import { CommandPalette } from "./components/CommandPalette";

export function App() {
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    return window.fuse.commands.onTogglePalette(() => {
      setPaletteOpen((v) => !v);
    });
  }, []);

  // The GitHub WebContentsView renders natively on top of this React
  // tree (a separate Electron layer, not DOM content) — this shell
  // only needs to render its own chrome (titlebar + sidebar) plus any
  // overlay UI (recovery screen, diagnostics panel, command palette).
  // The space to the right of the sidebar stays empty; WindowController
  // positions the app view there directly, using the same
  // TITLEBAR_HEIGHT/SIDEBAR_WIDTH constants as this layout.
  return (
    <div style={{ height: "100vh", background: "#111318" }}>
      <Titlebar />
      <div style={{ display: "flex", height: "calc(100vh - 40px)" }}>
        <Sidebar onToggleDiagnostics={() => setDiagnosticsOpen((v) => !v)} />
        <div style={{ flex: 1, position: "relative" }}>
          <RecoveryOverlay appId="github" />
          {diagnosticsOpen && <DiagnosticsPanel onClose={() => setDiagnosticsOpen(false)} />}
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        </div>
      </div>
    </div>
  );
}
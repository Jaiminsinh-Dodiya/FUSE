import { useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { RecoveryOverlay } from "./components/RecoveryOverlay";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";

export function App() {
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);

  // The GitHub WebContentsView renders natively on top of this React
  // tree (a separate Electron layer, not DOM content) — this shell
  // only needs to render its own chrome (titlebar + sidebar) plus any
  // overlay UI (recovery screen, diagnostics panel). The space to the
  // right of the sidebar stays empty; WindowController positions the
  // app view there directly, using the same TITLEBAR_HEIGHT/
  // SIDEBAR_WIDTH constants as this layout.
  return (
    <div style={{ height: "100vh", background: "#111318" }}>
      <Titlebar />
      <div style={{ display: "flex", height: "calc(100vh - 40px)" }}>
        <Sidebar onToggleDiagnostics={() => setDiagnosticsOpen((v) => !v)} />
        <div style={{ flex: 1, position: "relative" }}>
          <RecoveryOverlay appId="github" />
          {diagnosticsOpen && <DiagnosticsPanel onClose={() => setDiagnosticsOpen(false)} />}
        </div>
      </div>
    </div>
  );
}
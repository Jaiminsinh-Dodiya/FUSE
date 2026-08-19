import { useEffect, useState } from "react";

interface Snapshot {
  shell: { cpuPercent: number; memoryMB: number };
  github: { cpuPercent: number; memoryMB: number; state: string; session: string };
  navigation: { allowed: number; blocked: number };
  permissions: { granted: number; denied: number };
  shortcut: { masterSearch: string };
  renderer: string;
}

export function DiagnosticsPanel({ onClose }: { onClose: () => void }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const data = await window.fuse.diagnostics.get();
      if (!cancelled) setSnapshot(data);
    }

    void refresh();
    // Panel is only open when the user asked for it, so a 2s refresh
    // here is a foreground-only, user-requested poll, not a
    // continuously running background timer (brief section 36).
    const interval = setInterval(refresh, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        width: 280,
        background: "#161a22",
        border: "1px solid #262b36",
        borderRadius: 8,
        padding: 14,
        color: "#e6e6e6",
        fontFamily: "ui-monospace, monospace",
        fontSize: 12,
        lineHeight: 1.7,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <strong style={{ fontFamily: "system-ui, sans-serif" }}>FUSE Diagnostics</strong>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#e6e6e6", cursor: "pointer" }}
        >
          ✕
        </button>
      </div>
      {!snapshot ? (
        <div style={{ opacity: 0.6 }}>loading…</div>
      ) : (
        <>
          <Row label="Shell CPU" value={`${snapshot.shell.cpuPercent}%`} />
          <Row label="Shell Memory" value={`${snapshot.shell.memoryMB} MB`} />
          <Gap />
          <Row label="GitHub CPU" value={`${snapshot.github.cpuPercent}%`} />
          <Row label="GitHub Memory" value={`${snapshot.github.memoryMB} MB`} />
          <Row label="GitHub State" value={snapshot.github.state} />
          <Row label="Session" value={snapshot.github.session} />
          <Gap />
          <Row label="Nav Allowed" value={String(snapshot.navigation.allowed)} />
          <Row label="Nav Blocked" value={String(snapshot.navigation.blocked)} />
          <Gap />
          <Row label="Master Search" value={snapshot.shortcut.masterSearch} />
          <Row label="Renderer" value={snapshot.renderer} />
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ opacity: 0.6 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Gap() {
  return <div style={{ height: 6 }} />;
}
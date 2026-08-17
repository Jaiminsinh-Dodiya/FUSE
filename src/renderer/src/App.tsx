export function App() {
  const { node, chrome, electron } = window.fuse.versions;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
        color: "#e6e6e6",
        background: "#111318",
      }}
    >
      <h1 style={{ fontWeight: 600, letterSpacing: "-0.02em" }}>FUSE 0.0</h1>
      <p style={{ opacity: 0.6, fontSize: 14 }}>
        vertical slice — shell window + preload bridge online
      </p>
      <p style={{ opacity: 0.4, fontSize: 12, marginTop: 24 }}>
        Node {node} · Chrome {chrome} · Electron {electron}
      </p>
    </div>
  );
}

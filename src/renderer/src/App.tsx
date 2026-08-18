import { Titlebar } from "./components/Titlebar";

export function App() {
  // The GitHub WebContentsView renders natively on top of this
  // React tree (it's a separate Electron layer, not DOM content) —
  // this shell only needs to render the titlebar. The area below it
  // stays empty/transparent; the app view fills that space itself.
  return (
    <div style={{ height: "100vh", background: "#111318" }}>
      <Titlebar />
    </div>
  );
}
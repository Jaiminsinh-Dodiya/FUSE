import { useEffect, useState } from "react";

interface CommandItem {
  id: string;
  title: string;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (open) {
      void window.fuse.commands.list().then(setCommands);
      setQuery("");
      setSelected(0);
    }
  }, [open]);

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  );

  async function run(id: string) {
    await window.fuse.commands.execute(id);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && filtered[selected]) {
      void run(filtered[selected].id);
    }
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        paddingTop: 100,
        zIndex: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 420,
          maxHeight: 320,
          background: "#161a22",
          border: "1px solid #262b36",
          borderRadius: 10,
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search FUSE…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid #262b36",
            color: "#e6e6e6",
            fontSize: 14,
            outline: "none",
          }}
        />
        <div>
          {filtered.length === 0 && (
            <div style={{ padding: 14, opacity: 0.5, fontSize: 13 }}>No matching commands</div>
          )}
          {filtered.map((c, i) => (
            <div
              key={c.id}
              onMouseEnter={() => setSelected(i)}
              onClick={() => void run(c.id)}
              style={{
                padding: "10px 14px",
                fontSize: 13,
                color: "#e6e6e6",
                background: i === selected ? "#262b36" : "transparent",
                cursor: "pointer",
              }}
            >
              {c.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
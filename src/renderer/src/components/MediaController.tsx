import { useState, useEffect, memo } from "react";

export interface MediaState {
  isPlaying: boolean;
  title: string;
  artist: string;
  album?: string;
  source: string;
  currentTime: number;
  duration: number;
}

export const DEFAULT_MOCK_MEDIA: MediaState = {
  isPlaying: true,
  title: "For the Heavens",
  artist: "axjunior",
  album: "For the Heavens",
  source: "YouTube Music",
  currentTime: 42,
  duration: 180,
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const MediaController = memo(function MediaController({
  open,
  onClose,
  initialState = DEFAULT_MOCK_MEDIA,
}: {
  open: boolean;
  onClose: () => void;
  initialState?: MediaState;
}) {
  const [media, setMedia] = useState<MediaState>(initialState);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  useEffect(() => {
    if (!open || !media.isPlaying) return;
    const interval = setInterval(() => {
      setMedia((prev) => ({
        ...prev,
        currentTime: prev.currentTime >= prev.duration ? 0 : prev.currentTime + 1,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [open, media.isPlaying, media.duration]);

  if (!open) return null;

  const progressPercent = (media.currentTime / media.duration) * 100;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 480,
        background: "rgba(18, 20, 26, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 16,
        padding: "18px 22px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.2)",
        color: "#f0f4f8",
        fontFamily: "system-ui, -apple-system, sans-serif",
        zIndex: 100,
        userSelect: "none",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes fuse-vinyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fuse-bongo-tap {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-3deg); }
        }
        @keyframes fuse-wave-pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>

      {/* Top Bar: Source Badge & Close */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255, 255, 255, 0.08)",
            padding: "3px 10px",
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
            color: "#ff5252",
          }}
        >
          <span style={{ fontSize: 13 }}>🎵</span>
          <span>{media.source}</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#8c9ba8",
            cursor: "pointer",
            fontSize: 16,
            padding: 4,
          }}
          title="Close Media Controller"
        >
          ✕
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Vinyl Record Visualizer */}
        <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
          {/* Audio reactive outer waveform ring */}
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: "2px dashed rgba(99, 102, 241, 0.4)",
              animation: media.isPlaying ? "fuse-wave-pulse 2s ease-in-out infinite" : "none",
            }}
          />
          {/* Vinyl disc */}
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "radial-gradient(circle, #2d3748 18%, #1a202c 40%, #11141a 75%)",
              border: "2px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: media.isPlaying ? "fuse-vinyl-spin 8s linear infinite" : "none",
            }}
          >
            {/* Center Label */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 8px rgba(99, 102, 241, 0.6)",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#11141a" }} />
            </div>
          </div>
        </div>

        {/* Track Info & Controls */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {media.title}
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {media.artist}
          </div>

          {/* Controls row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
            <button
              onClick={() => setIsShuffle((v) => !v)}
              style={{ background: "none", border: "none", color: isShuffle ? "#6366f1" : "#64748b", cursor: "pointer", fontSize: 14 }}
              title="Shuffle"
            >
              🔀
            </button>
            <button
              onClick={() => setMedia((prev) => ({ ...prev, currentTime: Math.max(0, prev.currentTime - 10) }))}
              style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 16 }}
              title="Previous Track"
            >
              ⏮
            </button>
            <button
              onClick={() => setMedia((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "#f8fafc",
                color: "#0f172a",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                boxShadow: "0 2px 10px rgba(255, 255, 255, 0.2)",
              }}
              title={media.isPlaying ? "Pause" : "Play"}
            >
              {media.isPlaying ? "⏸" : "▶"}
            </button>
            <button
              onClick={() => setMedia((prev) => ({ ...prev, currentTime: Math.min(prev.duration, prev.currentTime + 10) }))}
              style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 16 }}
              title="Next Track"
            >
              ⏭
            </button>
            <button
              onClick={() => setIsRepeat((v) => !v)}
              style={{ background: "none", border: "none", color: isRepeat ? "#6366f1" : "#64748b", cursor: "pointer", fontSize: 14 }}
              title="Repeat"
            >
              🔁
            </button>
          </div>
        </div>

        {/* Animated Companion Widget (Bongo Cat / Wave) */}
        <div
          style={{
            width: 60,
            height: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.04)",
            borderRadius: 10,
            border: "1px solid rgba(255, 255, 255, 0.06)",
            animation: media.isPlaying ? "fuse-bongo-tap 0.5s ease-in-out infinite" : "none",
          }}
          title="FUSE Companion"
        >
          <span style={{ fontSize: 22 }}>🐱</span>
          <span style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>{media.isPlaying ? "jamming" : "chilling"}</span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            width: "100%",
            height: 4,
            background: "rgba(255, 255, 255, 0.12)",
            borderRadius: 2,
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * media.duration;
            setMedia((prev) => ({ ...prev, currentTime: Math.floor(newTime) }));
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(to right, #6366f1, #ec4899)",
              borderRadius: 2,
              transition: "width 0.2s linear",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginTop: 4 }}>
          <span>{formatTime(media.currentTime)}</span>
          <span>{formatTime(media.duration)}</span>
        </div>
      </div>
    </div>
  );
});

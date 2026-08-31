import { useState, useEffect, memo } from "react";
import { snapToGrid } from "../spatialGrid";

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
  currentTime: 1,
  duration: 120,
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

  // Generate 28 radiating equalizer wave tick heights
  const waveTicks = [
    6, 10, 14, 8, 18, 22, 16, 12, 20, 24, 18, 14, 22, 26, 
    18, 12, 16, 20, 14, 8, 12, 16, 22, 18, 14, 10, 8, 6
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: snapToGrid(24),
        right: snapToGrid(24),
        width: snapToGrid(620),
        background: "rgba(24, 24, 27, 0.94)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: snapToGrid(24),
        padding: `${snapToGrid(20)}px ${snapToGrid(28)}px`,
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45), 0 0 1px rgba(255, 255, 255, 0.2)",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
        zIndex: 100,
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
      }}
    >
      <style>{`
        @keyframes bongo-paw-tap {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(-18deg) translateY(4px); }
        }
        @keyframes soundwave-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes tap-rays-pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>

      {/* 1. Left Section: Circular Artwork with Radiating Soundwave Ticks */}
      <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {/* Radiating soundwave ticks */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            animation: media.isPlaying ? "soundwave-pulse 1.8s ease-in-out infinite" : "none",
          }}
        >
          {waveTicks.map((h, i) => {
            const angle = (i / waveTicks.length) * 360;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 3,
                  height: h,
                  backgroundColor: "#ffffff",
                  borderRadius: 2,
                  transformOrigin: "center bottom",
                  transform: `translate(-50%, -100%) rotate(${angle}deg) translateY(-46px)`,
                  opacity: 0.9,
                }}
              />
            );
          })}
        </div>

        {/* Circular Artwork */}
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1e293b, #334155, #0f172a)",
            border: "2px solid rgba(255, 255, 255, 0.4)",
            overflow: "hidden",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Aesthetic Water / Horizon Image Representation */}
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "radial-gradient(ellipse at 50% 30%, #38bdf8 0%, #1e3a8a 50%, #0f172a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 24, opacity: 0.8 }}>🌊</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Metadata, Track Info, Controls, Progress */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 260 }}>
        {/* Track Title & Artist */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>
            {media.title}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {media.album}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>
            {media.artist}
          </div>
        </div>

        {/* Playback Controls Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
          <button
            onClick={() => setIsShuffle((v) => !v)}
            style={{ background: "none", border: "none", color: isShuffle ? "#38bdf8" : "#94a3b8", cursor: "pointer", fontSize: 13 }}
            title="Shuffle"
          >
            🔀
          </button>
          <button
            onClick={() => setMedia((prev) => ({ ...prev, currentTime: Math.max(0, prev.currentTime - 10) }))}
            style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 15 }}
            title="Previous"
          >
            ⏮
          </button>

          {/* Center Play/Pause Pill Button */}
          <button
            onClick={() => setMedia((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
            style={{
              width: 44,
              height: 34,
              borderRadius: 10,
              border: "none",
              background: "#ffffff",
              color: "#0f172a",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: "bold",
              boxShadow: "0 2px 10px rgba(255, 255, 255, 0.25)",
              transition: "transform 0.1s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            title={media.isPlaying ? "Pause" : "Play"}
          >
            {media.isPlaying ? "❚❚" : "▶"}
          </button>

          <button
            onClick={() => setMedia((prev) => ({ ...prev, currentTime: Math.min(prev.duration, prev.currentTime + 10) }))}
            style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 15 }}
            title="Next"
          >
            ⏭
          </button>
          <button
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}
            title="Lyrics"
          >
            📑
          </button>
        </div>

        {/* Progress Bar & Timestamps */}
        <div style={{ width: "100%", marginTop: 10 }}>
          <div
            style={{
              width: "100%",
              height: 4,
              background: "rgba(255, 255, 255, 0.15)",
              borderRadius: 2,
              overflow: "hidden",
              cursor: "pointer",
              position: "relative",
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
                background: "#ffffff",
                borderRadius: 2,
                transition: "width 0.2s linear",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 4, fontFamily: "ui-monospace, monospace" }}>
            <span>{formatTime(media.currentTime)}</span>
            <span>{formatTime(media.duration)}</span>
          </div>
        </div>

        {/* Bottom Actions Row: Repeat + Source Pill + Trash/Close */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 6 }}>
          <button
            onClick={() => setIsRepeat((v) => !v)}
            style={{ background: "none", border: "none", color: isRepeat ? "#38bdf8" : "#94a3b8", cursor: "pointer", fontSize: 13 }}
            title="Repeat"
          >
            🔁
          </button>

          {/* Source Selector Pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255, 255, 255, 0.1)",
              padding: "4px 12px",
              borderRadius: 14,
              fontSize: 11,
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            <span>▶</span>
            <span>{media.source}</span>
            <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
          </div>

          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14 }}
            title="Close"
          >
            🗑
          </button>
        </div>
      </div>

      {/* 3. Right Section: Animated Bongo Cat Companion */}
      <div
        style={{
          width: 90,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Red Tap Rays Radiating from Paw */}
        {media.isPlaying && (
          <div
            style={{
              position: "absolute",
              left: 4,
              bottom: 22,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              animation: "tap-rays-pulse 0.4s ease-in-out infinite",
            }}
          >
            <span style={{ color: "#ef4444", fontSize: 10, fontWeight: 900 }}>╱</span>
            <span style={{ color: "#ef4444", fontSize: 10, fontWeight: 900 }}>—</span>
          </div>
        )}

        {/* Bongo Cat Body SVG */}
        <svg width="86" height="66" viewBox="0 0 100 80" fill="none">
          {/* Cat Head / Body */}
          <path
            d="M20 50 C20 30, 30 15, 55 15 C80 15, 90 30, 90 50 C90 65, 80 70, 55 70 C30 70, 20 65, 20 50 Z"
            fill="#ffffff"
            stroke="#18181b"
            strokeWidth="3"
          />
          {/* Left Ear */}
          <polygon points="28,24 16,6 38,16" fill="#ffffff" stroke="#18181b" strokeWidth="3" />
          {/* Right Ear */}
          <polygon points="72,16 94,6 82,24" fill="#ffffff" stroke="#18181b" strokeWidth="3" />
          {/* Eyes */}
          <circle cx="42" cy="38" r="3.5" fill="#18181b" />
          <circle cx="68" cy="38" r="3.5" fill="#18181b" />
          {/* Cat Mouth / Whiskers */}
          <path d="M50 44 Q55 48 60 44" stroke="#18181b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Left Resting Paw */}
          <ellipse cx="28" cy="56" rx="8" ry="6" fill="#ffffff" stroke="#18181b" strokeWidth="2.5" />
          <circle cx="28" cy="56" r="3" fill="#fda4af" />

          {/* Right Tapping Paw (Animated) */}
          <g style={{ animation: media.isPlaying ? "bongo-paw-tap 0.4s ease-in-out infinite" : "none", transformOrigin: "70px 50px" }}>
            <ellipse cx="80" cy="52" rx="10" ry="7" fill="#ffffff" stroke="#18181b" strokeWidth="2.5" />
            <circle cx="80" cy="52" r="3.5" fill="#fda4af" />
          </g>
        </svg>
      </div>
    </div>
  );
});

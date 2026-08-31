import { memo } from "react";
import type { PerformanceTier } from "../visualPreferences";

interface AmbientGridProps {
  performanceTier?: PerformanceTier;
  reducedMotion?: boolean;
  enabled?: boolean;
}

/**
 * AmbientGrid — Subtle Ambient Visual Engine.
 * 
 * Note: The Invisible Spatial Layout Grid is a separate behavioral layout system
 * (see spatialGrid.ts). The Ambient background provides a clean, uncluttered,
 * soft ambient surface without harsh visible lines.
 */
export const AmbientGrid = memo(function AmbientGrid({
  performanceTier = "balanced",
  reducedMotion = false,
  enabled = true,
}: AmbientGridProps) {
  if (!enabled || performanceTier === "low") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
      }}
    >
      {/* Soft ambient light glow in background */}
      {!reducedMotion && (
        <>
          <style>{`
            @keyframes fuse-ambient-drift {
              0% { transform: translate(0, 0) scale(1); opacity: 0.35; }
              50% { transform: translate(40px, 20px) scale(1.08); opacity: 0.55; }
              100% { transform: translate(0, 0) scale(1); opacity: 0.35; }
            }
          `}</style>
          <div
            style={{
              position: "absolute",
              top: "15%",
              left: "25%",
              width: 500,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(224, 231, 255, 0.04) 50%, transparent 75%)",
              animation: "fuse-ambient-drift 18s ease-in-out infinite",
              filter: "blur(40px)",
              willChange: "transform, opacity",
            }}
          />
        </>
      )}
    </div>
  );
});

import { memo } from "react";
import type { PerformanceTier } from "../visualPreferences";

interface AmbientGridProps {
  performanceTier?: PerformanceTier;
  reducedMotion?: boolean;
  enabled?: boolean;
}

/**
 * AmbientGrid — Compositor-Friendly Visual Engine (Phase 8B).
 * 
 * - Pure CSS grid background using repeating linear gradients.
 * - Cell-wise active glowing region that shifts across discrete grid units.
 * - Zero per-frame JavaScript animation loops.
 * - Fully respects performance tiers and reduced-motion preferences.
 */
export const AmbientGrid = memo(function AmbientGrid({
  performanceTier = "balanced",
  reducedMotion = false,
  enabled = true,
}: AmbientGridProps) {
  if (!enabled || performanceTier === "low") {
    return null;
  }

  const cellSize = performanceTier === "high" ? 28 : 36;
  const gridOpacity = performanceTier === "high" ? 0.08 : 0.045;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        background: "#0d0f14",
      }}
    >
      {/* Static Compositor Grid Lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, ${gridOpacity}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, ${gridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize}px ${cellSize}px`,
          maskImage: "radial-gradient(ellipse at 50% 50%, black 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 40%, transparent 85%)",
        }}
      />

      {/* Discrete Cell-Wise Active Region (Skipped if reducedMotion) */}
      {!reducedMotion && (
        <>
          <style>{`
            @keyframes fuse-cell-shift {
              0% {
                transform: translate(0px, 0px);
                opacity: 0.15;
              }
              25% {
                transform: translate(${cellSize * 3}px, 0px);
                opacity: 0.28;
              }
              50% {
                transform: translate(${cellSize * 3}px, ${cellSize * 2}px);
                opacity: 0.35;
              }
              75% {
                transform: translate(0px, ${cellSize * 2}px);
                opacity: 0.22;
              }
              100% {
                transform: translate(0px, 0px);
                opacity: 0.15;
              }
            }

            @keyframes fuse-cell-pulse {
              0%, 100% { opacity: 0.18; transform: scale(1); }
              50% { opacity: 0.32; transform: scale(1.02); }
            }
          `}</style>

          <div
            style={{
              position: "absolute",
              top: "25%",
              left: "30%",
              width: cellSize * 4,
              height: cellSize * 3,
              borderRadius: 6,
              background: "radial-gradient(circle at center, rgba(99, 102, 241, 0.22) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 75%)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
              animation: "fuse-cell-shift 24s steps(4) infinite, fuse-cell-pulse 8s ease-in-out infinite",
              willChange: "transform, opacity",
            }}
          />
        </>
      )}
    </div>
  );
});

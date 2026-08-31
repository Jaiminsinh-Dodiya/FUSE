/**
 * Invisible Spatial Layout Grid — FUSE UX System.
 * 
 * The Invisible Spatial Layout Grid is a behavioral coordinate system,
 * NOT a visible background effect. Floating FUSE elements (MediaController,
 * Diagnostics, CommandPalette, Popups) snap to this virtual grid (8px / 16px increments)
 * to ensure consistent, intentional, and polished placement.
 */
export const GRID_UNIT = 8;

export function snapToGrid(value: number, unit = GRID_UNIT): number {
  return Math.round(value / unit) * unit;
}

export function getGridAlignedBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  unit = GRID_UNIT
) {
  return {
    x: snapToGrid(x, unit),
    y: snapToGrid(y, unit),
    width: snapToGrid(width, unit),
    height: snapToGrid(height, unit),
  };
}

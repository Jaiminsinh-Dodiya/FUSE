# Phase 8 — Visual Shell, Navigation Dock, and Ambient Experience

## Architectural Separation (4-Layer Model)

FUSE Phase 8 introduces a clean layered rendering model:

| Layer | Responsibility | Components |
|---|---|---|
| **Layer 0** | Ambient Surface Visuals | `AmbientGrid.tsx`, theme backdrops |
| **Layer 1** | Shell Chrome & Navigation Dock | `Titlebar.tsx`, `Sidebar.tsx`, `StatusDock.tsx` |
| **Layer 2** | Remote Applications | `WebContentsView` (GitHub, YouTube Music) |
| **Layer 3** | Shell Overlays & Dialogs | `CommandPalette.tsx`, `DiagnosticsPanel.tsx`, `MediaController.tsx`, `AppFlyoutMenu.tsx`, `RecoveryOverlay.tsx` |

---

## Key Visual Systems

### 1. Ultra-Minimalist Titlebar & macOS Traffic Lights (`Titlebar.tsx`)
- Standard **14px diameter** window control buttons.
- Vector SVG glyphs (`×` close, `—` minimize, `◤◢` maximize/restore).
- Simultaneous cluster hover effect: hovering any button reveals the vector glyphs on all three buttons.
- Pure drag region with zero clutter or static text.

### 2. Arch / Hyprland Context Action Flyouts (`AppFlyoutMenu.tsx`, `Sidebar.tsx`)
- The primary sidebar stays a fixed, compact **56px icon dock**, preventing layout shifts.
- Hovering over an application icon opens an anchored context popover:
  - **YouTube Music**: Play/Pause, Next Track, Previous Track, Reload, Switch.
  - **GitHub**: Explore Repos, Notifications, Reload, Switch.

### 3. Radial Vinyl Animated Media Controller (`MediaController.tsx`)
- Snapped to the 8px Invisible Spatial Layout Grid (`spatialGrid.ts`).
- Circular album artwork with **radiating vertical soundwave equalizer bars** animating with playback.
- Centered track metadata, scrubber timeline, and repeat/source controls.
- Interactive animated Bongo Cat companion with beat-tapping paw and pulse rays.

### 4. Invisible Spatial Layout Grid (`spatialGrid.ts`)
- The **Ambient Grid** is a visual surface effect.
- The **Invisible Spatial Layout Grid** is a layout coordinate helper (`snapToGrid(val, unit = 8)`) ensuring floating modals, flyouts, and dialogs are aligned to a 8px/16px baseline without visible clutter.

### 5. Multi-Display Bounds & Maximized Persistence
- `WindowController` and `ConfigurationManager` safely preserve unmaximized restore bounds (`getNormalBounds()`), `isMaximized` flags, and validate coordinates against active monitors.

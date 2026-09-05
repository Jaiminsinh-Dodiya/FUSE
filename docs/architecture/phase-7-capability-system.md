# Phase 7 — Capability System & Background Media Integration

## Overview
Phase 7 introduces FUSE''s typed **Capability System**, allowing applications to declare what features they provide (Audio Playback, Media Keys, Notifications, Badging) and allowing the FUSE shell to manage, detect, and interact with them safely without breaking process isolation.

---

## Core Components

### 1. `CapabilityManager` (`src/main/capabilities/CapabilityManager.ts`)
Orchestrates capability attachments across active `Session` and `WebContentsView` runtimes:
- **Audio Detection**: Monitors real-time audio playback status across backgrounded and active application views.
- **Media Session Bridge**: Captures playback state and routes global media commands (play, pause, next, previous) to the target application view.
- **Notification Routing**: Intercepts native web notifications to provide shell-level telemetry and status.
- **Badge Tracking**: Reflects unread status or media indicators on sidebar dock icons.

### 2. Declarative Application Contracts
Applications define their supported capabilities in their `AppDefinition`:
```typescript
export interface AppCapabilities {
  audioPlayback?: boolean;
  mediaControls?: boolean;
  notifications?: boolean;
  badge?: boolean;
}
```

- **GitHub**: `{ notifications: true, badge: true }`
- **YouTube Music**: `{ audioPlayback: true, mediaControls: true, notifications: false }`

---

## Security & Isolation Preservation
- Capabilities run strictly in the privileged main process and preload bridge.
- Hosted remote web pages have **no** direct access to FUSE capabilities or Node.js APIs.
- Audio and notification events are validated against the sender''s session partition before broadcasting to the FUSE shell UI.

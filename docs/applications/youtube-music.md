# YouTube Music Compatibility Contract

Status: verified against real usage (manual testing, August 2026).

## Verified

- No bot-detection or challenge wall encountered (unlike GitHub, which
  required a User-Agent fix). YouTube Music loads and functions
  normally with FUSE's shared SessionManager UA handling.
- Session persistence confirmed: signed in, fully closed FUSE,
  reopened it — remained authenticated, same as GitHub's verified
  behavior. `persist:fuse-youtube-music` partition working correctly.
- Search, playback, and general navigation tested with a real account
  — no issues found.
  Background audio confirmed working correctly: switching away to
  another application (view hidden via setVisible(false)) does NOT
  interrupt playback — audio continues in the background, matching
  expected real-world music-app behavior. This works because
  setVisible only affects compositing, not the renderer process or
  its JS/audio execution — no special handling was needed or added.

## Identity
- id: `youtube-music`
- primary URL: `https://music.youtube.com`

## Navigation
Verified working: `music.youtube.com`, `youtube.com`, `ytimg.com`
(thumbnails), `googleusercontent.com` (avatars), `accounts.google.com`
(Google login redirect flow).

## Session
`persist:fuse-youtube-music` — fully isolated from `persist:fuse-github`.
No shared cookies/storage between applications, by design. Confirmed
via testing: signing into one app does not affect the other.

## Permissions
Default-deny, same as GitHub. Media playback does not require any
special Electron permission grant (audio/video autoplay via the
`<audio>`/`<video>` elements works without OS-level permission).
# YouTube Music Compatibility Contract

Status: draft — unverified hypothesis, same as github.md's original
status before real testing. Must be verified against observed
behavior before treated as final (brief section 10/14).

## Identity
- id: `youtube-music`
- primary URL: `https://music.youtube.com`

## Navigation
Hypothesis: `music.youtube.com`, `youtube.com`, `ytimg.com` (thumbnails),
`googleusercontent.com` (avatars), `accounts.google.com` (Google login
redirect flow). Needs real click-through testing — search, play a
track, open settings, sign in — to confirm nothing legitimate is
missing and nothing unnecessary is present.

## Session
`persist:fuse-youtube-music` — fully isolated from `persist:fuse-github`.
No shared cookies/storage between applications, by design.

## Permissions
Default-deny, same as GitHub. Media playback does not require any
special Electron permission grant (audio/video autoplay via the
`<audio>`/`<video>` elements works without OS-level permission).

## Known unknowns
- Not yet tested: does YouTube Music's UI trigger any bot-detection
  similar to GitHub's? (GitHub required a User-Agent fix — see
  SessionManager.)
- Not yet tested: does closing/reopening FUSE preserve login the same
  way it does for GitHub?
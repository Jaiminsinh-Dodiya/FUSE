# GitHub Compatibility Contract

Status: draft — the host allowlist below is a starting hypothesis and
must be verified against observed GitHub behavior before being treated
as final (per brief section 10).

## Identity

- id: `github`
- primary URL: `https://github.com`

## Navigation

- Initial allowed hosts (hypothesis, to verify): `github.com`,
  `github.githubassets.com`, `githubusercontent.com`,
  `githubusercontent.com` subdomains (e.g. `avatars.githubusercontent.com`,
  `raw.githubusercontent.com`), `github.io` is **out of scope** for 0.0
  (would allow arbitrary user-hosted content — do not add without a
  specific requirement).
- WebAuthn/passkey flows may involve `github.com` redirects only; if a
  third-party identity provider is observed, it must be added
  explicitly and documented here, not silently allowed.
- Redirects are re-evaluated against the same allowlist at each hop.
- Anything outside the allowlist is blocked at the SecurityPolicy layer
  and, where appropriate, offered to the user as "open in your default
  browser" instead.

## External Links

- Initial policy: open external destinations (anything not on the
  GitHub allowlist) in the system's default browser.

## Popups / New Windows

- All `window.open` / new-window requests are intercepted.
- If the target is on the GitHub allowlist, evaluate against
  navigation policy for the existing view (no separate popup window
  in 0.0).
- If the target is external, open in the system browser.
- No arbitrary Electron `BrowserWindow` is created in response to
  remote-page-initiated requests.

## Downloads

- Initial policy: hand off to the OS's normal download handling
  (system save dialog / default download location). No custom FUSE
  download manager in 0.0.

## Uploads

- Normal OS file picker via standard Chromium `<input type="file">`
  behavior. No custom handling needed in 0.0.

## Authentication

- Normal GitHub website authentication flow — FUSE never sees or asks
  for the user's password.
- Session persistence is handled entirely by the Electron session
  partition `persist:fuse-github` (see SessionManager).
- No credentials, cookies, or tokens are ever written to
  `fuse-config.json`.

## Permissions

Default-deny. Only grant what's demonstrably needed:

| Permission | Default | Notes |
|---|---|---|
| clipboard | browser-default only | no privileged clipboard API exposed |
| notifications | deny | postponed system, see brief section 25 |
| camera | deny | not required for GitHub |
| microphone | deny | not required for GitHub |
| geolocation | deny | not required for GitHub |
| media | deny | not required for GitHub |

If GitHub is observed requesting a permission not listed here, that
observation should be added to this table with a decision and
rationale — not silently granted.

## Clipboard

- No privileged/broad clipboard API is exposed to the GitHub
  WebContentsView. Standard browser clipboard behavior (copy/paste via
  normal user gesture) is unaffected.

## Diagnostics

- In development mode, every navigation/permission decision made by
  SecurityPolicy for this app is logged (allow + reason, or block +
  reason).
- Production logging must not capture page content, only policy
  decisions and counts.

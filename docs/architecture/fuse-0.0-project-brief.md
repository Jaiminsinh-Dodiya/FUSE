**FUSE**

**FUSE 0.0 --- Coding Agent Project Brief & Implementation Plan**

*Giant working specification for the first technical vertical slice*

Status: Pre-implementation / Engineering Brief

Primary platform for 0.0: Windows

Long-term platforms: Windows, Linux, macOS

First application: GitHub

Technology direction: Electron + TypeScript + React + Vite

Configuration direction: local JSON in 0.0; portable .fuse later

Application definition direction: .unified later

Default Master Search shortcut: Windows + Alt + Space

Core visual principle: "Really damn good if restrained."

# 0. Agent Instruction --- Read This First

You are the coding agent working on FUSE. FUSE is a serious long-term
cross-platform desktop application project, but the current task is
deliberately small: build FUSE 0.0 as a secure, performant technical
vertical slice.

Do not implement the entire long-term FUSE vision. Do not add Discord,
YouTube Music media integration, notifications, animated ambient
effects, marketplace features, cloud synchronization, plugins, or Linux
support in 0.0 unless explicitly requested.

Your job is to create a clean foundation that proves the core
architecture while avoiding premature abstraction.

## Non-negotiable engineering philosophy

-   Build small, but design clear boundaries for future expansion.

-   Do not over-engineer. Do not create abstractions without a real use
    case.

-   Security is part of the implementation, not a later cleanup task.

-   Measure performance from the first working build.

-   Remote web content is untrusted.

-   FUSE configuration must never contain credentials or browser
    sessions.

-   Prefer typed, explicit APIs over generic escape hatches.

-   Do not expose a generic command-execution API to remote pages.

-   Do not silently broaden application navigation policies.

-   When a requirement is unclear, inspect the architecture and existing
    code before inventing behavior.

# 1. What Is FUSE?

FUSE is a customizable, keyboard-first desktop shell for organizing
persistent web applications in one unified environment.

It runs above an existing operating system. It is not an operating
system, Linux distribution, browser replacement, password manager, or
media center.

> Operating System\
> ↓\
> Desktop / Window System\
> ↓\
> Electron + Chromium\
> ↓\
> FUSE Core / Shell\
> ↓\
> FUSE Application Layer\
> ↓\
> User-selected web applications

## Core product promise

FUSE should keep web applications organized, persistent, isolated, and
visually unified without requiring the user to manage many unrelated
browser windows or desktop clients.

## Long-term identity

-   Keyboard-first.

-   Highly customizable.

-   Local-first for configuration and sessions.

-   Cross-platform.

-   Performance-conscious.

-   Security-conscious.

-   Visually polished.

-   Application-oriented rather than browser-oriented.

# 2. Long-Term Vision vs Current Scope

## Long-term FUSE

> FUSE\
> ├── FUSE Core\
> │ ├── Window system\
> │ ├── Custom title bar\
> │ ├── Sidebar\
> │ ├── Tabs\
> │ ├── Command system\
> │ ├── Master Search\
> │ ├── Configuration\
> │ ├── Session manager\
> │ ├── Security policy\
> │ ├── Lifecycle manager\
> │ ├── Media service\
> │ └── Notification service\
> │\
> ├── Application Layer\
> │ ├── GitHub\
> │ ├── YouTube Music\
> │ ├── Discord\
> │ ├── YouTube\
> │ ├── Gmail\
> │ ├── RKU LMS\
> │ ├── Cisco Academy\
> │ └── Oracle Academy\
> │\
> ├── .fuse\
> │ └── portable FUSE configuration\
> │\
> └── .unified\
> └── declarative application definitions

## FUSE 0.0

> FUSE 0.0\
> ├── Electron\
> ├── TypeScript\
> ├── React\
> ├── Vite\
> ├── One BrowserWindow\
> ├── Custom title bar\
> ├── Basic sidebar\
> ├── Basic application registry\
> ├── One WebContentsView\
> ├── GitHub\
> ├── Persistent GitHub session\
> ├── Navigation policy\
> ├── External-link policy\
> ├── Minimal command palette\
> ├── Local JSON configuration\
> ├── Security policy\
> └── Developer diagnostics

The long-term vision is intentionally much larger than 0.0. Do not
confuse the two.

# 3. Why GitHub Is the First Application

GitHub is the first integration because it gives us a realistic web
application without immediately forcing the full complexity of media
integration.

## GitHub tests

-   Remote web content.

-   Authentication.

-   Persistent browser session.

-   Navigation.

-   External links.

-   Popups.

-   Downloads.

-   Uploads.

-   Clipboard behavior.

-   Potential WebAuthn/passkey behavior.

-   Application reload.

-   Renderer failures.

-   Security boundaries.

-   Performance.

YouTube Music is still an important second application. Its deeper media
requirements will be implemented after the basic application engine is
proven.

# 4. FUSE 0.0 Definition of Done

FUSE 0.0 is successful when the following flow works reliably:

> Launch FUSE\
> ↓\
> Custom FUSE window appears\
> ↓\
> Custom title bar works\
> ↓\
> Sidebar shows GitHub\
> ↓\
> GitHub opens in WebContentsView\
> ↓\
> User logs into GitHub normally\
> ↓\
> User can navigate safely\
> ↓\
> External links follow policy\
> ↓\
> User closes FUSE\
> ↓\
> User reopens FUSE\
> ↓\
> GitHub remains authenticated\
> ↓\
> FUSE remains responsive\
> ↓\
> Security diagnostics show no unexpected privilege exposure\
> ↓\
> Performance baseline is recorded

# 5. Technology Stack

## Required

-   Electron.

-   TypeScript.

-   React.

-   Vite.

-   HTML/CSS.

-   Electron WebContentsView for embedded remote content.

-   Node.js tooling appropriate to the selected Electron version.

## Important implementation direction

Use Electron\'s main process for privileged desktop responsibilities and
a local renderer for the FUSE shell UI. Remote application pages must
not be treated as trusted shell UI.

> Main Process\
> ├── WindowController\
> ├── AppRegistry\
> ├── SessionManager\
> ├── ViewManager\
> ├── CommandRegistry\
> ├── ConfigurationManager\
> ├── SecurityPolicy\
> ├── ShortcutManager\
> └── Diagnostics\
> \
> Preload\
> └── Narrow typed shell API\
> \
> FUSE Renderer\
> ├── Titlebar\
> ├── Sidebar\
> ├── Tabs\
> ├── Command Palette\
> └── Settings\
> \
> Remote WebContentsView\
> └── GitHub

# 6. Repository Structure

> FUSE/\
> ├── package.json\
> ├── tsconfig.json\
> ├── vite.config.\*\
> ├── electron.vite.config.\* \# if chosen by implementation\
> ├── src/\
> │ ├── main/\
> │ │ ├── index.ts\
> │ │ ├── window/\
> │ │ │ └── WindowController.ts\
> │ │ ├── applications/\
> │ │ │ ├── AppRegistry.ts\
> │ │ │ ├── AppDefinition.ts\
> │ │ │ └── AppState.ts\
> │ │ ├── sessions/\
> │ │ │ └── SessionManager.ts\
> │ │ ├── views/\
> │ │ │ └── ViewManager.ts\
> │ │ ├── commands/\
> │ │ │ └── CommandRegistry.ts\
> │ │ ├── security/\
> │ │ │ └── SecurityPolicy.ts\
> │ │ ├── configuration/\
> │ │ │ └── ConfigManager.ts\
> │ │ ├── shortcuts/\
> │ │ │ └── ShortcutManager.ts\
> │ │ └── diagnostics/\
> │ │ └── DiagnosticsService.ts\
> │ │\
> │ ├── preload/\
> │ │ └── index.ts\
> │ │\
> │ └── renderer/\
> │ ├── App.tsx\
> │ ├── shell/\
> │ ├── titlebar/\
> │ ├── sidebar/\
> │ ├── tabs/\
> │ ├── command-palette/\
> │ ├── settings/\
> │ └── styles/\
> │\
> ├── applications/\
> │ └── github/\
> │ └── github.definition.ts\
> │\
> ├── schemas/\
> │ └── future/\
> │ ├── fuse.schema.json\
> │ └── unified.schema.json\
> │\
> ├── docs/\
> │ ├── architecture/\
> │ ├── security/\
> │ ├── performance/\
> │ └── applications/\
> │\
> └── README.md

This is a proposed starting structure, not a demand to create every file
immediately. Empty abstractions are prohibited.

# 7. Architecture Boundaries

## 7.1 Main process

The main process owns privileged responsibilities.

-   BrowserWindow lifecycle.

-   WebContentsView creation, placement, destruction, and lifecycle.

-   Application registry.

-   Session partitions.

-   Navigation policy enforcement.

-   Window creation policy.

-   Global shortcuts.

-   Configuration persistence.

-   Security policy.

-   Diagnostics.

-   Future media/notification services.

## 7.2 FUSE renderer

The renderer owns only the trusted local FUSE shell UI.

-   Title bar UI.

-   Sidebar.

-   Tabs.

-   Command palette.

-   Settings.

-   Theme tokens.

-   Shell interaction.

## 7.3 Preload

Preload is the narrow bridge between trusted shell UI and the main
process. Use a typed, explicit API. Do not expose raw Electron or Node
APIs.

## 7.4 Remote application content

GitHub is untrusted remote content. It receives no general FUSE API.

# 8. Window Architecture

FUSE uses one BrowserWindow for the initial shell.

> BrowserWindow\
> ├── FUSE Renderer\
> │ ├── custom title bar\
> │ ├── sidebar\
> │ ├── tabs\
> │ └── command palette\
> │\
> └── WebContentsView\
> └── GitHub

The ViewManager owns the WebContentsView. The renderer should not
directly create or destroy privileged web views.

## Custom title bar

The title bar is a major part of the FUSE visual identity, but v0.0 only
requires functional controls and basic styling.

> ● ● ●\
> │ │ └── maximize / restore\
> │ └────── minimize\
> └────────── close

Long-term FUSE will support configurable additional title-bar buttons
mapped to registered commands. That customization is not required for
the first technical slice.

# 9. GitHub Application Definition

> type AppDefinition = {\
> id: string;\
> name: string;\
> url: string;\
> icon?: string;\
> category?: string;\
> };

Keep the v0.0 application definition small. Do not create a huge
capability framework before a second application exists.

# 10. GitHub Compatibility Contract

Create a written contract in docs/applications/github.md before or
alongside the integration.

> GitHub Compatibility Contract\
> \
> Identity\
> - id: github\
> - primary URL: https://github.com\
> \
> Navigation\
> - Define allowed primary domains.\
> - Define how redirects are handled.\
> - Block unexpected navigation outside policy.\
> \
> External Links\
> - Initial policy: open external destinations in the system browser,\
> unless explicitly required to remain inside FUSE.\
> \
> Popups / New Windows\
> - Intercept new-window requests.\
> - Allow only expected behavior.\
> - Open external destinations safely.\
> \
> Downloads\
> - Initial policy: system download handling.\
> \
> Uploads\
> - Use normal OS file picker behavior where supported.\
> \
> Authentication\
> - Normal GitHub website authentication.\
> - No password storage by FUSE.\
> - Session persistence handled by Electron session partition.\
> \
> Permissions\
> - Explicitly handle permission requests.\
> - Default deny unless a requirement is documented.\
> \
> Clipboard\
> - Do not grant broad privileged clipboard APIs to remote content.\
> - Allow normal browser clipboard behavior only where appropriate.\
> \
> Diagnostics\
> - Log policy decisions in development mode.

The exact domain list and policies must be verified against observed
GitHub behavior. Do not blindly invent allowlists.

# 11. Session Architecture

GitHub receives an application-specific persistent Electron session
partition.

> GitHub\
> ↓\
> persist:fuse-github\
> ↓\
> Cookies / local storage / browser session\
> ↓\
> Authentication persists across FUSE restarts

The exact Electron session API and version-specific behavior must be
checked against the Electron version selected for the project.

## Credential rule

FUSE should not ask the user to give FUSE their GitHub password. The
user authenticates through GitHub\'s normal page.

The session storage belongs to the local application profile and must
never be exported into .fuse.

# 12. Configuration in v0.0

Use a simple local JSON configuration first. Do not prematurely finalize
the public .fuse schema.

> fuse-config.json\
> {\
> \"schemaVersion\": 0,\
> \"window\": {},\
> \"sidebar\": {},\
> \"applications\": \[\
> {\
> \"id\": \"github\"\
> }\
> \],\
> \"theme\": {}\
> }

The future portable .fuse format will be introduced after the
configuration model stabilizes.

Never store passwords, cookies, session tokens, OAuth tokens, or browser
authentication state in this file.

# 13. Future .fuse vs .unified

> .fuse\
> └── HOW FUSE LOOKS/BEHAVES\
> ├── theme\
> ├── sidebar\
> ├── titlebar\
> ├── shortcuts\
> ├── commands\
> ├── application order\
> └── visual preferences\
> \
> .unified\
> └── WHAT AN APPLICATION IS\
> ├── id\
> ├── name\
> ├── url\
> ├── icon\
> ├── category\
> └── later: declarative capabilities

Neither format should contain credentials. .unified must initially be
declarative and non-executable.

# 14. Command System

The FUSE command system exists in v0.0 because Master Search is a core
part of the product identity.

Default global shortcut: Windows + Alt + Space.

> Command\
> ├── id\
> ├── title\
> ├── description\
> ├── category\
> └── execute through trusted FUSE code

Initial commands:

-   Open GitHub

-   Reload GitHub

-   Close GitHub/Application

-   Open Settings

-   Next/Previous application if tabs exist

Remote pages must never be allowed to invoke arbitrary command IDs.

# 15. Master Search UI

The first version can be a simple command palette, not a full universal
search engine.

> Win + Alt + Space\
> ↓\
> ┌─────────────────────────────────┐\
> │ Search FUSE\... │\
> ├─────────────────────────────────┤\
> │ GitHub │\
> │ Reload Application │\
> │ Open Settings │\
> └─────────────────────────────────┘

The UI should feel fast. Do not implement fuzzy-search complexity unless
it is actually needed.

# 16. Application State Machine

> CREATED\
> ↓\
> LOADING\
> ↓\
> ACTIVE\
> ↕\
> BACKGROUND\
> \
> ACTIVE → RELOADING → ACTIVE\
> \
> Any operational state → FAILED\
> Any renderer crash → CRASHED\
> Security policy violation → BLOCKED\
> Detected hang/unresponsive renderer → UNRESPONSIVE\
> \
> FAILED / CRASHED / BLOCKED / UNRESPONSIVE\
> ↓\
> Recovery UI\
> ├── Retry / Reload where safe\
> └── Destroy / Reset where appropriate\
> \
> DESTROYED

Do not implement automatic aggressive recovery that hides failures.
Diagnostics and user-visible recovery actions are preferable in 0.0.

# 17. Security Requirements

Treat all remote web content as untrusted.

> Remote GitHub content\
> X\
> X Node.js\
> X filesystem\
> X shell\
> X FUSE configuration\
> X arbitrary commands\
> X Electron privileged APIs

## v0.0 checklist

-   nodeIntegration disabled for remote content.

-   contextIsolation enabled.

-   sandbox enabled where compatible and verified.

-   webSecurity remains enabled.

-   Do not allow insecure mixed content.

-   Do not expose Node.js globals to remote content.

-   Use application-specific persistent session partition.

-   Control will-navigate behavior.

-   Control new-window/window-open behavior.

-   Control permission requests.

-   Validate IPC senders for privileged IPC.

-   Expose only a narrow typed preload API.

-   Do not create generic remote execute-command functionality.

-   Do not store credentials in local configuration.

-   Keep Electron and dependencies updated.

These are engineering requirements to verify against the selected
Electron version, not values to blindly copy without testing.

# 18. Navigation and New-Window Policy

All navigation should pass through an explicit policy layer.

> Navigation Request\
> ↓\
> SecurityPolicy\
> ↓\
> Is destination allowed?\
> ├── YES → allow\
> └── NO → block / external browser according to policy

Similarly, new-window requests must be intercepted. The default should
not be "let Electron create arbitrary windows."

# 19. Permissions

Permission handling must be explicit. The initial policy should be
conservative.

Possible permissions include:

-   clipboard

-   notifications

-   camera

-   microphone

-   geolocation

-   media

-   filesystem/file chooser

Do not grant permissions merely because a website requests them.
Document the requirement and implement only what is needed.

# 20. Diagnostics and Observability

## Required v0.0 metrics

-   FUSE shell idle CPU.

-   FUSE shell idle memory.

-   GitHub CPU.

-   GitHub memory.

-   Application switch latency.

-   Command palette open latency.

-   IPC allowed count.

-   IPC blocked count.

-   Navigation allowed count.

-   Navigation blocked count.

-   Shortcut registration status.

-   Renderer crash count.

-   Reload count.

-   Application state transitions.

## Developer diagnostics

> FUSE Diagnostics\
> ────────────────────────\
> Shell CPU: \...\
> Shell Memory: \...\
> GitHub CPU: \...\
> GitHub Memory: \...\
> GitHub State: ACTIVE\
> Session Partition: persist:fuse-github\
> IPC Allowed: \...\
> IPC Blocked: \...\
> Navigation Allowed: \...\
> Navigation Blocked: \...\
> Shortcut: REGISTERED\
> Renderer: HEALTHY

Diagnostics can initially be a dev-only overlay. Production logging must
avoid collecting sensitive content.

# 21. Performance Strategy

FUSE is explicitly intended to be performance-friendly, including on
low-end laptops.

## Core rule

Measure FUSE overhead separately from website overhead.

## Rules

-   Prefer event-driven state updates over continuous polling.

-   Avoid unnecessary renderer re-renders.

-   Avoid JavaScript per-frame loops for decorative effects.

-   Prefer compositor-friendly animation when animation is introduced.

-   Keep the shell responsive while remote content is loading.

-   Do not keep unused views actively doing expensive work without
    evidence that it is necessary.

-   Do not implement true suspension in 0.0.

-   Do not add expensive blur, particles, shaders, or animated
    backgrounds to the technical prototype.

-   Record a baseline before optimizing.

# 22. Visual Design for v0.0

The full FUSE visual language is larger than v0.0. The technical
prototype should establish the foundation without spending the project
on decorative effects.

## Influences

-   VS Code: compact, keyboard-first, developer-oriented information
    density.

-   macOS: traffic-light window controls, polished window chrome,
    typography/spacing inspiration.

-   Hyprland/Caelestia: lightweight desktop atmosphere and dynamic
    visual surfaces.

## FUSE must remain its own design

Do not clone VS Code or macOS. Use them as references and develop a
coherent FUSE design language.

## v0.0 visual requirements

-   Custom title bar.

-   Traffic-light-inspired controls.

-   Clean typography.

-   Dark theme foundation.

-   Consistent spacing.

-   Sidebar.

-   Basic tab styling.

-   Clear hover/focus/active states.

## Deferred

-   Animated sidebar

-   Ambient Grid

-   Advanced motion system

-   Rich media controller

-   Complex blur/transparency

# 23. Long-Term Visual System

The visual system will eventually include a restrained animated grid.

> Large grid\
> ┌───┬───┬───┬───┬───┐\
> │ │ → │ │ │ │\
> ├───┼───┼───┼───┼───┤\
> │ │ │ │ ↓ │ │\
> ├───┼───┼───┼───┼───┤\
> │ │ ← │ │ │ │\
> └───┴───┴───┴───┴───┘

Movement should be grid-wise rather than random particle movement. A
small rectangular active region can move through the larger grid. The
effect should be noticeable but not distracting.

Design principle: "Really damn good if restrained."

This is not part of the v0.0 implementation.

# 24. Long-Term Global Media System

The media system is postponed until YouTube Music is introduced.

> YouTube Music\
> ↓\
> Media Adapter\
> ↓\
> FUSE Media Service\
> ↓\
> Media State\
> ↓\
> Global Media Controller

The future controller should have compact, normal, and expanded modes,
with artwork, track, artist, progress, play/pause, previous/next, and
source information.

Do not scrape or depend on fragile page internals unless there is no
better supported mechanism and the behavior is acceptable for the
project.

# 25. Long-Term Notification System

Notifications are postponed. When introduced, FUSE should define a
normalized notification model and avoid assuming every website exposes
identical notification capabilities.

# 26. Why We Are Not Implementing True Suspension Yet

-   A hidden website may still need WebSockets.

-   Service workers may be important.

-   Authentication refresh can be time-sensitive.

-   Uploads/downloads can be active.

-   Media can be playing.

-   Notifications may depend on background behavior.

-   Real-time dashboards may become stale.

Initial states are active/background. Suspension is a future
optimization based on measurement and application capability.

# 27. Development Workflow for the Coding Agent

## Before changing code

1.  Inspect the repository.

2.  Identify the current Electron version.

3.  Read existing package scripts.

4.  Read existing architecture before creating new files.

5.  Check whether a requested feature already exists.

6.  Do not duplicate systems.

## When implementing a feature

7.  Define the smallest responsibility.

8.  Implement typed interfaces.

9.  Keep remote content isolated.

10. Add diagnostics for important state transitions.

11. Add or update tests.

12. Run type checking.

13. Run linting if configured.

14. Build/package the application.

15. Manually verify the feature.

## When encountering ambiguity

Do not invent a large architecture. State the ambiguity, inspect current
constraints, and choose the smallest reversible implementation
consistent with this document.

# 28. GitHub Integration Sequence

16. Create the GitHub AppDefinition.

17. Create an application-specific persistent session partition.

18. Create the WebContentsView.

19. Attach the view to the BrowserWindow layout.

20. Load the GitHub primary URL.

21. Implement controlled navigation.

22. Implement controlled new-window behavior.

23. Implement external-link behavior.

24. Implement basic download handling.

25. Verify authentication persistence.

26. Implement application state tracking.

27. Implement renderer crash detection.

28. Implement reload/recovery action.

29. Add diagnostics.

30. Run security checklist.

31. Run performance baseline.

32. Run acceptance tests.

# 29. Acceptance Test Matrix

## Window

-   Close works.

-   Minimize works.

-   Maximize works.

-   Restore works.

-   Hover states work.

-   Window remains responsive.

## GitHub

-   GitHub loads.

-   Navigation works.

-   Authentication works normally.

-   Session persists after restart.

-   External links follow policy.

-   Popups follow policy.

-   Downloads follow policy.

## Security

-   Remote page has no Node integration.

-   Remote page cannot access FUSE APIs.

-   Unauthorized navigation is blocked.

-   Unexpected new windows are controlled.

-   IPC sender validation works.

-   Configuration contains no session/credential data.

## Command palette

-   Win + Alt + Space opens palette when shortcut is available.

-   GitHub can be opened.

-   Reload can be invoked.

-   Settings can be opened.

-   Shortcut registration failure is visible.

## Performance

-   Baseline CPU is recorded.

-   Baseline memory is recorded.

-   GitHub CPU/memory is recorded.

-   Application switching latency is recorded.

-   No obvious runaway polling loop exists.

# 30. Definition of Done --- FUSE 0.0

FUSE 0.0 is complete only when all of the following are true:

-   The project builds successfully.

-   The application launches successfully on Windows.

-   The custom title bar works.

-   The sidebar works.

-   GitHub opens in a WebContentsView.

-   GitHub uses an isolated persistent session.

-   GitHub login persists after restarting FUSE.

-   Navigation is controlled.

-   New-window behavior is controlled.

-   External links follow the documented policy.

-   Remote content has no general FUSE privileges.

-   The command palette works.

-   Win + Alt + Space registration succeeds or a clear conflict is
    reported.

-   Developer diagnostics are available.

-   Application failure states are visible and recoverable where
    appropriate.

-   A performance baseline exists.

-   Security checklist passes.

-   Acceptance test matrix passes.

-   No future feature has been unnecessarily implemented just because it
    appears in the long-term vision.

# 31. What Comes Immediately After v0.0

Do not automatically start implementing every feature from the long-term
roadmap.

First review what v0.0 taught us.

## Questions after v0.0

-   Was WebContentsView the correct embedding approach for our use case?

-   How much memory does FUSE itself consume?

-   How much memory does GitHub add?

-   Did the session model behave correctly?

-   Which navigation cases were difficult?

-   Which popup cases were difficult?

-   Which permissions were actually requested?

-   Did the custom title bar behave correctly at different DPI scales?

-   Did the global shortcut work reliably?

-   Which abstractions were genuinely useful?

-   Which abstractions should be removed?

The answers determine FUSE 0.1.

# 32. FUSE 0.1 Direction

Assuming v0.0 succeeds, the next stage is a stronger shell and
application engine.

> FUSE 0.1\
> ├── AppRegistry\
> ├── SessionManager\
> ├── ViewManager\
> ├── CommandRegistry\
> ├── Application State Machine\
> ├── Crash / Error Recovery\
> ├── Better Tabs\
> ├── Better Configuration\
> ├── More robust compatibility handling\
> └── GitHub polish

# 33. FUSE 0.2 Direction

> FUSE 0.2\
> ├── YouTube Music\
> ├── Second real application\
> ├── Capability model based on actual requirements\
> ├── More robust external links\
> ├── Downloads / permissions improvements\
> └── Performance refinement

# 34. FUSE 0.3+ Direction

> FUSE 0.3+\
> ├── .fuse import/export\
> ├── Theme system\
> ├── Custom title-bar buttons\
> ├── Shortcut customization\
> ├── Animated sidebar\
> ├── Ambient Grid\
> ├── Media Service\
> ├── Global Media Controller\
> ├── Notification experiments\
> └── Linux/macOS support

# 35. Long-Term Applications

> Future .unified applications\
> \
> Development\
> ├── GitHub\
> └── other developer services\
> \
> Entertainment\
> ├── YouTube\
> ├── YouTube Music\
> └── Discord\
> \
> University\
> ├── RKU LMS\
> ├── Gmail / university mail\
> ├── Cisco Academy\
> └── Oracle Academy

These are examples of the intended ecosystem, not commitments for v0.0.

# 36. Long-Term Configuration Vision

> .fuse\
> ├── appearance\
> ├── theme\
> ├── titlebar\
> ├── sidebar\
> ├── tabs\
> ├── applications\
> ├── commands\
> ├── shortcuts\
> ├── media appearance\
> ├── notification preferences\
> ├── ambient effects\
> └── performance profile\
> \
> NO:\
> ├── passwords\
> ├── cookies\
> ├── session tokens\
> ├── OAuth credentials\
> └── private secrets

# 37. Long-Term Business Direction

Monetization is deliberately not part of the technical MVP.

Potential future models include:

-   Free core + optional Pro features.

-   Premium themes/visual packs.

-   Optional cloud synchronization.

-   Application/extension/theme marketplace.

-   Developer ecosystem.

-   Enterprise deployment/management.

-   Support or sponsorship.

FUSE must never depend on selling user data, advertising inside the
shell as its primary model, or selling authentication/session data.

# 38. Critical Things the Coding Agent Must Not Do

-   Do not add arbitrary JavaScript execution to .unified.

-   Do not expose Node.js APIs to GitHub.

-   Do not create a generic remote execute-command bridge.

-   Do not put cookies or sessions in configuration.

-   Do not build media integration in v0.0.

-   Do not build notifications in v0.0.

-   Do not build the marketplace.

-   Do not add cloud synchronization.

-   Do not add Linux-specific architecture before the Windows slice
    works.

-   Do not create packages solely for architectural appearance.

-   Do not add dependencies without a clear reason.

-   Do not silently broaden navigation allowlists.

-   Do not hide security failures.

-   Do not hide performance regressions.

# 39. Agent Communication Expectations

When a task is completed, report:

> 1\. What changed.\
> 2. Which files changed.\
> 3. Why the architecture is appropriate.\
> 4. Security implications.\
> 5. Performance implications.\
> 6. Tests executed.\
> 7. Build/typecheck/lint results.\
> 8. Manual verification performed.\
> 9. Known limitations.\
> 10. Recommended next step.

Do not claim a feature is complete if it has only been coded but not
tested.

# 40. Final Project Statement for the Coding Agent

FUSE is a long-term cross-platform application shell project. The first
objective is not to build the entire product. The first objective is to
prove the foundation.

Build a small, secure, measurable Electron shell that can host GitHub
inside a WebContentsView, preserve its session independently, enforce a
compatibility/security contract, expose a minimal keyboard-first command
palette, and provide enough diagnostics to measure its behavior.

The architecture must remain capable of growing into the larger FUSE
vision, but the implementation must remain intentionally small.

The long-term experience will eventually include a highly customizable
macOS-inspired title bar, animated sidebar, Master Search, portable
.fuse configuration, declarative .unified applications, global media
control, notifications, restrained animated grid effects, and
Windows/Linux/macOS support.

Those features are the destination. FUSE 0.0 is the first proof that the
road works.

**FUSE**

*Your applications. One place. Your way.*

**Really damn good if restrained.**

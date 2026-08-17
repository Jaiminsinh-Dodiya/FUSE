# FUSE

*Your applications. One place. Your way.*

FUSE is a customizable, keyboard-first desktop shell for organizing persistent
web applications in one unified environment. It runs above your existing
operating system — it is not an OS, browser replacement, or media center.

## Status

**FUSE 0.0** — pre-implementation technical vertical slice.

The current objective is not the full FUSE vision. It is a small, secure,
measurable Electron shell that can host GitHub inside an isolated
`WebContentsView`, preserve its session independently, enforce a
compatibility/security contract, expose a minimal command palette, and
provide enough diagnostics to measure its own behavior.

See `docs/architecture/` for the full project brief and implementation plan.

## Stack

- Electron
- TypeScript
- React
- Vite

## Development

Work happens on the `dev` branch. `main` is kept stable/release-only during
0.0 development.

```bash
npm install
npm run dev
```

(Exact scripts land as the tooling is scaffolded — see commit history.)

## Principle

**Really damn good if restrained.**

# Refactor Plan — migrate Colorfield front-end to SvelteKit

This document summarizes the migration plan and notes for the SvelteKit scaffold present in this repo.

Goals
- Move canvas + UI into SvelteKit routes (`/display`, `/mobile`).
- Keep particle engine as pure JS in `src/lib/particles`.
- Encapsulate MediaPipe init in `src/lib/mediapipe` (dynamic import in onMount).
- Use Svelte stores for global low-frequency state (counts, session, faces summary).
- Keep socket event names and server `server.js` unchanged.

Quick start (dev)
- npm install
- npm run dev

Notes & Next steps
Port the full particle engine from `public/display.html` into `src/lib/particles/core.js` (currently a minimal scaffold present).
- Implement `src/lib/socket.js` to initialize `socket.io-client` and expose event bindings.
 - Implement `src/lib/socket.js` to initialize `socket.io-client` and expose event bindings. The scaffold includes `socket-impl.js` which falls back to a local emitter and exposes `simulateSpawn(data)` for development testing.
- Implement real MediaPipe integration in `src/lib/mediapipe/index.js` (dynamic import inside onMount).
- Replace placeholder UI components with full implementations ported from `display.html` and `mobile.html`.
- Consider moving heavy rendering to a Worker / OffscreenCanvas when performance testing.

Rollback
- Original `public/display.html` and `public/mobile.html` remain in repo; use them as reference or rollback if needed.

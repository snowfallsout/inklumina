# Colorfield — SvelteKit app

This repository is a SvelteKit migration of the Colorfield front-end.

Development:

1. `npm install`
2. `npm run dev`

Production:

1. `npm run build`
2. `npm start`

Runtime notes:
- SvelteKit is configured with `@sveltejs/adapter-node` and listens on `0.0.0.0:3000` when started with `npm start`.
- The main display UI is at `/display`.
- The mobile join UI is at `/mobile`.
- Session and MBTI submission APIs live under `/api/*`.
- Real-time updates are handled by SvelteKit routes and server-sent events, not by a standalone `server.js` process.
- Shared client code lives under `src/lib`.
- Static assets remain in `public/`.

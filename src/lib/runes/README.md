# runes (src/lib/runes)

This directory exposes small, focused Svelte runes used across the app.

Overview:

- `mbti.ts` — MBTI counts and `spawn` helper (enqueue visual spawn events).
- `media.ts` — camera / crowd / interaction normalized runes and helpers.
- `particles.ts` — spawn queue (FIFO) and helpers for the display layer.
- `session.ts` — lightweight session name + history and placeholder helpers.
- `ui.ts` — small UI runes (`toast`, `handBadgeText`, `waitingVisible`).

Usage notes for agents and humans:

- Each file contains a structured TSDoc header describing exports and example usage.
- Coordinate conventions: media runes use normalized coords in `[0,1]` with `y` top→bottom.
- Spawn flow: call `pushSpawn` (or `spawn` wrapper in `mbti.ts`) to enqueue events; the display
  canvas consumes via `popSpawn`.
- Keep network/API logic out of these runes; prefer `services/` or route handlers for network calls.

Example (enqueue a spawn):

```ts
import { spawn } from '$lib/runes/mbti';
spawn('ENFP', '#0f0', 'visitor', { ENFP: 1 }, 1);
```

If you want, I can also add automated extraction scripts to build a concise JSON manifest
of these module headers for downstream tooling (agents/docs).

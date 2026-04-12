# Extract Plan — display.bundle.js → src/lib

Goal: provide non-destructive, importable modules so the Svelte front-end can reuse the original logic without modifying files in `public/`.

Files added:
- `src/lib/particles/core.js` — `Particle`, `particles`, `spawn`, `seedAmbient`, `hexToRgba`.
- `src/lib/particles/loop.js` — `startLoop(canvas)` / `stopLoop()` and resize handling (uses `particles`).
- `src/lib/socket/client.js` — `initSocket(onSpawn)` wrapper for `io()` and `emitLocalSpawn()` helper.

Integration notes:
- In a Svelte `Canvas` component: import `startLoop` and call `startLoop(canvasElement)` inside `onMount`.
- Call `seedAmbient(n, W, H)` after canvas sizing (use `getCanvasSize()` from loop if needed).
- Initialize socket with `initSocket(data => { data.particles.forEach(p => spawn(p.x * W, p.y * H, p.color, p.count)) })`.

Preservation:
- No `public/` files were modified. The original pages remain the canonical runtime references.

# Runes runes — consolidated summary

This document consolidates the current `src/lib/runes/*.ts` store modules, describes their exports and runtime behavior, lists MCP findings, and gives a step-by-step plan to migrate each module to Svelte 5 runes (`.svelte.ts`).

## Summary of modules

- `mbti.ts`
  - Exports: `mbtiCounts` (writable Record<string,number>), `total` (derived), `updateCounts(counts)`, `spawn(mbti, color?, nickname?, counts?, totalNum?)`
  - Purpose: track MBTI counts and enqueue spawn events for display.
  - Depends on: `pushSpawn` from `particles`.
  - MCP notes: `tag_invalid_name` reported by svelte-autofixer for this file (requires investigation when converting to .svelte.ts).

- `media.ts`
  - Exports: `videoEl`, `camOn`, `CROWD_CAP`, `crowd`, `ACTIVE_CAP`, `activeInteractions`, `emotion`, `initCamera()`, `stopCamera()`, helpers `setCrowd`, `pushCrowdMember`, `setActiveInteractions`, `clearAllSensors`.
  - Purpose: normalize camera / mediapipe outputs and provide lifecycle helpers.
  - Side-effects: DOM access (create video element), uses `browser` guard and `document`.
  - MCP notes: `expected token }` reported by svelte-autofixer (likely due to parser expecting .svelte.ts shape).

- `particles.ts`
  - Exports: `spawnQueue` (writable SpawnEvent[]), `pushSpawn(e)`, `popSpawn()`, `seedAmbient(n)`
  - Purpose: FIFO queue consumed by display canvas.
  - MCP notes: `tag_invalid_name` reported.

- `session.ts`
  - Exports: `sessionName`, `history`, `panelOpen`, functions `loadHistory()`, `createSession()`, `getJoinUrl()`, `deleteSession()`, `viewSession()`, `clearHistory()`
  - Purpose: lightweight session tracking persisted to localStorage.
  - MCP notes: `tag_invalid_name` reported.

- `smile.ts`
  - Exports: store default export `smile` (writable { visible, emoji, x, y }), `start()`, `stop()`, `registerElement()`, `unregisterElement()`
  - Purpose: render persistent emoji on smiling faces using `crowd` subscription and RAF.
  - Side-effects: DOM creation and RAF; must be browser-guarded.
  - MCP notes: `expected token }` reported.

- `ui.ts`
  - Exports: `toast`, `handBadgeText`, `waitingVisible`, `showToast(msg, color?)`
  - Purpose: small UI helper runes.


## Migration notes (Svelte 5 runes)

- Goal: convert each `*.ts` store module into a `.svelte.ts` module that uses Svelte 5 runes API so components can import reactive values directly.
- Mapping guidance:
  - `writable<T>(initial)` -> use `let x = $state(initial)` for stateful values used directly; for collections that need manual update functions, export the state and helper functions.
  - `derived(store, fn)` -> use `$derived(...)` to compute derived values.
  - Derived runes that depend on multiple values should be converted to `$derived(...)` and exported by name.
  - Functions that access DOM or `document` must remain guarded with `if (typeof window !== 'undefined')` or `import { browser } from '$app/environment'`.
  - Keep imperative helpers (e.g., `initCamera`, `stopCamera`) as exported functions; they can read/write runes state.
  - For modules that currently `export const foo = writable(...)`, convert to `export let foo = $state(...)` in the `.svelte.ts` file.

## Per-file migration checklist

- `mbti.ts` -> `mbti.svelte.ts`
  - Replace `writable` + `derived` with `$state` and `$derived`.
  - Ensure `pushSpawn` import path updated if moved.
  - Verify names exported remain identical.
  - Resolve the MCP `tag_invalid_name` result by ensuring generated `.svelte.ts` contains only valid top-level JS and no stray template markup.

- `media.ts` -> `media.svelte.ts`
  - Convert DOM-ref `videoEl` to `let videoEl = $state<HTMLVideoElement | null>(null)`.
  - Keep `initCamera` and `stopCamera` functions; ensure `browser` checks remain.
  - Replace `get()` usage by reading rune values directly inside functions.
  - Ensure any `document.createElement` calls run only on client.

- `particles.ts` -> `particles.svelte.ts`
  - Convert `spawnQueue` to `$state<SpawnEvent[]>([])`, and adapt `pushSpawn` / `popSpawn` to mutate the state variable.

- `session.ts` -> `session.svelte.ts`
  - Use `$state` for `sessionName`, `history`, `panelOpen`.
  - Keep localStorage usage guarded for server-side rendering.

- `smile.ts` -> `smile.svelte.ts`
  - Convert internal `store` to `$state` object or named `$state` values; continue to export helper functions (`start`, `stop`, `registerElement`).
  - Keep RAF and crowd subscription logic; when converting, subscribe to runes values via normal reads instead of `store.subscribe`.

- `ui.ts` -> `ui.svelte.ts`
  - Convert `toast`, `handBadgeText`, `waitingVisible` to `$state` exports and keep `showToast` function.


## MCP autofixer findings (summary)

- Running `svelte-mcp svelte-autofixer` against the current `lib/runes` files gave parser-style issues for several files:
  - `mbti.ts`: reported `tag_invalid_name` (likely due to passing plain TS file to a fixer expecting component shape)
  - `media.ts`: reported `expected token }` (parser mismatch)
  - `particles.ts`: `tag_invalid_name`
  - `session.ts`: `tag_invalid_name`
  - `smile.ts`: `expected token }`

These are expected because the autofixer targets `.svelte` / `.svelte.js` / `.svelte.ts` shaped files; our plain `.ts` store modules should be converted into `.svelte.ts` form before automated fixes will be fully applicable.


## Next actions (per your requested workflow)

1. I ran the MCP autofixer checks (per-file) and recorded the issues above.
2. I consolidated all store exports and behavior into this `store.md` (this file).
3. If you confirm, I'll convert the modules one-by-one into `.svelte.ts` using the mapping above. After conversion for all modules and verifying no runtime/build errors, I'll delete the original `.ts` files only when you explicitly approve that final step.

Please confirm you want me to start converting `mbti.ts`, `media.ts`, `particles.ts`, `session.ts`, `smile.ts`, and `ui.ts` into `.svelte.ts` now (I will create each `.svelte.ts`, run the autofixer and a quick type/syntax check, then present the diffs).  

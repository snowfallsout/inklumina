# MAP_TREE_DEV_NOTES

Status: draft from approved handoff plan on 2026-04-14.

## Mission and SvelteKit Constraints

This document defines the migration map for Colorfield. The target state is:
- `src/routes` becomes thin route shells only.
- Reusable UI moves to `src/lib/components/*`.
- Non-visual logic moves to `src/lib/features/*`.
- Cross-surface contracts stay in `src/lib/shared/*`.

Verified SvelteKit constraints:
- `$lib` is the built-in alias for `src/lib`.
- The existing `(app)` route group is the correct layout-group boundary for this app.
- No hooks file is required for this migration unless a future task explicitly needs app-wide behavior.

Migration rule:
- Prefer additive migration first: create new targets, add shims if needed, then remove old implementations only after verification.

## Forbidden Files and Change Boundaries

Do not modify these files in this migration unless a separate task explicitly authorizes it:
- `server/app.js`
- `server/index.js`
- `server/socket.js`
- `server/sessions.js`
- `sessions.json`
- `README.md`
- `src/routes/+layout.svelte`
- `src/routes/(app)/+layout.svelte`

Route files may only be reduced to thin shells:
- `+page.svelte` may compose UI and hydrate data.
- `+page.ts` may provide page data only.
- Route-local logic must not be reintroduced once moved out.

## Target Tree

Target structure:
- `src/lib/components/display/`
- `src/lib/components/mobile/`
- `src/lib/features/display/`
- `src/lib/features/display/runtime/`
- `src/lib/features/display/session/`
- `src/lib/features/mobile/`
- `src/lib/shared/`

Naming rules:
- Directory meaning outranks filename meaning.
- After moving into `features/display`, remove `display.` prefixes from filenames.
- If an old path must remain temporarily, it may only be a re-export shim.

## Display File Migration Map

UI components:
- `src/routes/(app)/display/components/DisplayFooter.svelte` -> `src/lib/components/display/Footer.svelte`
- `src/routes/(app)/display/components/DisplayHeader.svelte` -> `src/lib/components/display/Header.svelte`
- `src/routes/(app)/display/components/DisplayHud.svelte` -> `src/lib/components/display/Hud.svelte`
- `src/routes/(app)/display/components/DisplayLegend.svelte` -> `src/lib/components/display/Legend.svelte`
- `src/routes/(app)/display/components/DisplaySessionManager.svelte` -> `src/lib/components/display/SessionManager.svelte`
- `src/routes/(app)/display/components/DisplayFrame.svelte` -> `src/lib/components/display/Frame.svelte`

Feature logic:
# Status: shims under `src/lib/display/*` have been removed — imports now point to `src/lib/features/display/*` and the canonical implementations live under `src/lib/features/display/`.
- `src/lib/display/state.ts` -> `src/lib/features/display/state.ts`
- `src/lib/display/types.ts` -> `src/lib/features/display/types.ts`
- `src/lib/display/constants.ts` -> `src/lib/features/display/constants.ts`
- `src/lib/display/session.ts` -> `src/lib/features/display/session/index.ts`
- `src/lib/display/session/client.ts` -> `src/lib/features/display/session/client.ts`
- `src/lib/display/session/panel.ts` -> `src/lib/features/display/session/panel.ts`
- `src/lib/display/session/qr.ts` -> `src/lib/features/display/session/qr.ts`
- `src/lib/display/runtime/index.ts` -> `src/lib/features/display/runtime/index.ts`
- `src/lib/display/runtime/dom.ts` -> `src/lib/features/display/runtime/dom.ts`
 - `src/lib/display/runtime/socket.ts` -> `src/lib/features/display/runtime/realtime.ts` (merged — `socket.ts` removed)
- `src/lib/display/runtime/camera.ts` -> `src/lib/features/display/runtime/camera.ts`
- `src/lib/display/runtime/particle.ts` -> `src/lib/features/display/runtime/particle.ts`
- other runtime modules follow the same mapping

Display route end state:
- `src/routes/(app)/display/+page.svelte`
- `src/routes/(app)/display/+page.ts`
- `src/routes/(app)/display/+error.svelte`
- `src/routes/(app)/display/display.css`

## Mobile File Migration Map

UI components:
- `src/routes/(app)/mobile/components/MobileJoinExperience.svelte` -> `src/lib/components/mobile/JoinExperience.svelte`
- `src/routes/(app)/mobile/components/MobileMbtiCard.svelte` -> `src/lib/components/mobile/MbtiCard.svelte`
- `src/routes/(app)/mobile/components/MobileMbtiScreen.svelte` -> `src/lib/components/mobile/MbtiScreen.svelte`
- `src/routes/(app)/mobile/components/MobileResultScreen.svelte` -> `src/lib/components/mobile/ResultScreen.svelte`
- `src/routes/(app)/mobile/components/MobileWelcomeScreen.svelte` -> `src/lib/components/mobile/WelcomeScreen.svelte`

Feature logic:
- `src/routes/(app)/mobile/mobile.store.ts` -> `src/lib/features/mobile/state.ts`
- `src/routes/(app)/mobile/mobile.realtime.ts` -> `src/lib/features/mobile/realtime.ts`
- `src/routes/(app)/mobile/mobile-card.ts` -> `src/lib/features/mobile/card.ts`
- `src/routes/(app)/mobile/mobile.constants.ts` -> `src/lib/features/mobile/constants.ts`
- `src/routes/(app)/mobile/mobile.utils.ts` -> `src/lib/features/mobile/utils.ts`
- `src/routes/(app)/mobile/mobile.types.ts` -> `src/lib/features/mobile/types.ts`

Type policy:
- `MbtiCode` must come from `src/lib/shared/contracts.ts`.
- `LuckyColorPayload` must come from `src/lib/shared/contracts.ts`.
- Mobile-specific view models may stay in `src/lib/features/mobile/types.ts`.

## Agent Rules: Shim, Cutover, and Commit Scope

Rules:
- Only one type of change per batch.
- File relocation and import rewiring belong to one batch.
- DOM/store refactors belong to a different batch.
- Do not combine migration with behavior rewrites in the same PR.
- Old paths may exist only as shims or wrappers.
- Never keep two complete implementations for the same feature.
- Route shells are for composition only.
- Hooks are not part of this migration unless explicitly required later.
- Advanced routing changes are not part of this migration.
- README and backend changes are out of scope.

## Display Execution Plan

1. Create or preserve the target `src/lib/components/display/*` and `src/lib/features/display/*` tree.
2. Move display UI first.
3. Move display feature logic next.
4. Keep `src/routes/(app)/display/+page.svelte` thin: import and compose only.
5. Keep `src/routes/(app)/display/+page.ts` as the page-data provider.
6. Use compatibility shims only if an import graph would otherwise break.
7. Only after file moves are stable, refactor DOM access into component props, events, or `bind:this`.

High-risk display modules:
- `src/lib/display/runtime/dom.ts`
- `src/lib/display/runtime/legacy.ts`
- `src/lib/display/session/panel.ts`
- `src/lib/display/session/qr.ts`

## Mobile Execution Plan

1. Create or preserve the target `src/lib/components/mobile/*` and `src/lib/features/mobile/*` tree.
2. Move mobile UI components first.
3. Move state and realtime logic next.
4. Keep `src/routes/(app)/mobile/+page.svelte` thin: pass payload only.
5. Resolve type duplication by importing shared contracts instead of redefining them.
6. After the first migration pass, optionally refine the mobile state and component split.

## Error, Debug, and Test Runbook

If imports break:
- Check whether a shim or re-export is missing.
- Check whether the route shell still imports a route-local file.

If the UI goes blank:
- Check whether route files still contain business logic.
- Check whether the target component tree has the right props.

If realtime breaks:
- Check `src/lib/shared/socket-client.ts`.
- Check mobile and display socket binding paths.

If session UI breaks:
- Check the client, panel, and QR modules.
- Check whether DOM access moved too early in the migration.

Validation commands:
- `npm run check`
- `npm run smoke`
- `npm run build`

## Verification Checklist

Display:
- initial load
- session list
- create session
- QR generation
- camera toggle
- socket update

Mobile:
- welcome -> mbti -> submit -> result
- socket connect and disconnect
- fallback submission path
- result card generation

## Cleanup Gates

Only remove shims or old files when all of these are true:
- all imports point to the new tree
- there is no duplicate implementation
- `npm run check` passes
- `npm run smoke` passes when realtime is involved
- `npm run build` passes for larger cutovers
- manual display and mobile flows both pass

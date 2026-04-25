<!--
Main DEVNOTES
Policy: For every large or repo-wide change, create a dated snapshot file
under `devnotes/DEVNOTES_{timestamp}.md` and reference it here.
-->

# DEVNOTES — Current

Last snapshot: [DEVNOTES_2026-04-24T120000Z.md](DEVNOTES_2026-04-24T120000Z.md)

Policy (short):

- Before performing large updates (typecheck across repo, remove legacy files, change shared components), create a snapshot file named `DEVNOTES_{ISO_TIMESTAMP}.md` in this folder.
- Add a one-paragraph summary to the snapshot describing the state and the intention of the upcoming changes.
- Update this `DEVNOTES.md` to link the snapshot and list a short action item.
- "Large" updates include: running `npm run check` and fixing many files, removing legacy files, or changing public/shared components/routes.

Snapshot created to preserve current state before proceeding with repo-wide changes.

---

Recent activity (delta):

- 2026-04-24: Created snapshot DEVNOTES_2026-04-24T120000Z.md capturing function-area migration progress and outstanding work.

Next planned actions:

- Finish `coordinator` socket parity and wire missing handlers.
- Run `npm run check` and triage errors outside `src/lib/function`.
- Run `npm run dev` to smoke-test runtime behavior.

---


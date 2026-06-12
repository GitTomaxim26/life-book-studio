# Life Book Studio — Starter

The production **shell**, not the product. Renders the three-panel studio against
a mock book so you have a live surface to build into. Source of truth for state +
schema lives in `lib/types.ts`.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

Push to GitHub, import the repo in Vercel, and every branch gets a preview URL.

## What's in here

```
app/
  layout.tsx        Fonts (Fraunces/Spectral/Inter) + globals
  page.tsx          Renders <Shell> with the mock book
  globals.css       Design tokens (night/paper) + the velvet/linen Cover, ported verbatim
components/
  Shell.tsx         Three-panel layout; holds theme + active section
  Sidebar.tsx       Literary TOC from OUTLINE; the two-stage gate is already enforced
  Cover.tsx         The Full Life Book cover (velvet in Night, linen in Paper)
  Editor.tsx        TipTap editor (the production editor — not the prototype's contenteditable)
  IdentityPage.tsx  The first vertical slice: render + edit
  MusePanel.tsx     Right panel placeholder + theme toggle
lib/
  types.ts          STATE = SCHEMA. Build the DB from these types.
  structure.ts      Fixed IA: parts + the 16 future areas + Muse-mode map
  mock.ts           One in-memory Book; swap for a Supabase fetch in step 9
```

## The gate is already real

`lib/types.ts` exports `threadsWoven`, `newIdentityWritten`, `futureUnlocked`.
The sidebar uses them, so with the mock book (empty Threads) you'll see New
Identity locked and the 16 rooms hidden — exactly the thesis. Weave Threads →
New Identity unlocks. Write New Identity → the future opens.

## Build order (matches the plan)

1–7. ✅ here: tokens/theme, three-panel shell, sidebar from structure, Cover.
8. ✅ here: Identity page with TipTap.
9. **Supabase**: replace `mock.ts` with a fetch; persist `onChange` (debounced) in `IdentityPage`. Tables mirror `lib/types.ts`.
10. **AI proxy**: add `app/api/muse/route.ts` (streaming). Map section → mode via `museModeFor`. Keys server-side in env. Then wire `MusePanel` and the Cover ✦ buttons.

## Notes

- shadcn/ui: add it for dialogs/popovers/menus only. Keep the tokens in `globals.css`; don't run a theme that overwrites them.
- Don't port the prototype's tracked-changes diff. Add suggestions later as a ProseMirror plugin on TipTap.
- Keep `prototype/life-book-studio.html` (the single-file prototype) in the repo as the visual reference while porting.

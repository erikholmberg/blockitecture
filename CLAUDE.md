# Blockitecture: working agreement

Famous houses built brick by brick in the browser. A home page (`/`) lists them; each house is its own page
(today: the Stahl House at `/stahl-house/`). Vite multi-page + TypeScript + Three.js (procedural geometry);
pages and the viewer HUD are React + shadcn/ui + Tailwind v4 + Inter (spec 007). See README.md for features.

## Layout
- `index.html` + `src/home/` — home page; `src/houses/index.ts` — the house registry (cards).
- `src/engine/` — the house-agnostic viewer (spec 010a): `viewer.ts` (`startViewer(house)`), `house.ts` (`HouseDefinition`),
  voxel builder, brick rendering, sequencer, controls, sun, environment, neighborhood, city, `ui/Hud.tsx`.
  **Nothing in `src/engine` may import from `src/houses`** (tested).
- `src/houses/<slug>/` — one house: `model/` (its bricks), `phases.ts`, `definition.ts` (texts, site, views, lights, roof cut,
  lot, data path…), `main.ts` (page entry). Page HTML at `<slug>/index.html`, listed in `PAGES` (`vite.config.ts`).
- `public/<slug>/` — per-house static files (thumbnail, `neighborhood.bin`). `scripts/houses/<slug>.mjs` — its real-world data settings.
- `dev/` + `src/dev/` — dev-only pages (`/dev/shortlist/`, photos of candidate houses; `/dev/design/`, looks to compare before they go in a spec). Not in `PAGES`, so never built or deployed.
- `src/seo/` + `seo.plugin.ts` — link previews, readable HTML, sitemap.xml, robots.txt, llms.txt, all generated from the registry
  and each house's definition (spec 053). The home and credits pages are rendered to HTML at build time and hydrated, so they
  must render the same on the server as in the browser (no `window` during render). Edits to `src/seo/seo.ts` need a dev restart.
- `src/components/ui/` — shadcn components (ours to edit; add more with `npx shadcn@latest add <name>`).
- Don't use `backdrop-blur` on anything over the 3D canvas: it re-blurs the scene every frame (−22% fps, spec 007).
- House definitions can opt into `scenery` (sea, chaparral, flats, city band). Coastal terrain tiles can be corrupt:
  use `despike` / `seaFloorFt` in `scripts/houses/<slug>.mjs` (spec 010b) and check for spikes in a test.
- Real-world rotation is any angle: use `realToModelDir()` / `bearingToTheta()` from `src/engine/scene/sun.ts`.

## Build order for every house (spec 012, enforced by tests/buildOrder.test.ts)
- Phases declare a `role`. The order is site → foundation → floor → **structure** (frame and any upper floors/decks) →
  **interior** → **envelope** (walls, panels, glass, and anything mounted on them) → **roof** → landscape. You furnish inside the open
  frame, and the roof goes on last.
- Anything hanging from the roof (ceiling lights, pendants, cabinets) goes in with the roof via `b.hanging(P.ROOF, …)`.
- No interior piece may land in mid-air (it must touch something already built), and no piece of the house may be silently
  dropped by `add()` (`Builder.dropped`; only terrain and landscaping may skip taken space).
- Add every new house's definition to `DEFINITIONS` in `tests/buildOrder.test.ts`; the test fails for a live house that's missing.

## We use spec-driven development

Every change that alters behavior goes through a spec in `specs/`. The flow:

1. **Spec first.** Copy `specs/_template.md` to `specs/NNN-short-name.md` (next free number).
   Fill in Goal, Behavior, Acceptance criteria, Out of scope and Open questions.
   **Stop and ask Erik to review.** Don't write implementation code until the spec is
   `Approved` and has no open questions.
2. **Tests from criteria.** Each `[unit]` criterion gets a Vitest test in `tests/`, named
   by its ID (e.g. `it('A3: …')`), with a `// Spec: specs/NNN-….md` header in the file.
   Write them before the implementation and confirm they fail for the right reason.
3. **Implement** until `npm run check` passes. Walk through the `[manual]` criteria in `npm run dev`
   and report each one as passed or failed. Never claim one passed if you didn't check it.
4. **Close out.** Fill in Implementation notes, set Status to `Done`, add the commit hashes.
   Run `npm run usage -- --record` after committing and commit `usage/ledger.json` with the "Record commit" commit; for a house spec,
   put its `npm run usage` totals in Implementation notes (spec 018). Each spec names its house in a `House:` line, and a commit
   covers one house at most, so usage per house stays exact.
   If the change alters baseline behavior, update `specs/000-baseline.md` (or the relevant spec) as well.

Changing behavior that a spec covers means changing the spec first. If code and spec
disagree, raise it; don't silently pick one.

**Exempt** (no spec needed): typo fixes, refactors with no behavior change (tests must stay green),
dependency bumps, and docs. Say in the commit message which exemption applies.

## Commands
```sh
npm run dev          # http://localhost:5173 (?debug for the FPS overlay and window.__stahl; &dpr=1.75 pins resolution for perf A/B; &finish=satin shows a candidate finish, spec 066)
npm test             # Vitest, once
npm run test:watch
npm run check        # tsc (src + tests) + tests: must pass before every commit
node scripts/fetch-neighborhood.mjs <slug>   # regenerate public/<slug>/neighborhood.bin and the house's model/lotTerrain.ts (OSM + terrain; cached in scripts/.cache)
npm run build        # tsc + vite build → dist/
npm run usage        # Claude tokens per house from this machine's transcripts + usage/ledger.json (--by-spec, --record; spec 018)
npm run stats        # regenerate src/houses/stats.ts (each house's palette and figures) after any model change (spec 050)
npm run video        # render the 30 s LinkedIn video (scripts/video/) from the running dev server into video/ (needs ffmpeg)
npm run og-image     # remake public/og-image.jpg, the home page's link-preview image, from the running dev server (spec 053)
```

## Testability notes
- `src/houses/*/model/*`, `src/engine/sequencer.ts`, `src/engine/catalog.ts` and `src/engine/controls/collision.ts`
  are pure (no DOM, no Three.js) and can be tested directly in Node. Keep new logic in pure modules
  like these where possible, so criteria can be `[unit]` and not `[manual]`.
- Units: x/z in studs, y in plates (`PLATE = 0.4` world units). Generation is deterministic (seeded `rng`).
- 1 world unit ≈ 1 ft. The brick house is the real house **rotated 180°**: real north = model +z (spec 003).
- `src/` is browser-only TypeScript; `tests/` has its own tsconfig with Node types.

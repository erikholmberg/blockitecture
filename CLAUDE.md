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
- `src/components/ui/` — shadcn components (ours to edit; add more with `npx shadcn@latest add <name>`).
- Don't use `backdrop-blur` on anything over the 3D canvas: it re-blurs the scene every frame (−22% fps, spec 007).

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
   If the change alters baseline behavior, update `specs/000-baseline.md` (or the relevant spec) as well.

Changing behavior that a spec covers means changing the spec first. If code and spec
disagree, raise it; don't silently pick one.

**Exempt** (no spec needed): typo fixes, refactors with no behavior change (tests must stay green),
dependency bumps, and docs. Say in the commit message which exemption applies.

## Commands
```sh
npm run dev          # http://localhost:5173 (?debug for the FPS overlay and window.__stahl; &dpr=1.75 pins resolution for perf A/B)
npm test             # Vitest, once
npm run test:watch
npm run check        # tsc (src + tests) + tests: must pass before every commit
node scripts/fetch-neighborhood.mjs <slug>   # regenerate public/<slug>/neighborhood.bin and the house's model/lotTerrain.ts (OSM + terrain; cached in scripts/.cache)
npm run build        # tsc + vite build → dist/
```

## Testability notes
- `src/houses/*/model/*`, `src/engine/sequencer.ts`, `src/engine/catalog.ts` and `src/engine/controls/collision.ts`
  are pure (no DOM, no Three.js) and can be tested directly in Node. Keep new logic in pure modules
  like these where possible, so criteria can be `[unit]` and not `[manual]`.
- Units: x/z in studs, y in plates (`PLATE = 0.4` world units). Generation is deterministic (seeded `rng`).
- 1 world unit ≈ 1 ft. The brick house is the real house **rotated 180°**: real north = model +z (spec 003).
- `src/` is browser-only TypeScript; `tests/` has its own tsconfig with Node types.

# 047 — The loading brick keeps turning on an iPhone

- **Status:** In progress (approved by Erik 2026-11-10: "build it", the worker. Built and checked in Chrome; waiting on Erik's
  iPhone, A5. Not committed.)
- **Owner:** Erik
- **Created:** 2026-11-10
- **Commits:** <!-- filled in when Done -->

## Goal
Reported by Erik, 2026-11-10: on his iPhone the loading brick (spec 027) "just turns a bit and stops". It should turn the whole
time the house loads, on every device.

## Research (2026-11-10)
- **Why it stops (most likely; not checked on an iPhone, which can't be run here):** the viewer generates the whole model in one
  go on the page's main thread (`house.build()` and `sequence()` in `src/engine/viewer.ts`), a few seconds on a laptop and longer
  on a phone. Spec 027 relied on the browser running the brick's animation off the main thread, and checked that in Chrome only.
  iOS Safari evidently doesn't for this 3D animation (a `preserve-3d` box), so the brick stops when the main thread blocks and only
  moves again once the model is done.
- **What would work everywhere:** keep the main thread free while the model is generated, by doing that work in a background
  worker (a Web Worker). The model code is already pure (no DOM, no Three.js), which CLAUDE.md asks for, so it can run there
  unchanged.

## Behavior
- **While a house loads:** the brick turns smoothly the whole time, on iPhone as on desktop, until the intro card shows.
- **The model:** generated in the background. The same pieces, in the same order and timing; nothing else changes.
- **If the worker can't start** (a very old browser): the page generates the model as it does today, so nothing breaks.

## Approach
- **The engine** gains a pure `buildPayload(house)`: it builds the model and its schedule and packs them for sending (the pieces,
  the build order and start times, and the ground heights as a typed array). The viewer unpacks it into what it uses today.
- **Each house** gets a small `worker.ts` that imports its own definition and answers with `buildPayload()`. Its `main.ts` passes
  the worker to `startViewer()`. So `src/engine` still imports no house.
- **Fallback:** if the worker fails to load or errors, the viewer calls `buildPayload()` itself, on the main thread.

## Acceptance criteria
- **A1** [unit] For every house, unpacking `buildPayload()` gives exactly the pieces, the order, the start times and the total
  that building directly gives (the models and timelines are unchanged).
- **A2** [unit] The unpacked ground gives the same height as the house's own heightmap at every cell of the lot.
- **A3** [unit] Every house page's `main.ts` starts the viewer with its worker, and `src/engine` imports no house (tested).
- **A4** [manual] Chrome: the brick turns throughout loading, and the main thread isn't blocked for more than a frame or two
  while the model is generated (measured with a long-task check).
- **A5** [manual, Erik's iPhone] The brick keeps turning until the intro card shows.

## Out of scope
- Making the model generate faster.
- The brick's look (spec 046 took its studs off).

## Open questions
- [x] **Q1: The approach.** *Recommended: the worker*, as above. A cheaper alternative is to accept the freeze on iPhones and show
      the brick still there (as for reduced motion), so it doesn't look stuck, but it wouldn't turn.

## Implementation notes
- **The worker:** `src/engine/buildPayload.ts` (pure) builds the model and its schedule and packs them: the pieces, the order and
  start times as typed arrays, the ground's heights over the lot and a 120 ft margin round it. `src/engine/buildWorker.ts` has
  `serveBuild()`, which each house's new `worker.ts` calls with its own definition, and `generateModel()`, which the viewer awaits.
  If the worker fails it falls back to the main thread, with a console warning. All 15 houses' `main.ts` pass their worker to
  `startViewer()`; `npm run build` bundles one worker per live house (14).
- **What was left on the main thread** once generation moved: Chrome's long-task timings on Fallingwater (58,425 pieces, the
  heaviest model) still showed one 924 ms block after the model arrived. Most of it was the neighbourhood's near terrain (528
  ms), then the sky and lights, the pieces' meshes and the first frame. That's WebGL work, which has to stay on the main thread,
  so it now pauses for a frame between steps instead:
  - the viewer waits a frame after setting up the sky and after building the pieces' meshes;
  - `NeighborhoodScene.create()` builds the scene a step at a time (the constructor still builds it all at once);
  - the near terrain is two steps (its heights, then its mesh), and each terrain height is now computed once, not three times
    (once for the vertex and twice for its slope). The values are identical.
- **A4 pass** (Chrome, Fallingwater): no long task while the model is generated (2.4 s in dev, 0.5 s in the production build).
  After it, the longest freeze is 178 ms, then 147, 120, 106 ms and shorter. Before, it was one block of about 3.3 s (generation
  plus setup). On a phone the steps take longer, so the brick may still hitch, but it keeps turning between steps.
- **Checked unchanged** (Chrome): the Douglas House's lake, the Farnsworth House's river and Casa Malaparte's sea look as before.
  Every house's model and timeline is unchanged (A1, and the house tests' pins).
- **Tests:** `tests/buildPayload.test.ts` covers A1–A3. Spec 046's A1 now looks for the stud switch in `buildPayload.ts`, where
  the model is generated, and checks the viewer makes no studs. `npm run check`: 347 tests pass.
  - **Not tests-first:** the worker was written before `tests/buildPayload.test.ts`.
- **A5 not checked:** needs Erik's iPhone.


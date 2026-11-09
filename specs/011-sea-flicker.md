# 011 — Fix the flickering around the Eames House

- **Status:** Done (approved by Erik 2026-11-08: "there is a lot of flickering as you rotate around the house"; a bug report,
  fully specified by its symptom)
- **Owner:** Erik
- **Created:** 2026-11-08
- **Commits:** <!-- filled in when Done -->

## Goal
No flickering surfaces while the camera moves.

## Research (2026-11-08)
- **Measure (`window.__flicker()` in the browser, `?debug&dpr=1`):** from 8 positions around the house at the
  overview distance, render, move the camera 0.01 ft forward, render again, and count pixels that change by more than 60
  (RGB sum). Real geometry barely moves in a nudge that small; z-fighting pixels flip.
- **Eames House:** 0.88–0.90% of the far half of the image flickers (near half: 0.002%). **Stahl House:** 0.021%.
- Hiding layers one at a time: without the **sea sheet** → 0.028%; without the **near terrain mesh** → 0.073%; without the far
  terrain → 0.795%; without roads or buildings → no change. So it's **the sea fighting with terrain at nearly the same
  height** (beaches, the shoreline, shallow water a few feet either side of sea level). Camera near/far is 0.3 / 25,000 ft,
  so depth resolution far out is several feet, coarser than those gaps.

## Behavior
The sea and the shore stay where they are, without flicker.

## Acceptance criteria
- **A1** [unit] Open water (below sea level AND connected to samples ≥ 15 ft under it, by flood fill) renders at least 30 ft below sea
  level; land renders at least 3 ft above it (a slight beach berm). That includes low spots enclosed by land, which noisy coastal
  data puts a few feet below sea level by the highway. Higher terrain is unchanged, and nothing changes for houses without a sea
  (`waterMask()`, `seaMeshHeight()` in `neighborhoodData.ts`).
  *Amended twice while building:* (1) leaving terrain at or above sea level unchanged only brought flicker from 0.90% to
  0.12%; (2) pushing everything below sea level down showed those enclosed low spots as ponds. Depth thresholds (3 or 6 ft)
  traded ponds against a sand apron over the shallow bay, so the rule is connectivity, not depth.
- **A2** [manual] `__flicker()` on the Eames House drops to the Stahl House's level (≤ 0.05% of the far half), and the Stahl House
  stays at ≤ 0.05%.
- **A3** [manual] The sea, the beach and the shoreline look the same as before. Day and dusk.
- **A4** [unit] All existing tests pass; Stahl data byte-identical (nothing in the data changes).

## Implementation notes
- **Near plane** (`orbitNear()` in `cameraMoves.ts`, applied each frame in `viewer.ts`): in orbit mode it's 1% of the camera's distance
  to its target, clamped to 0.3–2 ft (1.3 ft at the Eames overview); Walk mode keeps 0.3 ft. Measured live: near 0.3 → 0.096%,
  near 1 → 0.012%. This is the main fix.
- **Sea and shore** (`waterMask()`, `seaMeshHeight()`, `isWater()` in `neighborhoodData.ts`, used by both terrain meshes):
  - Open water renders ≥ 30 ft under sea level, and land ≥ 3 ft above it.
  - Open water is found by flood fill from samples ≥ 15 ft deep through everything below sea level, so enclosed low spots on land
    aren't water.
  - The sea material has `polygonOffset` (factor 4, units 4).
  - Roads and buildings still use the real ground. The data is unchanged, so the Stahl data is byte-identical, and nothing
    changes for houses without a sea.
- **Debug:** `window.__viewer` now also exposes `renderer` and `scene`, so the flicker measurement can render on demand.
- **Results (far half of the image, 0.01 ft nudge, 8 positions):**
  - **Eames: 0.896% → 0.022%** (≈ 40× less). **Stahl: 0.024% → 0.013%.** Near half: ~0.002% throughout.
  - A1/A4: `tests/neighborhood.test.ts` (water mask: an open shelf vs an enclosed dip; mesh heights) and `tests/cameraMoves.test.ts`
    (near plane). 91 tests total.
  - A3 pass in Chrome:
    - the beach by PCH is continuous (no ponds) and the far coast is as before;
    - the living room still shows the sea;
    - the Stahl House's famous view (camera just outside the glass) shows no clipping;
    - Walk mode uses a 0.3 ft near plane.

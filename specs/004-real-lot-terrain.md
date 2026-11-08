# 004 — Shape the brick hillside from the real terrain (fixes KI-3)

- **Status:** Done (approved by Erik 2026-11-08: all recommendations)
- **Owner:** Erik
- **Created:** 2026-11-08
- **Commits:** 0222851

## Goal
The brick lot is still the old made-up mound: every edge stops at a flat −48 ft. Since spec 003 the land around it is real,
so on the uphill sides the mound sits in a dip of up to ~70 ft, and on the downhill sides the real slope starts below the bricks' edge.
Shape the brick hillside from the same real terrain, so the bricks meet the surrounding land seamlessly on every side.

## Research (2026-11-08)
Real ground under the brick lot (ft relative to the house, model coordinates; x columns −112…144, z rows):

```
  z\x   -112   -80   -48   -16    16    48    80   112   144
 -120    -91   -92   -94   -96   -97   -99  -112  -133  -150
  -84    -72   -72   -73   -76   -78   -80   -89  -111  -134
  -48    -32   -30   -29   -30   -35   -46   -66   -92  -114
  -12     -6    -4    -3    -3    -6   -20   -45   -73   -96
   24     -4     0     2     4     5     1   -19   -50   -76
   60     -8     0     3     6    11    15     6   -20   -51
   96    -12    -1     3     7    12    18    19     8   -16
  132    -19    -7     2    10    15    20    22    20    14
```

- The house pad is real: ground is within ±6 ft of the house across the middle of the lot.
- The real land **rises gently** to model south/west (up to +22 ft) and **falls steeply** to model north/east (−150 ft at the corner).
  34% of the lot is below −48 ft and 6% is below −100 ft.
- **The model's street doesn't fit.** `ROAD` runs along model north (z −78…−64) at y = 0, where the real ground is about −75 ft.
  The real Woods Drive passes model west/south-west of the lot, close to the house's level
  (OSM: (−236, −16) → (−159, 90) → (−163, 161) in model coordinates).
- The bricks are already built as a skin: each column only goes down to its lowest neighbor. So the piece count grows with the
  exposed surface (steep slopes), not with volume.

## Design (after approval)
- **The house pad stays** (`PLATEAU`, at y = 0). Real ground is within ±6 ft of it across the middle of the lot. Its downhill edges
  (model north/east) become steep brick slopes down to the real ground over ~20 ft, like the graded pad the real house sits on.
  The house, pool, terrace and lot planting keep their positions.
- **Street → driveway.** The old brick street (`ROAD`, model north) and the old driveway north of the carport are removed.
  A new 16-ft concrete driveway (`DRIVE` = x −112…−2, z −30…−14) runs west from the carport. It's level across the pad, then
  steps down to the real ground at the lot edge (~−13 ft), where a ribbon joins it to the nearest real road (Woods Drive).
  The street hedge gets a gap for it, and the palm at (−20, −22), which would stand in the driveway, moves to (−20, −44).
- **Hillside:** the brick top follows the real ground (rounded to whole bricks) outside the pad and driveway, blended over
  ~20 ft from the pad and ~12 ft from the driveway. Columns go down only to their lowest neighbor (the existing skin rule), including at the lot edge.
- **Occupancy grid:** it reaches down to −400 plates (−160 ft). Cells are packed two per byte (phase + 1 ≤ 8 fits in 4 bits),
  so generation needs ~17 MB, not ~35 MB.
- **Terrain mesh:** outside the lot it is the real ground. Inside, it's 3 ft under the real ground, hidden beneath the bricks.

## Behavior
- The brick hillside follows the real ground. The house pad, terrace, pool surround and lawn stay level where the model needs them.
- At the lot edge the bricks meet the real terrain mesh at the same height on all four sides: no dip, no step, no vertical wall.
- The street and driveway reach the house the way the real ones do (see Q2).
- The build still opens with "Shaping the hillside" and keeps its current duration.

## Acceptance criteria (draft, finalized once the open questions are answered)
- **A1** [unit] Along the whole lot boundary, the brick top surface is within 1 brick (1.2 ft) of the real ground
  (`sampleGrid(near, x, z)`), except where Q2's road crosses it.
- **A2** [unit] The house pad (`PLATEAU`) stays at y = 0. The house itself is unchanged: phases 1–6, excluding the moved paving,
  keep their fingerprint (3,603 pieces, `e781fb43` at b0d7cc3). Landscaping (phase 7) follows the new ground.
- **A3** [unit] No holes: every lot cell has a brick column, and no column's top is more than 3 plates above its lowest neighbor's
  bottom (the existing skin rule).
- **A4** [unit] `groundHeight()` outside the lot equals the real ground. The 160 ft lot blend (`LOT_BLEND`) goes away.
- **A5** [unit] Baseline M2–M6 and the zero-overlap / inside-grid tests still pass. M1's piece-count range is updated to the
  measured value (estimate below), and the change is recorded in `000-baseline.md`.
- **A6** [unit] The real lot heights are baked into a small generated module (`src/model/lotTerrain.ts`, written by
  `scripts/fetch-neighborhood.mjs`). Brick generation stays synchronous and doesn't depend on the `.bin` download.
- **A7** [manual] Orbit all the way round at ground level: the bricks flow into the real hillside on every side.
- **A8** [manual] Performance as in 003-A9: within ±10% of today's fps (46 day / 45 dusk from the default camera), resolution stays at 1.75.
- **A9** [manual] The first 24 s ("Shaping the hillside") still reads well. The deeper slopes build bottom-up.

## Out of scope
- Changing the house, the furniture, or the build order.
- More detail in the neighbors or the basin.

## Open questions
- [x] **Q1 — How deep should the bricks go?** The real lot drops to −150 ft at its lowest corner.
      *(a) Full depth (recommended):* bricks follow the ground everywhere in the lot. Because the hillside is a skin, I estimate
      +5,000–12,000 pieces (to be measured). It also needs the occupancy grid to reach down to ~−400 plates, a temporary
      ~35 MB during generation (today ~15 MB), unless I make the grid's height range fit the model, which I'd do.
      *(b) Bricks above a floor (e.g. −60 ft) only:* below it, the terrain mesh shows instead. Fewer pieces, but 29% of the lot
      (the model-north-east corner) becomes plain terrain, so the brick hill gets a cut-off look along that line.
- [x] **Q2 — The street.** Today's brick road runs along model north at y = 0, about 75 ft above the real ground there.
      *(a) Re-route it (recommended):* follow real Woods Drive along the model west/south-west at grade, with a short driveway into
      the carport. This changes `ROAD`/`DRIVEWAY` in `layout.ts`, and the paving bricks move.
      *(b) Keep it where it is,* on a brick embankment (retaining walls) above the real slope.
      *(c) Drop the brick road* and let the real road ribbon from spec 003 do the job.
- [x] **Q3 — Hillside duration.** With more pieces, should "Shaping the hillside" stay 24 s (each piece lands faster),
      or get a few more seconds? *Recommended: keep 24 s;* the total build time stays 236.7 s.

## Implementation notes
- **Lot ground:** `scripts/fetch-neighborhood.mjs` now also writes `src/model/lotTerrain.ts`: 21 × 20 samples of the near grid
  around the lot, 60 ft margin, identical to `neighborhood.bin` (A6 test). `lotGround()` in `site.ts` samples it bilinearly.
- **Hillside** (`site.ts`): `groundFt()` keeps the pad at 0 and blends to the real ground over 20 ft. The driveway is level on the pad,
  then a straight ramp to the real ground at the lot edge (−13 ft), with 12 ft of cut/fill beside it that fades out at the lot edge.
  Brick tops are *rounded* to whole bricks (they used to be floored), so the lot edge is within ±0.6 ft of the real ground.
  Column bottoms use real-ground neighbors beyond the edge, so the old full-depth edge walls are gone.
  *Addition found during implementation:* under the roof outline (+3 ft) the ground stays ≥ 3 ft below the floor. The real ground under
  the cantilevered living wing is about level with the house, and without this the hillside took cells the slab and glass needed
  (house fingerprint 3,615 / `211cd3ad` instead of 3,603 / `e781fb43`).
- **Street → driveway:** `ROAD`/`DRIVEWAY` are replaced by `DRIVE`, and `CITY_Y` is removed. `buildPaving()` lays the driveway in runs
  of equal height. The hedge has a gap, and the palm moved (−20, −22) → (−20, −44). Scrub can now grow down to −390 plates.
  `neighborhood.ts` adds a 12 ft concrete ribbon from the driveway's end to the nearest real non-service road.
- **Occupancy grid** (`voxel.ts`): `G.y0` −136 → −400 plates, `ny` 200 → 464, packed two cells per byte: 17.7 MB (was 15.2 MB unpacked).
- **Terrain mesh** (`neighborhoodData.ts`): the real ground outside the lot (`LOT_BLEND`/`LOT_EDGE_Y` removed). Inside, each mesh point
  sits 3 ft under the lowest real/designed/pool-floor surface within ±1 mesh cell, so the interpolated mesh can't poke through
  (A4 test). `site.ts` exports `groundFt()`/`surfaceFt()` for this.
- **Studs** (`BrickSet.ts`): an 8-sided open tube with a top cap only. The old 10-sided closed cylinder drew a bottom cap that's never seen.
  That's 24 triangles instead of 40. *Added for A8:* without it, day fps fell 17%.
- **Debug:** `?dpr=1.75` pins the pixel ratio and disables adaptive resolution, for like-for-like performance checks.
- **Numbers:** 17,823 → **27,222 pieces** (+9,399, within the +5k–12k estimate); 38,249 → 69,315 studs; generation ~70 → ~146 ms;
  3.18M → 3.55M triangles. The house (phases 1–6, minus moved paving) is unchanged: 3,603 / `e781fb43`.
  Spec 002's A5 test now checks this house fingerprint (`tests/fingerprint.ts`). The whole-model fingerprint necessarily changed with the hillside.
- **Results:**
  - A1–A6: `tests/lotTerrain.test.ts` plus updated M1 / 003-A3 / 002-A5 tests; 40 tests total.
  - A7 pass: from the default camera the driveway steps down to grade and the lawn rises toward the real uphill. From below on the
    downhill side, the brick slope meets the real terrain with no dip or step (KI-3 fixed).
  - A8 pass, narrowly: with `?dpr=1.75`, same camera, 6 s/12 s settle, 8 samples, spec 003 → 004 went day 42.6 → 39.3 fps (−7.7%)
    and dusk 38.5 → 35.0 (−9.1%). Note: on this Mac, dusk sits near the adaptive-resolution threshold (38 fps) in *both* versions,
    so with adaptive resolution on, dusk may step down to dpr 1.5/1.25.
  - A9 pass: at 0:09 the hillside rises bottom-up from the low corner; by 0:20 it reaches the pad.

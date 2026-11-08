# 001 — Fix palm overlap and occupancy grid bounds (KI-1, KI-2)

- **Status:** Done (A5 manual check pending)
- **Owner:** Erik
- **Created:** 2026-11-08
- **Commits:** <!-- filled in when Done -->

## Goal
Every piece in the model gets an overlap check, so no two pieces ever share space.
This fixes the two known issues in `000-baseline.md`.

## Behavior
Nothing should look different to a visitor. Palm trunks end exactly where their crowns begin,
and no piece is hidden inside another.

## Acceptance criteria
- **A1** [unit] Every piece lies completely inside the occupancy grid `G` (`src/model/voxel.ts`).
  Today 36 palm pieces poke above the ceiling (y ≥ 44 plates, tallest at 51), and the street
  runs 2 studs past the west edge (x = −122 < `G.x0` = −120).
- **A2** [unit] No two pieces overlap. The KI-1 allowance in `tests/model.test.ts` drops to 0.
- **A3** [unit] Each palm trunk is exactly `height` plates tall, and its crown sits directly on top.
  Checked with a direct call to `palm()` for heights that are and aren't multiples of 3.
- **A4** [unit] The baseline criteria M1–M6 and S1–S6 still pass. Piece count stays within 17,000–18,500.
- **A5** [manual] `npm run dev` → Finish → orbit the palms on the lot and slope. Trunks and crowns look the same as before.

## Out of scope
Making the grid size itself to fit the model. A fixed, larger grid is enough for now.

## Open questions
None.

## Implementation notes
- `src/model/landscape.ts` `palm()`: the last trunk segment is now `min(3, height - i)` plates tall, not always 3.
  `palm` is exported so tests can call it directly.
- `src/model/voxel.ts` `G`: `x0` −120 → −128 (`nx` 272 → 280) and `ny` 180 → 200, so the ceiling is now 64 plates.
  The model spans x −122…94, z −117…95, y −120…51. Memory goes from 13.3 MB to 15.2 MB, freed after generation.
- Model before vs after: 17,823 pieces in both. Exactly one piece changed (the palm segment at
  (50, 42, −50), height 3 → 2). The larger grid rejected no pieces.
- Results: A1–A4 pass (`npm run check`, 23 tests). A5 has not been checked in a browser yet.

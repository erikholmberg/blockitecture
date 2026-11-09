# 012 — Roof last, on every house

- **Status:** Done (approved by Erik 2026-11-08: "can the roof go on last, like with the stahl house, and have this be the default
  behavior on new builds")
- **Owner:** Erik
- **Created:** 2026-11-08
- **Commits:** 491d035

## Goal
Like the Stahl House since spec 002, every house is furnished while it's still an open frame: interior → walls/glass → roof.
This becomes the rule for new houses, enforced by tests rather than remembered.

## Design
- **Phase roles (engine):** each `Phase` declares its `role`: `site | foundation | floor | structure | interior | envelope | roof | landscape`.
- **The rule:** for every house, interior < envelope < roof (by phase index). Ceiling-hung pieces go in with the roof, top-down,
  via `Builder.hanging()` (spec 002).
- **Eames House:**
  - New order: hillside & meadow → retaining wall & foundations → slab & walkway → steel frame & mezzanine → interior & furniture →
    panels & glass → roof → meadow, eucalyptus & finishing touches.
  - The mezzanine and studio-loft decks move into the frame phase, so the bedroom furniture has a floor.
  - The paper lantern and its cord hang from the roof.
  - Phase durations are unchanged, so the total stays the same.

## Acceptance criteria
- **A1** [unit] Every phase of every house has a role. For every house: interior before envelope before roof; the roof is the last
  building phase (only landscape may follow).
- **A2** [unit] Every live house in the registry is covered by the build-order test (a new house can't skip it).
- **A3** [unit] Nothing in a house's interior phase lands in mid-air: when a piece starts, at least one face-adjacent cell is
  occupied by a piece that started no later. Ceiling-hung pieces start after the roof deck above them.
- **A3b** [unit] No piece of a house is silently dropped by `Builder.add()` because its space was taken; only site and landscape
  phases may skip occupied space (`Builder.dropped`). *(Added while building: the mid-air check found pieces whose supports had been
  dropped, e.g. the Stahl armchairs' legs on the rug.)*
- **A4** [unit] Stahl House unchanged (fingerprints, timeline). Eames House: same pieces in the same places (geometry unchanged
  apart from additions needed for A3), phases reordered, total time unchanged.
- **A5** [manual] Eames at 4×: the interior is furnished inside the open frame; panels then roof close it; nothing floats.

## Implementation notes
- **Engine:**
  - `PhaseRole` and `Phase.role` (`src/engine/house.ts`).
  - `Builder.dropped` records every piece `add()` refuses because its space is taken (`src/engine/voxel.ts`).
- **The rule** (`tests/buildOrder.test.ts`, run for every house in `DEFINITIONS`; a live house missing from it fails):
  - roles in order;
  - no house piece silently dropped (A3b);
  - no interior piece starting without a face-adjacent piece that started no later (A3).
- **Eames House:**
  - Phases reordered (frame & mezzanine → interior → panels & glass → roof).
  - The mezzanine and loft decks moved to the frame phase, and the paper lantern hangs from the roof.
  - Chairs rebuilt so the back stands on the seat (seat covers both cells).
  - Spiral-stair treads turn around the pole's four faces; a steel stringer was added to the studio stair.
  - Two plants moved: they had overlapped the shelving and the tatami, so pieces were dropped.
  - Kitchen cabinets are single 5-plate pieces flush under the mezzanine.
  - 21,644 → 21,657 pieces (the dropped pieces now actually get placed). Total 230.7 s, unchanged.
- **Stahl House: the check found real, long-standing bugs.**
  - Both armchairs' legs were dropped (the rug was in the way), so the seats floated: legs now stand on the rug.
  - The floor lamp stood inside the sofa (only its shade was placed): moved to the sofa's end.
  - Plant leaves stepped diagonally and didn't touch: they now spiral around the pot.
  - 7 ceiling lights outside the kitchen floated for ~80 s: they now hang from the roof.
  - Two mirrors and the shower head were mounted on walls built later: they now go in with the walls.
  - The terrace parasol's pole was dropped (it overlapped the table), so the canopy floated: the pole now stands on the table.
  - The diff against the pre-012 piece list shows exactly these changes: 27,222 → **27,233** pieces;
    fingerprints `116d7826` (model) and `b6c7272d` (house, 3,613); total 228.7 s, unchanged.
  - Still dropped, allowed as landscape: a few small parts of the carport car, and overlapping tree pieces.
- **Results:**
  - A1–A4: 98 tests.
  - A5 pass in Chrome:
    - 1:45, the Eames interior is furnished inside open frames with the mezzanine and loft decks;
    - 2:30, panels and glass close the walls;
    - 3:00, the roof goes on last;
    - nothing floats.

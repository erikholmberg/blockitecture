# 028 — The camera stays above the ground

- **Status:** Done (approved by Erik 2026-11-09: 3 ft)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** 9195050

## Goal
In orbit mode you can no longer zoom, rotate or glide the camera below the ground and end up looking at the underside of the
hillside or the lot, which is confusing.

## Today
The orbit camera's only limit is its angle: `maxPolarAngle` is 0.53π, a little below horizontal around the target. On a slope,
or with the target low, that puts the camera inside the hill. Zooming in toward a low target does the same, and so can some glides
between views. Walk mode is already held to the ground (spec 006's collision).

## Behavior
- **The clamp:** in orbit mode the camera never goes below the ground under it, plus a small margin (Q1). The ground is:
  - inside the lot, the top of the block terrain;
  - outside it, the real terrain the neighbourhood is drawn from.

  When a drag, zoom or glide would take it lower, it slides along the ground instead, and the view still looks at the target.
- **Water** counts as ground: the sea (Eames) and the water areas (Farnsworth's river), so the camera doesn't dive under them either.
- **Unchanged:**
  - the orbit's angle limit and its distances;
  - the named views (none are below the ground);
  - walk mode;
  - the camera buttons, which still work and also respect the clamp.

## Approach
- **A pure function** in `src/engine/controls/`, `clampAboveGround(camera, ground, margin)`. It takes a camera position and a
  ground-height lookup, and returns the position raised to `ground + margin` if it's lower, otherwise unchanged. Tested in Node.
- **Where it runs:** `viewer.ts` applies it after every orbit update and glide step.
- **The ground lookup:** the lot's height map inside the lot; outside it, the neighbourhood's ground; at least the water level where
  there's sea or a water area.

## Acceptance criteria
- **A1** [unit] `clampAboveGround` raises a camera below `ground + margin` to exactly that height, and leaves one above it untouched.
- **A2** [unit] The ground lookup gives the block terrain's top inside the lot and the real terrain outside it, and never less than
  the water level over the sea or a water area.
- **A3** [unit] Every house's named views start above the ground (none would be moved by the clamp).
- **A4** [manual] In `npm run dev`, on the Stahl House (a steep hillside) and Fallingwater (a ravine), dragging the camera down
  and zooming toward a low point never shows the underside of the ground or the lot. The views and the camera buttons still work.

## Out of scope
- Collisions with the house itself in orbit mode (you can still fly through walls, as today).
- Walk mode.

## Open questions
- [x] **Q1: The margin.** *Erik: 3 ft.* *Recommended: 3 ft*: enough that the near plane never clips into the ground, low enough for eye-level
      views from the meadow.

## Implementation notes
- **Module:** `src/engine/controls/ground.ts` (pure).
  - `clampAboveGround()` returns the same object when nothing changes.
  - `groundLookup()` reads the lot's height map inside the lot and `groundHeight()` outside it, raised to the sea level (Eames) and
    to any water area's level (Farnsworth).
  - Fallingwater's stream is blocks, not a water area, so there the clamp uses its bed.
- **Viewer:** `viewer.ts` applies the clamp after every orbit update, which also covers glides between views and the camera
  buttons. `ground` is added to the `?debug` handle for checking.
- **Two named views were too low (A3)**, and are raised to exactly 3 ft above the ground there:
  - the Stahl House's *famous* view, y 7 → 9 (it was 1 ft above the pool terrace);
  - Fallingwater's *classic* view, y −14 → −9 (it was 2 ft inside the bank).

  The framing barely changes. This is a small change to specs 001/017's views.
- **Tests:** `tests/cameraGround.test.ts` covers A1–A3. 196 tests in all.
- **A4 pass** (Chrome, `?debug`):
  - **Stahl House:** dragging the camera as low as it goes and zooming in, it stops exactly 3.00 ft above the pad. Forced to
    80 ft below the ground, the next frame lifts it to 3.00 ft above.
  - **Fallingwater:** dragging down, zooming and orbiting the ravine, the camera never shows the ground's underside.
  - The views work, and the camera buttons are unaffected.

# 038 — Neighbouring buildings get out of the way

- **Status:** Done (approved by Erik 2026-11-09: "build it", all recommendations. Built and checked in Chrome. Closed by Erik 2026-11-09: "close the specs", accepting it)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** 5f599f0 (build)

## Goal
When you orbit the house, neighbouring buildings standing between the camera and the house hide it. Erik saw this on the Lovell
Health House: "when you rotate around the build, other buildings obscure the view". Neighbours should step aside while they're in
the way, and stay in place as context the rest of the time.

**What's in the way at Lovell** (Chrome, 2026-11-09):
- The lot neighbour uphill (OSM 422130801), about 100 × 60 ft at x 55–161, z −95…−35. It's built as blocks on the lot (spec 019),
  on ground about 25 ft above the house's floor. From the street side (azimuth ~120°–220° around the house) it fills the lower
  half of the screen.
- The other three lot neighbours, and the taller neighbourhood buildings outside the lot, do the same from low camera angles.

The same can happen at every house with neighbours on its lot (Kaufmann, Barragán, Schröder; Ennis's lot has none in today's
data) or close by.

## Behavior
- **In Orbit:** a neighbouring building is hidden while it stands between the camera and the house, and comes back as soon as it
  doesn't. Only buildings are affected; the house, its terrain, trees and the neighbourhood's terrain and roads stay.
  - "Between" means its footprint comes within a set distance of the line from the camera to the house (the orbit's target),
    nearer the camera than the target is.
  - Changes are immediate (no fade), so nothing new is drawn translucent over the scene (spec 036). With reduced motion it's the
    same (spec 037).
- **In Walk:** nothing is hidden (you're on the ground, next to the house, and neighbours are where they'd be).
- **Postcards and share links** (spec 037) show the scene as on screen, so a hidden neighbour stays hidden in the postcard.
- **Applies to every house:** the lot's brick neighbours (spec 019) and the neighbourhood's buildings (spec 003).

## Acceptance criteria
- **A1** [unit] A pure `inTheWay(footprint, camera, target, clearance)`:
  - true for a footprint straddling the line from camera to target;
  - false for one behind the target, beside the line by more than the clearance, or entirely below the line of sight;
  - true for one within the clearance of the line.
- **A2** [unit] Lovell from the street side (`pos 160, 40, -120`, `target 62, 0, 37`): OSM 422130801 is in the way; the three other
  lot neighbours aren't. From the overview (`view=overview`), none is.
- **A3** [unit] The lot's neighbour bricks carry their building's index, so the renderer can hide them per building. The house's
  own bricks carry none. The build-order test (spec 012) and every house's pinned fingerprint stay unchanged.
- **A4** [manual] Lovell, Chrome: orbit fully around at the default height and at a low angle. The house is never hidden by a
  neighbour; neighbours reappear when no longer in the way. Same check at Schröder and Barragán.
- **A5** [manual] No change to the frame rate (Stahl at `?dpr=1.75`; Lovell at `?dpr=1.75`).
- **A6** [manual] Walk mode at Lovell: every neighbour is shown.

## Out of scope
- Moving, lowering or removing any neighbour from the data: they stay true to OpenStreetMap.
- Fading or ghosting (see Q2).
- Trees and terrain in the way (the camera clamp, spec 028, keeps the camera above ground already).

## Open questions
- [x] **Q1: Hide in-the-way neighbours for every house, or fix only Lovell?** *Recommended: every house*, in the shared viewer, so
      any house with close neighbours is covered. The alternative is to drop or lower Lovell's uphill neighbour only. That's
      simpler, but it bends the real site, and the neighbourhood's buildings would still block low angles.
- [x] **Q2: Hide, or show them see-through?** *Recommended: hide*. See-through needs transparency sorting against 20k+ pieces and a
      translucent layer over the scene, which is what caused the iPhone flicker (spec 036).
- [x] **Q3: The clearance around the line of sight.** *Recommended: 25 ft*: enough to clear a building's edge beside the house,
      without emptying the street around it.

## Implementation notes
- **`src/engine/inTheWay.ts`** (pure):
  - `inTheWay(footprint, cam, target, clearance = 25)` samples the line of sight (48 steps). A building is in the way where it
    comes within the clearance of the line while the line is below its top. The clearance narrows to 0 at the target, so a
    building beside or behind the house is never hidden.
  - `neighbourFootprints(bricks)` gives each lot neighbour's box from its pieces; `updateHidden()` sets the flags.
- **The model:** `Builder.neighbour(place)` tags every piece placed inside it with the neighbour's index (`Brick.nb`). The lot
  neighbours at Lovell, Kaufmann, Barragán and Schröder are placed through it. The fingerprints don't include `nb`, so they're
  unchanged.
- **The bricks (`BrickSet`):**
  - each layer has its own geometry with an instanced `aNb` attribute (the neighbour's index + 1, or 0);
  - a shared `uNbHidden[64]` uniform;
  - in the vertex shader, a hidden neighbour's vertices go outside the view, so nothing of it is drawn and nothing is
    translucent.
- **The neighbourhood (`NeighborhoodScene.hideInTheWay`):** each building's vertex range and footprint are kept. A per-vertex
  `aHid` flag does the same, and only changed ranges are re-uploaded.
- **The viewer:** checks once per frame, and only when the camera or target moved or the mode changed. In Walk, everything is
  shown. The `?debug` API gains `neighboursHidden()`.
- **Known limits:**
  - a hidden building still casts its shadow; it's the real sun's, so this was left alone;
  - at dusk, a hidden neighbourhood building's window light still shows (a single point).
- **Tests:** `tests/inTheWay.test.ts` covers A1–A3; 275 tests in all, and the pinned fingerprints are unchanged.
- **Manual checks** (Chrome, 2026-11-09):
  - **A4 pass:**
    - **Lovell:** orbited at 150 ft, at 10–50 ft high and every 45°. The uphill neighbour (OSM 422130801) is hidden from the
      street side (135°, 180°) and shown elsewhere. The house was never covered.
    - **Lovell at 300 ft, 40 ft high:** one neighbourhood building was hidden at 60°, none at the other angles. The house is
      clear and the buildings beside the line of sight stay.
    - **Schröder:** the row is hidden when viewed from its side (270°) and shown from the garden (90°).
    - **Barragán:** its lot neighbour is hidden at 45°–90°. Its neighbourhood (sparse in OSM) never needed hiding.
  - **A5 pass:** 60 fps on Stahl and on Lovell at `?dpr=1.75` (Lovell while auto-rotating fast).
  - **A6 pass:** at Lovell, from 180°, the uphill neighbour is hidden in Orbit, shown in Walk (`neighboursHidden()` = 0000), and
    hidden again back in Orbit.

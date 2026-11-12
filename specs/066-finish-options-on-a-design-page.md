# 066 — Finish options on a dev design page

- **Status:** In progress: built for Erik to look at (asked for by Erik 2026-11-12: "can you add all the options to the design page
  for me to look at"; there was no design page, so this adds one). Nothing a visitor sees changes; picking a finish is a later spec.
- **Owner:** Erik
- **Created:** 2026-11-12
- **Commits:** <!-- filled in when Done -->

## Goal
Looking towards the sun, the glossy pieces turn white (Erik's Stahl House screenshot, 2026-11-12). Before choosing a fix, Erik
wants to see the alternatives side by side.

## Behavior
- A dev-only page, `/dev/design/`, shows the same view of a building in each candidate finish, for three views: the Stahl House
  looking towards the sun, the Neue Nationalgalerie under a low sun, and the Rietveld Schröder House (no glare; what each option
  costs in colour and sparkle).
- The candidates: today's gloss; satin (roughness 0.5); soft satin (0.65); gloss with the reflection at half strength; matte;
  satin on upward faces with glossy sides; a softer sun; and two other tone curves (Neutral, AgX).
- Holding a picture down shows today's finish in its place. "Live" opens the building in that finish, to orbit.
- A building page shows a candidate only when its address has `?finish=<key>`. Without it, and with an unknown key, every page
  looks exactly as before.

## Acceptance criteria
- **A1** [unit] The default finish is today's values: roughness 0.32, reflection ×1, sun ×1, sky fill ×1, ACES curve, exposure ×1.
- **A2** [unit] `finishFromParam` returns today's finish for no value and for an unknown value, and the named finish otherwise.
- **A3** [unit] Each candidate differs from today's finish, and no two candidates are the same.
- **A4** [unit] `/dev/design/` exists and is not a build input; every scene names a live house; there is a picture for every scene
  and finish.
- **A5** [unit] The viewer reads the finish from `?finish=` and passes it to the pieces, the light and the tone curve; with today's
  finish the piece shaders are not edited.
- **A6** [manual] Open `/dev/design/`: three sections of nine pictures, each labelled; holding one down swaps in today's; "Live"
  opens the building in that finish.
- **A7** [manual] A building page without `?finish=` looks as it did before this spec.

## Out of scope
- Choosing a finish and making it the default (a later spec, once Erik has picked).
- Glass, water and lights: their materials are unchanged in every candidate.
- Dusk. The pictures are all by day.

## Open questions
None.

## Implementation notes
- `src/engine/finish.ts` (pure): the candidates and `finishFromParam`. `viewer.ts` reads `?finish=`; `BrickSet` takes the
  roughness and edits the piece shaders only for a candidate that needs it (reflection strength; rougher upward faces);
  `Environment` takes sun, sky-fill and exposure multipliers.
- "Satin tops, glossy sides" is decided per face in the shader (the upward face of a box piece), not per piece, so there is no
  per-piece rule to maintain. Round pieces (mostly studs) take the tops' roughness.
- "Matte" is roughness 1 with the reflection at 0.
- The two tone curves need a brighter exposure to land near today's brightness (×1.65, set by eye). They are not an exact
  match: Neutral comes out brighter and more saturated, AgX paler. Judge their highlights, not their overall brightness.
- Pictures: `node scripts/design-shots.mjs` (dev server running) writes `src/dev/design/<scene>-<finish>.jpg`, 27 files, 3.8 MB.
  They live under `src/dev/`, not `public/`, so they are never deployed.

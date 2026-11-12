# 067 — Soft satin finish

- **Status:** In progress: built, waiting for Erik's look, A6 (Erik picked "1b" on /dev/design/ and approved 2026-11-12: "approved", all three recommendations)
- **Owner:** Erik
- **Created:** 2026-11-12
- **Commits:** 8dc9e37

## Goal
Looking towards the sun, flat surfaces no longer turn white: the pieces keep their colour. Erik compared nine finishes on
/dev/design/ (spec 066) and picked 1b, soft satin.

## Behavior
- Every building's pieces have a soft satin finish (roughness 0.65, was 0.32). Towards the sun a roof, lawn or terrace shows a
  soft sheen and keeps its colour.
- Everything else is as before: the sun, the sky, shadows, the tone curve, and the glass, water and lights.
- `/dev/design/` still shows all nine finishes; soft satin is now labelled as today's, and gloss as the previous one.
  `?finish=gloss` still shows the old finish on any building page.

## Acceptance criteria
- **A1** [unit] The default finish is soft satin: roughness 0.65, with reflection ×1, sun ×1, sky fill ×1, ACES curve, exposure ×1.
- **A2** [unit] `finishFromParam` returns soft satin for no value and for an unknown value; `gloss` still returns roughness 0.32.
- **A3** [unit] The default finish edits no piece shader (no reflection scaling, no separate roughness for upward faces).
- **A4** [unit] On the design page, the finish marked as today's is the default one, and the hold-to-compare picture is the default's.
- **A5** [manual] Open the Stahl House at the glare angle (`?cam=-40,48,100,60,0,-25`): the roof keeps its grey, with a soft sheen.
- **A6** [manual] Erik: orbit a few buildings towards the sun, by day and at dusk; no surface turns white, and nothing looks dull.

## Out of scope
- **Thumbnails, the link-preview image and the video.** They were made with the gloss finish. The home-page views aren't towards
  the sun, so the difference is small; remaking all 22 thumbnails is its own job.
- The other candidates. They stay on the design page behind `?finish=`, and can be removed later.
- Glass, water, lights, the neighbourhood and the city: unchanged.

## Open questions
- [x] **Q1: Round pieces and studs.** Recommendation: the same 0.65 as the boxes, as in the 1b pictures you looked at.
- [x] **Q2: Keep the other finishes on the design page?** Recommendation: yes for now, so you can still compare; a later tidy-up
  removes them and the `?finish=` option once you're settled.
- [x] **Q3: Thumbnails.** Recommendation: leave them (out of scope above). Say if you'd rather remake them now.

## Implementation notes
- `DEFAULT_FINISH` in `src/engine/finish.ts` is now `soft-satin`; `BrickSet` uses it when no finish is given. Round pieces and
  studs take the same 0.65 (Q1). No shader is edited for it: only the materials' roughness changed.
- The design page keeps all nine finishes (Q2): soft satin is labelled "(today)", gloss "(previous)", and hold-to-compare shows
  the default. The pictures didn't need remaking: each is named by its finish.
- Spec 066's tests and text were updated where they said gloss was the default.
- Thumbnails, the link-preview image and the video are untouched (Q3).
- **A5 passed** (Chromium on this Mac, 2026-11-12): the Stahl House at `?cam=-40,48,100,60,0,-25` with no `?finish=` is
  pixel-for-pixel the 1b picture Erik chose; the roof keeps its grey.
- **Dusk, looked at once:** same view with `&light=dusk`. Nothing turns white. The roof's orange sheen from the sunset is fainter
  than with gloss, so the roof reads a little darker.
- **A6 not checked:** Erik's own look, by day and at dusk.

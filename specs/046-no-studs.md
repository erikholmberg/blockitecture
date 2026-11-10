# 046 — No studs

- **Status:** In progress (approved by Erik 2026-11-10: "build it", all recommendations. Built and checked in Chrome; committed with
  Erik's go-ahead, 2026-11-10.)
- **Owner:** Erik
- **Created:** 2026-11-10
- **Commits:** 11ed823

## Goal
Erik tried the Rose Seidler House without the round studs on top of its pieces (a throwaway edit, 2026-11-10) and loved it: the
houses read more like architects' models, flat roofs look flat, lawns look like lawns. Every house goes stud-free. With the studs
gone, the site no longer has the feature that most looks like LEGO, which raises whether its LEGO disclaimer is still needed (Q3).

## Behavior
- **Every house, every piece:** no studs, in the build and when finished. The pieces, their colours, sizes and seams, the build
  order and its timing are all unchanged.
- **The loading screen:** the spinning brick loses its four studs, so it matches.
- **The disclaimer (Q3):** *recommended*, "the LEGO Group" leaves the intro cards' disclaimers, the credits page and the README.
  Each intro card keeps its line naming the house's architects, owners or museum, e.g. "Fan tribute in a generic toy-block style.
  Not affiliated with Museums of History NSW or Harry Seidler & Associates."

## Acceptance criteria
- **A1** [unit] Nothing in the viewer draws studs: the brick set is built with none, for every house.
- **A2** [unit] Every house's model is unchanged: the pinned piece counts, fingerprints and timelines in the house tests still
  pass (the studs are dropped where they're drawn, not from the models).
- **A3** [unit] Every house page's loading screen has no studs, and stays identical across pages (spec 027).
- **A4** [unit] (if Q3 is yes) "LEGO" appears in no house definition, on the credits page or in the README; every intro card's
  disclaimer still names that house's affiliations (spec 021's check, without the LEGO Group).
- **A5** [manual] In `npm run dev`: a house during its build and finished shows no studs; the frame rate is no worse (studs
  were up to tens of thousands of extra shapes, so it should get better).

## Out of scope
- Smoothing the pieces' seams or merging them (the blocks stay visible as blocks).
- The favicon and the logo (no studs in them).
- Spec 013's wording ("block", not "brick"): unchanged.

## Open questions
- [x] **Q1: Where to drop them.** *Recommended: where they're drawn* (the viewer stops building the stud layer), so every model and
      every test pin stays as it is, and studs could come back with one line. The alternative is clearing the stud flag in the
      models, which changes every house's fingerprint.
- [x] **Q2: The loading screen's brick.** *Recommended: no studs*, to match.
- [x] **Q3: The LEGO disclaimer.** I'm not a lawyer; this is reasoning, not advice. The line was there because the style looked
      like LEGO, and the studs were the most LEGO-like thing about it. Without them, nothing on the site uses LEGO's name, its
      minifigures or its studs. *Recommended: remove "the LEGO Group"* from the disclaimers, and keep each house's own
      no-affiliation line. Keeping it costs nothing, though, and if the site ever earns money, a lawyer should decide.

## Implementation notes
- **The switch:** `DRAW_STUDS = false` in `src/engine/catalog.ts`; `src/engine/viewer.ts` builds the stud list only when it's
  on, so the brick set gets none. The models still record each piece's `studs` flag, so every house's pinned fingerprint and
  timeline is unchanged (A2), and turning the switch back on brings the studs back.
- **The loading screen:** the two stud gradients left `.lb-top` on all 15 house pages (the Vanna Venturi House's too).
- **The disclaimers:** "or the LEGO Group" left the 14 intro cards that had it (the Stahl House's never named it), each list
  rejoined, e.g. "Not affiliated with Museums of History NSW or Harry Seidler & Associates." The credits page's opening line now
  reads "Every house here is a fan tribute in a generic toy-block style, not affiliated with the people or organisations named
  with it." The README says the same in its own words.
- **Older tests that named LEGO:** `tests/credits.test.tsx` A2 and `tests/builtBy.test.tsx` A2 expected the old line; they now
  check the new one. `tests/shareAccessibility.test.tsx` A7 already checked the postcard has no "LEGO".
- **Tests:** `tests/noStuds.test.tsx` covers A1, A3 and A4; all three failed first. A2 is every house test's pins.
  `npm run check`: 345 tests pass.
- **A5 pass** (Chrome, the Stahl House at `?debug&dpr=1.75`): no studs during the build or finished. The finished house draws
  1,885,078 triangles; with the switch turned on for comparison, 3,548,614, so 47% fewer. Both hold the display's 60 fps cap,
  so the gain will show on slower machines and phones rather than here.
- **The thumbnails** (Erik asked afterwards, 2026-11-10): all 14 home-page thumbnails were captured with studs, so they were
  retaken stud-free from the capture URL in each house's spec, plus the hidden Vanna Venturi House's, each cropped to the centre
  1200 × 675 of a 1456 × 819 window (the Douglas House's from 1400 × 841). Side by side with the old ones, each keeps its framing.
  The Stahl House's URL is the daylight pool view in spec 007's later note (`?view=pool&clean&date=2026-06-21`), not the dusk
  view above it.


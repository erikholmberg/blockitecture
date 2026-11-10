# 048 — A shorter disclaimer

- **Status:** Done (approved by Erik 2026-11-10: "build it". Closed by Erik 2026-11-10: "close the specs")
- **Owner:** Erik
- **Created:** 2026-11-10
- **Commits:** 57957e0

## Goal
Spec 046 dropped the studs and the LEGO line. The disclaimers still say "in a generic toy-block style", which was there to set the
site apart from LEGO and no longer has a job. Erik asked to trim it (2026-11-10), keeping the line that names who each house isn't
affiliated with.

## Behavior
- **Each intro card's disclaimer** loses "in a generic toy-block style". It reads "Fan tribute. Not affiliated with …", naming
  the same architects, owners or museums as today. For example: "Fan tribute. Not affiliated with the Western Pennsylvania
  Conservancy or the Frank Lloyd Wright Foundation."
- **The credits page's opening line** reads "Every house here is a fan tribute, not affiliated with the people or organisations
  named with it."
- **The README** says the same.
- **Unchanged:** each house's no-affiliation names, on its intro card and on the credits page; the Stahl House's intro card,
  which has no disclaimer.

## Acceptance criteria
- **A1** [unit] "toy-block style" appears in no house definition, on the credits page or in the README.
- **A2** [unit] Every intro card's disclaimer starts "Fan tribute. Not affiliated with", and still names exactly its house's
  affiliations (spec 021's check).
- **A3** [unit] The credits page opens with "Every house here is a fan tribute, not affiliated with the people or organisations
  named with it."
- **A4** [manual] In `npm run dev`: an intro card and the credits page read as in Behavior.

## Out of scope
- The word "block" elsewhere (the name, the headlines, "built block by block"): unchanged.
- Adding a disclaimer to the Stahl House's intro card.

## Open questions
None.

## Implementation notes
- **Changed:** the disclaimer in all 14 house definitions that have one (the hidden Vanna Venturi House's too), the credits
  page's opening line (`src/credits/CreditsPage.tsx`) and the README.
- **Tests:** `tests/shorterDisclaimer.test.tsx` covers A1–A3; all three failed first. `tests/builtBy.test.tsx` A2 and
  `tests/credits.test.tsx` A2 checked the old credits line; they now check the new one. `npm run check`: 350 tests pass.
- **A4 pass** (Chrome): Fallingwater's intro card reads "Fan tribute. Not affiliated with the Western Pennsylvania Conservancy
  or the Frank Lloyd Wright Foundation."; the credits page opens "Every house here is a fan tribute, not affiliated with the
  people or organisations named with it."


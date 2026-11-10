# 049 — Just "Credits"

- **Status:** Done (approved by Erik 2026-11-10: "build it". Closed by Erik 2026-11-10: "close the specs")
- **Owner:** Erik
- **Created:** 2026-11-10
- **Commits:** 0147ded

## Goal
The credits page (spec 021) is labelled "Credits & disclaimers". Since specs 046 and 048, what's left of the disclaimers is one
short "not affiliated with" line per house; the page is mostly what each model was built from. Erik asked to call it just
"Credits" (2026-11-10).

## Behavior
- **The home page's footer link** reads "Credits".
- **The credits page:** its heading reads "Credits"; its browser-tab title "Credits · Blockitecture"; its search description
  "Credits and sources for the famous buildings rebuilt from toy blocks on Blockitecture."
- **Unchanged:** the page's address (`/credits/`), its opening line, each house's "not affiliated with" line on the page and on its
  intro card.

## Acceptance criteria
- **A1** [unit] The word "disclaimer" appears in none of: the home page's footer, the credits page's rendered text, and the
  credits page's HTML title and meta description.
- **A2** [unit] The footer link reads "Credits" and still goes to `/credits/`; the credits page's heading reads "Credits".
- **A3** [unit] Each house's "not affiliated with" line is still on the credits page and on its intro card (spec 021's checks
  still pass).
- **A4** [manual] In `npm run dev`: the home page's footer and the credits page read as in Behavior.

## Out of scope
- The word "disclaimer" in code and test names (`text.disclaimer` and the like): not seen by visitors.

## Open questions
None.

## Implementation notes
- **Changed:** the footer link in `src/home/HomePage.tsx`, the heading in `src/credits/CreditsPage.tsx`, and the title and
  meta description in `credits/index.html`.
- **Tests:** `tests/justCredits.test.tsx` covers A1 and A2; both failed first. A3 is spec 021's `tests/credits.test.tsx`, still
  passing. `npm run check`: 352 tests pass.
- **A4 pass** (Chrome): the footer reads "Built by Erik Holmberg. Credits · Neighborhoods © OpenStreetMap contributors; …"; the
  credits page's tab reads "Credits · Blockitecture" and its heading "Credits".


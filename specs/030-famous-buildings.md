# 030 — "Famous buildings", not "famous houses"

- **Status:** Done (requested by Erik 2026-11-09)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
Following spec 029, the site's headline and titles say "buildings", so it can take in landmarks that aren't houses.

## Behavior
- **The home headline:** "Famous houses, built block by block" becomes "Famous buildings, built block by block".
- **The home page's tab title:** "Blockitecture: famous houses, built block by block" becomes "Blockitecture: famous buildings, built block
  by block".
- **The credits page's meta description:** "…for the famous houses rebuilt from toy blocks…" becomes "…for the famous buildings rebuilt
  from toy blocks…".
- **The README's first line:** updated to match.

## Acceptance criteria
- **A1** [unit] The home headline, the home page's `<title>` and the credits page's meta description say "famous buildings", and
  "famous houses" appears in none of them.
- **A2** [unit] Spec 013's wording tests still pass: the home headline still says "block by block", and there's no "brick".
- **A3** [manual] In `npm run dev`, the home headline and the tab title read as in Behavior.

## Out of scope
- Each house's own page and texts (they are houses).
- The word "house" in code, URLs and the registry.

## Open questions
None.

## Implementation notes
- **Changed:** `src/home/HomePage.tsx` (the headline), `index.html` (the title), `credits/index.html` (the meta description) and
  `README.md`'s first line.
- **Tests:** `tests/famousBuildings.test.tsx` covers A1; it failed first. 198 tests in all.
- **A3 pass** (Chrome): the headline reads "Famous buildings, built block by block", and the tab "Blockitecture: famous buildings,
  built block by block".

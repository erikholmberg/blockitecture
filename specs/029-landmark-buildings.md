# 029 — "Landmark buildings", not "landmark modernist houses"

- **Status:** Done (requested by Erik 2026-11-09)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The home page's description doesn't limit the site to modernist houses, so it can take in older and non-modern buildings.

## Behavior
"Landmark modernist houses rebuilt from toy blocks in your browser." becomes "Landmark buildings rebuilt from toy blocks in your
browser." in two places: the home page's text under its headline, and the home page's meta description. The rest of both sentences
is unchanged.

## Acceptance criteria
- **A1** [unit] The home page's text and its meta description say "Landmark buildings rebuilt from toy blocks in your browser", and
  "modernist" appears nowhere on the home page or in its HTML.
- **A2** [unit] The spec 013 wording tests still pass (no "brick").
- **A3** [manual] In `npm run dev`, the home page reads as in Behavior.

## Out of scope
- The headline, "Famous houses, built block by block" (see Implementation notes).

## Open questions
None.

## Implementation notes
- **Change:** the sentence in `src/home/HomePage.tsx` and the meta description in `index.html`.
- **Tests:** `tests/landmarkBuildings.test.tsx` covers A1; it failed first. 197 tests in all.
- **A3 pass** (Chrome): the home page reads "Landmark buildings rebuilt from toy blocks in your browser. Watch each one go up piece by
  piece on its real site, then orbit around it or walk inside.", and the meta description matches.
- **Still says houses:** the headline ("Famous houses, built block by block"), the browser tab title ("famous houses, built block by
  block") and each card's "house" wording all still say houses. If non-house landmarks are coming, they'd want the same change.

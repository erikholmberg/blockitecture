# 042 — The shortlist marks off the houses already built

- **Status:** In progress (requested by Erik 2026-11-09: "mark off the ones on the shortlist we've created")
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
On the dev photo page `/dev/shortlist/`, it's hard to see which candidates are already built: they only carry a small grey "Live"
tag. Built houses should be clearly marked off, so the page shows at a glance what's left to choose from.

## Behavior
- A candidate counts as **built** when the house registry has it as live.
- A built card is marked off: a "Built" badge with a check mark sits on its photo, the photo is faded, and the card has no Pick
  button. In its place, a "View" link opens the house's page.
- Built houses can't be picked. A pick saved earlier for a house that has since been built no longer shows in the Picks bar.
- The header says how many are built, e.g. "10 of 41 built" (11 since spec 043).
- Houses on the home page as coming soon (none today) keep their "On the home page as coming soon" tag.
- The order of the cards doesn't change.

## Acceptance criteria
- **A1** [unit] `builtOnShortlist(SHORTLIST, HOUSES)` returns exactly the shortlist slugs whose house is live: the 10 built from
  the shortlist when this spec was written (Fallingwater through the Sheats-Goldstein Residence), and each one built since (the
  test's list grows with them; spec 043 added the Rose Seidler House, spec 045 the Douglas House). The Stahl and Eames houses, which aren't on the
  shortlist, aren't counted.
- **A2** [unit] `livePicks(picks, built)` drops built slugs from saved picks and keeps the others in order.
- **A3** [manual] In `npm run dev`, `/dev/shortlist/` shows "10 of 41 built". The 10 built cards are faded, carry the Built badge
  and a View link that opens the house, and have no Pick button. The other 31 look as before.

## Out of scope
- Hiding built houses or moving them to the end.
- The published site: this page is dev-only.

## Open questions
None.

## Implementation notes
- **Changed:** `src/dev/shortlist.ts` (`builtOnShortlist`, `livePicks`, both pure) and `src/dev/ShortlistPage.tsx`: the Built badge
  on the photo, the faded greyscale photo, a View link in place of Pick, "N of 41 built" in the Picks bar, and stale picks dropped. The
  old grey "Live" tag is gone, replaced by the Built badge.
- **Tests:** `tests/shortlistBuilt.test.ts` covers A1 and A2; both failed first (the helpers didn't exist). `npm run check`: 305 tests pass.
- **A3 pass** (Chrome): the bar reads "10 of 41 built"; the 10 built cards are faded with the Built badge and a View link to
  `/<slug>/`, and have no Pick button; all 31 others still have Pick.

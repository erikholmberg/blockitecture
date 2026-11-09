# 020 — An eighth card

- **Status:** Done (approved by Erik 2026-11-09: "kaufmann")
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** 2609a3b

## Goal
The home page shows 8 cards, 2 across, so the grid ends on a full row: 4 live houses and 4 coming soon.
Today there are 7: Stahl, Eames, Fallingwater and Schröder live; Farnsworth, Ennis and Malaparte coming soon.

## Behavior
One more coming-soon card after Casa Malaparte, taken from spec 016's shortlist. It looks and behaves like the others (spec 007): a
block-pattern placeholder, a "Coming soon" badge, and no link.

## Acceptance criteria
- **A1** [unit] The registry lists the coming-soon houses in this order: `farnsworth-house`, `ennis-house`, `casa-malaparte`, then
  `kaufmann-desert-house` (Q1). The new entry has a title, architect, year, location and a blurb, and no thumbnail or piece count.
- **A2** [unit] The 007 and 016 registry tests pass with the new list, and the home page renders 8 cards.
- **A3** [manual] In `npm run dev`, the home page shows 8 cards in 4 full rows of 2.

## Out of scope
- Building the house (it gets its own spec, like 017 and 019).

## Open questions
- [x] **Q1: Which house?** *Erik: the Kaufmann Desert House* (Richard Neutra, 1946, Palm Springs). From spec 016's shortlist. *Recommended: Villa Savoye* (Le Corbusier, 1931, Poissy). It's the most famous
      house left on the list: a white box on thin columns, with ribbon windows, a ramp and a roof garden. It would also be the first
      house in France. It's ★★ (the curved ground-floor glass and the ramp need new tricks).
      Alternatives that fit the engine as it is (★★★):
      - the Glass House (Philip Johnson, 1949): a glass box in a meadow;
      - the Kaufmann Desert House (Neutra, 1946): Palm Springs, with a pool and mountains;
      - the Villa Tugendhat (Mies, 1930): on a slope over Brno.

## Implementation notes
- **Registry:** `src/houses/index.ts` gains `kaufmann-desert-house`, as data only.
- **Tests:**
  - `tests/eighthCard.test.tsx` covers A1 and A2. It failed first, then passed.
  - The 007 and 016 registry tests now expect the new coming-soon list.
  - 151 tests in all.
- **A3 pass** (Chrome, 1652 px window): 8 cards in 4 rows of 2. Stahl and Eames, Fallingwater and Schröder, Farnsworth and Ennis, Malaparte and Kaufmann.
- **Noticed, not changed:** the home page footer's no-affiliation line still names only the Eames organisations. It doesn't mention
  those of Fallingwater (Western Pennsylvania Conservancy, Frank Lloyd Wright Foundation) or the Schröder House (Centraal Museum,
  Rietveld Schröderhuis, Cassina). Each house's own intro card does name them. Changing the footer would need its own spec.

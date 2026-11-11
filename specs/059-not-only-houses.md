# 059 — Not only houses: wording for the first landmarks

- **Status:** In progress: built and committed, waiting for Erik to close it (approved by Erik 2026-11-11: "build 4 and don't stop until they're done", choosing to treat that message as approval
  of the specs written for it)
- **Owner:** Erik
- **Created:** 2026-11-11
- **Commits:** c6164fc

## Goal
Specs 055–058 add the first buildings that aren't houses: the Church of the Light (a chapel) and the Neue Nationalgalerie (a
gallery). Spec 030 already changed the home page to "famous buildings", but a few generated texts and the viewer's numbers panel still
say "house". They would read wrongly on those two pages, and the search description would undercount what's there.

## Behavior
- **Search and AI descriptions (spec 053):** the home description says "N famous buildings rebuilt from blocks…". llms.txt says
  "Each building is a 3D model…", lists them under "## Buildings", links "All buildings", and says the tribute isn't affiliated
  "with the buildings, their owners or the architects' foundations". A page's readable article links "All buildings on Blockitecture".
- **The numbers panel (spec 050)** names the building by what it is: "1,234 in the chapel, …", "Glass: 3% of the chapel", "This
  model, not the real chapel: …". Each house definition can name its kind. Houses say "house", as today.
- **The link-preview image (`npm run og-image`)** says "N buildings, from Frank Lloyd Wright to Tadao Ando", and it's remade once the
  four new buildings are live.

## Acceptance criteria
- **A1** [unit] The home description says "famous buildings" and not "famous houses"; llms.txt doesn't say "Each house" or
  "## Houses".
- **A2** [unit] A definition with `text.noun: 'chapel'` gets numbers-panel rows that say "in the chapel" and "of the chapel"; a
  definition without one says "house".
- **A3** [unit] Every existing house's definition is unchanged (no `noun`), so its pages read exactly as before.
- **A4** [manual] On `/church-of-the-light/` in `npm run dev`, the numbers panel says "chapel".

## Out of scope
- The word "house" in code, URLs, the registry and the house-page pattern (spec 030's rule stands).
- The home page itself, which already says "buildings" (spec 030).

## Open questions
None.

## Implementation notes
- **Changed:**
  - `src/seo/seo.ts`: the home description, llms.txt's wording and heading, the article's "All buildings" link.
  - `src/engine/house.ts`: an optional `text.noun`.
  - `src/engine/ui/NumbersPanel.tsx` and `Hud.tsx`: the panel takes the noun.
  - `scripts/og-image/make-og-image.mjs`: says "N buildings".
  - `public/og-image.jpg`: remade; it says "18 buildings".
- **Tests:** `tests/notOnlyHouses.test.tsx` covers A1–A3. A1 and A2 failed first.
- **A4 pass** (Chrome): on `/church-of-the-light/` the panel reads "4,617 in the chapel", "3% of the chapel" and "not the real
  chapel". The Neue Nationalgalerie says "gallery".

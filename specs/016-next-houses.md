# 016 — The next houses

- **Status:** Done (approved by Erik 2026-11-09: picked all four recommended houses, with coming-soon cards now)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** 58392c6

## Goal
A shortlist of 20 famous houses to build next, and Erik's picks from it, shown on the home page as coming-soon cards so visitors can see
what's next.

## The list
**Fit** rates how well each house suits the engine today:
- ★★★ Mostly boxes; the engine handles it as it is.
- ★★ Needs one new trick (slopes, a ramp, a curve, new scenery).
- ★ Mostly curves or angles; a showpiece challenge.

Fallingwater, already a coming-soon card, isn't counted.

| # | House | Architect · year · place | Why it would be great in blocks | Fit |
|---|---|---|---|---|
| 1 | Rietveld Schröder House | Gerrit Rietveld · 1924 · Utrecht | De Stijl planes in red, blue, yellow, black and white: it already looks like a toy. It sits at the end of an ordinary row of houses | ★★★ |
| 2 | Farnsworth House | Mies van der Rohe · 1951 · Plano, Illinois | A white steel and glass box floating on stilts over the Fox River floodplain. The most minimal house there is | ★★★ |
| 3 | Glass House | Philip Johnson · 1949 · New Canaan, Connecticut | A glass box in a meadow, with the windowless Brick House facing it | ★★★ |
| 4 | Ennis House | Frank Lloyd Wright · 1924 · Los Angeles | Built from thousands of patterned concrete "textile blocks", literally block by block. A Hollywood Hills ridge, like the Stahl House | ★★ |
| 5 | Casa Malaparte | Adalberto Libera / Curzio Malaparte · 1938 · Capri | A red box on a cliff over the sea, with a wedge-shaped staircase up to the roof. Reuses the sea scenery | ★★ |
| 6 | Villa Savoye | Le Corbusier · 1931 · Poissy, France | A white box on thin columns with ribbon windows, a ramp and a roof garden; a curved glass ground floor | ★★ |
| 7 | Kaufmann Desert House | Richard Neutra · 1946 · Palm Springs | A pinwheel plan, a pool and the San Jacinto Mountains behind. New desert scenery | ★★★ |
| 8 | Villa Tugendhat | Mies van der Rohe · 1930 · Brno | On a slope over the city: an onyx wall, chrome columns and glass walls that sink into the floor | ★★★ |
| 9 | Robie House | Frank Lloyd Wright · 1910 · Chicago | Prairie style: long, low, hipped roofs and Roman brick. Needs sloped pieces | ★★ |
| 10 | Gropius House | Walter Gropius · 1938 · Lincoln, Massachusetts | A white Bauhaus box in New England, with glass block and an outdoor spiral stair | ★★★ |
| 11 | E-1027 | Eileen Gray · 1929 · Roquebrune-Cap-Martin | A white villa on the rocks above the Mediterranean. Reuses the sea scenery | ★★ |
| 12 | Lovell Health House | Richard Neutra · 1929 · Los Angeles | A steel frame hung into a canyon. Another LA hillside, so everything carries over | ★★ |
| 13 | Miller House | Eero Saarinen · 1957 · Columbus, Indiana | A grid of skylights, the original conversation pit, and Dan Kiley's garden | ★★★ |
| 14 | Casa Luis Barragán | Luis Barragán · 1948 · Mexico City | Pink, yellow and orange walls and a roof terrace, inside a dense city block | ★★★ |
| 15 | Koshino House | Tadao Ando · 1981 · Ashiya, Japan | Concrete boxes sunk into a wooded hillside; the formwork panels map straight onto blocks | ★★★ |
| 16 | Frey House II | Albert Frey · 1964 · Palm Springs | A huge boulder runs through the living room. Desert again | ★★ |
| 17 | Vanna Venturi House | Robert Venturi · 1964 · Philadelphia | The split gable that started postmodernism. Small, with a sloped roof | ★★ |
| 18 | Rose Seidler House | Harry Seidler · 1950 · Sydney | Bauhaus in the Australian bush, with a ramp and a colorful mural wall | ★★★ |
| 19 | Chemosphere | John Lautner · 1960 · Los Angeles | An octagonal "flying saucer" on a 30 ft concrete column. Curves in blocks are the fun challenge | ★ |
| 20 | Sheats-Goldstein Residence | John Lautner · 1963 · Los Angeles | A triangular coffered concrete roof over a jungle garden | ★ |

## Picks
In this order, after Fallingwater:
1. Rietveld Schröder House
2. Farnsworth House
3. Ennis House
4. Casa Malaparte

Each gets its own spec, researched like spec 010 (documented and assumed details marked), before it is built.

## Behavior
The home page shows 7 cards, 2 across (spec 015): the two live houses, then coming-soon cards for Fallingwater and the four picks.
Coming-soon cards look and behave as in spec 007: a block-pattern placeholder, a "Coming soon" badge, and no link.

## Acceptance criteria
- **A1** [unit] The registry lists the coming-soon houses in this order: `fallingwater`, `rietveld-schroder-house`,
  `farnsworth-house`, `ennis-house`, `casa-malaparte`. Each has a title, architect, year, location and a blurb, and no thumbnail or
  piece count.
- **A2** [unit] The existing home page and registry tests pass. 007-A1's "planned coming-soon houses" check now expects this list.
- **A3** [manual] In `npm run dev`, the home page shows 7 cards, 2 across: the two live houses first, then 5 coming-soon cards that
  can't be clicked.

## Out of scope
- Building any of the houses (each one gets its own spec).
- The other 16 houses on the list. They stay here for later.

## Open questions
None.

## Implementation notes
- **Registry:** `src/houses/index.ts` gains the four entries, as data only; `HouseCard` renders its placeholder for them.
- **Tests:**
  - `tests/nextHouses.test.ts` (A1). It failed first, then passed.
  - `tests/houses.test.ts`: 007-A1's coming-soon list now expects the five houses (A2).
- **Blurb:** the Schröder House blurb first said "a row of brick houses", and spec 013's wording test caught it. It now says
  "an ordinary row of houses".
- **A3 pass** (Chrome, 1652 px window):
  - 7 cards in 2 columns, the live Stahl and Eames cards first.
  - Then Fallingwater, Schröder, Farnsworth, Ennis and Malaparte. None of the five is a link, and each has `aria-disabled="true"`.
- **Dev-only photo page** (Erik asked for it afterwards). It is a tool, not a visitor-facing page, so it isn't part of the published
  site.
  - `/dev/shortlist/` (`dev/shortlist/index.html`, `src/dev/`) shows all 21 candidates with photos loaded live from Wikipedia (the
    lead photo) and Wikimedia Commons (search results). Logos, plans, maps and small images are filtered out.
  - Each card has a Pick toggle; picks are saved in localStorage and there is a "Copy list" button.
  - The page is not in `PAGES`, so `npm run build` never includes it (`tests/devPages.test.ts`), and it carries `noindex`.
  - Koshino House has almost no photos on Commons, so its card offers an image search link.

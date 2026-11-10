# 041 — Twenty more candidates for the shortlist

- **Status:** In progress (approved by Erik 2026-11-09: "approved, the mix")
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** 599e512

## Goal
Nine of spec 016's shortlist houses are now built, so the dev photo page at `/dev/shortlist/` has fewer choices left. Adding 20
more candidates gives Erik more to pick from. Since specs 029 and 030 the site says "buildings", so some candidates are landmarks
other than houses.

## Behavior
`/dev/shortlist/` shows the 21 existing candidates first, then the 20 below in this order, each with photos from Wikipedia and
Wikimedia Commons, a Pick toggle and a fit rating, like the cards already there. Fit is rated as in spec 016:
★★★ mostly boxes, ★★ needs one new trick, ★ mostly curves or angles.

### Houses
| # | Building | Architect · year · place | Why it would be great in blocks | Fit |
|---|---|---|---|---|
| 1 | Villa Müller | Adolf Loos · 1930 · Prague | A plain white cube outside; inside, rooms at a dozen different levels (the Raumplan) | ★★★ |
| 2 | Maison de Verre | Pierre Chareau · 1932 · Paris | A wall of glass blocks, tucked into a Paris courtyard under an older flat | ★★★ |
| 3 | Schindler House | Rudolph Schindler · 1922 · West Hollywood | Tilt-up concrete slabs with glass slits between them, around open-air courtyards | ★★★ |
| 4 | Margaret Esherick House | Louis Kahn · 1961 · Philadelphia | A tall box with a deep window slot and a fireplace stack, set in trees | ★★★ |
| 5 | Douglas House | Richard Meier · 1973 · Harbor Springs, Michigan | A white house dropped down a wooded bluff above Lake Michigan, entered by a bridge at the roof | ★★★ |
| 6 | Hollyhock House | Frank Lloyd Wright · 1921 · Los Angeles | A Mayan Revival house of courtyards and roof terraces on a hill in East Hollywood | ★★ |
| 7 | Gamble House | Greene & Greene · 1909 · Pasadena | Arts and Crafts timber with deep eaves and sleeping porches. Needs sloped pieces | ★★ |
| 8 | Villa Mairea | Alvar Aalto · 1939 · Noormarkku, Finland | An L of white walls and timber around a pool in a pine forest, with a sod-roofed sauna | ★★ |
| 9 | Taliesin West | Frank Lloyd Wright · 1937 · Scottsdale, Arizona | Desert stone walls under angled timber and canvas roofs. Desert again | ★★ |
| 10 | Can Lis | Jørn Utzon · 1972 · Mallorca | Sandstone pavilions on a cliff, with deep window boxes framing the sea. Reuses the sea scenery | ★★ |
| 11 | Hill House | Charles Rennie Mackintosh · 1904 · Helensburgh, Scotland | Harled walls, steep slate roofs and a round stair tower above the Clyde | ★★ |

### Landmarks
| # | Building | Architect · year · place | Why it would be great in blocks | Fit |
|---|---|---|---|---|
| 12 | Barcelona Pavilion | Mies van der Rohe · 1929 · Barcelona | Free-standing marble and glass walls under a floating roof, with two pools. Small, and pure planes | ★★★ |
| 13 | Habitat 67 | Moshe Safdie · 1967 · Montreal | 354 concrete boxes stacked like toy blocks on the St. Lawrence | ★★★ |
| 14 | Bauhaus Dessau | Walter Gropius · 1926 · Dessau, Germany | The school itself: a pinwheel of white wings and the glass curtain wall of the workshops | ★★★ |
| 15 | Salk Institute | Louis Kahn · 1965 · La Jolla, California | Two concrete wings around a travertine plaza and its water channel, pointing at the Pacific | ★★★ |
| 16 | Unité d'Habitation | Le Corbusier · 1952 · Marseille | A concrete apartment block on pilotis, with coloured balconies and a roof playground | ★★★ |
| 17 | Seagram Building | Mies van der Rohe · 1958 · New York | A bronze and glass tower behind a granite plaza. The first tall one; tests the piece count | ★★★ |
| 18 | Nakagin Capsule Tower | Kisho Kurokawa · 1972 · Tokyo | 140 capsules with round windows plugged into two cores. Demolished in 2022 | ★★ |
| 19 | Guggenheim Museum | Frank Lloyd Wright · 1959 · New York | A white concrete spiral on Fifth Avenue, wider at the top | ★ |
| 20 | Sydney Opera House | Jørn Utzon · 1973 · Sydney | The sail shells over the harbour. Shells in blocks are the showpiece | ★ |

## Acceptance criteria
- **A1** [unit] The shortlist has 41 candidates with unique slugs, and includes each of the 20 above by slug.
- **A2** [unit] `tests/devPages.test.ts` still passes: the page exists, isn't a build input, and covers every coming-soon house.
- **A3** [manual] In `npm run dev`, `/dev/shortlist/` shows all 41 cards. Each new card shows a photo of the right building, or
  for one without Commons photos an image-search link, as for the Koshino House.

## Out of scope
- Home-page cards: none of the 20 becomes a coming-soon card here. Picking one to build is its own spec.
- Changing the dev page itself (layout, filters, a houses/landmarks split).

## Open questions
- [x] Houses and landmarks mixed, or houses only? **The mix** (Erik, 2026-11-09).
- [x] Anything to swap? **No:** the 20 as listed (Erik approved the list as it stands).

## Implementation notes
- **Changed:** `src/dev/shortlist.ts` (the 20 candidates, after the first 21). `tests/devPages.test.ts` expected exactly 21; it now
  expects 41.
- **Tests:** `tests/shortlistMore.test.ts` covers A1; it failed first (21 candidates). `npm run check`: 303 tests pass.
- **Wikipedia titles** were checked against the API before adding them. Maison à Bordeaux (Koolhaas) was in the first draft but has
  no English article, so Hill House replaced it before approval. The Unité points at the general "Unité d'habitation" article,
  whose lead photo is the Marseille block.
- **A3** (Chrome): all 41 cards show. 19 of the 20 new cards lead with a photo of the right building.
  - **Douglas House** is the exception. Its Wikipedia article has no lead photo, and Commons has only two images of Meier's house,
    both drawings. A plain search also found other Douglas Houses, so its Commons search is now limited to the Harbor Springs
    category. The card now leads with an elevation drawing of the right building, not a photo.

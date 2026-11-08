# 003 — The real neighborhood around the house

- **Status:** Done (approved by Erik 2026-11-08: all recommendations)
- **Owner:** Erik
- **Created:** 2026-11-08
- **Commits:** <!-- filled in when Done -->

## Goal
Behind the house (to the north) there is an empty, flat, grey plain, because the procedural city
deliberately leaves out "the hills". In reality the Stahl House sits in the Hollywood Hills, with houses
stepped up steep slopes along Woods Dr, Sunset Plaza Dr and Thrasher Ave, and the Sunset Strip and
West Hollywood spread out below. Replace the grey area, and the made-up near city, with the **real
buildings on the real terrain**, so that the view from the house looks like the actual place.

## Research (2026-11-08)
- **Data source: OpenStreetMap, not Google Maps.** Google's terms don't allow copying its map data
  into another work. OSM is licensed under ODbL, which only requires a "© OpenStreetMap contributors" credit.
- Within 1 km of the house, OSM has **2,924 buildings** (2,251 houses, 302 apartment blocks, plus commercial and retail),
  mostly from the LA County building import. 96% have `height` or `building:levels`, and 96% have `ele` (ground elevation in metres).
- The house itself is in OSM: "Case Study House No. 22" (way with `wikidata=Q2328939`), `ele=242.7`, `height=8.6`.
  Its walls run within 1° of north–south/east–west, and its 79 ft east–west edge matches the model.
- **Correction (found during implementation): the brick model is the real house rotated 180°.**
  In reality the living wing is on the north and cantilevers west, the bedroom wing and street are on the east,
  and the pool is in the south-west corner. In the model, the living wing is on the south and cantilevers east,
  the street wall faces west, and the pool is in the north-east corner. Every feature matches under a 180° turn,
  so **the real data is rotated 180° about the house** (real north = model +z). Fitting the outline that way gives
  IoU 0.82; without the rotation the best fit was 0.42. As a result, the grey area behind the house
  (model −z) is where the real LA basin is.
- Real relief: building ground elevations range from 87 m (on the flats) to 404 m (on the ridge). Sunset Blvd below the house is
  roughly **470 ft lower** than the house, and the ridge behind is roughly **525 ft higher**. Today's backdrop compresses the drop to 48 ft (`CITY_Y`).

## Behavior
- From the default orbit, the area behind the house is filled with hillside houses climbing to a ridge,
  instead of a grey plain.
- Looking south, the slope falls away to the real street pattern of the Sunset Strip and West Hollywood,
  with the procedural LA basin continuing beyond the edge of the real data.
- The neighborhood is there from the first frame. It's scenery, not part of the brick build, and it doesn't
  change the piece count or the timeline.
- Day/Dusk still work: at dusk the neighborhood darkens and its windows/streets light up like the rest of the city.
- A small "© OpenStreetMap contributors" credit is visible on the page.

## Acceptance criteria (draft, finalized once the open questions are answered)
- **A1** [unit] The data file contains the buildings within the chosen radius. Each has a footprint, height and base elevation
  in model coordinates (x east, z south, 1 unit = 1 ft, origin aligned to the model's house).
- **A2** [unit] Alignment: the OSM footprint of the Stahl House, rotated 180° and fitted, overlaps the model's
  roof outline (`ROOF` in `layout.ts`) with IoU ≥ 0.8. The Stahl House and any building overlapping the brick lot are excluded from the backdrop.
- **A3** [unit] The terrain heightfield at the house matches the brick lot level within 2 ft, and decreases toward Sunset Blvd / increases toward the ridge.
- **A4** [unit] No backdrop building intersects the brick model's terrain bounds (`TERRAIN` in `site.ts`).
- **A5** [unit] Brick model unchanged: fingerprint `361f4999`, 17,823 pieces, and build total time unchanged.
- **A6** [unit] The data is loaded from a committed file. The site makes no network requests to OSM or any map service at runtime.
- **A7** [manual] Default orbit: no grey plain is visible behind the house. Hills and houses fill it.
- **A8** [manual] The view toward the real basin (model −z, over the pool) matches the real one in broad strokes:
  the slope drops to the flats, and the Sunset Strip's street grid is recognizable.
- **A9** [manual] Performance: on this Mac, with `?debug`, the fps stays at roughly today's level (±10%) during the build, and the adaptive resolution doesn't drop further.
- **A10** [manual] Dusk mode lights the neighborhood consistently with the city.
- **A11** [manual] The OSM credit is visible and links to openstreetmap.org/copyright.

## Out of scope
- Building the neighborhood out of bricks.
- Exact architectural detail of neighboring houses (roof shapes, windows). They're footprints extruded to their height.
- Re-placing far-away landmarks (downtown, Century City) at their true distance. The procedural basin beyond the data radius stays procedural.
- Fetching data live in the browser.

## Open questions
- [x] **Q1 — Scale of the drop.** Use the true terrain (Sunset Blvd ~470 ft below, ridge ~525 ft above), or keep today's compressed 48 ft drop and squash real elevations to fit?
      *Recommended: true scale.* It's the whole point of the famous view. But the brick hillside then needs a non-brick terrain "skirt" that continues it down to the real ground, and the procedural basin has to drop to match.
- [x] **Q2 — Radius.** How far out should the real data go?
      *Recommended: 1.2 km (~4,000 ft) all around* (~3,500 buildings). That covers the hills behind and the Strip below. Fog hides the edge, where the procedural basin takes over.
- [x] **Q3 — Terrain source.** The `ele` tags only exist where buildings are, so they can't describe the hillsides between them.
      *Recommended:* the open AWS Terrain Tiles dataset (public elevation data, free, attribution: "Mapzen / AWS Terrain Tiles"), sampled once by the data script into a low-res heightfield (~16 ft grid).
- [x] **Q4 — Look.** Plain low-poly blocks like today's city (cheap, and they read as "background"), or blocks with a toy-brick texture (studs on the roofs) so they match the house?
      *Recommended: plain blocks in the existing city palette*, with a faint stud texture only on the nearest ring (< 300 ft) if it looks good. That decision can be made during the manual check.
- [x] **Q5 — Data pipeline.** A one-off script (`scripts/fetch-neighborhood.mjs`) fetches OSM and terrain, converts to model coordinates, and writes a compact committed file (`public/neighborhood.bin` or `.json`, estimated 200–400 KB gzipped).
      Is a committed generated file OK? *Recommended: yes.* It's deterministic, works offline, and doesn't depend on map servers at runtime.

## Known issues
- **KI-3** The brick lot's edges all stop at a flat −48 ft (the old compressed `CITY_Y`). Real ground at the lot edge ranges from
  −154 ft (model north/east, downhill: blends naturally) to +22 ft (model south/west, uphill). On the uphill sides the
  terrain dips by up to ~70 ft over 160 ft to meet the bricks. The real fix is to shape the brick hillside from the
  real terrain, which changes the brick model, so it belongs in its own spec.

## Implementation notes
- **Data:** `scripts/fetch-neighborhood.mjs` (run with `node`; caches downloads in `scripts/.cache`, which is gitignored) writes
  `public/neighborhood.bin`: 734 KB raw, 367 KB gzipped (row-delta terrain, path-delta outlines).
  It contains 4,159 buildings within 1.2 km (5 skipped on the brick lot, 41 outside the radius, plus the Stahl House itself) and 949 roads.
  Terrain comes in two grids: near ±4,200 ft at 20 ft spacing (zoom-15 tiles) and far ±30,000 ft at 250 ft spacing (zoom-11).
  y = 0 is the real ground at the house (235.1 m).
- **Decoding / sampling:** `src/scene/neighborhoodData.ts` is pure and unit-tested. `groundHeight()` blends the real ground into
  the lot edge over 160 ft and the near grid into the far grid over 500 ft. Under the lot, the ground sits 2 ft below the lowest brick course.
- **Rendering:** `src/scene/neighborhood.ts`:
  - terrain meshes with vertex colors (built-up flats, chaparral, bare rock by slope);
  - road ribbons draped 1.2 ft above the ground, widths by road class;
  - buildings as footprints extruded from the lowest ground under them to their real height, in stucco/sand colors with varied roofs;
  - dusk window and street-light points.
- **City:** `src/scene/cityBackdrop.ts` now builds the basin at true scale beyond the real-data radius, out to 24,000 ft.
  It only places blocks on low, flat far terrain, on a 330 ft LA block grid. Downtown is placed on its real bearing,
  pulled in to 16,000 ft. Its old 40,000 ft flat ground plane is gone.
- **Fog:** day 1,500–20,000 ft (was 700–3,800); dusk 1,200–16,000 ft (was 600–3,400).
- **Loading:** the data download runs alongside model generation. The loading screen waits for it; building the meshes takes
  140–375 ms. If the file fails to load, the site still works without the neighborhood.
- **Type-checking:** `tests/` has its own `tsconfig.json` with Node types, so `src/` stays browser-only. `npm run check`/`build` run both.
- **Results:**
  - A1–A4, A6: `tests/neighborhood.test.ts`. A5: `tests/phaseOrder.test.ts` (fingerprint unchanged). 34 tests total.
  - A7 pass: the default orbit and the user's screenshot angle show hills and houses, no grey plain.
  - A8 pass: the view over the pool falls to the Sunset Strip grid, and the city continues into the haze.
  - A9 pass: default camera, before → after: day 51 → 46 fps (−8%), dusk 40 → 45 fps, both at dpr 1.75 (2.45M → 3.18M triangles).
  - A10 pass: at dusk the hillside windows and streets light up along with the basin's carpet of lights.
    The near real streets are sparser than the procedural grid, which is true to the hills.
  - A11 pass: the credit is at the top right and links to openstreetmap.org/copyright.

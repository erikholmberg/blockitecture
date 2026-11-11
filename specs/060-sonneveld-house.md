# 060 — The Sonneveld House

- **Status:** In progress: built and committed, waiting for Erik to close it (approved by Erik 2026-11-11: "can you build 4 more buildings", choosing "the safe four" and to treat that message as
  approval of the specs written for it, as for specs 055–058)
- **Owner:** Erik
- **House:** sonneveld-house
- **Created:** 2026-11-11
- **Commits:** dae0fdb

## Goal
Huis Sonneveld (Brinkman & Van der Vlugt, 1929–33) on the edge of Rotterdam's Museumpark: the best-kept house of the Dutch
Nieuwe Bouwen. A white three-storey block on a steel frame, with a ribbon window to the street, balconies cut into its garden
corner, a roof terrace, and rooms in red, blue and yellow. It makes a Dutch pair with the Rietveld Schröder House. It's built
block by block on its real plot, with the same viewer, and takes a new live card on the home page. On spec 054's list it's ★★★.

## Research (2026-11-11)
**Status today:** a museum house run by the Nieuwe Instituut, owned by Stichting Volkskracht Historische Monumenten since 1997.
Restored 1999–2001. Rijksmonument 46870.

**Sources:**
- **Published dimensions are few:** the main block is 9.85 m deep, and the north side is 16.30 m long with the wing (the
  rotterdamwoont.nl project sheet). Everything else is **scaled** from redrawn plans, elevations and sections, calibrated on
  those two figures (±0.15 m):
  - the main block 15.9 × 9.85 m, three storeys; floors at 3.15 and 6.65 m, the roof deck at 10.0 m, the stair tower to 12.5 m;
  - the two-storey wing off the north-east corner, the kitchen over the garage;
  - the ground floor set back about 1.2 m behind the columns on the street side;
  - the first floor's ribbon window, 15.2 m in six lights; four windows above it;
  - the balconies cut into the south-east corner, and the steel spiral stair from the lower one to the garden.
- **The monument register and the Nieuwe Instituut:** a steel skeleton with concrete floors, white render, the ground floor tiled,
  steel windows; the front door on the north side; the daughters' studio glazed onto the garden; the palette of vermilion red,
  cornflower blue and canary yellow against bronze, brown and grey; Gispen's tubular steel furniture.
- **OSM:** the house is way **255337548** (`wikidata=Q2193739`), its long sides at **339°/159°**. Jongkindstraat runs along the
  west; the drive passes north of the house to the garage.
- **Not documented:** the tiles' and the frames' colours, a room-by-room colour schedule, the east elevation.

## Proposed approach
- **Data:** `scripts/houses/sonneveld-house.mjs`, fitted by OSM's outline; the lot's buildings and streets as lot features;
  `lowlands` scenery, as for the Rietveld Schröder House.
- **The house** at `/sonneveld-house/`:
  - the steel columns on their grid, free under the overhang on the street side;
  - the floors, with the helical main stair by the north end;
  - the white walls, the tiled ground floor, the ribbon window and the windows of each front;
  - the stacked balconies with solid white parapets, and the spiral stair to the garden;
  - the wing with the garage and the kitchen, the staff's balcony, and the screen wall by the wing's roof terrace;
  - the roof terrace with its steel balustrade, the stair tower, its canopy and the chimney;
  - the rooms furnished in the documented colours.
- **The garden:** lawns, clipped hedges, the neighbours as plain blocks.

**Build story** (roles per spec 012):
1. *The garden by the Museumpark* (**site**).
2. *The foundation* (**foundation**).
3. *The ground floor* (**floor**).
4. *The steel frame, the floors & the stair* (**structure**).
5. *The rooms, in red, blue & yellow* (**interior**).
6. *The white walls & the ribbon windows* (**envelope**).
7. *The roof terrace* (**roof**).
8. *The hedges & the trees* (**landscape**).

About 2½ minutes.

## Behavior
- **Home page:** a new live card, with a thumbnail of the street front and the garden corner, and its piece count.
- **Viewer:** `/sonneveld-house/` works like the other houses.
- **Views:** *Overview*; *From Jongkindstraat* (the ribbon window over the columns); *From the garden* (the balconies and the
  spiral stair); *The living room*; *The roof terrace*.

## Acceptance criteria
**House**
- **A1** [unit] The footprint fits OSM's way 255337548 (IoU ≥ 0.75). The main block is 9.85 m deep and the north side 16.30 m
  long (within 2 ft).
- **A2** [unit] Three storeys on a steel frame: twelve columns from the ground to the roof slab; floors at about 3.15 and 6.65 m
  and the roof deck at about 10.0 m (within 1 ft).
- **A3** [unit] The street front: the ground floor's wall stands back behind the columns; the first floor has one ribbon of glass
  at least 48 ft long; the second floor has four separate windows.
- **A4** [unit] The south-east corner is cut away for a balcony on both upper floors, each with a solid parapet; a spiral stair
  stands by the lower one.
- **A5** [unit] The roof is a terrace with a balustrade all round, a stair tower and a chimney above it.
- **A6** [unit] The model invariants hold: no overlaps, inside the grid, deterministic; every phase used; about 2½ minutes.
- **A7** [unit] `tests/buildOrder.test.ts` covers it: phases in role order, nothing floats, nothing dropped.
- **A8** [unit] Every element is marked **[documented]**, **[scaled]** or **[assumed]**, with at least 8 marks in the interior;
  the interior uses red, blue and yellow.

**Site**
- **A9** [unit] The lot terrain meets the real terrain at its edges.
- **A10** [unit] No terrain spikes (the spec 010b check).

**Home and credits**
- **A11** [unit] The home card is live, with the real piece count and its credits.

**Manual** (in `npm run dev`)
- **A12** [manual] The build plays in order: the frame before the rooms, the walls before the roof terrace, the hedges last.
- **A13** [manual] The thumbnail and *From Jongkindstraat* read as the photographs: a white block over a set-back ground floor,
  the ribbon window, the balconies at the garden corner.
- **A14** [manual] The home page shows the new card live, with its thumbnail. The credits page lists the house.
- **A15** [manual] All views, No roof, Walk and the phone controls work.
- **A16** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.

## Out of scope
- The basement under the north part, and the service stair.
- The curves: the quarter-round wall by the front door and the stair tower's rounded end are squared off.

## Open questions
- [x] **Q1: Sources.** Two published dimensions, the rest scaled from redrawn drawings. Each piece is marked.
- [x] **Q2: Colours not documented** (the tiles, the frames): pale cream tiles and silver-grey steel, marked assumed.
- [x] **Q3: Disclaimer.** "Fan tribute. Not affiliated with the Nieuwe Instituut or Stichting Volkskracht Historische Monumenten."

## Implementation notes
- **Files:** `scripts/houses/sonneveld-house.mjs`; `src/houses/sonneveld-house/` (`layout.ts`, `site.ts`, `house.ts`, `interior.ts`,
  `landscape.ts`, `sonneveld.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`, `worker.ts`);
  `sonneveld-house/index.html`; `public/sonneveld-house/`; the registry entry; `PAGES`; the shared test lists.
- **The fit:** OSM way 255337548 at 111° (search 101…121°), IoU 0.974.
- **The model's frame** was fixed by matching the plans' outline to OSM's (the drawings carry no north arrow): the ribbon
  window faces Jongkindstraat, the balconies' corner the garden.
- **What the tests and Chrome changed:**
  - The steel columns on the street line cut the ribbon window into three. They now stand free under the overhang and a stud
    inside the front above it, behind the glass, as in the real house. A3 caught it.
  - The floors' linoleum colours showed as stripes on the fronts at each slab edge; the slabs' edges are white now.
  - The spiral stair's steps each stood on a bar, which read as organ pipes; only every other outer step has one now.
- **The walls and windows are built a plate at a time,** as for the Lovell Beach House, so the bands sit where they're drawn.
- **Tests:** `tests/sonneveld.test.ts` covers A1–A6, A8–A11; A7 is in `tests/buildOrder.test.ts`. `tests/viewsClear.test.ts`
  checks that no view starts inside a neighbouring building.
- **19,925 pieces; 2:33 at 1×.**
- **Manual checks** (a scripted Chrome window, `npm run dev`):
  - **A12 pass:** paused half a second before the roof phase, the walls and windows are up; no balustrade, no hedges.
  - **A13 pass:** the thumbnail shows the white block over the set-back, tiled ground floor, the ribbon window, the balconies
    and the spiral stair at the garden corner.
  - **A14 pass:** the card is live with its thumbnail and 19,925 pieces; the credits page lists the house.
  - **A15 partly checked:** *Overview* opens where it should, and the views' start points are clear of the neighbours (tested).
    No roof, Walk and the phone controls weren't checked.
  - **A16 not measured.**
- **Thumbnail:** `/sonneveld-house/?cam=-28,18,-52,24,14,12&clean&date=2026-06-21`.
- **Claude usage** (spec 018): can't be split out for this building. The four commits for specs 060–063 carry the same
  timestamp, after one stretch of uncommitted work, and the ledger splits usage by commit time. So all of it is recorded on
  the last of them (faf5d9a, spec 063, the Haus am Horn): 144 replies for the four. This building shows none.

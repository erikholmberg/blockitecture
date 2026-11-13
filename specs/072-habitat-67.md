# 072 — Habitat 67

- **Status:** In progress (approved by Erik 2026-11-12: "approved for all, build until done", taking the recommended answers)
- **Owner:** Erik
- **House:** habitat-67
- **Created:** 2026-11-12
- **Commits:** 0f3a04d

## Goal
Moshe Safdie's Habitat 67 (1964–67) on the Cité du Havre in Montreal: the housing built for Expo 67 out of several hundred
identical precast concrete boxes, each lifted by crane and stacked at right angles over the one below. They form three stepped
hills, so every dwelling has the roof of the box below as its garden. Pedestrian streets run through it on every fourth floor, served
by three lift cores. Of all the buildings on the site, it's the one that already looks like a toy: a pile of the same block. The
build would show it going up box by box, as the cranes did. It's built on its real pier beside the St. Lawrence, with the same
viewer, and takes a new live card on the home page. On spec 054's list it's ★★★ (`fit: 3`).

## Research (2026-11-12)
**Status today:** a residential complex at 2600 avenue Pierre-Dupuy. The tenants formed a limited partnership and bought it from the
Canada Mortgage and Housing Corporation in 1985, and that partnership still owns it. Montreal cited it as heritage in 2007, and
Quebec classified it in 2009 (the first modern building to get that). The classification protects the exterior and apartments 1011
and 1012, which used to be Safdie's own. Guided tours run until November 2026 (habitat67.com).

**Sources:**
- **en.wikipedia:**
  - **354** prefabricated concrete forms, each **11.7 × 5.3 × 3 m** (38 ft 5 in × 17 ft 5 in × 9 ft 10 in), "arranged in three
    pyramids";
  - up to **12 residential storeys**, plus a parking level and a building-services level;
  - **3 lifts**; 146 residences today (158 in Safdie's 1974 book), each made of one to eight linked boxes;
  - each residence has at least one garden terrace on the roof of the box below, 20–90 m²;
  - moulded plastic bathrooms and modular kitchens; the concrete is "grey-beige";
  - structural engineer August Komendant; builder Anglin-Norcross.
- **fr.wikipedia:**
  - **345** modules (the only source with this number), "about 5.33 m × 11.73 m", about **3.05 m** high, 70–90 tonnes each,
    cast in a factory on the site;
  - 158 residences of 15 types, on twelve floors;
  - **five sub-groups**: the three largest face avenue Pierre-Dupuy, the other two face the river;
  - the "streets" are about 3.05 m high, and the walkways on the **6th and 10th floors** are closed in by plexiglass walls;
  - prestressed concrete, wooden decking, wooden strip floors, glass guardrails, Formica kitchen doors, fibreglass bathrooms;
  - the heritage dates and the protected apartments 1011–1012.
- **Safdie Architects' project page** (and Divisare, which quotes it):
  - "**365 construction modules** connect to create **158 residences**", from 600 ft² one-bedroom homes to 1,800 ft² four-bedroom
    homes, in fifteen types;
  - "**Three elevator cores** direct vertical circulation"; "Elevators stop at **every fourth floor** to serve pedestrian streets";
  - "The streets are continuous through the project, and access to the dwellings is directly off them";
  - the units, the streets and the cores are all load-bearing, joined by post-tensioning, rods, cables and welding;
  - 238,000 ft² (22,160 m²); covered parking for all tenants.
- **McGill's Canadian Architecture Collection, the Safdie archive** (cac.mcgill.ca/moshesafdie, now on the Wayback Machine):
  - "Each module measures 12 m x 5.33 m x 3 m, or 56 m² (**38 ½ ft long x 17 ½ ft wide x 10 ft high**, totalling 600 ft²)",
    weighing up to 90 tons;
  - "**354** units", "clustered along a spine of **three, hill-shaped structures**";
  - the boxes come in 16 configurations.
- **The Canadian Encyclopedia:** "354 interconnected, concrete boxes", each about 600 ft² and 90 tons, "stepped and stacked in a
  slightly pyramidal structure rising **12 storeys**"; "pedestrian streets on every fourth floor run the length of the complex".
- **OSM** (API 0.6 map call, 2026-11-12):
  - **The building is way 440195613** ("Habitat '67", `building=apartments`, `building:levels=12`, `wikidata=Q1032248`).
  - It's one outline of 206 nodes, about **284 × 89 m** (its smallest bounding box) and 11,950 m². It has no `building:part`s.
  - Its edges run almost all at **4° and 94°** (720 m of edge at 4° ± 1°), so the long axis lies at about **4°/184°**, nearly
    north–south. About 50 m of edges run at 45–50°.
  - Measured across the axis, the outline bulges out three times on the west (avenue Pierre-Dupuy) side, at about −90 m, +20 m
    and +100 m along the axis from its centre (north positive). On the east (river) side it bulges out twice, at about −35 m and
    +35 m. That fits fr.wikipedia's three big groups on the avenue and two on the river.
  - The lot is way 40789099 (`landuse=residential`, "Habitat 67", 65,282 m²).
  - Avenue Pierre-Dupuy (way 1270689191) runs along the west side. Two service roads tagged `tunnel=yes` (ways 440195617 and
    507155289) pass under the building, which would be the parking level.
  - Water: the St. Lawrence's riverbank multipolygon (relation 1775822, `water=river`, 129 members) comes within about 15 m of
    the building's east edge. The Bassin Bickerdike (relation 15586732, `water=harbour`) lies west, beyond the avenue.
  - South along the pier is the Tropiques Nord building (way 47175247, 9 levels). North are footpaths, flowerbeds, a
    playground and pitches.
- **Not obtained:**
  - **A dimensioned plan, sections, or a box-by-box placement drawing.** McGill's digitized Habitat 67 drawings exist
    (`cac_habitat-67_MSG1234-3-01.pdf`), but the file is over 10 MB and couldn't be read here. So the boxes' positions,
    orientations and levels can only be **scaled** from the OSM outline and photographs, and much of the stacking will be
    **[assumed]**.
  - **The total height in metres.** Only "12 storeys" is published.
  - **The number of boxes.** Sources give 354 (en.wikipedia, the McGill archive, the Canadian Encyclopedia), 365 (Safdie
    Architects, probably counting more than the dwelling boxes) and 345 (fr.wikipedia only, likely a slip). See Q1.
  - **Which floors the streets are on.** "Every fourth floor" is documented; only the 6th and 10th are named. The lowest street
    level is assumed.
  - **The layout of Safdie's apartment (1011–1012),** and the plans of the 15 dwelling types.
  - **The river's water level.** It should come from the terrain data (spec 022). No published figure was checked.

## Proposed approach
- **Data:** `scripts/houses/habitat-67.mjs`, fitted to OSM way 440195613 by ID.
  - **Rotation:** pinned from the outline's edge direction (4°/94°), as Trellick's was (spec 061): a search over a rough, stepped
    outline may drift.
  - **Model frame:** x runs along the axis from the south end to the north end, and z runs across it.
  - **Water:** `waterAreas` (spec 022) brings in the St. Lawrence and the Bassin Bickerdike as water at the river's level,
    out to the horizon. Before relying on it, check that the fetch copes with relation 1775822, which is large. The
    `despike` / `seaFloorFt` check from spec 010b covers the terrain tiles over the water.
  - **City:** the procedural city stays on: downtown and the Old Port lie to the north-west, across the basin.
- **The module, at the site's scale (1 stud ≈ 1 ft, a plate = 0.4 ft):**
  - each box is **38 × 18 studs × 25 plates** [documented 38½ × 17½ × 10 ft, rounded to whole studs];
  - 18 studs keeps half-box offsets on whole studs [assumed].
- **Large pieces, as at Trellick:**
  - Brick by brick, a box's shell is roughly 1,500 pieces, or over half a million for the complex: out of reach.
  - So each box is laid like the real precast shell: walls in pieces up to 16 studs long and half a box (12–13 plates) high, and
    floor and roof slabs in a few large plates.
  - That makes each box about 30–40 pieces with its windows, and about **12,000–15,000 pieces** for the 354 boxes.
  - With the cores, the streets, the gardens and the site, the total aims at **≤ 50,000** pieces (Trellick: 41,179, of which
    25,913 are the building; `src/houses/stats.ts`).
- **The complex** at `/habitat-67/`:
  - **The base:** the parking and services level along the pier [scaled from OSM; its height is assumed], with the service road
    running under it.
  - **The boxes:**
    - every box, each one turned along or across the axis;
    - they're grouped as three hills on the avenue's side and two lower groups on the river's side, each rising to at most 12
      boxes [documented counts and storeys];
    - each box's position comes from a hand-laid placement table [scaled from the OSM outline and photographs; mostly assumed].
  - **The three lift cores:** concrete towers rising to the top street [documented count; positions scaled].
  - **The pedestrian streets:**
    - covered walkways on every fourth floor, continuous along the complex [documented];
    - the ones on floors 6 and 10 are closed in by plexiglass walls [documented];
    - the lowest street level is [assumed].
  - **Windows:** each box has a window wall at one end or on its terrace side, in dark frames, with glass guardrails at the
    terraces [documented materials; placement assumed].
  - **The gardens:** every box roof left open is a terrace with a parapet, wooden decking and a planter [documented]. The bigger
    ones get small trees.
  - **The concrete:** a grey-beige [documented].
- **Inside:** one sample dwelling furnished, with blocky stand-ins for the moulded bathroom, the modular kitchen and the wooden
  strip floors [documented elements; layout assumed]. The lift cabs stand in the cores. Every other box stays empty.
- **Engine:** none new. The complex sets the existing `shadowReach` (spec 061) to cover 930 ft of building, at about 480 ft
  [assumed; tuned in the browser], and `text.noun` (spec 059).
- **The lot:** `lotFeatures` (spec 019), from the avenue to the river's edge, along the length of the building plus a margin.
  - The occupancy grid is half a byte a cell. For example, 1,000 × 360 ft × 380 plates comes to about **68 MB**, more than
    Trellick's 49 MB and the largest yet. See Q4.
  - The lot is kept as tight as possible. The river beyond it is drawn as water on the terrain, not as blocks.

**Build story** (roles per spec 012):
1. *The Cité du Havre pier & the river bank* (**site**).
2. *The footings & the parking level* (**foundation**).
3. *The ground-level street & the forecourts* (**floor**).
4. *The boxes, crane-lift by crane-lift, with the lift cores & the streets* (**structure**):
   - the boxes go up group by group and level by level, each landing on what's below it;
   - a box's roof slab goes in here wherever another box sits on it.
5. *A dwelling & the lifts* (**interior**): furnished inside the open boxes.
6. *The windows, the guardrails & the streets' plexiglass* (**envelope**).
7. *The open roofs: terraces & the streets' covers* (**roof**): the roof slabs of boxes with nothing on top, and their parapets
   and decking.
8. *The roof gardens & the pier's trees* (**landscape**).

About 3 minutes. The structure phase, the stacking, is the longest (about 50 s).

## Behavior
- **Home page:** a new live card, with a thumbnail of the complex from across the river (east), and its piece count.
- **Viewer:** `/habitat-67/` works like the other buildings. The numbers panel says "complex" (spec 059; see Q6).
- **Views:**
  - *Overview*: from over the river, the whole length;
  - *From the Old Port side*: north-west, across the basin;
  - *A pedestrian street*: on the 6th floor;
  - *A roof garden*: looking down the stepped terraces;
  - *Under the boxes*: from avenue Pierre-Dupuy, up at the cantilevers.

## Acceptance criteria
**The complex**
- **A1** [unit] The union of the building's footprint fits OSM's way 440195613 (IoU ≥ 0.70: the outline is a stepped, traced
  shape). The complex is 284 m long along its axis (within 10 ft).
- **A2** [unit] Exactly **354** boxes (or the count Q1 settles). Each one:
  - is 38 × 18 studs and 25 plates high;
  - is turned along or across the axis, with no other angles;
  - sits at a whole box level above the base.
- **A3** [unit] At most 12 box levels. The top of the highest box is 12 × 25 plates above the base's top (exact). There are three
  separate peaks on the avenue's side, each reaching at least level 10.
- **A4** [unit] No box hangs free. Every box rests, at least partly, on another box, a street, a core or the base, though it may
  cantilever. Every box's footprint stays inside the lot.
- **A5** [unit] The circulation:
  - three lift cores, each reaching the highest street;
  - streets every fourth floor, among them floors 6 and 10;
  - each street runs at least 80% of the complex's length, and each core meets every street it reaches.
- **A6** [unit] The gardens:
  - every box whose roof is at least half uncovered has a terrace with a parapet or guardrail;
  - at least 146 boxes have a planter (one per documented residence).
- **A7** [unit] The model invariants hold: no overlaps, inside the grid, deterministic; every phase used; about 3 minutes.
- **A8** [unit] `tests/buildOrder.test.ts` covers it: phases in role order, nothing floats, nothing dropped.
- **A9** [unit] Every element is marked **[documented]**, **[scaled]** or **[assumed]**, with at least 5 marks in the interior.
- **A10** [unit] The budget:
  - at most 50,000 pieces in all, and at most 30,000 in the building;
  - the occupancy grid (`nx·nz·ny/2` bytes) is at most 80 MB.

**Site**
- **A11** [unit] The lot terrain meets the real terrain at its edges.
- **A12** [unit] No terrain spikes (the spec 010b check).
- **A13** [unit] The water areas include the St. Lawrence along the complex's river side, within 60 ft of the building's east
  face, at a level below the base's floor. No other house's water areas change.

**Home and credits**
- **A14** [unit] The home card is live, with the real piece count and its credits (OSM; the sources above). The numbers say
  "complex".

**Manual** (in `npm run dev`)
- **A15** [manual] The build plays in order: the base, then the boxes stacking group by group, with the cores and streets rising
  among them; the sample flat furnished inside open boxes; windows and guardrails; the open roofs; the gardens last.
- **A16** [manual] The thumbnail and *Overview* read as the photographs: three stepped hills of boxes on the pier, the river in
  front.
- **A17** [manual] The far ends of the complex are shaded like the middle (the wide shadow box works), with no visibly blocky
  shadow edges at *A roof garden*.
- **A18** [manual] The home page shows the new card live, with its thumbnail. The credits page lists the complex.
- **A19** [manual] All views, No roof, Walk and the phone controls work. Walk can follow a street.
- **A20** [manual] Performance at `?dpr=1.75&debug` stays within Casa Malaparte's numbers (60 fps; spec 031 recorded 3.4M
  triangles). Report the measured fps and triangle count, and the build worker's memory.

## Out of scope
- The interiors of the 15 dwelling types, beyond one sample dwelling; Safdie's own apartment unless Q7 finds its plan.
- Joined apartments, residents' later changes, and the 2017-era restorations (except as Q10 decides).
- The parking level's interior; the other Expo 67 buildings on the Cité du Havre; the Old Port's buildings beyond what the
  neighbourhood data draws.
- The post-tensioning, and the real shapes of the plexiglass street covers (they're blocky stand-ins).
- Seasons and ice on the river.

## Open questions
- [x] **Q1: How many boxes?** Sources give 354 (en.wikipedia, the McGill Safdie archive, the Canadian Encyclopedia), 365 (Safdie
      Architects' own page) and 345 (fr.wikipedia). **Decided: 354.** Three independent sources agree on it, including the
      architect's own archive. Safdie's 365 likely counts construction modules that aren't dwelling boxes, which isn't
      explained anywhere found.
- [x] **Q2: Large pieces** rather than bricks, as at Trellick. **Decided: yes**, at about 30–40 pieces a box: brick by brick
      it would be over half a million pieces. The alternatives:
      - each box as a handful of slab-sized pieces (about 2,000 for the building), which is cheaper but reads less like blocks;
      - only one hill in full and the rest simplified, which loses what the building is.
- [x] **Q3: Where the boxes go.** No placement drawing was obtained. **Decided: a hand-laid table**:
      - scaled from the OSM outline's three-plus-two bulges and from photographs, with the count matched exactly;
      - the visitor gets a faithful Habitat, but not box-for-box;
      - each box marked [scaled] or [assumed];
      - if Erik can get McGill's digitized drawings (`cac_habitat-67_MSG1234-3-01.pdf`), they would replace the guesswork.
      
      **Decided: "reads as Habitat" is good enough to start.**
- [x] **Q4: Memory.** At about 1,000 × 360 ft and 380 plates, the occupancy grid is about 68 MB, the largest yet (Trellick: 49
      MB, never tried on a phone). **Decided: the tightest lot that holds the building and the bank, with the river beyond it
      drawn as terrain water. Cap it at 80 MB (A10) and try a phone.**
      
      A sparse grid in the engine is the alternative, and it would be its own spec.
- [x] **Q5: The river.** **Decided: `waterAreas` (spec 022) at the level the terrain gives**, since the river runs between built
      shores. The fallback, `sea: { levelM }` (spec 045), would flood every low area round the pier.
      
      If the fetch can't handle the St. Lawrence's large relation, it needs a narrower query, which this spec would then
      describe.
- [x] **Q6: The noun.** **Decided: "complex"** ("12,345 in the complex", "not the real complex"). "Housing" reads oddly in
      those sentences.
- [x] **Q7: Which dwelling to furnish?** **Decided: one sample dwelling of two boxes on the 10th floor, with the documented
      fittings and an assumed layout.** If a plan of apartments 1011–1012 turns up, furnish Safdie's own instead.
- [x] **Q8: Disclaimer.** **Decided: "Fan tribute. Not affiliated with Habitat 67 or Safdie Architects."**
- [x] **Q9: Shadows over 930 ft.** **Decided: `shadowReach` of about 480 ft, which is coarser shadows but no engine change,
      checked in A17.** If it looks blocky, a separate spec could fit the shadow box to the view.
- [x] **Q10: Which state?** **Decided: the exterior as it stands today (OSM's outline is today's), with the original 354
      boxes and grown-in gardens**; the joined apartments don't show outside.

## Implementation notes
- **Files:** `scripts/houses/habitat-67.mjs`; `src/houses/habitat-67/` (`layout.ts`, `site.ts`, `house.ts`, `interior.ts`,
  `landscape.ts`, `habitat.ts`, `lotTerrain.ts` and `water.ts` (both generated), `phases.ts`, `definition.ts`, `main.ts`,
  `worker.ts`); `habitat-67/index.html`; `public/habitat-67/` (`neighborhood.bin`, `thumbnail.jpg`); `tests/habitat67.test.ts`;
  the registry entry, `PAGES`, `src/houses/stats.ts` (`npm run stats`) and the shared test lists (`buildOrder`, `cameraGround`,
  `credits`, `houses`, `shortlistBuilt`, `viewsClear`).
- **Engine:** no change. The complex sets the existing `shadowReach` (480 ft) and `text.noun` ("complex").
- **Data:** the fetch handled the St. Lawrence's relation 1775822 without a fix: `waterAreas` (radius 2.5 km) gives 19 areas,
  10,956 points (`water.ts`, 154 KB). The river's level is −4 ft (6.9 m), under the parking level's floor at 0. The ground is
  nearly flat (−4 to +6 ft), and the tiles have no spikes, so neither `despike` nor `seaFloorFt` was needed.
- **The fit:** the rotation is pinned at 86°, from the outline's 4° edges. The fetch's own fit uses the outline's 930 × 295 ft
  bounding box, which only pins the offset, so `houseIoU` in the data reads 0.468. A1 measures the real fit in the test instead:
  the boxes and the parking level against OSM's outline give **IoU 0.733** (the boxes alone 0.731). The complex is 929 ft long,
  against 284 m = 931.8 ft.
- **The boxes:** 354 [Q1]. Their table in `layout.ts` (corner, level and direction for each box) was laid with a scratch helper
  over OSM's outline. The helper set three hills toward the avenue (peaks at about x 155, 545 and 800, each to level 11) and
  two lower groups on the river's side (x 350 and 650). Each box had to stand at least about 35% on what's below it, and the
  levels alternate along and across the axis. The result was then hand-tuned: one box was moved so the complex reaches the
  south end. Level counts from the bottom: 50, 46, 52, 38, 33, 32, 29, 26, 15, 16, 11, 6.
- **Floors and streets:** the parking level counts as the 1st floor, so the streets are on box levels 0, 4 and 8 = floors 2,
  6 and 10 [assumed]. All three follow one zigzag line, 892 ft along the axis (96%).
  - The ground-level street lies on the parking level's roof, with steps up at both ends.
  - The upper two streets have plexiglass walls and covers. Where they cross open air between the hills, 2 × 2 piers carry
    them every 30 ft: 16 under the 6th-floor street and 23 under the 10th [assumed]. The piers stand at the corridor's edge so
    the street below stays walkable.
  - The three cores are 18 × 18 ft. They rise to the top of the 10th-floor street's level, with a doorway onto every street.
- **Pieces:** **39,550** in all: 21,122 in the building (foundation to roof), 14,793 site, 3,635 landscape. That is about 26
  pieces of structure per box. Walls and edges are laid as explicit long runs of up to 16 studs, because the box filler's running
  bond broke them into 1–2 stud bits: the first version had 100,455 pieces. Single slabs use an even course, so long pieces can
  start a run. Each terrace's decking is one piece (the biggest clear rectangle), and each tree crown is a few square layers.
- **Grid memory:** 974 × 384 × 362 cells, half a byte each: **67.7 MB** (64.6 MiB). The lot is x −20…950, z −50…330.
- **Gardens:** 291 boxes have a planter (A6 needs ≥ 146). Every box whose roof is half open has a glass guardrail on its open
  edges.
- **Build:** 182.7 s.
- **Deviations:**
  - *Terraces:* there is no separate concrete parapet. The terrace's edge is the box's own roof ring, laid with the box, with
    the glass guardrail on it (envelope). This way the guardrail never floats before its roof.
  - *Windows:* end walls are glazed wall to wall and floor to ceiling. Long walls get one 8 ft window off-centre, and walls onto
    a street get a door [assumed].
  - *Cores:* they rise above the boxes round them and read as towers from the river; their real height isn't documented.
  - *Changes to other tests:*
    - `tests/trellick.test.ts` A10 (spec 061: "no other house sets `shadowReach`") now also allows Habitat 67, as this spec asks.
    - `tests/shareAccessibility.test.tsx` (spec 037) allowed only `[a-z-]` in slugs; it now allows digits for `habitat-67`.
    - The two `tests/buildOrder.test.ts` A3 checks got a 60 s timeout, because Habitat's millions of cells take more than 5 s.
  - *Test order:* the tests were written alongside the model, not strictly before it. Their first run failed for real reasons
    (the budget at 100k pieces, the card's piece count, the core doorways).
- **Manual checks** (headless Chromium, SwiftShader software rendering, port 5183):
  - **A15 pass:** frames at 30, 50, 91, 104, 142 and 163 s show this order:
    - the parking level and the ground street;
    - the boxes rising level by level, group by group, with the cores and the street bridges;
    - the dwelling's furniture;
    - the windows, guardrails and plexiglass;
    - the decks and covers, with no gardens or trees yet;
    - the gardens last.
  - **A16 pass (my judgement against the described photographs):** the thumbnail and *Overview* show three stepped hills of
    boxes on the pier, the river in front.
  - **A17 pass, software-rendered:** the boxes at both far ends cast and take shadows like those in the middle, and *A roof
    garden* shows no blocky shadow edges. This was not compared on a real GPU.
  - **A18 pass:** the home card is live with its thumbnail and 39,550 pieces. The credits page lists the complex and its sources.
  - **A19 partly:**
    - All five views open where intended.
    - *No roof* opens the sample dwelling: the kitchen and floor are visible.
    - *Walk* climbs the steps and follows the ground-level street for its 290 ft south leg. This was driven through the walker's
      own update with W held, because headless rendering rests between frames.
    - On an emulated iPhone 13 the phone layout renders; touch gestures were not exercised.
  - **A20 not checkable here:** at `?dpr=1.75&debug`, 1280 × 800, the finished complex is **1,536,687 triangles** (Casa Malaparte:
    3.4M) and 23 draw calls. SwiftShader managed about 0.6 fps, which says nothing about a real GPU. The build worker's
    occupancy grid is 67.7 MB; the page's JS heap was about 212 MB at load.
- **Thumbnail:** `/habitat-67/?cam=600,190,800,470,80,140&clean&date=2026-06-21`, made with SwiftShader. Erik may want to remake
  it on a real GPU.
- **Left for Erik:** the real-GPU performance check (A20), touch controls on a real phone, and the memory on a phone (Q4).
  After that, Status can go to `Done`.
- **Usage (spec 018):** not separable per building. The four (specs 072–075) were built in parallel and committed minutes apart, and `npm run usage` gives each message to the next commit, so the Glass House's row holds nearly all of the four's work: 866 replies, 2.4M cache write, 167.1M cache read, 914.7k output. Habitat 67 and the Villa Savoye show about 2 replies each and the Barcelona Pavilion none.

# 017 — Fallingwater

- **Status:** In progress (approved by Erik 2026-11-09: all recommendations; the water arrives at the end). Built; two manual
  checks fall short and two criteria were amended after the HABS drawings (see Implementation notes)
- **Owner:** Erik
- **House:** fallingwater
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The third rendering: Frank Lloyd Wright's Fallingwater (1937, guest wing 1939) at Mill Run, Pennsylvania, built block by block over
Bear Run on its real site, with the same viewer experience as the Stahl and Eames houses. Its home-page card goes from "Coming soon"
to live. It's the first house outside Los Angeles, and the first whose site is defined by water: a stream, a waterfall and a wooded ravine.

## Research (2026-11-09)
**Documented** (Wikipedia, citing the NHL nomination and the Western Pennsylvania Conservancy; to be checked against the HABS drawings,
Library of Congress, main house 3602 / guest house 3812, before modelling):
- **Dates:** designed 1934–36, built April 1936 – November 1937. The guest wing was designed in 1938 and finished in September 1939.
- **Site:** on the north bank of Bear Run, directly over the upper falls. Bear Run is at **1,298 ft** above sea level at the house.
  The upper falls are about **20–30 ft** (sources differ) and the lower falls about **7–10 ft**. The house is oriented roughly
  **south-southeast**; Wright's plan turns it **30° counterclockwise from due south**. The living room runs perpendicular to the stream.
- **Size:** three stories; **5,330 sq ft** in all, of which **2,885 sq ft** is indoors and **2,445 sq ft** is terraces. Ceilings run
  from **6 ft 4 in** to **9 ft**. The chimney rises **30 ft** above the first story. Parapets are **26 in** high.
- **Structure:** reinforced concrete trays cantilevered from the stone core and chimney. The living room sits on four "bolsters"
  (piers) on the rock. The second-floor south terrace reaches past the living room below.
- **Materials and colors:** only two paint colors. The concrete is light ocher ("dead rhododendron") and the steel sash is **Cherokee red**,
  with no vertical mullions at the glass corners. Walls, piers and chimney are local **Pottsville sandstone**, quarried nearby, in
  roughly laid horizontal courses. The floors are waxed flagstone, and the built-ins are black walnut.
- **Rooms:** the first story has the entrance, living room, kitchen and two terraces. The upper stories have four bedrooms (including a study) and
  more terraces: Edgar Sr.'s bedroom on the second floor, Edgar Jr.'s study and bedroom on the third. The east terrace of the second floor is
  the only one with a canopy.
- **Signature details:**
  - **The boulder:** a boulder that was on the site comes up through the living room floor as the hearth.
  - **The hatch:** a glass hatch in the living room opens onto suspended stairs down to a plunge pool in the stream.
  - **The trellises:** concrete trellis beams over the drive, which also serve as a porte-cochère, with beams bent around existing trees.
  - **The bridge:** a **28 ft** bridge over Bear Run to the entrance, with stone planters at each end.
  - **The guest wing:** L-shaped, about **90 ft north** of the house, uphill. It has a carport and servants' quarters, and a curved
    stepped walkway with a concrete canopy leads up to it from the house.

**Real-world data** (Overpass query, 2026-11-09):
- **OSM maps the house:** "Fallingwater" (way 354728127, wikidata Q463179), plus two more buildings 30 m to the NW (354728128, 354728129;
  probably the guest wing and its servants' wing). So placement can use spec 010b's multi-building fit and rotation search, starting at about
  −30°.
- **OSM also maps** the waterfall (node 1620973592), Bear Run as a stream (way 721591249) and the visitor center 170 m to the east.
- **The terrain tiles are 10–30 m DEM**, too coarse to show a 20 ft waterfall or the stream bed. The ravine, the rock ledges, the
  falls and the stream inside the lot will be hand-shaped from photos and blended into the real terrain at the lot's edges.
- **No city in sight:** this is forested ridge country. Pittsburgh is about 60 mi away, beyond the far terrain grid.

**What the engine doesn't have yet:**
- **Water above sea level:** a stream that steps down through the lot, and a waterfall. The only water today is the sea (at sea level)
  and the Stahl House's pool (`'water'` blocks).
- **Forest scenery:** the wider terrain here is hardwood forest. Today, slopes read as chaparral or rock, and flat far ground reads as city.
- **A way to switch off the procedural city.** `downtownDir` is required today.

## Proposed approach
One spec in two steps, like spec 010b. The engine additions are opt-in, and the Stahl and Eames fingerprints must stay unchanged.
1. **Engine:** stream water and falls, forest scenery, and an option to turn off the city.
2. **The house** at `/fallingwater/`: the main house, the walkway and the guest wing on the shaped ravine, its data settings
   (`scripts/houses/fallingwater.mjs`), a thumbnail, and its card set to live.

**Build story** (roles per spec 012; the order is the point of the piece):
1. *Shaping the ravine & Bear Run*: rock ledges, the stream bed and the boulder (**site**).
2. *Bolsters & stone piers on the rock* (**foundation**).
3. *The living-room tray*: the first concrete cantilever, out over the falls (**floor**).
4. *Stone core, chimney & upper terraces*: the stone walls go up with the second- and third-floor trays, the stairs, the walkway and the guest
   wing's frame (**structure**). This is the "cantilever" moment.
5. *Walnut built-ins & furniture* (**interior**).
6. *Cherokee red sash & glass* (**envelope**).
7. *Roofs, trellises & canopy* (**roof**). The pendant lights go in here via `b.hanging()`.
8. *Water, rhododendron & forest*: the stream fills and the falls start, then the planting (**landscape**).

About 4 minutes in all, timed like the other two houses.

## Behavior
- **Home page:** the Fallingwater card is live, with a thumbnail and its piece count, in the same place in the list (first after the live houses).
- **Viewer:** `/fallingwater/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights and phone controls.
- **Views:**
  - *Overview*.
  - *The classic view*: from downstream, below the falls, looking up at the house.
  - *Living room*: the hearth boulder and the hatch.
  - *The bridge*.
  - *Guest wing & walkway*.
- **The water:** the stream flows through the lot and over the falls under the terraces. The falls read as falling water, not as a blue wall.
- **The setting:** the ravine is wooded, and the surrounding ridges read as forest, with no city.

## Acceptance criteria
**Engine**
- **A1** [unit] The Stahl and Eames model fingerprints, piece counts and timeline totals are unchanged.
- **A2** [unit] With the city turned off, `City` creates no buildings. Houses that don't set the option still get it.

**House**
- **A3** [unit] The dimensions match the research within ±2 ft. The research figures may be corrected from HABS before modelling. Checked:
  - the chimney height above the first story;
  - the parapet height;
  - the bridge length;
  - the main house to guest wing distance;
  - the falls height;
  - indoor and terrace areas within ±10%. *Amended: indoor within ±30%; see Implementation notes.*
- **A4** [unit] The model invariants hold as in the baseline: no overlaps, inside the grid, deterministic.
- **A5** [unit] `tests/buildOrder.test.ts` covers Fallingwater. The phases run in role order, no interior piece floats, and nothing is dropped.
- **A6** [unit] Every first-floor and upper terrace extends past its support. At least one tray cantilevers at least 10 ft past its
  nearest pier or wall.
- **A7** [unit] The house uses exactly two paint colors, the ocher on concrete and Cherokee red on the sash, plus the stone, glass, walnut and water.
- **A8** [unit] Each signature detail is in the model and its comment says **[documented]** or **[assumed]**: the hearth boulder
  through the floor, the hatch and stairs to the stream, the bridge, the trellis around a tree, the canopy walkway and the guest wing.

**Site**
- **A9** [unit] The lot terrain meets the real terrain at its edges, and the stream meets the real stream line at both edges.
- **A10** [unit] The model is placed from OSM: the fit to way 354728127 has an IoU ≥ 0.7, and the rotation lies within 10° of the HABS
  sheets' north arrow (45°). *Amended: Wright's "30°" was an early plan; see Implementation notes.*
- **A11** [unit] Stream water sits at 1,298 ft ±10 ft at the house, and the falls run under the living room terraces.
- **A12** [unit] No terrain spikes: the spec 010b check, applied to Fallingwater.

**Manual** (in `npm run dev`)
- **A13** [manual] The build story plays in order; the trays visibly cantilever before the glass goes in; the water arrives at the end.
- **A14** [manual] *The classic view* reads as the famous photograph: the falls below, the horizontal ocher trays, the vertical stone chimney.
- **A15** [manual] The falls read as moving water, and the stream reflects the lights at dusk.
- **A16** [manual] The ridges read as forest, and there is no city on the horizon.
- **A17** [manual] All views, No roof (cutting all three levels and the guest wing), Walk (starting at the bridge) and the phone controls work.
- **A18** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.
- **A19** [manual] The home page shows Fallingwater live, with its thumbnail.

## Out of scope
- The 2002 post-tensioning repairs and the sag: the house is shown as built.
- The visitor center, the Kaufmanns' other buildings and the trails beyond the lot.
- Seasons (autumn colors, snow) and the sound of the falls.
- Wright's other houses on the shortlist.

## Open questions
- [x] **Q1: The guest wing.** It came two years after the house. *Recommended: include it, with its walkway*, built in the same phases as the house,
      at less interior detail (frame, walls, glass and roof, and no furniture). Spec 012 puts the roof last, so it can't follow as its own
      later phases.
- [x] **Q2: Level of detail.** *Recommended: like the Eames House.* That means the full exterior; the living room (the boulder, hatch, built-in
      seating, kitchen); the bedrooms and terraces at a lighter level; and Wright's own furniture, not other designers'. Each piece's comment says
      **[documented]** or **[assumed]**.
- [x] **Q3: Water.** *Recommended: water blocks, a new animated material that shimmers on the stream and runs down the falls, plus a white
      foam band at the foot of each fall.* Particles or real fluid would cost frame rate. *Erik: the water fills in the last phase*, as in the build story.
- [x] **Q4: Forest.** *Recommended: block-built trees* (hemlock, oak, rhododendron) inside the lot, as in the Eames House's eucalyptus row,
      and **a forest color** for the real terrain beyond. The trees should be dense enough to frame the classic view but not hide the house
      from the Overview.
- [x] **Q5: Season.** The famous photographs are in summer and autumn. *Recommended: summer green*, with autumn out of scope.
- [x] **Q6: Disclaimer.** The house and its name belong to the Western Pennsylvania Conservancy. I believe the name is a trademark, but I haven't checked. *Recommended:* "Fan tribute, not
      affiliated with the Western Pennsylvania Conservancy or the Frank Lloyd Wright Foundation", alongside the existing toy-block line.
- [x] **Q7: Sources.** *Recommended: download the HABS sheets* (Library of Congress, public domain) and model from them; where they're
      unclear, use photos and mark the detail **[assumed]**. Let me know if you have a better source, such as a plan book.

## Implementation notes
- **Sources:** HABS PA-5346 (Library of Congress, 2010 Peterson Prize entry), 11 sheets.
  - Read off the 400 dpi scans: 1/4″ = 1′ makes 100 px per ft. The plan sheets register to one another, so the model frame *is* the
    plan frame (x right, z down, ft).
  - The drawings corrected the research:
    - levels: main 0, second 9′-4″, third 17′-5½″, roof ≈ 25′, tower 32′-4½″;
    - the upper falls are about **18 ft** on the south elevation, not 20–30;
    - the stream sits 10.5 ft below the main floor.
  - The guest wing's sheets are a separate HABS record that isn't online, so its footprint comes from OSM and its height is assumed.
- **Placement:**
  - The rotation search gives **49°** (IoU 0.769). The HABS north arrow gives 45°.
  - Wright's "30° from south" is from an early plan. A10 was amended to test against the north arrow instead.
- **Data script** (opt-in additions; the Stahl and Eames settings use none of them):
  - `lotElevationM` pins y = 0 to the main floor (1,308.5 ft).
  - `waterways` bakes OSM's stream line and waterfall into `lotTerrain.ts`.
  - `carveStream` cuts Bear Run into the near grid along OSM's line. The 10–30 m terrain tiles had smoothed the ravine,
    leaving the stream ~25 ft too high.
  - I didn't regenerate the Stahl or Eames data. Their code paths are unchanged.
- **Engine** (opt-in through `scenery`):
  - `city: false` (`wantsCity()`); `forest` terrain colours;
  - `flowingWater`, which makes water shimmer and drift;
  - a new `falls` piece kind that streams downward (`waterTime` uniform).
  - The Stahl and Eames fingerprints and timelines are unchanged (A1: 27,233 / `116d7826` / 228.7 s; 21,657 / `74053447` / 230.7 s).
- **Model:** `src/houses/fallingwater/`, 58,425 pieces generated in ~0.3 s. That's about twice the Eames House: the steep ravine is 28k pieces and the forest 16k.
  - The trays: concrete slabs, flagstone floors, parapet bands.
  - The stone: walls, the chimney through every floor to the tower, a hearth opening with the red kettle.
  - Under the house: four bolsters on the ledge; the hatch stair hung down to a landing over the water.
  - Around the house:
    - the bridge (28 ft span);
    - the second-floor bridge to the hill;
    - the drive's trellis beams, bent around two trees;
    - the stepped walkway with its folded canopy;
    - the guest wing.
  - The water is greedy-merged into one sheet per bed level, so there are no stacked transparent layers.
  - Interior pieces are marked [documented] or [assumed].
- **Tests:**
  - `tests/fallingwater.test.ts` covers A1–A12 plus the home card.
  - Fallingwater is added to `tests/buildOrder.test.ts`'s `DEFINITIONS` (A5).
  - The 007/016 registry tests now list Fallingwater as live, which changes spec 016's A1 list.
  - 135 tests in all.
- **Deviations:**
  - **A3, indoor area:**
    - The model has 3,642 ft² indoors against the NHL's 2,885. The rooms HABS labels already add up to more than 2,885 (the
      living room alone is 48′-0″ × 35′-8″ = 1,713 ft²), so ±10% can't hold for a model faithful to the drawings. The test allows ±30%.
    - Terraces are within 2% (2,496 vs 2,445 ft²).
  - **A3, guest wing distance:** "about 90 ft" isn't checked. The test pins the guest wing to its OSM footprint instead; the OSM centroids
    are ~100 ft apart.
- **Manual checks** (Chrome, 2026-11-09):
  - **A13 pass** (16×):
    - The ravine and an empty stream bed come first.
    - Then the living-room tray out over it.
    - Then the stone core and the upper trays (the cantilevers stand without glass).
    - Then the sash and glass, then the roofs.
    - Last, the water fills and the forest grows.
  - **A14 pass:** the classic view (also the thumbnail) shows the falls below, the stacked ochre trays and the stone tower.
  - **A15 partial:**
    - The falls visibly stream: the frames differ a second apart.
    - At dusk the windows glow, but **the water goes dark, with no visible reflection of the lights**.
  - **A16 pass:** forest on every ridge and no city, from altitude.
  - **A17 partial:**
    - All five views work.
    - Walk starts on the bridge. I didn't verify walking movement: pointer lock can't be driven from the test browser.
    - No roof opens all three levels of the main house, but **not the guest wing**: the engine's cut has one height band, and the guest
      wing is 28 ft up the hill.
    - Phone controls weren't checked: there's no touch device here.
  - **A18 pass:** 60 fps at `?dpr=1.75` (4.5M triangles), as the Stahl House.
  - **A19 pass:** the home card is live, with the thumbnail and 58,425 pieces.
- **Thumbnail:** `/fallingwater/?view=classic&clean&date=2026-06-21`, cropped to 1200 × 675.

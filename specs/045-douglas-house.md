# 045 — The Douglas House, in place of the Vanna Venturi House

- **Status:** In progress (approved by Erik 2026-11-10: "build it", all recommendations. Built; waiting on Erik's checks of
  walking and the phone controls. Committed with Erik's go-ahead, 2026-11-10.)
- **Owner:** Erik
- **House:** douglas-house
- **Created:** 2026-11-10
- **Commits:** 460306d (spec and build)

## Goal
Erik asked to hide the Vanna Venturi House (spec 044) and build the Douglas House in its place: Richard Meier's house for James and
Jean Douglas (1971–73), a white tower of decks and glass dropped down a wooded bluff above Lake Michigan near Harbor Springs,
Michigan, and entered by a bridge at its roof. It has:
- four floors stepping down the bluff, the living room's three-storey glass wall facing the lake;
- the 43 ft bridge from the road to the roof deck;
- ship's railings, a cantilevered stair down the lake side, and steamship smokestacks;
- everything white against the dark cedars and the lake below.

It's the first house on a lake shore and the first that's all white. It's built block by block on its real bluff, with the same
viewer experience as the others, and it takes the fourteenth live card on the home page. On the spec 041 shortlist it's ★★★.

## Hiding the Vanna Venturi House
- Its card leaves the home page and its section leaves the credits page. Its page isn't built or deployed.
- Its code, model, thumbnail and tests stay in the repo, so it can come back with one registry entry. Its page still opens in
  `npm run dev` at `/vanna-venturi-house/`, like the dev-only pages.
- On the shortlist page (spec 042) it's no longer marked built, so it can be picked again.
- Spec 044 becomes **On hold (hidden by spec 045)**.

## Research (2026-11-10)
**Status today:**
- 3490 South Lake Shore Drive (M-119, the "Tunnel of Trees"), Friendship Township, near Harbor Springs. A private home: Michael
  McCarthy and Marcia Myers have owned it since 2007 and live there. The owners welcome visitors informally; a foundation is
  planned "in the future". On the National Register since 3 May 2016 (#16000232).
- Restored from 2008 to about 2023: the bridge re-engineered in steel with the same look, the stair's beams and the chimney rebuilt,
  the steel windows reglazed. "Not altered from its original design and footprint" (the nomination).

**Sources:**
- **No measured drawings are public.** No HABS record. The National Register nomination (NPS) has prose and photographs only, with
  no plans or dimensions. douglashouse.org publishes a roof-level plan and an aerial photograph, with an unreadable scale bar.
- **OSM** has the house as building way **1101848958** (`wikidata=Q3661091`): about 13.9 × 9.5 m (46 × 31 ft), its long side at
  150°/330°, parallel to the shore. The lake side faces about 245° (west-south-west); the shore is about 70 m away. M-119 is
  about 33 m east-north-east (way 17792806).
- **Heights aren't published.** Assumed: about 10 ft a floor, so about 50 ft from the lowest floor to the roof deck, which matches
  Tod Williams's "you feel like you're 1,000 feet up, but it's only 50".

**Documented** (the nomination, douglashouse.org, Michigan Modern, Architectural Record):
- **Roof level (4th floor):** the entry from the bridge on the east, near the north end. A large deck facing south, west and
  north, and a small open deck above it.
- **3rd floor:** three bedrooms, a bath, and a built-in desk overlooking the living room.
- **2nd floor:** the double-height living room facing the lake, a wet bar, the main bedroom.
- **1st floor:** the dining room, the kitchen, the laundry, a bedroom with its bath.
- **Below:** a service level on 28 timber piles, hidden by a white skirt that curves round at the north and south ends.
- **Inside:** one quarter-round stair in the north-east corner, painted pink (the only colour that isn't white).
- **The lake side:** a grid of glass three storeys high. A cantilevered stair runs down outside to the 2nd floor's landing,
  with ladders and steps on toward the beach path. A semicircular landing at the south-west.
- **The road side:** mostly blank white wall, a few black-framed windows, the rounded north-east corner.
- **Materials:** white-painted vertical redwood boards; weathered redwood decking; white steel tube railings ("ship's railings").
- **The chimney:** a white brick base with metal smokestacks on the lake side. Sources disagree on how many: one (Architectural
  Record), two (the roof plan), three (the nomination).

**The site:**
- **Terrain:** the bluff drops about 130 ft from the road (about 216 m) to the beach (about 176 m) over about 100 m; the house's
  footprint is at about 203 m. A gravel parking spot for two cars by the bridge.
- **Trees:** "the original blanket of cedars, conifers and other indigenous trees".
- **The lake:** Lake Michigan at about 176 m.
- **Scenery:** `forest` (spec 017) for the bluff; no city.

**What the engine doesn't have yet:**
- **A lake at its real height.** `sea` draws water at sea level, and Lake Michigan is 176 m up. Spec 022's water areas draw OSM's
  lakes at their own level, but Lake Michigan is one enormous OSM relation and may be too big to fetch (Q4).
- **Curves:** the rounded corner, the skirt's ends, the quarter-round stair and the semicircular landing are stepped stud by
  stud, as at the Koshino House's studio, so nothing new is needed there.

## Proposed approach
- **Data:** `scripts/houses/douglas-house.mjs`, fitted by OSM way 1101848958; `scenery: { forest: true, city: false, … }` plus
  the lake (Q4).
- **The house** at `/douglas-house/`:
  - the piles and the skirt, four floors, the bridge from the road, the roof decks, the glass wall, the outside stair, the
    railings, the smokestacks;
  - a thumbnail; the fourteenth live card on the home page; its credits entry (spec 021).
- **White in several shades** so the planes read against each other: the walls, the railings, the skirt, the deck's redwood.

**Build story** (roles per spec 012):
1. *The bluff above Lake Michigan* (**site**).
2. *The piles and the skirt* (**foundation**).
3. *The four floors* (**floor**).
4. *The frame, the bridge and the stair tower* (**structure**).
5. *The rooms* (**interior**).
6. *The white walls, the glass wall and the outside stair* (**envelope**).
7. *The roof deck and the smokestacks* (**roof**).
8. *The railings and the cedars* (**landscape**).

About 2½ minutes.

## Behavior
- **Home page:** fourteen cards: the Douglas House live in the Vanna Venturi House's place, with a thumbnail and its piece count.
- **Viewer:** `/douglas-house/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights,
  phone controls, Share (spec 037), neighbours out of the way (spec 038).
- **Views:**
  - *Overview*.
  - *From the beach*: up the bluff at the white house against the trees, the classic photograph.
  - *The bridge*: from the road along the bridge to the roof deck.
  - *The living room*: inside, with No roof, out through the glass wall.
  - *Over the lake*: from the roof deck west over Lake Michigan.

## Acceptance criteria
**Hiding the Vanna Venturi House**
- **A1** [unit] `vanna-venturi-house` isn't in the house registry or in `PAGES`; its model still builds and passes its own model
  tests (spec 044's A2–A10).
- **A2** [unit] Spec 042's built list no longer includes it.

**Engine**
- **A3** [unit] The other houses' models, piece counts and timelines are unchanged.

**House**
- **A4** [unit] The footprint matches OSM's way 1101848958 (IoU ≥ 0.75), about 46 × 31 ft.
- **A5** [unit] Four floors stepping down the bluff, and the bridge from the road's side reaches the roof deck level.
- **A6** [unit] The lake side's glass wall is at least three storeys high.
- **A7** [unit] The model invariants hold: no overlaps, inside the grid, deterministic.
- **A8** [unit] `tests/buildOrder.test.ts` covers the house: phases in role order, nothing floats, nothing dropped.
- **A9** [unit] Every element is marked **[documented]** or **[assumed]**; at least 8 interior pieces are marked.

**Site**
- **A10** [unit] The lot terrain meets the real terrain at its edges.
- **A11** [unit] No terrain spikes (the spec 010b check).
- **A12** [unit] The lake is drawn as water at its own level, about 176 m, along the real shore.

**Manual** (in `npm run dev`)
- **A13** [manual] The build plays in order; the roof deck and the smokestacks go on before the railings and the cedars.
- **A14** [manual] *From the beach* reads as the famous photographs: a white tower of decks against the dark trees, the glass wall.
- **A15** [manual] The home page shows fourteen cards with the Douglas House live and no Vanna Venturi House; the credits page lists
  it and not the Vanna Venturi House. `/vanna-venturi-house/` still opens in `npm run dev`.
- **A16** [manual] All views, No roof, Walk and the phone controls work.
- **A17** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.

## Out of scope
- The tennis court and the shed across the road.
- Deleting the Vanna Venturi House's code (see Q1).

## Open questions
- [x] **Q1: Hide or delete the Vanna Venturi House?** *Recommended: hide*, as above: its code and tests stay, it comes back with one
      registry entry. The alternative is deleting it, and spec 044 becomes Superseded.
- [x] **Q2: Sources.** *Recommended: OSM's outline and the published roof plan, with heights from the nomination's floor count and
      the photographs.* Each piece is marked documented or assumed. It'll be less exact than the HABS houses, and the spec will
      say so.
- [x] **Q3: The smokestacks.** Sources say one, two or three. *Recommended: two*, as the roof plan draws them.
- [x] **Q4: The lake.** *Recommended: try spec 022's water areas first* (OSM's lake, at its own level). If Lake Michigan's relation
      is too big to fetch, add an opt-in water level to the `sea` scenery, so it can draw a lake at 176 m. That's a small engine
      change; the other houses don't use it (A3 checks they're unchanged).
- [x] **Q5: A private home.** The owners live there. This is a fan model from the published plan, the nomination and photographs,
      with a generic interior in white. *Recommended: go ahead*, with the disclaimer in Q6.
- [x] **Q6: Disclaimer.** *Recommended:* "Fan tribute in a generic toy-block style. Not affiliated with the house's owners, Meier Partners
      (formerly Richard Meier & Partners Architects) or the LEGO Group." The credits page picks it up. (Checked: the firm became
      Meier Partners in June 2021; Architect Magazine, meierpartners.com.)
- [x] **Q7: Timing.** *Recommended: about 2½ minutes.*

## Implementation notes
**Hiding the Vanna Venturi House**
- Removed from `HOUSES` (`src/houses/index.ts`) and `PAGES` (`vite.config.ts`), and from the shared lists in
  `tests/credits.test.tsx`, `tests/houses.test.ts`, `tests/buildOrder.test.ts` and spec 042's `tests/shortlistBuilt.test.ts`. Its
  code, page HTML, thumbnail, data and `tests/vannaVenturi.test.ts` stay; that file's home-card test became 045-A1's check that
  it's hidden and still builds (28,994 pieces). `tests/cameraGround.test.ts` still checks its views. Spec 044 is On hold.
- **A15 pass** (Chrome): the home page has fourteen cards, the Douglas House last and no Vanna Venturi House; the credits page
  lists the Douglas House and not the Vanna Venturi House; `/vanna-venturi-house/` still opens in `npm run dev`.

**The engine: a lake at its own level (Q4)**
- OSM's water areas (spec 022) weren't tried: Lake Michigan is one enormous relation, and Overpass was already turning queries
  away. The fallback was used instead:
  - `scenery.sea` takes `true` (sea level, as before) or `{ levelM }` (`src/engine/house.ts`). One pure helper,
    `seaLevelY()` in `src/engine/scene/neighborhoodData.ts`, now gives the water's height to both its users
    (`scene/neighborhood.ts` and `controls/ground.ts`). For `true` it gives exactly what they computed before.
  - The terrain tiles have no lake bed: Lake Michigan reads as flat ground at about 177.0 m. The engine only draws open water
    connected to samples at least 15 ft under the surface (spec 011), so the data script gained an opt-in `lake: { levelM,
    floorFt }` that lowers every sample under the surface to a bed below it (`scripts/fetch-neighborhood.mjs`). The house uses
    `lake: { levelM: 177.2, floorFt: 20 }` and `scenery.sea: { levelM: 177.2 }`. The shoreline comes from the terrain itself.
  - A3 pins every other house's model and timeline; they're unchanged, and `seaLevelY(true, …)` matches the old formula.

**The house**
- **Files:** `scripts/houses/douglas-house.mjs`; `src/houses/douglas-house/` (`layout.ts`, `site.ts`, `house.ts`, `interior.ts`,
  `landscape.ts`, `douglasHouse.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`); `douglas-house/index.html`;
  `public/douglas-house/` (`neighborhood.bin`, `thumbnail.jpg`); the registry entry; `PAGES`.
- **The fit:** OSM way 1101848958 (by its Wikidata tag) at −60° (the search over −80…−50°), IoU 0.967.
- **Heights:** y = 0 is the 1st floor, pinned at 201.9 m so the bridge's road end (43 ft up the bluff) is level with the 4th
  floor, 30 ft up. The tiles smooth the bluff (they read the house's centre about 10 ft above the USGS's 203 m), so round the
  house the ground is shaped to a steady slope: 29 ft at the bridge's end, 12 ft at the road wall, −10 ft at the lake wall,
  then down at 1 in 2, easing into the real bluff within 30 ft. Under the house it's cut to the service level.
- **The lot** runs from the parking (x −40…130, z −80…135) down to the top of the beach. M-119 lies just beyond it, about 108 ft
  up: OSM has only sparse points along it, none inside the lot, so the neighbourhood renderer draws it outside. An earlier lot
  reached out over the lake at its west end, where the ground is the lowered bed; A12 caught it.
- **The plan** follows the nomination floor by floor; the rooms' sizes are assumed. The quarter-round stair fills the rounded
  north-east corner, in twelve pink wedge steps a floor. Each flight stands on its own floor, with the slab cut away only over
  the flight below's top step (the first try hung each flight in an open stairwell; `tests/buildOrder.test.ts` A3 caught it).
- **Smokestacks (Q3):** two, steel, on a white brick base by the north end of the lake side.
- **Walk** starts in the dining room facing the glass. The walker places itself on the ground below 4 ft, so a start on the
  parking (29 ft up) put it inside the hill, and the screen went black. That was caught in Chrome and fixed.
- **Tests:** `tests/douglas.test.ts` covers A1, A3–A7 and A9–A12; A8 is in `tests/buildOrder.test.ts`. A2 is spec 042's
  `tests/shortlistBuilt.test.ts`, whose list now has the Douglas House and not the Vanna Venturi House.
  - **Not tests-first,** as for specs 043 and 044. The tests found real faults: the floating stair flights, trees above the
    occupancy grid, the lot reaching into the lake.
  - `npm run check`: 342 tests pass.
- **33,445 pieces; 2:36 at 1×.** The first build had 59,951, mostly cedars; the trees were thinned and the lot narrowed.
- **Manual checks** (Chrome, `npm run dev`):
  - **A13 pass:** at 16×, the frame and the bridge, the white walls and the glass wall, the roof deck and the smokestacks, then
    the railings and the cedars. The lake runs along a sandy shore at the bluff's foot.
  - **A14 pass:** *From the beach* shows the white tower of decks against the dark trees, the glass wall, the outside stair.
  - **A16 partly checked:** every view opens where it should; *Over the lake* looks out from the deck to the horizon. No roof
    shows the living room floor, the outside stair cut with it. Walk mode starts in the dining room. **Walking itself and the
    phone controls weren't checked:** walking needs pointer lock, and the phone controls need a phone.
  - **A17 not measured.** 33,445 pieces is more than the Stahl House's 27,233 and less than Casa Malaparte's 59,758; the frame
    rate wasn't measured.
- **Thumbnail:** `/douglas-house/?cam=66,6,112,22,20,14&clean&date=2026-06-21`, cropped to 1200 × 675: the house from the bluff
  below, the glass wall and the outside stair.
- **Claude usage** (spec 018): can't be split out for this house. The commits for specs 041–046 all landed within
  minutes of each other on 2026-11-10, after one long stretch of uncommitted work, and the ledger splits usage by commit
  time. So nearly all of it went to the first of them (08fd10a, the close-out of specs 034–040, counted as shared). The
  house's own figure (4 replies, 0.3%) is only the last few minutes before its commit, and understates it badly.


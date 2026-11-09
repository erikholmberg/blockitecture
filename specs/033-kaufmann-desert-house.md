# 033 — The Kaufmann Desert House

- **Status:** In progress (approved by Erik 2026-11-09: "build it", all recommendations. Built; waiting on Erik's acceptance of the
  manual checks that couldn't be run here: walking itself and the phone controls)
- **Owner:** Erik
- **House:** kaufmann-desert-house
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The eighth rendering: Richard Neutra's winter house for Edgar J. Kaufmann (1946), the same client as Fallingwater, at 470 West Vista
Chino in Palm Springs. Low pinwheeling wings of stone, glass and thin flat roofs on the desert floor, with the San Jacinto Mountains
rising straight behind it. It's built block by block on its real site, with the same viewer experience as the others. Its home-page
card, the last "Coming soon", goes live, so all eight cards are live.

## Research (2026-11-09)
**Sources:**
- **OSM maps the house:** "Kaufmann Desert House", way 566015553 (wikidata Q6378695), 543 m², a 25-point outline: the pinwheel.
  So the usual Wikidata fit and rotation search (spec 010b) place it with no new option.
  - Two small buildings on the lot: way 566015555 (114 m²), probably the pool house, and way 566015554 (25 m²), a shed.
- **No measured drawings online.** There's no HABS survey, and the 1990s restoration drawings (Marmol Radziner) aren't published.
  Neutra's plan is widely published in books and articles as a diagram, not dimensioned.
- **Photographs:**
  - The Library of Congress has a public-domain colour photograph: "The Kaufmann House, Palm Springs, California", LCCN 2013631255.
  - Commons has a few more under "Kaufman Desert House".
- **So, as for the Schröder House and Casa Malaparte:**
  - OSM's outline and published facts [documented];
  - the published plan diagram and the photographs for which wing is which, the heights and the details [assumed].

**Documented** (Wikipedia, NRHP and the restoration literature; to be checked against the photographs):
- **Dates:** built 1946, for Edgar J. Kaufmann. Restored 1993–98 by Marmol Radziner.
- **The house:**
  - A **pinwheel plan**: wings reach out in four directions from the central living and dining room. They are the guest wing,
    the master bedroom wing, the service wing (kitchen, staff) and the covered entry walk.
  - **Thin, flat roofs** with deep overhangs, and walls of floor-to-ceiling glass that slide open.
  - Walls of local **buff stone**, laid in rough horizontal courses.
  - The **gloriette:** an open-air room on the roof above the living room, with a fireplace. Tall, vertical aluminium **louvres**
    that pivot shield it from the wind and sand.
- **The site:**
  - The **pool** in front of the master wing, with a lawn around it;
  - beyond, the desert garden: sand, boulders, palms, cactus and creosote;
  - behind, the San Jacinto Mountains rising about 10,000 ft from the valley floor.

**The site in the engine:**
- **Terrain:** the real tiles cover the flat valley and the mountains, so there's no need for hand-shaping like Casa Malaparte.
- **Neighbourhood:** the houses of the neighbourhood (Vista Las Palmas / Old Las Palmas) come from OSM as usual. The procedural city
  stays off, since Palm Springs is a low town on the same flat ground as the house.

**What the engine doesn't have yet:**
- **Desert colours for the real terrain.**
  - Today the terrain is coloured for the Hollywood Hills (chaparral and dry grass), hardwood forest (Fallingwater) or Dutch lowland
    (Schröder).
  - Palm Springs needs a desert: sand and pale gravel on the flats, with a scatter of green where the town is watered (gardens, golf
    courses), and bare brown-grey rock on the mountains.
  - That's a small opt-in scenery option, `desert`, like `lowlands` (spec 019). The other houses don't use it.

## Proposed approach
- **Engine:** `scenery.desert`, an opt-in desert palette for the real terrain, with its colours in a pure function so it can be tested.
- **Data:** `scripts/houses/kaufmann-desert-house.mjs`, fitted to way 566015553 by its Wikidata tag.
- **The house** at `/kaufmann-desert-house/`:
  - the house, the gloriette and its louvres;
  - the pool and the pool house;
  - the desert garden;
  - a thumbnail; its card set to live; its credits entry (spec 021).

**Build story** (roles per spec 012):
1. *The desert floor* (**site**).
2. *The foundations and the pool's shell* (**foundation**).
3. *The terraces and floors* (**floor**).
4. *The steel posts, the stone walls and the gloriette's deck* (**structure**).
5. *The living room, the bedrooms and Neutra's built-ins* (**interior**).
6. *The sliding glass walls and the gloriette's louvres* (**envelope**).
7. *The thin flat roofs and their deep overhangs* (**roof**).
8. *The pool, the lawn, palms, boulders and cactus* (**landscape**).

About 3 minutes, like the Farnsworth House: it's a one-storey house plus the gloriette.

## Behavior
- **Home page:** the Kaufmann card is live, with a thumbnail and its piece count. All eight cards are live.
- **Viewer:** `/kaufmann-desert-house/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights,
  phone controls.
- **Views:**
  - *Overview*.
  - *Across the pool*: the famous view over the pool to the house, with the mountains behind (best at dusk).
  - *The gloriette*: on the roof, between the louvres, looking out over the desert.
  - *The mountains*: the low house against the San Jacinto Mountains.
  - *The entry walk*.

## Acceptance criteria
**Engine**
- **A1** [unit] The other seven houses' models, piece counts and timelines are unchanged.
- **A2** [unit] `desert` is opt-in. Only the Kaufmann definition sets it. Its colours are sandy on flat ground and rock-coloured on
  steep slopes, and contain no greens of the chaparral, forest or lowland palettes except the watered patches.

**House**
- **A3** [unit] The footprint matches OSM's way 566015553 (IoU ≥ 0.75).
- **A4** [unit] The pinwheel: four wings reach out from the living room in four different directions. The gloriette sits on the
  roof above the living room, and its louvres stand vertical and evenly spaced.
- **A5** [unit] The model invariants hold: no overlaps, inside the grid, deterministic.
- **A6** [unit] `tests/buildOrder.test.ts` covers the house: phases in role order, nothing floats, nothing dropped.
- **A7** [unit] Every element is marked **[documented]** or **[assumed]**; at least 8 interior pieces are marked.

**Site**
- **A8** [unit] The lot terrain meets the real terrain at its edges.
- **A9** [unit] No terrain spikes (the spec 010b check).

**Manual** (in `npm run dev`)
- **A10** [manual] The build plays in order; the gloriette's louvres and the roofs go on last, before the garden.
- **A11** [manual] At dusk, *Across the pool* reads as the famous photographs: the glowing house low behind the pool, the dark
  mountains above it.
- **A12** [manual] The desert reads as desert: sand-coloured flats, the town's green gardens, bare mountains.
- **A13** [manual] All views, No roof, Walk and the phone controls work.
- **A14** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.
- **A15** [manual] The home page shows all eight houses live; the credits page lists this one.

## Out of scope
- The 2008 auction and the house's other later owners (it's shown restored, as today).
- Interiors beyond the main rooms.
- Any new "Coming soon" card: with this house, the grid of eight is complete.

## Open questions
- [x] **Q1: Sources.** No measured drawings are online. *Recommended: OSM's outline, the published plan diagram and the photographs*,
      marking assumed dimensions [assumed], as for the Schröder House and Casa Malaparte. If you have a book with plans (for example
      Hines's *Richard Neutra and the Search for Modern Architecture*), I'd use it.
- [x] **Q2: Level of detail.** *Recommended: like the other houses.* That means:
      - the full exterior: the stone walls, the glass, the thin roofs and the gloriette with its louvres;
      - the pool, the pool house and the garden;
      - inside, the living room with its fireplace, the bedrooms and Neutra's built-in furniture;
      - each piece marked documented or assumed.
- [x] **Q3: The desert colours.** *Recommended: a new opt-in `desert` palette* (A2), so the valley reads as desert, not as the
      Hollywood Hills' chaparral. The alternative is to reuse the existing default palette, with no engine change, but the valley
      would read green-brown.
- [x] **Q4: Disclaimer.** *Recommended:* "Fan tribute in a generic toy-block style. Not affiliated with the owners of the Kaufmann
      House, the Neutra estate or the LEGO Group." The credits page picks it up.
- [x] **Q5: Timing.** *Recommended: about 3 minutes*, like the Farnsworth House and Casa Malaparte.

## Implementation notes
- **Data** (`scripts/houses/kaufmann-desert-house.mjs`):
  - Fitted to OSM's "Kaufmann Desert House" (Q6378695) by its Wikidata tag. Its walls run within a degree of north–south, so the
    rotation is **0°** (search −6…6°), IoU **0.915**. Model frame: x east, z south, in ft.
  - `exportSelf` and `lotFeatures` are on. The lot's two other OSM buildings (ways 566015554 and 566015555) are built as plain
    low white blocks.
  - y = 0 is the floor, at the terrain's reading for the house (188.1 m). The real ground falls about 25 ft across the lot to the
    south-east. It's levelled into a pad under the house and the pool's terrace, and blends back to the real ground within 24 ft
    of the lot's edges.
- **Engine:** `scenery.desert`, opt-in (A2): `desertColor()` in `src/engine/scene/neighborhood.ts`, a pure function.
  - sand and pale gravel on the flats;
  - green patches where the town is watered;
  - tan gravel on the alluvial fans;
  - bare brown-grey rock on the steep slopes;
  - pines above 5,000 ft on the San Jacinto Mountains.
- **Model:** `src/houses/kaufmann-desert-house/`, 20,326 pieces.
  - The wings come straight from OSM's outline:
    - the living room at the centre;
    - the master wing to the east, by the pool (OSM way 1459410894);
    - a covered walk north to the guest wing;
    - the service wing to the west;
    - the garage to the south, with the covered entry beside it.

    Which wing holds which rooms is [assumed].
  - Walls stand 3 ft in from the roofs' edges (the deep overhangs). Stone where a wall faces west or north, sliding glass with white
    steel posts where it faces south or east [assumed]. The service wing and the garage are stone all round, with a window band.
  - The gloriette on the living room's roof: tall aluminium louvres on its west and north sides, a stone fireplace, a thin canopy on
    posts, and an outside stair up from the court.
  - Thin flat roofs with white fascias; the pool with a white coping; a lawn around it; palms, boulders, barrel cactus and creosote.
- **Tests:** `tests/kaufmann.test.ts` covers A1–A9 plus the home card.
  - A1 pins all seven other models; Casa Malaparte's is 59,758 / `c84ca868`.
  - The house is added to `tests/buildOrder.test.ts`, `tests/credits.test.tsx` and `tests/cameraGround.test.ts`. Casa Malaparte
    is added to the last one too: it wasn't in it.
  - The registry tests now expect all eight live and none coming soon.
  - The tests that rebuild every other house got a 60-second timeout: with eight houses, they passed 5 s under the full suite's load.
  - 226 tests in all.
  - Deviation from the flow: the tests were written after the model, not before.
- **Manual checks** (Chrome, 2026-11-09):
  - **A10 pass** (16×): the desert, the pool's shell and the floors, the walls and posts with the gloriette's deck, the furniture,
    the glass and louvres, then the roofs, then the garden.
  - **A11 pass:** at dusk, *Across the pool* shows the lit house low behind the pool with the dark mountains above, like the
    famous photographs. Its daytime version is the thumbnail.
  - **A12 pass:** sand-coloured flats with the town's green patches; bare brown mountains rising to the west.
  - **A13 partial:**
    - All views and No roof work.
    - The gloriette view first sat inside the gloriette, and the camera clamp (spec 028) lifted it above the canopy. It now looks
      in from the open roof beside it, through to the louvres.
    - Walk starts on the lawn beyond the pool, facing the house.
    - **Not checked:** walking itself, and the phone controls.
  - **A14 pass:** 60 fps at `?dpr=1.75` (1.06M triangles).
  - **A15 pass:** the home page shows all eight houses live, and the credits page has this one's section.
- **Thumbnail:** `/kaufmann-desert-house/?view=pool&clean&date=2026-06-21`, cropped to 1200 × 675.

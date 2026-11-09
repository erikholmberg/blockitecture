# 033 — The Kaufmann Desert House

- **Status:** Approved (approved by Erik 2026-11-09: "build it", all recommendations)
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
Filled in after approval.

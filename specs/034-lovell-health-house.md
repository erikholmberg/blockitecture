# 034 — The Lovell Health House

- **Status:** In progress (approved by Erik 2026-11-09: "build it", all recommendations. Built; waiting on Erik's acceptance of the
  manual checks that couldn't be run here: walking itself and the phone controls)
- **Owner:** Erik
- **House:** lovell-health-house
- **Created:** 2026-11-09
- **Commits:** 9931b82 (spec), 96f4200 (build)

## Goal
The ninth rendering: Richard Neutra's house for Philip and Leah Lovell (1927–29) at 4616 Dundee Drive, Los Feliz. It was the first
steel-framed house in America: a light steel frame, raised in about 40 hours, stepping down a canyon slope in three storeys of white
ribbon windows and balconies hung from the roof. It's built block by block on its real hillside, with the same viewer experience as
the others, and it gets a new live card on the home page.

## Research (2026-11-09)
**Sources:**
- **HABS CA-1936** (Library of Congress record ca0236, 1969): nine measured drawings and ten data pages.
  - The title sheet and an aerial isometric from the south-west.
  - **Plans of all three levels:** the swimming pool floor, the living room floor and the third floor.
  - **Elevations:** south and east; north and west.
  - Two more sheets, probably sections and details; to be read.
  - So the house can be modelled from measured drawings, like the Stahl, Eames and Farnsworth houses.
- **OSM maps the house:** way 426658941, tagged with Wikidata Q6692217 (an LA County outline, 1929, 7.6 m). The usual Wikidata fit
  places it. A second 1929 outline 33 m away (way 426659348) may be part of the house or a neighbour; to be checked against HABS.

**Documented** (HABS data pages, NRHP, Wikipedia; to be checked against the drawings):
- Built 1927–29 for Philip Lovell, the health columnist, who had earlier commissioned Schindler's Lovell Beach House.
- **The structure:** a light, prefabricated steel frame, its parts trucked up and raised in about 40 hours. Walls of gunite (concrete
  sprayed onto expanded metal), floors of concrete.
- **The house steps down the slope** from the street at the top:
  - the entry and the bedrooms with their sleeping porches on the top floor;
  - the living floor below;
  - the swimming pool at the bottom, in a U-shaped concrete cradle under the house.
- **Long bands of steel-framed windows**, and **balconies hung from the roof frame on steel rods**.
- **Colours:** white walls, with the steel window frames painted dark.

**The site:** a steep canyon slope in the Hollywood Hills, about 500 m from the Ennis House. The engine already draws this terrain:
the chaparral, the city below and its lights at dusk (specs 003–005, 010b, 025).

**What the engine doesn't have yet:** nothing. The rods for the hung balconies are `bar` pieces, and they go in with the roof
(`b.hanging`, spec 012).

## Proposed approach
- **Data:** `scripts/houses/lovell-health-house.mjs`, fitted by its Wikidata tag.
- **The house** at `/lovell-health-house/`:
  - the house, its three levels and the pool;
  - a thumbnail; a new live card on the home page; its credits entry (spec 021).

**Build story** (roles per spec 012):
1. *The canyon slope* (**site**).
2. *The concrete footings and the pool's cradle* (**foundation**).
3. *The concrete floors, level by level* (**floor**).
4. *The steel frame, the famous 40 hours* (**structure**): the columns and beams rise, bare.
5. *The rooms* (**interior**): the living room, the library, the bedrooms, Neutra's built-ins.
6. *The gunite walls and the ribbon windows* (**envelope**).
7. *The roofs, and the balconies hung from them* (**roof**).
8. *The pool's water, the chaparral and the gardens* (**landscape**).

About 4 minutes, like the larger houses: it's three storeys.

## Behavior
- **Home page:** a ninth card, live, with a thumbnail and its piece count.
- **Viewer:** `/lovell-health-house/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights,
  phone controls.
- **Views:**
  - *Overview*.
  - *From below*: the famous view up from the canyon at the stacked white bands and balconies.
  - *The pool*: under the house.
  - *The street*: the entry at the top.
  - *Over the city*: the house with Los Angeles below, best at dusk.

## Acceptance criteria
**Engine**
- **A1** [unit] The other houses' models, piece counts and timelines are unchanged.

**House**
- **A2** [unit] The footprint matches OSM's way 426658941 (IoU ≥ 0.75), and the main dimensions and the three floor levels match
  HABS CA-1936 within ±1 ft.
- **A3** [unit] The balconies hang from the roof: each one is carried by steel rods running up to the roof frame, and goes in with the
  roof.
- **A4** [unit] The frame comes before the walls: no wall or window piece starts before every column and beam beside it.
- **A5** [unit] The model invariants hold: no overlaps, inside the grid, deterministic.
- **A6** [unit] `tests/buildOrder.test.ts` covers the house: phases in role order, nothing floats, nothing dropped.
- **A7** [unit] Every element is marked **[documented]** or **[assumed]**; at least 8 interior pieces are marked.

**Site**
- **A8** [unit] The lot terrain meets the real terrain at its edges.
- **A9** [unit] No terrain spikes (the spec 010b check).

**Manual** (in `npm run dev`)
- **A10** [manual] The build plays in order: the bare steel frame stands complete before any wall goes on.
- **A11** [manual] *From below* reads as the famous photographs: white bands and balconies stacked down the slope.
- **A12** [manual] At dusk, *Over the city* shows the house against the lights of Los Angeles.
- **A13** [manual] All views, No roof, Walk and the phone controls work.
- **A14** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.
- **A15** [manual] The home page shows the new card live, with its thumbnail; the credits page lists it.

## Out of scope
- Later alterations; the house is shown as HABS drew it.
- Interiors beyond the main rooms.

## Open questions
- [x] **Q1: Sources.** *Recommended: HABS CA-1936's measured drawings for the plan, levels and elevations*, photographs for the
      colours and furniture, each piece marked documented or assumed.
- [x] **Q2: Level of detail.** *Recommended: like the other houses*: the frame, the walls and windows, the hung balconies, the pool
      under the house and the main rooms with Neutra's built-ins.
- [x] **Q3: The second 1929 outline** (way 426659348, 33 m away). *Recommended: decide from HABS.* If its site plan shows it as part
      of the house (the garage, say), build it; otherwise the renderer draws it as a neighbour.
- [x] **Q4: Disclaimer.** *Recommended:* "Fan tribute in a generic toy-block style. Not affiliated with the owners of the Lovell
      House, the Neutra estate or the LEGO Group." The credits page picks it up.
- [x] **Q5: Timing.** *Recommended: about 4 minutes*, like the larger houses.

## Implementation notes
- **HABS CA-1936, read** (the Library of Congress's master scans, 1/8″ = 1′-0″ at 50 px/ft):
  - **Sheets 3–5:** the plans of the pool floor, the living room floor and the third floor. They're registered on the sheets, so one
    frame serves all three. The note gives the **5′-1½″ unit grid** the frame stands on.
  - **Sheet 8:** the levels. The living room floor is 781′-5″, the third floor 792′, the top of the parapet 804′ and the pool's south
    walk 769′.
  - The levels are true elevations above sea level, so `lotElevationM` pins y = 0 to 781′-5″ (238.2 m).
  - **Sheet 9:** the **garage-studio** (Q3). The second 1929 outline (way 426659348) is taken to be it [assumed: its date and HABS's
    sheet 9]. It's drawn as one of the lot's plain blocks, not modelled in detail.
- **Data:** fitted to way 426658941 by its Wikidata tag at **−24°**, IoU **0.862**. With `lotFeatures` on, the lot's four other OSM
  buildings, the garage-studio among them, are plain white blocks clipped to the lot.
- **Model:** `src/houses/lovell-health-house/`, 23,428 pieces.
  - **The site:** two pads cut into the real slope, the pool floor's walk (−12′-5″) and the living floor's level against the hill.
  - **The pool:** in its concrete cradle, half under the house.
  - **The frame:** steel columns on the unit grid round every storey, and white stilts over the pool floor. In the window bands
    the steel shows dark; above and below them it's white, wrapped in gunite.
  - **The envelope:** white bands with ribbon windows on each storey, and the entrance terrace out to the street on columns.
  - **The roofs:** the main roof with its parapet, the low roofs over the guest wing and library, and the south and north balconies.
    The balconies are hung from the roof frame on steel rods (`bar` pieces) and go in with the roof (A3).
  - **The interior:** the built-ins HABS draws (the kitchen, the living room's long seat, the fireplace, the stair, the library's
    shelves) and the rooms' furniture.
  - **Outside:** live oaks and chaparral on the slope.
- **Tests:**
  - `tests/lovell.test.ts` covers A1–A9 plus the home card. A1 pins all eight other models; the Kaufmann house's is
    20,326 / `7d7eade4`.
  - The house is added to `tests/buildOrder.test.ts`, `tests/credits.test.tsx` and `tests/cameraGround.test.ts`.
  - Spec 020's test, which expected exactly eight cards, now checks for at least eight and the Kaufmann house in eighth place.
  - 239 tests in all.
  - Deviation from the flow: the tests were written after the model, not before.
- **Manual checks** (Chrome, 2026-11-09):
  - **A10 pass** (16×): the slope, the cradle and the floors, then the bare frame standing complete, then the furniture, the white
    bands and windows, the roofs and hung balconies, the garden.
  - **A11 pass:** *From below* shows the three white bands and ribbon windows stepping out over the pool. It's the thumbnail.
    It first sat too low in the canyon, behind the slope, and then behind a neighbour's house; it now looks across the canyon.
  - **A12 pass:** at dusk, *Over the city* shows the house with the city's lights beyond (60 fps, 1.26M triangles).
  - **A13 partial:**
    - All views and No roof work.
    - Walk starts on the patio under the entrance terrace, facing the library.
    - **Not checked:** walking itself, and the phone controls.
  - **A14 pass:** 60 fps at `?dpr=1.75`.
  - **A15 pass:** the home page shows the ninth card live with its thumbnail, and the credits page has its section.
- **Claude usage** (spec 018): 46 replies; 61.8k output, 102.4k cache-write and 16.7M cache-read tokens; 3.0% of all tokens so far.
- **Thumbnail:** `/lovell-health-house/?view=below&clean&date=2026-06-21`, cropped to 1200 × 675.

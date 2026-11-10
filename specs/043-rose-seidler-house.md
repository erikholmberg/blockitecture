# 043 — The Rose Seidler House

- **Status:** In progress (approved by Erik 2026-11-10: "build it", all recommendations. Built; waiting on Erik's checks of
  walking and the phone controls. Not committed: Erik commits.)
- **Owner:** Erik
- **House:** rose-seidler-house
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The thirteenth rendering: Harry Seidler's first building, the house he designed for his parents Rose and Max Seidler (1948–50) in
Wahroonga, on Sydney's northern edge. It has:
- a "hollowed-out square" of white walls and glass, raised on stone and thin posts above a steep bush slope;
- an open sun deck cut into the middle of the square;
- a ramp from the deck down to the garden;
- Seidler's own mural, in red, yellow, blue and black, on the deck wall.

It's the first house in the Southern Hemisphere and in Australia. It's built block by block on its real bush hillside, with the same
viewer experience as the others, and it gets a new live card on the home page. The shortlist (`src/dev/shortlist.ts`) rates it ★★★:
"Bauhaus in the Australian bush, with a ramp and a colorful mural wall."

## Research (2026-11-09)
**Status today:**
- 71 Clissold Road, Wahroonga NSW. Seidler gave the house and its contents to the state in 1988. It's a house museum run by Museums
  of History NSW, open on Sundays, with the 1950 furniture and colours restored. State Heritage Register SHR 00261.

**Sources:**
- **No dimensioned drawings are online.** Seidler's office publishes the floor plan without dimensions (seidler.net.au). The
  original plans are at the State Library of NSW; the conservation plans (2001) and the guidebook (1989) aren't online.
- **OSM** has the house as building way **570787191** (about 15 × 12.6 m, so 49 × 41 ft, turned about 7° from north), with a thin
  strip about 1.5 m off its north face that's probably the ramp. Its area matches the published "200 m²". The estate is way
  437908691 (about 1 ha). The neighbouring Rose House and Marcus Seidler House on the estate aren't mapped.
- **Heights aren't documented.** Assumed: about 9–10 ft floor to floor, about 20 ft overall, the main floor about 8–10 ft above the
  ground on the downhill north and east sides (Julian Rose House next door has its main floor 3.3 m up).

**Documented** (Museums of History NSW, the heritage listing, Seidler's office, the C20 Society):
- **Materials:** bush sandstone, reinforced concrete, timber and glass. White render outside.
- **Below:** stone walls form three sides of the double garage. A recreation area on the north sits partly under the ramp and sun
  deck, with a caretaker's flat at its end. The entry foyer has the stair up.
- **The main floor:** a "bi-nuclear" plan. The living wing and the sleeping wing are joined by a playroom (closed off by a curtain)
  and the open deck between them. Living, dining, playroom and three bedrooms have full-height glass. The kitchen, laundry and main
  bedroom have windows from waist height up.
- **The roof:** flat, with a skylight.
- **Colours:** red front and kitchen doors; a yellow playroom door and curtains; a blue wall, curtains and bedspreads (secondary
  source, quoting the Historic Houses Trust). The mural is a "code" to the house's colours. Its exact colours aren't listed;
  photos show free shapes in red, yellow, blue, black and white.
- **Inside:** Eames, Saarinen and Hardoy chairs; Seidler's own dining table, coffee table, sofa and built-in cabinets; a
  freestanding stone fireplace; the 1950 kitchen with its servery hatch.

**The site:**
- **Terrain:** a rocky, steep bush block falling north to the valleys of Ku-ring-gai Chase. The house sits in a clearing, with a
  few gum trees kept on purpose. Sandstone retaining walls and Rose's rockeries; a terraced citrus orchard.
- **Scenery:** the engine's `forest` scenery (spec 017) for the bush, as at the Koshino House. No city: the far ground is national
  park.
- **The sun:** the first house south of the equator. The sun math is general, so noon sun comes from the north; a test checks it.

**What the engine doesn't have yet:** nothing. It's boxes, posts, glass and a ramp, all of which other houses have.

## Proposed approach
- **Data:** `scripts/houses/rose-seidler-house.mjs`, fitted by OSM way 570787191; `scenery: { forest: true, city: false }`.
- **The house** at `/rose-seidler-house/`:
  - the stone base and garage, the posts, the main floor's square with its deck, the ramp, the mural wall;
  - a thumbnail; a new live card on the home page; its credits entry (spec 021).
- **The mural:** painted in pieces, as flat coloured tiles on the deck wall, in red, yellow, blue, black and white, shaped after
  the photographs.

**Build story** (roles per spec 012):
1. *The bush slope* (**site**).
2. *The sandstone base and the garage* (**foundation**).
3. *The main floor's slab and the deck* (**floor**).
4. *The posts and the frame* (**structure**).
5. *The rooms* (**interior**): the Eames and Saarinen chairs, Seidler's table and sofa, the fireplace, the kitchen.
6. *The white walls, the glass and the mural* (**envelope**).
7. *The flat roof and its skylight* (**roof**).
8. *The ramp's rails, the rockeries and the gum trees* (**landscape**).

About 2½ minutes.

## Behavior
- **Home page:** a thirteenth card, live, with a thumbnail and its piece count.
- **Viewer:** `/rose-seidler-house/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights,
  phone controls, Share (spec 037), neighbours out of the way (spec 038).
- **Views:**
  - *Overview*.
  - *From the garden*: up from the north-east lawn at the raised house and the ramp, as in Max Dupain's photographs.
  - *The deck and the mural*: from the living room across the deck to the mural.
  - *The living room*: inside, with No roof.
  - *Over the bush*: from above the house north over Ku-ring-gai Chase.

## Acceptance criteria
**Engine**
- **A1** [unit] The other houses' models, piece counts and timelines are unchanged.
- **A2** [unit] At the house's site, the noon sun on its date stands in the northern half of the sky (the first house south of the
  equator).

**House**
- **A3** [unit] The footprint matches OSM's way 570787191 (IoU ≥ 0.75), about 49 × 41 ft.
- **A4** [unit] The main floor is a square with an open deck inside its outline, open to the sky, and a ramp runs from the deck to
  the ground.
- **A5** [unit] The mural wall carries pieces of at least four colours: red, yellow, blue and black.
- **A6** [unit] The model invariants hold: no overlaps, inside the grid, deterministic.
- **A7** [unit] `tests/buildOrder.test.ts` covers the house: phases in role order, nothing floats, nothing dropped.
- **A8** [unit] Every element is marked **[documented]** or **[assumed]**; at least 8 interior pieces are marked.

**Site**
- **A9** [unit] The lot terrain meets the real terrain at its edges.
- **A10** [unit] No terrain spikes (the spec 010b check).

**Manual** (in `npm run dev`)
- **A11** [manual] The build plays in order; the flat roof goes on before the gum trees.
- **A12** [manual] *From the garden* reads as the famous photographs: a white box held up over the slope, the ramp in front.
- **A13** [manual] The bush reads right, with no city in the distance; the sun comes from the north.
- **A14** [manual] All views, No roof, Walk and the phone controls work.
- **A15** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.
- **A16** [manual] The home page shows the new card live, with its thumbnail; the credits page lists it.

## Out of scope
- The Rose House and the Marcus Seidler House on the same estate (not in OSM, and not the famous one).
- The pool that was planned and never built.

## Open questions
- [x] **Q1: Which version?** *Recommended: the house as it is today*, which is the 1950 house restored by the museum, with its
      furniture and colours.
- [x] **Q2: Sources.** *Recommended: Seidler's published plan, scaled to OSM's outline*, with heights from the photographs. Each
      piece is marked documented or assumed. It'll be less exact than the HABS houses, and the spec will say so.
- [x] **Q3: Disclaimer.** *Recommended:* "Fan tribute in a generic toy-block style. Not affiliated with Museums of History NSW,
      Harry Seidler & Associates or the LEGO Group." The credits page picks it up.
- [x] **Q4: Timing.** *Recommended: about 2½ minutes* (a small house).

## Implementation notes
- **Files:** `scripts/houses/rose-seidler-house.mjs`; `src/houses/rose-seidler-house/` (`layout.ts`, `site.ts`, `house.ts`,
  `interior.ts`, `landscape.ts`, `roseSeidlerHouse.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`);
  `rose-seidler-house/index.html`; `public/rose-seidler-house/` (`neighborhood.bin`, `thumbnail.jpg`); the registry entry in
  `src/houses/index.ts`; `PAGES` in `vite.config.ts`.
- **The fit:** OSM way 570787191 at a rotation of 186° (the search over 165…195°), IoU 0.865. OSM's outline also shows the ramp as
  a strip off the north face, running east from the deck past the box's corner, which is where the model puts it.
- **Heights:** y = 0 is the main floor, pinned at 168.3 m (`lotElevationM`), level with the ground at the uphill south-west
  corner. The ground falls about 14 ft to the north-east corner. The lower level (the garage, the foyer, the recreation area, the
  caretaker's flat) is cut in at −8.4 ft, on the terrain's 3-plate courses, and the garden terrace is level with it.
- **The plan** is assumed in its sizes, from the published plan's arrangement: the living wing east, the sleeping wing west, the
  playroom between them on the south, the deck open on the north, the mural on the sleeping wing's wall facing the deck. The
  ensuite has the shoulder-high window on the west face, and opens off the main bedroom.
- **The ramp** steps down one plate every 1–2 ft from the landing to the garden, on thin steel posts. The top rail follows the
  steps.
- **Tests:** `tests/roseSeidler.test.ts` covers A1–A6 and A8–A10; A7 is in `tests/buildOrder.test.ts`. The new house was added to
  the lists in `tests/buildOrder.test.ts`, `tests/cameraGround.test.ts`, `tests/credits.test.tsx` and `tests/houses.test.ts`.
  Spec 042's A1 test lists the built shortlist houses, so it now includes this one (and the spec says so).
  - **Not tests-first:** the model was written before `tests/roseSeidler.test.ts`, against the process. The tests were then run
    and found a real fault (the sofa's back floating, caught by `tests/buildOrder.test.ts` A3) and a fault in the A4 test itself.
  - `npm run check`: 318 tests pass.
- **19,226 pieces; 2:42 at 1×.**
- **Manual checks** (Chrome, `npm run dev`):
  - **A11 pass:** at 16×, the frame and the ramp, then the rooms inside the open frame, then the flat roof, and the gum trees last.
  - **A12 pass:** *From the garden* shows the white box held up on thin posts over the sandstone garage, the ramp in front.
  - **A13 pass:** bush all round, no city; the far terrain is the valley falling north. The sun comes from the north (A2 tests it).
  - **A14 partly checked:** every view opens where it should. No roof shows the rooms. Walk mode starts on the deck.
    **Walking itself and the phone controls weren't checked:** walking needs pointer lock, and the phone controls need a phone.
  - **A15 not measured.** The house has 19,226 pieces, fewer than the Stahl House's 27,233, but its frame rate wasn't measured.
  - **A16 pass:** the thirteenth card is live, with its thumbnail and piece count; the credits page has its section.
- **Thumbnail:** `/rose-seidler-house/?cam=-34,18,70,22,0,24&clean&date=2026-06-21`, cropped to 1200 × 675: the house from the
  north-east, above the garden, with the ramp in front.
- **Claude usage** (spec 018): to be recorded after Erik commits (`npm run usage`).


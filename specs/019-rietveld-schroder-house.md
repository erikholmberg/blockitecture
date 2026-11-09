# 019 — The Rietveld Schröder House

- **Status:** Done (approved by Erik 2026-11-09: "looks good", all recommendations. Closed by Erik 2026-11-09, accepting
  the two manual checks that couldn't be run here: walking itself and the phone controls)
- **Owner:** Erik
- **House:** rietveld-schroder-house
- **Created:** 2026-11-09
- **Commits:** ef1defa (spec), 2daf310 (work in progress), 8c58571 (build)

## Goal
The fourth rendering: Gerrit Rietveld's house for Truus Schröder-Schräder (1924) at Prins Hendriklaan 50, Utrecht, built block by block
at the end of its real row of houses, with the same viewer experience as the other three. Its home-page card goes from "Coming soon" to
live. It's the smallest house so far, the first outside the US, and the one that already looks most like a toy: De Stijl planes and lines
in white, greys, black and the primary colours.

## Research (2026-11-09)
**Documented** (Wikipedia, citing the Centraal Museum and the UNESCO listing):
- **Dates and status:** built 1924 for Truus Schröder-Schräder and her three children. A Rijksmonument since 1976 and a UNESCO World
  Heritage Site since 2000. Restored by Bertus Mulder; today a museum run by the Centraal Museum.
- **Site:** two storeys, at the end of a terrace, sharing one wall with the last house in the row. Since the 1960s it has faced a
  motorway (the Waterlinieweg).
- **Construction:** concrete only for the foundations and the balconies. Brick and plaster walls; wooden window frames, doors and floors on
  wooden beams; steel girders.
- **Colours:** the facades are white and shades of grey, the window and door frames black, and some linear elements (posts, beams,
  railings) are in the primary colours.
- **Ground floor:** a kitchen and three sitting/bedrooms around a central stair. There's also a garage.
- **Upper floor:** one open zone around the stair, plus a separate toilet and bathroom. Sliding and revolving panels divide it into three
  bedrooms, a bathroom and a living room.
- **Windows:** they open only at 90° to the wall.

**Real-world data** (Overpass query, 2026-11-09):
- **OSM maps the house:** "Rietveld-Schröderhuis" (way 191005050, wikidata Q914231, 2 levels). The footprint is **about 10 × 7.6 m,
  74 m²**, with its axes at bearings of about 29.5° and 119.5°.
- **The neighbour:** it shares nodes with way 261140744 (BAG, built 1921), the last house of the row.
- **Placement:** spec 010b's fit and rotation search will place it.
- **Terrain:** Utrecht is flat, a few metres above sea level. Unlike the other three sites, the terrain tiles need no repair.
- **Surroundings:** dense housing in every direction (the real OSM buildings within 1,200 m), and the motorway in front.

**What I couldn't get:**
- **Measured drawings.** The building drawings are in the Rietveld Schröder Archive (Centraal Museum; the 1924 permit drawing is
  inventory 004 A 001, at 1:100). They're online at Het Geheugen, but the site blocks automated access, and there's no HABS-style survey.
- **So the plan:** OSM's footprint (documented), Wikipedia's facts, and published photographs and floor-plan diagrams for the layout and
  heights. The storey heights, the depth of each plane and the colour of each element would be marked **[assumed]**.

**What the engine doesn't have yet:**
- **A lowland setting.** On flat ground, today's terrain colours read as Los Angeles (dry grass) or as forest (spec 017). Utrecht needs
  green, built-up lowland.
- **The procedural city.** It fills any flat far ground, which here is everywhere. The real OSM buildings already surround the house.
- **No engine change needed:** a small house on flat ground fits the voxel builder as it is.

## Proposed approach
- **Engine:** one opt-in scenery option for lowland terrain colours. Everything else reuses specs 010–017.
- **The house** at `/rietveld-schroder-house/`:
  - the house, its garden and the attached neighbour (Q3);
  - its data settings (`scripts/houses/rietveld-schroder-house.mjs`);
  - a thumbnail, and its card set to live.

**Build story** (roles per spec 012):
1. *The garden plot* (**site**).
2. *Concrete foundations* (**foundation**).
3. *The ground floor* (**floor**).
4. *Steel, the upper floor and the concrete balconies* (**structure**).
5. *The sliding partitions and Rietveld's furniture* (**interior**).
6. *Planes, lines and glass*: the white and grey wall planes, the black frames, the coloured posts and rails (**envelope**).
7. *The roof and the stair's roof light* (**roof**).
8. *The garden, the hedge and the street* (**landscape**).

About 3 minutes in all, since this house is much smaller than the others (Q6).

## Behavior
- **Home page:** the Schröder card is live, with a thumbnail and its piece count. It moves up among the live houses.
- **Viewer:** `/rietveld-schroder-house/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights
  and phone controls.
- **Views:**
  - *Overview*.
  - *The corner*: the famous view of the south-east corner from the street.
  - *Upper floor*: the open living zone.
  - *Along the row*: the house at the end of the terrace.
  - *From the motorway side*.
- **The setting:** flat, green, built-up Utrecht around it, with no procedural city.

## Acceptance criteria
**Engine**
- **A1** [unit] The Stahl, Eames and Fallingwater model fingerprints, piece counts and timeline totals are unchanged.
- **A2** [unit] Lowland colours are opt-in: the scenery option exists, and houses that don't set it are unaffected (covered by A1 and a
  colour test of the terrain function).

**House**
- **A3** [unit] The footprint matches OSM's way 191005050 within ±1 ft on each side, and the fit has an IoU ≥ 0.8.
- **A4** [unit] The model invariants hold: no overlaps, inside the grid, deterministic.
- **A5** [unit] `tests/buildOrder.test.ts` covers the house: the phases run in role order, nothing floats, and nothing is dropped.
- **A6** [unit] The palette is De Stijl's: wall planes only in white and greys, frames black, and the posts, beams and rails in red, blue
  and yellow. No other paint colours on the house.
- **A7** [unit] It shares its wall with the neighbour: the house's party wall and the neighbour's touch along their shared OSM edge.
- **A8** [unit] Every element's comment says **[documented]** or **[assumed]**; at least 8 interior pieces are marked.

**Site**
- **A9** [unit] The lot terrain meets the real terrain at its edges.
- **A10** [unit] The model is placed from OSM: the rotation lies within 5° of the footprint's axis (29.5° / 119.5°).

**Manual** (in `npm run dev`)
- **A11** [manual] The build plays in order; the coloured lines and the planes go on after the frame and the furniture.
- **A12** [manual] *The corner* reads as the famous photographs: the white and grey planes, the black frames, the coloured posts and
  the corner window.
- **A13** [manual] The surroundings read as Dutch lowland: green, flat, built-up, with no procedural city.
- **A14** [manual] All views, No roof, Walk and the phone controls work.
- **A15** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.
- **A16** [manual] The home page shows the house live, with its thumbnail.

## Out of scope
- The house as it stood in 1924, with open fields in front. It's shown in today's setting.
- An elevated motorway: OSM's roads stay ribbons on the ground (Q4).
- The sliding partitions as a working control; they're shown in one position.
- The other three picks from spec 016.

## Open questions
- [x] **Q1: Sources.** No measured drawings are reachable online. *Recommended: OSM's footprint plus photographs and published plan
      diagrams*, with every unsourced dimension marked [assumed]. If you have a source with real measurements (for example Weston's
      *Plans, Sections and Elevations*, pp. 48–49, or the Centraal Museum's restoration publications), I'd use it instead.
- [x] **Q2: Level of detail.** *Recommended: like the other houses.* That means the full exterior; the ground floor's rooms; and the upper
      floor with its sliding partitions open as the living zone. Plus Rietveld's furniture documented in the house, as recognisable
      block approximations: the Red and Blue chair, the hanging lamp, the table and others, each confirmed against a photo. As with the
      Eames House, product names appear in the code only, not on screen.
- [x] **Q3: The row.** *Recommended: build the attached neighbour, and the rest of its terrace from OSM, as plain blocks* (brick and
      tiled roofs), so the house reads "at the end of an ordinary row". Otherwise the neighbourhood renderer would show them as grey
      extrusions or leave a gap.
- [x] **Q4: The motorway.** *Recommended: leave it as OSM's road ribbon.* The real road is raised here; building it would be a large
      structure that hides the house from the east.
- [x] **Q5: City and terrain.** *Recommended:* no procedural city, plus the new lowland colours (green grass, grey-brown for built-up
      ground), with the real OSM buildings as the surroundings.
- [x] **Q6: Timing.** *Recommended: about 3 minutes*, shorter than the others' 4, as the house is about a quarter of their size.
- [x] **Q7: Disclaimer.** *Recommended:* "Fan tribute in a generic toy-block style. Not affiliated with the Centraal Museum, the Rietveld
      Schröderhuis, Cassina or the LEGO Group." Cassina makes the licensed Rietveld furniture.

## Implementation notes
- **Sources:**
  - **Footprint:** OSM way 191005050 (10 × 7.6 m). The rotation search fits it with IoU 0.964 at **−28°**, against the footprint's own axis of −29.5°.
  - **The shared wall:** way 261140744 shares the house's 10 m west edge. That's the house's depth, so the front faces SSW.
  - **Everything else:** read from photographs on Wikimedia Commons ("Casa Rietveld Schröder" 01–10, CC BY 3.0; RCE 20339897 and
    20323960, CC BY-SA 4.0). That covers the colours and where they go, the planes, the balconies and the roof light.
    Heights are assumed: 9.6 ft to the upper floor and 19.2 ft to the roof.
- **Data script** (opt-in `lotFeatures`; the other houses don't use it):
  - It writes the OSM buildings and streets whose centre is in the lot to `lotTerrain.ts`, and the renderer leaves those buildings
    out. Without the option, the old rule stands: any building that overlaps the lot is left out.
  - The lot's edges cross three larger apartment blocks; the renderer still draws them.
- **Engine:** `scenery.lowlands` with a pure `lowlandColor()` (greens, with grey-brown for built-up ground). The other houses don't use it.
  A1 pins all three other models: Stahl 27,233 / `116d7826`, Eames 21,657 / `74053447`, Fallingwater 58,425 / `af03e3c7`.
- **Model:** `src/houses/rietveld-schroder-house/`, 10,668 pieces; the house itself is about 1,300 of them.
  - The row: four row houses and three sheds from their OSM outlines, as hollow brick shells. White-framed windows on the ±z faces,
    three storeys under a stepped tile mansard [assumed]. Built solid at first they came to 52k pieces; as shells, 8.4k.
  - The neighbour is built right up to the party wall (A7).
  - Streets are painted into the top course of the ground: carriageway, pavement, garden.
  - The upper floor's painted floor, the stowed sliding panels, the Red and Blue chair, the hanging lamp (hung with the roof), beds,
    a tub, a Berlin chair, the kitchen.
  - Each element is marked [documented] or [assumed].
- **Tests:**
  - `tests/schroder.test.ts` covers A1–A10 plus the home card.
  - `tests/buildOrder.test.ts` now includes the house: nothing floats and nothing is dropped.
  - The 007/016 registry tests list the house as live.
  - 149 tests in all.
- **Manual checks** (Chrome, 2026-11-09):
  - **A11 pass** (16×): the street and the row; the frame, upper floor and balconies; the furniture in the open frame; then the
    planes, lines and glass; the roof; the garden.
  - **A12 pass:** *The corner* shows the white and grey planes, black frames, the yellow post, the red posts, the red and blue lines
    on the east windows, and the corner glass. It's also the thumbnail.
  - **A13 pass:** green lowland with grey streets, Utrecht's real buildings around it, no procedural city.
  - **A14 partial:**
    - All five views work, and No roof opens the upper floor.
    - Walk starts on the pavement of Prins Hendriklaan, facing the house. It faced away at first: the yaw was wrong, and Fallingwater's
      had the same bug, fixed under spec 017.
    - **Not checked:** walking itself (pointer lock can't be driven here) and the phone controls (no touch device).
  - **A15 pass:** 60 fps at `?dpr=1.75` (2.1M triangles).
  - **A16 pass:** the home card is live, with the thumbnail and 10,668 pieces.
- **Claude usage** (spec 018, through 8c58571): 52 replies; 83.0k output, 114.3k cache-write and 22.0M cache-read tokens; 7.7% of all
  tokens so far. That's under half of Fallingwater's 184.8k output tokens.
- **Thumbnail:** `/rietveld-schroder-house/?view=corner&clean&date=2026-06-21`, cropped to 1200 × 675.

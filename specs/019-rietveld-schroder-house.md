# 019 — The Rietveld Schröder House

- **Status:** Approved (approved by Erik 2026-11-09: "looks good", all recommendations)
- **Owner:** Erik
- **House:** rietveld-schroder-house
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

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
Filled in after approval.

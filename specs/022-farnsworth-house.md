# 022 — The Farnsworth House

- **Status:** Approved (approved by Erik 2026-11-09: "build it", all recommendations)
- **Owner:** Erik
- **House:** farnsworth-house
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The fifth rendering: Mies van der Rohe's house for Dr. Edith Farnsworth (1945–51), at 14520 River Road, Plano, Illinois. A white steel
and glass box floating on stilts above the Fox River floodplain, built block by block on its real site, with the same viewer
experience as the others. Its home-page card goes from "Coming soon" to live.

## Research (2026-11-09)
**Measured drawings: HABS IL-1105** (Library of Congress record il0323, 2009; 8 sheets, public domain). As with Fallingwater, the
model would be measured straight off the 1/4″-scale scans.
- **Sheet 1:** title and site map.
- **Sheet 2:** the site in 1951, 1967, 1995 and 2009.
- **Sheet 3:** the plan of the house and the lower terrace.
- **Sheets 4–5:** the elevations and sections.
- **Sheet 6:** the core.
- **Sheet 7:** the wardrobe, the bathrooms and the stair.
- **Sheet 8:** the window, wall, column and corner details.

**Read off the sheets so far:**
- **Plan:**
  - The house is **77′-3½″ × 28′-8″**: three column bays of **22′-0″**, with **5′-7⅞″** cantilevers at each end.
  - Eight white steel H-columns, four on each long side, carry the floor and roof slabs on their outer faces.
  - A **lower terrace**, a separate travertine platform, sits off-centre to the south-west, with steps from the ground to it and from
    it to the porch.
  - The west end of the house is an open **porch** under the roof; the rest is glass all round.
- **Levels** (from the lower terrace): grade at the stair about **−2′-2″**; the lower terrace **0′-0″**; the main floor **2′-4″**;
  the ceiling **11′-9″**; the top of the cornice **13′-6″**. The house floats about 4½–5 ft above the ground.
- **Inside:** one open room around a free-standing **core** (two bathrooms, the kitchen, the fireplace, utilities, in primavera wood),
  and a free-standing teak **wardrobe**. Floors and terraces are travertine; the steel is painted white.

**The site:**
- **Setting:** a meadow on the north bank of the **Fox River**, under a large black sugar maple that shades the house (a HABS photo
  caption names it).
- **Floods:** the house was built on stilts because the river floods; documented floods reached inside the house in 1954, 1996, 2008
  and 2013.
- **Today:** a National Trust for Historic Preservation site, with a visitor centre nearby (sheet 2).
- **OSM maps the house:** "Farnsworth House" (way 184780920, wikidata Q1397013), so placement can use spec 010b's fit and rotation
  search, checked against sheet 3's north arrow.
- **Also in OSM:** the Fox River (way 867852673) and Big Rock Creek, which runs into it just east of the house; six more buildings
  within 300 m (the visitor centre and outbuildings).
- **Terrain:** the river valley is gentle. The terrain tiles should resolve it, but the Fox River is wide, so it needs water at
  river level, in the lot and beyond.

**What the engine doesn't have yet:**
- **A river beyond the lot.** Spec 017's stream exists only inside the lot (as blocks); outside it the carved channel is dry. A wide
  river along the far edge of the view needs water on the neighbourhood terrain along OSM's riverbank, opt-in like the sea in 010b.
- **Everything else** (steel, glass, slabs, terraces, trees, meadow) the engine already does.

## Proposed approach
- **Engine:** water on the terrain along OSM's river (opt-in), at its real level.
- **The house** at `/farnsworth-house/`: the house, the lower terrace, the meadow, the maple and the river bank, from HABS IL-1105;
  its data settings; a thumbnail; its card set to live, and its credits entry (spec 021: HABS IL-1105, OSM).

**Build story** (roles per spec 012):
1. *The meadow & the river bank* (**site**).
2. *Concrete footings* (**foundation**).
3. *The lower terrace* (**floor**).
4. *The white steel frame & the floor slab* (**structure**): the eight columns go up and the floor is hung between them. This is the
   moment the house floats.
5. *The core, the wardrobe & the furniture* (**interior**).
6. *The glass* (**envelope**).
7. *The roof slab* (**roof**). The ceiling lights go in with it.
8. *The sugar maple, the trees & the river* (**landscape**).

About 3 minutes; this house is about the Schröder House's size.

## Behavior
- **Home page:** the Farnsworth card is live, with a thumbnail and its piece count.
- **Viewer:** `/farnsworth-house/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights, phone
  controls.
- **Views:**
  - *Overview*.
  - *From the meadow*: the classic three-quarter view from the south-west, showing the terrace and the porch.
  - *Inside*: the open room, the core and the glass.
  - *From the river*.
  - *Under the maple*.
- **At dusk** the glass box glows in the meadow.

## Acceptance criteria
**Engine**
- **A1** [unit] The Stahl, Eames, Fallingwater and Schröder models, piece counts and timelines are unchanged.
- **A2** [unit] River water is opt-in: houses that don't set it are unaffected (A1). Where it's on, the water sits at the river's level
  along OSM's riverbank.

**House**
- **A3** [unit] The dimensions match HABS IL-1105 within ±1 ft: 77′-3″ × 28′-8″, the 22′-0″ bays and the end cantilevers, the
  floor at 2′-4″ and the cornice at 13′-6″ above the lower terrace, the ceiling at 11′-9″, and the lower terrace's size and position.
- **A4** [unit] The model invariants hold: no overlaps, inside the grid, deterministic.
- **A5** [unit] `tests/buildOrder.test.ts` covers the house: phases in role order, nothing floats, nothing dropped.
- **A6** [unit] The house floats: under the floor slab, between the columns, there's nothing of the house down to the ground except
  the steps and the eight columns.
- **A7** [unit] The steel is all one white; the floors and terraces travertine; the core primavera and the wardrobe teak.
- **A8** [unit] Every element is marked **[documented]** or **[assumed]**; at least 8 interior pieces are marked.

**Site**
- **A9** [unit] The lot terrain meets the real terrain at its edges, and the lot's river meets the neighbourhood's river at both edges.
- **A10** [unit] Placed from OSM's way 184780920: IoU ≥ 0.8, with the rotation
  matching sheet 3's north arrow within 10°.

**Manual** (in `npm run dev`)
- **A11** [manual] The build plays in order; the columns and the floor stand before any glass, so the house visibly floats first.
- **A12** [manual] *From the meadow* reads as the famous photographs: the white frame, the glass, the two floating planes.
- **A13** [manual] The Fox River runs along the meadow, out to the horizon, with no gap at the lot's edge.
- **A14** [manual] All views, No roof, Walk and the phone controls work; at dusk the glass box glows.
- **A15** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.
- **A16** [manual] The home page shows the house live, with its thumbnail; the credits page lists it.

## Out of scope
- The floods, and the house's later changes: the visitor centre and Palumbo's additions (sheet 2's 1995 site). The house is shown
  as built in 1951, in today's meadow.
- Seasons; the curtains (shown open).

## Open questions
- [x] **Q1: The river.** *Recommended: water on the terrain along OSM's river, out to the horizon.* It defines the site (it's why the
      house is on stilts), and the engine will need it again for other houses. The alternative is the river only inside the lot.
- [x] **Q2: Level of detail.** *Recommended: like the other houses.* That means the full exterior; the core (the bathrooms, the
      kitchen and the fireplace as they face the room); the wardrobe; and the furniture documented in the house, as block
      approximations: Mies's own pieces where photographs show them (the Barcelona chairs, a dining table, the bed), each marked
      [documented] or [assumed]. Product names appear in the code only.
- [x] **Q3: Disclaimer.** *Recommended:* "Fan tribute in a generic toy-block style. Not affiliated with the National Trust for
      Historic Preservation, the Farnsworth House or the LEGO Group." The credits page (spec 021) picks it up.
- [x] **Q4: Timing.** *Recommended: about 3 minutes*, as the Schröder House.

## Implementation notes
Filled in after approval.

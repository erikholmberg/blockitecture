# 035 — Casa Luis Barragán

- **Status:** Approved (approved by Erik 2026-11-09: "build it", all recommendations)
- **Owner:** Erik
- **House:** casa-luis-barragan
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The tenth rendering: Luis Barragán's own house and studio (1948) at General Francisco Ramírez 12–14, Tacubaya, Mexico City, a UNESCO
World Heritage Site since 2004. A plain grey wall to the street hides the rooms inside. Within are:
- tall, quiet rooms of rough white plaster, with timber beams and lava-stone floors;
- the great window onto a wild garden;
- the library's stair of cantilevered timber treads;
- on the roof, a terrace walled in pink, orange and white, open only to the sky.

It's built block by block in its real neighbourhood, with the same viewer experience as the others, and it gets a new live card on
the home page.

## Research (2026-11-09)
**Sources:**
- **The UNESCO nomination file** (WHC 1136, "Casa Estudio Luis Barragán", 2003), online as a public PDF:
  - **plans at 1:200** of the ground floor (pp. 63–71: the ground floor, the upper floors, the roof and sections, with scale bars and
    north arrows), with every room numbered and named;
  - the written description and many photographs.

  So the house can be modelled from measured plans, like the HABS houses.
- **Documented in the nomination:**
  - built 1948;
  - 1,161 m² of building over a ground floor and two upper storeys;
  - the private garden;
  - the rooms named on the plans: garage, vestibule, hall, kitchen, breakfast room, dining room, living room, library, studio,
    secretary's office, office, the patio of the clay pots (*patio de las ollas*), the reflecting pool and the garden.
- **OSM maps the house:** way 199693850, "Casa Luis Barragán", tagged with Wikidata Q1046414. The usual Wikidata fit places it.

**Documented** (the nomination, Wikipedia; to be checked against the plans and photographs):
- **The street front:** plain grey rendered walls, almost blank. The library's large window of square panes faces the street; the
  garage and the door are painted yellow.
- **Inside:**
  - white plaster walls, timber-beamed ceilings and volcanic-stone floors;
  - the living room's window to the garden, divided by a cross of mullions;
  - the library's stair, timber treads cantilevered from the wall with no rail;
  - Barragán's own furniture.
- **The roof terrace:** high walls painted pink, orange and white, open to the sky.
- **The garden:** dense and wild, and the patio with its clay pots.

**The site:**
- **Terrain and neighbourhood:** a flat, dense neighbourhood of Mexico City at about 2,240 m, with the Sierra de las Cruces and the
  Ajusco on the horizon. The houses around it come from OSM as usual.
- **Built-up ground:** the engine's existing `flatsBelow` option (spec 010b) can make all the flat ground read as built-up rather
  than grass. The procedural city stays off: the real city is on the same flat ground as the house.

**What the engine doesn't have yet:** nothing.

## Proposed approach
- **Data:** `scripts/houses/casa-luis-barragan.mjs`, fitted by its Wikidata tag; `scenery: { city: false, flatsBelow: … }` so the
  valley reads built-up.
- **The house** at `/casa-luis-barragan/`:
  - the house and studio, the roof terrace, the garden and the patio;
  - a thumbnail; a new live card on the home page; its credits entry (spec 021).

**Build story** (roles per spec 012):
1. *The valley floor* (**site**).
2. *The footings* (**foundation**).
3. *The ground floor's lava-stone floors and the patios* (**floor**).
4. *The thick walls and the upper floors* (**structure**).
5. *The rooms* (**interior**): Barragán's furniture, the library's cantilevered stair, the timber beams.
6. *The windows* (**envelope**): the great cross-barred window to the garden and the library's window to the street.
7. *The roofs and the walled terrace in pink, orange and white* (**roof**).
8. *The garden and the patio of the clay pots* (**landscape**).

About 3 minutes.

## Behavior
- **Home page:** a tenth card, live, with a thumbnail and its piece count.
- **Viewer:** `/casa-luis-barragan/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights,
  phone controls.
- **Views:**
  - *Overview*.
  - *The street*: the plain grey front with the library's window.
  - *The roof terrace*: inside the coloured walls, the sky above.
  - *The garden*: back toward the great window.
  - *The library stair*: inside, with No roof.

## Acceptance criteria
**Engine**
- **A1** [unit] The other houses' models, piece counts and timelines are unchanged.

**House**
- **A2** [unit] The footprint matches OSM's way 199693850 (IoU ≥ 0.75), and the main dimensions match the nomination's 1:200
  plans within ±1 ft.
- **A3** [unit] The roof terrace is walled in pink, orange and white, its walls higher than eye level, and open to the sky above.
- **A4** [unit] The library's stair: timber treads fixed only to the wall, each one higher than the last, with nothing under them.
- **A5** [unit] The model invariants hold: no overlaps, inside the grid, deterministic.
- **A6** [unit] `tests/buildOrder.test.ts` covers the house: phases in role order, nothing floats, nothing dropped.
- **A7** [unit] Every element is marked **[documented]** or **[assumed]**; at least 8 interior pieces are marked.

**Site**
- **A8** [unit] The lot terrain meets the real terrain at its edges.
- **A9** [unit] No terrain spikes (the spec 010b check).

**Manual** (in `npm run dev`)
- **A10** [manual] The build plays in order; the coloured walls of the terrace go on with the roof, before the garden.
- **A11** [manual] *The roof terrace* reads as the famous photographs: planes of pink, orange and white against the sky.
- **A12** [manual] The neighbourhood reads as city, not grass, out to the mountains.
- **A13** [manual] All views, No roof, Walk and the phone controls work.
- **A14** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.
- **A15** [manual] The home page shows the new card live, with its thumbnail; the credits page lists it.

## Out of scope
- The neighbouring Casa Ortega and the other Barragán works in the buffer zone (they stay as the renderer draws them).
- Barragán's art and objects beyond block approximations of the furniture.

## Open questions
- [x] **Q1: Sources.** *Recommended: the UNESCO nomination's 1:200 plans* for the plan and levels, and its description and
      photographs for colours and furniture, each piece marked documented or assumed.
- [x] **Q2: Level of detail.** *Recommended: like the other houses*: the house and studio, the roof terrace, the garden and patio,
      and the main rooms (the living room, the library with its stair, the dining room, the studio).
- [x] **Q3: Rights.** The Barragan Foundation (Switzerland) holds the rights to Barragán's archive and name, and is known for
      enforcing them. This is a fan model drawn from public UNESCO material, with no photographs reproduced. *Recommended: go ahead,
      and name the foundation in the disclaimer.* Your call if you'd rather skip this house.
- [x] **Q4: Disclaimer.** *Recommended:* "Fan tribute in a generic toy-block style. Not affiliated with the Casa Luis Barragán, the
      Fundación de Arquitectura Tapatía Luis Barragán, the Barragan Foundation or the LEGO Group." The credits page picks it up.
- [x] **Q5: Timing.** *Recommended: about 3 minutes*.

## Implementation notes
Filled in after approval.

# 040 — The Sheats-Goldstein Residence

- **Status:** In progress (approved by Erik 2026-11-09: "build it", all recommendations. Built; waiting on Erik's checks of walking
  and the phone controls. Not committed: Erik commits.)
- **Owner:** Erik
- **House:** sheats-goldstein-residence
- **Created:** 2026-11-09
- **Commits:** 018662d (spec and build)

## Goal
The twelfth rendering: John Lautner's house for Helen and Paul Sheats (1961–63) on Angelo View Drive, Beverly Crest, Los Angeles. James
Goldstein bought it in 1972 and reworked it with Lautner until Lautner died in 1994. Its features:
- a triangular living room under a folded, coffered concrete roof pierced by hundreds of glass skylights;
- the room open to the terrace and the pool, with no glass wall, over the whole of Los Angeles;
- the bedrooms tucked under the terrace into the hillside;
- the main bedroom's glass corner.

It's the second Lautner on the shortlist and the third house in the hills of Los Angeles. It's built block by block on its real
hillside, with the same viewer experience as the others, and it gets a new live card on the home page.

## Research (2026-11-09)
**Status today:** Goldstein still lives there. In 2016 he promised the house, its contents and the grounds to LACMA, the
museum's first gift of architecture (Architectural Record, NPR).

**Sources:**
- **No measured drawings are public:** no HABS survey, no NRHP drawings. Plans of levels 0 and −1 have been published courtesy of
  Goldstein (designboom), and in the Lautner monographs (Escher, *John Lautner, Architect*). They are drawn without dimensions.
- **OSM maps the house:** way 388762653 "Sheats-Goldstein House", tagged with Wikidata Q2178401. It's an LA County outline:
  - a seven-sided polygon about 60 × 45 m, height 6.1 m;
  - elevation 261.5 m;
  - start date 1962.

  The usual Wikidata fit places it.
- **Wikipedia** for the facts below, and many photographs (films, magazines) for colours and furniture.

**Documented** (Wikipedia, Architectural Record, designboom; to be checked against the published plans):
- **The plan:** two triangles joined at their tips, with a triangular folded roof over the join.
- **The living room:**
  - triangular, under the coffered concrete roof;
  - each coffer is pierced by small round skylights, cast drinking glasses, "over 750" (Wikipedia; one analysis counts 49 coffers
    of 6, 588 in all);
  - open to the terrace, with only a curtain of forced air;
  - built-in furniture following the triangles.
- **The pool:** on the terrace at the living room's edge. The main bedroom's and the studio's windows look into it from below.
- **The bedrooms:** five, along paths into the hillside under the terrace. The main bedroom has a frameless glass corner with the
  city below.
- **Materials:** poured concrete, wood and steel; copper pipes heat the floors and the pool.
- **The grounds:**
  - about 1.6 ha (4 acres) of tropical garden;
  - a tennis court;
  - Club James, a nightclub under the tennis court (2000s, after Lautner);
  - James Turrell's skyspace *Above Horizon* (2004) on the slope below the house.

**The site:** a steep ridge above Beverly Hills, at about 260 m, with chaparral and the whole basin to the south. It's like the Stahl
House's site, so `scenery: { chaparral: true }` and the city band (spec 010b/030) fit as they are.

**What the engine doesn't have yet:**
- **Triangles in plan:** walls and the roof's edges run at 30°/60° to each other. The engine places axis-aligned pieces; diagonals
  are stepped, as the curves are elsewhere. A coarse step may read jagged at the roof's long edges. See Q2.

## Proposed approach
- **Data:** `scripts/houses/sheats-goldstein-residence.mjs`, fitted by Wikidata Q2178401; `scenery: { chaparral: true }` and the
  city.
- **The house** at `/sheats-goldstein-residence/`:
  - the house, the terrace and pool, the bedroom wing and the tennis court;
  - a thumbnail; a new live card on the home page; its credits entry (spec 021).
- **The roof:** the coffers as a grid of recesses, each with clear round pieces for the glass skylights.

**Build story** (roles per spec 012):
1. *The ridge* (**site**).
2. *Footings into the rock* (**foundation**).
3. *The terrace, the floors and the pool's basin* (**floor**).
4. *The concrete walls and the bedroom wing* (**structure**).
5. *The rooms* (**interior**): the built-in sofas, the desk and bed of the main bedroom.
6. *The glass* (**envelope**): the main bedroom's glass corner and the bedrooms' glass.
7. *The coffered roof and its skylights* (**roof**).
8. *The garden, the pool's water and the tennis court* (**landscape**).

About 4 minutes.

## Behavior
- **Home page:** a twelfth card, live, with a thumbnail and its piece count.
- **Viewer:** `/sheats-goldstein-residence/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk,
  dusk lights, phone controls, Share (spec 037), neighbours out of the way (spec 038).
- **Views:**
  - *Overview*.
  - *The living room*: under the coffers, out to the city.
  - *The terrace and pool*: back toward the roof's point.
  - *The main bedroom*: the glass corner.
  - *Over the city*.

## Acceptance criteria
**Engine**
- **A1** [unit] The other houses' models, piece counts and timelines are unchanged.

**House**
- **A2** [unit] The footprint matches OSM's way 388762653 (IoU ≥ 0.75). The main dimensions match the published plans to within 2 ft.
- **A3** [unit] The living room's roof is a grid of coffers, each holding round glass skylights, over 400 skylights in all.
- **A4** [unit] The living room's terrace side has no wall or glass between the floor and the roof.
- **A5** [unit] The model invariants hold: no overlaps, inside the grid, deterministic.
- **A6** [unit] `tests/buildOrder.test.ts` covers the house: phases in role order, nothing floats, nothing dropped.
- **A7** [unit] Every element is marked **[documented]** or **[assumed]**; at least 8 interior pieces are marked.

**Site**
- **A8** [unit] The lot terrain meets the real terrain at its edges.
- **A9** [unit] No terrain spikes (the spec 010b check).

**Manual** (in `npm run dev`)
- **A10** [manual] The build plays in order; the coffered roof goes on last of the house, before the garden.
- **A11** [manual] *The living room* reads as the famous photographs: the coffers dotted with light, open to the city.
- **A12** [manual] The hillside reads as chaparral, with the city spread below, as at the Stahl House.
- **A13** [manual] All views, No roof, Walk and the phone controls work.
- **A14** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75` (the skylights add many round pieces).
- **A15** [manual] The home page shows the new card live, with its thumbnail; the credits page lists it.

## Out of scope
- Club James's interior and the Turrell skyspace (both after Lautner, and Turrell's work is an artwork in its own right).
- The garden's full 4 acres beyond the lot.
- The house's furniture and art beyond block approximations of the built-ins.

## Open questions
- [x] **Q1: Which version?** *Recommended: the house as Lautner left it in 1994*, with Goldstein's changes that Lautner made. That
      includes the pool, the terrace, the main bedroom's glass corner and the tennis court as a flat court. Club James and the Turrell
      skyspace stay out (Out of scope). The alternative, the 1963 house before Goldstein, is barely documented.
- [x] **Q2: The diagonals.** *Recommended: step them stud by stud*, as the curves are elsewhere; at this house's size (60 × 45 m)
      the steps are fine-grained. The alternative is a new engine feature for rotated pieces, which is a spec of its own.
- [x] **Q3: Sources.** *Recommended: the published plans, scaled to the OSM outline*, with photographs for the rest. Each piece is
      marked documented or assumed. Less exact than the HABS houses, and the spec will say so.
- [x] **Q4: Rights and disclaimer.** The house is private, promised to LACMA, and well known from film. Lautner's archive is with
      the Getty and the John Lautner Foundation. *Recommended: go ahead* with "Fan tribute in a generic toy-block style. Not
      affiliated with James Goldstein, LACMA, the John Lautner Foundation or the LEGO Group." The credits page picks it up.
- [x] **Q5: Timing.** *Recommended: about 4 minutes* (a large house with a long roof).

## Implementation notes
- **Sources read:** the plans of level 0 and level −1 as published by designboom (courtesy of James Goldstein). They show the two
  triangles joined at their tips: the bedroom wing to the west, and the living room, the pool and the terrace to the east.
- **Data:**
  - `scripts/houses/sheats-goldstein-residence.mjs`, fitted by Wikidata Q2178401.
  - The model frame is unturned: x = real east, z = real south, so the city is +z.
  - Like the Ennis House, the house is built on OSM's own outline, exported as `LOT_SELF`. The fit's rectangles are that outline
    in rows of 12 ft: IoU 0.877.
  - y = 0 is the main floor at OSM's own `ele` tag, 261.5 m, level with the driveway on the north. The ridge falls about 45 ft
    to the house's south point.
  - `despike` cleans one corrupt far-terrain sample, about 8,700 ft off its neighbours.
- **Layout on the outline's corners:**
  - **A–B–C:** the bedroom wing.
  - **North of the line G–E (z ≈ 9):** the living room.
  - **South of that line:** the pool, then the terrace to the south point F, over level −1 (a den and the main bedroom).
- **Model:** `src/houses/sheats-goldstein-residence/`, 56,669 pieces.
  - **The skirt:** concrete down to the falling ground all round the outline.
  - **Floors:** terrazzo in the living room, timber in the wing, concrete on the terrace.
  - **The bedroom wing:** concrete to the north, glass between piers to the south, four rooms.
  - **The living room:**
    - its north wall with a clerestory of glass above it, full height at the kitchen's corner;
    - the long tan leather banquette along it, concrete tables, the kitchen and the dining table;
    - nothing on its side to the pool but two columns (A4).
  - **Level −1:** glass all round its outside, no frames, with the main bedroom's bed and desk.
  - **The coffered roof:** it rises from 9.6 ft at the north wall to 18 ft over the pool. Ribs on a 6-ft grid hang below the slab,
    with six glass skylights in every coffer: **510** in all (A3).
    - Deviation: the skylights are square glass pieces, not round. The engine has no clear round piece.
  - **The tennis court:** on a podium down the slope to the east, with its lines and a fence. Its place is assumed.
  - **Around it:** palms and broad-leaved clumps close round the house, chaparral beyond.
  - **The lot's three neighbours:** shells one stud thick, tagged so they step aside (spec 038). Solid, they were 20k pieces.
- **Tests:**
  - `tests/sheatsGoldstein.test.ts` covers A1–A9, the outline and the home card.
  - The house is added to `buildOrder`, `credits`, `cameraGround` and `houses` tests.
  - The build-order test caught a bed's corner hanging past the wing's floor; it's fixed.
  - Deviation: the tests were written after the model.
- **Manual checks** (Chrome, 2026-11-09):
  - **A10 pass:** at 1:56 the walls, glass and built-ins stand with no roof; the coffered roof follows, the garden and the court
    last.
  - **A11 pass:** *The living room*: the coffers overhead, the pool, and the city to the horizon. The skylights throw spots of
    light on the floor.
  - **A12 pass:** the ridge reads as chaparral and garden, with the basin's city below.
  - **A13 partial:**
    - All five views; *Over the city* was raised to clear the roof.
    - *The main bedroom* was moved back from the skirt wall.
    - No roof; Walk starts in the living room facing the pool and the city; dusk lights.
    - **Not checked:** walking itself, the phone controls.
  - **A14 pass:** 60 fps at `?dpr=1.75` (4.7–5.5M triangles).
  - **A15 pass:** the twelfth card is live with its thumbnail; the credits page has its section.
- **Thumbnail:** `/sheats-goldstein-residence/?cam=-30,55,100,40,2,-5&clean&date=2026-06-21`, cropped to 1200 × 675: both triangles,
  the roof, the pool and the terrace's point from the south-west. It was first the view from inside the living room; Erik found
  that hard to read as the house on the home page (2026-11-09).
- **Claude usage** (spec 018): built in one stretch with spec 039, and both commits landed in the same second, so the ledger
  can't split them: it puts all of it under `sheats-goldstein-residence`. Together: 131 replies; 174.5k output, 292.5k cache-write and
  42.3M cache-read tokens; 6.3% of all tokens so far.

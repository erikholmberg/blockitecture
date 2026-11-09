# 031 — Casa Malaparte

- **Status:** Draft
- **Owner:** Erik
- **House:** casa-malaparte
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The seventh rendering: Casa Malaparte (Adalberto Libera, and its owner Curzio Malaparte, 1938–42) on Punta Massullo, Capri. A long
red box on a cliff above the Mediterranean, with a wedge of steps rising from the land to its flat roof terrace and a curved white
wall standing on the roof. It's built block by block on its real promontory, with the same viewer experience as the others, and its
home-page card goes from "Coming soon" to live.

## Research (2026-11-09)
**Sources:**
- **OSM maps the house:** "Casa Malaparte" (way 752097981, building=villa, wikidata Q2165447), its bounding box about 51 × 29 m.
  The house runs diagonally across it, so the long box will fit OSM's outline with the usual fit and rotation search (spec 010b).
- **No measured drawings are online.** There's no HABS-style survey of an Italian house, and Libera's drawings are published in
  books (for example Talamona's *Casa Malaparte*), not online.
- **So, as for the Schröder House (spec 019):**
  - OSM's footprint and published facts [documented];
  - photographs on Wikimedia Commons for the form, the colours and the details [assumed where they only show it].

**Documented** (Wikipedia, to be checked against the photographs):
- **Dates:** built 1938–42 on Punta Massullo, on Capri's east coast, about 32 m above the sea.
- **The house:**
  - A long rectangular volume of masonry rendered in **Pompeian red**, two storeys on the cliff side.
  - Its roof is a flat terrace, reached by a **wedge-shaped stair** that widens as it descends from the roof to the land: the
    famous "inverted pyramid".
  - A low, curving **white wall** stands free on the roof terrace.
  - Large windows frame views of the sea, Capri's cliffs and the Faraglioni rocks.
  - The living room's fireplace has a glass back looking out to the sea.
- **Access:** only on foot or by boat; there's no road to it.
- **Ownership:** today the Fondazione Giorgio Ronchi; it isn't open to the public.

**The site:**
- A narrow rocky promontory dropping steeply to the sea on three sides, covered in Mediterranean scrub and pines.
- Across the water: Capri's cliffs and the Faraglioni.
- The engine already has what this needs: the **sea** at true sea level (spec 010b), steep rock and chaparral colours, `despike` and
  `seaFloorFt` for corrupt terrain tiles over water (spec 010b), and no procedural city (`city: false`, spec 017).

**What the engine doesn't have yet:** nothing. It's the first house that needs no engine change.

## Proposed approach
- **The house** at `/casa-malaparte/`:
  - the house, the stair and the roof wall on the promontory;
  - the footpath along the headland;
  - its data settings (`scripts/houses/casa-malaparte.mjs`, with the sea repairs);
  - a thumbnail; its card set to live; its credits entry (spec 021).

**Build story** (roles per spec 012):
1. *The promontory* (**site**): the rock rising out of the sea.
2. *The rock foundations* (**foundation**).
3. *The lower floor and the base of the stair* (**floor**).
4. *The red walls and the upper floor* (**structure**).
5. *The living room, the fireplace & furniture* (**interior**).
6. *The great windows* (**envelope**).
7. *The roof terrace, the wedge of steps reaching it, and the white wall* (**roof**).
8. *The scrub, the pines & the sea* (**landscape**).

About 3 minutes; the house is long but simple.

## Behavior
- **Home page:** the Malaparte card is live, with a thumbnail and its piece count.
- **Viewer:** `/casa-malaparte/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights, phone
  controls.
- **Views:**
  - *Overview*.
  - *From the sea*: the famous view from a boat, the red box on its cliff.
  - *The stair*: looking up the wedge from the land.
  - *On the roof*: by the white wall, out to sea.
  - *The Faraglioni*: the house with Capri's rocks beyond.

## Acceptance criteria
**Engine**
- **A1** [unit] The other six houses' models, piece counts and timelines are unchanged.

**House**
- **A2** [unit] The footprint matches OSM's way 752097981 (IoU ≥ 0.75), and the house's documented proportions hold. Its length,
  width and the stair's span are taken from the photographs and OSM and recorded in layout.ts; within ±2 ft of what's recorded there.
- **A3** [unit] The stair is a wedge: each step is wider than the one above it, from the land to the roof terrace.
- **A4** [unit] The walls are Pompeian red, the roof wall white; no other paint colours on the house.
- **A5** [unit] The model invariants hold: no overlaps, inside the grid, deterministic.
- **A6** [unit] `tests/buildOrder.test.ts` covers the house: phases in role order, nothing floats, nothing dropped.
- **A7** [unit] Every element is marked **[documented]** or **[assumed]**; at least 8 interior pieces are marked.

**Site**
- **A8** [unit] The lot terrain meets the real terrain at its edges, and the sea is at true sea level around the promontory.
- **A9** [unit] No terrain spikes (the spec 010b check).

**Manual** (in `npm run dev`)
- **A10** [manual] The build plays in order; the wedge of steps and the roof go on last, before the scrub.
- **A11** [manual] *From the sea* reads as the famous photographs: the red box along the clifftop, the stair, the white wall.
- **A12** [manual] The sea surrounds the promontory with no gaps, and Capri's cliffs rise beyond.
- **A13** [manual] All views, No roof, Walk and the phone controls work; at dusk the windows glow over the sea.
- **A14** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.
- **A15** [manual] The home page shows it live, with its thumbnail; the credits page lists it.

## Out of scope
- The interiors beyond the main living room and the rooms that open off it.
- Boats, and the path down to the sea.

## Open questions
- [ ] **Q1: Sources.** *Recommended: OSM's footprint plus Commons photographs*, marking assumed dimensions as [assumed], as for the
      Schröder House. If you have Talamona's book or another source with plans, I'd use it.
- [ ] **Q2: Level of detail.** *Recommended: like the other houses.* That means the full exterior: the red box, the wedge stair, the
      roof terrace and the white wall. Inside: the great living room with its framed windows and the fireplace with its glass back,
      plus the furniture photographs show (Malaparte's own pieces: the tables, the sofas). Each piece is marked documented or assumed.
- [ ] **Q3: Disclaimer.** *Recommended:* "Fan tribute in a generic toy-block style. Not affiliated with the Fondazione Giorgio Ronchi
      or the LEGO Group." The credits page picks it up.
- [ ] **Q4: Timing.** *Recommended: about 3 minutes*, like the Schröder and Farnsworth houses.

## Implementation notes
Filled in after approval.

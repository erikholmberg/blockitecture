# 058 — The Muuratsalo Experimental House

- **Status:** In progress: built, waiting to be committed (approved by Erik 2026-11-11: "build 4 and don't stop until they're done", choosing to treat that message as approval
  of the specs written for it; the four are spec 054's top picks)
- **Owner:** Erik
- **House:** muuratsalo-experimental-house
- **Created:** 2026-11-11
- **Commits:** <!-- filled in when Done -->

## Goal
Alvar and Elissa Aalto's summer house, the Koetalo (1952–53), on a granite shore of Lake Päijänne on the island of Muuratsalo,
Finland. White walls outside; inside the courtyard, a patchwork of some fifty test panels of brick and tile, in different bonds,
round a fire pit. No other building suits a brick site so well. It's the first house in the Nordic forest, with a lake. It's
built block by block on its real rock, with the same viewer, and takes a new live card on the home page. On spec 054's list it's
★★★.

## Research (2026-11-11)
**Status today:** cared for by the Alvar Aalto Foundation; summer guided tours by booking, through the Aalto2 Museum Centre.
Inscribed on the UNESCO World Heritage List on 26 July 2026, as part of "Aalto Works" (1752-009).

**Sources:**
- **Aalto's 1:50 plan and section B-B** (1952–53, via ArchEyes):
  - the house and courtyard are 1427 × 1441 cm;
  - the south side is a 265 cm return, a 435 cm opening and the 727 cm bedroom wing;
  - the guest wing is 720 × 360 cm, its two rooms marked "VIERASH.";
  - the floor is at ±0.00 and the window heads at +2.445;
  - scaled: the studio about 4.8 m high, the courtyard walls about 4.1 m, the lower roofs about 3.6 m.
- **The Alvar Aalto Foundation:**
  - about fifty test panels of brick and tile, in stacked and running bonds, some headers standing proud;
  - the courtyard floor also paved in patterns;
  - white-painted plaster outside;
  - the guest wing in wood, built on boulders without foundations;
  - granite rock with moss, bilberry and lingonberry, under pine and birch.
- **OSM:** the house is way **1341918201** (`wikidata=Q5755595`), 14.4 × 13.8 m with the guest wing's tail off its east corner, its
  sides at **31.9°/121.5°**. The sauna is way 1341918202, about 94 m north on the shore.
- **Not documented:** which way the monopitch roofs fall, the panels' colours one by one, the furniture.

**The terrain tiles here are no help.** Round Muuratsalo they read lake and land alike as one flat level, about 96.5 m. OSM gives
the lake's surface as 78.3 m, so the tiles' datum is off. On land they also have holes deeper than the lake.

## Proposed approach
- **Data:** `scripts/houses/muuratsalo-experimental-house.mjs`, fitted by OSM's outline.
- **The lake from OSM's shore lines:** a new opt-in `lakeShore` option in the data script.
  - It takes the lake's member ways and every island's outline within 9 km as shores, and floods the terrain grids from a point
    on the water without crossing them. What floods is lowered to a bed 20 ft down; the rest is land, kept 10 ft above the water.
  - The lake's surface is the tiles' own level (96.6 m). The house's floor is 8 m above it, as documented (5–10 m).
  - The scenery is `forest`, with the lake drawn at its own level (`sea: { levelM }`, spec 045).
  - The lot stays on the dry rock. The water, its bays and the sauna in its cove lie beyond it; the neighbourhood draws the sauna
    as a plain block.
- **The house** at `/muuratsalo-experimental-house/`:
  - the L of the studio wing and the bedroom wing round the courtyard;
  - the free-standing west wall with its slatted opening to the lake, and the south wall with its 435 cm opening;
  - the fire pit;
  - the walls white outside and toward the rooms, the patchwork toward the courtyard (two studs thick, as at the Church of the
    Light);
  - the courtyard's paving in brick fields;
  - the studio's big window to the courtyard and its loft;
  - the felt roofs;
  - the timber guest wing on posts and boulders.
- **The site:** granite, moss and berries under pines and birches, thinner toward the lake.

**Build story** (roles per spec 012):
1. *The rock above Lake Päijänne* (**site**).
2. *The footings & the guest wing's posts* (**foundation**).
3. *The floors & the courtyard* (**floor**).
4. *The brick walls & the patchwork* (**structure**).
5. *The rooms* (**interior**).
6. *The windows & the guest wing* (**envelope**).
7. *The roofs* (**roof**).
8. *The pines & the birches* (**landscape**).

About 2½ minutes.

## Behavior
- **Home page:** a new live card, with a thumbnail of the patchwork courtyard and its piece count.
- **Viewer:** `/muuratsalo-experimental-house/` works like the other houses.
- **Views:**
  - *Overview*;
  - *The courtyard*: the patchwork walls and the studio's window;
  - *From the lake*: the white walls on the rock above the water;
  - *The studio*;
  - *From above*.

## Acceptance criteria
**House**
- **A1** [unit] The footprint fits OSM's way 1341918201 (IoU ≥ 0.75) and is about 1427 × 1441 cm, within 2 ft.
- **A2** [unit] The south side: a 265 cm return and a 435 cm opening (within 1 ft each), then the bedroom wing.
- **A3** [unit] The courtyard's faces are the patchwork: at least 3 different colours and at least 4 different panel patterns.
  All outside faces are white.
- **A4** [unit] The guest wing is about 720 × 360 cm, its floor on posts standing on boulders above the rock.
- **A5** [unit] The model invariants hold: no overlaps, inside the grid, deterministic; every phase used; about 2½ minutes.
- **A6** [unit] `tests/buildOrder.test.ts` covers it: phases in role order, nothing floats, nothing dropped.
- **A7** [unit] Every element is marked **[documented]** or **[assumed]**, with at least 8 marks in the interior.

**Site**
- **A8** [unit] The lot terrain meets the real terrain at its edges.
- **A9** [unit] No terrain spikes (the spec 010b check).
- **A10** [unit] Lake Päijänne is water west of the house, and the house's island isn't. The lot is all dry.

**Home and credits**
- **A11** [unit] The home card is live, with the real piece count and its credits.

**Manual** (in `npm run dev`)
- **A12** [manual] The build plays in order: the walls before the rooms, the roofs before the trees.
- **A13** [manual] *The courtyard* reads as the photographs: red brick patchwork with a few tiled panels, the studio's window.
- **A14** [manual] *From the lake*: the white house on its rock above the water, among the pines.
- **A15** [manual] The home page shows the new card live, with its thumbnail. The credits page lists the house.
- **A16** [manual] All views, No roof, Walk and the phone controls work.
- **A17** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.

## Out of scope
- The sauna and the woodshed as modelled buildings, the boat *Nemo Propheta in Patria*, the jetty.
- The island's real relief: the tiles have none to give.

## Open questions
- [x] **Q1: The roofs' slopes.** *Assumed:* the studio wing's roof falls from the courtyard toward the woods. The others are low.
- [x] **Q2: The lake's level.** *Decided:* drawn at the tiles' own level, so water and land agree. The spec records that OSM's
      78.3 m differs.
- [x] **Q3: Disclaimer.** "Fan tribute. Not affiliated with the Alvar Aalto Foundation."

## Implementation notes
- **Files:** `scripts/houses/muuratsalo-experimental-house.mjs`; `src/houses/muuratsalo-experimental-house/` (`layout.ts`, `site.ts`,
  `house.ts`, `interior.ts`, `landscape.ts`, `koetalo.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`,
  `worker.ts`); `muuratsalo-experimental-house/index.html`; `public/muuratsalo-experimental-house/`; the registry entry; `PAGES`;
  the shared test lists.
- **The fit:** OSM way 1341918201 (with its guest-wing tail) at −30° (search −42…−21°), IoU 0.802.
- **The lake (`lakeShore`, new in `scripts/fetch-neighborhood.mjs`, opt-in):**
  - The tiles read about 96.5 m nearly everywhere within 1.3 km, with holes on land about 9 m lower. Spec 045's `lake` option
    found only scraps of water.
  - The new option takes the Päijänne relation's member ways and every island's outline within 9 km as shores. It floods the
    20 ft and 250 ft grids from a point on the water, never crossing a shore and staying within the radius. Flooded samples go
    to a bed 20 ft down; the rest is land, kept 10 ft above the water.
  - The first try took only the lake's own ways. Muuratsalo is its own island relation, so the first map seemed to put water
    round the house. That turned out to be the tiles' holes on land, which the land rule now fixes.
  - At a foot above the water, the whole island rendered as beach, hence 10 ft.
- **The lot** stays on dry rock (x −85…110, z −150…90). A bay comes within about 110 ft north-west of the house, and the sauna
  stands in its cove at the waterline, so both lie outside the lot. The neighbourhood draws the sauna as a plain block.
- **Wording:** spec 013 keeps "brick" out of what visitors read (it means the toy). The texts say "red clay and glazed tile", and
  the structure phase is *The walls & the patchwork*.
- **The patchwork** was first about two-fifths glazed tile. Photographs show mostly red brick, so it's now about one-fifth tile.
- **Tests:** `tests/muuratsalo.test.ts` covers A1–A5, A7–A11; A6 is in `tests/buildOrder.test.ts`.
- **28,560 pieces; 2:35 at 1×.**
- **Manual checks** (Chrome):
  - **A12 pass:** paused at 116.5 s the walls, the windows and the guest wing are up; no roofs, no trees.
  - **A13 pass:** *The courtyard* (and the thumbnail) shows the red patchwork with a few tiled panels and the studio's window.
  - **A14 pass:** *From the lake* shows the white house on its rock above the water, among pines.
  - **A15 pass:** the card is live with its thumbnail and 28,560 pieces; the credits page lists it.
  - **A16 partly checked:** *Overview*, *The courtyard* and *From the lake* open where they should. No roof, Walk and the phone
    controls weren't checked.
  - **A17 not measured** (57 fps on the debug overlay at `dpr 1.75`).
- **Thumbnail:** `/muuratsalo-experimental-house/?cam=3,15,46,24,7,15&clean&date=2026-06-21`.
- **Claude usage:** not recorded; nothing is committed yet.

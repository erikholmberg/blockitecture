# 063 — The Haus am Horn

- **Status:** Done (approved by Erik 2026-11-11: "can you build 4 more buildings", choosing "the safe four" and to treat that message as approval of the specs written for it, as for specs 055–058. Closed by Erik 2026-11-11: "close the specs", accepting the manual checks that couldn't
  be run here: No roof, Walk, the phone controls and measured performance)
- **Owner:** Erik
- **House:** haus-am-horn
- **Created:** 2026-11-11
- **Commits:** faf5d9a

## Goal
The Haus am Horn in Weimar (1923): the model house the Bauhaus built for its first exhibition, designed by the painter Georg
Muche with Adolf Meyer and Walter March, and furnished by the school's workshops. A square house with a tall living room exactly
in the middle, lit by clerestory windows over the flat roofs of the ring of small rooms round it. It's the only building the
Weimar Bauhaus realised, and the smallest house on the site. It's built block by block on its real garden plot, with the same
viewer, and takes a new live card on the home page. On spec 054's list it's ★★★.

## Research (2026-11-11)
**Status today:** owned by the Klassik Stiftung Weimar since 2019, restored and reopened that year as a museum. Part of the
UNESCO World Heritage site "Bauhaus and its Sites in Weimar, Dessau and Bernau" since 1996.

**Sources:**
- **Published dimensions:** 12.70 × 12.70 m; the living room 6 × 6 m and 4.14 m high; the outer rooms about 2.30 m (de.wikipedia).
- **Scaled from the redrawn 1923 plan and the two published elevations** (Rintallo, *Miniatur der Moderne?*, 2023; ±0.1 m):
  - each room's place in the ring: the entrance, the lavatory, the pantry and the cellar stair on the entrance front; the
    kitchen, the dining room and the children's room on one side; the lady's room and the bathroom on the far front; the man's
    room, the work niche (open to the living room) and the guest room on the street's side;
  - every window and door of the four fronts;
  - the heights: the outer roof's edge about 3.4 m above the ground, the middle block about 5.05 m, the chimney about 5.75 m;
  - the clerestory, 5.1 × 1.05 m in three panes, on two sides of the middle block only.
- **The furnishing** (de.wikipedia, the Bauhaus Kooperation): Marcel Breuer's living-room cabinet, sofa, table and chairs, the
  niche's desk and the lady's dressing table; Erich Dieckmann's dining room and man's room; Alma Buscher's toy cabinet in
  yellow, red and blue; the fitted kitchen by Benita Otte and Ernst Gebhardt; lamps by Gyula Pap, Carl Jucker and László
  Moholy-Nagy; the living room's olive green and light yellow walls; the dining room's ochre walls and its chequered rubber
  floor in red, blue and white.
- **OSM:** way **35984274** (`wikidata=Q525226`), a square with its sides at **339.1°** and **69.1°**. The street Am Horn runs
  about 30 m to the west, below the house; a path leads up from its gate; a gravel path rings the house; a hedged kitchen garden
  lies behind.
- **Not obtained:** a section, and the entrance front's and the dining side's elevations (their openings come from the plan).

## Proposed approach
- **Data:** `scripts/houses/haus-am-horn.mjs`, fitted by OSM's outline. The real ground is kept: it falls about 1 in 8 toward the
  street, and the house stands on a level lawn with banks, as documented.
- **The house** at `/haus-am-horn/`:
  - the square of rendered walls with every window and door of the four fronts;
  - the taller living-room block in the middle, with the clerestory on its two documented sides;
  - the ring's twelve partitions, with a doorway in each but one;
  - the floors in each room's colour, the dining room's chequered;
  - the two flat roofs with their white edges, and the chimney;
  - the rooms furnished with blocky stand-ins for the documented Bauhaus pieces.
- **The garden:** the ring path, the path from the gate, the kitchen garden's four hedged beds, the copper beech, fruit trees by
  the path, the fence along the street.

**Build story** (roles per spec 012):
1. *The garden above the Ilm* (**site**).
2. *The footings* (**foundation**).
3. *The floors* (**floor**).
4. *The walls, the living room in the middle* (**structure**).
5. *The rooms & the Bauhaus furniture* (**interior**).
6. *The windows & the clerestory* (**envelope**).
7. *The flat roofs* (**roof**).
8. *The garden & its trees* (**landscape**).

About 2 minutes.

## Behavior
- **Home page:** a new live card, with a thumbnail from the street's side showing the entrance and the clerestory, and its piece
  count.
- **Viewer:** `/haus-am-horn/` works like the other houses.
- **Views:** *Overview*; *The entrance*; *The living room* (under the clerestory); *From the kitchen garden*; *From above* (the
  square within the square).

## Acceptance criteria
**House**
- **A1** [unit] The footprint fits OSM's way 35984274 (IoU ≥ 0.75) and is 12.70 m square (within 1 ft).
- **A2** [unit] The living room is 6 × 6 m (within 1 ft), exactly central, and 4.14 m high (within 0.5 ft); the ring's rooms are
  lower, and the middle block rises above their roof.
- **A3** [unit] The clerestory is glazed on the far front's and the street's sides of the middle block, and on neither of the
  other two.
- **A4** [unit] Each front has the documented openings: three windows and the front door on the entrance front; two windows and
  a garden door on the dining side; three windows on each of the other two.
- **A5** [unit] Thirteen rooms: the living room and the twelve of the ring, each with its own floor area; the dining room's
  floor is chequered in red, blue and white.
- **A6** [unit] The work niche is open to the living room; the living room has a doorway on each of its other three sides.
- **A7** [unit] The model invariants hold: no overlaps, inside the grid, deterministic; every phase used; about 2 minutes.
- **A8** [unit] `tests/buildOrder.test.ts` covers it: phases in role order, nothing floats, nothing dropped.
- **A9** [unit] Every element is marked **[documented]**, **[scaled]** or **[assumed]**, with at least 10 marks in the interior.

**Site**
- **A10** [unit] The lot terrain meets the real terrain at its edges, and falls toward the street: the ground at the street's edge
  of the lot is at least 10 ft below the house's floor.
- **A11** [unit] No terrain spikes (the spec 010b check).

**Home and credits**
- **A12** [unit] The home card is live, with the real piece count and its credits.

**Manual** (in `npm run dev`)
- **A13** [manual] The build plays in order: the walls before the furniture, the windows before the roofs, the garden last.
- **A14** [manual] The thumbnail reads as the photographs: a white square, the taller middle with its clerestory.
- **A15** [manual] *The living room* shows the clerestory and the doorways to the rooms round it.
- **A16** [manual] The home page shows the new card live, with its thumbnail. The credits page lists the house.
- **A17** [manual] All views, No roof, Walk and the phone controls work.
- **A18** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.

## Out of scope
- The partial cellar, its stair and its light wells.
- The corner blocks standing 10 cm proud of the fronts, and the roofs' very shallow pitch.
- The furniture's real forms: the pieces are blocky stand-ins.

## Open questions
- [x] **Q1: Which state?** *As built in 1923* (the plan's state), in the 2019 restoration's light render.
- [x] **Q2: The doorways between the ring's rooms** aren't all legible on the plan. *Assumed:* one in each partition but the
      lavatory's.
- [x] **Q3: Disclaimer.** "Fan tribute. Not affiliated with the Klassik Stiftung Weimar."

## Implementation notes
- **Files:** `scripts/houses/haus-am-horn.mjs`; `src/houses/haus-am-horn/` (`layout.ts`, `site.ts`, `house.ts`, `interior.ts`,
  `landscape.ts`, `hausAmHorn.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`, `worker.ts`);
  `haus-am-horn/index.html`; `public/haus-am-horn/`; the registry entry; `PAGES`; the shared test lists.
- **The fit:** OSM way 35984274 at −69° (search −75…−63°), IoU 0.968.
- **The windows' heads** are at 18 plates (2.2 m above the floor) against the scaled 2.4 m, so they end on a block course.
- **The walls are one stud thick,** so the living room's olive green and light yellow also show in the rooms behind them, and
  the outer walls are render-white inside too.
- **Tests:** `tests/hausAmHorn.test.ts` covers A1–A7, A9–A12; A8 is in `tests/buildOrder.test.ts`. They passed first time.
- **`tests/viewsClear.test.ts`** (new, for specs 060–063) checks that no named view starts inside a neighbouring building
  the engine draws outside the lot. It found this house's *entrance* view inside the apartment house next door; the view was
  moved.
- **10,233 pieces; 2:13 at 1×.** The smallest building on the site.
- **Manual checks** (a scripted Chrome window):
  - **A13 pass:** paused half a second before the roof phase, the walls, the partitions, the furniture, the windows and the
    clerestory are in; no roofs, no hedges or trees.
  - **A14 pass:** the thumbnail shows the white square, the taller middle with its clerestory, the entrance steps, the ring
    path, the kitchen garden's beds and the copper beech.
  - **A15 pass:** *The living room* shows the clerestory on two sides and the doorways to the lady's room, the man's room and
    the niche.
  - **A16 pass:** the card is live with its thumbnail and 10,233 pieces; the credits page lists the house.
  - **A17 partly checked:** *Overview* and *The living room* open where they should. No roof, Walk and the phone controls weren't checked.
  - **A18 not measured.**
- **Thumbnail:** `/haus-am-horn/?cam=-34,22,82,21,6,21&clean&date=2026-06-21`.
- **Claude usage** (spec 018): can't be split out for this building. The four commits for specs 060–063 carry the same
  timestamp, after one stretch of uncommitted work, and the ledger splits usage by commit time. So all four buildings' usage
  is recorded on this one, the last of them (faf5d9a): 144 replies. It overstates this house about fourfold.

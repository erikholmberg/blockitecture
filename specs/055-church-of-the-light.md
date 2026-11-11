# 055 — The Church of the Light

- **Status:** In progress: built, waiting to be committed (approved by Erik 2026-11-11: "build 4 and don't stop until they're done", choosing to treat that message as approval
  of the specs written for it; the four are spec 054's top picks)
- **Owner:** Erik
- **House:** church-of-the-light
- **Created:** 2026-11-11
- **Commits:** <!-- filled in when Done -->

## Goal
Tadao Ando's Church of the Light (Ibaraki Kasugaoka Church, 1989) in Ibaraki, Osaka. It's a concrete box of three 5.9 m cubes,
sliced through at 15° by a free-standing wall, with a cross cut through the wall behind the altar. It's the first chapel on the
site and the smallest building, so it builds quickly. Its inside view is one of the most recognisable images in modern
architecture. It's built block by block on its real street, with the same viewer as the houses, and takes a new live card on the
home page. On spec 054's list it's ★★★.

## Research (2026-11-11)
**Status today:** owned by the Ibaraki Kasugaoka Church (United Church of Christ in Japan), founded 1972. Building tours are
suspended (the church's site, 2026-09-24), and filming and press are refused.

**Sources:**
- **Tadao Ando Architect & Associates' 1:50 floor plan** (published on ArchEyes), dimensioned:
  - gridlines 18,000 × 6,280 mm; inside 17,700 × 5,900 mm (three 5.9 m cubes, as Wikipedia gives); long walls 380 mm;
  - the free-standing wall at 15°, 280 mm thick;
  - 12 pew rows at 900 mm, each two benches end to end;
  - floor levels +150 mm at the entrance and −950 mm at the altar;
  - the formwork's 1,800 × 900 mm panels with three tie holes a row.
- **OSM:** the chapel is way **597276853** (`wikidata=Q1655766`), 17.87 × 5.76 m, its long sides at **154°/334°**. The cross faces
  about 154° (south-south-east). Many sources say "east", but OSM and the plan's north arrow agree on south-south-east.
- **The grounds:** the Sunday School (1999, also Ando) is about 13 m west-south-west (way 597276856), and probably the minister's
  house to the north-west (way 597276849). A residential street runs about 8 m east of the chapel.
- **Not published:** the cross's horizontal arm's height, the outside walls' heights, the altar furniture.

## Proposed approach
- **Data:** `scripts/houses/church-of-the-light.mjs`, fitted by OSM way 597276853; the lot's buildings and streets as lot features.
- **The chapel** at `/church-of-the-light/`:
  - the concrete box;
  - the cross, cut floor to ceiling and wall to wall;
  - the 15° wall through the box, its stub through the entrance wall, and the L-shaped wall beyond the altar;
  - the glazed slot where the 15° wall runs inside;
  - the floor stepping down to the altar under the pews;
  - the Sunday School, the minister's house and the neighbours as plain blocks; the hinoki cypresses the plan draws.
- **Blocks show one colour on both faces**, so the walls are two studs thick:
  - the outside layer is light concrete in the sun, with its formwork panels;
  - the inside layer is the same concrete in shadow;
  - the cross is made of glowing pieces, so it reads as light against the dark wall, as in the photographs. The real cross is
    glazed.
- **A shared helper, `src/engine/lot.ts`**, gives the baked real ground, OSM's streets and plain neighbour blocks. The four new
  buildings use it; older houses keep their own copies, so their models don't change.

**Build story** (roles per spec 012):
1. *The church grounds in Ibaraki* (**site**).
2. *The foundation* (**foundation**).
3. *The floor, stepping down to the altar* (**floor**).
4. *The concrete box, the cross & the 15° wall* (**structure**).
5. *The pews* (**interior**).
6. *The glass in the cross & the doors* (**envelope**).
7. *The roof* (**roof**).
8. *The cypresses* (**landscape**).

About 2 minutes.

## Behavior
- **Home page:** a new live card, with a thumbnail of the cross from the pews and its piece count.
- **Viewer:** `/church-of-the-light/` works like the houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights,
  phone controls, Share. The numbers panel says "chapel" (spec 059).
- **Views:**
  - *Overview*;
  - *The cross*: from the back pews, the classic photograph;
  - *The 15° wall*: outside, where the wall leaves the box toward the altar end;
  - *From the street*;
  - *From above*.

## Acceptance criteria
**The chapel**
- **A1** [unit] The footprint fits OSM's way 597276853 (IoU ≥ 0.75) and is about 18.3 × 6.66 m (within 2 ft).
- **A2** [unit] The cross: in the altar wall, glowing pieces fill the middle stud from the altar's floor to the ceiling, and a
  horizontal arm from wall to wall.
- **A3** [unit] The 15° wall runs at 15° (±1°) through the long wall on the Sunday School's side. Inside, it ends near the middle
  of the room. A stub on its line passes through the entrance wall.
- **A4** [unit] The floor steps down toward the altar, 9 plates (1.1 m) in all. There are 12 pew rows, each on one level, and the
  rows get shorter where the 15° wall cuts in.
- **A5** [unit] The model invariants hold: no overlaps, inside the grid, deterministic; every phase used; about 2 minutes.
- **A6** [unit] `tests/buildOrder.test.ts` covers it: phases in role order, nothing floats, nothing dropped.
- **A7** [unit] Every element is marked **[documented]** or **[assumed]**, with at least 5 marks in the interior.

**Site**
- **A8** [unit] The lot terrain meets the real terrain at its edges.
- **A9** [unit] No terrain spikes (the spec 010b check).

**Home and credits**
- **A10** [unit] The home card is live, with the real piece count and its credits.

**Manual** (in `npm run dev`)
- **A11** [manual] The build plays in order: the box and the cross go up before the pews; the roof goes on before the cypresses.
- **A12** [manual] *The cross* reads as the photographs: a dark room, the pews stepping down, the cross of light.
- **A13** [manual] The home page shows the new card live, with its thumbnail. The credits page lists the chapel.
- **A14** [manual] All views, No roof, Walk and the phone controls work.
- **A15** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.

## Out of scope
- The Sunday School and the minister's house in detail: they're plain blocks.
- The five outdoor steps beyond the altar end.
- Light falling through the cross onto the floor: the engine has no light shafts.

## Open questions
- [x] **Q1: A real cross of glass, or glowing pieces?** *Decided: glowing pieces*, so the cross reads by day as in the
      photographs. The spec says so, and the code marks it.
- [x] **Q2: Walls two studs thick** (0.6 m against the real 0.38 m), so the inside can be in shadow. *Decided:* yes. The outside
      is 18.6 × 7.0 m against the plan's 18.3 × 6.66 m.
- [x] **Q3: Disclaimer.** "Fan tribute. Not affiliated with the Ibaraki Kasugaoka Church or Tadao Ando Architect & Associates."

## Implementation notes
- **Files:** `scripts/houses/church-of-the-light.mjs`; `src/houses/church-of-the-light/` (`layout.ts`, `site.ts`, `house.ts`,
  `interior.ts`, `landscape.ts`, `chapel.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`, `worker.ts`);
  `church-of-the-light/index.html`; `public/church-of-the-light/` (`neighborhood.bin`, `thumbnail.jpg`); the registry entry; `PAGES`;
  the shared test lists (build order, credits, camera views, live houses, spec 042's built list).
- **Shared:** `src/engine/lot.ts` (ground sampler, streets, plain neighbour blocks). `scripts/fetch-neighborhood.mjs` now takes
  `OVERPASS_URL`, so a mirror can be used when the main Overpass server is overloaded (it was, all day). It's a tooling change,
  and the default is unchanged.
- **The fit:** OSM way 597276853 at −60.5° (search −74…−54°), IoU 0.785. The box is drawn 18.6 × 7.0 m (the plan: 18.3 × 6.66;
  OSM traces 17.87 × 5.76), so the overlap is lower than for the other houses.
- **What changed in Chrome:**
  - The first try had one-stud walls with tie holes in a darker grey. From outside they read as rows of office windows, and
    inside the room was bright, with the cross barely visible.
  - The walls are now two studs thick, light concrete outside and the same concrete in shadow inside. The cross is built of
    glowing pieces. The tie holes are faint outside and left out inside.
  - The walls' openings are aligned to the brick courses, because the builder checks a mask only at the bottom of each course.
- **Tests:** `tests/churchOfTheLight.test.ts` covers A1–A5, A7–A10; A6 is in `tests/buildOrder.test.ts`. Not tests-first, as for
  specs 043–045. They found the neighbours reaching outside the grid, and a light inside the 15° wall.
- **13,870 pieces; 2:05 at 1×.**
- **Manual checks** (Chrome, `npm run dev`):
  - **A11 pass:** paused at 98.5 s the box stands open with no cypresses; at 110 s the roof is on, still no cypresses.
  - **A12 pass:** *The cross* (and the thumbnail) shows the dark room, the pews stepping down, the cross of light.
  - **A13 pass:** the home page shows the card live with its thumbnail and 13,870 pieces; the credits page lists the chapel.
  - **A14 partly checked:** *Overview*, *The cross*, *The 15° wall* and the views from above open where they should. No roof, Walk
    and the phone controls weren't checked.
  - **A15 not measured.**
- **Thumbnail:** `/church-of-the-light/?cam=6,6,6.5,59,9,11.5&clean&date=2026-06-21` at 1200 × 675.
- **Claude usage** (spec 018): not recorded; nothing is committed yet.

# 075 — The Barcelona Pavilion

- **Status:** In progress (approved by Erik 2026-11-12: "approved for all, build until done", taking the recommended answers). Built; left: A22 on a real GPU and A21's touch part on a real phone (see Implementation notes)
- **Owner:** Erik
- **House:** barcelona-pavilion
- **Created:** 2026-11-12
- **Commits:** <!-- filled in when Done -->

## Goal
The German Pavilion that Ludwig Mies van der Rohe and Lilly Reich built for the 1929 International Exposition in Barcelona: a
travertine plinth with two pools, eight chrome cruciform columns, a thin flat roof, and free-standing walls of marble, onyx and
tinted glass that slide past each other instead of making rooms. It was taken down in 1930 and rebuilt on its site on Montjuïc
in 1983–86. It's built block by block on that site, with the same viewer, and takes a new live card on the home page. On spec
054's list it's ★★★ (shortlist slug `barcelona-pavilion`).

It would be the site's third Mies, after the Farnsworth House (spec 022) and the Neue Nationalgalerie (spec 057). Both of those
are boxes: a glass room under a roof on columns. This one has no box. Its walls don't meet, there's no door and almost nothing
inside, and the stone and the water do the work. It's also smaller than either: the whole plinth is about 57 × 18 m. It would be
the first building on the site in Spain, and the first one that's a rebuilt copy of a lost original.

## Research (2026-11-12)
**Status today:** owned by the city (OSM's `operator=Ajuntament de Barcelona`) and run by the Fundació Mies van der Rohe, which
was set up during the reconstruction. It's open daily as a museum, and the Fundació stages temporary "interventions" in it. The
reconstruction was designed by Ignasi de Solà-Morales, Cristian Cirici and Fernando Ramos (es.wikipedia adds Ana Vila); work began
in 1983 and it opened on 2 June 1986.

**Sources:**
- **miesbcn.com** (the Fundació, "The Pavilion"): the history; the four stones of the reconstruction, "of the same
  characteristics and provenance" as in 1929: Roman travertine, green Alpine marble, ancient green marble from Greece and golden
  onyx from the Atlas; Kolbe's *Dawn* at one end of the small pool. No dimensions.
- **es.wikipedia** ("Pabellón alemán"): the plinth **56.62 × 18.48 m**; **eight** cruciform columns clad in chromed steel; a
  free height of **3.10 m**; a planning module of **1.09 m**; travertine slabs **2.18 × 1.09 m** (it says "× 1 m"), 3 cm thick;
  onyx panels **2.35 × 1.55 m**; an entrance stair of **8 steps** running along the plinth; two pools; glass in **green, black,
  grey and clear**; the marble walls hung on steel, the service core in concrete. Kolbe's *Der Morgen* in the rear pool, **1.73 ×
  0.87 × 0.75 m**, a 1986 cast. The reconstruction's onyx is Algerian and its veining runs differently from the original's.
- **en.wikipedia**: the materials (Tinos verde antico, golden onyx, travertine; grey, green and white tinted and translucent
  glass); the U-shaped travertine enclosure round the large pool and the service annex at the south end; the small pool in a
  second U of walls at the other end, with the statue; the Barcelona chair, designed for the building.
- **architecture-history.org**: the roof looked like a slab about **24 cm** thick, but in 1929 it was hollow steel, rendered; in
  1986 it's reinforced concrete. Walls about 3 m high. The small pool is lined with black glass; the large pool's water is light
  green. Frosted glass in the walls; black glass table tops; white leather chairs and stools on a black carpet. It says the
  rebuilt onyx is redder than the original's honey yellow, and the red curtain of 1986 isn't in the 1929 photographs.
- **barcelonaurbana.com** (a guide; weaker): the plinth **1.30 m** high (8 steps at about 16 cm agree); the onyx wall 3.10 m high,
  setting the building's height; the 1.09 m grid ruling the paving, the columns and the glass; the columns nickel-plated in 1929
  and stainless in 1986.
- **WikiArquitectura**: eight columns; travertine for the plinth, the walls by the pool and the long bench; four chairs inside.
- **OSM** (Overpass, 2026-11-12):
  - the pavilion is way **67917935** (`wikidata=Q807915`, `building=museum`): the **main roof**, about **24.9 × 14.2 m**, its
    long sides at **152.8° / 332.8°** and its short sides at **62.5° / 242.5°**. The plinth's long axis runs the same way, from
    the small pool (NNW) to the large pool and the annex (SSE); its front faces Plaça de Carles Buïgas to the ENE;
  - the service annex, way **1104411434**, about 10.3 × 10.2 m, at the SSE end;
  - the small pool, way **1104411431** (`natural=water`), about 12.3 × 4.6 m, inside its wall, way 1104411432;
  - the large pool, way **1104411435**, 219 m², about 22.0 × 10.0 m overall;
  - travertine walls (`barrier=wall`) 1104411433, 1104411436 and 1104411440, the last 41.5 m long along the front;
  - Kolbe's statue, node **10106337168** (`artist_name=Georg Kolbe`, `name=Morgen`), at the small pool's corner;
  - the stair, way 1104411454, on the front;
  - the paved areas (1104411437–39), grass behind and beside the plinth, and rows of trees along the avenue.
  The OSM pieces span about 55.1 m along the long axis, against the published 56.62 m.
- **Neighbours** (OSM, drawn by the engine): CaixaForum (the former Casaramona factory) across Avinguda de Francesc Ferrer i
  Guàrdia; the Palau de Victòria Eugènia (1923), which lies along the SSE end; the Plaça de Carles Buïgas and its fountain to
  the east.
- **Terrain** (AWS terrarium tiles, z15, sampled 2026-11-12): about 43.9 m at the roof's centre. Along the long axis the ground
  rises about 0.75 m per 10 m toward the SSE (40.7 m 60 m NNW, 48.9 m 60 m SSE). Across it the ground falls gently to the plaça
  (45.6 m 60 m behind, 42.7 m 60 m in front). A footway behind the pavilion comes down to it by steps (OSM 1055096076). The
  tiles are about 3.6 m a pixel here, so the plinth itself is smeared into them.

**Not obtained:**
- a measured plan or section. The Solà-Morales/Cirici/Ramos monograph and the 1929 drawings (MoMA's Mies archive) weren't
  reachable, so the walls' lengths and places come from OSM and the published plan as reproduced in many places, scaled [scaled],
  or from photographs [assumed];
- the roof slabs' exact sizes and the columns' spacing (OSM gives the main roof's outline; the two rows of four columns would be
  placed on the 1.09 m grid inside it [assumed]);
- the onyx wall's length, and which walls are Alpine green and which Tinos (from photographs [assumed]);
- the plinth's height from a primary source (1.30 m is from a guide, consistent with 8 steps);
- the pools' depths;
- the heritage listing's number.

One source (architecture-history.org) says the reconstruction stands "at a slightly different spot"; the others (Wikipedia, the
Fundació) say it was rebuilt on the original site. The model follows OSM, which maps the building that's there.

## Proposed approach
- **Data:** `scripts/houses/barcelona-pavilion.mjs`, fitted by OSM's main roof (way 67917935), with the rotation searched round
  the roof's sides (about −69…−56° if the model's x runs along the short axis, as for the Haus am Horn's −69° at 69.1°; the
  frame is fixed in `layout.ts`). Real north follows from it (spec 003).
- **The ground:** the real slope is kept. y = 0 is the top of the plinth, pinned by `lotElevationM` to 1.30 m above the ground
  at the foot of the stair, as the tiles read it [documented, weak]. The ground behind the pavilion rises to about the plinth's
  level and the plaça side falls away, so the plinth shows its full height only on the front and the SSE end. Where the tiles
  smear the plinth into the ground, the lot terrain is levelled under it and blended out to the real terrain at the lot's edge.
- **One grid** (Q3): the 1.09 m module is drawn as 3.5 studs on average, the travertine slabs (2 × 1 modules) as 7 × 3 and 7 × 4
  studs in turn, so every second joint lands on the true grid. The plinth is 52 × 17 modules: 182 × 60 studs (55.5 × 18.3 m,
  −2.0% and −1.1%). The columns and the glass's edges sit on module lines.
- **The building** at `/barcelona-pavilion/`:
  - the travertine plinth, 11 plates high (1.34 m), with the 8-step stair along the front [documented], and the long travertine
    bench by the large pool [documented];
  - the two pools, the large one by the entrance inside its U of travertine walls, the small one at the far end inside its own U,
    lined dark [documented: black glass];
  - the eight cruciform columns in two rows of four, chrome, from the plinth into the roof [documented: eight; spacing assumed];
  - the free-standing walls: travertine at the ends and by the pools, green marble at the centre and round the small pool, the
    golden onyx wall in the middle of the roofed space [documented: materials; places scaled/assumed];
  - the glass walls in green, grey, black and clear, and the frosted light wall, in thin chrome frames [documented: colours;
    places scaled];
  - the service annex at the SSE end, under its own small roof [OSM];
  - two thin white roof slabs, 2 plates (24 cm), 25 plates (3.05 m) above the plinth [documented: 3.10 m clear];
  - inside: the black carpet, the Barcelona chairs and stools in white leather, the glass-topped table, and the red curtain (Q1).
- **The site:** the slope of Montjuïc, the grass behind, the trees along the avenue at OSM's places, the paved forecourt. The
  numbers panel says "pavilion" (spec 059, `text.noun: 'pavilion'`).

**Build story** (roles per spec 012). The pavilion has almost no interior, so the interior phase holds what stands free inside the
open frame before the walls: the onyx wall (a free-standing wall in the middle of the space, like the NNG's marble shafts), the
carpet, the chairs, stools and table. Each of them stands on the plinth, so nothing floats. The red curtain hangs from the roof,
so it goes in with the roof (`b.hanging(P.ROOF, …)`). The pools' water and the statue go in last, as the Stahl House fills its pool
in its landscape phase.
1. *The slope of Montjuïc* (**site**).
2. *The travertine plinth & the pools' basins* (**foundation**).
3. *The travertine paving & the stair* (**floor**).
4. *The eight chrome columns* (**structure**).
5. *The onyx wall & the Barcelona chairs* (**interior**).
6. *The marble, travertine & tinted glass walls* (**envelope**).
7. *The floating roofs* (**roof**).
8. *The water, the statue & the trees* (**landscape**).

About 1½ minutes [assumed]; the smallest model by area after the Haus am Horn.

## Behavior
- **Home page:** a new live card, with a thumbnail from the plaça's side showing the plinth, the large pool and the roof
  floating over the walls, and its piece count.
- **Viewer:** `/barcelona-pavilion/` works like the other buildings; the numbers panel says "pavilion".
- **Views:**
  - *Overview*;
  - *The entrance*: from the top of the stair, across the large pool to the roof;
  - *The onyx wall*: inside, the onyx with the chairs before it;
  - *The small pool*: from inside, through the glass to the statue in its pool;
  - *From above*: the walls' plan as Mies drew it.

## Acceptance criteria
**The building**
- **A1** [unit] The main roof fits OSM's way 67917935 (IoU ≥ 0.75). The plinth is 56.62 × 18.48 m within 3% each way.
- **A2** [unit] The grid: every column's centre and every wall's end sits on a module line (3.5 studs on average, within half a
  stud); the plinth is 52 × 17 modules.
- **A3** [unit] Eight columns in two rows of four, each a chrome cross from the plinth into the roof, all under the main roof.
- **A4** [unit] The clear height under the main roof is 3.10 m within 0.15 m; the roof slabs are no more than 3 plates thick.
- **A5** [unit] The plinth's top is 1.30 m within 0.15 m above the ground at the foot of the stair, and the stair has 8 steps.
- **A6** [unit] Two pools: the large one fits OSM's way 1104411435 and the small one way 1104411431 (IoU ≥ 0.6 each), and their
  water is below the plinth's top.
- **A7** [unit] The walls don't make a closed room: from the middle of the main roof's space there's a path on the plinth to the
  open air that crosses no wall or glass.
- **A8** [unit] The materials: the onyx wall is golden; there are walls of travertine and of green marble; there's glass in at
  least three tints; the columns are chrome.
- **A9** [unit] The statue (or its stand-in, Q2) stands in the small pool, within 2 m of OSM's node 10106337168, and is 1.73 m
  high within 0.15 m.
- **A10** [unit] The model invariants hold: no overlaps, inside the grid, deterministic; every phase used; about 1½ minutes.
- **A11** [unit] `tests/buildOrder.test.ts` covers it (it's in `DEFINITIONS`): phases in role order, nothing in the interior
  floats, nothing dropped.
- **A12** [unit] Every element is marked **[documented]**, **[scaled]** or **[assumed]**, with at least 5 marks in the interior.

**Site**
- **A13** [unit] The lot terrain meets the real terrain at its edges, and the ground falls toward the plaça: the ground at the
  front edge of the lot is at least 1 ft lower than the ground behind the plinth.
- **A14** [unit] No terrain spikes (the spec 010b check).
- **A15** [unit] No named view starts inside a neighbouring building (`tests/viewsClear.test.ts`).

**Home and credits**
- **A16** [unit] The home card is live, with the real piece count and its credits. The numbers say "pavilion".

**Manual** (in `npm run dev`)
- **A17** [manual] The build plays in order: the plinth, the columns standing alone, the onyx wall and the chairs, the walls and
  the glass, then the roofs, then the water and the statue last. Pause just before the roof phase and check.
- **A18** [manual] *The entrance* reads as the photographs: the large pool, the thin roof floating over the green and onyx walls.
- **A19** [manual] *From above* with No roof shows the walls as the famous plan: separate planes, none meeting.
- **A20** [manual] The home page shows the new card live, with its thumbnail. The credits page lists the building.
- **A21** [manual] All views, No roof, Walk and the phone controls work. In Walk, you can go up the stair and through the pavilion
  and out the other end without a door.
- **A22** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75` (open both with `?debug&dpr=1.75` on the
  same machine and compare the FPS overlay at *Overview*).

## Out of scope
- The 1929 Exposition round it (the other pavilions, the Four Columns' history), beyond what OSM's buildings give.
- The basement under the plinth and the annex's rooms (it's drawn as a closed block).
- The Fundació's temporary interventions.
- The stones' veining and book-matching: each stone is one colour.
- The statue's real form (Q2), and the chairs' real forms: they're blocky stand-ins.

## Open questions
- [x] **Q1: Which state?** **The 1986 reconstruction as it stands**, with its red curtain; the intro text says it's a
      reconstruction.
- [x] **Q2: Georg Kolbe's statue.** **A blocky bronze stand-in** of the statue's size and place, a standing figure only in
      outline, credited in the code as "a stand-in for Georg Kolbe's *Der Morgen*", not a likeness.
- [x] **Q3: The 1.09 m grid.** **3.5 studs a module on average** (slabs 7 × 3 and 7 × 4 studs), the building about 2% small.
- [x] **Q4: Disclaimer.** **"Fan tribute. Not affiliated with the Fundació Mies van der Rohe or the Ajuntament de Barcelona."**
- [x] **Q5: The noun.** **`text.noun: 'pavilion'`** ("1,234 in the pavilion").

## Implementation notes
- **Files:** `scripts/houses/barcelona-pavilion.mjs`; `src/houses/barcelona-pavilion/` (`layout.ts`, `site.ts`, `house.ts`,
  `interior.ts`, `landscape.ts`, `pavilion.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`,
  `worker.ts`); `barcelona-pavilion/index.html`; `public/barcelona-pavilion/` (`neighborhood.bin`, `thumbnail.jpg`); the registry
  entry; `PAGES`; the shared test lists (`buildOrder`, `cameraGround`, `credits`, `houses`, `shortlistBuilt`, `viewsClear`);
  `src/houses/stats.ts` (`npm run stats`). `public/og-image.jpg` not remade (left for the merge).
- **The fit:** OSM way 67917935 at −63° (search −69…−56°), **IoU 1.000** (OSM's roof rasterises to exactly the 81 × 46 stud
  rect). The model's x runs along the plinth (NNW → SSE), z from the front to the back; the spec's search range was written for
  a short-axis frame but contained the best rotation anyway. y = 0 is pinned at 44.42 m (`lotElevationM`): the tiles read the
  ground at the stair's foot at about 43.12 m, plus 1.30 m.
- **The grid:** 3.5 studs a module; module line m at m × 3.5, `M(m)` its nearest stud. The plinth is 182 × 60 studs (52 × 17
  modules; 55.5 × 18.3 m, −2.0% and −1.0%). The slabs are 7 studs along x by 3 or 4 across. Columns at modules 7/13/19/25 along
  and 7/13 across (6 modules = 6.54 m both ways) [assumed].
- **What OSM settled that the spec left open,** and so how the model differs from a plain rectangle:
  - **The plinth is notched:** OSM's paved areas and its stair (way 1104411454, rising SSE from x 40 to 52) show the plinth
    stepping back to the main roof's front edge in front of its NNW half, with the stair coming up beside the notch. The model
    keeps the 52 × 17-module bounding rect but leaves that 38 × 14-stud corner at ground level, paved.
  - **The annex reaches 21 ft back beyond the plinth** onto the slope (way 1104411434), standing on a travertine base there.
  - **The large pool reaches the front edge** (a stud of coping), its U of travertine is the end wall and a 31-stud arm along
    the front (way 1104411436); the 41.5 m "wall" along the front (way 1104411440) is the plinth's own face, not a free wall.
  - **The small pool fills its court,** as OSM maps it (12.3 × 4.6 m), with Kolbe's node in its back corner.
  - The pools fit at about IoU 0.93 (large) and 0.85 (small) (A6).
- **The stair:** 8 risers over 11 plates, so they alternate 1 and 2 plates (12 and 24 cm); 2-stud treads.
- **The columns** are crosses of five thin round bars, so they read slender: a stud is 0.3 m, so the cross is 0.9 m across
  against the real one's much less. The glass's mullions are bars too, every second module line.
- **The ground:** the tiles rise about 14 ft along the plinth toward the SSE, which would bury the large-pool end. Round the
  pavilion the ground is levelled instead: paved at the stair's foot (−11 plates) along the front and both ends, rising behind to
  3 plates under the plinth's top, easing into the real ground over the last 50 ft to the lot's edge (so the hillside toward
  the Palau de Victòria Eugènia is steep within the lot). The paved forecourt runs out to the lot's front edge (OSM's
  footway areas toward the plaça); the OSM trees there are drawn at their places.
- **Interior:** the onyx wall (6 modules × 3.05 m), the black carpet, two Barcelona chairs with stools and a black-glass table
  before the onyx, and a second pair of chairs behind it [assumed: WikiArquitectura counts four]. The red curtain hangs from the
  main roof along the inside of the green glass (Q1).
- **Scenery:** `{ chaparral: true, sea: true, city: { maxY: -40 } }`: Montjuïc's slopes, the city on the flats below, the sea.
- **Pieces: 26,996; 1:36 at 1×** (site 18,487, foundation 1,578, floor 1,257, structure 360, interior 109, envelope 1,717, roof
  382, landscape 3,106). Close to the Stahl House's 27,233.
- **Tests:** `tests/barcelonaPavilion.test.ts` covers A1–A10, A12–A14 and A16; A11 is in `tests/buildOrder.test.ts`, A15 in
  `tests/viewsClear.test.ts`. A16 failed first for the right reason (no registry entry); the rest were written alongside the
  model and passed as it was built. `viewsClear` caught the first *Overview* inside the Palau de Victòria Eugènia; it was moved
  to the plaça's side.
- **Deviation, *The entrance*:** OSM puts the stair's top in front of the main roof, NNW of the large pool, so "from the top of
  the stair, across the large pool to the roof" can't be had: from there the pool is to one side and the roof overhead. The view
  stands at the large pool's far (SSE) end instead and looks back across the water to the roof over the green marble, the onyx
  and the glass.
- **Manual checks** (headless Chromium, software-rendered with SwiftShader, on a machine shared with three other builds):
  - **A17 pass:** at 0:45 the eight columns stand alone on the paved plinth beside the empty basins; at 1:14 (just before the
    roof phase) the onyx wall, the chairs, the marble, travertine and glass walls and the curtain-less frame stand under no roof,
    the pools still dry; the roofs follow, then the water, the statue and the trees.
  - **A18 pass:** *The entrance* looks across the light green water of the large pool to the thin white roof floating over the
    dark green marble, the onyx and the tinted glass on their chrome columns, the travertine bench wall at the left (see the
    deviation above: from the pool's far end, not the stair's top).
  - **A19 pass:** *From above* with No roof shows the plan as it's usually drawn (large pool left, small court right, the
    entrance below): the onyx, the long green marble wall, the glass walls and the curtain as separate lines, none meeting; only
    the two U's of the courts are joined at their corners, as in the plan.
  - **A20 pass:** the home page's card is live with its thumbnail, 26,996 pieces and its colour bar; the credits page lists the
    building with its no-affiliation line and sources.
  - **A21 pass, the phone part emulated:** all five views open where they should; No roof cuts both slabs; in Walk (driven by
    script) the walker went up the 8 steps from the paving (y −4.4 ft) to the plinth (y 0), along the terrace, in round the green
    glass's end, past the onyx and the chairs, round the grey glass, and out the back between the small court's wall and the long
    marble wall onto the slope (y −1.2 ft), with no door. "Out the other end" is out the back: the NNW end is the small court's
    closed U, as in the real plan. On an emulated iPhone 13 the touch walk controls (thumbs hint, Jump) show and the stick moves
    the walker; real touch gestures on a real phone weren't checked.
  - **A22 not measured on a real GPU:** with `?debug&dpr=1.75` at *Overview*, the overlay read 10 fps for both the Stahl House
    (1,885,078 triangles, 14 calls) and the pavilion (1,880,069 triangles, 13 calls); software rendering caps both, so it only
    shows the two are alike in load (and the piece counts are within 1%).
- **Thumbnail:** `/barcelona-pavilion/?cam=94,26,-80,90,7,34&clean&date=2026-06-21`, 1200 × 675.
- **`npm run check`:** green with `--maxWorkers=2`. Under the default worker count, on this shared machine (load 20–30), six
  other houses' heavy tests (Ennis, Malaparte, Sheats-Goldstein, Farnsworth, Schröder, buildOrder) hit vitest's 5 s timeout;
  they pass alone and with two workers. Nothing in them changed.
- **Left for Erik:** a real-GPU performance comparison with the Stahl House (A22) and the walk on a real phone (A21's touch
  part); the link-preview image (`npm run og-image`) after merging; usage figures once committed.

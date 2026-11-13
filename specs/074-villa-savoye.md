# 074 — The Villa Savoye

- **Status:** In progress (approved by Erik 2026-11-12: "approved for all, build until done", taking the recommended answers; Q1 changed by Erik the same day: "Villa Savoye can go live")
- **Owner:** Erik
- **House:** villa-savoye
- **Created:** 2026-11-12
- **Commits:** <!-- filled in when Done -->

## Goal
The Villa Savoye in Poissy (1928–31), by Le Corbusier and Pierre Jeanneret: a weekend house for Pierre and Eugénie Savoye, and the
building that shows the "five points of a new architecture" most completely. A white box on thin columns, with one ribbon window
running round all four sides; under it, a dark green ground floor whose glass end curves round to the turning circle of a car; inside,
a ramp that climbs from the hall to the living floor and on to a roof garden, where curved walls shelter a solarium. It would be built
block by block on its real lawn above the Seine, with the same viewer, and take a new live card on the home page. It would be the first
building in France. On the shortlist it's ★★ (`src/dev/shortlist.ts`, slug `villa-savoye`), for the curves and the ramp. Spec 020
recommended it as the most famous house left on the list. **Q1 (rights) decides whether it can go live at all.**

## Research (2026-11-12)
**Status today:** owned by the French state (the town of Poissy expropriated the Savoyes in 1958 and passed the villa to the state in
1962) and run as a museum by the **Centre des monuments nationaux** (CMN), open Tuesday to Sunday. Listed as a *monument historique* in
December 1965, months after Le Corbusier's death (fr.wikipedia gives 16 December, the Fondation Le Corbusier 12 December). Part of the
UNESCO World Heritage site "The Architectural Work of Le Corbusier" since July 2016 (component 1321-006, with 16 other works in seven
countries). Restored 1963–67 (Jean Dubuisson), 1985–97 (Jean-Louis Véret); the gardener's lodge was restored and opened in 2015.
fr.wikipedia mentions a museum of 7,500 m² planned nearby, due to open in 2027.

**Sources, and what each gave:**
- **Cité de l'architecture et du patrimoine**, the fact sheet for its 1:100 model of the villa (`fo_villasavoye_def.pdf`), the best
  single source found:
  - floor area 440 m², of which **190 m² footprint on the ground**; **roof garden 110 m²**; **solarium 70 m²**; lodge 40 m²;
  - **4.75 m between pilotis**, "so a car can pass";
  - the **main entrance front faces north-west**, with the solarium above it; the first-floor terrace leading up to the roof is to
    its right as you face it, the living quarters to its left;
  - the ground floor: a **60 m² hall**, the chauffeur's flat, a laundry, two maids' rooms, a **garage for three cars**, a WC; the
    geometry of the ground floor was set by **a limousine's turning circle, so it could drive round the house without reversing**;
  - the first floor: the **living room faces north-west, the terrace south**; the living room is a rectangle of **84 m²**, its
    walls **light blue, pink and white**, with sliding glass onto the terrace; the kitchen tiled in white with metal-fronted cupboards;
    the bedrooms with built-in storage at head height that also forms partitions;
  - reinforced-concrete posts and beams, brick or plaster infill, **sliding steel windows**; the ribbon window runs round all four
    sides without a break; the solarium "mainly curved walls", sheltering it from the wind.
- **The CMN's site** (villa-savoye.fr): the **ground floor is dark green** ("vert foncé", "vert anglais") to hide it in the meadow;
  **white** is the villa's dominant colour above; eight Salubra shades inside (not named per room). The roof garden: planters, a
  concrete floor with lines of grass in its joints, a **fixed table**, a semi-open kiosk, and an opening that **extends the ribbon
  window** in the garden's wall. The solarium is open to the sky behind a **curved concrete screen** with a rectangular opening (the
  "trou dans le mur") framing the Seine's meanders. The ramp is in the middle of the hall, in **two parallel flights**, starting inside
  and finishing outside; a **helical stair** beside it.
- **Inexhibit** (*Villa Savoye, part 2*): the plan is a square grid of **25 columns**; the grid was reduced from 5 m to **4.75 m** in
  late 1928 to cut costs. The park is now about one hectare, bordered by **fourteen trees** and some rose bushes. A blue ceramic
  bathtub in the main bathroom.
- **en.wikipedia:** the pilotis are **flush with the façades on the two long sides and set back on the short sides**; two "baby
  piloti" stiffen the wall above the terrace's strip opening; four columns in the hall face the ramp; the curved ground-floor glazing
  follows the car's turning circle. The lodge was reduced from a double lodge to a single one.
- **fr.wikipedia:** **21.50 × 19 m, 9.40 m high**; seven hectares originally, six taken for the lycée in 1958. The lodge: **33 m²**,
  two 5 m² bedrooms, built on the villa's principles, **three blind walls and one long window on its south front**.
- **Sources disagree on the car:** a 1927 Citroën (ArchEyes), a 1929 Voisin, "a limousine" (the Cité). None gives the radius.
- **OSM:**
  - the villa: way **38327851** (`wikidata=Q940746`, `ref:mhs=PA00087573`, `building:levels=3`), a rectangle **21.4 × 18.7 m**
    (399 m²), its long sides at **144.7° / 324.7°** and its short sides at **54.6° / 234.6°**. So the short ends face north-west
    (the entrance) and south-east (toward the gate). Centre 48.924445, 2.028229.
  - the park: way **155851392** ("Villa Savoye", `tourism=attraction`), 1.03 ha, matching the documented hectare.
  - the lodge: way **410063805** ("Loge du jardinier"), **7.0 × 4.1 m** (29 m²), about **96 m east-south-east** of the villa by
    Rue de Villiers, its sides at 128° / 38°: **about 17° off the villa's axes**.
  - the drive: way **410026670** (fine gravel) runs from the gate by the lodge to the villa's south-east end and loops there.
  - Rue de Villiers about 80 m to the south-east; the Cité scolaire Le Corbusier (the 1958 lycée) about 110 m south-west; a
    wooded patch just south-east; a tree row to the north-west.
  - the Seine: its nearest point is about **680 m north-north-west** (343°). Terrain (SRTM, via Open-Elevation): about **72 m**
    at the villa and the gate, about 24 m toward the river. The lawn is level; the plateau falls toward the Seine beyond the park.
- **Not obtained:**
  - **any section or height** apart from the overall 9.40 m: not the ground floor's or the first floor's height, the ribbon
    window's sill and head, the parapets or the solarium screen's height;
  - **the radius of the curve** and the ground floor's exact plan (only the rooms' list and areas above). The FLC's plans are
    published (ArchEyes shows the ground floor, first floor and roof plans and an elevation, © FLC), but I haven't scaled them here:
    whether the build may use them is part of Q1;
  - the ramp's width and slope; the stair's diameter; which side the garage doors face;
  - the bedrooms' and bathrooms' colours (eight Salubra shades, not assigned to rooms in anything I found);
  - the Île-de-France heritage inventory's dossier on the villa (its PDF is behind a bot check);
  - the lodge's height; its area is 29 m² on OSM, 33 m² on fr.wikipedia, 40 m² in the Cité's sheet.

## Proposed approach
- **Data:** `scripts/houses/villa-savoye.mjs`, fitted by OSM's way 38327851 (`wikidata: 'Q940746'`), with a rotation search round
  **−55°** (−61…−49°; sign as in `haus-am-horn.mjs`, confirmed by the fit). `lotFeatures: true`; the lot covers the park (way
  155851392) and the lodge, about 160 × 130 m. Scenery: none new; the town and the lycée come from the neighbourhood as usual.
- **The grid (Q2):** 16 studs a bay, so the pilotis are 4.88 m apart (+2.7%) and the box is 64 × 72 studs (19.5 × 21.9 m), with
  everything on the grid as drawn. The 25 pilotis are `round` pieces, the box's floor and roof plates over them.
- **Heights [assumed]** (to be scaled from the FLC sections if Q1 allows): the first floor at 3.2 m, the roof at 6.4 m, the
  solarium screen's top at **9.40 m** [documented overall height]; the ribbon window from 1.0 m to 2.1 m above the first floor.
- **The villa** at `/villa-savoye/`:
  - **ground floor:** the 25 white pilotis; the enclosed ground floor recessed behind the long sides' pilotis so the drive passes
    under the box on both sides, its north-west end a **semicircle of glass** (radius about one bay, 4.75 m [assumed]) round the
    entrance; the hall with its four columns, the ramp and the helical stair; the garage for three cars, the chauffeur's flat, the
    laundry, the maids' rooms; the walls dark green; about 190 m² enclosed;
  - **the box:** white walls with the ribbon window on all four sides, in sliding steel frames; on the terrace's sides the same
    band continues as an open slot, with the two "baby piloti";
  - **first floor:** the living room (84 m², north-west, light blue, pink and white walls), the kitchen (white tiles), the
    bedrooms with their built-in storage, the bathrooms (the blue bath), the boudoir; the terrace (south) open to the sky, with its
    sliding glass wall to the living room;
  - **the ramp:** two flights from the hall to the first floor, and two more outside from the terrace to the roof, built as
    **steps of one plate** like the Rose Seidler House's ramp (spec 043), no new piece;
  - **the roof:** the roof garden's planters and fixed table; the **solarium's curved screen walls stepped stud by stud**, as the
    Koshino House's studio and the Douglas House's curves (specs 039, 045), with the rectangular opening toward the Seine.
- **The lodge:** a 7.0 × 4.1 m white box at its OSM place, with one long window on its south front and three blind walls. It's
  **squared to the villa's grid (Q5)**, about 17° off its real angle.
- **The landscape:** the level lawn of the park, the gravel drive from the gate by the lodge to the villa and round under it,
  fourteen trees round the park's edge, rose bushes, and the wooded patch to the south-east.

**Build story** (roles per spec 012):
1. *The meadow above the Seine* (**site**).
2. *The footings* (**foundation**).
3. *The ground-floor slab and the drive's bed* (**floor**).
4. *The pilotis, the first floor and the ramp* (**structure**): the 25 pilotis, the hall's columns, the first-floor slab, the inner
   ramp and the helical stair; the lodge's walls.
5. *The rooms* (**interior**): partitions, the kitchen, the bathrooms, the built-in storage, the hall's fittings.
6. *The green ground floor, the curved glass & the ribbon window* (**envelope**): the ground floor's walls and its curve of glass,
   the box's walls, the ribbon window and the terrace's sliding glass; the lodge's window.
7. *The roof garden & the solarium* (**roof**): the roof slab, the outer ramp's flights, the planters, the fixed table, the curved
   screens; ceiling lights with `b.hanging(P.ROOF, …)`; the lodge's roof.
8. *The park, the drive & the trees* (**landscape**).

About **2½ minutes** (a compact box, but three levels and two ramps).

## Behavior
- **Home page:** a new live card, with a thumbnail from the north-west lawn: the white box floating on its pilotis, the dark
  green curve of glass under it, the solarium's curve on top. Its piece count and credits as for the other houses. **Only if Q1 is
  answered "go live";** otherwise the house is built but stays unregistered (as spec 044's Vanna Venturi House).
- **Viewer:** `/villa-savoye/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights.
- **Views:**
  - *Overview*;
  - *Up the drive*: from by the lodge, the box at the end of the gravel drive, as a visitor arrives;
  - *The entrance*: the north-west front, the curved glass under the box between the pilotis;
  - *The ramp*: in the hall, looking up the ramp's first flight;
  - *The roof garden*: from the terrace, the ramp climbing to the solarium and the slot in the wall;
  - *From above*: the box, the terrace's open square inside it, the solarium's curves.

## Acceptance criteria
**House**
- **A1** [unit] The box fits OSM's way 38327851 (IoU ≥ 0.75) and is 19 × 21.5 m (each side within 2 ft, allowing for Q2's grid).
- **A2** [unit] 25 pilotis, round, on a 5 × 5 grid with equal spacing (4.75 m within 0.5 ft, or Q2's bay); the long sides' rows
  flush with the box's long façades, the short façades overhanging the end rows by 1.25 m (within 1 ft). Each piloti runs from the
  ground to the underside of the first floor.
- **A3** [unit] The ground floor's glass at the north-west end curves: its pieces lie within 1 ft of one circular arc of at least
  150°, of radius 4.75 m within 1.5 ft (or the radius scaled from the plan, if Q1 allows).
- **A4** [unit] A car can drive round the house without reversing: a 2.5 m-wide path [assumed] from the south-east end, under the
  box down one long side, round the curve and back along the other is clear of every piece, and the drive's gravel lies under it.
- **A5** [unit] The enclosed ground floor is 190 m² (within 15%) and its walls are dark green; the box's outer walls and the
  pilotis are white.
- **A6** [unit] The ribbon window: on each of the four façades, one horizontal band at the same sill and head heights, glazed in
  front of rooms and open in front of the terrace, with no piece of wall across it except its frames and the two baby piloti.
- **A7** [unit] The heights: the solarium screen's top 9.40 m above the lawn (within 1 ft); the first floor and the roof at the
  assumed levels (within 0.5 ft).
- **A8** [unit] The ramp: two flights from the hall to the first floor and two from the terrace to the roof, each rising at most one
  plate per step, each flight's top meeting the next floor or landing with no gap.
- **A9** [unit] The first floor: a living room of 84 m² (within 15%) on the north-west side; a terrace open to the sky on the south
  side; with the roof garden 110 m² and the solarium 70 m² (each within 20%).
- **A10** [unit] The solarium's screen curves: each curved wall's pieces lie within 1 ft of a circular arc of at least 60°; it has
  one rectangular opening, facing between north-west and north-east [assumed] (toward the Seine).
- **A11** [unit] The lodge: 7.0 × 4.1 m (within 1 ft), its centre within 2 m of OSM's way 410063805; one long window on its south
  front, its other three walls blind.
- **A12** [unit] The model invariants hold: no overlaps, inside the grid, deterministic; every phase used; about 2½ minutes.
- **A13** [unit] `tests/buildOrder.test.ts` covers it (its definition in `DEFINITIONS`): phases in role order, nothing floats,
  nothing dropped.
- **A14** [unit] Every element is marked **[documented]**, **[scaled]** or **[assumed]**, with at least 10 marks in the interior.

**Site**
- **A15** [unit] The lot terrain meets the real terrain at its edges; the lawn round the villa is level (within 2 ft across the
  park's part of the lot).
- **A16** [unit] No terrain spikes (the spec 010b check).

**Home and credits**
- **A17** [unit] The home card is live, with the real piece count, its credits and Q7's disclaimer (Q1, changed: live).
- **A18** [manual] The build plays in order: the pilotis and floor before the rooms, the rooms before the walls and glass, the roof
  garden and solarium after, the park last.
- **A19** [manual] The thumbnail reads as the photographs: a white box floating on thin columns, the dark green curve under it.
- **A20** [manual] *The entrance* shows the curved glass between the pilotis; *The ramp* shows the ramp rising from the hall;
  *The roof garden* shows the outer ramp and the solarium's curves.
- **A21** [manual] The home page shows the new card live, with its thumbnail. The credits page lists it.
- **A22** [manual] All views, No roof, Walk and the phone controls work.
- **A23** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.

## Out of scope
- Smooth curves or sloped pieces: the curves and the ramp are stepped, with no new engine piece.
- Rotating the lodge to its real angle (a rotated-pieces feature would be a spec of its own; see Q5).
- The original seven-hectare estate, its orchards and meadows; the 1958 lycée beyond what the neighbourhood draws.
- The museum planned near the villa.
- The Seine itself, beyond what the neighbourhood renderer already draws.
- Furniture beyond the fitted pieces (kitchen, storage, bathrooms, the roof garden's fixed table); cars in the garage.
- The villa's state between 1940 and 1963 (requisitioned, damaged), and the cellar.

## Open questions
- [x] **Q1: Rights.** I'm not a lawyer; this is reasoning, not advice. This one differs from the earlier houses:
      - Le Corbusier died in 1965, so in France his works are under copyright until 1 January 2036; as a joint work with Pierre
        Jeanneret (died 1967), possibly until 1 January 2038.
      - The **Fondation Le Corbusier** owns the moral and economic rights, managed with **ADAGP**. Its site says any reproduction of
        his buildings, "total or partial, in two or three dimensions", needs a prior request to both, and may carry a fee and the
        credit "© FLC-ADAGP".
      - France's freedom-of-panorama exception (2016) covers only non-commercial reproductions, by individuals, of works on the
        public way. The villa stands in a ticketed park.
      - LEGO Architecture sold a Villa Savoye set (21014, 2012), presumably under licence (not verified). So the FLC does license
        toy-block models of it.
      - Earlier specs went ahead and named the foundation in the disclaimer: the Barragan Foundation (spec 035 Q3), the Frank Lloyd
        Wright Foundation, the Alvar Aalto Foundation (spec 058), Ando's office (spec 039). None of them states a 3D-reproduction rule
        as plainly as the FLC does.
      - *Recommended:* **write to reproduction@fondationlecorbusier.fr and to ADAGP, describing the site, before the villa goes live.
        Build it now, but keep it unregistered, as spec 045 did with the Vanna Venturi House. It goes live only on a
        yes, with their credit line. On a refusal or a fee you don't want, it stays hidden until 2036–2038.**
      - The alternative is to skip it for a building whose rights are clearer.
      - **Changed by Erik 2026-11-12, after it was built hidden: "Villa Savoye can go live".** It goes live now, without having
        written to the foundation or ADAGP first, with Q7's disclaimer and no "© FLC-ADAGP" line (that credit comes with
        permission). The plan is still drawn without the FLC's drawings (Q3).
- [x] **Q2: The grid.** 4.75 m is 15.6 studs. *Recommended:* **16 studs a bay** (19.5 × 21.9 m, 2–3% over), so everything lines up as
      drawn, as spec 057 did for the Neue Nationalgalerie. The alternatives are 15 studs (18.3 m, 3.7% under) or bays alternating
      15 and 16.
- [x] **Q3: Sources for the plan and heights.** *Recommended: the FLC's published plans, scaled to OSM's outline* (Q1 permitting),
      with the Cité's areas and the CMN's descriptions for the rest. Everything else is marked [assumed], with the heights in Proposed
      approach, and the spec says so. If Q1 rules the drawings out, the plan comes from the documented areas and photographs only.
      **Decided with Q1: the drawings aren't used without the foundation's permission, so the plan comes from the documented areas,
      OSM and photographs only; nothing is [scaled].**
- [x] **Q4: Which state?** *Recommended:* **as restored and shown by the CMN today**: the dark green ground floor, white above, the
      living room's light blue, pink and white, sparsely furnished as visitors see it.
- [x] **Q5: The lodge's angle.** It stands about 17° off the villa's axes. *Recommended:* **square it to the villa's grid at its real
      place.** A 7 × 4 m box stepped at 17° would look ragged. The alternative is to leave the lodge out.
- [x] **Q6: Timing.** *Recommended:* **about 2½ minutes.**
- [x] **Q7: Disclaimer.** *Recommended:* **"Fan tribute. Not affiliated with the Centre des monuments nationaux or the Fondation Le
      Corbusier."** If the FLC grants permission, add their required "© FLC-ADAGP" to the credits page.

## Implementation notes
- **Built hidden, then made live (Q1 changed).** It was first built and kept off the site, as spec 045 did with the Vanna Venturi
  House. The same day Erik decided it goes live: it now has a registry entry in `src/houses/index.ts` (with the foundation and
  the CMN in its affiliations, so the credits page names them), a `PAGES` line, and the shared live-house tests list it. A17 and
  A21 are back to their live versions; A17's test checks the live card, the piece count and the disclaimer. No "© FLC-ADAGP" line:
  that credit comes with permission, which hasn't been asked for.
- **Files:** `scripts/houses/villa-savoye.mjs`; `src/houses/villa-savoye/` (`model/layout.ts`, `site.ts`, `house.ts`,
  `interior.ts`, `landscape.ts`, `villaSavoye.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`,
  `worker.ts`); `villa-savoye/index.html`; `public/villa-savoye/` (`neighborhood.bin`, `thumbnail.jpg`); `tests/villaSavoye.test.ts`.
  Shared files: `tests/buildOrder.test.ts` (in `DEFINITIONS`, with a `HIDDEN` list so A2 still compares only live houses),
  `tests/cameraGround.test.ts` (listed, as the Vanna Venturi House is), `src/houses/stats.ts` (`npm run stats` covers every
  house with a definition, hidden or not; one line added).
- **The fit:** OSM way 38327851 at −55° (search −61…−49°), offset (23, 38) ft, **IoU 0.905**. The box is 73 × 65 studs
  (22.3 × 19.8 m) against OSM's 21.4 × 18.7 m: the 16-stud bay (Q2) puts it 2.7% over, and the long sides' pilotis are one stud
  wide on the façade line.
- **Numbers:** **37,053 pieces** (7,471 the villa and the lodge); **2:31** at 1× (150.7 s). The ground floor encloses 164 m²
  (−14% of 190 m², inside A5's 15%); the living room 87 m²; the roof garden 114 m²; the solarium 65 m².
- **The plan (all [assumed], nothing [scaled]):** no plan or section was used (Q1/Q3). The ground floor's walls run along the
  inner rows of pilotis (z = 16, 48), its north-west end a semicircle of glass of radius 16 studs (4.9 m) round the hall. The
  hall (60 m²) takes the curve and a band round the ramp; the maids' rooms, the laundry and the WC along the north-east side,
  the chauffeur's flat on the south-west, the garage (three bays, doors on the south-west) at the south-east end. On the first
  floor the living room runs along the north-west and south-west corner, with its sliding glass onto the terrace (the south
  quarter, open to the sky); the kitchen, pantry, two bedrooms and two bathrooms along the north-east side off a corridor; a
  boudoir at the east corner. The roof garden covers the north-west third round the solarium.
- **Heights:** first floor 27 plates (10.8 ft, 3.2 m assumed), ribbon window 35–44 plates (1.0–2.1 m above the floor), ceiling
  50, roof 53 (21.2 ft, 6.4 m assumed), parapet 60, solarium screen 77 (30.8 ft = 9.40 m, documented).
- **The car path (A4):** a U of 9-stud (2.7 m) lanes: under the box down the north-east side between the outer and inner rows
  of pilotis, across the north-west end between the end row and the curve, back along the south-west side, joining OSM's drive
  loop south-east of the villa. It's a stepped U, not the car's actual turning circle (no radius is documented).
- **The ramp:** four flights of 2-stud steps rising one plate each (a slope of 1 in 5, [assumed]), 4 studs wide, either side
  of the middle row of pilotis. The two pilotis in the ramp's well run on up to the first floor's ceiling. The well is open to
  the sky through the roof, glazed toward the terrace and walled toward the corridor; the outer flights rise in it, so they're
  "outside" in the sense of open to the sky rather than on the open terrace as in the real house (a simplification).
- **The solarium:** a quarter circle (r 14.5 studs) round the north corner, the straight north-west wall with the opening
  (12 × 10 plates, at the parapet's top, facing the Seine), and a half circle (r 8.5) closing it toward the south-west; open
  toward the roof garden. Each arc is laid in its own runs so no piece spans two of them.
- **The lodge:** 23 × 14 studs at OSM's centre, squared to the villa's grid (Q5); its long window and a door [assumed] on the
  south(-west) front, 2.7 m walls [assumed], a flat roof.
- **The park:** level at the villa's height inside OSM's park outline, easing into the real ground outside it; the woods of
  OSM's way 985370239 filled with trees on a jittered 24 ft grid; the fourteen trees spaced evenly along the lawn's edge; rose
  bushes inside the drive's loop; the park's wall along Rue de Villiers with the gate between its two runs.
- **Deviations:**
  - The tests were written alongside the model rather than strictly before it; the first run failed for real reasons (walls laid
    across the ribbon window's band, pieces spanning two arcs, the two pilotis in the ramp's well stopping short, the grid too
    low for the plateau's edge), which were fixed in the model.
  - *The roof garden* view looks from over the bedrooms' roof rather than from the terrace: from the terrace the glass and
    the roof's edge hide the outer ramp and the solarium.
  - No loose furniture (Out of scope); the interior is the partitions in their colours, the kitchen, the built-in storage,
    the bathrooms (the blue bath), the fireplace, the hall's basin, the laundry and the WC.
  - The kiosk on the roof garden and the opening in the garden's wall continuing the ribbon window aren't modelled.
- **`npm run check`:** `tsc` (src and tests) passes; the whole suite passes (79 files, 547 tests) with `--testTimeout=120000`.
  With the default 5 s timeout, model-building tests of several houses (Ennis, Malaparte, Sheats-Goldstein, Farnsworth, and this
  one in `buildOrder.test.ts`) time out on this machine while four builds run in parallel (load average about 35); they pass
  when given the time. Worth re-running `npm run check` on a quiet machine before committing.
- **Manual checks** (headless Chromium with SwiftShader, `npx vite --port 5184`, `?debug`):
  - **A18 pass:** paused half a second before the envelope: pilotis, slab, ramp and the rooms' partitions (blue, pink), no outer
    walls or glass; before the roof: the white box, the ribbon window, the green ground floor, no roof garden or solarium;
    before the landscape: everything but the trees and roses.
  - **A19 pass:** the thumbnail (`/villa-savoye/?cam=-38,13,78,33,12,30&t=999&clean&date=2026-06-21`, 1200 × 675) shows the white
    box on its thin columns, the ribbon window, the dark green curve of glass under it and the solarium's screen with its opening.
  - **A20 pass:** *The entrance* shows the curve of glass in green frames between the pilotis; *The ramp* looks up the first flight
    from the hall; *The roof garden* shows the outer ramp's stepped parapet climbing out of its well, the grass-jointed roof
    garden, the fixed table and the solarium's curves with the opening.
  - **A21:** not applicable while hidden; the home and credits pages don't list it (by design).
  - **A22 partly checked:** all six views open where they should (the camera ends at each view's position); No roof shows the
    first floor's rooms from above; Walk starts on the drive facing the entrance and moves forward on W. On a phone-sized
    touch viewport the page loads with its compact HUD (Views, numbers, settings, timeline); switching to Walk from the
    settings menu by tap timed out in the headless browser, so the phone controls weren't confirmed.
  - **A23 not measured:** SwiftShader runs at about 10 fps for every house, so it says nothing about performance.

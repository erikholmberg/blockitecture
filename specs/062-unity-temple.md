# 062 — Unity Temple

- **Status:** In progress: built, waiting to be committed (approved by Erik 2026-11-11: "can you build 4 more buildings", choosing "the safe four" and to treat that message as
  approval of the specs written for it, as for specs 055–058)
- **Owner:** Erik
- **House:** unity-temple
- **Created:** 2026-11-11
- **Commits:** <!-- filled in when Done -->

## Goal
Frank Lloyd Wright's Unity Temple (1905–08) on the corner of Lake Street and Kenilworth Avenue in Oak Park, Illinois: one of the
first public buildings in exposed poured concrete. A cube closed to the street, with a stair tower at each corner, lit from
above through 25 amber skylights and a band of clerestory windows; a low entrance foyer; and Unity House, the congregation's
hall, behind. It's the site's third Wright building and its second place of worship. It's built block by block on its real
corner, with the same viewer, and takes a new live card on the home page. On spec 054's list it's ★★★.

## Research (2026-11-11)
**Status today:** owned and used by the Unity Temple Unitarian Universalist Congregation. Restored 2015–17 (Harboe Architects).
A National Historic Landmark (1970) and part of the UNESCO World Heritage listing of Wright's work (2019). Tours are run by the
Frank Lloyd Wright Trust.

**Sources:**
- **The Historic American Buildings Survey, HABS IL-1093 (1967):** seven measured sheets and data pages. Only the auditorium-level
  plan (sheet 4) carries written dimensions:
  - 142′-0″ long and 91′-6″ wide overall;
  - the temple 64′-0″ across its four stair towers, each 11′-8″ square, the alcove walls 38′-0″ long and 1′-4″ proud;
  - the foyer 24′-10″ by 27′-4″;
  - Unity House's bays (8′-4″, 10′-2″, 15′-10″, 22′-10″ and back; 10′-0″, 23′-5″, 10′-0″, 7′-6″).
- **Scaled from the HABS elevations and section (±0.5 ft):** every height. The auditorium's floor at +7 ft, the galleries at
  +10.5 and +20.5 ft, the clerestory from +21.5 to +34.6 ft, the roof slabs to +36.8 ft, the attic to +44.8 ft; the towers
  +29.3 ft; the foyer's roof and Unity House's corner blocks +22.3 ft.
- **The HABS data pages and Wikipedia:** poured concrete with a washed pebble aggregate; six columns a side with cast ornament
  on their upper 5 ft; a Greek-cross room with four hollow piers; two tiers of galleries on three sides, the pulpit on the
  south; 25 coffered skylights of amber glass; six doors on each side of the foyer, behind terrace walls, under the inscription
  FOR THE WORSHIP OF GOD AND THE SERVICE OF MAN.
- **OSM:** way **25885395** (`wikidata=Q1680814`), running true north–south, the temple on Lake Street.
- **Sources disagree** on the towers' height (29.3 ft scaled, 24.5 ft in Wikipedia) and the total height (about 46 or 47 ft).

## Proposed approach
- **Data:** `scripts/houses/unity-temple.mjs`, fitted by OSM's outline; the lot's buildings and streets as lot features.
- **The building** at `/unity-temple/`:
  - the temple: the four stair towers, the three proud alcove walls solid to the clerestory's sill, the notches with their slit
    windows, the clerestory's columns and glass, the cross of roof slabs, the coffered skylights, the attic round them;
  - inside: the four piers, the two tiers of galleries, the pulpit and the organ's screen, the pews, the pendant globes;
  - the foyer with its banks of oak and art-glass doors, the inscription as a band of bronze, the two raised terraces behind
    their bulkhead walls, and the steps up to them;
  - Unity House: the hall under its skylight, the wings with their columned ends and balconies, the corner blocks, the
    chimney, the kitchen's bay.
- **The site:** lawn, the two streets and their pavements, street trees, the neighbour to the south as a plain block.

**Build story** (roles per spec 012):
1. *The corner of Lake Street* (**site**).
2. *The footings* (**foundation**).
3. *The floors* (**floor**).
4. *The concrete walls, the towers & the galleries* (**structure**).
5. *The pews, the pulpit & the hall* (**interior**).
6. *The columns, the clerestory & the doors* (**envelope**).
7. *The roof slabs & the skylights* (**roof**).
8. *The lawn's trees* (**landscape**).

About 2½ minutes.

## Behavior
- **Home page:** a new live card, with a thumbnail from the corner of Lake Street and Kenilworth Avenue, and its piece count.
- **Viewer:** `/unity-temple/` works like the houses. The numbers panel says "temple" (spec 059).
- **Views:** *Overview*; *From Lake Street*; *The entrance* (the west terrace and its doors); *The auditorium* (the pulpit under
  the skylights); *Unity House*.

## Acceptance criteria
**The building**
- **A1** [unit] The footprint fits OSM's way 25885395 (IoU ≥ 0.75). It's 142 ft long and 91′-6″ wide (within 1 ft).
- **A2** [unit] The temple: 64 ft across four towers of about 11′-8″; the alcove walls 38 ft long, standing proud of the towers,
  with no door or window below the clerestory on the Lake Street side.
- **A3** [unit] The clerestory: on the north, east and west sides, six columns with glass between, from the sill to the roof
  slabs; the columns' upper parts carry the ornament's colours.
- **A4** [unit] The roof is a cross of slabs reaching out past the walls; under its middle, 25 amber skylights in a 5 × 5 grid.
- **A5** [unit] Inside: four piers from the floor to the roof; two tiers of galleries on the north, east and west sides, and none
  on the south.
- **A6** [unit] The foyer joins the temple and Unity House; each side has a bank of doors, hidden from the street by a terrace
  wall taller than a standing person.
- **A7** [unit] The model is symmetrical about its long axis (the house's pieces mirror east to west).
- **A8** [unit] The model invariants hold: no overlaps, inside the grid, deterministic; every phase used; about 2½ minutes.
- **A9** [unit] `tests/buildOrder.test.ts` covers it: phases in role order, nothing floats, nothing dropped.
- **A10** [unit] Every element is marked **[documented]**, **[scaled]** or **[assumed]**, with at least 8 marks in the interior.

**Site**
- **A11** [unit] The lot terrain meets the real terrain at its edges.
- **A12** [unit] No terrain spikes (the spec 010b check).

**Home and credits**
- **A13** [unit] The home card is live, with the real piece count and its credits. The numbers say "temple".

**Manual** (in `npm run dev`)
- **A14** [manual] The build plays in order: the walls and galleries before the pews; the columns and glass before the roof
  slabs; the skylights with the roof; the trees last.
- **A15** [manual] The thumbnail and *From Lake Street* read as the photographs: the closed cube, the towers, the columned
  clerestory under the roof slabs.
- **A16** [manual] *The auditorium* shows the pulpit, the galleries and the amber skylights.
- **A17** [manual] The home page shows the new card live, with its thumbnail. The credits page lists the building.
- **A18** [manual] All views, No roof, Walk and the phone controls work.
- **A19** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.

## Out of scope
- The stairs inside the towers, and the cloisters under the galleries: the towers are hollow, and the auditorium is entered by
  steps beside the pulpit.
- The cast ornament's actual pattern: a two-tone check stands in for it.
- The inscription's letters: a band of bronze marks them.
- The rooms over the foyer.

## Open questions
- [x] **Q1: Heights where sources disagree.** *Decided:* the HABS drawings, scaled.
- [x] **Q2: The south side's clerestory** isn't drawn in the sheets I have. *Assumed:* like the other three sides.
- [x] **Q3: Disclaimer.** "Fan tribute. Not affiliated with the Unity Temple Unitarian Universalist Congregation, the Frank Lloyd
      Wright Trust or the Frank Lloyd Wright Foundation."

## Implementation notes
- **Files:** `scripts/houses/unity-temple.mjs`; `src/houses/unity-temple/` (`layout.ts`, `site.ts`, `house.ts`, `interior.ts`,
  `landscape.ts`, `temple.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`, `worker.ts`);
  `unity-temple/index.html`; `public/unity-temple/`; the registry entry; `PAGES`; the shared test lists.
- **The fit:** OSM way 25885395 at −89.5° (search −94…−86°), IoU 0.784. OSM's outline is simpler than the plan's (it squares
  off the terraces and Unity House's corners), so the overlap is lower than for the other three.
- **Symmetry** is built in: every plan rectangle on the west is the mirror of its eastern twin (`mirror()` in `layout.ts`).
- **What the tests found:** Unity House's floor was missing east of the foyer (a wrong bound), so its tables stood in mid-air
  and the model wasn't symmetrical. `tests/buildOrder.test.ts` A3 and A7 both caught it.
- **The concrete** was first too pale; it's a warmer, darker buff now. The interior view first looked straight at a gallery
  front and was moved to the auditorium's floor.
- **Tests:** `tests/unityTemple.test.ts` covers A1–A8, A10–A13; A9 is in `tests/buildOrder.test.ts`.
- **17,443 pieces; 2:39 at 1×.**
- **Manual checks** (a scripted Chrome window):
  - **A14 pass:** paused half a second before the roof phase, the walls, the towers, the galleries, the columns and the glass
    stand open to the sky; no roof slabs, no skylights, no trees.
  - **A15 pass:** the thumbnail shows the closed cube between its towers, the columned clerestory under the roof slabs, the
    attic, and Unity House behind.
  - **A16 pass:** *The auditorium* shows the pulpit before the organ's screen, the galleries with their oak trim, the pendant
    globes and the amber skylights.
  - **A17 pass:** the card is live with its thumbnail and 17,443 pieces; the credits page lists it; the numbers panel says "temple".
  - **A18 partly checked:** *Overview* and *The auditorium* open where they should. No roof, Walk and the phone controls weren't checked.
  - **A19 not measured.**
- **Thumbnail:** `/unity-temple/?cam=-50,22,125,42,17,46&clean&date=2026-06-21`.
- **Claude usage** (spec 018): not recorded; nothing is committed yet.

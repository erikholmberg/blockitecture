# 057 — The Neue Nationalgalerie

- **Status:** Done (approved by Erik 2026-11-11: "build 4 and don't stop until they're done", choosing to treat that message as approval of the specs written for it; the four are spec 054's top picks. Closed by Erik 2026-11-11: "close the specs", accepting the manual checks that couldn't be run
  here: No roof, Walk, the phone controls and measured performance)
- **Owner:** Erik
- **House:** neue-nationalgalerie
- **Created:** 2026-11-11
- **Commits:** 57da85b

## Goal
Mies van der Rohe's Neue Nationalgalerie (1968) in Berlin's Kulturforum. A square black steel roof, 64.8 m across, rests on eight
cruciform columns over a hall of glass, on a granite terrace. It's the first landmark on the site and the largest building, and
the purest set of planes it could build. It's built block by block on its real corner of Potsdamer Straße, with the same viewer,
and takes a new live card on the home page. On spec 054's list it's ★★★.

## Research (2026-11-11)
**Status today:** owned and run by the Staatliche Museen zu Berlin (Stiftung Preußischer Kulturbesitz). Renovated by David
Chipperfield Architects from 2015 to 2021. It's a listed monument (LDA 09050310).

**Sources:**
- **The roof:** 64.80 m square, 1.8 m deep, top about 10 m above the terrace (TU Dresden, Wikipedia), on a 3.6 m grid. It was
  lifted onto the columns in one piece in 1967.
- **The columns:** eight cruciform steel columns, two to a side at the quarter points, none at the corners. OSM maps them.
- **The glass hall:** 50.4 m square, set back 7.2 m (two bays), 8.4 m clear. There are 56 upper panes 5.40 m high, so mullions
  every 3.6 m (SPK magazine).
- **Inside:** two room-high shafts clad in green Tinos marble, two timber cloakrooms with stairs to the lower floor, and an
  Epprechtstein granite floor (stone-ideas).
- **The podium:** a granite terrace about 109 × 105 m (OSM), about 1 m above Potsdamer Straße and higher on the west. The sculpture
  garden is walled and sunken on the west. A wide stair runs along the street edge (David Chipperfield Architects' plans, scaled).
- **OSM:** the roof is way **25652320** (`wikidata=Q130608380`), its edges at **18.3°/108.3°**. The podium is way 25652321.

## Proposed approach
- **Data:** `scripts/houses/neue-nationalgalerie.mjs`, fitted by OSM's roof. The terrace is about 1 m above the street. The terrain
  tiles round the Kulturforum rise and fall with its big buildings, so the ground is levelled round the podium.
- **One grid:** everything is drawn on Mies's 3.6 m grid, as 12 studs (3.66 m):
  - the roof is 18 bays (65.8 m against 64.8 m);
  - the hall is 14 bays, set back two on every side;
  - the columns are at the quarter points;
  - the roof's girders run every bay, both ways.
- **The building** at `/neue-nationalgalerie/`:
  - the podium, with its granite terrace in 1.2 m squares, the wide stair from the street, and the sunken sculpture garden's walls;
  - the hall's floor;
  - the eight black cruciform columns;
  - the marble shafts and the timber cloakrooms;
  - the glass walls with their black mullions, a lower pane and a 5.4 m upper pane, and the doors to the street;
  - the black coffered roof, with lights in the coffers.
- **The site:** trees in the sculpture garden and along the streets. The numbers panel says "gallery" (spec 059).

**Build story** (roles per spec 012):
1. *The Kulturforum* (**site**).
2. *The granite podium & the sculpture garden* (**foundation**).
3. *The hall's floor* (**floor**).
4. *The eight columns* (**structure**).
5. *The marble shafts & the cloakrooms* (**interior**).
6. *The glass walls* (**envelope**).
7. *The steel roof* (**roof**).
8. *The garden's trees & sculptures* (**landscape**).

About 2½ minutes.

## Behavior
- **Home page:** a new live card, with a thumbnail of the hall under its roof from the street and its piece count.
- **Viewer:** `/neue-nationalgalerie/` works like the houses.
- **Views:**
  - *Overview*;
  - *From Potsdamer Straße*: the classic frontal view;
  - *Under the roof*: from the terrace corner under the overhang;
  - *The hall*: inside;
  - *From above*.

## Acceptance criteria
**The building**
- **A1** [unit] The roof fits OSM's way 25652320 (IoU ≥ 0.75) and is about 64.8 m square (within 2%).
- **A2** [unit] The grid: the hall is set back two bays from the roof's edge on every side, and the roof's girders run every bay.
- **A3** [unit] Eight columns, two to a side, none at a corner. Each is a cross of black steel from the terrace up into the roof.
- **A4** [unit] The hall is 8.4 m clear, within 0.3 m. Its walls are glass between mullions every bay, from the floor to the ceiling.
- **A5** [unit] The roof is 1.8 m deep, within 0.3 m, and about 10 m above the terrace.
- **A6** [unit] The model invariants hold: no overlaps, inside the grid, deterministic; every phase used; about 2½ minutes.
- **A7** [unit] `tests/buildOrder.test.ts` covers it: phases in role order, nothing floats, nothing dropped.
- **A8** [unit] Every element is marked **[documented]** or **[assumed]**, with at least 5 marks in the interior.

**Site**
- **A9** [unit] The lot terrain meets the real terrain at its edges.
- **A10** [unit] No terrain spikes (the spec 010b check).

**Home and credits**
- **A11** [unit] The home card is live, with the real piece count and its credits. The numbers say "gallery".

**Manual** (in `npm run dev`)
- **A12** [manual] The build plays in order: the podium, the columns, the hall's contents, the glass, then the roof last.
- **A13** [manual] *From Potsdamer Straße* reads as the photographs: the black roof floating over the glass hall.
- **A14** [manual] The home page shows the new card live, with its thumbnail. The credits page lists the building.
- **A15** [manual] All views, No roof, Walk and the phone controls work.
- **A16** [manual] Performance stays within Casa Malaparte's numbers (the largest model before it) at `?dpr=1.75`.

## Out of scope
- The lower floor's galleries under the terrace.
- The 1960s and 2021 exhibitions: the hall has a few generic display walls and chairs.

## Open questions
- [x] **Q1: Its grid.** *Decided:* 12 studs a bay, so the roof is 65.8 m (1.5% over) and everything lines up as Mies drew it.
- [x] **Q2: Disclaimer.** "Fan tribute. Not affiliated with the Staatliche Museen zu Berlin or David Chipperfield Architects."

## Implementation notes
- **Files:** `scripts/houses/neue-nationalgalerie.mjs`; `src/houses/neue-nationalgalerie/` (`layout.ts`, `site.ts`, `house.ts`,
  `interior.ts`, `landscape.ts`, `gallery.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`, `worker.ts`);
  `neue-nationalgalerie/index.html`; `public/neue-nationalgalerie/`; the registry entry; `PAGES`; the shared test lists.
- **The fit:** OSM way 25652320 at −108.5° (search −116…−100°), IoU 0.971. The terrace is pinned at 34.74 m, about 1 m above the
  street as the tiles read it (`lotElevationM`).
- **Pieces:** the first build had 60,849, more than Casa Malaparte. Most were the glass walls, laid a plate at a time. The panes
  now go in full six-plate courses above and below the transom, with the mullions as bricks, and the street trees are thinner:
  **44,419 pieces; 2:39 at 1×.**
- **The columns** rise into the roof's depth to its top plate. Stopping at the ceiling, they stood under empty coffers and seemed
  to hold nothing up.
- **Tests:** `tests/neueNationalgalerie.test.ts` covers A1–A6, A8–A11; A7 is in `tests/buildOrder.test.ts`.
- **Manual checks** (Chrome):
  - **A12 pass:** paused at 100.5 s the columns, the glass walls, the marble shafts and the cloakrooms stand under no roof.
  - **A13 pass:** *From Potsdamer Straße* shows the black roof floating over the glass hall, the green shafts and the wide stair.
  - **A14 pass:** the card is live with its thumbnail and 44,419 pieces; the credits page lists it.
  - **A15 partly checked:** *Overview* and *From Potsdamer Straße* open where they should. No roof, Walk and the phone controls
    weren't checked.
  - **A16:** not compared with Casa Malaparte properly. The debug overlay read 57 fps at `dpr 1.75` on this machine.
- **Thumbnail:** `/neue-nationalgalerie/?cam=-60,12,-110,115,14,95&clean&date=2026-06-21`.
- **Claude usage** (spec 018): can't be split out for this building. All six commits for specs 054–059 landed within minutes of
  each other on 2026-11-11, after one long stretch of uncommitted work, and the ledger splits usage by commit time, so nearly
  all of it went to the first of them (ba7a06a, spec 054, counted as shared): 344 replies. This building's own figure is close
  to nothing and understates it badly, as for spec 045.

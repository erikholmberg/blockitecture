# 044 — The Vanna Venturi House

- **Status:** On hold (hidden by spec 045: Erik asked 2026-11-10 to hide it and build the Douglas House in its place. Built
  and approved by Erik 2026-11-10: "build it", all recommendations; its code and tests stay, unregistered.)
- **Owner:** Erik
- **House:** vanna-venturi-house
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The fourteenth rendering: the house Robert Venturi designed for his mother, Vanna (1962–64), at the end of a long drive off Millman
Street in Chestnut Hill, Philadelphia. It's the house that started postmodernism:
- a front wall shaped like a child's drawing of a house, a big gable, split down the middle;
- a thin applied arch over the entrance and a strip window;
- a chimney that rises through the middle, with the stair squeezed around it and climbing to nowhere.

It's the first house with a sloped roof, so it's the first to need slopes in blocks. It's built block by block on its real wooded
lot, with the same viewer experience as the others, and it gets a new live card on the home page.

## Research (2026-11-09)
**Status today:**
- 8330 Millman Street, Philadelphia. A private home: the Hughes family owned it from 1973; it was sold in 2016 to a local owner who
  still has it. On the Philadelphia Register of Historic Places since 2016 (the outside only). Not open to the public.

**Sources:**
- **No measured drawings are public.** HABS PA-6776 has photographs and data pages but no drawings. The original drawings are in
  the Architectural Archives of the University of Pennsylvania, not online.
- **A surveyor's site plan** (in the Philadelphia Historical Commission's 2021 review, phila.gov) gives the footprint: **58.3 ×
  26.9 ft**, with a small stepped notch at the west end, and the lot's contours.
- **OSM** has the house as building way **769755185** (`height=9.1`, about 30 ft, and a Wikidata link): about 17.8 × 8.3 m, which
  matches the survey. The long walls run at about 127°/307°, and the **front faces north-east**, toward Millman Street.
- **Heights, from the head-on photographs, scaled to the 58.3 ft width** (assumed): eaves about 10½ ft; each half of the split
  gable peaks at about 21–22 ft; the split is about 3 ft wide; the chimney block is about 7–8 ft wide and 26 ft tall, with its
  brick cap reaching about 30 ft.

**Documented** (Wikipedia, HABS, Philadelphia Magazine, the Commission's photographs):
- **The front** is a parapet wall standing above the roof behind it, not the roof's own edge. A recessed entrance in the middle, a
  flat lintel with a thin applied segmental arch over it, a slot window up the split, a big square window and a small one on the
  left, a five-pane strip window on the right, and a double moulding about 4 ft up that wraps all four sides.
- **The roof** behind is one pitched roof, hipped at both ends, with level eaves all round. A central upstairs block rises through
  it. There's no gable at the back.
- **Inside, downstairs:** the living and dining room around the central hearth, the kitchen, the main bedroom with its bath and a
  small second bedroom. A trapezoid fireplace, with the stair rising over it, wraps around the chimney.
- **Upstairs:** one bedroom under the central block, with a large half-moon window and a balcony at the back, and the stair's top
  run that leads nowhere.
- **Colours:** pale grey-green stucco today (sources differ: "nearly aqua" to grey-green), a grey metal roof, the brick chimney cap.

**The site:**
- **Terrain:** flat (386 to 381 ft across the lot). A 0.85-acre lot, set back about 200 ft from Millman Street at the end of a
  straight drive; tall deciduous trees, an arc of crabapples.
- **Scenery:** the engine's `forest` scenery (spec 017) suits wooded Chestnut Hill, with the neighbourhood's houses from OSM. Kahn's
  Esherick House is about 240 m north-east, among them as an ordinary neighbour.

**What the engine doesn't have yet:** slopes. Every piece is a box, so the roof and the gable must be built from steps (Q3).

## Proposed approach
- **Data:** `scripts/houses/vanna-venturi-house.mjs`, fitted by OSM way 769755185; `scenery: { forest: true, city: false }`.
- **The house** at `/vanna-venturi-house/`:
  - the split-gable front wall, the hipped roof, the central block, the chimney, the stair to nowhere;
  - a thumbnail; a new live card on the home page; its credits entry (spec 021).
- **Slopes in steps:** the gable's edges and the roof are stepped one plate up per stud. A pitch of about 22° rises about 0.4 ft a
  foot, so one plate (0.4 ft) per stud matches it closely, and the steps are as small as the engine allows.

**Build story** (roles per spec 012):
1. *The lot and the drive* (**site**).
2. *The footings* (**foundation**).
3. *The floor* (**floor**).
4. *The frame, the chimney and the upstairs floor* (**structure**).
5. *The rooms* (**interior**): the fireplace, the stair around the chimney, the living room.
6. *The walls, the split-gable front, the arch and the windows* (**envelope**).
7. *The hipped roof and the central block's roof* (**roof**).
8. *The trees* (**landscape**).

About 2½ minutes.

## Behavior
- **Home page:** a fourteenth card, live, with a thumbnail and its piece count.
- **Viewer:** `/vanna-venturi-house/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights,
  phone controls, Share (spec 037), neighbours out of the way (spec 038).
- **Views:**
  - *Overview*.
  - *The front*: head-on from the drive, looking south-west at the split gable, as in the famous photographs.
  - *The stair*: inside, with No roof: the chimney, the fireplace and the stair to nowhere.
  - *The back*: the long low eave, the central block and its half-moon window.
  - *Up the drive*: from Millman Street down the long drive to the house.

## Acceptance criteria
**Engine**
- **A1** [unit] The other houses' models, piece counts and timelines are unchanged.

**House**
- **A2** [unit] The footprint matches OSM's way 769755185 (IoU ≥ 0.75) and the survey's 58.3 × 26.9 ft to within 1 ft.
- **A3** [unit] The front wall is a split gable: two halves each rising to a peak, with a gap between them down the middle, and it
  stands higher than the roof behind it.
- **A4** [unit] The roof is stepped: its pieces rise from level eaves at about one plate per stud, toward the ridge, at both ends
  as well as front and back (hipped).
- **A5** [unit] The chimney rises above the ridge, and the stair's pieces wrap it.
- **A6** [unit] The model invariants hold: no overlaps, inside the grid, deterministic.
- **A7** [unit] `tests/buildOrder.test.ts` covers the house: phases in role order, nothing floats, nothing dropped.
- **A8** [unit] Every element is marked **[documented]** or **[assumed]**; at least 8 interior pieces are marked.

**Site**
- **A9** [unit] The lot terrain meets the real terrain at its edges.
- **A10** [unit] No terrain spikes (the spec 010b check).

**Manual** (in `npm run dev`)
- **A11** [manual] The build plays in order; the hipped roof goes on before the trees.
- **A12** [manual] *The front* reads as the famous photographs: the split gable, the arch, the strip window, the chimney behind.
- **A13** [manual] The stepped roof reads as a sloped roof from the views, not as a staircase.
- **A14** [manual] All views, No roof, Walk and the phone controls work.
- **A15** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.
- **A16** [manual] The home page shows the new card live, with its thumbnail; the credits page lists it.

## Out of scope
- A new sloped (wedge) piece in the engine (see Q3).
- The garden building approved on the lot in 2022.
- The interior as it is today: it's a private home, so the furniture is generic and marked assumed.

## Open questions
- [x] **Q1: Which version?** *Recommended: the house as it stands today outside* (the grey-green stucco and the grey metal roof
      in the Commission's photographs), with the 1964 plan inside. The original colours aren't well documented.
- [x] **Q2: Sources.** *Recommended: the survey's footprint and OSM's outline, with heights scaled from the head-on photographs.*
      Each piece is marked documented or assumed. It'll be less exact than the HABS houses, and the spec will say so.
- [x] **Q3: Slopes.** *Recommended: steps, one plate per stud*, with no change to the engine. The alternative is a new smooth
      wedge piece in the engine: truer to the roof and useful later (Robie, Gamble, Hill House), but a change to every house's
      engine and its own spec first.
- [x] **Q4: A private home.** The house is lived in and not open to the public. This is a fan model drawn from published
      photographs and the public survey, with a generic interior and nothing of the owners'. *Recommended: go ahead*, with the
      disclaimer in Q5.
- [x] **Q5: Disclaimer.** *Recommended:* "Fan tribute in a generic toy-block style. Not affiliated with the house's owners, Venturi,
      Scott Brown and Associates or the LEGO Group." (Built with the firm's current name, VSBA Architects & Planners; see
      Implementation notes.) The credits page picks it up.
- [x] **Q6: Timing.** *Recommended: about 2½ minutes* (a small house).

## Implementation notes
- **Files:** `scripts/houses/vanna-venturi-house.mjs`; `src/houses/vanna-venturi-house/` (`layout.ts`, `site.ts`, `house.ts`,
  `interior.ts`, `landscape.ts`, `vannaVenturiHouse.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`);
  `vanna-venturi-house/index.html`; `public/vanna-venturi-house/` (`neighborhood.bin`, `thumbnail.jpg`); the registry entry in
  `src/houses/index.ts`; `PAGES` in `vite.config.ts`.
- **The fit:** OSM way 769755185 at a rotation of −37° (the search over −50…−24°), IoU 0.969. y = 0 is the ground floor at the
  survey's 382.9 ft (116.7 m, `lotElevationM`), about a foot above the lawn.
- **Slopes in steps (Q3):** the hipped roof is 14 courses of smooth tiles, each one plate higher and one stud further in, from
  level eaves at 10.4 ft to the ridge; the upstairs block's roof the same, hipped front and back, so its glazed ends stay
  trapezoids. The front parapet's two halves step up the same way to their peaks beside the split. From the views the steps read
  as a slope (A13), though at close range they are plainly steps.
- **The split:** 2 ft wide (scaled, about 3 ft; 2 keeps it centred on the 58 ft front), from 15.6 ft up. The chimney above the
  roof is a shade darker than the stucco: in the same colour it filled the gap from the front and the split didn't read.
- **Glass in 3-plate courses:** the engine lays glass in 3-plate panes counted from the floor, so the slot under the split, the
  split's bottom and the strip window sit on multiples of 3. A test (A3) caught a pane poking up into the gap before that.
- **The interior is generic (Q4):** sofa, chairs, beds and tables are [assumed]. The stair (14 steps, rising toward the front
  beside the chimney), the run to nowhere and the hearth are [documented] in kind, [assumed] in place.
- **The disclaimer** names the firm by its current name, *VSBA Architects & Planners (Venturi Scott Brown)*, not "Venturi,
  Scott Brown and Associates" as Q5 had it: the credits test splits the names at commas, and the firm's old name has one.
- **Tests:** `tests/vannaVenturi.test.ts` covers A1–A6 and A8–A10; A7 is in `tests/buildOrder.test.ts`. The house was added to
  the lists in `tests/buildOrder.test.ts`, `tests/cameraGround.test.ts`, `tests/credits.test.tsx` and `tests/houses.test.ts`, and
  to spec 042's list of built shortlist houses (`tests/shortlistBuilt.test.ts`).
  - **Not tests-first:** as for spec 043, the model came before its test file. The tests found a real fault (the pane in the
    split; the stair to nowhere's steps floating, caught by `tests/buildOrder.test.ts` A3) and two faults in the tests themselves
    (A4 expected the eave one row behind the parapet; A5 looked for whole steps, which the builder splits into 3-plate bricks).
  - `npm run check`: 331 tests pass.
- **28,994 pieces; 2:43 at 1×.**
- **Manual checks** (Chrome, `npm run dev`):
  - **A11 pass:** at 16×, the chimney and the partitions, the rooms and the stair inside the open frame, the walls and the split
    gable, the hipped roof, then the trees.
  - **A12 pass:** *The front* shows the split gable with the chimney behind the gap, the arch over the lintel, the big square
    window on the left and the strip window on the right, the double moulding.
  - **A13 pass:** from the overview, the front and the back the roof reads as a sloped, hipped roof.
  - **A14 partly checked:** every view opens where it should (the overview was raised above the trees, and the back view moved
    inside the clearing behind the house). No roof shows the stair beside the chimney. Walk mode starts on the path at the door.
    **Walking itself and the phone controls weren't checked:** walking needs pointer lock, and the phone controls need a phone.
  - **A15 not measured.** The house has 28,994 pieces, about the Stahl House's 27,233, but its frame rate wasn't measured.
  - **A16 pass:** the fourteenth card is live, with its thumbnail and piece count; the credits page has its section.
- **Thumbnail:** `/vanna-venturi-house/?cam=-6,12,-44,30,12,12&clean&date=2026-06-21`, cropped to 1200 × 675: the front from the
  drive's side, the split gable and the chimney.
- **Claude usage** (spec 018): to be recorded after the commit (`npm run usage`).


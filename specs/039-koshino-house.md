# 039 — The Koshino House

- **Status:** In progress (approved by Erik 2026-11-09: "build it", all recommendations. Built; waiting on Erik's checks of walking
  and the phone controls. Not committed: Erik commits.)
- **Owner:** Erik
- **House:** koshino-house
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The eleventh rendering: Tadao Ando's house for the fashion designer Hiroko Koshino (1979–81, studio added 1983–84) in Okuike, high in
the wooded hills above Ashiya, Japan. It has:
- two parallel boxes of smooth, bolt-holed concrete half-sunk into the slope;
- a courtyard of wide steps between them;
- long slots of light cut into the walls;
- the curved, fan-shaped studio Ando added three years later.

It's the first house in Asia and the first all in bare concrete. It's built block by block on its real hillside, with the same viewer
experience as the others, and it gets a new live card on the home page. The shortlist (`src/dev/shortlist.ts`) noted that "the
formwork panels map straight onto blocks".

## Research (2026-11-09)
**Status today:**
- The house is the **KH Gallery Ashiya** (KHギャラリー芦屋), 17-5 Okuike-chō, Ashiya, Hyōgo. Koshino opened it as a gallery of her
  art in 2013, "as it was" (Bijutsu Techō). It's open by reservation, May to November.
- It stands in a quiet residential area inside the Setonaikai National Park, on the Rokko mountains at about 350 m.

**Sources:**
- **No measured drawings are public.** There's no HABS-style survey and no UNESCO file. The plans, sections and axonometrics
  published with the house (ArchDaily's *AD Classics*, Arquitectura Viva, the Rizzoli and GA monographs) are drawn without
  dimensions. They give the layout and proportions, and a few carry a scale bar.
- **OSM** has the house as two building ways, with no Wikidata tag (Wikidata has no item for the house):
  - **259408268** "KHギャラリー芦屋" (tourism=museum), about 130 m². A straight box about 16 × 4.6 m joined to the fan-shaped
    studio's curve.
  - **259408269**, untagged, about 132 m². A box about 23.8 × 5.5 m, parallel to the first, about 6 m away.

  The fit can use the way ids (spec 025's `osmIds`).
- **Ando's grid:** Ando lays out his concrete on the 1.8 × 0.9 m panel of the tatami and the formwork, with six bolt holes per panel.
  So dimensions can be checked against whole panels.

**Documented** (ArchDaily, Arquitectura Viva, Metalocus; to be checked against the published plans):
- **Two parallel boxes of different sizes:**
  - The larger is two storeys: a double-height living room, the kitchen and dining room, and the main bedroom above.
  - The smaller is one storey: a row of six children's rooms off a long corridor, with tatami rooms.
  - They're joined underground by a corridor, partly buried in the slope.
- **The courtyard** between them is a flight of wide concrete steps following the slope.
- **The studio** (1983–84) is a fan-shaped room with a curved wall, set into the hill north of the house. A slit of skylight runs
  along its curve.
- **Inside:** bare concrete walls; light enters through narrow slots and falls across the walls as it moves.
- **Later change:** about 20 years on, Koshino had Ando rework the bedroom wing into a separate two-storey guest house (Metalocus). The
  OSM outlines may show either version.

**The site:**
- **Terrain:** the steep, wooded south slope of the Rokko mountains, with Osaka Bay and the city about 6 km away and 350 m below.
- **Scenery:** the engine's `forest` scenery (spec 017: hardwood forest, rock on steep faces) suits it. The neighbourhood's houses
  come from OSM as usual (about 50 within 120 m).

**What the engine doesn't have yet:**
- A curve in plan. Other houses have round pieces (columns) but no curved wall. The studio's curve can be stepped stud by stud,
  like the curves of terrain and pools, so nothing new is needed.

## Proposed approach
- **Data:** `scripts/houses/koshino-house.mjs`, fitted by OSM way ids 259408268 and 259408269; `scenery: { forest: true }`.
- **The house** at `/koshino-house/`:
  - the two boxes, the courtyard steps, the underground corridor and the studio;
  - a thumbnail; a new live card on the home page; its credits entry (spec 021).
- **Concrete:** smooth light grey pieces sized to Ando's panels (1.8 × 0.9 m, about 6 × 3 ft). The bolt holes are drawn as studs,
  six per panel.

**Build story** (roles per spec 012):
1. *The hillside* (**site**).
2. *The cut and the buried footings* (**foundation**).
3. *The floors and the courtyard's steps* (**floor**).
4. *The concrete boxes and the upper floor* (**structure**).
5. *The rooms* (**interior**): the living room, the dining table, the tatami rooms.
6. *The light slots and glass* (**envelope**).
7. *The roofs, and the studio's curved roof with its skylight* (**roof**).
8. *The trees* (**landscape**).

About 3 minutes.

## Behavior
- **Home page:** an eleventh card, live, with a thumbnail and its piece count.
- **Viewer:** `/koshino-house/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights, phone
  controls, Share (spec 037), neighbours out of the way (spec 038).
- **Views:**
  - *Overview*.
  - *The courtyard*: down the steps between the boxes.
  - *The studio*: its curved wall.
  - *The living room*: inside, with No roof, looking at the light slots.
  - *Down the slope*: over the house to Okuike's plateau (was *Over the bay*; see Implementation notes).

## Acceptance criteria
**Engine**
- **A1** [unit] The other houses' models, piece counts and timelines are unchanged.

**House**
- **A2** [unit] The footprint matches OSM's ways 259408268 and 259408269 (IoU ≥ 0.75). The main dimensions match the published plans
  to within one panel (3 ft).
- **A3** [unit] Two parallel boxes, the larger two storeys and the smaller one; the courtyard between them steps with the slope.
- **A4** [unit] The studio's wall curves: its pieces lie within 1 ft of one circular arc of at least 60°.
- **A5** [unit] The model invariants hold: no overlaps, inside the grid, deterministic.
- **A6** [unit] `tests/buildOrder.test.ts` covers the house: phases in role order, nothing floats, nothing dropped.
- **A7** [unit] Every element is marked **[documented]** or **[assumed]**; at least 8 interior pieces are marked.

**Site**
- **A8** [unit] The lot terrain meets the real terrain at its edges.
- **A9** [unit] No terrain spikes (the spec 010b check).

**Manual** (in `npm run dev`)
- **A10** [manual] The build plays in order; the studio's curved roof goes on with the roofs, before the trees.
- **A11** [manual] *The courtyard* reads as the famous photographs: two blank concrete walls, the steps between them, trees around.
- **A12** [manual] The forest and the neighbourhood read right, with the bay below.
- **A13** [manual] All views, No roof, Walk and the phone controls work.
- **A14** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.
- **A15** [manual] The home page shows the new card live, with its thumbnail; the credits page lists it.

## Out of scope
- Koshino's art on display in the gallery.
- The light moving across the walls through the day (there's no time of day yet; see the sun presets idea).

## Open questions
- [x] **Q1: Which version?** *Recommended: the house as Ando finished it in 1984*: the two boxes and the studio, with the original
      one-storey bedroom wing. That's the famous one, in all the published plans. The alternative is today's, with the guest house
      that replaced the bedroom wing, which is poorly documented.
- [x] **Q2: Sources.** *Recommended: the published plans and sections, scaled to OSM's outlines* and checked against Ando's 1.8 ×
      0.9 m panels. Each piece is marked documented or assumed. It'll be less exact than the HABS houses, and the spec will say so.
- [x] **Q3: Rights.** Ando is alive, and his office publishes the drawings. The house is now KH Gallery. This is a fan model drawn
      from published material, with no photographs reproduced. *Recommended: go ahead*, with the disclaimer in Q4. Your call if
      you'd rather not model a living architect's private house.
- [x] **Q4: Disclaimer.** *Recommended:* "Fan tribute in a generic toy-block style. Not affiliated with Hiroko Koshino, KH Gallery,
      Tadao Ando Architect & Associates or the LEGO Group." The credits page picks it up.
- [x] **Q5: Timing.** *Recommended: about 3 minutes* (a small house: two boxes and a studio).

## Implementation notes
- **Sources read:**
  - ArchDaily's *AD Classics* drawings: Ando's cross section through both wings and the courtyard, and an aerial photograph
    of the house as finished in 1984.
  - From these: two parallel boxes; the courtyard's steps; the long free-standing wall round the lawn; the skylight strips
    along the roofs' edges; the slits of light; the fan of the studio.
- **Data:**
  - `scripts/houses/koshino-house.mjs`, fitted by OSM's two ways (no Wikidata item).
  - The search over −175…−145° gives **−164°**, IoU 0.856, with the bedroom wing downhill to the SSE and the studio uphill
    toward the street.
  - y = 0 is the floor of both wings: 519.6 m, the ground at the middle of the bedroom wing's downhill face (the terrain reads
    521.9 m at the centre). The living wing and the studio sink into the slope, as Ando's section shows.
  - The lot is at about 520 m, not the 350 m guessed in Research.
  - `despike` and `seaFloorFt` for Osaka Bay; scenery `forest`, `sea` and a city on the coastal plain.
- **Layout from OSM:** the outlines put the living wing (16 × 5.2 m) toward the west end, 11 ft from the bedroom wing
  (23.8 × 5.5 m). The studio is a fan of radius 34 ft centred on the living wing's downhill wall, sweeping round its uphill side.
  That's different from the first guess, a quarter circle at the end, which gave IoU 0.675.
- **Model:** `src/houses/koshino-house/`, 32,677 pieces.
  - **Concrete:** in Ando's 6 × 3 ft panels, each a slightly different grey. The bolt holes aren't drawn: studs only show on top
    faces (a deviation from the Proposed approach).
  - **The bedroom wing:** six rooms with futons and desks off a corridor, its slits to the courtyard and windows downhill,
    set higher toward the west where the slope rises outside. A rail on its roof.
  - **The living wing:** two storeys.
    - the double-height living room with a tall steel-gridded window onto the courtyard;
    - solid concrete steps up to the main bedroom over the kitchen and dining room;
    - at its west end, a roof terrace open to the sky inside the full-height walls;
    - high slits above the studio's roof.
  - **The courtyard:** a flat floor, then ten steps up to the lawn, over the underground corridor between the wings.
  - **The studio:** the fan's arc wall and straight wall, a ring of glass in the roof along the arc, cutting tables.
  - **The lawn:** level with the bedroom wing's roof, held by the long L-shaped wall.
  - **Around it:** pines and broadleaf trees kept off the house and the lawn; the lot's three neighbours as tagged blocks
    (spec 038).
- **Tests:**
  - `tests/koshino.test.ts` covers A1–A9 plus the home card. A1 pins the ten other houses; Casa Luis Barragán is pinned by its
    current fingerprint.
  - The house is added to `buildOrder`, `credits`, `cameraGround` and `houses` tests.
  - Deviation from the flow: as with the last houses, the tests were written after the model.
- **Manual checks** (Chrome, 2026-11-09):
  - **A10 pass:** at 1:50 the walls and rooms stand open with no roofs; the roofs and the studio's curve come next, the pines
    last.
  - **A11 pass:** *The courtyard*: the two blank concrete walls and the steps between them, the pines beyond.
  - **A12 partial:**
    - The forest and Okuike's neighbourhood read right.
    - Osaka Bay only shows as a sliver through a gap in the ridge, from several hundred feet up. Okuike sits on a plateau
      behind it.
    - So the *Over the bay* view became *Down the slope*.
  - **A13 partial:** all five views; No roof; Walk starts on the courtyard floor facing the steps; dusk lights in the windows.
    **Not checked:** walking itself, the phone controls.
  - **A14 pass:** 60 fps at `?dpr=1.75` (3.4M triangles).
  - **A15 pass:** the eleventh card is live with its thumbnail; the credits page has its section.
- **Thumbnail:** `/koshino-house/?cam=118,58,-40,50,6,32&clean&date=2026-06-21`, cropped to 1200 × 675.
- **Claude usage** (spec 018): to be recorded with the commit.

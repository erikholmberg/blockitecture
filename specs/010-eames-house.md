# 010 — The Eames House (Case Study House #8)

- **Status:** Done (approved by Erik 2026-11-08: all recommendations except Q3, amended to the actual Eames furniture; built after spec 009)
- **Owner:** Erik
- **Created:** 2026-11-08
- **Commits:** <!-- filled in when Done -->

## Goal
The second rendering: Charles and Ray Eames's house and studio (Case Study House #8, 1949) at 203 North Chautauqua Boulevard,
Pacific Palisades, built brick by brick on its real site, with the same viewer experience as the Stahl House. Its home-page card goes
from "Coming soon" to live.

## Research (2026-11-08)
**The house (from published descriptions; dimensions to be checked against published plans before modelling):**
- Two steel-and-glass boxes in one line: the **residence** and the **studio**, separated by a **courtyard**. They sit along a long concrete
  **retaining wall** cut into the hillside, facing a **meadow** with a row of **eucalyptus** trees, and the ocean beyond.
- Off-the-shelf industrial parts: thin steel columns, open-web steel joists, corrugated steel roof decking. The frame famously went
  up in about a day and a half. A regular **bay of about 7 ft 4 in**, roughly 17 bays along the wall (residence ≈ 8, courtyard ≈ 4,
  studio ≈ 5), about 20 ft deep and about 17 ft tall.
- The facade is a grid of panels: clear glass, translucent glass, and stucco panels in **red, blue, white, black and earth tones**,
  with black-painted steel. Inside: a double-height living room, a mezzanine (bedrooms in the residence), and the studio's double-height space.

**Real-world data:**
- OpenStreetMap: only 9 buildings within 180 m of Wikipedia's coordinates, and **neither the house nor the studio is among them**.
  So unlike spec 003, alignment can't come from fitting the house's own OSM outline. It will come from published dimensions, the
  retaining-wall orientation, Chautauqua Blvd / Bashford St, and the terrain. The wider neighborhood is mapped, so the same
  OSM + terrain pipeline works for it.
- **Santa Monica Bay is in view.** Terrain below sea level must render as water. The engine has no ocean today.

**The engine is Stahl-specific almost everywhere.**
- The model: `src/model/*`, `stahlHouse.ts`, `layout.ts`, and `lotTerrain.ts`, which is generated for Stahl.
- The build phases in `catalog.ts`: names like "Pool, garden & finishing touches".
- The viewer: `main.ts`, `VIEWS` in `cameraMoves.ts`, and the intro, title and address text in `Hud.tsx`.
- The data script: anchor, rotation and roof outline are hard-coded.
- The city backdrop: downtown's bearing is hard-coded.

## Proposed approach: two steps
1. **Spec 010a: multi-house engine (no visible change).**
   - Move everything house-specific behind a `HouseDefinition`: identity and texts, build phases, `build(builder)` model,
     lot/pad layout, camera views, real-world anchor (lat/lon, rotation, fit outline), backdrop settings, and the generated per-house data.
   - The Stahl House becomes the first definition. The data script takes a house slug.
   - **Proof that nothing changed:** all existing tests pass unchanged, the Stahl model fingerprints are identical,
     and the timeline totals match.
2. **Spec 010b: the Eames House** on that engine, at `/eames-house/`.
   - The house and studio, the retaining wall, the meadow and the eucalyptus row.
   - The real neighborhood and terrain, now with ocean.
   - A thumbnail, and its card set to live.

## Acceptance criteria (sketch; finalized per step)
- **010a:** Stahl model fingerprint `ebe0f28f` / 27,222 pieces and house fingerprint `e781fb43` unchanged; total 228.7 s; 71 tests green;
  a manual Stahl walkthrough shows no differences.
- **010b, house:**
  - [unit] Bay grid and overall dimensions within ±2 ft of the published plans (residence, courtyard, studio, depth, height).
  - [unit] Model invariants as in the baseline: no overlaps, inside the grid, deterministic.
  - [unit] Phases build in order, the hillside wave starts at the house, and nothing floats.
- **010b, site:**
  - [unit] The lot terrain meets the real terrain at its edges.
  - [unit] Water wherever the ground is below sea level.
- **010b, unit:** each piece of Eames furniture in the model has a comment naming it and the photo it was placed from.
- **010b, manual:** the furniture reads as the Eames pieces in the published photos; the panel colors read like the real facade; the ocean is visible from the meadow; performance stays within the
  Stahl House's numbers (`?dpr=1.75`); the card is live with a thumbnail; all viewer controls work.

## Out of scope
- Furniture beyond what can be documented in the house (see Q3).
- Other houses.

## Open questions
- [x] **Q1: Two steps?** Generalize the engine first with no visible change (010a), then build the Eames House (010b)? *Recommended: yes.*
      One combined change would be hard to verify, and the refactor pays off for every house after this.
- [x] **Q2: Level of detail.** *Recommended: like the Stahl House.* That means the full exterior (frame, the colored panel grid, the
      retaining wall), the main interiors (double-height living room, mezzanine, stairs, studio), and the Eames furniture (Q3). Dimensions come from
      published plans and photos; where a source is unclear I'll use the 7′4″ module and say so in the spec.
- [x] **Q3: Furniture.** *Amended by Erik, 2026-11-08: use the actual Eames furniture.* The house is furnished with brick depictions of the
      Eames pieces documented in it (from published photographs of the living room and studio), placed where they stand in those photos.
      The candidates, each to be confirmed against a photo before it goes in:
      - **Living room:** the lounge chair and ottoman (1956), LCW/DCW plywood chairs, the ESU storage units, an LTR / low table,
        the long built-in sofa / daybed, and the collected objects, plants, rugs and baskets.
      - **Dining:** the molded fiberglass/plastic chairs (DSW/DSR) around a table.
      - **Studio:** worktables and plywood chairs.

      At brick scale these are recognizable approximations, not replicas: a lounge chair is a few curved plates, not a product model.
      **Footer and intro credit:** "Fan tribute, not affiliated with the Eames Office, the Eames Foundation, Herman Miller or Vitra"
      (alongside the existing LEGO line). Product names appear in the spec and code comments only, not on screen.
- [x] **Q4: Ocean.** Add water to the engine (terrain below sea level shows as the sea, with a soft shoreline; at dusk it reflects the
      lights)? *Recommended: yes.* It's the defining view, and other coastal houses will need it.
- [x] **Q5: Eucalyptus.** The row of eucalyptus along the meadow is iconic. *Recommended: brick-built trees* in the landscaping phase,
      placed from photos or aerial imagery, as a row in front of the house.
- [x] **Q6: Build story.** Suggested phases: shaping the hillside → retaining wall & foundations → slab → **steel frame (a nod to the
      day-and-a-half raising)** → decks & roof → panels & glass → interior → meadow & eucalyptus.
      *Recommended: yes, with the same timing approach as the Stahl House (about 4 minutes in total).*

## Implementation notes

### 010a: multi-house engine (done 2026-11-08)
- **Layout:** `src/engine/` (generic) and `src/houses/stahl-house/` (model, `phases.ts`, `definition.ts`, `main.ts`).
  27 files moved with `git mv` (history kept), and every import was rewritten by resolving it against the file's old location.
- **`HouseDefinition`** (`src/engine/house.ts`): texts, site, phases, `build()`, center, views, walk start, lights, roof cut,
  lot (rect, `surfaceFt`, optional `driveEnd`), data path and downtown direction.
  - `startViewer(house)` replaces the module-level `main.ts`.
  - Engine changes:
    - the sequencer takes `phases` and the wave centre;
    - `Environment` takes the centre and the lights;
    - `BrickSet` generates the roof-cut GLSL from the house's rectangles;
    - `Walker` takes its start, which is also the respawn point that used to be hard-coded;
    - `NeighborhoodScene` and `groundHeight` take the `Lot`, and the drive connector is optional;
    - `City` takes the downtown direction;
    - the HUD takes text, views and phase names as props.
  - `PHASES`/`P` moved from the engine catalog to the house. `VIEWS` moved from `cameraMoves` to the definition.
    The debug global is now `window.__viewer`, with `__stahl` kept as an alias.
- **Data script:** `node scripts/fetch-neighborhood.mjs <slug>` with `scripts/houses/<slug>.mjs` settings.
  The rotation is generic, with cos/sin snapped so multiples of 90° are exact. Cache files are per house.
- **Proof that nothing changed:**
  - All 77 existing tests pass with only import paths / call signatures changed, and **no assertion changed**. That includes model `ebe0f28f` /
    27,222 pieces, house `e781fb43`, the 228.7 s total and the sun bearings.
  - The regenerated `public/stahl-house/neighborhood.bin` and `lotTerrain.ts` are **byte-identical** (same SHA-256 as before).
  - New `tests/engine.test.ts`: no engine file imports a house, and each live house page boots `startViewer`. 79 tests total.
  - Chrome:
    - the page boots via `src/houses/stahl-house/main.ts` and loads 27,222 pieces and 4,159 neighborhood buildings;
    - the intro text comes from the definition;
    - No roof cuts exactly the roof;
    - Home → (−95, 70, −120); Walk starts and respawns at (23.5, −16).

### 010b: the Eames House (done 2026-11-08)
- **Research results:**
  - The earlier coordinates were ~2 km off. The house is at ~34.0297° N, 118.5194° W.
  - OSM *does* map it, as two Microsoft-footprint buildings, "Casa" and "Oficina", sharing wikidata Q980011. The house's
    axis reads 12.6° and the studio's 8.1°.
  - Sources: 7′4″ bays on 20 ft depth, 17 ft high; residence 8 bays (7 enclosed = 51 ft, plus the open south patio bay),
    courtyard 4, studio 5 (37 ft). The retaining wall is on the west, 8 ft high. The front faces east onto the walkway,
    eucalyptus and meadow; the residence is at the south end.
- **Placement:**
  - The data script now fits several buildings at once (union) and can search the rotation.
  - Result: **rotation −14°** (the line between the two pavilions), offset (10, 59), IoU 0.817.
  - Lot elevation 46.4 m = 152 ft above the Pacific, matching the sources' "about 150 ft". This is checked by a test.
- **Engine additions (all opt-in or generic; the Stahl House stays byte-identical):**
  - `Builder(grid)` takes a per-house grid.
  - `realToModelDir()` / `bearingToTheta()` fix spec 009's sun formula, which was only right for 0°/180° rotations.
    It's tested against the data script's rotation for arbitrary angles.
  - `scenery` adds `sea` (a water sheet at true sea level, beach colors), `chaparral`, `flatsBelow` and a `city` height band.
  - `text.disclaimer` appears on the intro card.
  - The data script gained multi-building fit, `rotationSearch`, `despike` and `seaFloorFt`.
- **Data repair:** the terrain tiles over Santa Monica Bay are corrupt in places.
  - Spikes up to **8,261 ft**: 2,588 samples in the near grid, 133 in the far one. They rendered as giant pale "towers" behind the house,
    which I first misread as the Santa Monica Mountains; a raycast showed them hovering over the ocean.
  - Deep blobs offshore, at −500 to −1,075 ft.
  - Fixes: iterative 3×3 then 5×5 median despike for the spikes; the sea floor clamped to 60 ft below sea level for the
    blobs (hidden under the water). A test checks that no visible sample remains a spike.
- **Model:** `src/houses/eames-house/`, with 21,644 pieces generated in ~110 ms.
  - Bay lines are the 7′4″ module rounded to whole studs: 7/8 ft alternating, 124.7 → 125 ft.
  - The site: a level terrace; the hill standing 8 ft behind the angled wall and planted with dense trees (as in photographs,
    where they screen the houses above); a berm; blends to the real ground at every edge.
  - The structure: black H-columns, the rail at 8′1″, joists, a white deck, gravel and curb, the mezzanine and studio loft
    with stair and hoist openings.
  - Panels: two courses × two sub-panels with mullions per bay, plus the end walls. The front door is translucent with two gold
    panels above, and two bays carry crossed tension rods. **The per-bay color arrangement is my composition in the documented palette,
    not a verified elevation.**
  - Landscape: the eucalyptus row (pale, gently leaning trunks with branch-attached crowns), the Venice pier pilings, the carport awning,
    meadow flowers.
- **Furniture (Q3 as amended):** each piece's comment says **[documented]** or **[assumed]**.
  - Documented: the lounge chair + ottoman; the built-in alcove sofa; rosewood paneling; rugs and tatami; pillows,
    baskets, books, plants and the paper lantern; marble/steel counters, metal cabinets and refrigerator; Ray's checkerboard bath;
    the freestanding closets; the spiral stair; the studio's steel stair, kitchenette, bathroom and darkroom.
  - Assumed: the ESU-like shelving, molded shell chairs, plywood chairs and worktables.
  - *Deviation from the criterion as written:* positions follow the documented room layout rather than a specific
    photograph per piece, and each comment cites a source, not a photo.
- **Results:**
  - `tests/eames.test.ts` (8 tests): dimensions within ±2 ft; deterministic, no overlaps, inside the grid; phases in order,
    ~230 s, the wave bottom-up; lot edges meet the real ground; placement, sea level and ocean in view; no terrain spikes;
    furniture sourcing markers; the card is live with the real piece count and disclaimer. The spec 007 registry/home tests now follow
    the registry. 88 tests total.
  - Chrome:
    - All views work: Overview, From the meadow, Courtyard, Living room (the ocean through the south glass), Bluff & bay.
    - Dusk sets over the bay at the real bearing.
    - No roof cuts both pavilions; Walk starts on the meadow; the controls work.
    - 57–60 fps at dpr 1.75 (3.4M triangles).
    - The home page shows two live cards.
  - Thumbnail: `/eames-house/?view=meadow&clean&date=2026-06-21`.

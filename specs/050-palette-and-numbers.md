# 050 — Each house's palette, and its model by the numbers

- **Status:** Done (approved by Erik 2026-11-10: "build it", both recommendations. Closed by Erik 2026-11-10: "close the specs", accepting the
  frame-rate check, A6, which wasn't measured)
- **Owner:** Erik
- **Created:** 2026-11-10
- **Commits:** 4157e4a

## Goal
Every model already knows its colours, what each piece is (glass, light, brick…) and which of the eight build steps it belongs to,
all at one scale (1 stud = 1 ft). Two small features show that, with no new data per house:
- **A palette strip** on each home card: the house's own colours at a glance (Barragán's pinks, Rietveld's primaries, the
  Douglas House's whites).
- **"By the numbers"** on each house page: what the model is made of and how it goes up.

Both come out of the brainstorm (2026-11-09, idea #7 reworked; `docs/ideas/2026-11-09-feature-brainstorm.md`). Its worry that a
parts list would look like a LEGO set is weaker since spec 046 removed the studs, but this still lists no part sizes.

## Behavior
**The palette strip** (home page)
- A bar about 14 px tall between each live card's thumbnail and its title, right against the picture, made of the house's
  main colours, each as wide as its share. (Tried at 8 px first; Erik asked 2026-11-10 for it to stand out more. A hairline
  above it was tried, then removed at Erik's request.)
- Coming-soon cards have none.
- It's decoration: hidden from screen readers, so it doesn't repeat what the picture shows.

**By the numbers** (house page)
- A button beside Views and Share opens a small panel titled "By the numbers: this model". Every figure is about the model, not
  the real house, and the panel says so, since blocks round everything to a foot (the brainstorm killed a measure tool for false
  precision, #5).
- It shows:
  - **Pieces:** the house's, and with its site and landscape.
  - **Height:** from its lowest piece to its highest, in ft (m).
  - **Footprint:** the ground it covers seen from above, in ft² (m²).
  - **Glass:** the share of the house that's glass.
  - **The build:** the eight steps as one bar, each as long as its time, with each step's piece count.
  - **Its palette:** the same colours as the card, larger, with their shares.
- No backdrop blur over the canvas (CLAUDE.md, spec 007). On phones the panel fits the screen.

**What counts as "the house":** its pieces in the foundation, floor, structure, interior, envelope and roof steps; not the
site's terrain or the landscape (trees, rails, neighbours). The palette uses only what you see from outside: structure,
envelope and roof, without glass and lights.

## Approach
- **Worked out once, not in the browser:** a script (`npm run stats`) builds every house's model and writes
  `src/houses/stats.ts` (generated, like each house's `lotTerrain.ts`): each house's palette and figures. The home page reads it
  without building any model. A test checks it against the models, so it can't go stale.
- **The palette:** the house's colours weighted by area, with near-identical shades merged (the walls' slightly varied greys
  count as one colour), then the five largest (Q1).

## Acceptance criteria
- **A1** [unit] `src/houses/stats.ts` matches what the models give, for every live house (piece counts, height, footprint,
  glass share, per-step counts and times, palette): regenerating it changes nothing.
- **A2** [unit] Each palette has 1–5 colours (see Implementation notes) whose shares add up to 100%, uses only the house's own piece colours (or merges of
  them), and none from the terrain, the trees or the glass.
- **A3** [unit] Each live home card has a palette strip with one segment per colour, widths in proportion, `aria-hidden`; coming-
  soon cards have none.
- **A4** [unit] The panel's figures render from the stats, say they're about the model, and give height and footprint in feet and
  metres.
- **A5** [manual] In `npm run dev`: the palettes read as the houses (Casa Luis Barragán shows its pink, the Rietveld Schröder House
  its red, yellow and blue, the Douglas House white); the panel opens beside Views and Share, reads clearly, fits a phone's screen.
- **A6** [manual] No change to the frame rate (the panel is ordinary page markup over the canvas, without blur).

## Out of scope
- Comparing houses side by side (a later spec, using these stats).
- Part sizes or a parts list.
- Figures about the real houses.

## Open questions
- [x] **Q1: Which colours make the palette.** *Recommended: weighted by area* (each piece's outward faces) *with near shades
      merged*, the five largest. Weighting by volume instead is simpler but buries thin accents: the Rietveld Schröder House's
      red, yellow and blue are slim beams and would barely show. If area still loses an accent, A5 will show it and we tune.
- [x] **Q2: Where "By the numbers" opens.** *Recommended: a button beside Views and Share* in the viewer. The alternative is a
      line on the intro card, which is already full and gone once the build starts.

## Implementation notes
- **Files:** `src/engine/stats.ts` (pure: `houseStats()`, the palette, `renderStatsModule()`); `src/houses/stats.ts` (generated);
  `src/engine/ui/NumbersPanel.tsx`; `src/components/ui/popover.tsx` (shadcn's, on the `radix-ui` package already installed); the
  button in `src/engine/ui/Hud.tsx`; the strip in `src/home/HouseCard.tsx`; `stats` on `HouseDefinition`, set in every house's
  definition from the generated file. `npm run stats` regenerates it (`STATS_WRITE=1 vitest run tests/stats.test.ts`): plain
  Node can't resolve the `@/` imports the models use, and Vitest can.
- **The palette, tuned in A5 (Q1):**
  - Weighting by exposed area alone, the five largest were all whites, greys and woods. Casa Luis Barragán had no pink, and the
    Rietveld Schröder House none of its red, yellow and blue: they're 0.3–1.4% of the outside.
  - So up to three vivid colours are kept first, however small (HSL saturation ≥ 0.5 and at least 0.2% of the area; the
    models' woods and browns are under 0.4, every real accent 0.58 or more), and the rest of the five are the largest others.
  - Each colour gets at least 5% of the strip's width, so an accent shows. The shares are widths for the strip, not exact
    areas.
  - Result: Rietveld white, black, red, yellow, blue; Barragán white, warm grey, pink, orange, yellow; the Eames House adds its
    red, blue and yellow; the Rose Seidler House its mural's red and blue; Fallingwater its Cherokee red.
- **1–5 colours, not 2–5:** the Sheats-Goldstein Residence's outside is all concrete and glass, and glass is left out, so its
  palette is one grey. That's true to the house, so A2 allows one.
- **The panel on phones** opens below its button (beside it on wide screens): a phone-sized check showed it cut off on the left
  when it opened beside the button.
- **Not tests-first,** in part: `tests/stats.test.ts` and `tests/paletteNumbers.test.tsx` were written before the code and
  failed first (the modules didn't exist), but the palette's tuning came after, and the A2 test was loosened to 1–5 colours.
- **Tests:** `tests/stats.test.ts` covers A1 and A2; `tests/paletteNumbers.test.tsx` A3 and A4. `npm run check`: 357 tests pass.
- **A5 pass** (Chrome): the home cards' strips read as the houses (Rietveld's ends in red, yellow and blue; Barragán's shows
  its pink and orange). Fallingwater's panel opens beside Views and Share on a wide screen and below the buttons in a 390 × 780
  frame, fully on screen.
- **A6 not measured.** The panel is ordinary page markup with no blur, opened only on demand; the frame rate wasn't measured.


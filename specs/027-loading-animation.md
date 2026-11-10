# 027 — A more interesting loading animation

- **Status:** Done (approved by Erik 2026-11-09: C, the spinning brick, from 23 candidates on the preview)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** 75cb57b

## Goal
The loading screen every house page shows while the model is generated is a small moment of delight, on brand with toy blocks,
instead of an orange square bobbing next to "Sorting blocks…".

## Today
`#loading` (in each house page's HTML, styled in `src/engine/ui/styles.css`): a 22 px orange square bobbing up and down beside
"Sorting blocks…", on the warm grey background. It shows from page load until the viewer is ready. On the bigger houses that's a few
seconds, most of it spent generating the model with the page's main thread busy.

## Behavior
A toy-block animation above the "Sorting blocks…" line, chosen from 23 candidates (Q1; D–M and the non-block N–W added at Erik's request):

| | Name | What it does |
|---|---|---|
| **A** | Stacking blocks | Three blocks with studs (orange, blue, yellow) drop one after another onto a small baseplate and stack, the tower settles, then clears and starts again (about 2.4 s) |
| **B** | Studs popping | A 4 × 4 plate seen in three-quarter view, its studs popping up in a wave from one corner, like the hillside building in the viewer (about 1.6 s) |
| **C** | Spinning brick | A single orange 2 × 4 brick, studs and all, turning slowly in 3D with a soft shadow under it (about 3 s per turn) |
| **D** | A wall goes up | Three courses of bricks laid one by one in running bond, bottom up, then the wall fades and starts again |
| **E** | Bouncing brick | One orange brick bouncing, squashing as it lands, its shadow shrinking as it rises |
| **F** | Sliding into a row | Four coloured blocks slide in from alternate sides to fill a row |
| **G** | Studs ripple | A green 5 × 5 plate whose studs ripple outward from the centre |
| **H** | A tower of plates | Seven coloured plates stack into a tower, then drop away |
| **I** | Click together | A yellow brick lowers onto a blue one, which gives a little squash as they click |
| **J** | Hopping row | Six 1 × 1 blocks in a row hop in turn, like a wave |
| **K** | Orbiting blocks | Four small blocks orbit a central orange brick |
| **L** | Mosaic flip | A 3 × 3 mosaic of coloured tiles flips into place, tile by tile |
| **M** | A little house | A mini house builds itself: two courses of wall, a door, a roof, a chimney |
| **N** | A blueprint draws itself | On blueprint blue, a little plan's lines grow one by one |
| **O** | Sun across the sky | The sun rises, crosses an arc over the horizon and sets |
| **P** | Compass finds north | A compass needle swings, overshoots and settles on north |
| **Q** | Tower crane | A yellow tower crane swings its jib, its hook bobbing on the cable |
| **R** | A floor plan, room by room | The rooms of a plan appear one after another |
| **S** | Skyline rising | A row of buildings rises from the ground, one by one |
| **T** | A pin finds the site | A map pin drops onto a contour map and bounces to rest |
| **U** | Ring spinner | A clean orange ring spinner |
| **V** | Three dots | Three orange dots breathing in turn |
| **W** | Spirit level | A spirit level's bubble slides, overshoots and settles in the middle |

**In every case:**
- **Smooth while busy:** only transforms and opacity animate, which the browser runs off the main thread, so the animation keeps
  moving while the model is being generated.
- **Reduced motion:** with `prefers-reduced-motion`, it's shown still.
- **Fast to show:** it's pure CSS in the page, so it appears with the first paint, before any JavaScript.
- **Unchanged:** the "Sorting blocks…" text, the background, and when the screen appears and disappears.

## Approach
- **CSS:** the chosen animation's CSS moves from `src/engine/ui/styles.css` into a small `<style>` in each house page's HTML. Today the
  loader's style only arrives with the JavaScript bundle, so for the first moments it's unstyled.
- **Markup:** the loader's markup goes in each page's `#loading`. A test keeps all the house pages identical.
- **Preview:** while this is a draft, a dev-only page at `/dev/loading/` shows all the candidates in a grid, plus today's. It's
  deleted after the choice.

## Acceptance criteria
- **A1** [unit] Every house page in `PAGES` has the same `#loading` markup: the chosen animation and "Sorting blocks…" (no "brick",
  spec 013).
- **A2** [unit] The loader's keyframes animate only `transform` and `opacity`, and a `prefers-reduced-motion` rule turns them off.
- **A3** [unit] The loader's styles are in the page itself (an inline `<style>`), so it's styled before the bundle loads.
- **A4** [manual] In `npm run dev`, with the cache disabled, the loader appears styled and animated right away. It keeps moving while
  a big house (Fallingwater) generates, and disappears when the intro card shows.

## Out of scope
- A progress bar or percentage (generation isn't split into steps that could report one).
- The home page.

## Open questions
- [x] **Q1: Which animation?** *Erik: C, the spinning brick.* *Recommended: A, stacking blocks*. It's the most "toy blocks" and echoes what the viewer is about to do.
      Decide on the preview.

## Implementation notes
- **Pages:** each house page (6) has an inline `<style>` in its `<head>` and the loader markup in `#loading`. The orange 2 × 4 is drawn
  as five CSS 3D faces: the top shows its studs as radial gradients. It turns once every 3 s over a breathing shadow.
- **Class names:** `lb`, `lb-f`, `lb-top`… ("loader block"). Spec 013's wording test bans "brick" anywhere in page HTML, class names
  included.
- **Old spinner:** `#loading`, `.spinner` and `@keyframes bob` are removed from `src/engine/ui/styles.css`.
- **Reduced motion:** the brick shows still, at a three-quarter angle.
- **Preview:** the dev-only page `/dev/loading/` grew from 3 candidates to 23 at Erik's request: A–M with blocks, N–W without. It
  was deleted after the choice and never committed.
- **Tests:**
  - `tests/loading.test.ts` covers A1–A3. They failed first.
  - A1 checks the loader is identical on every live house page. A2 parses the inline keyframes: only `transform` and `opacity`.
  - 193 tests in all.
- **A4 pass** (Chrome):
  - Fallingwater's page HTML with its scripts stripped shows the loader fully styled, and turning (two frames a second apart).
  - With the main thread frozen for 5 s, it keeps turning: the frames differ. Animating only transforms keeps it off the main
    thread.
  - On a normal load, `#loading` is gone once the intro card shows.
- **Later (spec 047, 2026-11-10):** on an iPhone the brick stopped while the main thread was busy: iOS Safari doesn't keep this
  3D animation going off the main thread, which the check above only confirmed in Chrome. The model is now generated in a
  worker and the scene's setup pauses a frame between steps, so the brick keeps turning there too.


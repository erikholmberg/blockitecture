# 006 — On-screen camera controls

- **Status:** Done (approved by Erik 2026-11-08: all recommendations)
- **Owner:** Erik
- **Created:** 2026-11-08
- **Commits:** 296d823

## Goal
The only ways to move the camera today are gestures: drag to orbit, scroll or pinch to zoom, right-drag to pan. They're mentioned once on the
intro card and never again. There are no buttons for the camera, so visitors with a trackpad, a touch screen or no patience can't easily zoom,
get back to a good view, or stop the slow auto-rotation. Add a small set of visible camera controls.

## Research (2026-11-08)
- Orbit camera (`main.ts`): OrbitControls with damping, distance 12–520 ft, polar angle limited to 0.53π (can't go below the horizon),
  auto-rotate on until the first interaction, then off for good. Walk mode has its own controls (WASD / touch joystick).
- Keyboard today: `P` play/pause, `F` finish, `Tab` orbit/walk. No camera keys.
- **The zoom-out limit (520 ft) predates spec 003.** It now cuts off the real neighborhood: from 520 ft you can't see the hills behind or the basin below together.
- HUD layout: title top-left, toggles top-right (Orbit/Walk, Roof, Day/Dusk), credit under the toggles, timeline bar at the bottom.
  On phones (< 700 px) the bar wraps. The right edge, between the credit and the bar, is empty.

## Behavior
A compact vertical control stack on the right edge, map-style, visible in Orbit mode and hidden in Walk mode:

| Control | Does | Key |
|---|---|---|
| **+** | zoom in one step (smooth) | `+` / `=` |
| **−** | zoom out one step (smooth) | `-` |
| **⟲ / ⟳** | rotate around the house one step (smooth) | `←` / `→` (Orbit mode only) |
| **⌂** | back to the default view (smooth) | `H` |
| **↻** | auto-rotate on/off (shows its state) | `R` |
| **⛶** | fullscreen on/off | — |

(Q2) A **Views** menu with a few named viewpoints the camera glides to.

## Acceptance criteria (draft, finalized once the open questions are answered)
- **A1** [unit] The camera-move math is a pure module (`src/controls/cameraMoves.ts`): zoom steps stay within the min/max distance; rotate
  steps keep the distance and height; any glide ends exactly at its target; easing is monotonic. Tested in Node.
- **A2** [unit] Zoom steps are proportional (each **+** is ×0.75 of the distance, each **−** ×1/0.75), so it feels the same close up and far out.
- **A3** [manual] Each button and key does what the table says, smoothly (~0.6 s glides), in Orbit mode. Dragging, scrolling or pinching
  during a glide cancels it immediately.
- **A4** [manual] Using any control (or gesture) turns auto-rotate off, and the **↻** button shows that. **↻** turns it back on.
- **A5** [manual] The controls hide in Walk mode and come back in Orbit mode. Camera keys don't fire in Walk mode, where the arrows walk.
- **A6** [manual] On a phone-sized window (390 × 844) the stack fits between the toggles and the bar without covering either, and the buttons
  are at least 40 × 40 px.
- **A7** [manual] Every button has a tooltip naming it and its key, and an `aria-label`.
- **A8** [manual] (Q3) Zooming all the way out shows the house, the hills behind it and the basin below in one view.

## Out of scope
- Walk-mode controls (unchanged).
- Saving or sharing camera positions in the URL.
- Changing how drag/scroll/pinch feel.

## Open questions
- [x] **Q1 — Which buttons?** *Recommended: all six above* (+, −, rotate left/right, home, auto-rotate, fullscreen). If you'd rather keep it minimal:
      +, −, home.
- [x] **Q2 — Named viewpoints?** A small **Views** list the camera glides to. *Recommended: yes, four:*
      **Overview** (the default), **The famous view** (the low corner angle of the living room over the city, like the Julius Shulman photo),
      **Pool** (from the terrace), **Hills & basin** (pulled far back to show the neighborhood).
- [x] **Q3 — Zoom-out limit.** Raise the maximum from 520 ft? *Recommended: 1,800 ft,* enough to frame the hills and the Sunset Strip from above.
      Fog and the far terrain already cover that.
- [x] **Q4 — Placement.** *Recommended: right edge, vertically centred* (the empty column between the credit and the bar), same paper style as the toggles.

## Implementation notes
- `src/controls/cameraMoves.ts` (pure, tested): `zoomed()` (×0.75 per step, clamped 12–1,800 ft), `rotated()` (22.5° steps around the
  vertical through the target), `Glide` (0.6 s, smootherstep easing; the camera swings around a linearly moving target in spherical
  coordinates, so it orbits rather than cutting through the house; the last step lands exactly on the target), and `VIEWS`.
- **Viewpoints, tuned in the browser.** My first guesses for two of them pointed the wrong way, because the real world is rotated 180° and the basin
  lies toward model −z/+x:
  - *The famous view*: eye level (7 ft) just outside the living room's view-side glass, looking through the room and the
    cantilevered corner to the city. At dusk the city lights show through the windows, like the Shulman photo.
  - *Hills & basin*: 1,690 ft out, from above the hills behind the house, looking over it to the Sunset Strip and the basin.
  - *Pool*: from the terrace corner across the pool into the living room.
  - *Overview*: the existing default.
- `src/ui/hud.ts`: the right-edge column (Views, +, −, ⟲, ⟳, ⌂, ↻, ⛶) with tooltips naming the key, `aria-label`s, `aria-pressed` on ↻ and
  `aria-expanded` on Views. Fullscreen is hidden where `document.fullscreenEnabled` is false (e.g. iPhone Safari). The column is hidden in Walk mode.
- `src/main.ts`: `camAction()` builds each move on where the current glide is heading (so repeated clicks add up), turns auto-rotate off,
  and starts a `Glide`. Grabbing the scene (OrbitControls `start`) and switching mode cancel any glide. Keys `+`/`=`/numpad +, `-`/numpad −,
  `←`/`→`, `H`, `R` work in Orbit mode only. `orbit.maxDistance` is 520 → 1,800.
- **Found and fixed along the way (003-A11 on phones):** on narrow screens the wrapped toggles covered the OpenStreetMap credit.
  Below 700 px the credit now sits above the timeline bar, fully visible (required by ODbL).
- **Results:**
  - A1–A2: `tests/cameraMoves.test.ts` (6 tests); 51 total.
  - A3 pass: + 194 → 145.5 ft; two − → 258.7 ft; ⟳ +22.5°; two ← −45°; ⌂/`H` glides back to exactly the default position.
    A drag during a glide cancels it (it stopped at 1,571 ft on its way to 194).
  - A4 pass: every control turns auto-rotate off and the ↻ button shows it; `R`/↻ turns it back on.
  - A5 pass: the column is hidden in Walk mode (`display: none`), `H` does nothing there, and the column is back in Orbit mode.
  - A6 pass, in a 390 × 844 frame: toggles end at 132 px, the column spans 239–601 px, the bar starts at 727 px, and the buttons are 40 × 40.
  - A7 pass: tooltips and aria labels are in the markup.
  - A8 pass: at 1,800 ft the house sits among the real hills and roads. *Hills & basin* frames the house, the hills and the basin together.

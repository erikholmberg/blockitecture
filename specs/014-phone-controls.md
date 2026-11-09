# 014 — Phone controls that stay out of the way

- **Status:** Done (approved by Erik 2026-11-09 via the plan: phones only, tap to toggle)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** d5afb0c

## Goal
On a phone (390 × 844) the viewer's controls covered about half the screen: the title chip, three toggle groups, an 8-button camera
column, the credit line and a two-row bar. Phones get a compact layout that leaves the house visible, and a tap on the scene hides the
rest. Desktop is unchanged.

## Behavior
Below 768 px wide (Tailwind `md`):

| Before | Phone |
|---|---|
| Title chip, 2 lines | One-line chip: `← Stahl House` (the link is named "All houses") |
| Orbit/Walk, Roof, Day/Dusk toggle groups | A **Settings** button (top right) opening a menu: Camera (Orbit/Walk), Roof (On/Off), Light (Day/Dusk), Speed (1×/4×/16×), then *Default view*, *Auto-rotate*, *Fullscreen* (if supported), *Restart* and the credit link |
| Camera column (8 buttons) | Gone. Drag orbits and pinch zooms; *Default view* and *Auto-rotate* are in the menu. **Views** (eye) stays, next to Settings |
| Credit line above the bar | Off the screen. It is in the Settings menu and on the intro card |
| Two-row bar | One row: play · phase, pieces and slider · time · Finish (speed is in the menu) |

**Tap to toggle:** in Orbit mode on a phone, tapping the scene hides everything except a 3 px progress line along the bottom edge. Tapping
again brings the controls back.
- **What counts as a tap:** one pointer, moved less than 8 px, released within 300 ms. Drags, pinches and long presses don't count.
- **Walk mode:** taps do nothing, and switching modes always shows the controls.
- **Desktop:** clicks never hide anything.

**Attribution:** OSM's attribution guidelines accept a credit behind a control on small screens, as long as it is reachable from the map
(here: the Settings menu, plus the intro card every visit starts with). Desktop keeps the credit on screen (003-A11).

## Acceptance criteria
- **A1** [unit] Compact HUD:
  - Nothing on screen outside the menu: no camera column, no Orbit/Walk, Roof or Light toggle groups, no credit.
  - The Settings menu's items call `onMode`, `onRoof`, `onLight`, `onSpeed`, `onCam('home')`, `onCam('auto')` and `onRestart`.
  - The menu contains the OSM credit link.
  - Views still lists the four views.
- **A2** [unit] Wide HUD (`compact={false}`): the 007-A3 tests pass unchanged.
- **A3** [unit] `isTap`: a still, quick, single-pointer touch is a tap. Moving 8 px or more, holding 300 ms or longer, or a second
  pointer is not.
- **A4** [unit] `chromeHidden`:
  - In compact mode it hides everything except the progress line, and toggling again shows the controls.
  - `setMode` resets it.
  - In wide mode it has no effect.
- **A5** [manual] 390 × 844, Orbit, controls shown: the top controls end within 60 px of the top, the bottom bar is at most 72 px tall,
  and nothing sits on the right edge. With the controls hidden, only the progress line is visible.
- **A6** [manual] Touch at 390 × 844:
  - A tap toggles the controls; a drag, a pinch and a long press don't.
  - Every menu item works.
  - Walk mode still shows the joystick, the jump button and the hint, and Settings switches back to Orbit.
- **A7** [manual] Desktop at 1440 px looks and works as before (006-A3–A7, the credit on screen), and clicking the scene hides nothing.
- **A8** [unit] `npm run check` passes.

## Out of scope
- Desktop layout changes.
- Walk-mode touch controls (joystick, jump).
- The home page.

## Open questions
None. Erik chose phones only, and tap to toggle (not fade when idle).

## Implementation notes
- **Files:**
  - `src/engine/ui/Hud.tsx`: a `compact` prop, defaulting to `useCompact()` (`matchMedia('(max-width: 767px)')`). The wide markup is
    unchanged, apart from dropping its old narrow-screen classes, which no longer apply because wide means ≥ 768 px.
  - `src/engine/ui/hudStore.ts`: `chromeHidden`. `mountHud()` gains `toggleChrome()`, and `setMode()` resets it.
  - `src/engine/controls/tap.ts`: pure `isTap()`.
  - `src/engine/viewer.ts`: pointerdown/up/cancel on the canvas, counting the most pointers down at once (so a pinch never counts as a
    tap), and toggling only in Orbit mode.
  - Tests: `tests/phoneControls.test.tsx` (A1–A4). `tests/hud.test.tsx` now passes `compact={false}` (A2).
- **Found along the way:**
  - On phones the count dropped "pieces", so the phase name isn't cut short ("Shaping the hillside · 7,573 / 27,233").
  - The walk hint wraps on narrow screens (the desktop hint was wider than 390 px).
- **Manual checks** (390 × 844 frame in Chrome, `npm run dev`):
  - A5 pass: the top controls end at 52 px, the bar is 48 px tall, nothing sits on the right edge, and when hidden only the progress line is
    left (`data-testid="progress-line"`, 0 buttons).
  - A6 partly checked, with synthetic touch pointer events in the frame:
    - A tap hides and a second tap shows. A 45 px drag, a two-finger pinch and a 450 ms press change nothing.
    - The menu opens with every group, and *Walk* switches modes, with the hint shown and Settings still there.
    - Not checked on a real touch device: the joystick and the jump button (`touch.ts` is unchanged).
  - A7 pass at 1465 px: the same layout as before (toggles, credit under them, camera column, two-button bar), and clicking the scene hid
    nothing.

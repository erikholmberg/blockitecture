# 032 — Matching corners, one size smaller

- **Status:** Done (requested by Erik 2026-11-09, with a screenshot)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The viewer's controls look like one set: their corners match, and they're a little less chunky.

## Today
(Erik's screenshot, 2026-11-09)
- **The toggles** (Orbit/Walk, Roof/No roof, Day/Dusk) sit in frames with a medium corner radius and 2 px of padding. Their
  segments, including the black selected one, use the larger default radius, so the inner corners are rounder than the outer ones
  and don't nest.
- **The camera buttons** on the right (and Views, and the phone layout's Settings) are 40 px squares with the button's own radius.

## Behavior
- **Matching corners:** every control in the top bar and the camera column has the same outer radius (the theme's `--radius`).
  Each toggle segment's radius is that minus the frame's 2 px padding, so the corners nest concentrically.
- **One size smaller:**
  - the top toggles go from the default size (32 px tall) to the small one (28 px, slightly smaller text);
  - the camera column's buttons and the Views button go from 40 to 36 px. The phone layout's Settings button stays 40 px, a
    comfortable touch target, and only gets the matching corners.
- **Unchanged:** the timeline bar at the bottom, the phone layout's sizes (spec 014), and everything the controls do.

## Acceptance criteria
- **A1** [unit] The top toggle groups are the small size, with the `--radius` frame; their segments have the concentric radius
  (`--radius` − 2 px).
- **A2** [unit] The camera buttons and the Views button are 36 px (`size-9`) with the `--radius` corners.
- **A3** [unit] The existing HUD tests pass (specs 006, 007, 014): every control still works and keeps its label.
- **A4** [manual] In `npm run dev`, the toggles' black segments nest inside their frames with matching corners, and the controls read
  a size smaller.

## Out of scope
- The timeline bar and the intro card.
- Colours.

## Open questions
None.

## Implementation notes
- **Toggles:** in `src/engine/ui/Hud.tsx`, `Seg`'s frame is `rounded-lg` (`--radius`), and its segments are
  `rounded-[calc(var(--radius)-2px)]!`. The `!` overrides the toggle group's own first and last corner rules. The three top toggles
  pass `size="sm"`.
- **Buttons:** `CamButton` and the Views button are `size-9 rounded-lg`. The phone Settings button stays `size-10`, with
  `rounded-lg` added; I'd first shrunk it too, against the spec's own "phone sizes unchanged", and caught it.
- **Tests:**
  - `tests/controlSizes.test.tsx` covers A1 and A2. They failed first.
  - The toggles are found through their radio options: jsdom doesn't expose the group's name.
  - The spec 006/007/014 HUD tests pass unchanged (A3). 200 tests in all.
- **A4 pass** (Chrome, the Stahl House):
  - The black segments nest in their frames with concentric corners.
  - The toggles are 28 px tall and the camera column's buttons 36 px, all with the same corners.

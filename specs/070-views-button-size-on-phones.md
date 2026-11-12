# 070 — Views button the same size as its neighbours on phones

- **Status:** In progress: built, waiting for Erik's look on his phone, A3 (reported by Erik 2026-11-12: "the eye button on mobile
  looks to be a different size than the other 2 controls at the top of the screen"; built without a review stop, as the fix has
  no decision in it)
- **Owner:** Erik
- **Created:** 2026-11-12
- **Commits:** <!-- filled in when Done -->

## Goal
On a phone the three buttons at the top right (Views, By the numbers, Settings) are the same size. Today Views is 36 px and the
other two are 40 px: spec 032 made the desktop buttons 36 px, and Views kept that size in the phone layout.

## Behavior
- On a phone, Views (the eye) is 40 px, like By the numbers and Settings beside it, and like the title button on the left.
- On a wide screen nothing changes: Views stays 36 px in the camera column (spec 032).

## Acceptance criteria
- **A1** [unit] In the phone layout, Views, By the numbers and Settings are all `size-10` with the same corners, and none is `size-9`.
- **A2** [unit] In the wide layout Views is still `size-9` (spec 032's A2 still passes).
- **A3** [manual, Erik's phone] The three buttons at the top right are the same size and line up.

## Out of scope
- Where the Views menu opens, and everything else in the phone layout.

## Open questions
None.

## Implementation notes
- `ViewsMenu` in `src/engine/ui/Hud.tsx` takes `compact`, as `NumbersMenu` already does.
- Measured in an iPhone 14-sized Chromium window (Stahl House, after Start): Views, By the numbers and Settings are each
  40 × 40 px with their tops at 12 px. Before, Views was 36 px.
- **A3 not checked:** it needs Erik's phone.

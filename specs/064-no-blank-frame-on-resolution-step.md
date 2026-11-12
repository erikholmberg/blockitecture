# 064 — No blank frame when the resolution steps down

- **Status:** In progress: fixed, waiting for Erik's iPhone check, A5 (approved by Erik 2026-11-11: "There is flickering on my iPhone for various buildings, in the intro with the pop up and
  while building"; a bug report, specified by its symptom, as for spec 011)
- **Owner:** Erik
- **Created:** 2026-11-11
- **Commits:** <!-- filled in when Done -->

## Goal
On an iPhone the screen flickers on various buildings, both while the intro card shows and during the build. The picture should
never flash, on any device.

## Diagnosis (2026-11-11)
- **The cause found:** the viewer's adaptive resolution. When the frame rate stays under 38 fps for two seconds, it lowers the
  pixel ratio by 0.25, down to 0.75: up to three steps a page on a phone (1.5 → 1.25 → 1.0 → 0.75).
  - Changing the pixel ratio resizes the canvas, which clears it. The step ran after the frame had been drawn, so the cleared
    canvas was what the browser showed until the next frame: a blank flash across the whole screen.
  - **Measured** in an iPhone-emulating WebKit: before a step 400 of 400 sampled pixels are drawn; at the end of the step's frame,
    0 of 400; two frames later, 400 again.
- **Why a phone, and why those moments:** a phone drops under 38 fps where this Mac doesn't: while the scene turns behind the intro
  card, and again as the pieces pile up during the build. The heavier buildings do it sooner. On this Mac all 22 buildings hold
  about 50 fps in the same emulation, with no step and no flash, so it never showed here.
- **Not reproduced here:** the flicker itself, as seen on the phone. No real iPhone is available, so this fixes the one cause
  that could be demonstrated. Spec 036's fix (no translucent layer over the canvas) is still in place.
- **The window's resize handler** changes the canvas's size the same way. Browsers send resize before they draw a frame, so it
  shouldn't blank, but it gets the same treatment to be safe (an iPhone resizes the page when its toolbar hides or shows).

## Behavior
- Whenever the viewer changes the canvas's size or resolution, it draws the scene again at once, in the same frame. The visitor
  never sees an empty canvas.
- The adaptive resolution itself is unchanged: the same threshold, the same steps, the same floor.

## Acceptance criteria
- **A1** [unit] The helper that changes the canvas (`redrawAfter`) makes its change and then renders the scene, in that order, in
  one call.
- **A2** [unit] After the renderer's first setup, `viewer.ts` changes the pixel ratio or the size only through that helper: both
  the adaptive step and the window's resize handler.
- **A3** [unit] The adaptive resolution's rule is unchanged: under 38 fps for two seconds in a row lowers the ratio by 0.25, never
  below 0.75; a second at 38 fps or more resets the count; a pinned `?dpr=` never changes.
- **A4** [manual] In an iPhone-emulating WebKit, with the frame rate forced low so the adaptive step fires: at the end of the
  step's frame the canvas is fully drawn.
- **A5** [manual, Erik's iPhone] The flicker is gone during the intro and the build, on the buildings where it showed.

## Out of scope
- How often the resolution steps, and whether it should ever step back up.
- iPhone Low Power Mode, which caps the frame rate at 30 fps: the viewer then always steps down to 0.75, a softer picture than
  the phone needs. Worth its own spec if A5 passes.

## Open questions
- [x] **Q1: Checking A5.** iOS Safari can't be run here. Erik checks it on his iPhone after the push; the spec stays In progress
      until he confirms. If flicker remains, it has a second cause, and this spec records what was ruled out.

## Implementation notes
- **`src/engine/resolution.ts`** (new, pure): `redrawAfter(renderer, scene, camera, change)` makes the change and renders at
  once; `adaptiveStep()` holds the adaptive rule that used to sit inline in the render loop, unchanged.
- **`src/engine/viewer.ts`:** the adaptive step and the window's resize handler both go through `redrawAfter`. The two calls in
  the renderer's first setup, before anything is drawn, stay as they were.
- **Tests:** `tests/noBlankFrame.test.ts` covers A1–A3. Written first; they failed on the missing module. `npm run check`: 496
  tests pass.
- **How the cause was found:**
  - A probe in an iPhone-emulating WebKit (Playwright's iPhone 14 profile) sampled 70 frames of every building's intro. All 22
    held about 50 fps at pixel ratio 1.5, with no resolution step and no flash, so the flicker doesn't reproduce on this Mac.
  - Calling the same resolution change the viewer makes, at the same point in the frame, left 0 of 400 sampled pixels drawn at
    the end of that frame.
- **A4 pass** (iPhone-emulating WebKit, the frame rate held near 20 fps by a busy loop so the viewer's own step fires): on the
  Stahl House's intro and on Trellick Tower while building, all three steps (1.25, 1.0, 0.75) ended their frame with 400 of
  400 sampled pixels drawn.
- **A5 not checked:** iOS Safari can't be run here. Erik checks it on his iPhone after the push.
- **Not ruled out:** a second cause that only a real iPhone shows (its GPU, its memory limits with the largest models, or how
  iOS composites the page over the canvas). If flicker remains after this, which buildings and what it looks like (a whole-screen
  flash, or surfaces shimmering) would narrow it down.

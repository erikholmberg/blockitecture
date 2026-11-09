# 036 — No flicker behind the intro card on iPhone

- **Status:** Approved (approved by Erik 2026-11-09: "build it", all recommendations)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
On an iPhone, while the intro card is showing and the scene turns behind it, the whole screen flashes. It stops once the visitor taps
Start (reported by Erik, 2026-11-09). The intro should sit calmly over the turning scene on every device.

## Diagnosis
- **The likely cause:** the intro card sits on a full-screen, semi-transparent dark gradient (`from-black/15 to-black/45`) laid over
  the WebGL canvas, and the card has a large soft shadow (`shadow-2xl`). iOS Safari is known to flash translucent page layers stacked
  over a canvas that redraws every frame. While the intro shows, the auto-rotation redraws it every frame.
- **Ruled out:** both of these hold already, so neither is the cause.
  - The HUD doesn't re-render while the intro shows (its store ignores unchanged updates).
  - The sun's shadow camera is fixed on the house; it doesn't move with the view.
- **Why it stops after Start:** the gradient and the card are removed then, though the scene keeps turning.

## Behavior
- While the intro card shows, the scene behind it is still dimmed, as now. The dimming is done by the renderer (a lower exposure),
  not by a translucent layer over the canvas. On Start it brightens back to normal over half a second.
- The card is opaque as now, with a smaller shadow, and sits on its own compositing layer, so the browser doesn't repaint it as the
  scene redraws.
- Nothing else changes: the same card, text, layout and Start button.

## Acceptance criteria
- **A1** [unit] While the intro shows, nothing translucent covers the whole screen: the intro's backdrop has no background colour or
  gradient, and no element inset over the canvas uses a semi-transparent fill.
- **A2** [unit] The scene's exposure is lower while the intro shows, and back to normal after Start (the viewer's exposure function:
  dimmed before Start, 1 after the fade).
- **A3** [unit] The intro card has its own compositing layer (`transform-gpu` or equivalent) and no `shadow-2xl`.
- **A4** [manual] Desktop Chrome: the intro looks as before; the scene is dimmed behind it, and it brightens on Start.
- **A5** [manual, Erik's iPhone] The screen no longer flashes while the intro shows and the scene turns.

## Out of scope
- Other flicker after Start (none reported).
- Changing the intro card's content or layout (spec 026).

## Open questions
- [x] **Q1: Dimming.** *Recommended: dim by exposure* (about 0.7 while the intro shows), which needs no translucent layer. The
      alternative is to drop the dimming altogether, which is simpler but makes the card stand out less over bright scenes.
- [x] **Q2: Checking A5.** I can't run iOS Safari here. *Recommended:* I build it and push, and you check it on your iPhone; the spec
      stays In progress until you confirm.

## Implementation notes
Filled in after approval.

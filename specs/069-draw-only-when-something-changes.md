# 069 — Draw only when something changes

- **Status:** In progress: built, waiting for Erik's iPhone checks, A8 and A9 (approved by Erik 2026-11-12: "approved, both", with all three recommendations)
- **Owner:** Erik
- **Created:** 2026-11-12
- **Commits:** c3c3b62

## Goal
A finished building left on screen stops using the phone's graphics chip, so the phone stays cooler and the battery lasts.
Today the whole scene, shadows included, is drawn again every frame even when the build is done and nothing moves. And two
switches let Erik try lighter phone settings on his own iPhone before any of them becomes the default.

Measured 2026-11-12 on this Mac: a frame is 0.8–2.5 million triangles and 5–9 ms at 1440×900, every frame, moving or not.
What that costs a phone in heat and battery could not be measured here.

## Behavior
- Nothing looks different. While pieces are landing, the camera is moving (dragging, gliding, auto-rotating, walking), the
  light is changing between day and dusk, water is flowing, or the intro is brightening, the scene is drawn every frame as today.
- When none of that is happening, the picture stays as it is and nothing is drawn. The first touch, key or button draws again
  at once: no visible delay, no stale picture.
- A building with moving water (Fallingwater's stream and falls) keeps drawing, as it must.
- A building still auto-rotating (nobody has touched it yet) keeps drawing, as it must.
- The resolution never steps down because the page was resting: only seconds in which frames were actually drawn are judged.
- Two address switches for trying on a phone, off by default: `?shadow=2048` (a smaller shadow map; today 4096) and `?aa=0`
  (no edge smoothing). With `?debug` the overlay shows the frame rate, the resolution, and now whether the page is resting.

## Acceptance criteria
- **A1** [unit] A pure rule says whether a frame must be drawn, from: pieces still landing, build playing, camera moved since the
  last drawn frame, a camera glide or auto-rotate running, walking, light still changing, moving water present, intro still
  brightening, a redraw asked for. With none of them it says no; with any one it says yes.
- **A2** [unit] Everything that changes the picture without moving the camera asks for a redraw: play/pause/seek/speed, day/dusk,
  the roof cut, a view button, switching walk/orbit, window resize, a resolution step, the tab becoming visible again.
  (Checked against the viewer's source, as spec 064's redraw test is.)
- **A3** [unit] The adaptive resolution is given only seconds in which frames were drawn: a rested second neither counts as slow
  nor resets the slow count. A second with fewer than 10 drawn frames is not judged.
- **A4** [unit] `?shadow=` accepts 1024, 2048 and 4096 and ignores anything else; `?aa=0` turns smoothing off; without them the
  renderer is set up exactly as today.
- **A5** [manual] Stahl House with `?debug`: let the build finish, drag once to stop the rotation, let go. Within a second the
  overlay says resting and the frame count stops. Drag, press a view button, toggle dusk, toggle the roof: each responds at once,
  and it rests again afterwards.
- **A6** [manual] Fallingwater: the water keeps moving after the build, and the overlay never says resting.
- **A7** [manual] Emulated iPhone (as in specs 064 and 065): no blank or stale frame across intro, build, rest and wake; the
  resolution doesn't step down while resting.
- **A8** [manual, Erik's iPhone] A finished building left for a few minutes: the phone stays cool, and touching it responds at once.
- **A9** [manual, Erik's iPhone] Try `?debug&shadow=2048` and `?debug&aa=0` on a heavy building (Sheats-Goldstein, Neue
  Nationalgalerie): note the frame rate and whether the picture is visibly worse. The result decides a follow-up spec.

## Out of scope
- Making either phone setting the default: decided after A9.
- Re-using the shadow map between drawn frames. It removed 15–40% of the triangles but made no measurable difference on this Mac.
- A lighter neighbourhood, the slow models, thumbnails (the other items in the audit).
- The home page and the credits page.

## Open questions
- [x] **Q1: Auto-rotate.** A building nobody has touched rotates forever, so it never rests. Recommendation: leave it; stopping
  the rotation after a while is a visible change and would be its own decision.
- [x] **Q2: Dusk.** If the city lights or lamps flicker or twinkle at dusk, dusk never rests either. I'll check when building;
  recommendation: keep any such animation and accept that dusk keeps drawing.
- [x] **Q3: The two phone switches in this spec?** Recommendation: yes, they're a few lines and let you answer A9 on the same visit
  as A8. Say if you'd rather they wait.

## Implementation notes
- **How it decides** (`src/engine/redraw.ts`, pure). The viewer doesn't hook every event that might change the picture; a missed
  one would leave a stale frame. Each tick it gathers what the picture depends on into a `Look` (build time, mode, roof cut,
  exposure, lamp level, night level, hidden neighbours, and the camera's position, rotation, lens, near plane and orbit target)
  and draws if that differs from the look last drawn. So A1's "playing", "pieces landing", "glide", "auto-rotate" and "walking"
  are all seen as the build time or the camera having moved, and A2's play/pause/seek/roof/view/mode need no call of their own.
  On top of that: the light still changing (`env.busy`), moving water (`set.movingWater`), and an outright ask (resize, the tab
  becoming visible, a restored graphics context). The loop itself still ticks every frame; only the drawing is skipped.
- **A damped camera** creeps on for seconds after a drag, below anything visible. Differences under 0.0001 don't count, and the
  comparison is with the last frame drawn, so a slow drift is still drawn once it adds up. In practice the page rests about
  3 s after a drag at 60 Hz, with a few stray frames on the way.
- **Adaptive resolution** (`fpsWindow`): only ticks that drew are counted, and not the first frame after a rest.
- **Q2, dusk: nothing animates**, so dusk rests too. But checking it found an old fault: near the end of a day/dusk change the
  colour blend takes steps too small to change an 8-bit colour, so it stalls short of its target and was counted as "still
  changing" for ever. After any switch to dusk the reflection map was being remade twice a second, for as long as the page
  stayed open. A stalled colour now counts as settled. The colours stop where they always stopped, so dusk looks the same.
  (They stop short of the designed dusk colours, and where they stop depends on the frame rate. Not changed here.)
- **Switches**: `renderOptions()` reads `?shadow=` and `?aa=`; the shadow size is passed to `Environment`.
- `?debug`: the overlay says "· resting"; `__viewer.drawn()`, `.resting()` and `.options` for checks.
- **A5 passed** (Chromium on this Mac): intro and finished-but-rotating draw 60 frames a second; after a drag the page rests
  (0 frames a second); a drag, the H key, Dusk, Day, No roof, a seek, play at 16×, walk, orbit and a window resize each drew
  within 150 ms and (except play) rested again; the resized picture at rest was complete.
- **A6 passed**: Fallingwater draws 60 frames a second after the build and a drag, and never rests.
- **A7 passed** (iPhone-emulating WebKit, frames capped at 30 and uncapped; Neue Nationalgalerie, Stahl House): the page rests
  after the build and a drag; the screenshot at rest is a full picture; a drag wakes it (5 frames in 150 ms at 30 Hz) and it
  rests again; the resolution stays at 1.5 throughout. No errors.
- **A4's switches** work: with `?shadow=2048&aa=0` the shadow map is 2048 and the canvas has no smoothing.
- **A8 and A9 not checked:** they need Erik's iPhone.

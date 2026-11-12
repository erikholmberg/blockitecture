# 065 — Crisp on a phone in Low Power Mode

- **Status:** Done (approved by Erik 2026-11-11: "Approved", both recommendations; closed by Erik 2026-11-12: "close the spec",
  with no result reported for the iPhone checks, A7 and A8; if softness or speckles remain they get a new spec)
- **Owner:** Erik
- **Created:** 2026-11-11
- **Commits:** ca18cc5

## Goal
On Erik's iPhone the buildings look soft and jagged (reported 2026-11-11, with screenshots of the Neue Nationalgalerie). The
phone was in Low Power Mode. A phone that isn't struggling should keep the viewer's full phone resolution.

## Diagnosis (2026-11-11)
- **The adaptive resolution's rule** (spec 003, moved to `src/engine/resolution.ts` by spec 064): under 38 frames a second for two
  seconds in a row lowers the pixel ratio by 0.25, down to a floor of 0.75. A phone starts at 1.5.
- **Low Power Mode caps Safari at 30 frames a second.** That's under 38 however light the scene is, so the viewer steps down every
  two seconds and reaches 0.75 about six seconds after the page opens, on every building.
- **0.75 on a 3× screen** draws a quarter of the phone's pixels each way. Hence the blur and the stair-stepped edges.
- **Nothing changed in the rule.** Until spec 064, each step came with a blank flash; now the steps are silent, so the softness is
  what's left to notice.
- **The dark speckles** on the terrace and the glass in the first screenshot are probably the thin seams between pieces, breaking
  up at that resolution. Not confirmed: this Mac never reaches 0.75 on its own.

## Behavior
- **The viewer learns the screen's own frame rate** while the loading screen shows, before the scene is drawn: 30 in Low Power
  Mode, 60 on most screens, 120 on some.
- **"Slow" is judged against that rate:** under 63% of it (the same share as 38 of 60), and never above 38. So on a phone capped
  at 30, only under 19 frames a second counts as slow; at 60 or 120 the threshold stays 38, as now.
- **On a phone the resolution never goes below 1.0.** On a desktop the floor stays 0.75.
- Everything else is as now: the same steps of 0.25, two slow seconds in a row before a step, no stepping back up, and `?dpr=`
  pins the resolution.

## Acceptance criteria
- **A1** [unit] The slow threshold is 38 for a 60 Hz and a 120 Hz screen, about 19 for a 30 Hz screen, and 38 when the rate
  couldn't be measured.
- **A2** [unit] At a steady 30 frames a second on a 30 Hz screen, the resolution never steps down. At 15, it does.
- **A3** [unit] At a steady 30 frames a second on a 60 Hz screen, it steps down as now (the phone really is slow).
- **A4** [unit] On a phone the resolution never goes below 1.0; on a desktop the floor is 0.75, as now.
- **A5** [unit] The screen's rate is estimated from frame intervals: the median of a short run, so one long frame doesn't skew it.
- **A6** [manual] In an iPhone-emulating WebKit with frames held at 30 a second, the resolution stays at 1.5 through the intro and
  the build.
- **A7** [manual, Erik's iPhone, Low Power Mode on] The Neue Nationalgalerie stays crisp, and the speckles are gone.
- **A8** [manual, Erik's iPhone, Low Power Mode off] As crisp as before, and no flicker (spec 064's A5).

## Out of scope
- Low Power Mode being switched on or off while a page is open: the rate is measured once, at load.
- Raising the phone's starting resolution above 1.5, or stepping back up after a slow spell.
- The speckles, if they remain at full resolution: then they have another cause and get their own spec.

## Open questions
- [x] **Q1: The phone's floor.** *Recommended: 1.0*, as above. On a truly slow phone that means a lower frame rate rather than a
      softer picture. The alternative is to keep 0.75 everywhere and rely on the new threshold alone.
- [x] **Q2: Measuring the rate at load.** *Recommended:* about half a second of frames while the loading screen shows; the model is
      generated in a worker then, so the page is idle. If the measurement fails, the threshold is 38 as now.

## Implementation notes
- **`src/engine/resolution.ts`:** `slowThreshold(hz)`, `minDpr(isTouch)` and `refreshRate(intervals)` are new; `adaptiveStep()`
  takes the threshold and the floor as options, defaulting to 38 and 0.75, so spec 064's test of the old rule still passes.
  - `refreshRate` takes the median interval and snaps it to a common screen rate when it's within 5% (a measured 59 is 60).
- **`src/engine/viewer.ts`:** `measureRefresh()` collects up to 30 frame intervals (or 0.6 s) while the model is generated in its
  worker, and gives up after 1.5 s (a background tab gets no frames). The debug API gained `adaptive()`: the threshold, the
  floor and the pixel ratio now.
- **Tests:** `tests/crispLowPower.test.ts` covers A1–A5 and that the viewer wires them in. Written first; all six failed on the
  missing functions. Spec 064's A2 pinned the renderer's setup to "before line 80"; it now checks that the setup comes before
  the first guarded change. `npm run check`: 502 tests pass.
- **A6 pass** (iPhone-emulating WebKit, animation frames delivered on a 30 Hz grid from the start, as a capped screen does):
  - the Neue Nationalgalerie and Trellick Tower: threshold 19, pixel ratio 1.5 after 7 s of intro and after 9 s of building,
    at a steady 30 frames a second;
  - the control, a 60 Hz screen whose page is slowed to about 35 frames a second: threshold 38, and the ratio steps down to
    the phone's floor, 1.0, and stays there.
- **A7 and A8 not checked:** iOS Safari can't be run here, and no result from Erik's iPhone was reported before the spec was closed.
- **The speckles** weren't investigated here: I didn't look for them in the emulation. Whether they go with the resolution is
  for A7 to tell.

# 068 — Load without waiting for the frame-rate measurement

- **Status:** In progress: built and checked here; waiting for Erik's say to close (approved by Erik 2026-11-12: "approved, both", with the recommendation: 10 frames)
- **Owner:** Erik
- **Created:** 2026-11-12
- **Commits:** d827779

## Goal
A building page appears about a third of a second sooner. Spec 065 measures the screen's frame rate while the model is made, and
the page waits for that measurement (about half a second) even when the model was ready long before.

Measured 2026-11-12 on this Mac, production build: 19 of 22 buildings log "generated in 502–517 ms", though their models take
16–370 ms to make. Only Sheats-Goldstein, Ennis and Casa Malaparte take longer than the measurement.

## Behavior
- The loading screen ends sooner on most buildings. Nothing else looks different.
- The frame-rate measurement still happens, and Low Power Mode is still recognised (spec 065): the page still waits for a short
  run of frames, 10 where it was 30, so about 0.17 s on a 60 Hz screen and 0.33 s at 30 Hz. While the model is still being
  made, it keeps collecting frames as before, at no cost.

## Acceptance criteria
- **A1** [unit] The measurement is finished when the model is ready and 10 frame intervals are in; before the model is ready it
  goes on to 30 intervals or 0.6 s as today; 10 intervals alone, model not ready, is not finished.
- **A2** [unit] `refreshRate` gives 60 for ten 16.7 ms intervals, 30 for ten 33.3 ms intervals, and 30 for ten intervals of which
  three are long (a busy moment), as it does for thirty.
- **A3** [unit] The viewer tells the measurement when the model is ready, and still passes the measured threshold to the adaptive
  resolution (spec 065's A5 still holds).
- **A4** [manual] With `?debug`, the console's "generated in … ms" for the Stahl House, Farnsworth House and Haus am Horn is under
  300 ms (was 505–512 ms); for Casa Malaparte it is unchanged.
- **A5** [manual] Spec 065's emulated check again: frames capped at 30 from the start gives a threshold of 19 and the resolution
  stays at 1.5; an uncapped 60 Hz page gives 38.

## Out of scope
- The three slow models (Casa Malaparte 1.9 s in the browser, Sheats-Goldstein and Ennis about 0.8 s). Their own spec, after profiling.
- Everything after the model is ready (neighbourhood, pieces, first frame).

## Open questions
- [x] **Q1: Wait for 10 frames, or not at all?** Not waiting saves another 0.1–0.2 s, but then the measurement runs while the page
  is busy setting up, and a busy page looks like a slow screen: the mistake spec 065 was written to avoid, in reverse.
  Recommendation: 10 frames.

## Implementation notes
- `measurementDone()` in `src/engine/resolution.ts` (pure) decides when the run of frames is enough; `measureRefresh()` in
  `viewer.ts` now returns `{ rate, modelReady }`, and the viewer calls `modelReady()` as soon as the model is unpacked.
- **A4 passed** (Chromium on this Mac, dev server, 60 Hz): "generated in" is 180 ms for the Stahl House, 178 ms for the
  Farnsworth House, 171 ms for Haus am Horn (were 505–512 ms); Casa Malaparte 1871 ms (was 1876–1904 ms).
- **A5 passed** (iPhone-emulating WebKit, as in spec 065): frames capped at 30 from the start gives a threshold of 19 and the
  resolution stays at 1.5 through intro, build and rest (Neue Nationalgalerie, Stahl House); uncapped gives 38. With the cap
  the step takes about 365 ms: ten frames at 30 a second.
- Not checked on a real phone.

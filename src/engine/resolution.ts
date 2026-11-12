/**
 * Spec 064: the viewer's adaptive resolution, and a guard against blank frames. Pure (no DOM, no Three.js).
 *
 * Changing a canvas's size or pixel ratio clears it. If that happens after the frame was drawn, the browser shows the cleared
 * canvas until the next frame: a flash across the whole screen (seen as flicker on an iPhone, where the frame rate dips and the
 * resolution steps down). So every such change goes through redrawAfter(), which draws the scene again at once.
 */
export interface Redrawable<S, C> { render(scene: S, camera: C): void }

/** Make a change that clears the canvas (a new size or pixel ratio), then draw the scene again in the same frame. */
export function redrawAfter<S, C>(renderer: Redrawable<S, C>, scene: S, camera: C, change: () => void): void {
  change();
  renderer.render(scene, camera);
}

/**
 * Spec 068: has the frame-rate measurement seen enough? Once the model is ready the page is waiting for it, so 10 intervals
 * do; while the model is still being made the frames are free, so it runs on to 30 intervals. Over 0.6 s ends it either way.
 */
export function measurementDone(intervalsMs: number[], modelReady: boolean): boolean {
  const n = intervalsMs.length;
  return n >= 30 || (modelReady && n >= 10) || intervalsMs.reduce((a, g) => a + g, 0) > 600;
}

export const SLOW_FPS = 38;
export const MIN_DPR = 0.75;
export const DPR_STEP = 0.25;

/** A desktop may drop to 0.75; a phone never goes below 1.0, which on its dense screen is already soft (spec 065). */
export const minDpr = (isTouch: boolean) => (isTouch ? 1 : MIN_DPR);

/**
 * Spec 071: the pixel ratio `?dpr=` pins, kept between 0.5 and 3 so a crafted link can't ask for a canvas that crashes the tab.
 * 0 (not pinned) without the parameter, or when it's zero or not a finite number.
 */
export const PINNED_DPR = { min: 0.5, max: 3 };
export function pinnedDpr(param: string | null): number {
  const v = param === null || param.trim() === '' ? 0 : Number(param);
  return Number.isFinite(v) && v !== 0 ? Math.min(PINNED_DPR.max, Math.max(PINNED_DPR.min, v)) : 0;
}

/**
 * Spec 065: what counts as slow on a screen that refreshes `hz` times a second: the same share of it as 38 is of 60, and never
 * above 38. A phone in Low Power Mode is capped at 30, so only under 19 is slow there; unmeasured, it's 38 as before.
 */
export const slowThreshold = (hz: number | undefined) => (hz ? Math.min(SLOW_FPS, (hz * SLOW_FPS) / 60) : SLOW_FPS);

/**
 * Spec 065: the screen's refresh rate from a run of frame intervals in ms: the median, so a few long frames don't skew it.
 * Undefined when there are too few frames or the result isn't a plausible screen rate.
 */
export function refreshRate(intervalsMs: number[]): number | undefined {
  if (intervalsMs.length < 5) return undefined;
  const sorted = [...intervalsMs].sort((a, b) => a - b);
  const raw = 1000 / sorted[sorted.length >> 1];
  if (!(raw >= 20 && raw <= 250)) return undefined;
  // screens come in a few rates: a measurement within 5% of one is that one (59 is 60)
  const known = [24, 30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 240].find((k) => Math.abs(raw - k) / k < 0.05);
  return known ?? Math.round(raw);
}

/**
 * One second's verdict (the rule from spec 003): under the slow threshold for two seconds in a row lowers the pixel ratio by
 * 0.25, never below the floor; a second at the threshold or more resets the count; a ratio pinned by ?dpr= never changes.
 * The threshold and the floor default to 38 fps and 0.75; spec 065 sets them per device.
 */
export function adaptiveStep(
  s: { dpr: number; slow: number }, fps: number, pinned: boolean, o: { slowFps?: number; minDpr?: number } = {},
): { dpr: number; slow: number } {
  const slowFps = o.slowFps ?? SLOW_FPS, floor = o.minDpr ?? MIN_DPR;
  if (pinned || fps >= slowFps || s.dpr <= floor) return { dpr: s.dpr, slow: 0 };
  if (s.slow + 1 < 2) return { dpr: s.dpr, slow: s.slow + 1 };
  return { dpr: Math.max(floor, s.dpr - DPR_STEP), slow: 0 };
}

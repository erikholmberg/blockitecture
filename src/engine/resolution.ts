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

export const SLOW_FPS = 38;
export const MIN_DPR = 0.75;
export const DPR_STEP = 0.25;

/**
 * One second's verdict (the rule from spec 003, unchanged): under 38 fps for two seconds in a row lowers the pixel ratio by
 * 0.25, never below 0.75; a second at 38 fps or more resets the count; a ratio pinned by ?dpr= never changes.
 */
export function adaptiveStep(s: { dpr: number; slow: number }, fps: number, pinned: boolean): { dpr: number; slow: number } {
  if (pinned || fps >= SLOW_FPS || s.dpr <= MIN_DPR) return { dpr: s.dpr, slow: 0 };
  if (s.slow + 1 < 2) return { dpr: s.dpr, slow: s.slow + 1 };
  return { dpr: Math.max(MIN_DPR, s.dpr - DPR_STEP), slow: 0 };
}

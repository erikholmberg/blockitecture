/**
 * Spec 014: what counts as a tap on the scene (pure, no DOM). One pointer that moved less than TAP_MOVE px and was released
 * within TAP_MS ms; drags, pinches and long presses are not taps.
 */
export const TAP_MOVE = 8;
export const TAP_MS = 300;

export function isTap({ dx, dy, dt, pointers }: { dx: number; dy: number; dt: number; pointers: number }) {
  return pointers === 1 && Math.hypot(dx, dy) < TAP_MOVE && dt < TAP_MS;
}

/**
 * Spec 036: while the intro card shows, the scene behind it is dimmed by the renderer's exposure, not by a translucent layer
 * over the canvas (iOS Safari flashes those while the canvas redraws). On Start it brightens back over half a second. Pure.
 */
export const INTRO_EXPOSURE = 0.7;
export const INTRO_FADE = 0.5;

/** the exposure, given the seconds since Start (null: not started yet) */
export function exposureAt(sinceStart: number | null): number {
  if (sinceStart === null || sinceStart <= 0) return INTRO_EXPOSURE;
  if (sinceStart >= INTRO_FADE) return 1;
  const t = sinceStart / INTRO_FADE, s = t * t * (3 - 2 * t);
  return INTRO_EXPOSURE + (1 - INTRO_EXPOSURE) * s;
}

/**
 * Spec 069: draw a frame only when the picture would differ from the last one drawn. Pure (no DOM, no Three.js).
 *
 * The viewer doesn't try to catch every event that might change the picture (a missed one would leave a stale frame).
 * Each tick it gathers everything the picture depends on into a `Look` and compares it with the look last drawn.
 */
export interface Look {
  /** build time: playing, seeking, finishing and restarting all move it, and it decides which pieces are landing */
  t: number;
  mode: string;
  /** the roof cut, 0 or 1 */
  roof: number;
  /** tone-mapping exposure, which carries the intro's brightening */
  exposure: number;
  /** how bright the lamps are, and how far into night the city is */
  light: number;
  night: number;
  /** which lot neighbours are hidden for standing in the way */
  hidden: string;
  /** the camera: position (3), rotation (4), field of view, near plane, and the orbit target (3) */
  cam: number[];
}

/** less than this is invisible: the tail of a damped camera move creeps on for seconds below it */
const EPS = 1e-4;
const differs = (a: number, b: number) => Math.abs(a - b) > EPS;

/** Is `now` a different picture from the last one drawn (`drawn`; null before the first frame)? */
export function lookChanged(drawn: Look | null, now: Look): boolean {
  if (!drawn) return true;
  if (drawn.t !== now.t || drawn.mode !== now.mode || drawn.roof !== now.roof || drawn.hidden !== now.hidden) return true;
  if (differs(drawn.exposure, now.exposure) || differs(drawn.light, now.light) || differs(drawn.night, now.night)) return true;
  if (drawn.cam.length !== now.cam.length) return true;
  for (let i = 0; i < now.cam.length; i++) if (differs(drawn.cam[i], now.cam[i])) return true;
  return false;
}

/**
 * Must this tick draw? Yes if the look changed, the light is still moving between day and dusk (or its reflection map is
 * being remade), the house has moving water, or something outside the look asked (a resize, the tab coming back).
 */
export const mustDraw = (o: { changed: boolean; lightChanging: boolean; movingWater: boolean; asked: boolean }): boolean =>
  o.changed || o.lightChanging || o.movingWater || o.asked;

/**
 * The frame rate over about a second of frames that were actually drawn, for the adaptive resolution. Ticks that didn't draw
 * are left out, and so is the first frame after a rest (its interval is the rest, not a slow frame). A second with fewer than
 * 10 drawn frames gives no verdict.
 */
export interface FpsWindow { time: number; frames: number; prevDrew: boolean }
export const fpsWindow = {
  start: (): FpsWindow => ({ time: 0, frames: 0, prevDrew: false }),
  add(w: FpsWindow, dt: number, drew: boolean): { window: FpsWindow; fps?: number } {
    if (!drew || !w.prevDrew) return { window: { ...w, prevDrew: drew } };
    const time = w.time + dt, frames = w.frames + 1;
    if (time <= 1) return { window: { time, frames, prevDrew: true } };
    return { window: { time: 0, frames: 0, prevDrew: true }, fps: frames >= 10 ? frames / time : undefined };
  },
};

/** `?shadow=1024|2048|4096` and `?aa=0`: lighter settings to try on a phone. Without them, the renderer is as it always was. */
export function renderOptions(params: URLSearchParams): { shadowMapSize: number; antialias: boolean } {
  const shadow = Number(params.get('shadow'));
  return { shadowMapSize: [1024, 2048, 4096].includes(shadow) ? shadow : 4096, antialias: params.get('aa') !== '0' };
}

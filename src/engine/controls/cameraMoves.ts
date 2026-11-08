/**
 * Spec 006: camera moves for the on-screen controls: zoom and rotate steps, named viewpoints and smooth glides.
 * Pure math (no Three.js, no DOM) so it can be unit-tested in Node.
 * Model coordinates: x/z horizontal, y up, 1 unit ≈ 1 ft.
 */
export interface V3 { x: number; y: number; z: number }
export interface View { pos: V3; target: V3 }

export const MIN_DIST = 12;
export const MAX_DIST = 1800; // spec 006-Q3 (was 520): enough to frame the hills and the basin
export const ZOOM_STEP = 0.75; // each "+" multiplies the distance by this
export const ROTATE_STEP = Math.PI / 8; // 22.5° per "⟲ / ⟳"
export const GLIDE_DUR = 0.6; // s

const v3 = (x: number, y: number, z: number): V3 => ({ x, y, z });
const sub = (a: V3, b: V3) => v3(a.x - b.x, a.y - b.y, a.z - b.z);
const add = (a: V3, b: V3) => v3(a.x + b.x, a.y + b.y, a.z + b.z);
const len = (a: V3) => Math.hypot(a.x, a.y, a.z);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const distance = (v: View) => len(sub(v.pos, v.target));

/** Zoom one step: dir 1 = in, −1 = out. Keeps the target and the viewing direction. */
export function zoomed(v: View, dir: 1 | -1): View {
  const off = sub(v.pos, v.target), d = len(off);
  const nd = clamp(d * (dir === 1 ? ZOOM_STEP : 1 / ZOOM_STEP), MIN_DIST, MAX_DIST);
  const k = nd / d;
  return { pos: add(v.target, v3(off.x * k, off.y * k, off.z * k)), target: { ...v.target } };
}

/** Rotate around the vertical axis through the target by `steps` × ROTATE_STEP (positive = counter-clockwise from above). */
export function rotated(v: View, steps: number): View {
  const off = sub(v.pos, v.target), a = steps * ROTATE_STEP;
  const c = Math.cos(a), s = Math.sin(a);
  return { pos: add(v.target, v3(off.x * c - off.z * s, off.y, off.x * s + off.z * c)), target: { ...v.target } };
}

/** Ease-in-out (smootherstep). */
export const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * t * (t * (t * 6 - 15) + 10));

function spherical(off: V3) {
  const r = len(off);
  return { r, theta: Math.atan2(off.z, off.x), phi: Math.acos(clamp(off.y / r, -1, 1)) };
}

/** Interpolate two views: the target moves in a straight line, the camera swings around it (spherical). */
export function lerpView(a: View, b: View, t: number): View {
  const sa = spherical(sub(a.pos, a.target)), sb = spherical(sub(b.pos, b.target));
  let dTheta = sb.theta - sa.theta;
  dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta)); // shortest way round
  const r = sa.r + (sb.r - sa.r) * t, theta = sa.theta + dTheta * t, phi = sa.phi + (sb.phi - sa.phi) * t;
  const target = v3(a.target.x + (b.target.x - a.target.x) * t, a.target.y + (b.target.y - a.target.y) * t, a.target.z + (b.target.z - a.target.z) * t);
  return { pos: add(target, v3(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))), target };
}

/** A smooth camera move. Call step(dt) each frame until done; the last step returns exactly `to`. */
export class Glide {
  private t = 0;
  done = false;
  constructor(readonly from: View, readonly to: View, readonly dur = GLIDE_DUR) {}
  step(dt: number): View {
    this.t += dt;
    if (this.t >= this.dur - 1e-9) {
      this.done = true;
      return { pos: { ...this.to.pos }, target: { ...this.to.target } };
    }
    return lerpView(this.from, this.to, ease(this.t / this.dur));
  }
}

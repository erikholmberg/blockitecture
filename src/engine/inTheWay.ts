/**
 * Spec 038: neighbouring buildings standing between the orbit camera and the house are hidden. Pure: no DOM, no Three.js.
 * Units: feet (world units).
 */
import { Brick, PLATE } from '@/engine/catalog';

export interface Footprint { x0: number; z0: number; x1: number; z1: number; top: number }
export interface P3 { x: number; y: number; z: number }

/** how close to the line of sight a building may stand before it's hidden (Q3) */
export const CLEARANCE = 25;
const SAMPLES = 48;

/**
 * Is the building in the way of the view from `cam` to `target`? It is when, somewhere along the line of sight, its footprint
 * comes within the clearance of the line while the line is still below the building's top. The clearance narrows to nothing at
 * the target, so a building beside or behind the house is never hidden.
 */
export function inTheWay(fp: Footprint, cam: P3, target: P3, clearance = CLEARANCE): boolean {
  // quick reject: the line of sight's own box, widened by the clearance
  if (fp.x1 < Math.min(cam.x, target.x) - clearance || fp.x0 > Math.max(cam.x, target.x) + clearance) return false;
  if (fp.z1 < Math.min(cam.z, target.z) - clearance || fp.z0 > Math.max(cam.z, target.z) + clearance) return false;
  if (fp.top < Math.min(cam.y, target.y)) return false;
  const L = Math.hypot(target.x - cam.x, target.z - cam.z);
  for (let i = 0; i < SAMPLES; i++) {
    const s = i / SAMPLES;
    const x = cam.x + (target.x - cam.x) * s, y = cam.y + (target.y - cam.y) * s, z = cam.z + (target.z - cam.z) * s;
    if (y > fp.top) continue;
    const c = Math.min(clearance, (1 - s) * L);
    const dx = Math.max(fp.x0 - x, 0, x - fp.x1), dz = Math.max(fp.z0 - z, 0, z - fp.z1);
    if (dx * dx + dz * dz <= c * c) return true;
  }
  return false;
}

/** each lot neighbour's footprint, from its pieces (spec 038: `Brick.nb`), indexed by neighbour */
export function neighbourFootprints(bricks: Brick[]): Footprint[] {
  const out: Footprint[] = [];
  for (const b of bricks) {
    if (b.nb === undefined) continue;
    const f = (out[b.nb] ??= { x0: Infinity, z0: Infinity, x1: -Infinity, z1: -Infinity, top: -Infinity });
    f.x0 = Math.min(f.x0, b.x); f.z0 = Math.min(f.z0, b.z);
    f.x1 = Math.max(f.x1, b.x + b.w); f.z1 = Math.max(f.z1, b.z + b.d);
    f.top = Math.max(f.top, (b.y + b.h) * PLATE);
  }
  return out;
}

/** which of the footprints are in the way; `hidden[i]` is set to 1 or 0. Returns whether anything changed. */
export function updateHidden(fps: Footprint[], cam: P3, target: P3, hidden: { [i: number]: number }): boolean {
  let changed = false;
  for (let i = 0; i < fps.length; i++) {
    const v = fps[i] && inTheWay(fps[i], cam, target) ? 1 : 0;
    if (hidden[i] !== v) { hidden[i] = v; changed = true; }
  }
  return changed;
}

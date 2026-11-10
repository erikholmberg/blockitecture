/**
 * The Douglas House's lot (spec 045): the wooded bluff above Lake Michigan, as the real ground, from the parking by M-119 down
 * to the top of the beach. The terrain tiles smooth the bluff (they read the house's footprint about 10 ft higher than the
 * USGS's 10 m data, 203 m), so round the house the ground is shaped to a steady slope: up at the bridge's road end level with
 * the 4th floor, under the house cut down to the service level, falling on toward the beach [assumed: the slope's line;
 * documented: the bridge, the piles, the bluff's drop of about 130 ft]; easing into the real ground beyond.
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { HOUSE, inRect, PARKING, Rect, Y } from './layout';
import { LOT_GROUND } from './lotTerrain';

export const TERRAIN = { x0: -40, z0: -80, x1: 130, z1: 135 };
const PL = 0.4;

export function lotGround(x: number, z: number): number {
  const g = LOT_GROUND;
  const fx = Math.min(Math.max((x - g.x0) / g.step, 0), g.nx - 1.0001);
  const fz = Math.min(Math.max((z - g.z0) / g.step, 0), g.nz - 1.0001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const H = (ii: number, jj: number) => g.h[jj * g.nx + ii] / 4;
  return H(i, j) * (1 - u) * (1 - v) + H(i + 1, j) * u * (1 - v) + H(i, j + 1) * (1 - u) * v + H(i + 1, j + 1) * u * v;
}

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const rectDist = (x: number, z: number, r: Rect) => Math.hypot(Math.max(r[0] - x, 0, x - r[2] + 1), Math.max(r[1] - z, 0, z - r[3] + 1));

/** the shaped slope, in ft: 29 ft at the bridge's road end, 12 ft at the house's road wall, −10 ft at its lake wall, then on
 * down at 1 in 2 */
export function slopeFt(z: number): number {
  if (z <= 0) return 12 + (17 * Math.min(-z, 66)) / 44;
  if (z <= HOUSE[3]) return 12 - (22 * z) / HOUSE[3];
  return -10 - 0.5 * (z - HOUSE[3]);
}
/** where the shaped slope holds, before it eases into the real bluff */
const ZONE: Rect = [-14, -70, 60, 110];
/** under the house: cut to the service level's floor */
const UNDER: Rect = [HOUSE[0] - 1, HOUSE[1] - 1, HOUSE[2] + 1, HOUSE[3] + 1];
export const PAD_TOP = Y.SERVICE - 3;
const EDGE = 24;

/** Designed ground in ft. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  if (inRect(x, z, UNDER)) return Math.min(slopeFt(z), PAD_TOP * PL);
  if (inRect(x, z, PARKING)) return 29;
  let y = slopeFt(z) + (real - slopeFt(z)) * smooth(rectDist(x, z, ZONE) / 30);
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  y = real + (y - real) * smooth(e / EDGE);
  return y;
}
export const surfaceFt = groundFt;
export const groundPlates = (x: number, z: number) => Math.round(groundFt(x, z) / PL / 3) * 3;

export class HeightMap {
  w = TERRAIN.x1 - TERRAIN.x0;
  d = TERRAIN.z1 - TERRAIN.z0;
  top = new Int16Array(this.w * this.d);
  at(x: number, z: number): number {
    const ix = Math.floor(x) - TERRAIN.x0, iz = Math.floor(z) - TERRAIN.z0;
    if (ix < 0 || iz < 0 || ix >= this.w || iz >= this.d) return groundPlates(Math.floor(x), Math.floor(z));
    return this.top[iz * this.w + ix];
  }
}

/** the forest floor of needles and moss under the cedars [assumed]; the sand at the bluff's foot; the parking's gravel */
const FLOOR = [0x4e5636, 0x575a39, 0x625a3e, 0x46523a];
const SAND = [0xcdbb92, 0xd6c49c];
const GRAVEL = [0xa9a497, 0x9e998c];

export function buildSite(b: Builder): HeightMap {
  b.setPhase(P.SITE);
  const hm = new HeightMap();
  const { w, d } = hm;
  for (let iz = 0; iz < d; iz++) for (let ix = 0; ix < w; ix++) hm.top[iz * w + ix] = groundPlates(ix + TERRAIN.x0, iz + TERRAIN.z0);
  const bottom = new Int16Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const k = iz * w + ix, x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      let m = hm.top[k];
      for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) m = Math.min(m, hm.at(x + dx, z + dz));
      bottom[k] = Math.min(m, hm.top[k] - 3);
    }
  const top = (x: number, z: number, y: number) => {
    const r = hash2(Math.floor(x / 3), Math.floor(z / 3)), n = noise2(x * 0.07, z * 0.07);
    if (inRect(x, z, UNDER)) return 0x8a8478; // under the house
    if (inRect(x, z, PARKING)) return GRAVEL[Math.floor(r * 2)];
    if (y * PL < -70) return SAND[Math.floor(r * 2)]; // the beach's top, at the bluff's foot [documented: the beach]
    return n < 0.35 ? FLOOR[3] : FLOOR[Math.floor(r * 3)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => {
        const t = hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)];
        return yy + 3 >= t ? top(x, z, t) : 0x8a7354;
      },
    });
  return hm;
}

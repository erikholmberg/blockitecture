/**
 * The Lovell Health House's lot (spec 034): the canyon slope below Dundee Drive, as the real ground, cut into two level pads
 * where HABS draws the house's two lowest floors [documented: sheets 3–4, 8]: the pool floor's walk at the west, and the
 * living floor's level under the guest wing, the library and the patio against the hill; the real slope everywhere else,
 * meeting the real ground at the lot's edges.
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { POOL, Rect, Y } from './layout';
import { LOT_GROUND } from './lotTerrain';

export const TERRAIN = { x0: -60, z0: -60, x1: 200, z1: 140 };
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

/** the pads: [rect, top in plates] — the pool floor's walk, and the living floor's level against the hill */
export const PADS: [Rect, number][] = [
  [[-2, 10, 71, 62], -33],
  [[71, 10, 128, 60], -3],
];
const EDGE = 24;

/** Designed ground in ft. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  // dug out for the pool's concrete cradle
  if (x >= POOL[0] - 1 && x < POOL[2] + 1 && z >= POOL[1] - 1 && z < POOL[3] + 1) return (Y.POOL_BOTTOM - 3) * PL;
  let best = Infinity, pad = 0;
  for (const [r, top] of PADS) { const d = rectDist(x, z, r); if (d < best) { best = d; pad = top * PL; } }
  let y = pad + (real - pad) * smooth((best - 1) / 26);
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

/** chaparral and dry grass on the slope, like the Stahl and Ennis lots [assumed: photographs]; packed earth on the pads */
const SLOPE = [0x6f7a4a, 0x7d8556, 0x8a8a5a, 0x5f6e44, 0xa39a6e];
const EARTH = 0xa8957a;
const inPad = (x: number, z: number) => PADS.some(([r]) => rectDist(x, z, r) === 0);

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
  const top = (x: number, z: number) => {
    if (inPad(x, z)) return EARTH;
    const n = noise2(x * 0.05, z * 0.05), r = hash2(Math.floor(x / 4), Math.floor(z / 4));
    return n < 0.3 ? SLOPE[3] : SLOPE[Math.floor(r * SLOPE.length)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0x8a7458),
    });
  return hm;
}

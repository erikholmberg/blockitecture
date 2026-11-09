/**
 * The Kaufmann Desert House's lot (spec 033): the desert floor at the foot of the San Jacinto Mountains, as the real ground
 * (it falls gently to the south-east), levelled into a pad under the house and the pool's terraces [assumed], blending back
 * into the real ground toward the lot's edges. Sand and gravel, the lawn round the pool, the drive.
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { DRIVE, inRect, LAWN, POOL, POOL_TERRACE, Rect, ROOFS } from './layout';
import { LOT_GROUND } from './lotTerrain';

export const TERRAIN = { x0: -40, z0: -80, x1: 230, z1: 180 };
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
/** the pad: the house's roofs and the pool's terrace */
const PAD: Rect[] = [...ROOFS, POOL_TERRACE];
const PAD_FT = -3 * PL; // the pad's top, a course under the floor
const EDGE = 24; // how far in from the lot's edges the ground is the real ground's

/** Designed ground in ft. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  if (inRect(x, z, [POOL[0] - 1, POOL[1] - 1, POOL[2] + 1, POOL[3] + 1])) return -15 * PL; // dug out for the pool's shell
  if (ROOFS.some((r) => inRect(x, z, r))) return -6 * PL; // under the house: room for the footings
  const d = Math.min(...PAD.map((r) => rectDist(x, z, r)));
  let y = PAD_FT + (real - PAD_FT) * smooth((d - 2) / 40);
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

/** sand and decomposed granite [assumed: photographs] */
export const SAND = [0xcfb58a, 0xc4a87c, 0xd6be94, 0xbfa276];
/** the watered lawn round the pool [documented: photographs] */
export const GRASS = [0x7a9a4f, 0x84a356, 0x6f8f47];
export const GRAVEL = [0xbdb3a0, 0xb3a994];
/** the lawn's edge, wavering a little */
export const inLawn = (x: number, z: number) =>
  inRect(x, z, LAWN) && Math.min(x - LAWN[0], LAWN[2] - x, z - LAWN[1], LAWN[3] - z) > 6 * noise2(x * 0.05, z * 0.05);

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
    const n = noise2(x * 0.06, z * 0.06), r = hash2(Math.floor(x / 3), Math.floor(z / 3));
    if (inRect(x, z, DRIVE)) return GRAVEL[Math.floor(r * 2)];
    if (inLawn(x, z)) return GRASS[Math.floor(r * 3)];
    return n < 0.35 ? SAND[3] : SAND[Math.floor(r * 3)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0xb09a74),
    });
  return hm;
}

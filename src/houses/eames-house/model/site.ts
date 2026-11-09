/**
 * The Eames House lot (spec 010b): a level terrace for the house and the meadow, the hill standing 8 ft up behind the
 * retaining wall, an earthen berm at the meadow's east edge, and blends to the real ground (lotTerrain.ts) at every lot
 * edge. Follows the Stahl House's site.ts pattern (spec 004); the two can share code once a third house needs it.
 */
import { C, TERRAIN_SIZES } from '@/engine/catalog';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { BERM_X, DRIVE, inRect, MEADOW, WALL_WINGS, WALL_X, WALL_Z, Y } from './layout';
import { LOT_GROUND } from './lotTerrain';

export const TERRAIN = { x0: -70, z0: -70, x1: 170, z1: 190 };

/** Real ground in ft (bilinear over the baked samples). */
export function lotGround(x: number, z: number): number {
  const g = LOT_GROUND;
  const fx = Math.min(Math.max((x - g.x0) / g.step, 0), g.nx - 1.0001);
  const fz = Math.min(Math.max((z - g.z0) / g.step, 0), g.nz - 1.0001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const H = (ii: number, jj: number) => g.h[jj * g.nx + ii] / 4;
  return H(i, j) * (1 - u) * (1 - v) + H(i + 1, j) * u * (1 - v) + H(i, j + 1) * (1 - u) * v + H(i + 1, j + 1) * u * v;
}

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
/** the level terrace (house, walkway, meadow); its edges blend to the real ground over BLEND ft */
const TERRACE = { x0: WALL_X - 1, z0: -35, x1: 128, z1: 155 };
const BLEND = 35;
const WALL_TOP_FT = (Y.WALL_TOP * 0.4);

/** x of the retaining wall's face at z (straight run plus the angled wings), or null where there is no wall */
export function wallX(z: number): number | null {
  if (z >= WALL_Z[0] && z <= WALL_Z[1]) return WALL_X;
  for (const { from, to } of WALL_WINGS) {
    const [z0, z1] = [Math.min(from[1], to[1]), Math.max(from[1], to[1])];
    if (z >= z0 && z <= z1) return from[0] + ((to[0] - from[0]) * (z - from[1])) / (to[1] - from[1]);
  }
  return null;
}

/** Designed ground in ft. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  // distance outside the terrace
  const dx = Math.max(TERRACE.x0 - x, 0, x - TERRACE.x1), dz = Math.max(TERRACE.z0 - z, 0, z - TERRACE.z1);
  let h = real * smooth(Math.hypot(dx, dz) / BLEND);
  // behind the retaining wall the hill stands at the wall's top, then rises with the real ground
  const wx = wallX(z);
  if (wx !== null && x < Math.round(wx) - 1) {
    const behind = Math.round(wx) - 1 - x;
    h = Math.max(h, WALL_TOP_FT + Math.max(0, real - WALL_TOP_FT) * smooth(behind / 24));
  }
  // the earthen berm at the meadow's east edge
  if (z > MEADOW[1] && z < MEADOW[3]) h += 3 * Math.exp(-(((x - BERM_X) / 6) ** 2));
  return h;
}

export const surfaceFt = groundFt;
const groundPlates = (x: number, z: number) => Math.round(groundFt(x, z) / 0.4 / 3) * 3;

/** Heightmap of terrain top in plates, at stud resolution (for walking fallback). */
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

export function buildSite(b: Builder): HeightMap {
  b.setPhase(P.SITE);
  const hm = new HeightMap();
  const { w, d } = hm;
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) hm.top[iz * w + ix] = groundPlates(ix + TERRAIN.x0, iz + TERRAIN.z0);

  // columns go down to their lowest neighbour (at least one brick), so there are no holes (spec 004 skin rule)
  const bottom = new Int16Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const k = iz * w + ix, x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      let m = hm.top[k];
      for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) m = Math.min(m, hm.at(x + dx, z + dz));
      bottom[k] = Math.min(m, hm.top[k] - 3);
    }

  const topColor = (x: number, z: number, top: number) => {
    const n = noise2(x * 0.07, z * 0.07), r = hash2(Math.floor(x / 5), Math.floor(z / 5));
    if (top >= 18 && x < WALL_X) return n < 0.45 ? C.darkGreen : r < 0.5 ? C.green : C.olive; // the planted hill
    if (inRect(x, z, MEADOW) && top >= 0 && top <= 6) {
      // the meadow: summer-dry golden grass with a few soft, greener patches
      return n < 0.22 ? C.olive : r < 0.12 ? C.darkTan : C.tan;
    }
    if (top < -24) return n < 0.4 ? C.darkGreen : r < 0.5 ? C.olive : C.darkTan; // the bluff
    return n < 0.4 ? C.green : r < 0.5 ? C.olive : C.sandGreen;
  };
  const sideColor = (x: number, y: number, z: number) => {
    const r = hash2(Math.floor(x / 4) + y * 7, Math.floor(z / 4));
    return r < 0.15 ? C.rock : r < 0.5 ? C.darkTan : C.dirt;
  };

  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3) {
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick',
      sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => {
        const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0);
        return yy + 3 >= hm.top[k] ? topColor(x, z, hm.top[k]) : sideColor(x, yy, z);
      },
    });
  }
  return hm;
}

/** Drive to the carport: concrete on the ground, in runs of equal height. */
export function buildDrive(b: Builder, hm: HeightMap) {
  b.setPhase(P.FLOOR);
  for (let z0 = DRIVE[1]; z0 < DRIVE[3]; ) {
    const y = hm.at(DRIVE[0], z0);
    let z1 = z0 + 1;
    while (z1 < DRIVE[3] && hm.at(DRIVE[0], z1) === y) z1++;
    b.box(DRIVE[0], z0, DRIVE[2], z1, y, y + 1, { kind: 'plate', color: C.concrete });
    z0 = z1;
  }
}

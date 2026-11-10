/**
 * The Rose Seidler House's lot (spec 043): the steep bush block falling north to Ku-ring-gai Chase, as the real ground, cut
 * level under the lower floor (the garage, the entry, the recreation area), the drive's apron and the garden terrace below the
 * ramp [documented: sandstone retaining walls; their extent assumed]; under the sleeping wing the slope runs on beneath the
 * stone base [documented: elevated on the north and east only]; meeting the real ground at the lot's edges.
 */
import { C, TERRAIN_SIZES } from '@/engine/catalog';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { GARDEN, HOUSE, inRect, LOWER, Rect, Y } from './layout';
import { LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -70, z0: -60, x1: 120, z1: 120 };
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

/** the drive's apron in front of the garage, where the service road from Clissold Road ends [documented: OSM; size assumed] */
export const APRON: Rect = [-14, 2, 0, 26];
/** cut level: the lower floor, the apron and the garden terrace */
const PADS: Rect[] = [LOWER, GARDEN, APRON];
export const inPad = (x: number, z: number) => PADS.some((r) => inRect(x, z, r));
const EDGE = 24;

/** Designed ground in ft. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  const pad = Y.LOWER * PL;
  if (inPad(x, z)) return pad;
  // under the sleeping wing: the slope, kept below its floor slab
  if (inRect(x, z, HOUSE)) return Math.min(real, (Y.SLAB - 3) * PL);
  const d = Math.min(...PADS.map((r) => rectDist(x, z, r)));
  let y = pad + (real - pad) * smooth((d - 1) / 12);
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

function segDist(x: number, z: number, a: [number, number], b: [number, number]) {
  const [ax, az] = a, [bx, bz] = b, L2 = (bx - ax) ** 2 + (bz - az) ** 2 || 1;
  const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / L2));
  return Math.hypot(x - ax - (bx - ax) * t, z - az - (bz - az) * t);
}
/** the service road up from Clissold Road to the garage [documented: OSM; its width assumed] */
export function onRoad(x: number, z: number) {
  for (const r of LOT_ROADS) for (let i = 1; i < r.pts.length; i++) if (segDist(x, z, r.pts[i - 1], r.pts[i]) < 5) return true;
  return false;
}

/** the lawn of the garden terrace [documented: photographs]; the bush floor of leaf litter, sandstone and scrub [assumed] */
const LAWN = [0x7d9a52, 0x86a259, 0x73914b];
const BUSH = [0x5f6a42, 0x56633c, 0x6b6a48, 0x4c5a36];

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
    const r = hash2(Math.floor(x / 3), Math.floor(z / 3)), n = noise2(x * 0.07, z * 0.07);
    if (inRect(x, z, HOUSE)) return 0x9a948a; // under the floors
    if (onRoad(x, z) || inRect(x, z, APRON)) return r < 0.5 ? C.asphalt : 0x525456;
    if (inRect(x, z, GARDEN)) return LAWN[Math.floor(r * 3)];
    return n < 0.35 ? BUSH[3] : BUSH[Math.floor(r * 3)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      // sandstone shows where the ground is cut [documented: the bush stone]
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0xb89c6e),
    });
  return hm;
}

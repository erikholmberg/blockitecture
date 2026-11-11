/**
 * The Sonneveld House's lot (spec 060): flat Rotterdam ground on the edge of the Museumpark [documented], the house as far north
 * on its plot as it can stand so the garden gets the sun [documented]; Jongkindstraat on the west and the drive along the north
 * side to the garage [OSM: documented]; lawns [documented], the neighbours as plain blocks on their OSM outlines [footprints
 * documented; heights and finish assumed].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, plainNeighbour, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { BLOCK, GARAGE, inRect, Rect } from './layout';
import { LOT_BUILDINGS, LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -110, z0: -95, x1: 115, z1: 120 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS, { secondary: 14, residential: 9, service: 5 }, 5);
const EDGE = 24;
const under = (x: number, z: number) => inRect(x, z, BLOCK) || inRect(x, z, GARAGE);

/** Designed ground in ft: level, just under the ground floor, easing into the real (flat) ground at the lot's edges. */
export function groundFt(x: number, z: number): number {
  if (under(x, z)) return -3 * PL;
  const real = lotGround(x, z);
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  return real + (-3 * PL - real) * smoothstep(e / EDGE);
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

/** the house's own plot: the street garden, the private garden to the south and east [documented; its line assumed] */
export const PLOT: Rect = [-58, -34, 60, 58];
const LAWN = [0x6f9a50, 0x78a257];

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
    const s = streetAt(x, z), r = hash2(Math.floor(x / 4), Math.floor(z / 4));
    if (under(x, z)) return 0x8a8478;
    if (s === 'road') return r < 0.5 ? 0x4a4c4e : 0x525456;
    if (s === 'pavement') return r < 0.5 ? 0x9c9a94 : 0xa8a59e;
    // a paved terrace before the studio's glass, and under the overhang along the street front [assumed]
    if (inRect(x, z, [-8, -3, 0, 34]) || inRect(x, z, [0, -3, 52, 0])) return r < 0.5 ? 0xb9b5ac : 0xb1ada4;
    if (inRect(x, z, PLOT)) return LAWN[Math.floor(r * 2)];
    return noise2(x * 0.05, z * 0.05) < 0.4 ? 0x5f8a45 : LAWN[Math.floor(r * 2)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0x7d6a52),
    });
  // the neighbours: villas and pavilions of the Museumpark, in white and pale render [assumed]
  const keep = (x: number, z: number) => inRect(x, z, [TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1]);
  for (const bl of LOT_BUILDINGS) {
    const cx = bl.ring.reduce((a, p) => a + p[0], 0) / bl.ring.length, cz = bl.ring.reduce((a, p) => a + p[1], 0) / bl.ring.length;
    const base = hm.at(Math.round(cx), Math.round(cz));
    const xs = bl.ring.map((p) => p[0]), zs = bl.ring.map((p) => p[1]);
    const small = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...zs) - Math.min(...zs)) < 700;
    plainNeighbour(b, bl.ring, base, base + (small ? 27 : 75), { wall: [0xece8de, 0xe2ddd0], window: 0x3a4248, roof: 0x77746e, keep });
  }
  return hm;
}

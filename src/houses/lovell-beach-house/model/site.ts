/**
 * The Lovell Beach House's lot (spec 056): a beachfront lot on the Balboa Peninsula, flat sand at about 10 ft above sea level
 * [documented: USGS], from across the alley to the beach past the boardwalk, from the neighbour on the east to across 13th
 * Street [OSM: documented]. The house's own lot is a small garden of sand and succulents on the ocean side [documented: "a
 * small garden to the south"; its planting assumed]; the neighbours are plain stucco blocks on their OSM outlines [footprints
 * documented; heights assumed from OSM's 6–8 m tags nearby].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, plainNeighbour, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { BOARDWALK, FRAME_DEPTH, inRect, LENGTH, Rect } from './layout';
import { LOT_BUILDINGS, LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -45, z0: -40, x1: 230, z1: 95 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS, { residential: 12, service: 8 }, 4);

/** the house's own lot, from the alley to the boardwalk [documented: about 35–40 ft wide, its line assumed] */
export const OWN_LOT: Rect = [-8, -4, 106, 40];
/** under the house: cut down for the ground slab */
export const UNDER: Rect = [0, 0, LENGTH, FRAME_DEPTH];
const EDGE = 24;

/** Designed ground in ft: level with the house's datum on the lot, easing into the real (nearly flat) sand at the edges */
export function groundFt(x: number, z: number): number {
  if (inRect(x, z, UNDER)) return -3 * PL;
  const real = lotGround(x, z);
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  return real * (1 - smoothstep(e / EDGE));
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

const SAND = [0xdcc9a0, 0xd4c096, 0xe2d0a8];
const GARDEN = [0x8b9a5e, 0x7d8e55];

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
    const s = streetAt(x, z), r = hash2(Math.floor(x / 3), Math.floor(z / 3));
    if (inRect(x, z, UNDER)) return 0xa8a398;
    if (inRect(x, z, BOARDWALK)) return r < 0.5 ? 0xc9c4b8 : 0xc1bcb0; // the boardwalk's concrete [assumed]
    if (s === 'road') return r < 0.5 ? 0x4a4c4e : 0x525456;
    if (s === 'pavement') return r < 0.5 ? 0xb4b0a6 : 0xaca89e;
    // succulents and low planting in the house's garden toward the ocean [assumed]
    if (inRect(x, z, [LENGTH, 1, 104, 32]) && noise2(x * 0.15, z * 0.15) > 0.55) return GARDEN[Math.floor(r * 2)];
    return SAND[Math.floor(r * 3)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0xb9a57d),
    });
  // the neighbours: two-storey beach houses in pale stucco [assumed: OSM's height tags nearby, 6–8 m]
  const keep = (x: number, z: number) => inRect(x, z, [TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1]);
  for (const bl of LOT_BUILDINGS) {
    const cx = bl.ring.reduce((a, p) => a + p[0], 0) / bl.ring.length, cz = bl.ring.reduce((a, p) => a + p[1], 0) / bl.ring.length;
    const base = hm.at(Math.round(cx), Math.round(cz));
    const tone = Math.floor(hash2(bl.id % 9973, 7) * 3);
    const walls = [[0xefe9dc, 0xe6dfd0], [0xe8e2d6, 0xddd5c6], [0xf1ece2, 0xe3dccd]][tone];
    plainNeighbour(b, bl.ring, base, base + 52, { wall: walls, window: 0x3a4248, roof: 0x8f8a80, keep });
  }
  return hm;
}

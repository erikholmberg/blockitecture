/**
 * The Haus am Horn's lot (spec 063): a garden plot on the slope above the park on the Ilm, falling west toward the street Am
 * Horn [documented: the real ground]; the house on a level lawn like a terrace, with grass banks on the street's side
 * [documented]; a gravel path round the house and the path up from the street's gate [documented: OSM; their lines scaled];
 * the kitchen garden behind, in four hedged beds [documented].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { HOUSE, inRect, Rect, Y } from './layout';
import { LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -75, z0: -75, x1: 115, z1: 140 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS, { residential: 9 }, 5);

/** the level lawn round the house [documented: "terrace-like"; its extent scaled from OSM's ring path, about 17 m square] */
export const LAWN: Rect = [-12, -12, 54, 54];
/** the gravel path ringing the house, and the path from the gate on Am Horn to the entrance front [documented: OSM] */
export const RING_PATH: Rect = [-8, -8, 50, 50];
export const onRingPath = (x: number, z: number) => inRect(x, z, RING_PATH) && !inRect(x, z, [-5, -5, 47, 47]);
export const onGatePath = (x: number, z: number) => x >= -8 && x < -5 && z >= 47;
/** the kitchen garden behind the house: four beds in a hedge, about 8 × 30 m [documented: OSM] */
export const KITCHEN_GARDEN: Rect = [-28, -52, 70, -26];
const rectDist = (x: number, z: number, r: Rect) => Math.hypot(Math.max(r[0] - x, 0, x - r[2] + 1), Math.max(r[1] - z, 0, z - r[3] + 1));
const EDGE = 20;

/** Designed ground in ft: the level lawn, then the real slope, the banks between them. */
export function groundFt(x: number, z: number): number {
  if (inRect(x, z, HOUSE)) return (Y.GROUND - 3) * PL;
  const real = lotGround(x, z);
  let y = Y.GROUND * PL + (real - Y.GROUND * PL) * smoothstep(rectDist(x, z, LAWN) / 18);
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  y = real + (y - real) * smoothstep(e / EDGE);
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

const GRASS = [0x6f9a50, 0x78a257, 0x648f48];
const GRAVEL = [0xb9b2a2, 0xb0a998];
const SOIL = [0x6b5744, 0x745e49];

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
    if (inRect(x, z, HOUSE)) return 0x8a8478;
    if (s === 'road') return r < 0.5 ? 0x4a4c4e : 0x525456;
    if (s === 'pavement') return r < 0.5 ? 0x9c9a94 : 0xa8a59e;
    if (onRingPath(x, z) || (onGatePath(x, z) && !s)) return GRAVEL[Math.floor(r * 2)];
    // the kitchen garden's four beds, paths between them [documented: four parts]
    if (inRect(x, z, KITCHEN_GARDEN)) {
      const bx = (x - KITCHEN_GARDEN[0]) % 25, bz = z - KITCHEN_GARDEN[1];
      return bx < 3 || bz < 2 || bz > 23 ? GRAVEL[1] : (Math.floor(bx / 2) & 1) ? SOIL[0] : 0x5c8a3f;
    }
    return noise2(x * 0.06, z * 0.06) < 0.3 ? GRASS[2] : GRASS[Math.floor(r * 2)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0x7d6a52),
    });
  return hm;
}

/**
 * Taliesin West's lot (spec 077): the desert slope at the foot of the McDowell Mountains [documented: about 1,600 ft, rising
 * toward the mountains, USGS 3DEP], from the studio's north-west patio to the end of Wright's quarters and from beyond the Kiva
 * to the prow's point. The spine stands on a level platform [assumed: its extent], Sunset Terrace is a level lawn below it
 * [documented: lawn; its level assumed], the Kiva is sunk [documented: partly underground]; beyond them the real ground, eased
 * in from the lot's edges. Walks from OSM [documented: the footways round the pool, along the studio's front and under the
 * pergola, the gravel walk outside the prow].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, inPoly, segDist, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  CORE, FRONT_WALK, inAny, INDIAN_ROCK, inPool, inRect, KIVA, onEdge, PERGOLA, PROW_EAST, PROW_TIP, PROW_WEST, Pt, Rect, RILL, TERRACE_POLY,
  WALK_Z, Y,
} from './layout';
import { LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -70, z0: -150, x1: 330, z1: 210 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS, { residential: 9, service: 6 }, 3);

/** the spine's level platform [assumed: round the buildings and the pergola, out to the central walk's far side] */
export const SPINE: Rect = [-40, -62, 330, 40];
const N8: Pt[] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

export const inTerracePoly = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, TERRACE_POLY);
const inBuilding = (x: number, z: number) => CORE.some((c) => inAny(x, z, c.rects));
/** Sunset Terrace's lawn and paving: inside its outline, outside the buildings */
export const onTerrace = (x: number, z: number) => inTerracePoly(x, z) && !inBuilding(x, z) && !inRect(x, z, FRONT_WALK);
/** distance from a cell's centre to the prow's two 45° sides */
export function prowSideDist(x: number, z: number): number {
  const px = x + 0.5, pz = z + 0.5;
  const west = px <= PROW_TIP[0] + 1 ? Math.abs(pz - px - PROW_WEST) / Math.SQRT2 : Infinity;
  const east = px >= PROW_TIP[0] - 1 ? Math.abs(pz + px - PROW_EAST) / Math.SQRT2 : Infinity;
  return Math.min(west, east);
}
/** the terrace's retaining walls: two studs thick along its 45° sides [assumed] */
export const onProwWall = (x: number, z: number) => onTerrace(x, z) && prowSideDist(x, z) < 2.2;
/** the pool's shell: the cells round the water */
export const onPoolShell = (x: number, z: number) => !inPool(x, z) && N8.some(([dx, dz]) => inPool(x + dx, z + dz));

/** OSM's trees in the lot [documented: OSM nodes; the citrus grove north of the spine] */
export const OSM_TREES: Pt[] = [[185.3, -143.8], [-38.5, 154], [247.9, -65.3], [246.7, 91.5], [97, -141.8], [127.8, -143.4], [283.7, 102.6],
  [63.9, -143.2], [269.9, 2.4], [29.9, -143.8], [143.5, -145.4], [108.7, -129.4], [33, -125.3], [233.4, -86.1], [260.7, -86.3], [49, -141.5],
  [16.1, -111.2], [55.8, 119], [221.6, 144.9], [78.9, -141.3], [1.5, -127.7], [283.8, 39.1], [112, -142.1], [49, -129.1], [-30.4, 43.4],
  [216.4, 124.2], [306.8, 89.5], [56, 144.6], [18.9, -63.3], [165, 66.4], [63.6, -126.4], [79.1, -127.7], [284.9, 69.4], [191.1, -125.1],
  [287.2, -18.9], [-28.5, 103.2], [-47.8, 93.9], [97.9, -128.8], [129.8, -131.3], [14.2, -128.7]];

/** OSM's walks [documented: footways 1498897845 round the pool, 1498897837/-38 across the lawn, the gravel walk 1498897846
 * outside the prow, 1498906500 under the pergola] */
export const WALKS: Pt[][] = [
  [[44.2, 63.1], [92.5, 63.1]], [[44.2, 63.1], [96.5, 115]], [[95.5, 63.1], [96.5, 115]],
  [[96.5, 115], [106.6, 125.1], [121, 110.5], [144.8, 86.6], [152.5, 78.6], [167, 94.2]], [[123.8, 64.6], [159.7, 102.2]], [[96.3, 105.1], [125.8, 105.8]],
  [[-59, -12.2], [0.5, 46.2], [121.8, 165.1], [186.7, 99.6]],
];
const lineDist = (x: number, z: number, pts: Pt[]) => {
  let d = Infinity;
  for (let i = 1; i < pts.length; i++) d = Math.min(d, segDist(x, z, pts[i - 1], pts[i]));
  return d;
};
export const onWalk = (x: number, z: number) => WALKS.some((w) => lineDist(x + 0.5, z + 0.5, w) < 2.2);
/** the terrace's open ground (not its walls, the pool, Indian Rock Terrace or the step): lawn, or paving on the walks */
export const onTerraceGround = (x: number, z: number) =>
  onTerrace(x, z) && !onProwWall(x, z) && !inPool(x, z) && !onPoolShell(x, z) && !inRect(x, z, INDIAN_ROCK) && !terraceStepAt(x, z);
/** the lawn's cells along the spine's platform: the step down */
export const terraceStepAt = (x: number, z: number) =>
  onTerrace(x, z) && !onProwWall(x, z) && !(onPoolShell(x, z) || inPool(x, z)) && !inRect(x, z, INDIAN_ROCK)
  && N8.slice(0, 4).some(([dx, dz]) => !onTerrace(x + dx, z + dz) && !inBuilding(x + dx, z + dz) && inRect(x + dx, z + dz, SPINE));

const rectDist = (x: number, z: number, r: Rect) => Math.hypot(Math.max(r[0] - x, 0, x - (r[2] - 1)), Math.max(r[1] - z, 0, z - (r[3] - 1)));
const EDGE = 20;

/** the real ground, eased into the spine's platform near it [assumed] */
function natural(x: number, z: number): number {
  const real = lotGround(x, z);
  return real * smoothstep(rectDist(x, z, SPINE) / 30);
}

/** Designed ground in plates (multiples of 3), before easing into the lot's edges. */
function designed(x: number, z: number): number {
  if (inPool(x, z) || (onPoolShell(x, z) && onTerrace(x, z))) return Y.POOL_FLOOR;
  if (inAny(x, z, KIVA)) return onEdge(x, z, KIVA) ? Y.KIVA_FLOOR - 6 : Y.KIVA_FLOOR - 3;
  for (const c of CORE) if (inAny(x, z, c.rects)) return onEdge(x, z, c.rects) ? Y.FOOTING : Y.SLAB;
  if (inRect(x, z, RILL)) return -3;
  if (onTerrace(x, z)) {
    if (onProwWall(x, z)) return Math.min(Math.round(natural(x, z) / PL / 3) * 3, Y.TERRACE);
    return Y.TERRACE;
  }
  if (inRect(x, z, SPINE) || inRect(x, z, FRONT_WALK)) return 0;
  return Math.round(natural(x, z) / PL / 3) * 3;
}

/** Ground in ft: the designed ground, easing into the real ground over the lot's last 20 ft. */
export function groundFt(x: number, z: number): number {
  const d = designed(x, z) * PL;
  const real = lotGround(x, z);
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  return real + (d - real) * smoothstep(e / EDGE);
}
export const surfaceFt = groundFt;
export const groundPlates = (x: number, z: number) => Math.round(groundFt(x, z) / PL / 3) * 3;
/** the ground just outside the prow's walls (for the walls' height) */
export const outsidePlates = (x: number, z: number) => Math.round(natural(x, z) / PL / 3) * 3;

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

/** the desert's sand and decomposed granite [assumed: photographs], the lawn, the paving and the gravel */
export const SAND = [0xc9ad84, 0xc2a37a, 0xd0b58e, 0xbb9c72];
export const LAWN = [0x7d9a4c, 0x86a354, 0x76924a];
export const PAVING = [0xc7b49a, 0xbcaa8f];
export const GRAVEL = [0xb7a991, 0xad9e86];
const DIRT = 0xa48a66;

function topColor(x: number, z: number): number {
  const s = streetAt(x, z);
  if (s === 'road') return 0x5c5853;
  if (s === 'pavement') return 0xa89c8a;
  if (inRect(x, z, FRONT_WALK) || (inRect(x, z, PERGOLA) && z >= WALK_Z[0] && z < WALK_Z[1])) return PAVING[(x >> 2) & 1];
  if (onTerrace(x, z)) return DIRT; // under the lawn and the paving (landscape and floor)
  if (onWalk(x, z)) return GRAVEL[(x >> 2) & 1];
  if (inRect(x, z, SPINE)) return GRAVEL[hash2(x >> 3, z >> 3) < 0.5 ? 0 : 1];
  return SAND[Math.floor(hash2(x >> 3, z >> 3) * SAND.length)];
}

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
  const tops = new Int32Array(w * d);
  for (let iz = 0; iz < d; iz++) for (let ix = 0; ix < w; ix++) tops[iz * w + ix] = topColor(ix + TERRAIN.x0, iz + TERRAIN.z0);
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return yy + 3 >= hm.top[k] ? tops[k] : DIRT; },
    });
  return hm;
}

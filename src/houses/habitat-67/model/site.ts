/**
 * Habitat 67's lot (spec 072): the Cité du Havre pier between avenue Pierre-Dupuy and the St. Lawrence [documented: OSM], low
 * and nearly flat [documented: the real ground], levelled round the complex and easing into the real ground at the lot's
 * edges. The avenue along the west side [documented: OSM], lawns and paths round the building [documented: OSM's footpaths and
 * flowerbeds; their layout assumed], and the service road that runs under the parking level [documented: OSM, tunnel=yes].
 */
/** the lot's ground in large pieces: it's big and flat */
const GROUND_SIZES = [[32, 32], [32, 16], [16, 16], [16, 8], [8, 8], [8, 4], [4, 4], [4, 2], [2, 2], [2, 1], [1, 1]];
import { groundSampler, segDist, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { BASE_TOP, BOXES, CORES, inRect, Rect, STREETS } from './layout';
import { LOT_GROUND, LOT_ROADS } from './lotTerrain';

/** from across the avenue to the river's edge, the length of the complex and a margin [scaled] */
export const TERRAIN = { x0: -20, z0: -50, x1: 950, z1: 330 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
/** the service roads that pass under the building are its car tunnels [documented: OSM, tunnel=yes]; the rest are on the ground */
const OUTLINE: Rect = [0, 0, 931, 295];
const TUNNELS = LOT_ROADS.filter((r) => r.highway === 'service' && r.pts.some(([x, z]) => inRect(x, z, OUTLINE)));
export const streetAt = streets(LOT_ROADS, { tertiary: 12, service: 5 }, 7);
/** a car tunnel through the parking level [assumed: 12 ft wide, along OSM's lines] */
export const inTunnel = (x: number, z: number) => inBase(x, z) && TUNNELS.some((r) => r.pts.some((p, i) => i > 0 && segDist(x + 0.5, z + 0.5, r.pts[i - 1], p) < 6));

/**
 * The parking and services level [documented: "a parking level and a building-services level"; covered parking for all
 * tenants]: under the ground-level boxes, the streets and the cores [scaled; its extent beyond them assumed].
 */
const BASE_RECTS: Rect[] = [...BOXES.filter((b) => b.l === 0).map((b) => b.r), ...STREETS, ...CORES];
export const inBase = (x: number, z: number) => BASE_RECTS.some((r) => inRect(x, z, r));
export const BASE_BOUNDS: Rect = [
  Math.min(...BASE_RECTS.map((r) => r[0])), Math.min(...BASE_RECTS.map((r) => r[1])),
  Math.max(...BASE_RECTS.map((r) => r[2])), Math.max(...BASE_RECTS.map((r) => r[3])),
];
export const built = (x: number, z: number) => inBase(x, z);
export { BASE_TOP };

const EDGE = 30;
/** Designed ground in ft: level, just under the parking level's floor, easing into the real ground at the lot's edges. */
export function groundFt(x: number, z: number): number {
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
    // the walking ground: on the parking level's roof where it is, else the lot
    return this.top[iz * this.w + ix];
  }
}

const GRASS = [0x6f9a50, 0x78a257, 0x648f48];
const PAVING = [0xb1aca2, 0xa9a49a];
/** the footpaths round the complex [documented: OSM's footpaths; their lines assumed], 6 ft wide */
/** paved courts under the boxes' cantilevers, a few feet round them [assumed]; lawns beyond */
const UNDER = new Uint8Array((TERRAIN.x1 - TERRAIN.x0) * (TERRAIN.z1 - TERRAIN.z0));
for (const bx of BOXES)
  for (let z = bx.r[1] - 4; z < bx.r[3] + 4; z++) for (let x = bx.r[0] - 4; x < bx.r[2] + 4; x++) UNDER[(z - TERRAIN.z0) * (TERRAIN.x1 - TERRAIN.x0) + x - TERRAIN.x0] = 1;
export const underBoxes = (x: number, z: number) => inRect(x, z, [TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1]) && UNDER[(z - TERRAIN.z0) * (TERRAIN.x1 - TERRAIN.x0) + x - TERRAIN.x0] === 1;
const PATHS: Rect[] = [[-10, -12, 950, -6], [-10, 300, 950, 306], [-12, -12, -6, 306], [930, -12, 936, 306]];

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
    // the streets and paths read on a 4 ft grid, so the ground is laid in big pieces
    const qx = Math.floor(x / 4) * 4 + 2, qz = Math.floor(z / 4) * 4 + 2;
    const s = streetAt(qx, qz), r = hash2(Math.floor(x / 16), Math.floor(z / 16));
    if (s === 'road') return 0x4d4f51;
    if (s === 'pavement' || PATHS.some((p) => inRect(x, z, p))) return PAVING[Math.floor(r * 2)];
    // paved courts under the cantilevers, over the outline's extent [assumed]
    if (underBoxes(x, z) || inBase(x, z)) return 0xb5b0a5;
    return GRASS[Math.floor(r * 3)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: GROUND_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0x7d6a52),
    });
  // the walking ground rises onto the parking level's roof where it stands
  for (let iz = 0; iz < d; iz++) for (let ix = 0; ix < w; ix++) if (inBase(ix + TERRAIN.x0, iz + TERRAIN.z0) && !inTunnel(ix + TERRAIN.x0, iz + TERRAIN.z0)) hm.top[iz * w + ix] = BASE_TOP;
  return hm;
}

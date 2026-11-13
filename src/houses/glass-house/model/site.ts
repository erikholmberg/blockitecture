/**
 * The Glass House's lot (spec 073): the lawn on the knoll, nearly level from the Glass House to the Brick House and the pool
 * [documented: the terrain reads 98.6–98.9 m at all three], then the real ground: the bluff falling west, steeply, about 60 ft
 * to the pond [documented: the nomination; AWS terrain], and rising gently east toward Ponus Ridge Road. The pond's basin and the
 * pool's hole are dug here; their water goes in with the landscape.
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, inPoly, smoothstep } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { BRICK, HOUSE, inRect, POOL, Rect, Y } from './layout';
import { LOT_GROUND } from './lotTerrain';
import { WATER_AREAS } from './water';

export const TERRAIN = { x0: -380, z0: -130, x1: 180, z1: 220 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);

/** the pond: OSM's way 1169420796, the water area inside the lot [documented], and its surface level from the terrain */
export const POND = WATER_AREAS.find((a) => a.rings[0].every(([x, z]) => x > TERRAIN.x0 && x < TERRAIN.x1 && z > TERRAIN.z0 && z < TERRAIN.z1))!;
export const POND_LEVEL = Math.round(POND.level / PL); // plates
export const inPond = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, POND.rings[0]);
/** the pond's basin, about 3 ft deep [assumed] */
export const POND_FLOOR = POND_LEVEL - 8;
/** the lawn court round the two houses and the pool, level [documented: "a grassy court"; its extent assumed]; west of the house
 * it stays level for about 25 ft, then the bluff falls [documented: the terrain] */
export const LAWN: Rect = [-12, -70, 160, 125];
export const inPool = (x: number, z: number, r = POOL.r) => Math.hypot(x + 0.5 - POOL.x, z + 0.5 - POOL.z) < r;
const rectDist = (x: number, z: number, r: Rect) => Math.hypot(Math.max(r[0] - x, 0, x - r[2] + 1), Math.max(r[1] - z, 0, z - r[3] + 1));
const EDGE = 20;

/** Designed ground in ft: the level lawn, the real slopes beyond it, the pond's basin. */
export function groundFt(x: number, z: number): number {
  if (inRect(x, z, HOUSE) || inRect(x, z, BRICK)) return (Y.LAWN - 3) * PL;
  if (inPond(x, z)) return POND_FLOOR * PL;
  if (inPool(x, z)) return (Y.LAWN - 12) * PL; // the pool's basin [assumed: about 4 ft deep]
  const real = lotGround(x, z);
  let y = Y.LAWN * PL + (real - Y.LAWN * PL) * smoothstep(rectDist(x, z, LAWN) / 20);
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  return real + (y - real) * smoothstep(e / EDGE);
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

/** mown lawn on the knoll; leaf litter and moss under the trees down the bluff [assumed: photographs] */
const LAWN_GREEN = [0x6f9a4c, 0x78a352, 0x66914a];
const WOODS = [0x5d7a3e, 0x6a7d42, 0x7a6e48, 0x55703a];
const MUD = 0x5e5140;

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
    const r = hash2(Math.floor(x / 8), Math.floor(z / 8));
    if (inPond(x, z) || inPool(x, z)) return MUD;
    if (rectDist(x, z, LAWN) < 4 && y >= Y.LAWN - 6) return noise2(x * 0.05, z * 0.05) < 0.3 ? LAWN_GREEN[2] : LAWN_GREEN[Math.floor(r * 2)];
    return WOODS[Math.floor(r * WOODS.length)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z, yy + 3) : 0x6e5a44),
    });
  return hm;
}

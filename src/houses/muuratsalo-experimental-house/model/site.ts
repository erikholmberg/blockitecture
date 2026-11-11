/**
 * The Muuratsalo Experimental House's lot (spec 058): the granite rock on Muuratsalo's west shore, moss, bilberry and
 * lingonberry under pines and birches [documented: the Alvar Aalto Foundation], falling toward Lake Päijänne beyond the lot on
 * the west [documented: OSM's shore]. The terrain tiles round Muuratsalo read lake and land as one flat level (spec 058), so the
 * rock is shaped here: the house's pad, falling away at about 1 in 4 to the tiles' level at the lot's edges [assumed: the house
 * about 8 m above the lake, documented as 5–10 m].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, smoothstep } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { GUEST, inRect, MAIN, Rect } from './layout';
import { LOT_GROUND } from './lotTerrain';

export const TERRAIN = { x0: -85, z0: -150, x1: 110, z1: 90 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
const rectDist = (x: number, z: number, r: Rect) => Math.hypot(Math.max(r[0] - x, 0, x - r[2] + 1), Math.max(r[1] - z, 0, z - r[3] + 1));
/** under the guest wing the rock drops away, so its posts and boulders show [documented: built without foundations] */
export const GUEST_GROUND = -9;
const EDGE = 26;

/** Designed ground in ft: the house's pad, the rock falling away round it, easing into the tiles' level at the edges. */
export function groundFt(x: number, z: number): number {
  if (inRect(x, z, MAIN)) return -3 * PL;
  if (inRect(x, z, GUEST)) return GUEST_GROUND * PL;
  const d = Math.min(rectDist(x, z, MAIN), rectDist(x, z, GUEST) + 3);
  const real = lotGround(x, z);
  let y = Math.max(real, -1.2 - d * 0.25 + 1.5 * (noise2(x * 0.08, z * 0.08) - 0.5));
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

/** grey granite, moss, bilberry and lingonberry, pine needles [documented: the site's plants; their spread assumed] */
const ROCK = [0x8e8b84, 0x9b978e];
const MOSS = [0x6c7a45, 0x5f6e3c];
const BERRY = 0x4f6236;
const NEEDLES = 0x7b6a4c;

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
    const n = noise2(x * 0.09, z * 0.09), r = hash2(Math.floor(x / 3), Math.floor(z / 3));
    if (inRect(x, z, MAIN) || inRect(x, z, GUEST)) return ROCK[0];
    if (n > 0.62) return ROCK[Math.floor(r * 2)]; // bare granite [documented]
    if (n > 0.45) return MOSS[Math.floor(r * 2)];
    return r < 0.4 ? BERRY : r < 0.7 ? NEEDLES : MOSS[0];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : ROCK[1]),
    });
  return hm;
}

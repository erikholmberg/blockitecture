/**
 * Trellick Tower's lot (spec 061): the north end of the Cheltenham Estate in Kensal Town, flat ground between the Grand Union
 * Canal and the Great Western railway [documented], Golborne Road along the west [OSM: documented]; the raised terrace round
 * the slab's foot [documented], Meanwhile Gardens' grass to the north and east [documented; its paths assumed].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { BLOCK_B, inRect, PODIUM, SLAB, TOWER } from './layout';
import { LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -150, z0: -60, x1: 190, z1: 240 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS, { unclassified: 11, residential: 9, service: 5 }, 6);
const EDGE = 26;
export const built = (x: number, z: number) => inRect(x, z, SLAB) || inRect(x, z, TOWER) || inRect(x, z, BLOCK_B);

/** Designed ground in ft: level, just under the entrance level, easing into the real ground at the lot's edges. */
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
    return this.top[iz * this.w + ix];
  }
}

const GRASS = [0x6f9a50, 0x78a257, 0x5f8a45];
const PAVING = [0xa7a49c, 0x9f9c94];

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
    if (built(x, z)) return 0x8a8478;
    if (s === 'road') return r < 0.5 ? 0x4a4c4e : 0x525456;
    if (s === 'pavement') return PAVING[Math.floor(r * 2)];
    // the terrace round the slab, the court between the slab, the tower and Block B [documented: the terrace; the rest assumed]
    if (inRect(x, z, PODIUM) || inRect(x, z, [TOWER[0] - 6, TOWER[1] - 6, 0, 46]) || inRect(x, z, [BLOCK_B[0] - 14, BLOCK_B[1] - 4, BLOCK_B[2] + 30, BLOCK_B[3] + 6]))
      return r < 0.5 ? 0xb3afa5 : 0xaaa69c;
    return noise2(x * 0.05, z * 0.05) < 0.3 ? GRASS[2] : GRASS[Math.floor(r * 2)];
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

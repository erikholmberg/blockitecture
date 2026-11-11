/**
 * Unity Temple's lot (spec 062): the corner of Lake Street and Kenilworth Avenue in Oak Park, flat [documented], lawn between the
 * walls and the sidewalks [scaled: the location plan], the streets from OSM [documented], the neighbour to the south as a plain
 * block on its OSM outline [footprint documented; the rest assumed].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, plainNeighbour, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { inBuilding, inRect, TERRACE_E, TERRACE_W, Y } from './layout';
import { LOT_BUILDINGS, LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -75, z0: -75, x1: 215, z1: 170 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS, { secondary: 20, residential: 15, service: 7 }, 8);
const EDGE = 24;
const terrace = (x: number, z: number) => inRect(x, z, TERRACE_E) || inRect(x, z, TERRACE_W);

/** Designed ground in ft: level at the building's datum, the terraces raised, easing into the real ground at the edges. */
export function groundFt(x: number, z: number): number {
  if (terrace(x, z)) return Y.FOYER * PL;
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
    if (inBuilding(x, z)) return 0x8a8478;
    if (terrace(x, z)) return r < 0.5 ? 0xb5ad9c : 0xada594; // the terraces' concrete
    if (s === 'road') return r < 0.5 ? 0x4a4c4e : 0x525456;
    if (s === 'pavement') return r < 0.5 ? 0xb4b0a6 : 0xaca89e;
    return LAWN[Math.floor(r * 2)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : terrace(x, z) ? 0xb5ad9c : 0x7d6a52),
    });
  const keep = (x: number, z: number) => inRect(x, z, [TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1]);
  for (const bl of LOT_BUILDINGS) {
    const cx = bl.ring.reduce((a, p) => a + p[0], 0) / bl.ring.length, cz = bl.ring.reduce((a, p) => a + p[1], 0) / bl.ring.length;
    const base = hm.at(Math.round(cx), Math.round(cz));
    plainNeighbour(b, bl.ring, base, base + 62, { wall: [0xa8765a, 0x9c6c52], window: 0x3a4248, roof: 0x5d6062, keep });
  }
  return hm;
}

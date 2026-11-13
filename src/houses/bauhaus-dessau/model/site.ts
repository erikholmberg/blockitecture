/**
 * The Bauhaus Dessau's lot (spec 076): flat town ground [documented: the terrain varies about 1 m round the building] between
 * Gropiusallee on the west [documented: OSM way 35147811] and the lawn east of the Prellerhaus, Bauhausstraße passing under the
 * bridge [documented: OSM ways 239651885, 26 ft wide, and 28873147], the forecourt before the entrance [assumed: paved], a paved
 * strip round the building [assumed], lawns round it all [documented: OSM's grass areas], and the lot's neighbours on their OSM
 * outlines [documented; their heights from OSM's levels or assumed].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, inPoly, plainNeighbour, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { FOOTPRINT, inRect, Rect, STREET } from './layout';
import { LOT_BUILDINGS, LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -90, z0: -120, x1: 400, z1: 330 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS, { tertiary: 13, residential: 9, living_street: 8, service: 5, unclassified: 9 }, 6);
const EDGE = 40;

/** Bauhausstraße: from the lot's east edge under the bridge to Gropiusallee [documented: OSM; its line between the ways assumed] */
export const onBauhausstrasse = (x: number, z: number) => x >= STREET.x0 && x < STREET.x1;
/** the forecourt between Bauhausstraße, the link and the Prellerhaus, before the red door [assumed: paved] */
export const FORECOURT: Rect = [STREET.x1, 60, 161, 117];
/** a strip of paving round the building [assumed: 4 ft] */
export const nearBuilding = (x: number, z: number, d = 4) => FOOTPRINT.some((r) => inRect(x, z, [r[0] - d, r[1] - d, r[2] + d, r[3] + d]));
export const inBuilding = (x: number, z: number) => FOOTPRINT.some((r) => inRect(x, z, r));
/** the lot's own neighbours (OSM buildings whose centre is in the lot) */
export const inNeighbour = (x: number, z: number) => LOT_BUILDINGS.some((bl) => inPoly(x + 0.5, z + 0.5, bl.ring));

/** Designed ground in ft: level at the building [documented: flat], easing into the real ground at the lot's edges. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  return real + (0 - real) * smoothstep(e / EDGE);
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

export const GRASS = [0x6c9a4c, 0x76a453, 0x63904a];
const PAVING = [0xb4b0a6, 0xaca89e];
const ASPHALT = [0x55575a, 0x5c5e61];

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
    if (s === 'road') return ASPHALT[Math.floor(r * 2)];
    if (onBauhausstrasse(x, z)) return ASPHALT[Math.floor(r * 2)];
    if (s === 'pavement') return PAVING[Math.floor(r * 2)];
    if (inBuilding(x, z) || nearBuilding(x, z) || inRect(x, z, FORECOURT) || inNeighbour(x, z)) return PAVING[Math.floor(r * 2)];
    return noise2(x * 0.04, z * 0.04) < 0.3 ? GRASS[2] : GRASS[Math.floor(r * 2)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0x7d6a52),
    });
  // the lot's neighbours: the Hochschule's buildings round the school [documented: OSM; their walls assumed plain render]
  const keep = (x: number, z: number) => inRect(x, z, [TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1]) && !nearBuilding(x, z, 2);
  for (const bl of LOT_BUILDINGS) {
    const cx = bl.ring.reduce((a, p) => a + p[0], 0) / bl.ring.length, cz = bl.ring.reduce((a, p) => a + p[1], 0) / bl.ring.length;
    const base = hm.at(Math.round(cx), Math.round(cz));
    const levels = bl.levels || 2;
    plainNeighbour(b, bl.ring, base, base + Math.min(levels, 5) * 25 + 3, { wall: [0xe2ddd2, 0xd8d3c7], window: 0x3a4248, roof: 0x77746e, keep });
  }
  return hm;
}

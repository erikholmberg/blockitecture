/**
 * The Neue Nationalgalerie's lot (spec 057): the Kulturforum's corner between Potsdamer Straße, Sigismundstraße and the
 * Landwehrkanal's Reichpietschufer [OSM: documented]. The ground is level with the street round the podium, about 1 m below
 * its terrace [documented: scaled from the section] (the terrain tiles here are no help: they rise and fall with the big
 * buildings round the Kulturforum), easing into the real ground at the lot's edges; the podium's edge is faced in granite.
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { GARDEN, inRect, PODIUM, Rect, STREET_STAIR, Y } from './layout';
import { LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -110, z0: -130, x1: 330, z1: 330 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS);

/** the street's level round the podium: about 1 m below the terrace [documented: scaled] */
const STREET_FT = -3.6;
const rectDist = (x: number, z: number, r: Rect) => Math.hypot(Math.max(r[0] - x, 0, x - r[2] + 1), Math.max(r[1] - z, 0, z - r[3] + 1));
const EDGE = 30;

/** Designed ground in ft: the podium's top just under the terrace, the garden sunk, the street level round them. */
export function groundFt(x: number, z: number): number {
  if (inRect(x, z, PODIUM)) return -3 * PL;
  if (inRect(x, z, GARDEN)) return Y.GARDEN * PL;
  const real = lotGround(x, z);
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  return real + (STREET_FT - real) * smoothstep(e / EDGE);
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

const GRANITE = [0xbab9b3, 0xb1b0aa];
const PAVING = [0xa7a49c, 0x9f9c94];
const LAWN = [0x6f9a50, 0x78a257];
/** the podium's edge and the garden's: granite all the way down [documented: the plinth's cladding] */
const faced = (x: number, z: number) =>
  (inRect(x, z, PODIUM) && !inRect(x, z, [PODIUM[0] + 1, PODIUM[1] + 1, PODIUM[2] - 1, PODIUM[3] - 1])) ||
  (inRect(x, z, GARDEN) && !inRect(x, z, [GARDEN[0] + 1, GARDEN[1], GARDEN[2] - 1, GARDEN[3] - 1]));

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
    if (faced(x, z) || inRect(x, z, PODIUM)) return GRANITE[0];
    if (inRect(x, z, GARDEN)) return noise2(x * 0.05, z * 0.05) < 0.3 ? 0xb3a88f : LAWN[Math.floor(r * 2)]; // gravel, lawn [assumed]
    if (s === 'road') return r < 0.5 ? 0x4a4c4e : 0x525456;
    if (s === 'pavement' || inRect(x, z, [STREET_STAIR[0] - 30, PODIUM[1] - 70, STREET_STAIR[2] + 30, PODIUM[1]])) return PAVING[Math.floor(r * 2)];
    return noise2(x * 0.04, z * 0.04) < 0.45 ? PAVING[1] : LAWN[Math.floor(r * 2)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (faced(x, z) ? GRANITE[(Math.floor(x / 4) + Math.floor(yy / 6)) & 1] : yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0x7d6a52),
    });
  return hm;
}

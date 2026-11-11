/**
 * The Church of the Light's lot (spec 055): the church's grounds in a quiet residential street in Ibaraki, as the real ground,
 * levelled round the chapel [assumed: the ground falls gently to the south, documented: GSI], cut down under it for the
 * foundation; the street on its east side and the houses round it from OSM [documented]; the Sunday School and the minister's
 * house as plain concrete blocks on their OSM outlines [footprints documented; heights and finish assumed].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, plainNeighbour, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { BOX, inRect, Rect, Y } from './layout';
import { LOT_BUILDINGS, LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -50, z0: -60, x1: 120, z1: 80 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS);

/** the church's grounds round the chapel, levelled and paved [assumed: photographs] */
export const GROUNDS: Rect = [-12, -14, 74, 32];
const rectDist = (x: number, z: number, r: Rect) => Math.hypot(Math.max(r[0] - x, 0, x - r[2] + 1), Math.max(r[1] - z, 0, z - r[3] + 1));
const EDGE = 24;

/** Designed ground in ft: level with the entrance round the chapel, cut down under it, easing into the real ground. */
export function groundFt(x: number, z: number): number {
  if (inRect(x, z, BOX)) return Y.PAD * PL;
  const real = lotGround(x, z);
  let y = real * smoothstep(rectDist(x, z, GROUNDS) / 40);
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

/** grey paving round the chapel [assumed]; gardens and gravel between the houses [assumed]; asphalt and pavements [OSM] */
const PAVING = [0xb9b5ac, 0xb1ada4];
const GARDEN = [0x6d8a4a, 0x7a9455, 0x8a8170];

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
    if (inRect(x, z, BOX)) return 0x8a8478;
    if (s === 'road') return r < 0.5 ? 0x4a4c4e : 0x525456;
    if (s === 'pavement') return r < 0.5 ? 0x9c9a94 : 0xa6a39c;
    if (inRect(x, z, GROUNDS)) return PAVING[Math.floor(r * 2)];
    return noise2(x * 0.06, z * 0.06) < 0.4 ? GARDEN[2] : GARDEN[Math.floor(r * 2)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0x7d6a52),
    });
  buildNeighbours(b, hm);
  return hm;
}

/** the Sunday School (1999) and the minister's house, both Ando's [documented: the church], and the houses round the grounds */
export const SUNDAY_SCHOOL = 597276856;
export const MINISTERS_HOUSE = 597276849;
function buildNeighbours(b: Builder, hm: HeightMap) {
  // only the parts inside the lot: beyond it the neighbourhood renderer draws the real buildings
  const keep = (x: number, z: number) => x >= TERRAIN.x0 && x < TERRAIN.x1 && z >= TERRAIN.z0 && z < TERRAIN.z1;
  for (const bl of LOT_BUILDINGS) {
    const cx = bl.ring.reduce((a, p) => a + p[0], 0) / bl.ring.length, cz = bl.ring.reduce((a, p) => a + p[1], 0) / bl.ring.length;
    const base = hm.at(Math.round(cx), Math.round(cz));
    // the Sunday School: bare concrete, a storey and a half [assumed: 148.8 m² of floor over a 102 m² footprint, documented]
    if (bl.id === SUNDAY_SCHOOL) plainNeighbour(b, bl.ring, base, base + 33, { wall: [0xbab7b0, 0xb3b0a9], window: 0x2e3438, roof: 0x9d9a93, storey: 33, keep });
    // the minister's house: bare concrete, two storeys [assumed]
    else if (bl.id === MINISTERS_HOUSE) plainNeighbour(b, bl.ring, base, base + 50, { wall: [0xbdbab3, 0xb5b2ab], window: 0x2e3438, roof: 0x9d9a93, keep });
    // the neighbours: two-storey houses, rendered in pale colours [assumed: the street's houses]
    else plainNeighbour(b, bl.ring, base, base + 50, { wall: [0xe4ded0, 0xd9d2c3, 0xcfc8b8], window: 0x3a4248, roof: 0x5d6062, keep });
  }
}

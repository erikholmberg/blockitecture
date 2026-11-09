/**
 * Casa Luis Barragán's lot (spec 035): the gentle slope of Tacubaya, down toward the street on the east, as the real ground,
 * levelled where the house, the garden's paved terrace, the patio and the street stand; the garden itself climbs with the
 * real slope, as the plan's garden steps show [documented: p. 63]; meeting the real ground
 * at the lot's edges. The garden's lawn and the street's paving are drawn here.
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { GARDEN, GARDEN_TERRACE, HOUSE, inRect, PATIO_ALL, POOL, Rect, SIDEWALK, SIDEWALK_FAR, STREET } from './layout';
import { LOT_GROUND } from './lotTerrain';

export const TERRAIN = { x0: -50, z0: -40, x1: 170, z1: 200 };
const PL = 0.4;

export function lotGround(x: number, z: number): number {
  const g = LOT_GROUND;
  const fx = Math.min(Math.max((x - g.x0) / g.step, 0), g.nx - 1.0001);
  const fz = Math.min(Math.max((z - g.z0) / g.step, 0), g.nz - 1.0001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const H = (ii: number, jj: number) => g.h[jj * g.nx + ii] / 4;
  return H(i, j) * (1 - u) * (1 - v) + H(i + 1, j) * u * (1 - v) + H(i, j + 1) * (1 - u) * v + H(i + 1, j + 1) * u * v;
}

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const rectDist = (x: number, z: number, r: Rect) => Math.hypot(Math.max(r[0] - x, 0, x - r[2] + 1), Math.max(r[1] - z, 0, z - r[3] + 1));
/** the level pads, in plates: under the house (room for its footings), the garden and patio, the street */
const PADS: [Rect, number][] = [
  [HOUSE, -6],
  [[GARDEN_TERRACE[0] - 1, GARDEN_TERRACE[1], PATIO_ALL[2] + 1, GARDEN_TERRACE[3]], -3],
  [[SIDEWALK[0], SIDEWALK[1], SIDEWALK[2], SIDEWALK_FAR[3]], -3],
];
const EDGE = 24;

/** Designed ground in ft. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  if (inRect(x, z, POOL)) return -9 * PL; // the reflecting pool's basin
  let best = Infinity, pad = 0;
  for (const [r, top] of PADS) { const d = rectDist(x, z, r); if (d < best || (d === 0 && best === 0 && top < pad / PL)) { best = d; pad = top * PL; } }
  let y = pad + (real - pad) * smooth((best - 1) / 16);
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  y = real + (y - real) * smooth(e / EDGE);
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

/** the garden's lawn and undergrowth [documented: the wild garden; colours assumed]; volcanic stone paving [documented] */
const GRASS = [0x4f7a3c, 0x5c8744, 0x456d36, 0x6a8f4c];
export const LAVA = [0x55524d, 0x5d5a54, 0x4c4945];
const ASPHALT = [0x3f3f42, 0x46464a];
const PAVING = [0xb8b2a6, 0xaea89c];
const URBAN = [0x9a948a, 0xa39d90, 0x8f8a80]; // the neighbours' yards and paving, built-up

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
    const r = hash2(Math.floor(x / 3), Math.floor(z / 3)), n = noise2(x * 0.08, z * 0.08);
    if (inRect(x, z, STREET)) return ASPHALT[Math.floor(r * 2)];
    if (inRect(x, z, SIDEWALK) || inRect(x, z, SIDEWALK_FAR)) return PAVING[Math.floor(r * 2)];
    if (inRect(x, z, GARDEN_TERRACE) || inRect(x, z, PATIO_ALL)) return LAVA[Math.floor(r * 3)];
    if (inRect(x, z, GARDEN)) return n < 0.3 ? GRASS[2] : GRASS[Math.floor(r * GRASS.length)];
    return URBAN[Math.floor(r * 3)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0x8a7f6c),
    });
  return hm;
}

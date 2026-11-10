/**
 * The Sheats-Goldstein Residence's lot (spec 040): the ridge above Beverly Hills as the real ground, falling about 45 ft from
 * the driveway on the north to the house's south point. Under the house it's made up to just below the floors; under level −1
 * to just below its floor; the tennis court sits on a level pad down the slope. Meets the real ground at the lot's edges. The
 * chaparral, the garden's ground and the driveway are drawn here.
 */
import { C, TERRAIN_SIZES } from '@/engine/catalog';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { COURT, COURT_Y, inHouse, inLower, inPool, inRect, onOutline } from './layout';
import { LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -160, z0: -130, x1: 200, z1: 160 };
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
const EDGE = 24;
/** the made-up ground under the house, in plates: room for the footings and the slab */
export const PAD = -6;
export const LOWER_PAD = -33;
export const POOL_PAD = -12;
const onCourtEdge = (x: number, z: number) => inRect(x, z, COURT) && (x === COURT[0] || x === COURT[2] - 1 || z === COURT[1] || z === COURT[3] - 1);

/** Designed ground in ft. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  let y = real;
  if (inHouse(x, z)) {
    const pad = (inLower(x, z) ? LOWER_PAD : inPool(x, z) ? POOL_PAD : PAD) * PL;
    // where the ridge falls away below the pad, the house's concrete skirt round the outline stands on the real ground (house.ts)
    y = onOutline(x, z) ? Math.min(real, pad) : pad;
  } else if (inRect(x, z, COURT)) {
    const pad = (COURT_Y - 3) * PL;
    y = onCourtEdge(x, z) ? Math.min(real, pad) : pad;
  }
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  return real + (y - real) * smooth(e / EDGE);
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

function segDist(x: number, z: number, a: [number, number], b: [number, number]) {
  const [ax, az] = a, [bx, bz] = b, L2 = (bx - ax) ** 2 + (bz - az) ** 2 || 1;
  const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / L2));
  return Math.hypot(x - ax - (bx - ax) * t, z - az - (bz - az) * t);
}
/** Angelo View Drive and the driveway along the house's north side [documented: OSM; widths assumed] */
export function onRoad(x: number, z: number) {
  for (const r of LOT_ROADS) {
    const half = r.highway === 'service' ? 6 : 10;
    for (let i = 1; i < r.pts.length; i++) if (segDist(x, z, r.pts[i - 1], r.pts[i]) < half) return true;
  }
  return false;
}

/** chaparral on the slopes, the garden's lawn near the house [assumed] */
const CHAPARRAL = [0x5f6b44, 0x6b7550, 0x4f6b44, 0x8d8b4f];
const GARDEN = [0x4f7a3c, 0x5c8744, 0x456d36];

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
    const r = hash2(Math.floor(x / 3), Math.floor(z / 3)), n = noise2(x * 0.06, z * 0.06);
    if (inHouse(x, z) || inRect(x, z, COURT)) return 0x9a948a; // under the floors
    if (onRoad(x, z)) return r < 0.5 ? C.asphalt : 0x525456;
    // the tropical garden close round the house [documented: "jungle"], chaparral beyond
    if (Math.hypot(x - 10, z - 5) < 110) return GARDEN[Math.floor(r * 3)];
    return n < 0.35 ? CHAPARRAL[3] : CHAPARRAL[Math.floor(r * 3)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0x8a7a62),
    });
  return hm;
}

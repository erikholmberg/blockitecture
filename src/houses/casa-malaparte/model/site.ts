/**
 * Casa Malaparte's lot (spec 031): Punta Massullo. The terrain tiles have no heights for the headland (they read sea level at
 * every zoom), so it's shaped here from OSM's coastline [documented]: land on the left of each coastline way, cliffs rising
 * steeply from the shore to the promontory's top [assumed: photographs], the top level with the house's lower floor and
 * rising gently inland, and the sea floor under the water. At the lot's edges on land it meets the real ground.
 */
import { C, TERRAIN_SIZES } from '@/engine/catalog';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { HOUSE, inRect, inStair, Y } from './layout';
import { LOT_COAST, LOT_GROUND } from './lotTerrain';

export const TERRAIN = { x0: -90, z0: -150, x1: 290, z1: 150 };
const PL = 0.4;
const SEA_FT = Y.SEA * PL;
/** the lowest course built: just under the waterline, on the 3-plate course grid (so every course lines up with the ground's top) */
const UNDER_SEA = Math.floor((Y.SEA - 6) / 3) * 3;

export function lotGround(x: number, z: number): number {
  const g = LOT_GROUND;
  const fx = Math.min(Math.max((x - g.x0) / g.step, 0), g.nx - 1.0001);
  const fz = Math.min(Math.max((z - g.z0) / g.step, 0), g.nz - 1.0001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const H = (ii: number, jj: number) => g.h[jj * g.nx + ii] / 4;
  return H(i, j) * (1 - u) * (1 - v) + H(i + 1, j) * u * (1 - v) + H(i, j + 1) * (1 - u) * v + H(i + 1, j + 1) * u * v;
}

/**
 * The coastline ways, minus one OSM mistake: a short "coastline" that traces the house's own outline. Kept: ways with points
 * outside the house.
 */
const COAST = LOT_COAST.filter((w) => w.some(([x, z]) => !inRect(x, z, [HOUSE[0] - 70, HOUSE[1] - 5, HOUSE[2] + 5, HOUSE[3] + 5])));

/** distance to the coast and which side: > 0 on land (left of the way, in a frame where north is −z), < 0 at sea */
export function coastAt(x: number, z: number): number {
  let best = Infinity, side = 1;
  for (const w of COAST)
    for (let i = 1; i < w.length; i++) {
      const [ax, az] = w[i - 1], [bx, bz] = w[i], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
      const d = Math.hypot(x - ax - t * dx, z - az - t * dz);
      if (d < best) {
        best = d;
        // with x east and z south, "left" of travel is where the cross product dx·(z−az) − dz·(x−ax) is negative
        side = dx * (z - az) - dz * (x - ax) < 0 ? 1 : -1;
      }
    }
  return best * side;
}

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const BLEND = 30;

/** the promontory's top: level with the lower floor at the house, rising gently inland (−x) [assumed: photographs] */
function topFt(x: number, z: number): number {
  const inland = Math.max(0, -10 - x) * 0.18;
  const rough = (noise2(x * 0.08, z * 0.08) - 0.5) * 3;
  return -3 * PL + inland + rough;
}

/** Designed ground in ft. */
export function groundFt(x: number, z: number): number {
  const c = coastAt(x, z);
  let y: number;
  if (c <= 0) y = SEA_FT - 12 - Math.min(48, -c * 0.6); // the sea floor, shelving away from the cliffs
  else {
    // the cliffs: nearly sheer within a few feet of the shore, rounding over to the top
    const t = smooth(Math.min(1, c / 14));
    y = SEA_FT + (topFt(x, z) - SEA_FT) * Math.sqrt(t);
  }
  // under the house and the stair, a level pad (the stair's foot is on the land, level with the lower floor)
  if (inRect(x, z, [HOUSE[0] - 1, HOUSE[1] - 1, HOUSE[2] + 1, HOUSE[3] + 1])) y = Math.min(y, -6 * PL); // the house's footings show a course
  else if (inStair(x, z)) y = Math.min(y, -3 * PL);
  // on land at the lot's edges, blend into the real ground; at sea the floor stays (hidden under the water)
  const d = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  const real = lotGround(x, z);
  if (c > 0 && real > SEA_FT + 6) return real + (y - real) * smooth(d / BLEND);
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

const LIMESTONE = [0xb8ad98, 0xa89d88, 0x9c917c, 0xc4baa6];
const SCRUB = [0x4f6b44, 0x5f7a4e, 0x6b7550, 0x46613d];

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
  const top = (x: number, z: number, t: number) => {
    const r = hash2(Math.floor(x / 4), Math.floor(z / 4)), n = noise2(x * 0.07, z * 0.07);
    if (t < Y.SEA) return n < 0.5 ? 0x8a8576 : 0x9a9483; // the sea floor
    if (inRect(x, z, [HOUSE[0] - 1, HOUSE[1] - 1, HOUSE[2] + 1, HOUSE[3] + 1]) || inStair(x, z)) return 0xb59a7a;
    if (t < -30) return LIMESTONE[Math.floor(r * LIMESTONE.length)]; // the cliff faces, pale limestone
    return n < 0.4 ? SCRUB[0] : SCRUB[Math.floor(r * SCRUB.length)];
  };
  // the cliffs' sides: pale limestone in rough horizontal bands
  const side = (x: number, y: number, z: number) => LIMESTONE[Math.floor(hash2(Math.floor((x + z) / 6), Math.floor(y / 6)) * LIMESTONE.length)];
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, Math.max(bottom[k], UNDER_SEA)); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      // nothing below the waterline: the sea is opaque, so the cliffs stop just under it
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= Math.max(bottom[k], UNDER_SEA) && y < hm.top[k]; },
      color: (x, yy, z) => { const t = hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)]; return yy + 3 >= t ? top(x, z, t) : side(x, yy, z); },
    });
  void C;
  return hm;
}

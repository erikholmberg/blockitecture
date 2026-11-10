/**
 * The Ennis House's lot (spec 025): the ridge above Los Feliz as the real ground; inside OSM's outline of the house the
 * podium is filled to just under the floor; Glendower Avenue painted in; the neighbours as stucco houses with tile roofs.
 */
import { C, TERRAIN_SIZES } from '@/engine/catalog';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { Y } from './layout';
import { LOT_BUILDINGS, LOT_GROUND, LOT_ROADS, LOT_SELF } from './lotTerrain';

export const TERRAIN = { x0: -50, z0: -70, x1: 290, z1: 130 };
const PL = 0.4;

export function lotGround(x: number, z: number): number {
  const g = LOT_GROUND;
  const fx = Math.min(Math.max((x - g.x0) / g.step, 0), g.nx - 1.0001);
  const fz = Math.min(Math.max((z - g.z0) / g.step, 0), g.nz - 1.0001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const H = (ii: number, jj: number) => g.h[jj * g.nx + ii] / 4;
  return H(i, j) * (1 - u) * (1 - v) + H(i + 1, j) * u * (1 - v) + H(i, j + 1) * (1 - u) * v + H(i + 1, j + 1) * u * v;
}

export function inPoly(x: number, z: number, ring: [number, number][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
/** the house's own outline (OSM way 426658114) [documented] */
export const OUTLINE = LOT_SELF[0];
export const inHouse = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, OUTLINE);
/** inside the outline and not on its edge: the podium's fill (its edge is the textile-block retaining wall) */
export const inPodium = (x: number, z: number) =>
  inHouse(x, z) && inHouse(x - 1, z) && inHouse(x + 1, z) && inHouse(x, z - 1) && inHouse(x, z + 1);

/** Designed ground in ft: the real ridge; inside the podium, one course under the floor. */
export function groundFt(x: number, z: number): number {
  return inPodium(x, z) ? -3 * PL : lotGround(x, z);
}
export const surfaceFt = (x: number, z: number) => (inHouse(x, z) ? Y.FLOOR * PL : lotGround(x, z));
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

function segDist(x: number, z: number, [ax, az]: number[], [bx, bz]: number[]) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
  return Math.hypot(x - ax - t * dx, z - az - t * dz);
}
/** Glendower Avenue and the service roads [OSM: documented; widths assumed] */
function onRoad(x: number, z: number) {
  for (const r of LOT_ROADS) {
    const half = r.highway === 'service' ? 5 : 10;
    for (let i = 1; i < r.pts.length; i++) if (segDist(x, z, r.pts[i - 1], r.pts[i]) < half) return true;
  }
  return false;
}

const CHAPARRAL = [0x5f6b44, 0x6b7550, 0x4f6b44, 0x8d8b4f];

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
    if (inHouse(x, z)) return 0xc4ad86; // under the floors
    if (onRoad(x, z)) return hash2(Math.floor(x / 6), Math.floor(z / 6)) < 0.5 ? C.asphalt : 0x525456;
    const n = noise2(x * 0.06, z * 0.06), r = hash2(Math.floor(x / 4), Math.floor(z / 4));
    return n < 0.35 ? CHAPARRAL[2] : CHAPARRAL[Math.floor(r * CHAPARRAL.length)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : hash2(x >> 2, yy) < 0.3 ? C.rock : C.darkTan),
    });
  buildNeighbours(b);
  return hm;
}

/** the neighbours inside the lot: stucco houses with tile roofs, whole even where they cross its edge [OSM footprints; the rest assumed] */
function buildNeighbours(b: Builder) {
  for (const bl of LOT_BUILDINGS) b.neighbour(() => {
    b.newGroup();
    const xs = bl.ring.map((p) => p[0]), zs = bl.ring.map((p) => p[1]);
    const x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs)), z0 = Math.floor(Math.min(...zs)), z1 = Math.ceil(Math.max(...zs));
    const mine = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, bl.ring);
    let base = Infinity;
    for (let z = z0; z < z1; z += 2) for (let x = x0; x < x1; x += 2) if (mine(x, z)) base = Math.min(base, groundPlates(x, z));
    if (!Number.isFinite(base)) return;
    const top = base + 30 + 3 * Math.floor(hash2(bl.id % 997, 7) * 3);
    const edge = (x: number, z: number) => mine(x, z) && !(mine(x - 1, z) && mine(x + 1, z) && mine(x, z - 1) && mine(x, z + 1));
    b.box(x0, z0, x1, z1, base, top, { kind: 'brick', mask: (x, z) => edge(x, z), color: 0xe8dcc4 });
    b.box(x0, z0, x1, z1, top, top + 2, { kind: 'plate', mask: (x, z) => mine(x, z), color: 0xb5562b });
  });
}

/**
 * The Rietveld Schröder House's lot (spec 019): flat Utrecht ground, Prins Hendriklaan and the streets around painted into
 * it, the end of the row of houses the house is built onto (and the sheds behind), as plain blocks from their OSM outlines,
 * blending to the real ground at the lot's edges.
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { D, FOOTPRINT, inRect, PARTY_NEIGHBOUR, Rect, Y } from './layout';
import { LOT_BUILDINGS, LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -100, z0: -100, x1: 100, z1: 100 };
const PL = 0.4;

/** Real ground in ft (bilinear over the baked samples). */
export function lotGround(x: number, z: number): number {
  const g = LOT_GROUND;
  const fx = Math.min(Math.max((x - g.x0) / g.step, 0), g.nx - 1.0001);
  const fz = Math.min(Math.max((z - g.z0) / g.step, 0), g.nz - 1.0001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const H = (ii: number, jj: number) => g.h[jj * g.nx + ii] / 4;
  return H(i, j) * (1 - u) * (1 - v) + H(i + 1, j) * u * (1 - v) + H(i, j + 1) * (1 - u) * v + H(i + 1, j + 1) * u * v;
}

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const BLEND = 30;
/** Designed ground in ft: flat, one brick below the floor, fading to the real ground at the lot's edges. */
export function groundFt(x: number, z: number): number {
  const d = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  const w = smooth(d / BLEND);
  const real = lotGround(x, z);
  return real + (Y.GROUND * PL - real) * w;
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

// ---------- streets ----------
const ROAD_HALF: Record<string, number> = { primary: 16, secondary: 13, tertiary: 11, residential: 9, unclassified: 9, living_street: 7, service: 5 };
function segDist(x: number, z: number, [ax, az]: number[], [bx, bz]: number[]) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
  return Math.hypot(x - ax - t * dx, z - az - t * dz);
}
/** what the ground is at (x, z): carriageway, pavement or garden [OSM streets: documented; widths assumed] */
export function streetAt(x: number, z: number): 'road' | 'pavement' | null {
  let best: 'road' | 'pavement' | null = null;
  for (const r of LOT_ROADS) {
    const half = ROAD_HALF[r.highway] ?? 0;
    if (!half) continue;
    for (let i = 1; i < r.pts.length; i++) {
      const d = segDist(x, z, r.pts[i - 1], r.pts[i]);
      if (d < half) return 'road';
      if (d < half + 6) best = 'pavement';
    }
  }
  return best;
}

// ---------- the row ----------
function inPoly(x: number, z: number, ring: [number, number][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
/** the row houses' heights: three storeys of brick under a tiled mansard (photographs) [assumed]; small sheds: one storey */
export const ROW_EAVES = 57;
export const ROW_MANSARD = 8; // steps of 3 plates, one stud in each
export const SHED_TOP = 21;

const BRICK = [0x6e3b2a, 0x7a4430, 0x683727, 0x744032];
const TILE = [0x4a3f3a, 0x544842];

/** The lot's neighbours as cells: which building (index into LOT_BUILDINGS) covers each stud cell, or −1. */
export function neighbourCells(): { owner: Int16Array; w: number; d: number } {
  const w = TERRAIN.x1 - TERRAIN.x0, d = TERRAIN.z1 - TERRAIN.z0;
  const owner = new Int16Array(w * d).fill(-1);
  LOT_BUILDINGS.forEach((bl, i) => {
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++)
      for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) {
        if (inRect(x, z, FOOTPRINT)) continue;
        // the party wall: the neighbour is built right up to the house [documented: they share a wall]
        const party = bl.id === PARTY_NEIGHBOUR && x < 0 && x >= -3 && z >= 0 && z < D - 1;
        if (party || inPoly(x + 0.5, z + 0.5, bl.ring)) owner[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] = i;
      }
  });
  return { owner, w, d };
}

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
  const topColor = (x: number, z: number) => {
    const s = streetAt(x, z), r = hash2(Math.floor(x / 2), Math.floor(z / 2));
    if (s === 'road') return r < 0.5 ? 0x4a4c4e : 0x525456;
    if (s === 'pavement') return r < 0.5 ? 0x9c9a94 : 0xa8a59e; // Dutch brick pavers, grey
    const n = noise2(x * 0.09, z * 0.09);
    return n < 0.35 ? 0x5f8a45 : r < 0.5 ? 0x6f9a50 : 0x78a257; // grass
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? topColor(x, z) : 0x7d6a52),
    });
  buildRow(b, hm);
  return hm;
}

/**
 * The row of houses (1921) the Schröder House ends, and the sheds behind: plain brick blocks on their OSM outlines,
 * white-framed windows on their fronts and backs, tiled mansard roofs [footprints documented (OSM); the rest assumed].
 */
function buildRow(b: Builder, hm: HeightMap) {
  const { owner, w } = neighbourCells();
  const at = (x: number, z: number) =>
    x < TERRAIN.x0 || x >= TERRAIN.x1 || z < TERRAIN.z0 || z >= TERRAIN.z1 ? -1 : owner[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)];
  LOT_BUILDINGS.forEach((bl, i) => {
    b.newGroup();
    const xs = bl.ring.map((p) => p[0]), zs = bl.ring.map((p) => p[1]);
    const x0 = Math.floor(Math.min(...xs)) - 3, x1 = Math.ceil(Math.max(...xs)) + 1;
    const z0 = Math.floor(Math.min(...zs)) - 1, z1 = Math.ceil(Math.max(...zs)) + 1;
    let cells = 0;
    for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) if (at(x, z) === i) cells++;
    const row = cells > 400;
    const base = hm.at(Math.round((x0 + x1) / 2), Math.round((z0 + z1) / 2));
    const top = row ? ROW_EAVES : SHED_TOP;
    const mine = (x: number, z: number) => at(x, z) === i;
    // distance (in studs, up to the mansard's depth) from each cell to the building's edge
    const inset = (x: number, z: number) => {
      for (let k = 0; k <= ROW_MANSARD; k++)
        for (let dz = -k; dz <= k; dz++) for (let dx = -k; dx <= k; dx++) if (!mine(x + dx, z + dz)) return k;
      return ROW_MANSARD + 1;
    };
    // the walls: brick, with windows on the faces toward the street and the gardens (the ±z sides)
    const facing = (x: number, z: number) => mine(x, z) && (!mine(x, z + 1) || !mine(x, z - 1)) && mine(x - 1, z) && mine(x + 1, z);
    b.box(x0, z0, x1, z1, base, top, {
      kind: 'brick',
      mask: (x, z) => mine(x, z),
      color: (x, y, z) => {
        const storey = (y - base) % 19;
        if (row && facing(x, z) && ((x % 5) + 5) % 5 >= 1 && ((x % 5) + 5) % 5 <= 3 && storey >= 7 && storey < 16) return storey === 7 || storey === 15 ? 0xf0efe9 : 0x2b3238;
        return BRICK[Math.floor(hash2(Math.floor(x / 2) + y * 3, z) * BRICK.length)];
      },
    });
    if (!row) return;
    // the mansard: each course steps in by a stud
    for (let k = 1; k <= ROW_MANSARD; k++)
      b.box(x0, z0, x1, z1, top + (k - 1) * 3, top + k * 3, {
        kind: 'brick', mask: (x, z) => mine(x, z) && inset(x, z) >= k, color: (x, _y, z) => TILE[Math.floor(hash2(x, z * 3) * TILE.length)],
      });
  });
}

/** the garden plot of the house, with its fence along the pavements [assumed: photographs] */
export const PLOT: Rect = [0, -12, 58, 66];

/**
 * The Centre Pompidou's lot (spec 080): the Plateau Beaubourg between rue Saint-Merri and rue Rambuteau, from rue Saint-Martin
 * to rue Beaubourg [documented: OSM]. The ground is IGN's bare-earth RGE ALTI (the AWS tiles carry Paris's roofs here, spec 080
 * Q6), so the piazza falls toward the building as it really does: about 3.2 m over 56 m [documented: IGN]. Under the building
 * the ground is dug out for the concrete substructure [documented: a three-level concrete box; its depth here assumed].
 */
import { groundSampler, inPoly, Pt, streets } from '@/engine/lot';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { AREA_E, COL, COL_E, COL_W, FOOTPRINT, FRAMES, frameX, inRect, Rect } from './layout';
import { LOT_GROUND, LOT_PARTS, LOT_ROADS } from './lotTerrain';

/** from rue Saint-Merri to past the Atelier Brancusi, from rue Saint-Martin to the far kerb of rue Beaubourg [scaled: OSM] */
export const TERRAIN = { x0: -35, z0: -200, x1: 610, z1: 255 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS, { secondary: 14, tertiary: 11, residential: 9, unclassified: 9, service: 5 }, 8);

const part = (id: number) => LOT_PARTS.find((p) => p.id === id)!.pts as Pt[];
/** the piazza: OSM's way 55507605, the outer ring of Place Georges-Pompidou (relation 556816) [documented] */
export const PIAZZA = part(55507605);
/** the seven ventilation stacks on the piazza [documented: OSM, man_made=chimney, height 7 m] */
export const STACK_IDS = [55503398, 55503400, 55507598, 55507602, 55507603, 55507610, 55507612];
export const STACKS = STACK_IDS.map((id) => {
  const r = part(id);
  return { id, ring: r, x: r.reduce((a, p) => a + p[0], 0) / r.length, z: r.reduce((a, p) => a + p[1], 0) / r.length };
});
/** the Atelier Brancusi (way 55503399) [documented: OSM] and the Stravinsky Fountain's basin (way 88301107) [documented: OSM] */
export const BRANCUSI = part(55503399);
export const FOUNTAIN = part(88301107);

const LW = 645, LD = 455;
const lotIndex = (x: number, z: number) => (x < -35 || z < -200 || x >= -35 + LW || z >= -200 + LD ? -1 : (z + 200) * LW + x + 35);
/** cached per lot cell, as these are asked millions of times */
const PIAZZA_CELLS = new Uint8Array(LW * LD);
for (let z = -200; z < -200 + LD; z++) for (let x = -35; x < -35 + LW; x++) PIAZZA_CELLS[lotIndex(x, z)] = !inRect(x, z, FOOTPRINT) && inPoly(x + 0.5, z + 0.5, PIAZZA) ? 1 : 0;
export const inPiazza = (x: number, z: number) => {
  const k = lotIndex(x, z);
  return k >= 0 ? PIAZZA_CELLS[k] === 1 : !inRect(x, z, FOOTPRINT) && inPoly(x + 0.5, z + 0.5, PIAZZA);
};
export const inBrancusi = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, BRANCUSI);
/** a column's cells (the site's ground and the substructure leave room for them) */
export const isColumn = (x: number, z: number) => {
  const i = Math.round((x - 1) / 42);
  return i >= 0 && i < FRAMES && x >= frameX(i) - 1 && x < frameX(i) - 1 + COL && ((z >= COL_W && z < COL_W + COL) || (z >= COL_E && z < COL_E + COL));
};
export const built = (x: number, z: number) => inRect(x, z, FOOTPRINT) || inRect(x, z, AREA_E);

/** the dig's floor under the building: the substructure's concrete goes in on it (foundation) [assumed: its depth shown] */
export const DIG_TOP = -9;

/** the real ground in plates, from IGN; on the piazza never below the Forum's floor (the piazza's lowest point is the entrance) */
/**
 * The piazza's profile across it, from IGN's ground along the building (its median) [documented: IGN]: level for its last 20 m or
 * so before the west front, then rising to rue Saint-Martin, never falling away from the building [assumed: smoothed]. So it
 * lies in straight courses along the front, a plate at a time.
 */
export const PIAZZA_PROFILE = (() => {
  const raw: number[] = [];
  for (let z = -200; z < 0; z++) {
    // the median along the front's middle stretch, clear of the piazza's corners and the Atelier Brancusi
    const ys: number[] = [];
    for (let x = 90; x < 460; x += 2) if (inPiazza(x, z)) ys.push(lotGround(x + 0.5, z + 0.5) / PL);
    ys.sort((a, b) => a - b);
    raw.push(ys.length ? ys[ys.length >> 1] : NaN);
  }
  for (let i = raw.length - 1; i >= 0; i--) if (Number.isNaN(raw[i])) raw[i] = i + 1 < raw.length ? raw[i + 1] : 0;
  for (let i = 0; i < raw.length; i++) if (Number.isNaN(raw[i])) raw[i] = 0;
  // smoothed over 15 ft, and climbing only away from the building
  const out = raw.map((_, i) => {
    let n = 0, sum = 0;
    for (let k = Math.max(0, i - 7); k <= Math.min(raw.length - 1, i + 7); k++) { n++; sum += raw[k]; }
    return sum / n;
  });
  const prof = new Int16Array(out.length);
  let m = 0;
  for (let i = out.length - 1; i >= 0; i--) { m = Math.max(m, Math.round(out[i])); prof[i] = m; }
  return prof;
})();
function realPlatesAt(x: number, z: number) {
  if (inPiazza(x, z)) return z < -200 ? PIAZZA_PROFILE[0] : z >= 0 ? 0 : PIAZZA_PROFILE[z + 200];
  return Math.round(lotGround(x + 0.5, z + 0.5) / PL / 3) * 3;
}
const REAL = new Int16Array(LW * LD);
for (let z = -200; z < -200 + LD; z++) for (let x = -35; x < -35 + LW; x++) REAL[lotIndex(x, z)] = realPlatesAt(x, z);
export function realPlates(x: number, z: number) {
  const k = lotIndex(x, z);
  return k >= 0 ? REAL[k] : realPlatesAt(x, z);
}
/** the walking ground: the Forum's floor and the yard under the building, the real ground elsewhere */
export function groundPlates(x: number, z: number) {
  if (built(x, z)) return 0;
  return realPlates(x, z);
}
export const surfaceFt = (x: number, z: number) => groundPlates(Math.floor(x), Math.floor(z)) * PL;

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

export const ASPHALT = [0x4c4e50, 0x535557];
/** Paris's pavements: pale limestone and grey asphalt [assumed] */
export const PAVEMENT = [0xb6b1a6, 0xaea99e];
export const SOIL = 0x7d6a52;
/** the piazza's setts [documented: OSM surface=sett]: a warm grey-brown [assumed] */
export const SETT = [0xa39582, 0x998b79];

/** the top of what the site lays: under the setts on the piazza, the finished street elsewhere, the dig under the building */
export function siteTop(x: number, z: number) {
  if (built(x, z)) return DIG_TOP;
  return inPiazza(x, z) ? realPlates(x, z) - 1 : realPlates(x, z);
}

const GROUND_SIZES = [
  [32, 32], [32, 16], [16, 16], [32, 8], [32, 7], [32, 6], [32, 5], [32, 3], [16, 8], [8, 8], [32, 4], [16, 4], [8, 4], [4, 4], [32, 2], [16, 2], [8, 2], [4, 2], [2, 2],
  [32, 1], [16, 1], [8, 1], [4, 1], [2, 1], [1, 1],
];

export function buildSite(b: Builder): HeightMap {
  b.setPhase(P.SITE);
  const hm = new HeightMap();
  const { w, d } = hm;
  const st = new Int16Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      hm.top[iz * w + ix] = groundPlates(x, z);
      st[iz * w + ix] = siteTop(x, z);
    }
  const sAt = (x: number, z: number) => {
    const ix = x - TERRAIN.x0, iz = z - TERRAIN.z0;
    return ix < 0 || iz < 0 || ix >= w || iz >= d ? siteTop(x, z) : st[iz * w + ix];
  };
  // a skin a brick thick (a plate under the setts), deepened down any step to the lower neighbour's level
  const bottom = new Int16Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const k = iz * w + ix, x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      let m = st[k] - (inPiazza(x, z) ? 1 : 3);
      for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) m = Math.min(m, sAt(x + dx, z + dz));
      bottom[k] = m;
    }
  const K = (x: number, z: number) => (z - TERRAIN.z0) * w + (x - TERRAIN.x0);
  const topColor = (x: number, z: number) => {
    const r = hash2(Math.floor(x / 16), Math.floor(z / 16));
    if (built(x, z) || inPiazza(x, z)) return SOIL;
    const s = streetAt(x, z);
    if (s === 'road') return ASPHALT[Math.floor(r * 2)];
    return PAVEMENT[Math.floor(r * 2)];
  };
  let minY = Infinity, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, st[k]); }
  // whole bricks wherever three plates fit, on the brick grid; plates for the rest (the piazza's courses)
  const brick = (k: number, y: number) => { const y3 = 3 * Math.floor(y / 3); return y3 >= bottom[k] && y3 + 3 <= st[k]; };
  for (let y = 3 * Math.floor(minY / 3); y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: GROUND_SIZES,
      mask: (x, z) => brick(K(x, z), y) && !isColumn(x, z),
      color: (x, yy, z) => (yy + 3 >= st[K(x, z)] ? topColor(x, z) : SOIL),
    });
  for (let y = minY; y < maxY; y++)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 1, {
      kind: 'plate', sizes: GROUND_SIZES,
      mask: (x, z) => { const k = K(x, z); return y >= bottom[k] && y < st[k] && !brick(k, y) && !isColumn(x, z); },
      color: (x, yy, z) => (yy + 1 >= st[K(x, z)] ? topColor(x, z) : SOIL),
    });
  return hm;
}

/** the ground's rect, for the tests */
export const LOT_RECT: Rect = [TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1];

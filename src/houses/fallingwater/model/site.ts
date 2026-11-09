/**
 * Fallingwater's lot (spec 017): the ravine of Bear Run. A shelf on the north bank for the house, the drive and the
 * bridge; the rock ledge under the living room; Bear Run along OSM's line, with the upper falls under the house; the hill
 * rising north to the guest wing, graded for the covered walkway; and blends to the real ground (lotTerrain.ts, whose
 * stream the data script carved along the same line) at every lot edge.
 */
import { C, TERRAIN_SIZES } from '@/engine/catalog';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { BRIDGE, CANTILEVER1, DRIVE, GUEST_WINGS, inAny, inRect, Rect, TRAY1, WALK_HALF, WALKWAY, Y } from './layout';
import { LOT_GROUND, LOT_WATERFALLS, LOT_WATERWAYS } from './lotTerrain';

export const TERRAIN = { x0: -70, z0: -160, x1: 190, z1: 150 };
const PL = 0.4;

/** Real ground in ft (bilinear over the baked, stream-carved samples). */
export function lotGround(x: number, z: number): number {
  const g = LOT_GROUND;
  const fx = Math.min(Math.max((x - g.x0) / g.step, 0), g.nx - 1.0001);
  const fz = Math.min(Math.max((z - g.z0) / g.step, 0), g.nz - 1.0001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const H = (ii: number, jj: number) => g.h[jj * g.nx + ii] / 4;
  return H(i, j) * (1 - u) * (1 - v) + H(i + 1, j) * u * (1 - v) + H(i, j + 1) * (1 - u) * v + H(i + 1, j + 1) * u * v;
}

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

// ---------- Bear Run ----------
/** OSM's Bear Run near the lot (model ft), in the direction it flows, and the waterfall node */
const RUN = (LOT_WATERWAYS.find((w) => w.name === 'Bear Run')?.pts ?? []).filter(([x, z]) => x > -400 && x < 500 && z > -300 && z < 400);
export const FALLS: [number, number] = LOT_WATERFALLS[0];
const ACC = [0];
for (let i = 1; i < RUN.length; i++) ACC.push(ACC[i - 1] + Math.hypot(RUN[i][0] - RUN[i - 1][0], RUN[i][1] - RUN[i - 1][1]));
function nearest(x: number, z: number): [d: number, s: number] {
  let best: [number, number] = [Infinity, 0];
  for (let i = 1; i < RUN.length; i++) {
    const [ax, az] = RUN[i - 1], [bx, bz] = RUN[i], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
    const d = Math.hypot(x - ax - t * dx, z - az - t * dz);
    if (d < best[0]) best = [d, ACC[i - 1] + t * Math.sqrt(L2)];
  }
  return best;
}
const S_FALLS = nearest(FALLS[0], FALLS[1])[1];

/** where (x, z) is relative to the stream: distance from its line, and distance along it from the falls (> 0 downstream) */
export function streamAt(x: number, z: number) {
  const [d, s] = nearest(x, z);
  return { d, along: s - S_FALLS };
}
/** water surface in plates (sloping 2% away from the falls, as the data script's carve) */
export function waterLevel(along: number): number {
  return along > 0 ? Math.round(Y.POOL - (along * 0.02) / PL) : Math.round(Y.STREAM + (-along * 0.02) / PL);
}
/** half the stream's width: 13 ft above the falls (sheet 4: banks about 26 ft apart); a wider pool below them */
export function halfWidth(along: number): number {
  if (along <= 0) return 13;
  return along < 30 ? 20 : along < 80 ? 20 - ((along - 30) / 50) * 8 : 12;
}
/** the stream bed in ft, with banks rising 1:1 */
function channelFt(x: number, z: number): number {
  const { d, along } = streamAt(x, z);
  const bed = waterLevel(along) * PL - 2.4;
  return bed + Math.max(0, d - halfWidth(along)) * 1.0;
}

// ---------- the designed ground ----------
/** the hill north of the drive: a stone retaining wall at z = 4 holds it 8 ft up, then it rises to the guest wing */
export const WALL_Z = 4;
export const WALL_TOP = 20; // plates
const GUEST_TERRACE: Rect = [5, -110, 118, -44];
/** the covered walkway's path: arc length along it, and the top of its step in plates */
const PATH_ACC = [0];
for (let i = 1; i < WALKWAY.length; i++) PATH_ACC.push(PATH_ACC[i - 1] + Math.hypot(WALKWAY[i][0] - WALKWAY[i - 1][0], WALKWAY[i][1] - WALKWAY[i - 1][1]));
export const PATH_LEN = PATH_ACC[PATH_ACC.length - 1];
export function walkwayAt(x: number, z: number): { d: number; s: number } {
  let best = { d: Infinity, s: 0 };
  for (let i = 1; i < WALKWAY.length; i++) {
    const [ax, az] = WALKWAY[i - 1], [bx, bz] = WALKWAY[i], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
    const d = Math.hypot(x - ax - t * dx, z - az - t * dz);
    if (d < best.d) best = { d, s: PATH_ACC[i - 1] + t * Math.sqrt(L2) };
  }
  return best;
}
/** steps of 3 plates (1.2 ft) from the second-floor bridge (L2) up to the guest wing's floor */
export const stepTop = (s: number) => Y.L2 + 3 * Math.round(((Y.GUEST - Y.L2) * Math.min(1, s / PATH_LEN)) / 3);

function designedFt(x: number, z: number): number {
  // the walkway: graded to sit one step below its stone treads
  const w = walkwayAt(x, z);
  if (w.d <= WALK_HALF + 0.5 && z < WALL_Z) return (stepTop(w.s) - 3) * PL;
  if (inAny(x, z, GUEST_WINGS) || inRect(x, z, GUEST_TERRACE)) return Y.GUEST * PL;
  if (z < WALL_Z) {
    const hill = WALL_TOP * PL + (WALL_Z - z) * 0.3;
    // around the guest terrace the hill eases down (or up) to it, at most 0.8 ft per ft
    const [tx0, tz0, tx1, tz1] = GUEST_TERRACE;
    const dist = Math.hypot(Math.max(tx0 - x, 0, x - tx1), Math.max(tz0 - z, 0, z - tz1));
    const g = Y.GUEST * PL;
    return Math.min(Math.max(hill, g - dist * 0.8), g + dist * 0.8);
  }
  // the house's slab sits on the shelf (rooms against the hill) or floats over the rock ledge (the cantilevers)
  if (inAny(x, z, CANTILEVER1)) return Y.LEDGE * PL;
  if (inAny(x, z, TRAY1)) return -Y.BAND_DOWN * PL;
  // the shelf of the north bank: drive and entry level
  if (z < 47) return 0;
  // the bridge's south abutment and the south bank keep the real ground
  return lotGround(x, z);
}

/** the designed area fades into the real ground over the last 30 ft before each lot edge */
const DESIGN = { x0: TERRAIN.x0 + 30, z0: TERRAIN.z0 + 30, x1: TERRAIN.x1 - 30, z1: TERRAIN.z1 - 30 };
const BLEND = 30;
function designWeight(x: number, z: number) {
  const dx = Math.max(DESIGN.x0 - x, 0, x - DESIGN.x1), dz = Math.max(DESIGN.z0 - z, 0, z - DESIGN.z1);
  return 1 - smooth(Math.hypot(dx, dz) / BLEND);
}

/** Designed ground in ft. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  const w = designWeight(x, z);
  const base = real + (designedFt(x, z) - real) * w;
  // Bear Run cuts through everything, but at the lot edges only as deep as the real (carved) ground
  const ch = real + (channelFt(x, z) - real) * w;
  // the drive and the bridge stay at the shelf; the house's own footprint isn't cut either (it spans the stream)
  if (inRect(x, z, DRIVE) && z < 40) return base;
  const g = Math.min(base, ch);
  // just above the falls the real (20 ft grid) ground smears the pool's depth upstream: there the bed is the rock ledge
  // the water runs over, never deeper than its designed bed (so no water hangs past the lip)
  const s = streamAt(x, z);
  if (s.along <= 0 && s.along > -60 && s.d < halfWidth(s.along) + 20) return Math.max(g, Math.min(ch, Y.LEDGE * PL));
  return g;
}

/** top of the bricks in ft, for the terrain mesh hidden under the lot: the ground, or the water above it */
export function surfaceFt(x: number, z: number): number {
  return groundFt(x, z);
}

export const groundPlates = (x: number, z: number) => Math.round(groundFt(x, z) / PL / 3) * 3;

/** Heightmap of terrain top in plates, at stud resolution (walking fallback). */
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

/** Is (x, z) under Bear Run's water, and where is its surface (plates)? */
export function waterAt(x: number, z: number, top: number): number | null {
  const { d, along } = streamAt(x, z);
  if (d > halfWidth(along) + 14) return null;
  const level = waterLevel(along);
  return top < level ? level : null;
}

const ROCK = [0x7d776c, 0x8b8378, 0x6f6a60, 0x958a73];
const FOREST_FLOOR = [0x4a5a32, 0x3f5530, 0x5b5a3a, 0x55663a];

export function buildSite(b: Builder): HeightMap {
  b.setPhase(P.SITE);
  const hm = new HeightMap();
  const { w, d } = hm;
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) hm.top[iz * w + ix] = groundPlates(ix + TERRAIN.x0, iz + TERRAIN.z0);

  // columns go down to their lowest neighbour (at least one brick), so there are no holes (spec 004 skin rule)
  const bottom = new Int16Array(w * d);
  const steep = new Uint8Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const k = iz * w + ix, x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      let m = hm.top[k], M = hm.top[k];
      for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const t = hm.at(x + dx, z + dz); m = Math.min(m, t); M = Math.max(M, t); }
      bottom[k] = Math.min(m, hm.top[k] - 3);
      steep[k] = hm.top[k] - m >= 6 || M - hm.top[k] >= 9 ? 1 : 0;
    }

  const topColor = (x: number, z: number, top: number, k: number) => {
    const n = noise2(x * 0.08, z * 0.08), r = hash2(Math.floor(x / 3), Math.floor(z / 3));
    if (inRect(x, z, DRIVE) && z < 40 && top >= -3 && top <= 0) return r < 0.5 ? C.darkTan : 0x9c917a; // the gravel drive
    const { d: sd, along } = streamAt(x, z);
    if (sd < halfWidth(along) + 3 || steep[k] || inAny(x, z, CANTILEVER1)) return ROCK[Math.floor(r * ROCK.length)]; // ledges
    return n < 0.35 ? FOREST_FLOOR[1] : FOREST_FLOOR[Math.floor(r * FOREST_FLOOR.length)];
  };
  // Pottsville sandstone in horizontal ledges: colour runs in courses
  const sideColor = (x: number, y: number, z: number) => {
    const r = hash2(Math.floor((x + z) / 5) + Math.floor(y / 3) * 13, Math.floor(y / 3));
    return r < 0.3 ? ROCK[0] : r < 0.6 ? ROCK[1] : r < 0.8 ? C.dirt : ROCK[3];
  };

  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3) {
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick',
      sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => {
        const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0);
        return yy + 3 >= hm.top[k] ? topColor(x, z, hm.top[k], k) : sideColor(x, yy, z);
      },
    });
  }
  return hm;
}

/** the gravel drive from the bridge's south end to the lot edge, on the ground (the bridge itself is structure) */
export function buildDriveSouth(b: Builder, hm: HeightMap) {
  b.setPhase(P.FLOOR);
  const x0 = BRIDGE[0] + 1, x1 = BRIDGE[2] - 1;
  for (let z0 = BRIDGE[3]; z0 < TERRAIN.z1; ) {
    const y = hm.at(x0, z0);
    let z1 = z0 + 1;
    while (z1 < TERRAIN.z1 && hm.at(x0, z1) === y) z1++;
    b.box(x0, z0, x1, z1, y, y + 1, { kind: 'plate', color: C.darkTan });
    z0 = z1;
  }
}

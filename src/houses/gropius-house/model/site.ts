/**
 * The Gropius House's lot (spec 078): the levelled top of the hill, "a flat grassy plinth bordered on the south and west by
 * retaining walls" [documented], and the real ground beyond it, falling every way [documented: USGS 3DEP; AWS terrain]: gently
 * north through the orchard to Baker Bridge Road, more steeply south and west into the woods. The terrain tiles smooth the
 * crest by about 2 m (scripts/houses/gropius-house.mjs), so the ground rises from them to the plinth over the last 60–100 ft.
 * The garage's pad at the foot of the drive is levelled [assumed].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, inPoly, segDist, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { CHIMNEY, CIRCLE, DRIVE, DRIVE_HALF, EAST_RETURN_Z0, HOUSE, inRect, PLINTH, Rect, Y } from './layout';
import { LOT_BUILDINGS, LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -180, z0: -215, x1: 250, z1: 200 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
/** Baker Bridge Road, where it crosses the lot's north-east corner [documented: OSM way 8877212], about 20 ft wide [assumed] */
export const streetAt = streets(LOT_ROADS, { residential: 10 }, 0);

/** the garage: OSM's way 1490862339 [documented], turned 33° to the grid */
export const GARAGE_RING = LOT_BUILDINGS.find((b) => b.id === 1490862339)!.ring;
export const inGarage = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, GARAGE_RING);
const GARAGE_BOX: Rect = [
  Math.floor(Math.min(...GARAGE_RING.map((p) => p[0]))) - 3, Math.floor(Math.min(...GARAGE_RING.map((p) => p[1]))) - 3,
  Math.ceil(Math.max(...GARAGE_RING.map((p) => p[0]))) + 3, Math.ceil(Math.max(...GARAGE_RING.map((p) => p[1]))) + 3,
];
export const nearGarage = (x: number, z: number) =>
  inRect(x, z, GARAGE_BOX) && (inGarage(x, z) || GARAGE_RING.some((p, i) => segDist(x + 0.5, z + 0.5, p, GARAGE_RING[(i + 1) % 4]) < 3));
/** its pad, in plates: level with the lowest ground under it [assumed] */
const gxs = GARAGE_RING.map((p) => p[0]), gzs = GARAGE_RING.map((p) => p[1]);
export const GARAGE_Y = Math.floor(
  Math.min(...GARAGE_RING.map(([x, z]) => lotGround(x, z)), lotGround((Math.min(...gxs) + Math.max(...gxs)) / 2, (Math.min(...gzs) + Math.max(...gzs)) / 2)) / PL / 3,
) * 3;

export const onDrive = (x: number, z: number) =>
  DRIVE.slice(1).some((q, i) => segDist(x + 0.5, z + 0.5, DRIVE[i], q) < DRIVE_HALF) || Math.hypot(x + 0.5 - CIRCLE.x, z + 0.5 - CIRCLE.z) < CIRCLE.r;
export const driveDist = (x: number, z: number) => Math.min(...DRIVE.slice(1).map((q, i) => segDist(x + 0.5, z + 0.5, DRIVE[i], q)));

const rectDist = (x: number, z: number, r: Rect) => Math.hypot(Math.max(r[0] - x, 0, x - r[2] + 1), Math.max(r[1] - z, 0, z - r[3] + 1));
/** the sides of the plinth with a retaining wall: the south and west [documented], and the short return on the east */
export const wallSide = (x: number, z: number) => x <= PLINTH[0] || z >= PLINTH[3] - 1 || (x >= PLINTH[2] - 1 && z >= EAST_RETURN_Z0);
/** the retaining walls' line: the plinth's outermost cells on those sides */
export const onRetainingWall = (x: number, z: number) =>
  inRect(x, z, PLINTH) && (x === PLINTH[0] || z === PLINTH[3] - 1 || (x === PLINTH[2] - 1 && z >= EAST_RETURN_Z0));
/** the ground at the foot of the retaining walls: 3.6 ft below the plinth [assumed: "about 3 ft", HABS 12] */
const WALL_FOOT = Y.LAWN * PL - 3.6;
const EDGE = 20;
/** the foundation's footprint, dug out under the house and the chimney */
export const FOUNDATION: Rect = [CHIMNEY[0], HOUSE[1], HOUSE[2], HOUSE[3]];
/** the partial cellar under the hall and the kitchen [documented], dug 6 ft below the plinth [assumed] */
export const CELLAR: Rect = [29, 1, 54, 21];
export const CELLAR_FLOOR = -18;

/** Designed ground in ft: the level plinth with its walls, the real slopes beyond it, the garage's pad. */
export function groundFt(x: number, z: number): number {
  if (inRect(x, z, CELLAR)) return CELLAR_FLOOR * PL;
  if (inRect(x, z, FOUNDATION)) return (Y.LAWN - 3) * PL;
  const real = lotGround(x, z);
  let y: number;
  if (inRect(x, z, PLINTH)) y = onRetainingWall(x, z) ? WALL_FOOT : Y.LAWN * PL;
  else {
    // past a wall the ground falls from its foot within 60 ft; on the open sides from the plinth's edge within 100 ft
    const d = rectDist(x, z, PLINTH);
    const top = wallSide(x, z) ? WALL_FOOT : Y.LAWN * PL;
    y = top + (real - top) * smoothstep(d / (wallSide(x, z) ? 60 : 100));
  }
  if (nearGarage(x, z)) y = GARAGE_Y * PL;
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  return real + (y - real) * smoothstep(e / EDGE);
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

/**
 * the orchard's ground: "tall grass except for a 12 ft mown strip by the drive" [documented]; the mown plinth; leaf litter and
 * moss in the woods [assumed]
 */
const LAWN_GREEN = [0x6f9a4c, 0x78a352, 0x66914a];
const TALL_GRASS = [0x8a9a52, 0x95a35a, 0x7f9049];
const WOODS = [0x5d7a3e, 0x6a7d42, 0x7a6e48, 0x55703a];
const ASPHALT = 0x5c5d5f;
/** the orchard's slope: north of the house, down to the road [documented] */
export const inOrchardGround = (x: number, z: number) => z < PLINTH[1] + 6 && x > -130 && x < 200;

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
    const r = hash2(Math.floor(x / 8), Math.floor(z / 8));
    if (streetAt(x + 0.5, z + 0.5) === 'road') return ASPHALT;
    if (inRect(x, z, PLINTH) || Math.hypot(x - CIRCLE.x, z - CIRCLE.z) < CIRCLE.r + 6)
      return noise2(x * 0.05, z * 0.05) < 0.3 ? LAWN_GREEN[2] : LAWN_GREEN[Math.floor(r * 2)];
    if (inOrchardGround(x, z)) return driveDist(x, z) < DRIVE_HALF + 12 ? LAWN_GREEN[Math.floor(r * 2)] : TALL_GRASS[Math.floor(r * 3)];
    if (rectDist(x, z, PLINTH) < 14) return LAWN_GREEN[Math.floor(r * 3)];
    return WOODS[Math.floor(r * WOODS.length)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : 0x6e5a44),
    });
  return hm;
}

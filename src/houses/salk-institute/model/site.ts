/**
 * The Salk Institute's lot (spec 079): the mesa above the Pacific [documented: level at about 371 ft, USGS 3DEP and the terrain
 * tiles], from the citrus grove's east end to the mesa's edge past the lower landing, where the ground falls toward the canyon
 * [documented: the terrain tiles]. The cut for the three lower storeys [documented: "three floors are below ground"], the light
 * court behind the study towers and the light wells between the outer towers [documented: light wells on both sides of each
 * building], sunk to the lowest lab floor; the plaza level [documented: OSM]; the grove a little below it and the lower
 * landing at the west end [assumed: their levels]; beyond them the real ground, eased in from the lot's edges.
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BASIN1, BASIN2, BLOCK, CHANNEL, COURT, fold, GROVE, GROVE_STEPS, inAny, inRect, inTower, LIGHT_WELLS, LOWER, OUTER_TOWERS,
  PLANTERS, PLAZA, Rect, SOURCE, WEST_STEPS, Y,
} from './layout';
import { LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -40, z0: -230, x1: 440, z1: 230 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS, { service: 6 }, 3);

/** the platform the buildings stand on: the mesa at the plaza's level [documented: level], east to the grove, out to the
 * lawns either side [assumed: its extent] */
export const PLATFORM: Rect = [0, -215, 362, 215];
/** the third basin, on the lower level [documented: OSM way 1124010504, intermittent] */
export const BASIN3: Rect = [324, -4, 331, 4];
/** the retaining wall between the plaza and the lower level, along x = 322 [assumed] */
export const LOWER_WALL_X = 322;

/** the north-wing plan, folded */
const inBlockN = (x: number, z: number) => inRect(x, z, BLOCK) || inAny(x, z, OUTER_TOWERS);
/** inside a lab wing's block or its outer towers */
export const inBlock = (x: number, z: number) => inBlockN(x, fold(z));
/** the sunk light court (behind the study towers) and light wells (between the outer towers) */
export const inCourt = (x: number, z: number) => { const f = fold(z); return inRect(x, f, COURT) && !inTower(x, f); };
export const inWell = (x: number, z: number) => inAny(x, fold(z), LIGHT_WELLS);
export const inPit = (x: number, z: number) => inCourt(x, z) || inWell(x, z);
const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
/** the pits' retaining walls: every cell next to a pit that isn't a pit or the block [assumed: one stud of concrete] */
export const onRing = (x: number, z: number) => !inPit(x, z) && !inBlock(x, z) && N8.some(([dx, dz]) => inPit(x + dx, z + dz));
/** a study tower's plan (either wing) */
export const inStudyTower = (x: number, z: number) => inTower(x, fold(z));
export const inLower = (x: number, z: number) => x > LOWER_WALL_X && inRect(x, z, LOWER);
export const inWestSteps = (x: number, z: number) => inAny(x, z, WEST_STEPS);
/** the retaining wall between the plaza and the lower level (the steps pass through it) */
export const onLowerWall = (x: number, z: number) => x === LOWER_WALL_X && inRect(x, z, LOWER) && !inWestSteps(x, z) && !onRing(x, z);
/** no terrain here: the buildings, the pits and their walls stand on the cut */
export const solid = (x: number, z: number) => inBlock(x, z) || inPit(x, z) || onRing(x, z) || onLowerWall(x, z);

/** the retaining walls' tops: a low parapet over the higher ground beside them [assumed: 3 plates], or the plaza's level under
 * a study tower (whose walls go on up) */
export const PARAPET_H = 3;
export function wallTop(x: number, z: number): number {
  if (inStudyTower(x, z)) return 0;
  let m = -Infinity;
  for (const [dx, dz] of N8) if (!inPit(x + dx, z + dz) && !inBlock(x + dx, z + dz) && !onRing(x + dx, z + dz)) m = Math.max(m, platformTop(x + dx, z + dz));
  return Math.max(m, 0) + PARAPET_H;
}

/** the step's top at x on the west steps: 2 plates down for each stud, from the plaza to the lower level [assumed] */
export const westStepTop = (x: number) => Math.max(Y.LANDING, Math.min(0, -2 * (x - 308)));
/** the grove's steps up to the plaza [documented: OSM way 1124010508; 2 plates each, assumed] */
const groveStepTop = (x: number) => Math.min(0, Y.GROVE + 2 * (x - GROVE_STEPS[0]));

/** the top of the finished ground (paving, travertine, water's bed…) the site and the floors give, in plates, on the platform */
export function platformTop(x: number, z: number): number {
  if (inBlock(x, z)) return Y.LOWEST;
  if (inPit(x, z)) return Y.LOWEST;
  if (inRect(x, z, SOURCE) || inRect(x, z, CHANNEL)) return Y.CHANNEL_WATER;
  if (inRect(x, z, BASIN1)) return Y.BASIN1_WATER;
  if (inRect(x, z, BASIN2)) return Y.BASIN2_WATER;
  if (inRect(x, z, BASIN3)) return Y.LANDING - 1;
  if (inWestSteps(x, z)) return westStepTop(x);
  if (inLower(x, z)) return Y.LANDING;
  if (inRect(x, z, GROVE_STEPS)) return groveStepTop(x);
  if (x < PLAZA[0] && z > -87 && z < 87) return Y.GROVE;
  // beside the west offices the mesa slopes down toward the canyon [documented: the terrain tiles], to the lower level's height
  if (x >= WEST_SLOPE && Math.abs(z + 0.5) > 171) return Math.round((Y.LANDING * (x - WEST_SLOPE)) / (PLATFORM[2] - 1 - WEST_SLOPE));
  return 0;
}
const WEST_SLOPE = 314;
/** the soil's top under it: the paving is a plate, the water's bed is under the water [assumed: depths] */
export function soilTop(x: number, z: number): number {
  if (inRect(x, z, SOURCE) || inRect(x, z, CHANNEL)) return Y.CHANNEL_WATER - 2;
  // the basins' travertine walls stand on the basins' beds
  if (inRect(x, z, grow(BASIN1))) return Y.BASIN1_WATER - 4;
  if (inRect(x, z, grow(BASIN2))) return Y.BASIN2_WATER - 4;
  if (inRect(x, z, BASIN1)) return Y.BASIN1_WATER - 4;
  if (inRect(x, z, BASIN2)) return Y.BASIN2_WATER - 4;
  if (inRect(x, z, BASIN3)) return Y.LANDING - 3;
  return platformTop(x, z) - 1;
}

const grow = (r: Rect): Rect => [r[0] - 1, r[1] - 1, r[2] + 1, r[3] + 1];
const rectDist = (x: number, z: number, r: Rect) => Math.hypot(Math.max(r[0] - x, 0, x - (r[2] - 1)), Math.max(r[1] - z, 0, z - (r[3] - 1)));
const EDGE = 30;

/** Ground (the finished top) in ft: the platform's levels, the real ground beyond it [documented] eased in over 50 ft toward the
 * platform's edge, and the real ground at the lot's edges, eased in over the last 30 ft. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  let d: number;
  const dp = rectDist(x, z, PLATFORM);
  if (dp === 0) d = platformTop(x, z) * PL;
  else {
    const cx = Math.min(Math.max(x, PLATFORM[0]), PLATFORM[2] - 1), cz = Math.min(Math.max(z, PLATFORM[1]), PLATFORM[3] - 1);
    // off the platform's edge: from its level there (the lower landing's past the wings' west end, the grove's east of it)
    const e = (cx >= PLATFORM[2] - 1 ? Y.LANDING : cx < PLAZA[0] && Math.abs(cz) < 87 ? Y.GROVE : 0) * PL;
    d = e + (real - e) * smoothstep(dp / 50);
  }
  const k = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  return real + (d - real) * smoothstep(k / EDGE);
}
export const surfaceFt = groundFt;
/** the terrain's top in plates: on the platform the soil under its paving; off it, the ground in whole bricks */
export function groundPlates(x: number, z: number): number {
  if (rectDist(x, z, PLATFORM) === 0) return soilTop(x, z);
  return Math.round(groundFt(x, z) / PL / 3) * 3;
}

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

/** the mesa's ground [assumed: photographs]: dry grass and sandy soil, the canyon's scrub; the paths' decomposed granite */
export const SOIL = [0xb39a74, 0xa98f6a, 0xbaa47e];
export const DRY_GRASS = [0x9c9a5c, 0xa6a263, 0x8f8e54];
export const SCRUB = [0x6f7a4c, 0x7b8455, 0x8a8a5c];
const DIRT = 0x8a7458;
export const isScrubGround = (x: number, z: number) => x >= 362 || x < -10;

function topColor(x: number, z: number): number {
  const s = streetAt(x, z);
  if (s === 'road') return 0x5c5853;
  if (s === 'pavement') return 0xa89c8a;
  const r = hash2(x >> 3, z >> 3);
  if (isScrubGround(x, z)) return noise2(x * 0.05, z * 0.05) < 0.45 ? SOIL[Math.floor(r * 3)] : SCRUB[Math.floor(r * 3)];
  if (inAny(x, z, GROVE) || inAny(x, z, PLANTERS)) return DIRT;
  return DRY_GRASS[Math.floor(r * 3)];
}

export function buildSite(b: Builder): HeightMap {
  b.setPhase(P.SITE);
  const hm = new HeightMap();
  const { w, d } = hm;
  const solidAt = new Uint8Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const x = ix + TERRAIN.x0, z = iz + TERRAIN.z0, k = iz * w + ix;
      solidAt[k] = solid(x, z) ? 1 : 0;
      hm.top[k] = solidAt[k] ? (inPit(x, z) || inBlock(x, z) ? Y.LOWEST : wallTop(x, z)) : groundPlates(x, z);
    }
  // a terrain cell's bottom: three plates under its top, or as low as a terrain neighbour's top (the pits' walls stand alone)
  const bottom = new Int16Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const k = iz * w + ix;
      if (solidAt[k]) continue;
      let m = hm.top[k];
      for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const jx = ix + dx, jz = iz + dz;
        if (jx < 0 || jz < 0 || jx >= w || jz >= d || solidAt[jz * w + jx]) continue;
        m = Math.min(m, hm.top[jz * w + jx]);
      }
      bottom[k] = Math.min(m, hm.top[k] - 3);
    }
  const tops = new Int32Array(w * d);
  for (let iz = 0; iz < d; iz++) for (let ix = 0; ix < w; ix++) tops[iz * w + ix] = topColor(ix + TERRAIN.x0, iz + TERRAIN.z0);
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) if (!solidAt[k]) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  // in whole bricks down from each cell's top: the platform's tops (under a plate of paving) aren't all on one 3-plate grid, so
  // each of the three alignments is laid in its own pass
  const mod3 = (v: number) => ((v % 3) + 3) % 3;
  for (let y = minY - 2; y < maxY; y++) {
    const r = mod3(y), y1 = y + 3;
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y1, {
      kind: 'brick', sizes: TERRAIN_SIZES, unit: 3,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return !solidAt[k] && mod3(hm.top[k]) === r && y < hm.top[k] && y1 > bottom[k]; },
      color: (x, yy, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return yy + 3 >= hm.top[k] ? tops[k] : DIRT; },
    });
  }
  return hm;
}

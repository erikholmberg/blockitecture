/**
 * The Schindler House's lot (spec 081): flat ground on the Los Angeles flats, level within about a foot round the house
 * [documented: USGS 3DEP], from the next street's back gardens to across Kings Road, from Kings West's south face to Habitat
 * 825's north face [documented: OSM]. The patios' lawns are level with the floor [documented: HABS, "all the terrace patios and
 * the entry slabs are at the same level as the floor"]; the sunken gardens beside them are cut here, in steps of 2 plates
 * [assumed: spec 081 Q4], and grassed with the landscape. Kings Road and its sidewalks are on OSM's line [documented]; their
 * widths are assumed.
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { ARMS, EAST_GARDEN, EAST_PATIO, GUEST_PATIO, inAny, inRect, Rect, WEST_GARDEN, WEST_LAWN, WEST_PATIO, Y } from './layout';
import { LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -60, z0: -16, x1: 190, z1: 90 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
/** Kings Road: a 36 ft carriageway and 8 ft sidewalks [assumed: the research puts the west sidewalk at x ≈ 137] */
export const streetAt = streets(LOT_ROADS, { residential: 18 }, 8);

/** depth into a rect from its nearest edge (0 on the edge row) */
const depthIn = (x: number, z: number, r: Rect) => Math.min(x - r[0], r[2] - 1 - x, z - r[1], r[3] - 1 - z);

/**
 * The lawns' tops in plates, or null where there's no lawn: level with the floor in the patios and west of the west patio; the
 * sunken gardens step down 2 plates a stud to 8 plates (3.2 ft) on the west and 4 (1.6 ft) on the east [assumed: spec 081 Q4,
 * following the 3DEP points: about 3 ft and 1–1.5 ft below the house].
 */
export function lawnTop(x: number, z: number): number | null {
  if (inRect(x, z, WEST_GARDEN)) return -2 * Math.min(depthIn(x, z, WEST_GARDEN) + 1, 4);
  if (inRect(x, z, EAST_GARDEN)) return -2 * Math.min(depthIn(x, z, EAST_GARDEN) + 1, 2);
  if (inAny(x, z, [WEST_PATIO, EAST_PATIO, WEST_LAWN])) return 0;
  return null;
}

const EDGE = 12;
/** Designed ground in ft: the house's level round it, the lawns' soil a plate under their grass, the real ground at the edges. */
export function groundFt(x: number, z: number): number {
  if (inAny(x, z, ARMS) || inRect(x, z, GUEST_PATIO)) return -4 * PL;
  const lawn = lawnTop(x, z);
  const own = lawn !== null ? lawn - 1 : Y.GROUND;
  const real = lotGround(x, z);
  // the north edge is only 16 ft from the house, and the driveway runs along it: there the ground meets the real level in a
  // short bank against Kings West, so the driveway stays level [assumed]
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, (z - TERRAIN.z0) * 3, TERRAIN.z1 - 1 - z);
  return real + (own * PL - real) * smoothstep(e / EDGE);
}
/** the top of the soil (plates); the lawns' grass and the house's slab go on it */
export const groundPlates = (x: number, z: number) => Math.round(groundFt(x, z) / PL);
/** the finished surface in ft, the grass included (the viewer's lot surface) */
export const surfaceFt = (x: number, z: number) => {
  const lawn = lawnTop(x, z);
  if (lawn !== null && !inAny(x, z, ARMS)) return lawn * PL;
  if (inAny(x, z, ARMS) || inRect(x, z, GUEST_PATIO)) return 0;
  return groundFt(x, z);
};

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

/** watered garden grass and the soil under the lawns [assumed: photographs' greens] */
const GRASS = [0x6f9a4c, 0x76a04f, 0x66914a];
const SOIL = 0x6b5a45;
const ASPHALT = [0x4a4c4e, 0x525456];
const PAVEMENT = [0xc2bdb2, 0xbab5aa];

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
      // whole 3-plate layers down from the top, at least one
      bottom[k] = hm.top[k] - 3 * Math.max(1, Math.ceil((hm.top[k] - m) / 3));
    }
  const top = (x: number, z: number) => {
    const s = streetAt(x + 0.5, z + 0.5), r = hash2(Math.floor(x / 4), Math.floor(z / 4));
    if (s === 'road') return ASPHALT[Math.floor(r * 2)];
    if (s === 'pavement') return PAVEMENT[Math.floor(r * 2)];
    if (lawnTop(x, z) !== null) return SOIL;
    return noise2(x * 0.07, z * 0.07) < 0.35 ? GRASS[2] : GRASS[Math.floor(r * 2)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  // every column is whole 3-plate layers below its own top; one pass per top's remainder mod 3
  for (let rem = 0; rem < 3; rem++) {
    const y0 = minY - (((minY - rem) % 3) + 3) % 3;
    for (let y = y0; y < maxY; y += 3)
      b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
        kind: 'brick', sizes: TERRAIN_SIZES,
        mask: (x, z) => {
          const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0), t = hm.top[k];
          return (((t - rem) % 3) + 3) % 3 === 0 && y >= bottom[k] && y < t;
        },
        color: (x, yy, z) => (yy + 3 >= hm.top[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] ? top(x, z) : SOIL),
      });
  }
  return hm;
}

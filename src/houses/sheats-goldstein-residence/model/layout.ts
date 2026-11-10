/**
 * Plan of the Sheats-Goldstein Residence, in studs (1 stud ≈ 1 ft). Spec 040.
 *
 * Model frame: x = real east, z = real south (the city is +z), in ft. The house is built on OSM's own outline (way 388762653,
 * an LA County building outline, exported as LOT_SELF): two triangles joined at their tips [documented: the plans of levels 0
 * and −1 as published (designboom, courtesy of James Goldstein); Architectural Record]. The west triangle holds the bedroom wing;
 * the east one the living room under the coffered roof, the pool along its open south side, and the terrace that runs out to the
 * house's south point over the main bedroom on level −1.
 *
 * No measured drawings are public (spec 040, Q3). [documented] = the published plans, photographs and descriptions, and OSM;
 * [assumed] = what they don't settle (most heights, the furniture, the rooms' exact divisions).
 */
import { LOT_SELF } from './lotTerrain';

export type Rect = [x0: number, z0: number, x1: number, z1: number];
export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];

export function inPoly(x: number, z: number, ring: [number, number][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** the outline's corners: A the west tip, B the north tip, C the join, D, E the east tip, F the south point, G [documented: OSM] */
export const OUTLINE = LOT_SELF[0];
const [A, B, C, D, E, F, G] = OUTLINE;
export const CORNERS = { A, B, C, D, E, F, G };

export const inHouse = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, OUTLINE);
export const onOutline = (x: number, z: number) => inHouse(x, z) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => !inHouse(x + dx, z + dz));
/** which side of the line p→q a cell's centre is on */
const side = (x: number, z: number, p: [number, number], q: [number, number]) => (q[0] - p[0]) * (z + 0.5 - p[1]) - (q[1] - p[1]) * (x + 0.5 - p[0]);

/** the bedroom wing: the west triangle, beyond the join C–G [documented: plan, level 0] */
export const inWest = (x: number, z: number) => inHouse(x, z) && side(x, z, C, G) * side(A[0], A[1], C, G) > 0;
export const inEast = (x: number, z: number) => inHouse(x, z) && !inWest(x, z);
/** the line between the living room and the terrace: G and E lie on it, z ≈ 9 [documented: OSM] */
export const POOL_LINE = 9;
export const inLiving = (x: number, z: number) => inEast(x, z) && z < POOL_LINE;
/** the pool, along the living room's open side [documented: plan; its size assumed] */
export const POOL: Rect = [14, 11, 70, 22];
export const inPool = (x: number, z: number) => inRect(x, z, POOL) && inEast(x, z);
/** level −1 under the terrace: a den, and the main bedroom at the south point with its glass corner [documented: plan, level −1;
 * Wikipedia] */
export const LOWER_Z0 = 26;
export const LOWER_SPLIT = 50;
export const inLower = (x: number, z: number) => inEast(x, z) && z >= LOWER_Z0;

/** heights in plates (0.4 ft); y = 0 is the main floor */
export const Y = {
  FLOOR: 0,
  WING_ROOF: 24, // the bedroom wing's ceiling, 9.6 ft [assumed]
  LOWER: -27, // level −1, 10.8 ft below [assumed]
  CLERESTORY: 16, // the living room's north wall, then glass up to the roof [documented: photographs]
  SLAB: 2,
};
/**
 * The living room's roof rises from the north wall toward the pool and the view [documented: photographs, "inverted V-shaped,
 * deeply coffered"]: its underside, in plates, at row z.
 */
export const ROOF_Z0 = -26;
export const ROOF_Z1 = 24;
export const roofUnder = (z: number) => 24 + Math.round(((z - ROOF_Z0) * 21) / (ROOF_Z1 - ROOF_Z0));
export const inRoof = (x: number, z: number) => inEast(x, z) && z < ROOF_Z1;
/** the coffers: a 6-ft grid of ribs, six round glass skylights in each [documented: "each coffer contains six skylights"] */
export const COFFER = 6;
export const isRib = (x: number, z: number) => ((x % COFFER) + COFFER) % COFFER === 0 || ((z % COFFER) + COFFER) % COFFER === 0;
export const isSkylight = (x: number, z: number) => {
  const a = ((x % COFFER) + COFFER) % COFFER, b = ((z % COFFER) + COFFER) % COFFER;
  return (a === 1 || a === 3 || a === 5) && (b === 2 || b === 4);
};
/** the roof's two columns on the open side [assumed] */
export const COLUMNS: [number, number][] = [[24, 8], [62, 8]];

/** the tennis court, on its podium down the slope to the east [documented: Wikipedia; place and size assumed] */
export const COURT: Rect = [92, 30, 198, 84];
export const COURT_Y = -75;

export const CENTER = { x: 20, y: 4, z: 0 };
export const SITE = { lat: 34.0934725, lon: -118.4345323, rotationDeg: 0 };

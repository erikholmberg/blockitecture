/**
 * Plan of Case Study House #22, in studs (1 stud ≈ 1 ft). +x = east, +z = south.
 *
 *   The L: bedroom wing runs north–south on the street (west) side; the
 *   living/dining/kitchen wing runs east along the south, cantilevering
 *   past the cliff edge. The pool sits inside the L. The service area
 *   (master bath, dressing) is in the outer (south-west) corner.
 *   Steel columns on a 20 ft module.
 */
export const Y = {
  GROUND: 0,
  FLOOR: 2, // top of floor tiles
  WALL_TOP: 26, // underside of headers
  BEAM_TOP: 29,
  DECK_TOP: 30,
  ROOF_TOP: 31,
  POOL_BOTTOM: -12,
};

export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const LIVING: Rect = [20, 30, 70, 50];
export const CORNER: Rect = [0, 30, 20, 50];
export const BEDROOMS: Rect = [0, -10, 20, 30];
export const HOUSE: Rect[] = [LIVING, CORNER, BEDROOMS];

export const ROOF: Rect[] = [
  [-2, 23, 77, 57],
  [-2, -36, 27, 23],
];

export const CLIFF_X = 56; // plateau ends here on the east; living wing cantilevers beyond
export const PLATEAU: Rect = [-34, -64, CLIFF_X, 53];

export const POOL_MAIN: Rect = [30, 2, 54, 22];
export const POOL_INLETS: Rect[] = [
  [32, 22, 36, 28],
  [44, 22, 48, 28],
];
export const TERRACE: Rect = [20, -14, CLIFF_X, 30];
export const CARPORT: Rect = [-2, -38, 26, -10];
/** Driveway from the carport west to the lot edge, where it meets the real Woods Drive (spec 004). */
export const DRIVE: Rect = [-112, -30, -2, -14];

export function inRect(x: number, z: number, r: Rect) {
  return x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
}
export function inAny(x: number, z: number, rs: Rect[]) {
  for (const r of rs) if (inRect(x, z, r)) return true;
  return false;
}
export function inPool(x: number, z: number) {
  return inRect(x, z, POOL_MAIN) || inAny(x, z, POOL_INLETS);
}

/** Signed distance from point to a rounded rectangle (negative inside). */
export function sdRoundRect(x: number, z: number, r: Rect, radius: number) {
  const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
  const hx = (r[2] - r[0]) / 2 - radius, hz = (r[3] - r[1]) / 2 - radius;
  const qx = Math.abs(x - cx) - hx, qz = Math.abs(z - cz) - hz;
  const ox = Math.max(qx, 0), oz = Math.max(qz, 0);
  return Math.hypot(ox, oz) + Math.min(Math.max(qx, qz), 0) - radius;
}

/** House centre used by cameras. */
export const CENTER = { x: 32, y: 6, z: 12 };

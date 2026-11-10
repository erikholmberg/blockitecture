/**
 * Plan of the Koshino House, in studs (1 stud ≈ 1 ft). Spec 039.
 *
 * Model frame: x along the two boxes (+x = real west-south-west, toward the lawn and the street's corner), z across them
 * (+z = real north-north-west, up the slope). The long one-storey bedroom wing lies downhill (z 0…18), the two-storey living
 * wing above it (z 30…48), the courtyard of steps between them, and Ando's fan-shaped studio of 1984 sunk into the hill beyond
 * the living wing. The real world is turned to fit OSM's two outlines (ways 259408268 and 259408269).
 *
 * No measured drawings are public (spec 039, Q2). [documented] = the published plans, section and aerial photograph (ArchDaily's
 * AD Classics; Arquitectura Viva), OSM's outlines and the published descriptions; sizes are scaled from OSM (the bedroom wing 23.8
 * × 5.5 m, about 78 × 18 ft) and the section, and checked against Ando's 1.8 × 0.9 m formwork panel. [assumed] = what those don't
 * settle (most heights within a panel, the furniture, the doors).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));
export const onEdge = (x: number, z: number, r: Rect) => inRect(x, z, r) && (x === r[0] || x === r[2] - 1 || z === r[1] || z === r[3] - 1);

/** heights in plates (0.4 ft); y = 0 is the floor of both wings and the courtyard [documented: the section shows one floor level] */
export const Y = {
  FLOOR: 0,
  BED_ROOF: 28, // the bedroom wing, one storey: 11.2 ft to the roof [documented: section, about 3.4 m]
  UPPER: 25, // the living wing's upper floor, over the kitchen and dining room, 10 ft up [assumed]
  LIV_ROOF: 50, // the living wing, two storeys: 20 ft [documented: section, about 6 m]
  TERRACE: 28, // the living wing's roof terrace, at its lower end, inside its full-height walls [documented: aerial photograph]
  STUDIO_ROOF: 36, // the studio: 14.4 ft, its roof near the slope above [documented: section; height assumed]
  LAWN: 30, // the lawn at the house's west end, level with the bedroom wing's roof [documented: aerial photograph]
  SLAB: 2, // the roof slabs, 0.8 ft
};

/** the bedroom wing: one storey, 23.8 × 5.5 m [documented: OSM way 259408269] */
export const BED: Rect = [0, 0, 78, 18];
/** the living wing: two storeys, 16 × 5.2 m, set toward the west end, 11 ft from the bedroom wing [documented: OSM way 259408268] */
export const LIVING: Rect = [31, 29, 84, 46];
/** the courtyard between them: a flat floor, then wide steps up to the lawn [documented: aerial photograph and section] */
export const COURT: Rect = [0, 18, 78, 29];
export const STEPS_X0 = 58; // the steps begin here and climb ten steps to the lawn at x = 78 [assumed: the count]
export const STEPS_X1 = 78;
/** inside the living wing: the double-height living room, then the kitchen and dining room under the upper floor, then the
 * roof terrace over the lower end [documented: plans; aerial photograph] */
export const LIVING_ROOM: Rect = [32, 30, 55, 45];
export const DINING: Rect = [55, 30, 67, 45];
export const LOW_END: Rect = [67, 30, 83, 45];
/** the underground corridor between the wings, under the courtyard's steps [documented: "joined underground"] */
export const TUNNEL: Rect = [70, 18, 75, 29];
/** inside the corridor, between its walls */
export const inTunnel = (x: number, z: number) => x > TUNNEL[0] && x < TUNNEL[2] - 1 && z >= TUNNEL[1] && z < TUNNEL[3];
/** the bedrooms: six in a row along the wing's downhill side, a corridor along the courtyard [documented: six children's rooms] */
export const BEDROOMS: Rect[] = Array.from({ length: 6 }, (_, i) => [1 + 12 * i, 1, 13 + 12 * i, 12] as Rect);
export const BED_CORRIDOR: Rect = [1, 12, 77, 17];

/**
 * The studio of 1983–84: a fan along the living wing's uphill side. Its arc is centred on the wing's downhill wall and sweeps
 * from the west end (+x) round to a straight wall heading up the slope [documented: OSM's outline of way 259408268, the aerial
 * photograph; the radius, about 10 m, from OSM].
 */
export const STUDIO = { cx: 52, cz: 29, r: 34, a1: (115 * Math.PI) / 180 };
export function inStudio(x: number, z: number) {
  const dx = x + 0.5 - STUDIO.cx, dz = z + 0.5 - STUDIO.cz;
  if (z < LIVING[3] || Math.hypot(dx, dz) > STUDIO.r) return false;
  const a = Math.atan2(dz, dx);
  return a >= 0 && a <= STUDIO.a1;
}
export const STUDIO_BOX: Rect = [37, LIVING[3], 86, 64];

/** the lawn at the west end, held by a long L-shaped wall [documented: aerial photograph] */
export const LAWN: Rect = [78, 0, 100, 70];
export const LAWN_WALL: Rect[] = [[78, -1, 101, 0], [100, -1, 101, 70]];

/** the whole house, for the roof cut and the fit */
export const HOUSE: Rect = [0, 0, 86, 64];
export const CENTER = { x: 46, y: 6, z: 32 };
export const SITE = { lat: 34.77418, lon: 135.28497, rotationDeg: -164 };

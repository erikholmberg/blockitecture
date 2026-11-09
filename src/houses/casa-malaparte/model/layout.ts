/**
 * Plan of Casa Malaparte, in studs (1 stud ≈ 1 ft). Spec 031.
 *
 * Model frame: x along the house's axis, from the foot of the stair on the land (x = 0, WNW) to the sea end (x = 177, ESE);
 * z across it, north at −z. The real world is turned −28° to fit OSM's outline (way 752097981, IoU 0.878).
 *
 * [documented] = OSM's outline (the house 34 × 9 m; the stair a 20-m wedge from 2.8 m at its foot to 9 m at the roof), or the
 * research in spec 031; [assumed] = read from photographs (Wikimedia Commons: Eoghanacht CC0; Jerzy Strzelecki, Wolfgang
 * Moroder, FriedrichFrisch CC BY-SA; Ernest Delaville CC BY 2.0), no plans being available: heights, windows, rooms.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

/** heights in plates; y = 0 is the lower floor, about 32 m above the sea [documented: spec 031] */
export const Y = {
  LOWER: 0,
  UPPER: 30, // the upper floor, 12 ft up [assumed: photographs, two storeys]
  ROOF: 63, // the roof terrace, 25.2 ft [assumed]
  SEA: -263, // sea level: 32 m = 105 ft below the lower floor [documented]
  WALL: 15, // the white curving wall on the roof stands 6 ft [assumed]
};

/** the house: 34 × 9 m [documented: OSM] */
export const HOUSE: Rect = [66, -15, 177, 15];
/** the stair: an inverted pyramid, 20 m long, 2.8 m wide at its foot, 9 m at the roof [documented: OSM; "inverted pyramid"] */
export const STAIR_X: [number, number] = [0, 66];
/** its width at the foot and at the top, in studs: 2.8 m and 9 m [documented: OSM] */
export const STAIR_W: [number, number] = [9, 30];
export const STEPS = 21; // 63 plates in 3-plate risers [assumed]
export interface Step { x0: number; x1: number; z0: number; z1: number; top: number }
/** step i (0 at the foot): its plan, one stud or more wider than the step below, and the height of its tread's top in plates */
export function step(i: number): Step {
  const run = (STAIR_X[1] - STAIR_X[0]) / STEPS;
  const w = STAIR_W[0] + Math.round(((STAIR_W[1] - STAIR_W[0]) * i) / (STEPS - 1));
  const z0 = -Math.floor(w / 2);
  return { x0: STAIR_X[0] + Math.round(i * run), x1: STAIR_X[0] + Math.round((i + 1) * run), z0, z1: z0 + w, top: Y.LOWER + 3 * (i + 1) };
}
export const STAIR: Step[] = Array.from({ length: STEPS }, (_, i) => step(i));

/** the white curving wall on the roof terrace: an arc about its centre [documented: the wall; its position and curve assumed] */
export const ROOF_WALL = { cx: 138, cz: 2, r: 9, from: -0.15 * Math.PI, to: 0.75 * Math.PI };

/** the living room fills the upper floor's sea end; its fireplace in the end wall, its back of glass onto the sea [documented] */
export const LIVING: Rect = [118, -14, 176, 14];
export const FIREPLACE: Rect = [174, -3, 176, 3];

/** house centre: camera target and where the promontory wave starts */
export const CENTER = { x: 120, y: 10, z: 0 };

/** Where the house is in the real world: OSM's "Casa Malaparte" (wikidata Q2165447), turned −28°. */
export const SITE = { lat: 40.547007, lon: 14.259007, rotationDeg: -28 };

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));
/** inside the stair's wedge (plan) */
export const inStair = (x: number, z: number) => STAIR.some((s) => x >= s.x0 && x < s.x1 && z >= s.z0 && z < s.z1);

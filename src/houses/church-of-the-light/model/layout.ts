/**
 * Plan of the Church of the Light, in studs (1 stud ≈ 1 ft). Spec 055.
 *
 * Model frame: x along the chapel from the entrance end (x = 0) to the altar end (+x = real about 154°, south-south-east, the way
 * the cross faces); z across it (+z = real about 244°, west-south-west, toward the Sunday School). The real world is turned −60.5° to
 * fit OSM's outline (way 597276853). The chapel is a concrete box of three 5.9 m cubes, cut through at 15° by a free-standing wall,
 * with the cross cut through the altar wall; the floor steps down to the altar one pew row at a time.
 *
 * [documented] = Tadao Ando Architect & Associates' 1:50 plan (gridlines 18,000 × 6,280 mm; inside 17,700 × 5,900; the 15°
 * wall; the pews; the floor's levels; the formwork), Wikipedia (5.9 m cubes, 38 cm walls), OSM's outline;
 * [assumed] = what those don't settle (the cross's horizontal arm's height, the outside walls' heights, the furniture).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];

/** the box's outside: 61 × 23 ft (18.6 × 7.0 m) [documented: 18.3 × 6.66 m outside] */
export const BOX: Rect = [0, 0, 61, 23];
/** inside: 57 × 19 ft (17.4 × 5.8 m) [documented: 17,700 × 5,900 mm]. The walls are two studs thick, so the inside can be in
 * shadow while the outside is in the sun (blocks show one colour on both faces); the real walls are 38 cm [documented] */
export const INSIDE: Rect = [2, 2, 59, 21];
export const ALTAR_WALL_X = 59;
export const ENTRANCE_WALL_X = 0;
/** the wall's inner layer, next to the room */
export const INNER: Rect = [1, 1, 60, 22];
/** the cross's vertical slit: the middle stud of the altar wall [documented: 2,850 + 200 + 2,850 mm] */
export const SLIT_Z = 11;

/** heights in plates (0.4 ft); y = 0 is the ground at the entrance */
export const Y = {
  PAD: -12, // the foundation's top… its bottom
  BASE: -9, // the floor's concrete base and the walls' foot
  ENTRY: 1, // the entrance floor's top: +150 mm [documented]
  ALTAR: -8, // the altar's floor: −950 mm [documented], a drop of 9 plates (1.1 m)
  CEILING: 49, // the roof's underside: 5.9 m above the entrance floor [documented]
  TOP: 53, // the roof's top
  /** the cross's horizontal arm [assumed: photographs, about three fifths of the way up the wall] */
  ARM: [25, 28] as [number, number],
};

/** the pews: 12 rows at 900 mm [documented: the plan; pitch 3 studs], each row a step lower toward the altar [documented] */
export const ROWS = 12;
export const ALTAR_AREA_X = 49; // the altar's area: 3.1 m in front of the first row [documented: 3,450 mm on the plan, rounded]
export const rowX0 = (k: number) => ALTAR_AREA_X - 3 * (k + 1);
/** the floor's top at x: the altar's area, then one plate up per row, the last rows level with the entrance [documented] */
export function floorTop(x: number): number {
  if (x >= ALTAR_AREA_X) return Y.ALTAR;
  const k = Math.floor((ALTAR_AREA_X - 1 - x) / 3);
  return Math.min(Y.ALTAR + 1 + k, Y.ENTRY);
}

/**
 * The free-standing wall at 15° [documented: 15°, 280 mm thick]. It crosses the long wall on the Sunday School's side 5.1 m from
 * the altar end, ends inside 15.4 m from the altar end near the middle, and runs on outside to an L-shaped wall 1.7 m past the
 * altar end [documented: the 1:50 plan]. A short stub on its line passes through the entrance wall [documented].
 */
const TAN = Math.tan((15 * Math.PI) / 180);
export const CROSSING = { x: 42.3, z: 22 };
export const diagZ = (x: number) => CROSSING.z + (x - CROSSING.x) * TAN;
export const DIAG = { x0: 8.5, x1: 65.6 };
export const STUB = { x0: -4, x1: 4 };
/** the L-shaped wall beyond the altar end [documented], from the long wall on the street side to the 15° wall */
export const L_WALL_X = 66;
export const onDiag = (x: number, z: number, x0: number, x1: number) =>
  x + 0.5 >= x0 && x + 0.5 < x1 && Math.abs(z + 0.5 - diagZ(x + 0.5)) < 0.75;

/** the glazed slot in the long wall where the 15° wall passes inside [documented: about 6 to 14.5 m from the altar end] */
export const SLOT = { x0: 12, x1: 40 };
/** the double door at the entrance end, beside the stub [documented: a 1.5 m double door; its height assumed] */
export const DOOR = { z0: 12, z1: 17, top: 22 };
/** the walls' courses run from the altar's floor up, three plates each: openings start on a course */
export const courseUp = (y: number) => Y.ALTAR + 3 * Math.ceil((y - Y.ALTAR) / 3);

/** the formwork: 1,800 × 900 mm panels, three tie holes a row, two rows a panel [documented] */
export const tieHole = (u: number, y: number) => (((u % 2) + 2) % 2 === 1) && [2, 5, 10, 13].includes(((y % 15) + 15) % 15);
export const panel = (u: number, y: number) => (Math.floor(u / 6) + Math.floor(y / 7.5)) & 1;

export const CENTER = { x: 30, y: 8, z: 11 };
export const SITE = { lat: 34.81854, lon: 135.537195, rotationDeg: -60.5 };

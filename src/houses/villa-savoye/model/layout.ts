/**
 * Plan of the Villa Savoye, in studs (1 stud ≈ 1 ft). Spec 074.
 *
 * Model frame: x from the north-west entrance front (x = 0, real about 324.7°) to the south-east end (+x = real about 144.7°,
 * toward the gate); z from the north-east long side (z = 0, real about 54.7°) to the south-west long side (+z = real about
 * 234.7°). The real world is turned −55° to fit OSM's outline (way 38327851). y in plates (0.4 ft); y = 0 is the lawn.
 *
 * Sources (spec 074, Research): [documented] = the Cité de l'architecture's fact sheet (areas, the 4.75 m grid, the rooms, the
 * colours), the CMN (the dark green ground floor, the roof garden, the solarium's screen), en/fr.wikipedia (21.50 × 19 m, 9.40 m
 * high, the pilotis flush on the long sides, the baby piloti), OSM (the outline, the lodge, the drive). No plan or section was
 * scaled (spec 074 Q1/Q3: the FLC's drawings need its permission), so everything else is [assumed], from the documented areas
 * and photographs. Nothing here is [scaled].
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const onRing = (x: number, z: number, r: Rect) => inRect(x, z, r) && (x === r[0] || z === r[1] || x === r[2] - 1 || z === r[3] - 1);

/** one bay of the grid: 4.75 m [documented] drawn as 16 studs (4.88 m, +2.7%: spec 074 Q2) */
export const BAY = 16;
/** the white box: 73 × 65 studs (22.3 × 19.8 m; documented 21.50 × 19 m, OSM 21.4 × 18.7 m) on the 16-stud grid */
export const HOUSE: Rect = [0, 0, 73, 65];
/** the 25 pilotis, a 5 × 5 grid [documented]: flush with the long façades (z = 0, 64) [documented], set back 4 studs (1.22 m;
 * documented 1.25 m) from the short ones */
export const PILOTI_X = [4, 20, 36, 52, 68];
export const PILOTI_Z = [0, 16, 32, 48, 64];
export const PILOTIS: [number, number][] = PILOTI_X.flatMap((x) => PILOTI_Z.map((z) => [x, z] as [number, number]));

/** heights in plates [assumed, spec 074: no section obtained], except the solarium screen's top [documented: 9.40 m] */
export const Y = {
  LAWN: 0,
  SLAB: 24, // the first floor's slab, underside [assumed]
  FIRST: 27, // the first floor, 10.8 ft (3.2 m assumed)
  SILL: 35, // the ribbon window, 1.0 m above the first floor [assumed]
  HEAD: 44, // … to 2.1 m [assumed]
  CEILING: 50,
  ROOF: 53, // the roof garden, 21.2 ft (6.4 m assumed)
  PARAPET: 60, // the box's top edge [assumed]
  SOLARIUM: 77, // the solarium screen's top, 30.8 ft: 9.40 m [documented]
  GF_HEAD: 18, // the ground floor's windows and doors [assumed]
};

/**
 * The ground floor: recessed behind the long sides' pilotis so the drive passes under the box on both sides [documented], its
 * north-west end a semicircle of glass round the hall [documented], of radius one bay [assumed: 16 studs, 4.9 m]. Its walls run
 * along the inner rows of pilotis (z = 16 and 48) [assumed].
 */
export const CURVE = { cx: 32.5, cz: 32.5, r: 16.5 };
export function inGround(x: number, z: number): boolean {
  const px = x + 0.5, pz = z + 0.5;
  if (x > 72 || z < 16 || z > 48) return false;
  if (px >= CURVE.cx) return true;
  return Math.hypot(px - CURVE.cx, pz - CURVE.cz) < CURVE.r;
}
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
/** the ground floor's outer wall: its cells next to a cell outside it */
export const onGroundEdge = (x: number, z: number) => inGround(x, z) && N4.some(([dx, dz]) => !inGround(x + dx, z + dz));
/** the curved part: glass [documented] */
export const onCurve = (x: number, z: number) => onGroundEdge(x, z) && x + 0.5 < CURVE.cx;

/** the ground floor's rooms [documented: the list; their places assumed] */
export const HALL_BAND: Rect = [32, 27, 54, 39]; // the hall beyond the curve, round the ramp: with it, 60 m² [documented]
export const GARAGE: Rect = [55, 27, 72, 48]; // for three cars [documented], its doors on the south-west side [assumed]
export const GROUND_PARTS: Rect[] = [
  [32, 17, 33, 26], // hall | first maid's room
  [33, 26, 72, 27], // the north-east rooms | hall, garage
  [43, 17, 44, 26], // the maids' rooms
  [53, 17, 54, 26], // maid | laundry
  [62, 17, 63, 26], // laundry | WC & store
  [32, 39, 54, 40], // hall | chauffeur's flat
  [32, 40, 33, 48],
  [54, 27, 55, 48], // hall, flat | garage
];
export const GROUND_DOORS: Rect[] = [
  [32, 21, 33, 24], [37, 26, 40, 27], [47, 26, 50, 27], [57, 26, 60, 27], [65, 26, 68, 27], [40, 39, 43, 40], [54, 33, 55, 36],
];
/** the entrance: glass doors in the middle of the curve, facing the drive [assumed] */
export const ENTRANCE: [z0: number, z1: number] = [30, 35];
/** the garage doors in the south-west wall (z = 48) [assumed] */
export const GARAGE_DOORS: [x0: number, x1: number] = [56, 71];

/**
 * The ramp [documented: in the middle of the hall, in two parallel flights, starting inside and finishing outside on the roof]:
 * two flights from the hall to the first floor and two from the first floor to the roof, one plate per step of 2 studs
 * [assumed: the slope, 1 in 5], 4 studs wide [assumed], either side of the middle row of pilotis.
 */
export const RAMP = { x0: 22, x1: 50, landing: [50, 54] as [number, number], a: [33, 37] as [number, number], b: [28, 32] as [number, number] };
export type Flight = { z: [number, number]; x0: number; x1: number; dir: 1 | -1; from: number; to: number };
/** each flight: its cells x0…x1−1, rising from `from` toward `to` in the direction `dir` (one plate per 2 studs) */
export const FLIGHTS: Flight[] = [
  { z: RAMP.a, x0: 22, x1: 50, dir: 1, from: 0, to: 14 }, // the hall → the landing
  { z: RAMP.b, x0: 24, x1: 50, dir: -1, from: 14, to: 27 }, // the landing → the first floor
  { z: RAMP.a, x0: 24, x1: 50, dir: 1, from: 27, to: 40 }, // the first floor → the outer landing
  { z: RAMP.b, x0: 24, x1: 50, dir: -1, from: 40, to: 53 }, // the outer landing → the roof garden
];
/** a flight's top at x, in plates */
export function flightTop(f: Flight, x: number): number {
  const i = f.dir === 1 ? x - f.x0 : f.x1 - 1 - x;
  return f.from + 1 + Math.floor(i / 2);
}
export const LANDINGS = [14, 40];
/** the ramp's well through the first floor and the roof */
export const WELL: Rect = [24, 28, 54, 37];

/** the helical stair beside the ramp [documented], from the hall to the first floor, 5 studs across [assumed] */
export const STAIR = { cx: 25, cz: 22, hole: [23, 20, 28, 25] as Rect };

/**
 * The first floor [documented: the living room on the north-west, 84 m², light blue, pink and white; the terrace on the south,
 * open to the sky, with sliding glass to the living room; the kitchen; the bedrooms with built-in storage; the bathrooms]. The
 * rooms' places are [assumed] from photographs and those notes.
 */
export const LIVING: Rect = [1, 38, 37, 64]; // 36 × 26 studs, 87 m²
export const TERRACE: Rect = [38, 38, 72, 64];
export const LANDING_HALL: Rect = [1, 20, 24, 37];
export const KITCHEN: Rect = [1, 1, 16, 19];
export const ROOMS: { name: string; r: Rect }[] = [
  { name: 'kitchen', r: KITCHEN },
  { name: 'pantry', r: [17, 1, 24, 19] },
  { name: "the son's room", r: [25, 1, 38, 19] },
  { name: 'bathroom', r: [39, 1, 46, 19] },
  { name: 'bedroom', r: [47, 1, 62, 19] },
  { name: 'main bathroom', r: [63, 1, 72, 19] },
  { name: 'boudoir', r: [55, 20, 72, 37] },
];
/** partitions on the first floor: [rect, colour key]; doorways cut by FIRST_DOORS */
export const FIRST_PARTS: { r: Rect; c: 'white' | 'blue' | 'pink' | 'tile' }[] = [
  { r: [16, 1, 17, 19], c: 'tile' }, // kitchen | pantry
  { r: [24, 1, 25, 19], c: 'white' },
  { r: [46, 1, 47, 19], c: 'white' },
  { r: [62, 1, 63, 19], c: 'white' },
  { r: [1, 19, 72, 20], c: 'white' }, // the rooms | the corridor and landing
  { r: [24, 27, 54, 28], c: 'white' }, // the corridor | the ramp
  { r: [54, 20, 55, 37], c: 'white' }, // the corridor, the ramp | the boudoir
  { r: [1, 37, 22, 38], c: 'blue' }, // the landing | the living room
  { r: [22, 37, 37, 38], c: 'pink' }, // the ramp | the living room
];
/** between the son's room and the bathroom, and the bathroom and the bedroom: built-in storage at head height that also
 * forms the partition [documented] */
export const STORAGE_PARTS: Rect[] = [[38, 1, 39, 19]];
export const FIRST_DOORS: Rect[] = [
  [10, 19, 13, 20], [19, 19, 22, 20], [30, 19, 33, 20], [41, 19, 44, 20], [52, 19, 55, 20], [66, 19, 69, 20],
  [54, 22, 55, 25], [6, 37, 18, 38], [38, 8, 39, 11],
];
/** the glass: the living room's sliding wall onto the terrace [documented], and the ramp's and the boudoir's onto it [assumed] */
export const SLIDING: Rect[] = [[37, 38, 38, 64], [37, 37, 72, 38]];

/** the roof: the roof garden [documented: 110 m²] at the north-west end, round the solarium [documented: 70 m²] */
export const GARDEN: Rect = [1, 1, 33, 64];
/** the solarium's curved screens [documented: mainly curved walls, sheltering it from the wind]: a quarter circle round the
 * north corner, the straight north-west wall with the opening, a half circle closing it toward the south-west [assumed] */
export const SOL_A = { cx: 14.5, cz: 14.5, r: 14.5 };
export const SOL_B = { cx: 8.5, cz: 30.5, r: 8.5 };
export const SOL_X1 = 22;
export function inSolarium(x: number, z: number): boolean {
  const px = x + 0.5, pz = z + 0.5;
  if (x < 0 || z < 0 || x >= SOL_X1) return false;
  if (px < SOL_A.cx && pz < SOL_A.cz) return Math.hypot(px - SOL_A.cx, pz - SOL_A.cz) < SOL_A.r;
  if (pz < SOL_B.cz) return true;
  return Math.hypot(px - SOL_B.cx, pz - SOL_B.cz) < SOL_B.r;
}
/** the screens: the solarium's edge cells, except its open side toward the roof garden (x ≥ 17 below arc A) */
export function onScreen(x: number, z: number): 'A' | 'B' | 'straight' | null {
  if (!inSolarium(x, z)) return null;
  if (!N4.some(([dx, dz]) => !inSolarium(x + dx, z + dz))) return null;
  const px = x + 0.5, pz = z + 0.5;
  if (px < SOL_A.cx && pz < SOL_A.cz) return 'A';
  if (pz > SOL_B.cz) return px <= SOL_B.cx + SOL_B.r ? 'B' : null;
  if (x === 0) return 'straight';
  if (z === 0 && x < 17) return 'straight';
  return null;
}
/** the "trou dans le mur": a rectangular opening in the screen framing the Seine to the north-north-west [documented] */
export const SOL_OPENING = { x: 0, z: [17, 29] as [number, number], y: [60, 70] as [number, number] };
/** the roof garden's fixed concrete table [documented] and its planters [documented; places assumed] */
export const TABLE: Rect = [8, 46, 15, 49];
export const PLANTERS: Rect[] = [[1, 60, 33, 63], [30, 40, 33, 58], [26, 3, 33, 6]];

/** the gardener's lodge [documented: OSM way 410063805, 7.0 × 4.1 m; three blind walls and one long window on its south
 * front], squared to the villa's grid (spec 074 Q5) at its OSM centre (250, −176.6) */
export const LODGE: Rect = [239, -184, 262, -170];
export const LODGE_Y = { WALL: 22, ROOF: 25, SILL: 7, HEAD: 16 };

export const CENTER = { x: 36, y: 12, z: 32 };
export const SITE = { lat: 48.924445, lon: 2.028229, rotationDeg: -55 };

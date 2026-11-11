/**
 * Plan of the Haus am Horn, in studs (1 stud ≈ 1 ft). Spec 063.
 *
 * Model frame = the 1923 ground plan: x from the entrance front (x = 0, the plan's "north", real about 339°) to the opposite
 * front (+x = real about 159°); z from the dining room's side (z = 0, real about 69°) to the street's side, toward Am Horn and
 * the park on the Ilm (+z = real about 249°). The real world is turned −69° to fit OSM's outline (way 35984274). A square
 * house: a tall living room exactly in the middle, lit by clerestory windows over the roofs of the ring of small rooms round it.
 *
 * [documented] = the published dimensions (12.70 × 12.70 m; the living room 6 × 6 m and 4.14 m high), the rooms and their
 * makers (de.wikipedia, the Bauhaus Kooperation); [scaled] = read off the redrawn 1923 plan and elevations (Rintallo 2023,
 * ±0.1 m); [assumed] = what those don't settle.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const onRing = (x: number, z: number, r: Rect) => inRect(x, z, r) && (x === r[0] || z === r[1] || x === r[2] - 1 || z === r[3] - 1);

/** the house: 12.70 m square [documented] */
export const HOUSE: Rect = [0, 0, 42, 42];
/** the living room's block in the middle: 6.8 m outside [scaled], the room 6 × 6 m [documented] */
export const CORE: Rect = [10, 10, 32, 32];
export const LIVING: Rect = [11, 11, 31, 31];

/** heights in plates (0.4 ft); y = 0 is the floor, about 0.3 m above the ground at the entrance [scaled] */
export const Y = {
  GROUND: -3,
  RING_CEILING: 21, // the outer rooms, about 2.5 m [scaled; 2.30 m documented]
  RING_ROOF: 26, // the outer roof's edge, about 3.4 m above the ground [scaled]
  CEILING: 34, // the living room, 4.14 m [documented]
  ROOF: 39, // the middle block's top, about 5.05 m above the ground [scaled]
  CHIMNEY: 45, // about 5.75 m above the ground [scaled]
  SILL: 9, // the windows: sills about 1.15 m above the floor, heads at about 2.3 m [scaled, to a block course]
  HEAD: 18,
};

/** the windows and doors of the four fronts, as runs along each [scaled: the plan and the two published elevations] */
export const OPENINGS = {
  /** the entrance front (x = 0), by z: the pantry's and the lavatory's windows, the front door, the stair's window */
  north: { windows: [[10, 11], [14, 18], [26, 28]] as [number, number][], door: [19, 23] as [number, number] },
  /** the dining room's side (z = 0), by x: the kitchen's and the dining room's windows, the children's room's garden door */
  east: { windows: [[4, 9], [14, 21]] as [number, number][], door: [23, 27] as [number, number] },
  /** the far front (x = 41), by z: the children's room's, the lady's room's and the bathroom's windows */
  south: { windows: [[6, 10], [18, 26], [32, 36]] as [number, number][] },
  /** the street's side (z = 41), by x: the guest room's, the niche's and the man's room's windows */
  west: { windows: [[4, 8], [14, 20], [24, 28]] as [number, number][] },
};
/** the clerestory: on the far front's and the street's sides of the middle block only [documented], 5.1 m wide [scaled] */
export const CLERESTORY: [number, number] = [13, 29];

/** the ring's partitions, as [x0, z0, x1, z1] one stud thick, each with a doorway [scaled: the plan; the doorways assumed] */
export const PARTITIONS: { r: Rect; door: Rect }[] = [
  { r: [12, 1, 13, 10], door: [12, 6, 13, 9] }, // kitchen | dining room
  { r: [22, 1, 23, 10], door: [22, 6, 23, 9] }, // dining room | children's room
  { r: [32, 12, 41, 13], door: [36, 12, 39, 13] }, // children's room | lady's room
  { r: [32, 26, 41, 27], door: [33, 26, 36, 27] }, // lady's room | bathroom
  { r: [34, 32, 35, 41], door: [34, 33, 35, 36] }, // bathroom | man's room
  { r: [21, 32, 22, 41], door: [21, 33, 22, 36] }, // man's room | niche
  { r: [12, 32, 13, 41], door: [12, 33, 13, 36] }, // niche | guest room
  { r: [1, 31, 10, 32], door: [6, 31, 9, 32] }, // guest room | cellar stair
  { r: [1, 23, 10, 24], door: [6, 23, 9, 24] }, // stair | entrance
  { r: [1, 18, 10, 19], door: [6, 18, 9, 19] }, // entrance | lavatory
  { r: [1, 12, 10, 13], door: [0, 0, 0, 0] }, // lavatory | pantry
  { r: [1, 9, 10, 10], door: [6, 9, 9, 10] }, // pantry | kitchen
];
/** the living room's doorways: to the entrance, the dining room, the lady's room and the man's room [scaled]; the work niche
 * is open to it [documented] */
export const CORE_DOORS: Rect[] = [[10, 19, 11, 22], [15, 10, 18, 11], [31, 18, 32, 21], [26, 31, 29, 32]];
export const NICHE_OPENING: Rect = [13, 31, 21, 32];

export const CENTER = { x: 21, y: 6, z: 21 };
export const SITE = { lat: 50.973833, lon: 11.33942, rotationDeg: -69 };

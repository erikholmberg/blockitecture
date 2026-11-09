/**
 * Plan of the Kaufmann Desert House, in studs (1 stud ≈ 1 ft). Spec 033.
 *
 * Model frame: x east, z south (the house's walls run within a degree of north–south, so the world isn't turned), in ft, with
 * OSM's outline (way 566015553, IoU 0.915) centred near (60, 75). The San Jacinto Mountains rise to the west (−x).
 *
 * [documented] = OSM's outline and pool, or the research in spec 033 (the pinwheel, the stone, the thin roofs, the gloriette
 * and its louvres, the pool). [assumed] = which wing holds which rooms, the heights and the details, read from the published
 * plan diagram and photographs (the Library of Congress's public-domain photograph, LCCN 2013631255; Wikimedia Commons): no
 * measured drawings are online.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

/** heights in plates (0.4 ft); y = 0 is the floor, a course above the desert [assumed] */
export const Y = {
  FLOOR: 0,
  CEILING: 21, // 8.4 ft: Neutra's low ceilings [assumed: photographs]
  ROOF: 24, // the roof's top: thin flat roofs, a single course [documented: thin; thickness assumed]
  GLORIETTE: 44, // the gloriette's canopy, 8 ft above the roof [assumed]
  POOL: -2, // the water's surface, just under the pool's coping [assumed]
  POOL_FLOOR: -12,
};

/** The wings, each the roof's outline from OSM [documented]; their rooms [assumed: published plan diagram] */
export const LIVING: Rect = [43, 67, 99, 100]; // the living and dining room, the pinwheel's centre
export const MASTER: Rect = [99, 57, 130, 84]; // the master bedroom wing, east, onto the pool
export const WALK: Rect = [51, 24, 64, 67]; // the covered walk north to the guest wing
export const GUEST: Rect = [58, 17, 84, 43]; // the guest wing
export const SERVICE: Rect[] = [[2, 64, 51, 84], [2, 84, 31, 95]]; // the kitchen and staff rooms, west
export const ENTRY: Rect = [31, 84, 43, 100]; // the covered entry, south-west of the living room
export const GARAGE: Rect = [22, 95, 57, 132]; // the garage, south, off the drive
export const ROOFS: Rect[] = [LIVING, MASTER, WALK, GUEST, ...SERVICE, ENTRY, GARAGE];

/** walls stand this far in from the roof's edge: the deep overhangs [documented: deep overhangs; depth assumed] */
export const OVERHANG = 3;

/** the gloriette: the open-air room on the living room's roof [documented]; its place on the roof [assumed] */
export const GLORIETTE: Rect = [56, 70, 80, 90];
/** its louvres stand along the west and north sides, against the wind off the mountains [documented: louvres; sides assumed] */
export const LOUVRE_PITCH = 2;
/** the outside stair up to the roof, in the court north of the living room [assumed] */
export const STAIR: Rect = [86, 58, 90, 67];

/** the pool [documented: OSM way 1459410894] and the terrace around it */
export const POOL: Rect = [108, 91, 158, 112];
export const POOL_TERRACE: Rect = [99, 84, 164, 118];
/** the lawn around the pool and in front of the house [documented: photographs] */
export const LAWN: Rect = [96, 40, 176, 140];
/** the drive in from West Vista Chino to the garage [assumed] */
export const DRIVE: Rect = [28, 132, 52, 180];

export const CENTER = { x: 80, y: 6, z: 80 };

/** Where the house is in the real world: OSM's outline's centroid, not turned. */
export const SITE = { lat: 33.845152, lon: -116.552984, rotationDeg: 0 };

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));
export const inset = (r: Rect, d: number): Rect => [r[0] + d, r[1] + d, r[2] - d, r[3] - d];

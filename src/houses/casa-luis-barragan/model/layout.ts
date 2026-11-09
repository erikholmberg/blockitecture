/**
 * Plan of Casa Luis Barragán, in studs (1 stud ≈ 1 ft). Spec 035.
 *
 * Model frame = the UNESCO nomination's 1:200 plans (WHC 1136, pp. 63–71, read at 56.75 px/m off its scale bar at 300 dpi):
 * x = plan right, z = plan down, in ft. The street, General Francisco Ramírez, runs along the bottom (+z, real east), the garden
 * fills the top (real west). The real world is turned 82.5° to fit OSM's outline (way 199693850, IoU 0.915); the turn that also
 * fits (−97.5°) would put the street behind the garden, against the nomination's cadastral plan (p. 15).
 *
 * [documented] = the nomination's plans, sections and facades, its room names and description; [assumed] = what they don't
 * settle (wall colours on the roof read from photographs, the furniture, some heights).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

/** heights in plates (0.4 ft); y = 0 is the ground floor, level with the street at the garage [documented: sections, p. 71] */
export const Y = {
  GROUND: 0,
  FIRST: 24, // the first floor, 9.6 ft up
  ROOF: 49, // the roof and its terraces, 19.6 ft up
  GARDEN: -3, // the garden, a step below the living room [assumed]
  SERVICE: 73, // the service rooms' roof on the roof terrace
  TOWER: 112, // the tall block over the stair, about 45 ft [documented: cross section]
  GARDEN_WALL: 33, // the garden's high walls, about 13 ft [assumed: photographs]
};

/** the rooms the ground floor plan numbers (p. 63) [documented] */
export const GARAGE: Rect = [4, 120, 25, 141]; // 1
export const VESTIBULE: Rect = [25, 120, 33, 141]; // 2
export const HALL: Rect = [14, 108, 40, 120]; // 3
export const KITCHEN: Rect = [4, 88, 20, 108]; // 4
export const BREAKFAST: Rect = [20, 88, 30, 108]; // 5
export const DINING: Rect = [30, 88, 47, 108]; // 6
export const LIVING: Rect = [47, 88, 70, 115]; // 7, double height
export const LIBRARY: Rect = [47, 115, 70, 141]; // 8, double height
export const ALCOVE: Rect = [33, 115, 47, 141]; // the library's low end, under the first floor
export const STUDIO: Rect = [70, 88, 106, 112]; // 9, double height
export const STUDIO_HALL: Rect = [70, 112, 78, 141]; // 10
export const SECRETARY: Rect = [78, 112, 92, 141]; // 11
export const OFFICE: Rect = [92, 112, 106, 141]; // 12
export const GROUND_ROOMS: Rect[] = [GARAGE, VESTIBULE, HALL, KITCHEN, BREAKFAST, DINING, ALCOVE, STUDIO_HALL, SECRETARY, OFFICE];
export const TALL_ROOMS: Rect[] = [LIVING, LIBRARY, STUDIO];
export const HOUSE: Rect = [4, 88, 106, 141];

/** the first floor (p. 65): the bedrooms over the west end, the rooms over the offices [documented] */
export const FIRST_ROOMS: Rect[] = [[4, 88, 27, 106], [27, 88, 47, 106], [4, 106, 27, 124], [27, 106, 47, 124], [4, 124, 27, 141], [27, 124, 47, 141], [70, 112, 88, 141], [88, 112, 106, 141]];
export const FIRST: Rect[] = [[4, 88, 47, 141], [70, 112, 106, 141]];

/** the roof (p. 67): the service rooms and laundry, the service terrace, the walled terrace, the roof terraces [documented] */
export const SERVICE_ROOMS: Rect[] = [[15, 89, 35, 109], [35, 92, 50, 109]];
export const SERVICE_TERRACE: Rect = [15, 109, 47, 120];
/** the walled terrace: high walls painted pink, orange and white, open to the sky [documented: description; colours, photographs] */
export const TERRACE: Rect = [50, 88, 73, 141];
export const TOWER: Rect = [4, 110, 11, 120];

/** the garden, walled [documented: 15], its paved terrace by the house [documented: hatched on p. 63] */
export const GARDEN: Rect = [11, 9, 84, 88];
export const GARDEN_TERRACE: Rect = [12, 68, 84, 88];
/** the patio of the clay pots and the reflecting pool beside it [documented: 13, 14] */
export const PATIO: Rect = [84, 76, 106, 88];
export const POOL: Rect = [86, 69, 106, 75];
export const PATIO_ALL: Rect = [84, 68, 106, 88];

/** the street in front [documented: OSM's General Francisco Ramírez, its centreline at z ≈ 160] */
export const SIDEWALK: Rect = [-50, 141, 170, 150];
export const STREET: Rect = [-50, 150, 170, 170];
export const SIDEWALK_FAR: Rect = [-50, 170, 170, 176];

/** the windows [documented: the facades, p. 69; the living room's, photographs] */
export const LIVING_WINDOW = { x0: 49, x1: 68, z: 88, y0: 3, y1: 40, crossX: 58, crossY: 26 };
export const STUDIO_WINDOW = { x0: 74, x1: 86, z: 88, y0: 3, y1: 40 };
export const STREET_WINDOW = { x0: 52, x1: 64, z: 140, y0: 26, y1: 42 };

export const CENTER = { x: 56, y: 8, z: 90 };

/** Where the house is in the real world: Wikidata Q1046414's point, turned 82.5°. */
export const SITE = { lat: 19.41111, lon: -99.1925, rotationDeg: 82.5 };

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));
export const onEdge = (x: number, z: number, r: Rect) => inRect(x, z, r) && (x === r[0] || x === r[2] - 1 || z === r[1] || z === r[3] - 1);

/**
 * Plan of the Glass House and the Brick House, in studs (1 stud ≈ 1 ft). Spec 073.
 *
 * Model frame: x = east, z = south, turned 2.8° (scripts/houses/glass-house.mjs) so the Glass House's long sides (OSM way
 * 364907964: 357.2°) run along z. The glass box stands at x 0…32, z 0…56; the Brick House faces it across the lawn court to
 * the south-east; the ground falls west of the house, down the bluff to the pond and the Pavilion.
 *
 * [documented] = the National Historic Landmark nomination (NPS, 1997), the National Trust's site, OSM;
 * [scaled] = read off the photographs (Carol M. Highsmith, Library of Congress) and ArchDaily's plans of the Brick House and
 * the Pavilion, ±1–2 ft; [assumed] = what none of them settles (no plan of the Glass House was available: spec 073 Q3).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const onRing = (x: number, z: number, r: Rect) => inRect(x, z, r) && (x === r[0] || z === r[1] || x === r[2] - 1 || z === r[3] - 1);

/** heights in plates (0.4 ft); y = 0 is the Glass House's brick floor */
export const Y = {
  LAWN: -3, // the lawn by the house: the floor is 10 in above it [documented] (−1.2 ft, the nearest block course)
  CEILING: 23, // [assumed: the roof's depth isn't published] 9.2 ft
  ROOF: 26, // the roof's top: "a height of 10½ feet" [documented] → 10.4 ft
  CYLINDER: 30, // the cylinder rises about 1½ ft above the fascia [scaled] → 1.6 ft
  RAIL: 7, // the horizontal steel rail, about 2½–3 ft above the floor [scaled] → 2.8 ft
  KITCHEN: 9, // "42″ high cabinets" [documented] → 3.6 ft
  STORAGE: 15, // the walnut storage wall, about 6 ft [scaled: photographs of the living area]
  BRICK_ROOF: 26, // the Brick House's roof, OSM height=3.59 m above the lawn (−3) [documented] → 11.6 ft
  BRICK_CEILING: 23,
  BRICK_DOOR: 18, // the black door, about 7 ft [assumed]
};

/** the glass box: "32 feet by 56 feet in plan" [documented: the nomination, spec 073 Q2] */
export const HOUSE: Rect = [0, 0, 32, 56];

/**
 * The black steel piers along each front, as cells along it (0 = the north or west end). The long fronts (east x = 31, west
 * x = 0) read 18 + 8 + 4 + 8 + 18 ft [scaled: the east front; the nomination's "18-feet-wide" sheets]; the short fronts (north
 * z = 0, south z = 55) the same rhythm in 8 + 4 + 4 + 4 + 8 ft [assumed: the pane widths of the short fronts]. The door is
 * between the two middle piers, centred on every front [documented: the Trust, "a door centred in each of the four walls"].
 */
export const PIERS_LONG = [0, 18, 26, 29, 37, 55];
export const PIERS_SHORT = [0, 9, 14, 17, 22, 31];
/** the doors, as cells along each front [documented: centred]; 2 ft of glass door between the middle piers' 1 ft */
export const DOOR_LONG: [number, number] = [27, 29];
export const DOOR_SHORT: [number, number] = [15, 17];

/** the brick cylinder: about 10 ft across [assumed], off-centre on the cross axis toward the east door [scaled] */
export const CYL = { x: 21, z: 28, r: 5 };
/** inside the cylinder (the bathroom) [documented] */
export const inCylinder = (x: number, z: number, r = CYL.r) => Math.hypot(x + 0.5 - CYL.x, z + 0.5 - CYL.z) < r;
export const cylinderWall = (x: number, z: number) => inCylinder(x, z) && !inCylinder(x, z, CYL.r - 1);
/** the fireplace on its outer face, toward the living area to the west [documented: "on one side"; facing assumed] */
export const FIREPLACE: Rect = [16, 27, 17, 29];
/** the bathroom door on the opposite face [documented: "the bathroom door on the other"] */
export const BATH_DOOR: Rect = [25, 27, 26, 29];

/** the kitchen: "one long line of 42″ high cabinets", north of the cylinder [assumed: place] */
export const KITCHEN: Rect = [14, 18, 28, 20];
/** the walnut storage wall between the bedroom and the living space [documented], at the north end [assumed: place] */
export const STORAGE: Rect = [6, 12, 22, 14];
/** the rug that marks the living area, by the west glass [scaled: white, rectangular; place assumed] */
export const RUG: Rect = [3, 34, 15, 48];

/** the Brick House: 18 × 52 ft [documented], at OSM's way 364907966 (its centroid 112 ft east, 49 ft south) */
export const BRICK: Rect = [119, 60, 137, 112];
/** its single black door on the west front [documented], at OSM's entrance node (8023599628) [documented], 3 ft wide [assumed] */
export const BRICK_DOOR: [number, number] = [86, 89];
/** three round windows on the east front [documented], about 5 ft across, evenly spaced [scaled: photographs] */
export const ROUND_WINDOWS = [71, 86, 101].map((z) => ({ z, y: 11, r: 2.6 }));

/** the pool: round, 32 ft across [documented: the nomination], centred on OSM's way 364907965 (34 ft across); its granite
 * deck [documented], 4 ft wide [assumed] */
export const POOL = { x: 119, z: -36, r: 16, deck: 4 };

/** the crushed-stone paths [documented]: OSM's footways 364907968 (from the Glass House's east door, on south past the court)
 * and 364907970 (to the Brick House's door), in model ft [documented: OSM]; 4 ft wide [assumed] */
export const PATHS: [number, number][][] = [
  [[31.5, 28], [43.5, 28.8], [73.6, 54.9], [88.7, 112.3]],
  [[73.6, 54.9], [119.7, 87.1]],
];
/** the stone wall: OSM's way 989166098 [documented], about 4 ft high [assumed] */
export const STONE_WALL: [number, number][] = [[72.4, 90.2], [83.6, 252.9]];

/** the Pavilion: "about 32 feet square", in the pond [documented]; at its east side, nearest the house [assumed] */
export const PAVILION: Rect = [-232, 62, -200, 94];

export const CENTER = { x: 50, y: 4, z: 50 };
export const SITE = { lat: 41.142397, lon: -73.529253, rotationDeg: 2.8 };

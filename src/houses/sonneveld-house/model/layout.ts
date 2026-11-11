/**
 * Plan of the Sonneveld House, in studs (1 stud ≈ 1 ft). Spec 060.
 *
 * Model frame: x along the house from its south end on the garden (x = 0) to its north end (+x = real about 339°); z from the
 * street front on Jongkindstraat (z = 0) to the east (+z = real about 69°). The real world is turned 111° to fit OSM's outline
 * (way 255337548). A white three-storey block on a steel frame, its ground floor set back behind the columns on the street
 * side; a two-storey wing with the garage and the kitchen off its north-east corner; balconies cut into the south-east corner;
 * the whole roof a terrace.
 *
 * [documented] = the monument register (rijksmonument 46870), the project sheet's two dimensions (9.85 m deep, 16.30 m along
 * the north side), the Nieuwe Instituut's descriptions; [scaled] = read off the redrawn plans and elevations (±0.15 m);
 * [assumed] = what those don't settle.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];

/** the main block: 15.9 × 9.85 m [scaled; documented: the depth] */
export const BLOCK: Rect = [0, 0, 52, 32];
/** the wing off the north-east corner: the kitchen over the garage [scaled], 16.30 m along the north side [documented] */
export const KITCHEN: Rect = [38, 32, 52, 53];
/** the garage, wider than the kitchen: it reaches 1.9 m further north, its roof there the staff's balcony [scaled] */
export const GARAGE: Rect = [38, 32, 58, 53];

/** heights in plates (0.4 ft); y = 0 is the ground floor [scaled: 3.15, 6.65 and 10.0 m, rounded to brick courses] */
export const Y = {
  F1: 27, // the first floor: the living rooms
  F2: 54, // the second floor: the bedrooms
  ROOF: 81, // the roof terrace
  RAIL: 90, // its balustrade, about 11.1 m
  TOWER: 102, // the stair tower, about 12.5 m
  CHIMNEY: 108, // about 13.2 m
  GARAGE_ROOF: 33, // about 4.0 m
  SLAB: 2,
};

/** the steel frame: four column lines along the house, three across [scaled: bays of about 5.2 m; 3.6 and 6.2 m] */
export const COLUMNS_X = [0, 17, 34, 51];
export const COLUMNS_Z = [0, 12, 31];
/** the ground floor's street wall, set back about 1.2 m behind the columns [scaled] */
export const SETBACK = 4;

/** the balconies cut into the south-east corner on both upper floors, reaching 1.3 m past the south end [scaled] */
export const RECESS: Rect = [0, 17, 17, 32];
export const BALCONY: Rect = [-4, 17, 17, 32];
/** the steel spiral stair from the first floor's balcony down to the garden [documented; its place scaled] */
export const SPIRAL = { cx: -1, cz: 35, r: 3.2 };

/** the main stair: a helix through all the floors by the north end [scaled], lit by a tall window in the north wall */
export const STAIR = { cx: 45.5, cz: 14.5, r0: 1.2, r1: 4.6 };
export const stairR = (x: number, z: number) => Math.hypot(x + 0.5 - STAIR.cx, z + 0.5 - STAIR.cz);
export const inStair = (x: number, z: number) => stairR(x, z) > STAIR.r0 && stairR(x, z) <= STAIR.r1;
export const STEPS = 12;
/** which of a turn's twelve steps a stair cell belongs to */
export const stairStep = (x: number, z: number) => {
  const a = (Math.atan2(z + 0.5 - STAIR.cz, x + 0.5 - STAIR.cx) + Math.PI) / (2 * Math.PI);
  return Math.min(STEPS - 1, Math.floor(a * STEPS));
};
/** where a floor's slab is open over the stair: over the upper half of the turn below */
export const stairVoid = (x: number, z: number) => inStair(x, z) && stairStep(x, z) >= STEPS / 2;
/** the stair tower on the roof, with the canopy reaching south from it [scaled] */
export const TOWER: Rect = [40, 9, 52, 20];
export const CANOPY: Rect = [26, 9, 40, 20];
export const CHIMNEY: Rect = [30, 21, 32, 23];

/** the second floor's four street windows, and the first floor's one ribbon in six lights [scaled: the west elevation] */
export const STREET_WINDOWS: [number, number][] = [[4, 14], [18, 23], [27, 38], [41, 46]];
export const RIBBON = { x0: 1, x1: 51, y0: 32, y1: 46, mullions: [1, 9, 18, 26, 34, 43, 50] };

export const CENTER = { x: 28, y: 14, z: 22 };
export const SITE = { lat: 51.915636, lon: 4.472372, rotationDeg: 111 };

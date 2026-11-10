/**
 * Plan of the Vanna Venturi House, in studs (1 stud ≈ 1 ft). Spec 044.
 *
 * Model frame: x along the house (+x = real south-east), z across it (−z = real north-east, out of the front toward the drive and
 * Millman Street; +z = the back garden). The house is one long box under a hipped roof, its front a split-gable parapet standing
 * above the roof; a central upstairs block rises through the ridge, the chimney on its front, the stair squeezed around the
 * chimney. The real world is turned −37° to fit OSM's outline (way 769755185).
 *
 * No measured drawings are public (spec 044, Q2). [documented] = the surveyor's site plan in the Philadelphia Historical
 * Commission's 2021 review (the footprint, 58.3 × 26.9 ft, and the floor's elevation), OSM's outline, HABS PA-6776's photographs
 * and data pages, the published plan's arrangement and descriptions; [assumed] = what those don't settle (heights, scaled from
 * head-on photographs; the rooms' sizes; the furniture).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const onEdge = (x: number, z: number, r: Rect) => inRect(x, z, r) && (x === r[0] || x === r[2] - 1 || z === r[1] || z === r[3] - 1);

/** heights in plates (0.4 ft); y = 0 is the ground floor [documented: the survey's spot elevation] */
export const Y = {
  FLOOR: 0,
  EAVE: 26, // the level eaves all round: 10.4 ft [assumed: scaled from photographs, about 10½ ft]
  UPPER: 28, // the upstairs floor, on the ground floor's ceiling [assumed]
  UPPER_WALL: 46, // the upstairs block's walls: 18.4 ft [assumed]
  GABLE_PEAK: 54, // each half of the split gable: 21.6 ft [assumed: scaled, about 21–22 ft]
  SPLIT: 39, // the split comes down to 15.6 ft [assumed: photographs]; on the glass's 3-plate courses
  CHIMNEY: 65, // the chimney block: 26 ft [assumed: scaled]
  CAP: 74, // the brick flue cap: 29.6 ft [documented: about 30 ft to the chimney's top]
  MOULD: [9, 11] as const, // the double moulding about 4 ft up, round all four sides [documented]
};
/** the roofs rise one plate per stud: about 22° [assumed: photographs, 20–25°] */
export const PITCH = 1;

/** the house: 58.3 × 26.9 ft [documented: the survey] */
export const HOUSE: Rect = [0, 0, 58, 27];
export const MID = 28.5; // the front's centre line
/** the split: a 2 ft gap down the middle of the gable [documented: the split; about 3 ft scaled, 2 to keep it centred] */
export const GAP = [28, 30] as const;
/** the front parapet's top at x: level eaves at the corners, rising to each half's peak beside the split */
export const gableTop = (x: number) => Y.EAVE + PITCH * Math.min(x, HOUSE[2] - 1 - x);
export const inGap = (x: number, y: number) => x >= GAP[0] && x < GAP[1] && y >= Y.SPLIT;

/** the recessed entrance in the middle of the front, and the door at its back [documented: photographs] */
export const ENTRY: Rect = [24, 0, 34, 3];
/** the front door, in the recess's back wall, into a vestibule beside the chimney [assumed: place] */
export const DOOR = { z: 3, x0: 27, x1: 31, y1: 18 };
export const LINTEL = { x0: 20, x1: 38, y0: 18, y1: 20 };
/** the thin applied arch over the lintel: a segment about 20 ft wide and 4 ft high [documented: photographs; sizes scaled] */
export const ARCH = { x0: 19, x1: 39, base: 20, rise: 10 };
/** the front's windows: the five-pane strip on the north-west side; the big square and the small square on the south-east
 * [documented: photographs; sizes scaled] */
export const STRIP = { x0: 6, x1: 21, y0: 12, y1: 18 };
export const BIG = { x0: 41, x1: 47, y0: 12, y1: 24 };
export const SMALL = { x0: 51, x1: 54, y0: 15, y1: 21 };

/** the central upstairs block rising through the ridge, and the chimney on its front [documented: photographs, plan] */
export const UPPER: Rect = [22, 6, 36, 21];
export const CHIMNEY: Rect = [26, 5, 32, 10];
export const FLUE: Rect = [27, 6, 31, 9];
/** the fireplace, opening into the living room from the chimney's back [documented: the trapezoid fireplace] */
export const HEARTH = { x0: 27, x1: 31, z: CHIMNEY[3] - 1, y1: 8 };
/** the stair squeezed beside the chimney, rising toward the front to the upstairs floor [documented: the stair wraps the chimney] */
export const STAIR = { x0: 22, x1: 25, zTop: 6, steps: 14 };
/** the upstairs' top run "to nowhere": a few steps up against the block's wall [documented: the stair to nowhere; place assumed] */
export const NOWHERE = { x0: 33, x1: 35, z0: 15, steps: 4 };

/** the ground floor's rooms [documented: the plan's arrangement; sizes assumed] */
export const KITCHEN: Rect = [1, 1, 21, 10];
export const BATH: Rect = [1, 10, 10, 19];
export const UTILITY: Rect = [10, 10, 21, 19];
export const LIVING: Rect = [21, 10, 44, 26];
/** the living room's corner by the porch, behind the utility room */
export const LIVING_NOOK: Rect = [14, 19, 21, 26];
export const DINING: Rect = [34, 1, 48, 12];
export const BED2: Rect = [48, 1, 57, 12];
export const MAIN_BED: Rect = [44, 12, 57, 26];
/** the deep recessed porch at the back's north-west end, under the roof [documented: photographs] */
export const PORCH: Rect = [0, 19, 14, 27];

/** the forecourt where the drive ends, and the path to the door [documented: the survey's parking north-west of the house;
 * sizes assumed] */
export const FORECOURT: Rect = [-22, -36, 24, -14];
export const PATH: Rect = [25, -32, 33, 0];

export const CENTER = { x: 29, y: 4, z: 13 };
export const SITE = { lat: 40.0706588, lon: -75.2081297, rotationDeg: -37 };

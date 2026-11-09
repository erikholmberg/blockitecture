/**
 * Plan of the Ennis House, in studs (1 stud ≈ 1 ft). Spec 025.
 *
 * Model frame: x along the house's long axis, west (x = 0) to east (x = 240); z across it, north (z ≈ 0) to south (z ≈ 78).
 * The real world is turned −23° to fit OSM's footprint (way 426658114, an LA County building outline, IoU 0.834).
 *
 * Sources: the outline is OSM's [documented], exported by the data script as LOT_SELF. The heights and the order of the
 * masses along the house come from HABS CA-1942's one measured sheet, the long elevation at 1/10″ = 1′ (photogrammetry,
 * 1969) [documented]. Where each mass sits across the house, and the rooms, are [assumed]: there are no measured plans
 * online.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

/** heights in plates (0.4 ft); y = 0 is the main floor (heights above it read off the HABS elevation) */
export const Y = {
  FLOOR: 0,
  T1: 28, // the first tier's parapets, about 11 ft [documented]
  T2: 48, // the second tier, about 19 ft [documented]
  T3: 60, // the top tier over the living room, about 24 ft [documented]
  TOWER: 62, // the pier-like tower, about 24½ ft [documented]
  WEST_BLOCK: 39, // the block at the west end, about 15½ ft [documented]
  EAST_MASS: 42, // the mass by the tower, about 17 ft [documented]
  COURT_WALL: 20, // the motor court's wall with the gates, about 8 ft [documented]
  SILL: 4, // the main floor's tall windows start here [assumed]
  HEAD: 22,
};

/** the textile blocks: 16 in square, so three make 4 ft; walls are drawn on that 4-ft repeat (spec 025 Q3) [documented] */
export const MODULE = 4;
export const MODULE_H = 10; // 4 ft in plates

/**
 * The masses along the house, in the order the HABS elevation shows them (x from its fractions along the 240-ft
 * footprint); their depth across the house is assumed.
 */
export interface Mass { name: string; rect: Rect; top: number }
export const MASSES: Mass[] = [
  { name: 'west wing', rect: [0, 4, 40, 72], top: Y.T1 },
  { name: 'west block', rect: [4, 48, 16, 72], top: Y.WEST_BLOCK },
  { name: 'living room tier', rect: [38, 8, 118, 68], top: Y.T2 },
  { name: 'top tier', rect: [58, 18, 118, 58], top: Y.T3 },
  { name: 'middle mass', rect: [118, 4, 142, 72], top: 40 },
  { name: 'tower', rect: [142, 54, 150, 66], top: Y.TOWER },
  { name: 'east mass', rect: [150, 4, 178, 64], top: Y.EAST_MASS },
  { name: 'east wing', rect: [178, 4, 206, 40], top: Y.T1 },
];

/** the motor court at the east end, walled, with the wrought-iron gates (15′-10¾″ wide) on its south side [documented: HABS gates detail] */
export const COURT: Rect = [180, 40, 226, 64];
export const GATES: Rect = [196, 63, 212, 64];
/** the long north loggia [documented: "the long north loggia"; extent assumed] */
export const LOGGIA: Rect = [40, 4, 200, 12];
/** the court on the north side, from OSM's outline; the 1940 pool in it [documented: a pool added in 1940; position assumed] */
export const NORTH_COURT: Rect = [12, -34, 48, 0];
export const POOL: Rect = [16, -28, 40, -8];

/** house centre: camera target and where the ridge wave starts */
export const CENTER = { x: 120, y: 6, z: 36 };

/** Where the house is in the real world: Wikidata Q578184's point; OSM way 426658114 fitted at −23°. */
export const SITE = { lat: 34.11611, lon: -118.29278, rotationDeg: -23 };

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));

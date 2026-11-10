/**
 * Plan of the Douglas House, in studs (1 stud ≈ 1 ft). Spec 045.
 *
 * Model frame: x along the house, parallel to the shore (+x = real south-south-east, so the north end is at x = 0), z across it
 * (+z = toward Lake Michigan, real west-south-west, down the bluff; −z = up the bluff to the bridge and M-119). Four floors step
 * down the bluff: the bridge from the road lands at the 4th, whose lake half is the big open deck; the living room below is
 * double height behind the three-storey glass wall; a service level on piles hides behind a white skirt. The real world is
 * turned −60° to fit OSM's outline (way 1101848958, about 13.9 × 9.5 m).
 *
 * No measured drawings are public (spec 045, Q2). [documented] = the National Register nomination's floor-by-floor description,
 * the published roof plan and aerial photograph (douglashouse.org), OSM's outline, Michigan Modern and Architectural Record;
 * [assumed] = what those don't settle (heights, the rooms' sizes, most furniture).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];

/** heights in plates (0.4 ft); y = 0 is the 1st floor; 10 ft a floor [assumed: "only 50" ft, Tod Williams] */
export const Y = {
  SERVICE: -25, // the service level on its piles [documented: below the 1st floor]
  F1: 0,
  F2: 25,
  F3: 50,
  F4: 75, // the 4th floor: the bridge's level and the big deck [documented]
  TOP: 100, // the small open deck on the 4th floor's roof [documented]
  SLAB: 2,
};
export const FLOORS = [Y.F1, Y.F2, Y.F3, Y.F4];

/** the floors' outline: 46 × 31 ft [documented: OSM], its north-east corner rounded [documented: the roof plan] */
export const HOUSE: Rect = [0, 0, 46, 31];
export const CORNER = { cx: 8, cz: 8, r: 8 };
export function inHouse(x: number, z: number): boolean {
  if (!inRect(x, z, HOUSE)) return false;
  if (x < CORNER.cx && z < CORNER.cz) return Math.hypot(x + 0.5 - CORNER.cx, z + 0.5 - CORNER.cz) <= CORNER.r;
  return true;
}
/** the outline's own cells: in the house, next to a cell outside it */
export const onOutline = (x: number, z: number) =>
  inHouse(x, z) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => !inHouse(x + dx, z + dz));

/** the quarter-round stair in the rounded corner, painted pink [documented: one quarter-round stair at the north-east corner] */
export const inStairwell = (x: number, z: number) =>
  x < CORNER.cx && z < CORNER.cz && inHouse(x, z) && stairR(x, z) > 1.5 && stairR(x, z) <= 6.8;
export const stairR = (x: number, z: number) => Math.hypot(x + 0.5 - CORNER.cx, z + 0.5 - CORNER.cz);
/** a step's quarter: 0° along the north wall to 90° along the road wall */
export const stairAngle = (x: number, z: number) => (Math.atan2(CORNER.cz - (z + 0.5), CORNER.cx - (x + 0.5)) * 180) / Math.PI;
export const STAIR_STEPS = 12;
/** which of a flight's twelve steps a stairwell cell belongs to, round the quarter */
export const stairStep = (x: number, z: number) => Math.min(STAIR_STEPS - 1, Math.floor((stairAngle(x, z) / 90) * STAIR_STEPS));
/** where a floor's slab is cut for the flight below it: over its top step only, so each flight stands on its own floor */
export const underTopStep = (x: number, z: number) => inStairwell(x, z) && stairStep(x, z) === STAIR_STEPS - 1;

/** the road half, where the rooms are, and the lake half [documented: the floors' descriptions] */
export const ROAD_DEPTH = 15;
/** the living room: the lake half of the 2nd floor, open through the 3rd floor to the 4th's deck [documented: double height] */
export const LIVING: Rect = [0, ROAD_DEPTH, 46, 31];
/** the 4th floor: the enclosed entry on the road side, the big deck on the lake side [documented] */
export const ENTRY_DEPTH = 14;
export const DECK: Rect = [0, ENTRY_DEPTH, 46, 31];
/** the bridge from the parking by M-119 to the 4th floor, near the north end [documented: 43 ft, on the east, near the north] */
export const BRIDGE = { x0: 9, x1: 14, z0: -44, z1: 0 };
export const PARKING: Rect = [0, -66, 24, -44];

/** the chimney on the lake side toward the north end, with its two smokestacks [documented: the roof plan; Q3] */
export const CHIMNEY: Rect = [2, 23, 7, 29];
export const STACKS: [number, number][] = [[3, 25], [5, 27]];

/** the cantilevered stair down the outside of the glass wall, from the 4th floor's deck to the 2nd floor's semicircular landing
 * at the south-west [documented: the stair, the landing; its line assumed] */
export const OUT_STAIR = { x0: 19, z0: 31, z1: 34, steps: 25 };
export const LANDING = { cx: 46, cz: 33, r: 5 };

/** the piles under the 1st floor: 28 timber poles [documented], in 7 rows of 4 [assumed] */
export const PILES: [number, number][] = [3, 10, 17, 23, 29, 35, 42].flatMap((x) => [4, 12, 20, 27].map((z) => [x, z] as [number, number]));

export const CENTER = { x: 23, y: 18, z: 15 };
export const SITE = { lat: 45.500862, lon: -85.097823, rotationDeg: -60 };

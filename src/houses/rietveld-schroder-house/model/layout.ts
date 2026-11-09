/**
 * Plan of the Rietveld Schröder House, in studs (1 stud ≈ 1 ft). Spec 019.
 *
 * Model frame: x runs east along the front, from the party wall it shares with the end of the row (x = 0) to the east
 * facade facing the motorway (x = 25); z runs from the back (z = 0) to the front (z = 33), which faces about 209.5° (SSW).
 * The real world is turned about −29.5° to fit (scripts/houses/rietveld-schroder-house.mjs).
 *
 * [documented] = OSM (way 191005050: 10 × 7.6 m, 74 m²; the shared wall with way 261140744) or the sources in spec 019;
 * [assumed] = read from published photographs (Wikimedia Commons, CC BY 3.0 / CC BY-SA 4.0), no measured drawings being
 * available: storey heights, the position and depth of each plane, the plan of the rooms.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

/** heights in plates (0.4 ft); y = 0 is the ground floor */
export const Y = {
  GROUND: -3, // the garden, one brick below the floor [assumed]
  L1: 0,
  L2: 24, // the upper floor, 9.6 ft (2.9 m) up [assumed: photographs, against the neighbour's storeys]
  ROOF: 48, // top of the roof slab, 19.2 ft (5.85 m) [assumed: about two thirds of the neighbour's eaves]
  LIGHT: 57, // top of the stair's roof light [assumed]
  SILL: 8, // the ground floor's window sills [assumed]
};

/** the footprint: 7.6 × 10 m [documented: OSM] */
export const W = 25;
export const D = 33;
export const FOOTPRINT: Rect = [0, 0, W, D];
/** the ground floor sits back from the upper floor at the front and the back [assumed: photographs] */
export const GROUND_FLOOR: Rect = [0, 1, W - 1, D - 2];
export const UPPER_FLOOR: Rect = [0, 0, W, D - 1];

/** the central stair [documented: "around a central staircase"], with the roof light over it [documented] */
export const STAIR: Rect = [10, 13, 14, 20];
export const ROOF_LIGHT: Rect = [9, 12, 15, 19];

/** the balconies: concrete [documented: "concrete only for the foundations and the balconies"]; positions [assumed] */
export const FRONT_LEFT_BALCONY: Rect = [0, D - 1, 10, D + 2]; // in front of the bay next to the neighbour
export const FRONT_BALCONY: Rect = [12, D - 1, 20, D + 3]; // the projecting white box in the middle of the front
export const EAST_BALCONY: Rect = [W, 2, W + 3, 11]; // at the back of the east side

/** the coloured lines [documented: "some linear elements in the primary colours"; which and where: assumed, photographs] */
export const YELLOW_POST: [number, number] = [9, D + 1]; // the tall yellow post at the front, ground to above the roof
export const RED_POST_EAST: [number, number] = [W + 1, 9]; // the red post in front of the east ground-floor windows
export const RED_POST_FRONT: [number, number] = [23, D]; // the short red post at the front right corner
export const BLUE_POST_EAST: [number, number] = [W - 1, 17]; // the blue post in the middle of the east upper windows

/** the ground floor's rooms around the stair [documented: a kitchen and three sitting/bedrooms; their walls assumed] */
export const WALLS1: Rect[] = [
  [0, 13, 10, 14], // kitchen | front room
  [14, 1, 15, 13], // back rooms
  [14, 20, 24, 21], // the studio at the front right
  [10, 12, 14, 13], // around the stair
];
/** the upper floor: the bathroom and toilet are fixed [documented]; the rest is open, with sliding panels [documented] */
export const BATH_WALLS: Rect[] = [[15, 1, 16, 8], [16, 7, 24, 8]];

/** the end of the row: the house shares its west wall with OSM way 261140744 [documented] */
export const PARTY_NEIGHBOUR = 261140744;

/** house centre: camera target and where the street wave starts */
export const CENTER = { x: 12, y: 8, z: 16 };

/** Where the house is in the real world: OSM's "Rietveld-Schröderhuis" (wikidata Q914231). */
export const SITE = { lat: 52.085332, lon: 5.147576, rotationDeg: -28 };

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));

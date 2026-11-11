/**
 * Plan of the Lovell Beach House, in studs (1 stud ≈ 1 ft). Spec 056.
 *
 * Model frame = the HABS CA-1986 plans (1968): x along the house from its north end on the alley (x = 0) to its south end toward
 * the ocean (+x = real about 196.5°); z across it from the east side (z = 0) to the west, 13th Street (+z = real about 286.5°).
 * The real world is turned −107° to fit OSM's outline (way 1070767462). Five concrete frames 12 ft apart carry the house up off
 * the sand: the double-height living room on the east, a row of four bedrooms in a band cantilevered west over 13th Street.
 *
 * [documented] = HABS CA-1986's measured drawings (sheets 2–10: the frames, the posts, every floor's level) and data pages, the
 * National Register nomination (1974), OSM's outline; [assumed] = what those don't settle (furniture, window rhythm in detail).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];

/** heights in plates (0.4 ft); y = 0 is the ground at the north end [documented: HABS's datum] */
export const Y = {
  F1: 25, // the living floor, +10′-0″ [documented]
  F1_BEAM: 21, // the frames' beams under it, about 1′-8″ deep [documented: sheet 9]
  F2: 41, // the bedrooms' floor, +16′-6″ [documented]
  KITCHEN_CEIL: 45, // +18′-0″ [documented]
  BATH: 47, // the bath's floor in the north bay, +18′-9″ [documented]
  CEILING: 60, // the underside of the joists, +24′-0″ [documented]
  ROOF: 66, // the roof's top, about 26′-6″ [documented: the bath's ceiling 26′-3″]
  PARAPET: 68, // about 27 ft [documented: scaled]
  TOWER: 76, // the stair and bath tower over the north bay, about 30′-6″ [documented: scaled]
  SLAB: 2,
};

/** the house: 58′-8″ long [documented]; the frames 27′-8″ across, the bedroom band out to 33′-2″ [documented] */
export const LENGTH = 59;
export const FRAME_DEPTH = 28;
export const DEPTH = 33;
/** the five frames, 12′-0″ on centre from 4′-6″ in [documented]: the cells of their posts and beams along x */
export const FRAMES = [4, 16, 28, 40, 52];
/** the three posts of each frame, across the house [documented: 1′, 15′, 2′, 8′-8″, 1′; the west post 2 ft at the ground] */
export const POSTS: [z0: number, z1: number][] = [[0, 1], [16, 18], [26, 28]];

/** the first floor: everything east of the middle posts [documented], the north bay 3 ft further west [documented: sheet 3] */
export const FIRST: Rect = [0, 0, LENGTH, 18];
export const NORTH_BAY: Rect = [0, 0, 17, 21];
/** the double-height living and dining room, the three southern bays [documented] */
export const LIVING: Rect = [17, 1, 53, 16];
/** the living room's south wall, on the last frame; beyond it the balcony to 58′-8″ [documented] */
export const SOUTH_WALL_X = 53;
/** the bedrooms' band: four bedrooms in a row facing 13th Street, cantilevered 5′-6″ past the west posts [documented: sheet 4] */
export const BAND: Rect = [4, 18, 55, DEPTH];
/** the gallery over the living room, 3′-3″ wide, from which the bedrooms open [documented] */
export const GALLERY: Rect = [17, 13, 53, 16];
/** the bedrooms, one to a bay [documented]; their partitions on the frames */
export const BEDROOMS: Rect[] = [[5, 18, 16, DEPTH], [17, 18, 28, DEPTH], [29, 18, 40, DEPTH], [41, 18, 54, DEPTH]];
/** the bath and the stair to the roof deck over the kitchen, rising as a tower above the roof [documented: sheets 4, 5, 9] */
export const TOWER: Rect = [1, 9, 17, 21];
/** the roof's sun deck at the north end [documented] */
export const SUN_DECK: Rect = [0, 0, 17, 9];
/** the chimney on the east wall, in the second bay from the south [documented: sheets 2, 3, 7] */
export const CHIMNEY: Rect = [29, 0, 36, 4];
/** the garage at the north end, its door on the alley [documented: sheets 2, 8] */
export const GARAGE: Rect = [0, 0, 16, 16];
/** the shower stall in the middle of the open ground floor [documented] */
export const SHOWER: Rect = [24, 8, 28, 16];

/** the entrance: a platform on the 13th Street side and two concrete stairs from it, one up to the kitchen, one up to the
 * living room, rising at different angles between the middle and the west posts [documented: "two concrete stairs rising at
 * different angles lock the frames together"; their lines assumed from sheets 2, 3, 5] */
export const PLATFORM: Rect = [21, 28, 45, 34];
export const STAIR_Z: [number, number] = [19, 25];
export const KITCHEN_STAIR = { x0: 30, x1: 19 }; // rising toward the north
export const LIVING_STAIR = { x0: 34, x1: 50 }; // rising toward the south, gentler [documented: 1′-10″ treads against 11″]
export const LANDINGS: Rect[] = [[17, 18, 22, 25], [48, 18, 53, 25]];

/** the boardwalk along the beach, about 130 ft from the alley [documented: OSM's way 44108804; its width assumed] */
export const BOARDWALK: Rect = [106, -400, 120, 400];

export const CENTER = { x: 29, y: 12, z: 16 };
export const SITE = { lat: 33.60593, lon: -117.91768, rotationDeg: -107 };

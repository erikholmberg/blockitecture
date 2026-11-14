/**
 * Plan of the Gropius House, in studs (1 stud ≈ 1 ft). Spec 078.
 *
 * Model frame: +x along the house's long sides toward the east (OSM way 215140093: 80.9°), +z toward the south (170.9°), turned
 * 9.1° (scripts/houses/gropius-house.mjs). The north front (the entrance, the canopy, the spiral stair) faces −z; the garden, the
 * porch and the brise-soleil face +z. The ground floor stands at x 0…55, z 0…22. The drive comes up from Baker Bridge Road
 * (north-east, −z) through the orchard to the turning circle east of the entrance.
 *
 * [documented] = the National Historic Landmark nomination (NPS, 2000), Wikipedia, Historic New England's Conservation Management
 * Plan (2016), OSM; [scaled] = read off the Historic American Buildings Survey's photographs (HABS MA-1228, 1988), chiefly the
 * north front with its range pole (no. 8), ±0.5–1 ft; [assumed] = what none of them settles. No plan with dimensions was found
 * (spec 078 Q4), so the partitions, other than the living and dining rooms' sizes, are [assumed].
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const onRing = (x: number, z: number, r: Rect) => inRect(x, z, r) && (x === r[0] || z === r[1] || x === r[2] - 1 || z === r[3] - 1);

/** heights in plates (0.4 ft); y = 0 is the ground floor */
export const Y = {
  LAWN: -3, // the plinth: the ground floor "about 1½ ft above the grade" [scaled: the door's sill 1.3 ft, the base 0.9 ft] → 1.2 ft
  GF_CEIL: 24, // the upper floor's frame, 9.6 ft above the floor [assumed: the floor-to-floor height isn't published]
  UP: 26, // the upper floor and the deck: "the deck … at about 11.7 ft" above the grade [scaled] → 11.6 ft
  ROOF: 45, // the roof [assumed]: 7.6 ft rooms upstairs, under a parapet 1.2 ft high
  PARAPET: 48, // the parapet's top "at 20.2 ft" above the grade [scaled] → 20.4 ft
  CHIMNEY: 52, // the chimney rises above the parapet [documented; its height assumed: 1.6 ft]
  // the ground floor's north windows "5.0 → 9.0 ft" above the grade [scaled] → 4.0 → 8.0 ft above the floor
  N_WIN: [10, 20] as [number, number],
  // the maid's room's narrow band "6.7 → 8.9 ft" [scaled] → 5.6 → 8.0 ft
  MAID_WIN: [14, 20] as [number, number],
  // the living and dining rooms' three windows "6 ft high" [documented] → 1.6 → 7.6 ft
  BIG_WIN: [4, 19] as [number, number],
  // the upper ribbon on the north "15.0 → 17.1 ft" above the grade [scaled] → 3.6 → 5.6 ft above the upper floor
  UP_N_WIN: [35, 40] as [number, number],
  // the bedrooms' ribbon windows "3 ft high" [documented] → 2.8 → 6.0 ft above the upper floor [sill assumed]
  UP_S_WIN: [33, 41] as [number, number],
  DOOR: 18, // the doors, 7.2 ft [assumed]
  // the glass-block wall: 9 blocks of 3 plates (1.2 ft; "about 1 foot square" [documented]) on a low base "about 0.9 ft high"
  // [scaled] → 0.8 ft
  GB_BASE: -1,
  GB_TOP: 26,
  CANOPY: [26, 28] as [number, number], // the canopy's fascia "about 11.2 → 12.1 ft" above the grade [scaled] → 11.6 → 12.4 ft
};

/** the ground floor: "21′-9″ × 54′-8″" [documented] → 55 × 22 */
export const HOUSE: Rect = [0, 0, 55, 22];
/** the upper floor: set back from the west end for the deck [documented], 7 ft further south over the two eastern bedrooms
 * [documented]; where the extension starts is [assumed] (the guest room's west wall) */
export const UPPER: Rect = [14, 0, 55, 22];
export const UPPER_EXT: Rect = [28, 22, 55, 29];
export const inUpper = (x: number, z: number) => inRect(x, z, UPPER) || inRect(x, z, UPPER_EXT);
/** the deck at the west end of the upper floor: "21′ × 14′" [documented], over the living room */
export const DECK: Rect = [0, 0, 14, 22];
/** the brise-soleil over the living and dining rooms' south windows, on open joists [documented], out to the upper floor's
 * line [assumed: its depth]; OSM's roof trace runs the whole length at 29 ft [documented] */
export const BRISE: Rect = [0, 22, 28, 29];

/** the screened porch: "11′-6″ × 23′", at right angles to the south front [documented], under the upper floor's overhang and
 * where OSM's projection is [documented: OSM, 32–45 ft from the west end] */
export const PORCH: Rect = [34, 22, 46, 45];

/** the chimney: grey, Flemish bond, on the west side, rising through the deck [documented]; 6 ft wide, 3 deep [assumed] */
export const CHIMNEY: Rect = [-1, 3, 2, 9];
/** the living room's fireplace, "mantel-less", in the chimney's inner face [documented] */
export const FIREPLACE: Rect = [1, 5, 2, 7];

/** the rooms (clear inside), ground floor */
export const LIVING: Rect = [1, 1, 15, 21]; // "14′-5″ × 21′", across the west end [documented]
export const DINING: Rect = [15, 10, 28, 21]; // "11′ × 13′-5″", opening off the living room [documented]; south of the study [assumed]
export const STUDY: Rect = [16, 1, 28, 9]; // north of the dining room, east of the living room [assumed]
export const HALL: Rect = [29, 1, 38, 21]; // the central hall behind the entrance [assumed]
export const BACK_HALL: Rect = [39, 10, 44, 21]; // the lavatory and the back hall onto the porch [assumed]
export const PANTRY: Rect = [45, 10, 48, 21]; // [assumed]
export const KITCHEN: Rect = [49, 10, 54, 21]; // [assumed]
export const MAID_BATH: Rect = [39, 1, 44, 9]; // [assumed]
export const MAID: Rect = [45, 1, 54, 9]; // the maid's room in the north-east [documented; its size assumed]
/** the rooms upstairs [assumed: placed from the nomination's descriptions, spec 078 Q4] */
export const ATI: Rect = [15, 1, 28, 21]; // Ati's room, in the west by the deck [documented]
export const UP_HALL: Rect = [29, 1, 38, 14];
export const BATH_UP: Rect = [39, 1, 42, 7];
export const LINEN: Rect = [39, 8, 42, 14]; // the linen and sewing alcove [documented]
export const DRESSING: Rect = [42, 1, 54, 14];
export const GUEST: Rect = [29, 15, 41, 28]; // the guest room, in the middle of the south side [documented]
export const MASTER: Rect = [42, 15, 54, 28]; // the master bedroom, in the south-east [documented]

/** the hall's stair: a straight run up the hall's east side, 13 risers of 0.8 ft [assumed: the nomination calls it curved] */
export const STAIR = { x0: 35, x1: 37, zBottom: 17, steps: 13 };
/** the upper floor's opening over the stair */
export const STAIRWELL: Rect = [34, 4, 38, 14];

/** the glass-block partition between the study and the dining room, "slightly angled" [documented], curving out into the dining
 * room [documented: Wikipedia, "curves slightly outward"]: its line, cell by cell along x */
export const PARTITION_Z = (x: number) => (x >= 19 && x < 25 ? 10 : 9);
export const PARTITION_X: [number, number] = [16, 28];

/** the entrance door, "just west of" the glass block [scaled: 25.2–27.8 ft from the east end] → 23–26 ft */
export const ENTRY: [number, number] = [29, 32];
/**
 * The glass-block wall at the entrance: 12 blocks wide and 9 high [scaled: HABS MA-1228-8], angling out from the front at
 * about 30° toward the north-east under the canopy [documented: the nomination]. One block per stud along x, stepped 4 out for
 * every 7 along (29.7°), from the front beside the door.
 */
export const GB_X0 = 32;
export const GB_N = 12;
export const gbZ = (x: number) => -1 - Math.floor(((x - GB_X0) * 4) / 7);
/**
 * The canopy: a flat slab whose long edges run at 30° to the front [documented: "angles out at about 30 degrees toward the
 * northeast"], stepped like the glass-block wall (29.7°), 6 studs across in z (5.2 ft square to its edges) [assumed], from the
 * door to past the house's east end [scaled: HABS MA-1228-8]. Its south edge runs along the glass-block wall's top.
 */
export const CANOPY = { x0: 28, x1: 62, w: 6 };
export const canopyS = (x: number) => -Math.floor((Math.max(0, x - GB_X0) * 4) / 7);
export const inCanopy = (x: number, z: number) => x >= CANOPY.x0 && x < CANOPY.x1 && z < canopyS(x) && z >= canopyS(x) - CANOPY.w;
/** its two thin steel posts [documented], under its north half [assumed: where] */
export const CANOPY_POSTS: [number, number][] = [[50, -14], [58, -18]];

/** the spiral stair: "about 5 ft" across, its centre "12.6 ft from the west end" [scaled], against the deck's north wall */
export const SPIRAL = { x: 12.5, z: -2.5, r: 2.6 };
/** the opening in the deck's north wall where it arrives [scaled: 14.6–16.5 ft from the west end; here over the stair's top] */
export const DECK_OPENING: [number, number] = [12, 14];

/** the steel lally columns: the brise-soleil's and the overhang's south corners [documented: "the roof overhang in the south-west
 * corner"] */
export const LALLY: [number, number][] = [[0, 28], [28, 28]];
/** the deck's thin steel post at its south-west corner, under the open joists [scaled: HABS 12] */
export const DECK_POST: [number, number] = [0, 21];

/** the two trellises of white vertical slats [documented]: off the north front's west end, and off the south-east corner
 * [scaled: HABS 3 and 8; sizes assumed] */
export const TRELLIS_NW: Rect = [-10, 0, 0, 1];
export const TRELLIS_SE: Rect = [54, 29, 55, 40];

/** the levelled hilltop: "a flat grassy plinth bordered on the south and west by retaining walls" [documented]; its extent
 * [assumed]: the two 50 × 25 ft lawns either side of the porch [documented] and the frame of lally columns 20 ft beyond it */
export const PLINTH: Rect = [-20, -28, 76, 72];
/** the short return on the east, ending in a raised seating bench [documented] */
export const EAST_RETURN_Z0 = 56;
export const BENCH: Rect = [74, 56, 75, 59];
/** the two lally columns carrying a wooden beam, "20 ft south of the porch" [documented], either side of its axis [assumed] */
export const FRAME_COLS: [number, number][] = [[33, 65], [46, 65]];
/** the Japanese garden south of the porch (1957): the gravel bed, the azaleas, the red maple at its end [documented; extent
 * assumed] */
export const JAPANESE: Rect = [30, 47, 51, 62];
/** the oak west of the house, on the chimney's axis [documented: Wikipedia]; 45 ft out [assumed] */
export const OAK: [number, number] = [-45, 6];

/** the gravel drive: OSM's way 753318617 [documented], about 10 ft wide [assumed]; its turning circle by the entrance
 * [documented] at its upper end [assumed: 12 ft across the gravel] */
export const DRIVE: [number, number][] = [[206.1, -161.7], [203.5, -124.3], [192.7, -105.8], [152.5, -71.2], [112.6, -31.4], [92.3, -1.2]];
export const DRIVE_HALF = 5;
export const CIRCLE = { x: 86, z: -10, r: 12 };

export const CENTER = { x: 40, y: 4, z: 10 };
export const SITE = { lat: 42.42704, lon: -71.32638, rotationDeg: 9.1 };

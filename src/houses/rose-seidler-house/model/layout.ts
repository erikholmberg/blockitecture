/**
 * Plan of the Rose Seidler House, in studs (1 stud ≈ 1 ft). Spec 043.
 *
 * Model frame: +x = real west, +z = real north (down the slope, toward Ku-ring-gai Chase). The house is a "hollowed-out
 * square" on its main floor: the living wing on the east (x 0…20), the sleeping wing on the west (x 33…49), the playroom
 * between them on the south, and the open sun deck cut into the middle of the north side, with the ramp down to the garden
 * along the north face. Below, on the downhill north and east, the sandstone garage, the entry and the recreation area.
 * The real world is turned 186° to fit OSM's outline (way 570787191), about 15 × 12.6 m.
 *
 * No dimensioned drawings are public (spec 043, Q2). [documented] = Seidler's published plan (seidler.net.au), OSM's outline,
 * the heritage listing and Museums of History NSW; [assumed] = what those don't settle (heights, the rooms' exact sizes,
 * most furniture).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));
export const onEdge = (x: number, z: number, r: Rect) => inRect(x, z, r) && (x === r[0] || x === r[2] - 1 || z === r[1] || z === r[3] - 1);

/** heights in plates (0.4 ft); y = 0 is the main floor [assumed: no heights are documented] */
export const Y = {
  FLOOR: 0,
  SLAB: -2, // the main floor's slab, under y = 0
  ROOF: 23, // the flat roof's underside: 9.2 ft rooms [assumed]
  ROOF_TOP: 25,
  LOWER: -21, // the cut under the garage, entry and recreation area: 8.4 ft down, on the terrain's 3-plate courses [assumed; the
  // Julian Rose House next door has its main floor 3.3 m up]; their floors are a plate above it
  LOWER_FLOOR: -20,
  GARDEN: -21, // the garden terrace below the ramp, level with the cut [assumed]
  SILL: 9, // waist-high sills: kitchen, laundry, main bedroom [documented: "from waist height up"]
  HIGH_SILL: 15, // the ensuite's shoulder-high window [documented]
};

/** the main floor's square, 49 × 41 ft [documented: OSM way 570787191, about 15 × 12.6 m] */
export const HOUSE: Rect = [0, 0, 49, 41];
/** the stair from the entry foyer up into the playroom, through the floor [documented: listing; place assumed] */
export const STAIR: Rect = [20, 1, 23, 11];
/** the open sun deck cut into the square's north side, between the two wings [documented: plan, "hollowed-out square"] */
export const DECK: Rect = [20, 20, 33, 41];
/** the living wing: living room open to the north and east, the dining room and kitchen behind it [documented: plan] */
export const LIVING: Rect = [0, 18, 20, 41];
export const DINING: Rect = [0, 10, 20, 18];
export const KITCHEN: Rect = [0, 0, 12, 10];
export const LAUNDRY: Rect = [12, 0, 20, 10];
/** the playroom linking the wings, closed off from the deck by a curtain [documented: plan and listing] */
export const PLAYROOM: Rect = [20, 0, 33, 20];
/** the sleeping wing: the main bedroom and its ensuite on the south, a hall from the playroom, two bedrooms on the north
 * [documented: plan; sizes assumed] */
export const MAIN_BED: Rect = [33, 0, 49, 13];
export const HALL: Rect = [33, 13, 41, 20];
export const BED2: Rect = [33, 20, 49, 30];
export const BED3: Rect = [33, 30, 49, 41];
export const BATH: Rect = [41, 13, 49, 20];

/** the mural: Seidler's own, on the sleeping wing's wall facing the deck, seen from the living room [documented: MHNSW] */
export const MURAL = { x: 32, z0: 22, z1: 40, y0: 0, y1: 21 };

/** the ramp from the deck down to the garden, along the north face [documented: OSM's strip off the north face, plan] */
export const LANDING: Rect = [27, 41, 35, 49];
export const RAMP = { x0: -10, x1: 27, z0: 45, z1: 49 };
/** the ramp's top at x, in plates: from the deck's level down to the garden at its east end */
export const rampTop = (x: number) => Math.round(Y.GARDEN + ((Y.FLOOR - Y.GARDEN) * (x - RAMP.x0)) / (RAMP.x1 - RAMP.x0));

/** below, on the downhill side: the double garage in sandstone, open to the drive on the east [documented: three stone walls] */
export const GARAGE: Rect = [0, 0, 20, 18];
/** the entry foyer and its stair up to the playroom [documented: listing; place assumed] */
export const FOYER: Rect = [19, 0, 28, 12];
/** the recreation area under the living room and the deck, open to the garden [documented: listing] */
export const REC: Rect = [0, 18, 22, 41];
/** the caretaker's flat at the recreation area's end, under the deck [documented: listing; size assumed] */
export const FLAT: Rect = [22, 20, 33, 41];
/** everything on the lower level, cut into the slope */
export const LOWER: Rect = [0, 0, 33, 41];

/** the garden terrace below the house and the ramp, held by a sandstone wall [documented: retaining walls; size assumed] */
export const GARDEN: Rect = [-16, 41, 52, 64];

export const CENTER = { x: 24, y: 2, z: 20 };
export const SITE = { lat: -33.70974, lon: 151.14189, rotationDeg: 186 };

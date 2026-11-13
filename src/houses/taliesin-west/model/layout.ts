/**
 * Plan of Taliesin West's main building, in studs (1 stud ≈ 1 ft). Spec 077.
 *
 * Model frame: x along the spine, from the studio's north-west end toward the south-east (+x = real about 124.5°); z across it,
 * from the mountain side (−z, real about 34.5°) toward the valley and the prow (+z = real about 214.5°). The real world is turned
 * −34.5° to fit OSM's Drafting Studio (way 1498897839). y in plates (0.4 ft); y = 0 is the studio's finished floor.
 *
 * Sources (spec 077, Research): [documented] = HABS AZ-218-D (the Drafting Studio) and AZ-218-G (the Garden Room & Dining
 * Cove), Library of Congress, and Wikipedia; [scaled] = read off the HABS sheets (the studio's section DD and roof plan, the
 * Garden Room's plan); OSM = the outlines, which are [documented] as traced; [assumed] = everything else, from photographs.
 * The buildings outside HABS -D and -G are [assumed] in everything but their OSM outline (spec 077 A8).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];
export type Pt = [number, number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));
export const onRing = (x: number, z: number, r: Rect) => inRect(x, z, r) && (x === r[0] || z === r[1] || x === r[2] - 1 || z === r[3] - 1);
const N4: Pt[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
/** a cell of a footprint (union of rects) next to a cell outside it */
export const onEdge = (x: number, z: number, rs: Rect[]) => inAny(x, z, rs) && N4.some(([dx, dz]) => !inAny(x + dx, z + dz, rs));

/** heights in plates */
export const Y = {
  FLOOR: 0, // the studio's finished floor [documented: y = 0]
  FOOTING: -6, // the platform's footings, under each building's walls [assumed]
  SLAB: -3, // the floors' slabs [assumed]
  TERRACE: -6, // Sunset Terrace's lawn, 2.4 ft below the spine [assumed: OSM's steps down from the studio to the pool]
  POOL_WATER: -7, // the pool's water, one plate under the lawn
  POOL_FLOOR: -12,
  KIVA_FLOOR: -9, // the Kiva, sunk 3.6 ft [assumed: "partly underground"]
  KIVA_ROOF: 15,
  PERGOLA_TOP: 21, // 8.4 ft [scaled: 8′-6″, section DD]
  BASE_1: 6, // the studio's battered base: the lower course to 2.4 ft …
  BASE_2: 9, // … the upper one to 3.6 ft [assumed: "two battered courses"]
  CHIMNEY: 37, // 16 ft above the footings' top (y −3) [documented: 16 ft from the foundation]
  FLAT_ROOF: 22, // the flat roofs' underside, 8.8 ft [assumed]
};
/** the foundation's top, the level the chimney's 16 ft is measured from [assumed: the slab's underside] */
export const FOUNDATION_TOP = Y.SLAB;

// ---------------------------------------------------------------------------------------------------------------------------
// The Drafting Studio [documented: HABS AZ-218-D]
// ---------------------------------------------------------------------------------------------------------------------------

/** 108 × 30 ft [documented], its long axis on OSM's 124°/304° [documented: OSM]; the Vault's bay at the north-west end, which
 * OSM's trace leaves out, is x −10…−1 [assumed] */
export const STUDIO: Rect = [-10, 0, 98, 30];
/** the 13 cross beams: twelve even bays over the 108 ft [documented], one stud wide [assumed]; 8.9 ft centre to centre */
export const BEAMS_X: number[] = Array.from({ length: 13 }, (_, k) => Math.round(STUDIO[0] + (k * (STUDIO[2] - STUDIO[0] - 1)) / 12));
/** the five desert-masonry piers on the north-east side, every two bays [documented: five, about 16 ft apart] */
export const PIER_BEAMS = [2, 4, 6, 8, 10];
export const PIERS_X = PIER_BEAMS.map((k) => BEAMS_X[k]);
/** the two south-eastern bays on the north-east side: desert masonry [documented: 4′-6″], glass above it [assumed] */
export const NE_MASONRY: [number, number] = [BEAMS_X[10] + 1, STUDIO[2] - 1];
export const NE_MASONRY_TOP = 11; // 4.4 ft
/** the four pairs of doors onto the pergola [documented], between the piers [assumed: their places] */
export const STUDIO_DOORS: [number, number][] = [[12, 15], [30, 33], [48, 51], [65, 68]];
export const DOOR_HEAD = 18; // 7.2 ft [assumed]

/**
 * The shed roof [documented: falling north-east to south-west at 15°; scaled: 14′-0½″ above the floor at its high edge, about
 * 7 ft at the low]: in strips of 3 studs, each 2 plates below the last (14.9°), from the north-east eave (2′-1″ overhang
 * [documented], 2 studs) to the south-west eave over the window bays. The top of the strip at z, in plates.
 */
export const ROOF_Z: [number, number] = [-2, 31];
export const ROOF_HIGH = 35; // 14.0 ft
export function roofTop(z: number): number {
  const k = Math.min(Math.floor((z - ROOF_Z[0]) / 3), 9);
  return ROOF_HIGH - 2 * k;
}
export const ROOF_LOW = roofTop(ROOF_Z[1] - 1); // 17 plates, 6.8 ft
/** the panels are a brick thick (3 plates); a beam stands 2 plates proud of them [assumed] */
export const PANEL = 3;
export const BEAM_PROUD = 2;
/** a beam's bottom along the studio */
export const roofUnder = (z: number) => roofTop(z) - PANEL;

/** the south-west front: the battered base in two courses [documented]; the lower course's face at z = 30, the upper's at 29 */
export const SW_FACE = [STUDIO[3], STUDIO[3] - 1];
/** the window bays cantilevered over the base [documented], their glass at z = 30 from the base's top to the eave */
export const BAY_Z = STUDIO[3];
/** the Vault [documented: the first desert-masonry building, at the north-west end, under the studio's slope] */
export const VAULT: Rect = [-10, 0, -1, 30];
/** the walled patio beside it [documented], its place [assumed: OSM's stone wall, way 1498909633, runs there] */
export const PATIO: Rect = [-26, 4, -10, 26];
/** the three-walled masonry office bay [documented], north-east of the Vault [assumed] */
export const OFFICE_BAY: Rect = [-10, -10, -1, 0];
/** the fireplace shared with the kitchen at the south-east end [documented], and its chimney [documented: 16 ft] */
export const FIREPLACE: Rect = [91, 11, 97, 19];
export const CHIMNEY: Rect = [93, 13, 97, 17];
/** the flagstone area and the stepped fire pit at the south-east end [documented] */
export const FLAGSTONES: Rect = [79, 4, 91, 26];
export const FIRE_PIT: Rect = [82, 10, 88, 18];

/** the pergola on the north-east side [documented: OSM way 1498906503, 87 × 31 ft], its top at 8′-6″ [scaled] */
export const PERGOLA: Rect = [4, -31, 91, 0];
/** the central walk under it [documented: TCLF; OSM footway 1498906500 at z ≈ −13] */
export const WALK_Z: [number, number] = [-16, -10];
/** the gold-and-white chequered brise-soleil on the north-east front [documented], under the eave [assumed: its band] */
export const CHEQUER_Y: [number, number] = [22, 30];

// ---------------------------------------------------------------------------------------------------------------------------
// The rest of the spine [assumed but for OSM's outlines]
// ---------------------------------------------------------------------------------------------------------------------------

/** the kitchen and the Original Dining Room [assumed: OSM way 1498902780, building=roof] */
export const KITCHEN: Rect[] = [[98, -2, 102, 8], [98, 8, 123, 66], [105, 66, 114, 70]];
/** the Dining Room, the former loggia [assumed: OSM way 1498910891] */
export const DINING: Rect[] = [[123, 12, 138, 62], [138, 7, 170, 62]];
/** the Breezeway: a roof on posts [documented: OSM way 1498902779, building=roof] */
export const BREEZEWAY: Rect[] = [[170, 7, 192, 38]];
/** the entrance to the Garden Room, under a flat roof with a pentagon skylight [documented: HABS -G], in OSM's Dining Cove way */
export const ENTRANCE: Rect[] = [[192, 7, 220, 24]];
/** the pentagon skylight [documented], its size [assumed] */
export const SKYLIGHT: Pt[] = [[206, 11], [210, 14], [208.5, 19], [203.5, 19], [202, 14]];
/** Wright's quarters, exterior only [assumed: OSM way 1498902778] */
export const QUARTERS: Rect[] = [[220, 9, 265, 27], [230, -6, 243, 9], [265, 9, 316, 32], [277, -4, 323, 9], [316, 9, 323, 23]];
/** the covered passage between the Kiva and the quarters [assumed: OSM way 1498906504, building=roof] */
export const PASSAGE: Rect[] = [[225, -5, 230, 9]];
/** the Kiva [documented: OSM way 1498906505; partly underground, a concrete roof] */
export const KIVA: Rect[] = [[202, -45, 228, -15], [209, -52, 219, -45], [228, -37, 235, -23]];
/** the Kiva Fountain's rill [documented: OSM way 1498886749, 39 × 8 ft] */
export const RILL: Rect = [207, -13, 248, -6];

// ---------------------------------------------------------------------------------------------------------------------------
// The Garden Room and the Dining Cove [documented: HABS AZ-218-G]
// ---------------------------------------------------------------------------------------------------------------------------

/** 53′-5″ × 29′-6″ [documented], its long side across the spine; placed inside OSM's two ways (spec 077 Q5) [assumed] */
export const GARDEN_ROOM: Rect = [207, 39, 236, 92];
/** 23′-4″ × 15′-2″ [documented], north of the Garden Room [assumed: HABS's "connected by a glass door to the north"] */
export const DINING_COVE: Rect = [197, 24, 220, 39];
/** the door between them [documented: a glass door], in the Garden Room's north wall [assumed: its place] */
export const COVE_DOOR: [number, number] = [212, 215];
/** the seven red fins over the Garden Room [documented: seven structural fins], evenly over its main roof [assumed] */
export const GR_MAIN_Z: [number, number] = [GARDEN_ROOM[1], 84];
export const FINS_Z: number[] = Array.from({ length: 7 }, (_, k) => GR_MAIN_Z[0] + Math.round(((k + 1) * (GR_MAIN_Z[1] - GR_MAIN_Z[0])) / 8));
/** the main roof slopes one way [documented: from close to 8 ft to around 11 ft]: 1 plate every 4 studs up toward the east */
export const grRoofTop = (x: number) => 20 + Math.floor((Math.min(Math.max(x, GARDEN_ROOM[0]), GARDEN_ROOM[2] - 1) - GARDEN_ROOM[0]) / 4);
/** the south end's separate roof, sloping south [documented], 2 plates every 3 studs [assumed] */
export const grSouthTop = (z: number) => 24 - 2 * Math.floor((z - GR_MAIN_Z[1]) / 3);
/** the big desert-masonry fireplace at the south end [documented] */
export const GR_FIREPLACE: Rect = [217, 86, 226, 91];
export const GR_CHIMNEY: Rect = [219, 88, 224, 91];
/** the Dining Cove's fireplace [documented], at its west end [assumed] */
export const COVE_FIREPLACE: Rect = [198, 28, 201, 35];

/** every building of the core, for the ground and the walks: their footprints */
export const CORE: { name: string; rects: Rect[] }[] = [
  { name: 'studio', rects: [STUDIO] },
  { name: 'kitchen', rects: KITCHEN },
  { name: 'dining', rects: DINING },
  { name: 'breezeway', rects: BREEZEWAY },
  { name: 'entrance', rects: ENTRANCE },
  { name: 'cove', rects: [DINING_COVE] },
  { name: 'garden', rects: [GARDEN_ROOM] },
  { name: 'quarters', rects: QUARTERS },
  { name: 'passage', rects: PASSAGE },
  { name: 'kiva', rects: KIVA },
  { name: 'vault-office', rects: [OFFICE_BAY] },
];
export const inCore = (x: number, z: number) => CORE.some((c) => inAny(x, z, c.rects));

// ---------------------------------------------------------------------------------------------------------------------------
// Sunset Terrace, the prow, Indian Rock Terrace and the pool
// ---------------------------------------------------------------------------------------------------------------------------

/**
 * Sunset Terrace [documented: prow-shaped, on the main building's west and south sides, lawn]: a level lawn below the spine,
 * held by battered walls along its two 45° sides [documented: the 45° lines; OSM's gravel walk, way 1498897846, runs outside
 * them], meeting in the prow's point toward the south-west [documented]. Its north edge follows the buildings and the paved walk
 * along the studio's front [documented: OSM footway 1498897842].
 */
export const PROW_TIP: Pt = [121.5, 161.5];
/** the west side: z − x = 40; the east side: z + x = 283 [assumed: 3 ft inside OSM's walk] */
export const PROW_WEST = 40;
export const PROW_EAST = 283;
export const TERRACE_POLY: Pt[] = [[-3, 37], [70, 37], [70, 31], [98, 31], [98, 62], [170, 62], [170, 38], [207, 38], [207, 76], PROW_TIP];
/** the paved walk along the studio's front, at the spine's level [documented: OSM footway 1498897842] */
export const FRONT_WALK: Rect = [-10, 31, 70, 37];
/** Indian Rock Terrace [documented: a stepped pyramid topped by a petroglyph boulder, in the corner the studio and the dining
 * rooms wrap round], west of OSM's steps down to the pool (way 1498897840) [assumed: its size, four tiers] */
export const INDIAN_ROCK: Rect = [70, 38, 90, 60];
export const ROCK_TIERS = 4;

/**
 * The Prow Pool [documented: OSM way 1498886748, a right isosceles triangle, legs of 43.2 and 41.8 ft on the grid, the
 * hypotenuse at 45°]: its right angle at the north-east corner (x = 92, z = 67), legs of 42 studs.
 */
export const POOL = { x1: 93, z0: 67, leg: 42 };
export const inPool = (x: number, z: number) =>
  x < POOL.x1 && z >= POOL.z0 && POOL.x1 - 1 - x + (z - POOL.z0) < POOL.leg;

export const CENTER = { x: 110, y: 6, z: 40 };
export const SITE = { lat: 33.6064, lon: -111.8453, rotationDeg: -34.5 };

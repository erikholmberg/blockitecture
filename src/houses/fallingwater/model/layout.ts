/**
 * Plan of Fallingwater, in studs (1 stud ≈ 1 ft). Spec 017.
 *
 * Model frame = the HABS PA-5346 measured drawings (Library of Congress, 2010 Peterson Prize entry; sheets 3–6 plans,
 * 7 south elevation, 10 sections, all at 1/4″ = 1′-0″): x = plan right, z = plan down, measured on the scans at
 * 100 px/ft with the same origin on every plan sheet (they register: the bridge sits at the same place on each).
 * The plans' "up" points about 315° (the sheets' north arrow; the OSM fit gives 311°): the terraces face the stream,
 * south-east. The real world is turned 49° to fit (scripts/houses/fallingwater.mjs).
 *
 * [documented] = read off the HABS sheets (or the NHL nomination); [assumed] = my reading where the sheets don't say.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

/** heights in plates (0.4 ft); y = 0 is the main (first) floor */
export const Y = {
  L1: 0, // main level 0′-0″ [documented: sheets 7, 10]
  L2: 23, // second level terrace 9′-4″ → 9.2 ft [documented]
  L3: 44, // third level terrace 17′-5½″ → 17.6 ft [documented]
  ROOF: 63, // roof ≈ 25 ft [documented: 24′-11½″ on sheet 10]
  TOWER: 81, // main tower (chimney) 32′-4½″ → 32.4 ft; "rises 30 ft above the first story" (NHL) [documented]
  STREAM: -26, // Bear Run above the falls, 10.5 ft below the main level (sheet 7) [documented]
  POOL: -71, // below the upper falls, about 18 ft lower (sheet 7: the falls drawn from 12.5 to 30.5 ft below) [documented]
  LEDGE: -24, // the rock ledge the bolsters stand on, just above the water [documented: sheet 7]
  PLATFORM: -21, // the hatch stair's landing over the water: "top of platform", about 8.5 ft below (sheet 10) [documented]
  PARAPET: 6, // parapets 26 in high (NHL) → 2.4 ft [documented]
  BAND_DOWN: 6, // the trays' deep edge bands drop about 2.2–3 ft below each floor (sheet 7) [documented]
  GUEST: 69, // the guest wing's floor, 28 ft up the hill [assumed: sheet 10's ground line and the terrain]
};

/** the first-floor tray: living room, terraces, kitchen and the rooms along the hill [documented: sheet 4] */
export const LIVING: Rect = [30, 20, 66, 67]; // "Living room 48′-0″ × 35′-8″" (z × x); the south part ends at x 52
export const LIVING_SOUTH: Rect = [30, 52, 52, 67];
export const EAST_TERRACE: Rect[] = [[66, 38, 78, 67], [52, 52, 66, 67]]; // "Terrace 28′-1″ × 23′-1″", around the hatch
export const WEST_TERRACE: Rect = [15, 52, 30, 68]; // "Terrace 14′-10″ × 13′-2″"
export const KITCHEN: Rect = [15, 12, 30, 30]; // "Kitchen 15′-9″ × 12′-0″"
export const WEST_STRIP: Rect = [25, 30, 30, 52]; // the glazed west wall and its built-in seat
export const SERVANTS: Rect = [4, 15, 15, 23]; // "Servants' sitting room 11′-5″ × 9′-4″"
export const ENTRY: Rect = [41, 20, 66, 33]; // entry, coats, dining
export const LOGGIA: Rect = [66, 22, 80, 33];
export const TRAY1: Rect[] = [LIVING, ...EAST_TERRACE, WEST_TERRACE, KITCHEN, WEST_STRIP, SERVANTS, ENTRY, LOGGIA];
/** the part of the first tray that is cantilevered over the rock and the stream (the rest sits on the hill) */
export const CANTILEVER1: Rect[] = [[15, 38, 78, 68]];

/** the hatch: a glass hatch in the living room's terrace and a stair hung from it, down to the stream [documented] */
export const HATCH: Rect = [53, 53, 66, 61];
export const HATCH_LANDING: Rect = [61, 53, 68, 61];

/** the bolsters: four concrete piers on the rock carrying the living room [documented: "four bolsters"; sheets 3, 7] */
export const BOLSTERS: Rect[] = [[32, 38, 34, 52], [42, 38, 44, 52], [52, 38, 54, 52], [61, 38, 63, 52]];

/** the stone chimney and hearth stack, from the rock to the tower top [documented: sheets 4–7] */
export const CHIMNEY: Rect = [27, 27, 31, 41];
/** the hearth's opening in the stack, facing the living room, with the kettle's niche [documented: sheet 4] */
export const FIREPLACE: Rect = [29, 31, 31, 40];
export const FIREPLACE_H = 8;
/** the boulder that comes up through the living-room floor in front of the hearth [documented: sheet 4, stippled] */
export const BOULDER: Rect = [31, 30, 39, 37];

/** stone walls of the first floor (Pottsville sandstone, ~2 ft thick) [documented: hatched on sheet 4] */
export const STONE1: Rect[] = [
  [15, 12, 17, 30], // kitchen, west
  [17, 11, 33, 13], // kitchen, north
  [31, 13, 33, 20],
  [33, 19, 61, 21], // the north wall of the living room and dining, against the hill and the drive
  [41, 24, 43, 33], // the entry wall
  [61, 21, 66, 24],
  [62, 30, 66, 45], // the stone core on the east side of the living room
  [27, 51, 30, 54], // piers at the south glass
  [51, 51, 54, 54],
  [4, 14, 15, 15], // servants' room, north
  [3, 14, 4, 23],
];

/** the second floor [documented: sheet 5] */
export const MASTER: Rect = [29, 26, 46, 46]; // "Master bedroom 17′-11″ × 16′-9″"
export const BATH2: Rect = [46, 33, 54, 46];
export const GUEST_ROOM: Rect = [54, 30, 66, 46]; // "Guest bedroom 15′-4″ × 12′-8″"
export const EAST_TERRACE2: Rect = [66, 33, 94, 46]; // "Terrace 25′-11″ × 10′-7″": the only terrace with a canopy
export const SOUTH_TERRACE2: Rect = [29, 46, 54, 74]; // "Terrace 25′-2″ × 24′-1″": reaches 6 ft past the first floor
export const DRESSING: Rect = [15, 12, 30, 30]; // "Dressing room 17′-0″ × 11′-8″"
export const HALL2: Rect = [30, 12, 61, 26];
export const WEST_TERRACE2: Rect = [3, 10, 15, 26];
export const TRAY2: Rect[] = [MASTER, BATH2, GUEST_ROOM, EAST_TERRACE2, SOUTH_TERRACE2, DRESSING, HALL2, WEST_TERRACE2];
/** the trellis of concrete beams over the hatch, at the second level [documented: sheet 5] */
export const TRELLIS2: Rect = [54, 46, 66, 73];
/** the second floor's bridge over the drive to the hill, where the walkway to the guest wing starts [documented] */
export const BRIDGE2: Rect = [49, 0, 56, 12];
export const STONE2: Rect[] = [
  [15, 12, 17, 30],
  [17, 11, 31, 13],
  [31, 11, 48, 13],
  [46, 13, 48, 20],
  [56, 13, 61, 26], // the stair core
  [27, 41, 31, 45], // the chimney continues south as the bedroom's west wall
];

/** the third floor [documented: sheet 6] */
export const STUDY: Rect = [16, 12, 30, 27]; // "Study 17′-9″ × 11′-3″"
export const GALLERY: Rect = [30, 20, 56, 27]; // "Gallery 17′-2″ × 5′-7″" and the sleeping alcove
export const BATH3: Rect = [30, 12, 48, 20];
export const TERRACE3: Rect = [31, 27, 65, 40]; // "Terrace 33′-7″ × 12′-4″"
export const TRAY3: Rect[] = [STUDY, GALLERY, BATH3, TERRACE3];
export const STONE3: Rect[] = [[16, 12, 18, 27], [18, 11, 48, 13], [46, 13, 48, 20]];
/** the long roof over the second-floor bedrooms, reaching east as the east terrace's canopy (dotted on sheet 6) */
export const CANOPY: Rect[] = [[20, 40, 100, 47], [66, 34, 100, 40]];
/** the main roof over the third floor */
export const ROOF: Rect = [14, 10, 58, 29];

/** the drive along the north bank, under the trellis beams, to the bridge over Bear Run [documented: sheets 2, 4] */
export const DRIVE: Rect = [60, 5, 132, 32];
export const DRIVE_TRELLIS: Rect = [55, 5, 93, 30];
/** trees the trellis beams were bent around [documented: two circles in the trellis on sheet 4] */
export const TRELLIS_TREES: [number, number][] = [[73, 23], [86, 30]];
/** holes left in the loggia's floor for those trees */
export const TREE_HOLES: Rect[] = [[72, 22, 75, 25]];
/** the bridge: "36′-2″ × 14′-3″" over its abutments; the span over the water about 28 ft (NHL) [documented] */
export const BRIDGE: Rect = [113, 33, 128, 82];
export const BRIDGE_SPAN: [number, number] = [47, 75];

/** the guest wing, up the hill, from OSM way 354728128 (L-shaped) [documented footprint; heights assumed] */
export const GUEST_WINGS: Rect[] = [[38, -72, 108, -49], [14, -103, 44, -60]];
/** the covered walkway climbing from the second-floor bridge to the guest wing, along OSM way 354728129's centreline */
export const WALKWAY: [number, number][] = [[52, 2], [50, -6], [43, -9], [35, -13], [29, -20], [25, -29], [24, -39], [27, -47], [33, -54], [39, -60]];
export const WALK_HALF = 3;

/** house centre: camera target and where the ravine wave starts */
export const CENTER = { x: 50, y: 6, z: 45 };

/** Where the house is in the real world: OSM's "Fallingwater" (wikidata Q463179), turned 49°. */
export const SITE = { lat: 39.90623, lon: -79.46797, rotationDeg: 49 };

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));

/** total area of a union of rects, in ft² (cells) */
export function area(rs: Rect[]): number {
  const x0 = Math.min(...rs.map((r) => r[0])), x1 = Math.max(...rs.map((r) => r[2]));
  const z0 = Math.min(...rs.map((r) => r[1])), z1 = Math.max(...rs.map((r) => r[3]));
  let n = 0;
  for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) if (inAny(x, z, rs)) n++;
  return n;
}

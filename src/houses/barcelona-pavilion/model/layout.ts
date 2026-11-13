/**
 * Plan of the Barcelona Pavilion, in studs (1 stud ≈ 1 ft). Spec 075.
 *
 * Model frame: x along the plinth from the small pool's end (x = 0, real about 333°, NNW) to the annex's end (+x = real about
 * 153°, SSE); z from the front on the Plaça de Carles Buïgas (z = 0, real about 63°, ENE) to the back (+z = real about 243°,
 * WSW, up the slope of Montjuïc). The real world is turned −63° to fit OSM's outline of the main roof (way 67917935).
 *
 * One grid (Q3): Mies's 1.09 m module [documented] is drawn as 3.5 studs on average, so the travertine slabs (2 × 1 modules)
 * are 7 × 3 and 7 × 4 studs in turn and every second joint lands on the true grid; the building is about 2% small. Module
 * line m lies at m × 3.5 studs; `M(m)` is the stud nearest it.
 *
 * [documented] = es/en Wikipedia, the Fundació Mies van der Rohe, architecture-history.org, barcelonaurbana.com and OSM's ways
 * for the roof, the annex, the pools, the walls, the stair and the statue; [scaled] = read off the published plan (as
 * reproduced in many places) and fitted to OSM's ways; [assumed] = what those don't settle, from photographs.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];

/** the module: 1.09 m [documented], 3.5 studs on average */
export const MODULE = 3.5;
export const M = (m: number) => Math.round(m * MODULE);

/** the plinth: 56.62 × 18.48 m [documented], drawn as 52 × 17 modules (55.5 × 18.3 m) */
export const PLINTH: Rect = [0, 0, M(52), M(17)];
/** in front of the main roof's NNW half the plinth steps back to the roof's edge, and the stair comes up beside it
 * [documented: OSM's paved areas and the stair, way 1104411454; the stair rises toward the SSE] */
export const NOTCH: Rect = [0, 0, 38, M(4)];
/** the entrance stair: 8 steps [documented], running along the plinth's front, 2 studs a tread [scaled: OSM's line] */
export const STAIR: Rect = [38, 0, 52, M(4)];
export const STEPS = 8;

/** heights in plates (0.4 ft); y = 0 is the plinth's travertine top */
export const Y = {
  GROUND: -11, // the paving at the foot of the stair: the plinth 1.34 m high [documented: 1.30 m, a guide; 8 steps agree]
  CEILING: 25, // the roofs' underside: 3.05 m clear [documented: 3.10 m]
  ROOF: 27, // the roofs' top: slabs 24 cm thick [documented: about 24 cm]
  POOL_FLOOR: -5, // the top of the pools' linings: water 0.49 m deep [assumed: their depth isn't published]
  WATER: -1, // the water's surface, a plate under the coping [assumed]
};

/** the main roof: 23 × 13 modules, fitted to OSM's way 67917935 (IoU 1.000) [documented: OSM] */
export const ROOF: Rect = [M(4), M(4), 95, M(17)];
/** the service annex at the SSE end, reaching back beyond the plinth into the slope [documented: OSM's way 1104411434] */
export const ANNEX: Rect = [M(42), M(13), M(52), 81];
/** its own small roof, a stud proud of its walls at the front and the back [assumed] */
export const ANNEX_ROOF: Rect = [M(42) - 1, M(13) - 1, M(52), 82];

/** the large pool by the entrance, in its U of travertine [documented: OSM's way 1104411435, about 22 × 10 m] */
export const LARGE_POOL: Rect = [104, 1, M(52) - 1, 34];
/** the small pool at the far end, in its U of green marble [documented: OSM's way 1104411431, about 12.3 × 4.6 m] */
export const SMALL_POOL: Rect = [1, 17, M(4), 57];

/**
 * The eight cruciform columns: two rows of four [documented: eight], six modules apart along the roof and across it
 * [assumed: their spacing isn't published; on module lines]. Each cross is centred on cell (x, z), i.e. at x + 0.5.
 */
export const COLUMN_X = [7, 13, 19, 25].map((m) => Math.floor(m * MODULE));
export const COLUMN_Z = [7, 13].map((m) => Math.floor(m * MODULE));
export const COLUMNS: [number, number][] = COLUMN_Z.flatMap((z) => COLUMN_X.map((x) => [x, z] as [number, number]));
export const inColumn = (x: number, z: number) =>
  COLUMNS.some(([cx, cz]) => (x === cx && Math.abs(z - cz) <= 1) || (z === cz && Math.abs(x - cx) <= 1));

export type Stone = 'travertine' | 'tinos' | 'alpine' | 'onyx';
export type Tint = 'green' | 'grey' | 'black' | 'clear' | 'frosted';
export interface Wall { r: Rect; stone: Stone; note: string }
export interface Pane { r: Rect; tint: Tint; note: string }

/** the onyx wall, free-standing in the middle of the roofed space: 2 panels of 1.55 m high, 3.10 m [documented], 6 modules
 * long [assumed: its length isn't published], between the two rows of columns [scaled] */
export const ONYX: Rect = [M(13) - 1, M(11), M(19), M(11) + 1];

/** the walls of stone, one stud thick (each piece of a U is its own rect; a U's pieces meet, the free walls don't) */
export const WALLS: Wall[] = [
  // the small pool's U of green marble, open toward the roofed space [documented: OSM's way 1104411432; Tinos verde antico
  // assumed from photographs]
  { r: [0, M(4), 1, M(17)], stone: 'tinos', note: "the small court's end" },
  { r: [1, M(4), M(6), M(4) + 1], stone: 'tinos', note: "the small court's front arm" },
  { r: [1, M(17) - 1, M(8), M(17)], stone: 'tinos', note: "the small court's back arm, on under the roof" },
  // the long wall of Alpine green marble behind the onyx, under the roof [scaled: the plan; the stone assumed from photographs]
  { r: [M(10), M(15), M(26), M(15) + 1], stone: 'alpine', note: 'the long marble wall' },
  // the travertine wall from the roof's edge to the annex, behind the large pool's court [documented: OSM's way 1104411433]
  { r: [M(28), M(15), M(42), M(15) + 1], stone: 'travertine', note: 'the back wall of the large court' },
  // the U round the large pool's end [documented: OSM's way 1104411436]: the end, and the arm along the front
  { r: [M(52) - 1, 0, M(52), M(13)], stone: 'travertine', note: "the large court's end" },
  { r: [M(43), 0, M(52) - 1, 1], stone: 'travertine', note: "the large court's front arm" },
];

/** the glass walls, in thin chrome frames [documented: green, black, grey and clear glass, and a frosted light wall; their
 * places scaled from the plan] */
export const PANES: Pane[] = [
  { r: [M(7), M(6), M(22), M(6) + 1], tint: 'green', note: 'the long green glass wall along the front' },
  { r: [M(9), M(7), M(9) + 1, M(12)], tint: 'grey', note: 'the grey glass wall across the space' },
  { r: [M(4), M(8), M(4) + 1, M(14)], tint: 'clear', note: 'the clear glass toward the small court' },
  { r: [M(24), M(9), M(24) + 1, M(13)], tint: 'black', note: 'the black glass wall at the roof\'s SSE end' },
  { r: [M(4), M(5), M(6), M(5) + 1], tint: 'frosted', note: 'the light wall: frosted glass, lit from within' },
];

/** the long travertine bench along the back wall of the large court [documented] */
export const BENCH: Rect = [M(29), M(15) - 3, M(40), M(15)];

/** Kolbe's statue (a stand-in, Q2), at OSM's node 10106337168 in the small pool's back corner [documented: OSM] */
export const STATUE: [number, number] = [3, 51];

export const CENTER = { x: 91, y: 4, z: 30 };
export const SITE = { lat: 41.370532, lon: 2.149948, rotationDeg: -63 };

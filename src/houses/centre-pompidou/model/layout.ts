/**
 * Plan and section of the Centre Pompidou, in studs (1 stud ≈ 1 ft) and plates (0.4 ft). Spec 080.
 *
 * Model frame: x along the building from its south end (rue Saint-Merri, x = 0) to its north end (rue Rambuteau), real 19.8°;
 * z across it from the piazza (west, z = 0 on the tie line) to rue Beaubourg (east), real 109.8°. y = 0 is the Forum's floor,
 * at the foot of the west front. The real world is turned 70.2°.
 *
 * [documented] = the sources in specs/080-centre-pompidou.md (14 portal frames 12.80 m apart; 28 columns 49 m high and 85 cm
 * across; 84 trusses of 48 m span, 2.5 m deep; 168 gerberettes 8 m long; St Andrew's crosses two levels high; storeys of 7 m;
 * 166 × 60 m; OSM's outline); [scaled] = read off OSM and photographs; [assumed] = what those don't settle (no section was
 * found, so every level's height is assumed from the documented 7 m storeys and 45.5 m, spec 080 Q10).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];
export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];

/** 14 portal frames 12.80 m apart [documented]: 42 studs (42.0 ft) a bay, 13 bays, 546 studs from the first to the last */
export const FRAMES = 14;
export const BAY = 42;
/** a frame's plane: the middle stud of its columns; the columns are 3 × 3 studs (85 cm) [documented], x 42i … 42i + 3 */
export const frameX = (i: number) => BAY * i + 1;
export const COL = 3;
/** the cage's length over its end columns: 549 studs (167.3 m; OSM's west edge: 167.3 m) */
export const LENGTH = BAY * (FRAMES - 1) + COL;

/**
 * Across the building: the tie lines on the two long fronts, the column lines 157 studs apart centre to centre (48 m)
 * [documented], 20 studs (6.1 m) from each tie line [scaled], so 198 studs (60.4 m) overall [documented: 60 m].
 */
export const TIE_W = 0;
export const TIE_E = 197;
export const WIDTH = TIE_E + 1;
/** the west columns' cells z 19…21 (centre 20.5), the east columns' z 176…178 (centre 177.5) */
export const COL_W = 19;
export const COL_E = 176;
/** the floors span between the column lines: z 22…175 */
export const FLOOR_Z0 = COL_W + COL;
export const FLOOR_Z1 = COL_E;
/** the west front's glass, just inside the columns; the east front's panels likewise [documented: set back behind the cage] */
export const GLASS_Z = FLOOR_Z0;
export const PANEL_Z = FLOOR_Z1 - 1;

/**
 * The levels [assumed, spec 080 Q10]: the Forum (level 0) 10 m high [documented: 10 m], with level 1 a mezzanine inside it;
 * levels 2–6 7 m each [documented: storeys of 7 m]; the roof over level 6. Six levels of trusses carry levels 2–6 and the roof
 * [documented: 84 beams = 14 × 6]. TRUSS_Y[t] is the top of the floor that truss level t carries.
 */
export const FORUM_H = 82;
export const STOREY = 57;
export const TRUSS_Y = [0, 1, 2, 3, 4, 5].map((t) => FORUM_H + STOREY * t);
/** the roof's top: 82 + 5 × 57 = 367 plates, 146.8 ft = 44.7 m over the Forum's floor [documented: 45.5 m on the piazza side] */
export const ROOF_Y = TRUSS_Y[5];
/** level n's floor (n = 0 the Forum, 2–6 the storeys, 7 the roof) */
export const levelY = (n: number) => (n === 0 ? 0 : n === 1 ? MEZZ_Y : TRUSS_Y[n - 2]);
/** the mezzanine (level 1) inside the Forum's height [assumed] */
export const MEZZ_Y = 41;
/** a floor slab: 2 plates under each level's floor [assumed] */
export const SLAB = 2;
/** a truss: 20 plates deep (2.5 m) [documented], under the slab */
export const TRUSS_D = 20;
export const trussBottom = (t: number) => TRUSS_Y[t] - SLAB - TRUSS_D;
/** a gerberette: 8 plates deep at the column, 4 at its tips [scaled], under the slab beside the truss's end */
export const GERB_D = 8;
export const gerbBottom = (t: number) => TRUSS_Y[t] - SLAB - GERB_D;
/**
 * A gerberette's reach across: 26 studs (8 m) [documented], from the tie at its outer tip, round its column, to its short inner
 * arm under the floor's edge. The trusses span between the inner arms' tips [documented: each joined to the columns by a
 * gerberette].
 */
export const GERB_W: [number, number] = [TIE_W, FLOOR_Z0 + 4];
export const GERB_E: [number, number] = [FLOOR_Z1 - 4, TIE_E + 1];
export const TRUSS_Z: [number, number] = [GERB_W[1], GERB_E[0]];

/** the columns: from their footings 24 plates under the Forum to 11 plates over the roof: 402 plates, 49 m [documented] */
export const COL_Y0 = -24;
export const COL_Y1 = ROOF_Y + 11;
/** the substructure's top: the concrete under the Forum, from the dig's floor [documented: a concrete box; its depth assumed] */
export const DIG_Y = -30;

/** the building's footprint, tie line to tie line */
export const FOOTPRINT: Rect = [0, 0, LENGTH, WIDTH];
/** the strip by rue Beaubourg where the ground drops to the Forum's level, behind a retaining wall [assumed] */
export const AREA_E: Rect = [0, WIDTH, LENGTH, WIDTH + 3];

/**
 * The St Andrew's crosses: two levels high, fixed on the gerberettes' tips, in every bay of both long fronts [documented]. Which
 * levels they pair isn't published: here levels 3–5 and 5–7 (the roof) [scaled: photographs show the top tier at the roof], and
 * a one-level tier over the Forum's front [scaled].
 */
export const CROSS_TIERS: [number, number][] = [[0, 1], [1, 3], [3, 5]];

/**
 * The Chenille [scaled from photographs; spec 080: only "zigzag" and "transparent tubes" are documented]: a glazed tube in the
 * west front's outer zone, between the tie line and the columns, z 3…16. It climbs from the piazza's level to level 6 in five
 * sloped flights, each rising toward the south (the left of the photographs from the piazza) [scaled], one per bay but the first,
 * which takes two for the Forum's 10 m, a bay of level gallery between one flight and the next, so it climbs in a sawtooth; and a
 * horizontal gallery (coursive) runs along the whole front at each level it reaches.
 */
export const TUBE_Z: [number, number] = [3, 17];
export const TUBE_H = 24;
export interface Flight { from: number; to: number; xLow: number; xHigh: number }
/** each flight: the level it leaves and the one it reaches, and its ends (the low end to the north, the high to the south) */
export const FLIGHTS: Flight[] = [
  { from: 0, to: 2, xLow: frameX(12) - 2, xHigh: frameX(10) + 1 },
  { from: 2, to: 3, xLow: frameX(9) - 2, xHigh: frameX(8) + 1 },
  { from: 3, to: 4, xLow: frameX(7) - 2, xHigh: frameX(6) + 1 },
  { from: 4, to: 5, xLow: frameX(5) - 2, xHigh: frameX(4) + 1 },
  { from: 5, to: 6, xLow: frameX(3) - 2, xHigh: frameX(2) + 1 },
];
/** a flight's floor (the top of its escalator) at x: one step every 2 studs, from its low end to its high end */
export function flightY(f: Flight, x: number): number {
  const y0 = levelY(f.from), y1 = levelY(f.to);
  const u = Math.min(1, Math.max(0, (f.xLow - x) / (f.xLow - f.xHigh)));
  return y0 + Math.round((y1 - y0) * u);
}
/** the galleries along the front: levels 2–6 [scaled] */
export const GALLERY_LEVELS = [2, 3, 4, 5, 6];

/**
 * The services on the east front [documented: blue for air, green for water, yellow for electricity, red for moving people;
 * their layout scaled from photographs]: vertical runs in the outer zone between the column line and the tie line (z 179…196),
 * clear of the gerberettes' planes, repeated bay by bay.
 */
export type Service = 'air' | 'water' | 'power' | 'lift';
export interface Run { x: number; z: number; w: number; d: number; kind: Service; top: number }
export const RUNS: Run[] = Array.from({ length: FRAMES - 1 }, (_, b) => {
  const x0 = frameX(b) + 2;
  const out: Run[] = [];
  // the big air ducts in every other bay, and the lift shafts in four [scaled]
  if (b % 2 === 0) out.push({ x: x0 + 4, z: 185, w: 6, d: 6, kind: 'air', top: ROOF_Y + 18 });
  else out.push({ x: x0 + 5, z: 186, w: 4, d: 4, kind: 'air', top: ROOF_Y + 10 });
  out.push({ x: x0 + 14, z: 181, w: 2, d: 2, kind: 'water', top: ROOF_Y + 4 });
  out.push({ x: x0 + 18, z: 181, w: 2, d: 2, kind: 'water', top: ROOF_Y + 4 });
  out.push({ x: x0 + 22, z: 180, w: 1, d: 2, kind: 'power', top: ROOF_Y + 3 });
  out.push({ x: x0 + 24, z: 180, w: 1, d: 2, kind: 'power', top: ROOF_Y + 3 });
  if ([2, 5, 8, 11].includes(b)) out.push({ x: x0 + 28, z: 184, w: 7, d: 7, kind: 'lift', top: ROOF_Y + 22 });
  else out.push({ x: x0 + 30, z: 188, w: 3, d: 3, kind: 'air', top: ROOF_Y + 6 });
  return out;
}).flat();

/** where the storey bands break the runs into pieces: the Forum, the storeys and the roof */
export const BANDS = [0, ...TRUSS_Y];

export const CENTER = { x: 274, y: 60, z: 99 };
export const SITE = { lat: 48.8606, lon: 2.3522, rotationDeg: 70.2 };

/**
 * Fallingwater's structure (spec 017): the bolsters and stone piers on the rock, the first-floor tray cantilevered over
 * the falls, the stone walls and chimney, the second- and third-floor trays with their deep ochre parapet bands, the
 * hatch stair hung down to the stream, the bridge over Bear Run, the second-floor bridge to the hill, the covered
 * walkway's stone treads, and the guest wing's floor and walls. Heights and plans: layout.ts (HABS PA-5346).
 */
import { C } from '@/engine/catalog';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BOLSTERS, BRIDGE, BRIDGE2, BRIDGE_SPAN, CHIMNEY, FIREPLACE, FIREPLACE_H, GUEST_WINGS, HATCH, HATCH_LANDING, inRect, Rect, STONE1, STONE2,
  STONE3, TRAY1, TRAY2, TRAY3, TREE_HOLES, WALK_HALF, Y,
} from './layout';
import { groundPlates, stepTop, walkwayAt, WALL_Z } from './site';

/** the light ocher of the concrete ("dead rhododendron") and the Cherokee red of the steel: the house's only two paint colours */
export const OCHRE = 0xd9c193;
export const CHEROKEE = 0xa33b2b;
/** waxed flagstone floors [documented] */
export const FLAG = [0x6e6c63, 0x7a776c, 0x67655d, 0x74716a];

/** Pottsville sandstone laid in rough horizontal courses, some stones projecting (colour runs along each course) */
export function stone(x: number, y: number, z: number): number {
  const r = hash2(Math.floor((x + z * 1.7) / 3) + Math.floor(y / 3) * 31, Math.floor(y / 3) * 7);
  return r < 0.28 ? 0x8a8070 : r < 0.52 ? 0x9b907b : r < 0.72 ? 0x7a7163 : r < 0.88 ? 0xa59a84 : 0x6c645a;
}
export const flag = (x: number, _y: number, z: number) => FLAG[Math.floor(hash2(Math.floor(x / 2) * 3 + 1, Math.floor(z / 2)) * FLAG.length)];

const inAnyR = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));

/** a slab over the union of `rects`: concrete from y0 to top−1 and flagstone on top, minus holes */
function slab(b: Builder, rects: Rect[], y0: number, top: number, holes: Rect[] = []) {
  const x0 = Math.min(...rects.map((r) => r[0])), x1 = Math.max(...rects.map((r) => r[2]));
  const z0 = Math.min(...rects.map((r) => r[1])), z1 = Math.max(...rects.map((r) => r[3]));
  const mask = (x: number, z: number) => inAnyR(x, z, rects) && !inAnyR(x, z, holes);
  for (let y = y0; y < top - 1; y += 3)
    b.box(x0, z0, x1, z1, y, Math.min(y + 3, top - 1), { kind: y + 3 <= top - 1 ? 'brick' : 'plate', color: OCHRE, mask });
  b.box(x0, z0, x1, z1, top - 1, top, { kind: 'tile', color: flag, mask });
}

/** a parapet band along a 1-stud line: concrete from y0 to y1, with a smooth cap */
function band(b: Builder, r: Rect, y0: number, y1: number) {
  b.box(r[0], r[1], r[2], r[3], y0, y1 - 1, { kind: 'brick', color: OCHRE });
  b.box(r[0], r[1], r[2], r[3], y1 - 1, y1, { kind: 'tile', color: OCHRE });
}

/** stone walls between y0 and y1 */
function walls(b: Builder, rs: Rect[], y0: number, y1: number) {
  for (const r of rs) b.box(r[0], r[1], r[2], r[3], y0, y1, { kind: 'brick', color: stone });
}

/** First floor parapet lines (the terraces and the living room's south sill) [documented: sheet 4 and the elevation] */
const PARAPETS1: Rect[] = [
  [15, 67, 30, 68], [30, 66, 78, 67], // south: the long band seen from the falls
  [77, 38, 78, 66], [66, 38, 77, 39], // the east terrace
  [15, 52, 16, 67], [16, 52, 25, 53], // the west terrace
];
const PARAPETS2: Rect[] = [
  [29, 73, 54, 74], [29, 46, 30, 73], [53, 46, 54, 73], // the big south terrace
  [54, 45, 94, 46], [93, 33, 94, 45], [66, 33, 93, 34], // the guest room's sill and the east terrace
  [3, 10, 4, 26], [4, 25, 15, 26], [4, 10, 15, 11], // the west terrace over the servants' wing
];
const PARAPETS3: Rect[] = [[31, 39, 65, 40], [64, 27, 65, 39], [31, 27, 32, 39]];

/** the bolsters, the chimney's base and the stone piers on the rock (foundation) */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  // the hearth and chimney stack starts on the rock [documented]
  b.box(CHIMNEY[0], CHIMNEY[1], CHIMNEY[2], CHIMNEY[3], Y.POOL, -6, { kind: 'brick', color: stone });
  // four concrete bolsters carry the living room [documented: "four bolsters"]; they stand on the ledge, wherever it is
  for (const r of BOLSTERS) {
    b.newGroup();
    b.box(r[0], r[1], r[2], r[3], Y.POOL, -6, { kind: 'brick', color: OCHRE });
  }
  // the stone core's base, on the rock (the piers at the south glass start at the floor)
  walls(b, [[62, 30, 66, 45]], Y.POOL, -6);
  // the stone retaining wall along the drive, holding the hill 8 ft up [assumed: the drive is cut into the hillside]
  b.box(36, WALL_Z, 136, WALL_Z + 1, 0, 18, { kind: 'brick', color: stone });
  // the bridge's abutments [documented: sheet 4]
  b.box(BRIDGE[0], BRIDGE_SPAN[0] - 2, BRIDGE[2], BRIDGE_SPAN[0], Y.POOL, -4, { kind: 'brick', color: stone });
  b.box(BRIDGE[0], BRIDGE_SPAN[1], BRIDGE[2], BRIDGE[3], Y.POOL, -4, { kind: 'brick', color: stone });
}

/** the first-floor tray: out over the rock and the falls (floor) */
export function buildTray1(b: Builder) {
  b.setPhase(P.FLOOR);
  slab(b, TRAY1, -Y.BAND_DOWN, Y.L1, [HATCH, ...TREE_HOLES]);
  for (const r of PARAPETS1) band(b, r, Y.L1, Y.L1 + Y.PARAPET);
}

/** the second and third floors: stone walls, the trays and their bands, the chimney, the stairs, the bridges (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  const L2_SLAB = Y.L2 - 5, L3_SLAB = Y.L3 - 5;
  // the chimney rises through every floor to the tower top [documented: 32′-4½″]
  b.box(CHIMNEY[0], CHIMNEY[1], CHIMNEY[2], CHIMNEY[3], -6, Y.TOWER, {
    kind: 'brick', color: stone,
    mask: (x, z, y) => !(inRect(x, z, FIREPLACE) && y >= Y.L1 && y < Y.L1 + FIREPLACE_H),
  });
  // stone walls, floor by floor (each stops under the next tray, which then rests on it)
  walls(b, STONE1, -6, L2_SLAB);
  walls(b, STONE2, Y.L2, L3_SLAB);
  walls(b, STONE3, Y.L3, Y.ROOF - 4);
  // the second floor: the bedrooms' tray, the big south terrace, the east terrace [documented: sheet 5]
  slab(b, TRAY2, L2_SLAB, Y.L2);
  for (const r of PARAPETS2) band(b, r, L2_SLAB - 1, Y.L2 + Y.PARAPET);
  // the trellis of concrete beams over the hatch, at the second level [documented]
  for (let z = 47; z < 73; z += 3) b.box(54, z, 66, z + 1, L2_SLAB, Y.L2, { kind: 'brick', color: OCHRE });
  b.box(65, 46, 66, 73, L2_SLAB, Y.L2, { kind: 'brick', color: OCHRE });
  // the second floor's bridge over the drive to the hill [documented: "Bridge 20′-8″ × 6′-8″"]
  slab(b, [BRIDGE2], L2_SLAB, Y.L2);
  // the third floor: study, gallery, and the terrace on the bedrooms' roof [documented: sheet 6]
  slab(b, TRAY3, L3_SLAB, Y.L3);
  for (const r of PARAPETS3) band(b, r, L3_SLAB - 1, Y.L3 + Y.PARAPET);

  // the hatch stair: hung from the tray, seven steps down to a landing just over Bear Run [documented: sheets 3, 4, 10]
  b.newGroup();
  for (let i = 0; i < 7; i++) {
    const x = HATCH[0] + 1 + i, top = Y.L1 - 3 * (i + 1);
    b.box(x, HATCH[1] + 1, x + 1, HATCH[3] - 1, top - 1, top, { kind: 'tile', color: OCHRE });
  }
  b.box(HATCH_LANDING[0], HATCH_LANDING[1], HATCH_LANDING[2], HATCH_LANDING[3], Y.PLATFORM - 1, Y.PLATFORM, { kind: 'plate', color: OCHRE });
  // its steel hangers [documented: the stair is suspended], Cherokee red
  for (const [x, z] of [[HATCH[0], HATCH[1]], [HATCH[0], HATCH[3] - 1], [HATCH_LANDING[2] - 1, HATCH_LANDING[1]], [HATCH_LANDING[2] - 1, HATCH_LANDING[3] - 1]])
    b.column(x, z, Y.PLATFORM, -Y.BAND_DOWN, CHEROKEE, 'bar');

  // the bridge over Bear Run: a concrete deck, stone parapets [documented: 28 ft span, planters at each end]
  b.newGroup();
  b.box(BRIDGE[0], BRIDGE_SPAN[0] - 2, BRIDGE[2], BRIDGE[3], -4, -1, { kind: 'brick', color: OCHRE });
  b.box(BRIDGE[0] + 1, BRIDGE_SPAN[0] - 2, BRIDGE[2] - 1, BRIDGE[3], -1, 0, { kind: 'tile', color: C.darkTan });
  for (const x of [BRIDGE[0], BRIDGE[2] - 1]) b.box(x, BRIDGE_SPAN[0] - 2, x + 1, BRIDGE[3], -1, 6, { kind: 'brick', color: stone });

  // the covered walkway up to the guest wing: stone treads, a step every 1.2 ft [documented: the canopy "steps down the hill"]
  b.newGroup();
  for (let z = -70; z < WALL_Z; z++)
    for (let x = 15; x < 65; x++) {
      const w = walkwayAt(x, z);
      if (w.d > WALK_HALF + 0.5) continue;
      const top = stepTop(w.s);
      b.box(x, z, x + 1, z + 1, Math.min(groundPlates(x, z), top - 1), top, { kind: top - groundPlates(x, z) >= 3 ? 'brick' : 'plate', color: stone, unit: 3 });
    }

  // the guest wing: a flagstone floor and stone walls, one storey [documented footprint (OSM); height assumed]
  b.newGroup();
  for (const r of GUEST_WINGS) b.box(r[0], r[1], r[2], r[3], Y.GUEST, Y.GUEST + 1, { kind: 'tile', color: flag });
  const g = Y.GUEST + 1, gTop = Y.GUEST + 22;
  walls(b, [
    [38, -72, 108, -70], // the long wing's back (north) wall, against the hill
    [38, -72, 40, -49], [106, -72, 108, -49], // its ends
    [14, -103, 16, -60], [14, -103, 44, -101], // the carport and servants' wing
    [42, -103, 44, -72],
  ], g, gTop);
}

/** top of the guest wing's walls (its roof sits on them) */
export const GUEST_TOP = Y.GUEST + 22;

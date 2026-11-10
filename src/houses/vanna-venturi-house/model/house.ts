/**
 * The Vanna Venturi House itself (spec 044): the footings and the floor; the chimney through the middle, the partitions and the
 * upstairs floor; the stucco walls with the split-gable front, its lintel, applied arch and windows, the double moulding round all
 * four sides; the upstairs block with its half-moon window; and the roofs, stepped one plate per stud (spec 044, Q3): the hipped
 * main roof behind the parapet, the upstairs block's, and the chimney's brick cap. Layout and sourcing: layout.ts.
 */
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import {
  ARCH, BATH, BED2, BIG, CHIMNEY, DINING, DOOR, ENTRY, FLUE, gableTop, HEARTH, HOUSE, inGap, inRect, KITCHEN, LINTEL, LIVING,
  LIVING_NOOK, MAIN_BED, onEdge, PITCH, PORCH, Rect, SMALL, STAIR, STRIP, UPPER, UTILITY, Y,
} from './layout';

/** pale grey-green stucco [documented: today's colour, "nearly aqua" to grey-green]; the grey metal roof [documented];
 * the brick cap [documented]; white trim and dark frames [assumed: photographs] */
export const STUCCO = 0xb8c4b2;
export const STUCCO_SHADE = 0xadb9a7;
export const TRIM = 0xe9ebe4;
export const ROOF = 0x75797c;
export const BRICK = 0x8e3d2e;
export const FRAME = 0x3a3d3f;
export const GLASS = 0xdcebee;
export const SLAB = 0xb0ada6;

const stucco = (x: number, y: number, z: number) => ((x * 7 + y * 3 + z * 5) % 11 === 0 ? STUCCO_SHADE : STUCCO);

/** the outer walls of the ground floor: the back but the porch, the two ends, and the porch's two inner walls */
const BACK_Z = HOUSE[3] - 1;
const END_X = HOUSE[2] - 1;
export const onOuterWall = (x: number, z: number) =>
  (z === BACK_Z && x >= PORCH[2]) || (x === 0 && z > 0 && z < PORCH[1]) || (x === END_X && z > 0 && z < HOUSE[3]) ||
  (z === PORCH[1] && x < PORCH[2]) || (x === PORCH[2] - 1 && z >= PORCH[1]);
/** the recess's side walls and its back wall with the front door */
export const onRecess = (x: number, z: number) =>
  ((x === ENTRY[0] - 1 || x === ENTRY[2]) && z > 0 && z < DOOR.z) || (z === DOOR.z && x >= ENTRY[0] - 1 && x <= ENTRY[2]);

/** openings in the outer walls [documented: the front's, from photographs; the others assumed] */
function backOrEnd(x: number, y: number, z: number): 'glass' | null {
  const win = y >= 9 && y < 21;
  if (z === BACK_Z) return (x >= 23 && x < 41 && y < 21) || (x >= 47 && x < 55 && win) ? 'glass' : null;
  if (x === 0) return (z >= 2 && z < 8 && win) || (z >= 12 && z < 17 && y >= 15 && y < 21) ? 'glass' : null;
  if (x === END_X) return (z >= 3 && z < 10 && win) || (z >= 15 && z < 24 && win) ? 'glass' : null;
  // the porch: a glass door from the living room's corner, and a window from the utility room [assumed]
  if (x === PORCH[2] - 1) return z >= 21 && z < 25 && y < 21 ? 'glass' : null;
  if (z === PORCH[1]) return x >= 4 && x < 9 && win ? 'glass' : null;
  return null;
}
const inWin = (w: { x0: number; x1: number; y0: number; y1: number }, x: number, y: number) => x >= w.x0 && x < w.x1 && y >= w.y0 && y < w.y1;
/** the front wall's openings: the recess, the three windows, the slot in the split */
export function frontOpening(x: number, y: number): 'open' | 'glass' | null {
  if (x >= ENTRY[0] && x < ENTRY[2] && y < LINTEL.y0) return 'open';
  if (inWin(STRIP, x, y) || inWin(BIG, x, y) || inWin(SMALL, x, y)) return 'glass';
  if (x >= 28 && x < 30 && y >= Y.SPLIT - 9 && y < Y.SPLIT) return 'glass'; // the slot under the split
  return null;
}
/** the front parapet, up to the split gable's two sloping tops */
export const inFront = (x: number, y: number) => x >= HOUSE[0] && x < HOUSE[2] && y < gableTop(x) + 1 && !inGap(x, y);

/** the partitions [assumed: places, after the plan's arrangement], and their doors */
export const PARTITIONS: Rect[] = [
  [1, 9, 21, 10], // kitchen | bath and utility
  [9, 10, 10, 19], // bath | utility
  [20, 1, 21, 19], // kitchen and utility | the hall and the living room
  [44, 12, 45, 26], // living room | main bedroom
  [45, 12, 57, 13], // bed 2 | main bedroom
  [47, 1, 48, 12], // dining room | bed 2
];
const DOORS: Rect[] = [[14, 9, 17, 10], [9, 13, 10, 16], [20, 4, 21, 7], [20, 14, 21, 17], [44, 15, 45, 18], [47, 8, 48, 11]];
export const inPartition = (x: number, z: number) => PARTITIONS.some((r) => inRect(x, z, r));

/** the chimney's mass at a cell and height: solid but the fireplace's opening [documented: the trapezoid fireplace] */
const inChimney = (x: number, y: number, z: number) =>
  inRect(x, z, CHIMNEY) && y < Y.CHIMNEY && !(z === HEARTH.z && x >= HEARTH.x0 && x < HEARTH.x1 && y < HEARTH.y1);

/** the stairwell: the stair's run, open through the upstairs floor */
export const inStairwell = (x: number, z: number) => x >= STAIR.x0 && x < STAIR.x1 && z >= STAIR.zTop && z < STAIR.zTop + STAIR.steps;

export function buildFoundations(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  b.box(-1, -1, 59, 28, -3, -1, {
    kind: 'brick', color: SLAB,
    mask: (x, z) => onEdge(x, z, HOUSE) || inRect(x, z, CHIMNEY) || onOuterWall(x, z) || onRecess(x, z),
  });
}

export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  const footing = (x: number, z: number) => onEdge(x, z, HOUSE) || inRect(x, z, CHIMNEY) || onOuterWall(x, z) || onRecess(x, z);
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], -3, -1, { kind: 'plate', color: SLAB, mask: (x, z) => !footing(x, z) });
  // finishes [assumed]: oak in the rooms, tiles in the kitchen and bath, brick pavers in the porch and the recess
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], -1, 0, {
    kind: 'tile',
    color: (x, _y, z) =>
      inRect(x, z, PORCH) || inRect(x, z, ENTRY) ? 0x9c5a46 : inRect(x, z, KITCHEN) || inRect(x, z, BATH) ? 0xe2ded4 : 0xa98457,
  });
}

/** the chimney, the partitions and the upstairs floor (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  b.newGroup();
  // above the roof it is a shade darker, so it reads behind the split [assumed: photographs, where it stands in shadow]
  b.box(CHIMNEY[0], CHIMNEY[1], CHIMNEY[2], CHIMNEY[3], 0, Y.CHIMNEY, { kind: 'brick', color: (_x, y) => (y >= Y.EAVE ? 0x8f9b8b : STUCCO), mask: (x, z, y) => inChimney(x, y, z) });
  b.newGroup();
  b.box(0, 0, 58, 27, 0, Y.EAVE, {
    kind: 'brick', color: TRIM,
    mask: (x, z, y) => inPartition(x, z) && !(DOORS.some((r) => inRect(x, z, r)) && y < 18),
  });
  // the upstairs floor over the middle, on the ground floor's ceiling, open over the stair [documented: the upstairs room]
  b.newGroup();
  b.box(UPPER[0], UPPER[1], UPPER[2], UPPER[3], Y.EAVE, Y.UPPER, {
    kind: 'plate', color: SLAB, mask: (x, z) => !inRect(x, z, CHIMNEY) && !inStairwell(x, z),
  });
}

/** the walls, the front, the trim and the glass (envelope) */
export function buildWalls(b: Builder) {
  b.setPhase(P.ENVELOPE);
  // the ground floor's walls round the back, the ends and the porch
  b.newGroup();
  b.box(0, 0, 58, 27, 0, Y.EAVE, {
    kind: 'brick', color: stucco,
    mask: (x, z, y) => onOuterWall(x, z) && !backOrEnd(x, y, z) && !inPartition(x, z),
  });
  b.newGroup();
  b.box(0, 0, 58, 27, 0, Y.EAVE, { kind: 'glass', color: GLASS, unit: 3, mask: (x, z, y) => onOuterWall(x, z) && backOrEnd(x, y, z) === 'glass' && !inPartition(x, z) });
  // the porch's corner post [assumed]
  b.newGroup();
  b.box(0, BACK_Z, 1, BACK_Z + 1, 0, Y.EAVE, { kind: 'brick', color: TRIM });
  // the recess: its side walls, its back wall with the front door's glass, its soffit [documented: photographs]
  b.newGroup();
  b.box(ENTRY[0] - 1, 1, ENTRY[2] + 1, DOOR.z + 1, 0, LINTEL.y0, {
    kind: 'brick', color: stucco,
    mask: (x, z, y) => onRecess(x, z) && !(z === DOOR.z && x >= DOOR.x0 && x < DOOR.x1 && y < DOOR.y1),
  });
  b.box(ENTRY[0] - 1, 1, ENTRY[2] + 1, DOOR.z + 1, LINTEL.y0, Y.EAVE, { kind: 'brick', color: stucco, mask: (x, z) => onRecess(x, z) || (z > 0 && z < DOOR.z && x >= ENTRY[0] && x < ENTRY[2]) });
  // the front: the parapet with its split gable, rising above the roof [documented]
  b.newGroup();
  b.box(0, 0, 58, 1, 0, Y.GABLE_PEAK + 1, { kind: 'brick', color: stucco, mask: (x, _z, y) => inFront(x, y) && frontOpening(x, y) === null });
  b.newGroup();
  b.box(0, 0, 58, 1, 0, Y.GABLE_PEAK + 1, {
    kind: 'plate', color: FRAME,
    // the strip window's five panes, the big window's cross [documented: photographs]
    mask: (x, _z, y) => inFront(x, y) && frontOpening(x, y) === 'glass' && ((inWin(STRIP, x, y) && (x - STRIP.x0) % 3 === 2) || (inWin(BIG, x, y) && (x === 44 || y === 18))),
  });
  b.box(0, 0, 58, 1, 0, Y.GABLE_PEAK + 1, {
    kind: 'glass', color: GLASS, unit: 3,
    mask: (x, _z, y) => inFront(x, y) && frontOpening(x, y) === 'glass' && !((inWin(STRIP, x, y) && (x - STRIP.x0) % 3 === 2) || (inWin(BIG, x, y) && (x === 44 || y === 18))),
  });
  // the flat lintel and, over it, the thin applied arch, both standing just proud of the wall [documented: photographs]
  b.newGroup();
  b.box(ARCH.x0, -1, ARCH.x1, 0, LINTEL.y0, LINTEL.y1, { kind: 'tile', color: TRIM });
  b.newGroup();
  for (let x = ARCH.x0; x < ARCH.x1; x++) {
    const lo = Math.min(archY(x), archY(x - 1), archY(x + 1)), hi = archY(x);
    b.box(x, -1, x + 1, 0, Math.max(LINTEL.y1, lo), hi + 1, { kind: 'tile', color: TRIM });
  }
  // the double moulding about 4 ft up, round all four sides but the openings [documented]
  b.newGroup();
  for (const y of Y.MOULD) {
    b.box(-1, -1, 59, 28, y, y + 1, {
      kind: 'tile', color: TRIM,
      mask: (x, z) => {
        const outside = (z === -1 && x >= 0 && x < 58 && !(x >= ENTRY[0] && x < ENTRY[2]))
          || (z === HOUSE[3] && x >= PORCH[2] && x < 58 && !(x >= 23 && x < 41))
          || (x === -1 && z >= 0 && z < PORCH[1])
          || (x === 58 && z >= 0 && z < HOUSE[3]);
        return outside;
      },
    });
  }
  // the upstairs block: its walls through the roof, the half-moon window to the back, glass in its two ends [documented]
  b.newGroup();
  b.box(UPPER[0], UPPER[1], UPPER[2], UPPER[3], Y.UPPER, Y.UPPER_WALL, {
    kind: 'brick', color: stucco,
    mask: (x, z, y) => onEdge(x, z, UPPER) && !inRect(x, z, CHIMNEY) && !upperGlass(x, y, z),
  });
  b.box(UPPER[0], UPPER[1], UPPER[2], UPPER[3], Y.UPPER, Y.UPPER_WALL, {
    kind: 'glass', color: GLASS, unit: 1, mask: (x, z, y) => onEdge(x, z, UPPER) && !inRect(x, z, CHIMNEY) && upperGlass(x, y, z),
  });
}

/** the arch's height at x: a segment of a circle, from the lintel's ends up to its crown [documented: photographs; sizes scaled] */
export function archY(x: number): number {
  const c = (ARCH.x1 - ARCH.x0) / 2, h = ARCH.rise * 0.4, R = (h * h + c * c) / (2 * h);
  const dx = Math.min(Math.abs(x + 0.5 - (ARCH.x0 + c)), c);
  return ARCH.base + Math.round((Math.sqrt(R * R - dx * dx) - (R - h)) / 0.4);
}

/** the half-moon window in the upstairs block's back wall, and the glass in its ends above the roof [documented: photographs] */
export function upperGlass(x: number, y: number, z: number): boolean {
  if (z === UPPER[3] - 1) {
    const dx = x + 0.5 - (UPPER[0] + UPPER[2]) / 2, dy = (y - 34) * 0.4;
    return dy >= 0 && Math.hypot(dx, dy) < 5.5;
  }
  if (x === UPPER[0] || x === UPPER[2] - 1) return z >= 10 && z < 17 && y >= 37 && y < 46;
  return false;
}

/** the hipped roof's height at a cell: level eaves all round, up one plate a stud to the ridge [documented: hipped at both ends] */
export const roofTop = (x: number, z: number) =>
  Y.EAVE + PITCH * Math.min(x - HOUSE[0], HOUSE[2] - 1 - x, z - HOUSE[1], HOUSE[3] - 1 - z);

/** the roofs (roof): the hipped main roof behind the parapet, the upstairs block's, the chimney's cap */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  const ridge = Math.floor((HOUSE[3] - HOUSE[1] - 1) / 2);
  for (let k = 0; k <= ridge; k++) {
    b.newGroup();
    b.box(HOUSE[0] + k, HOUSE[1] + k, HOUSE[2] - k, HOUSE[3] - k, Y.EAVE + PITCH * k, Y.EAVE + PITCH * (k + 1), {
      kind: 'tile', color: ROOF,
      mask: (x, z) => z > 0 && !inRect(x, z, UPPER) && !inRect(x, z, CHIMNEY),
    });
  }
  // the upstairs block's roof: hipped front and back, its ends left as trapezoids [documented: trapezoid glazed ends]
  const half = Math.floor((UPPER[3] - UPPER[1] - 1) / 2);
  for (let k = 0; k <= half; k++) {
    b.newGroup();
    b.box(UPPER[0], UPPER[1] + k, UPPER[2], UPPER[3] - k, Y.UPPER_WALL + PITCH * k, Y.UPPER_WALL + PITCH * (k + 1), {
      kind: 'tile', color: ROOF, mask: (x, z) => !inRect(x, z, CHIMNEY),
    });
  }
  // the chimney's brick cap [documented]
  b.newGroup();
  b.box(FLUE[0], FLUE[1], FLUE[2], FLUE[3], Y.CHIMNEY, Y.CAP, { kind: 'brick', color: BRICK });
}

export { BED2, DINING, LIVING, LIVING_NOOK, MAIN_BED, UTILITY };

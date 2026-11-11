/**
 * The Church of the Light itself (spec 055): the foundation; the floor stepping down to the altar; the concrete box with the
 * cross cut through the altar wall, the wall at 15° slicing through it, its stub through the entrance wall and the L-shaped wall
 * beyond the altar; the glass in the cross, the glazed slot and the doors; the flat concrete roof. Layout and sourcing: layout.ts.
 */
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import {
  ALTAR_WALL_X, BOX, courseUp, CROSSING, DIAG, DOOR, ENTRANCE_WALL_X, floorTop, inRect, INNER, INSIDE, L_WALL_X, onDiag, panel, SLIT_Z, SLOT,
  STUB, tieHole, Y, diagZ,
} from './layout';
import { groundPlates } from './site';

/** bare concrete [documented], in two shades so the 1,800 × 900 mm formwork panels read; the tie holes a little darker
 * [documented]; inside, the same concrete in shadow [assumed: the room is lit only by the cross and the slot] */
export const CONCRETE = [0xc6c3bc, 0xbfbcb5];
export const HOLE = 0xb7b4ad;
export const SHADE = [0x6e6b66, 0x69665f];
/** the floor and the pews: scaffold boards stained almost black [documented] */
export const DARK_WOOD = 0x2b2420;
export const GLASS = 0xeef4f2;
/** the light through the cross: a warm white */
export const CROSS = 0xfff6e2;
export const DOOR_COLOR = 0x33302c;

// a stud is far bigger than a tie hole, so the holes show only faintly outside, and not at all in the shadow inside
const concrete = (u: number, inside = false) => (_x: number, y: number) =>
  inside ? SHADE[panel(u - 3, y)] : tieHole(u - 3, y) ? HOLE : CONCRETE[panel(u - 3, y)];
/** the box's walls, coloured by where they are along their own face; the inner layer in shadow */
export function wallColor(x: number, y: number, z: number): number {
  const alongX = z < INNER[1] + 1 || z >= INNER[3] - 1;
  return concrete(alongX ? x : z, inRect(x, z, INNER))(x, y);
}
export const inWallRing = (x: number, z: number) => inRect(x, z, BOX) && !inRect(x, z, INSIDE);

/** the openings in the box: the cross, the glazed slot, the doors */
export function opening(x: number, y: number, z: number): 'glass' | 'door' | null {
  if (x >= ALTAR_WALL_X && z >= INSIDE[1] && z < INSIDE[3]) {
    // the vertical slit, floor to ceiling, and the arm, wall to wall [documented: the arms run right to the wall's edges]
    if (z === SLIT_Z && y >= Y.ALTAR && y < Y.CEILING) return 'glass';
    if (y >= Y.ARM[0] && y < Y.ARM[1]) return 'glass';
  }
  if (z >= INSIDE[3] && x >= SLOT.x0 && x < SLOT.x1 && y >= courseUp(floorTop(x)) && y < Y.CEILING) return 'glass';
  if (x < INSIDE[0] && z >= DOOR.z0 && z < DOOR.z1 && y >= Y.ENTRY && y < DOOR.top) return 'door';
  return null;
}

/** the 15° wall's and the stub's cells inside the chapel: they stand on the base, through the floor */
const walled = (x: number, z: number) => onDiag(x, z, DIAG.x0, CROSSING.x + 1) || onDiag(x, z, STUB.x0, STUB.x1);

/** the foundation: a concrete pad under the box (foundation) [assumed] */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  b.box(BOX[0], BOX[1], BOX[2], BOX[3], Y.PAD, Y.BASE, { kind: 'brick', color: 0xa9a59d });
}

/** the floor: a concrete base stepping down row by row, topped with the dark boards (floor) [documented] */
export function buildFloor(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  b.box(INSIDE[0], INSIDE[1], INSIDE[2], INSIDE[3], Y.BASE, Y.ENTRY - 1, { kind: 'plate', color: 0xa9a59d, mask: (x, z, y) => y < floorTop(x) - 1 && !walled(x, z) });
  b.newGroup();
  b.box(INSIDE[0], INSIDE[1], INSIDE[2], INSIDE[3], Y.ALTAR - 1, Y.ENTRY, { kind: 'tile', color: DARK_WOOD, mask: (x, z, y) => y === floorTop(x) - 1 && !walled(x, z) });
}

/** the concrete: the box's walls with the cross left open, the 15° wall, its stub, the L-shaped wall (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  b.newGroup();
  b.box(BOX[0], BOX[1], BOX[2], BOX[3], Y.BASE, Y.ALTAR, { kind: 'plate', color: wallColor, mask: (x, z) => inWallRing(x, z) });
  b.box(BOX[0], BOX[1], BOX[2], BOX[3], Y.ALTAR, Y.CEILING, {
    kind: 'brick', color: wallColor, mask: (x, z, y) => inWallRing(x, z) && opening(x, y, z) === null,
  });
  // the 15° wall inside the chapel, from the floor to the ceiling [documented: it cuts through the box]
  b.newGroup();
  b.box(Math.floor(DIAG.x0), INSIDE[1], Math.ceil(CROSSING.x), INSIDE[3], Y.BASE, Y.CEILING, {
    kind: 'brick', color: (x, y) => concrete(x, true)(x, y), mask: (x, z) => inRect(x, z, INSIDE) && onDiag(x, z, DIAG.x0, CROSSING.x + 1),
  });
  // and outside, from the long wall to the L-shaped wall beyond the altar, as high as the box [assumed: its height]
  b.newGroup();
  b.box(Math.floor(CROSSING.x), BOX[3] - 2, Math.ceil(DIAG.x1), Math.ceil(diagZ(DIAG.x1)) + 1, Y.PAD, Y.TOP, {
    kind: 'brick', color: (x, y) => concrete(x)(x, y),
    mask: (x, z, y) => !inRect(x, z, BOX) && onDiag(x, z, CROSSING.x, DIAG.x1) && y >= groundPlates(x, z),
  });
  // the L-shaped wall beyond the altar end [documented], as high as the box [assumed]
  b.newGroup();
  b.box(L_WALL_X, BOX[1], L_WALL_X + 1, Math.floor(diagZ(L_WALL_X)), Y.PAD, Y.TOP, {
    kind: 'brick', color: (x, y, z) => concrete(z)(x, y), mask: (x, z, y) => y >= groundPlates(x, z) && !onDiag(x, z, CROSSING.x, DIAG.x1),
  });
  // the stub on the 15° line through the entrance wall [documented], inside down to the floor, outside down to the ground
  b.newGroup();
  b.box(INSIDE[0], BOX[1], STUB.x1, BOX[3], Y.BASE, Y.CEILING, {
    kind: 'brick', color: (x, y) => concrete(x, true)(x, y), mask: (x, z) => inRect(x, z, INSIDE) && onDiag(x, z, STUB.x0, STUB.x1),
  });
  b.box(STUB.x0, BOX[1], BOX[0], BOX[3], Y.PAD, Y.TOP, {
    kind: 'brick', color: (x, y) => concrete(x)(x, y), mask: (x, z, y) => onDiag(x, z, STUB.x0, STUB.x1) && y >= groundPlates(x, z),
  });
}

/** the glass in the cross and the slot, and the entrance's double door (envelope) [documented: glazed] */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  b.newGroup();
  // the cross: the vertical slit below and above the arm, and the arm from wall to wall
  // [documented: glazed] drawn as glowing pieces, so the cross reads as light against the shadowed wall, as in the photographs
  const X = ALTAR_WALL_X;
  b.box(X, SLIT_Z, BOX[2], SLIT_Z + 1, Y.ALTAR, Y.ARM[0], { kind: 'light', color: CROSS });
  b.box(X, SLIT_Z, BOX[2], SLIT_Z + 1, Y.ARM[1], Y.CEILING, { kind: 'light', color: CROSS });
  b.box(X, INSIDE[1], BOX[2], INSIDE[3], Y.ARM[0], Y.ARM[1], { kind: 'light', color: CROSS });
  // the slot, a column at a time from the course above each row's floor
  b.newGroup();
  for (let x = SLOT.x0; x < SLOT.x1; x++) b.box(x, BOX[3] - 1, x + 1, BOX[3], courseUp(floorTop(x)), Y.CEILING, { kind: 'glass', color: GLASS });
  // its inner layer stays open: the slot is one pane in the wall's outer face
  b.newGroup();
  b.box(ENTRANCE_WALL_X, DOOR.z0, ENTRANCE_WALL_X + 1, DOOR.z1, Y.ENTRY, DOOR.top, { kind: 'brick', color: DOOR_COLOR });
  // the doorway's inner layer: the doors' frame and threshold stay open
}

/** the roof: a flat concrete slab (roof) [documented: the box] */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.newGroup();
  b.box(BOX[0], BOX[1], BOX[2], BOX[3], Y.CEILING, Y.TOP - 1, {
    kind: 'brick', color: (x, _y, z) => (inRect(x, z, INNER) ? SHADE : CONCRETE)[(Math.floor(x / 6) + Math.floor(z / 3)) & 1],
  });
  b.box(BOX[0], BOX[1], BOX[2], BOX[3], Y.TOP - 1, Y.TOP, { kind: 'plate', color: (x, _y, z) => CONCRETE[(Math.floor(x / 6) + Math.floor(z / 3)) & 1] });
}

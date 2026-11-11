/**
 * The Lovell Beach House itself (spec 056): the footings and the ground slab; the living floor; the five concrete frames with the
 * bedrooms' floor hung between them, the chimney, the stairs inside and the two concrete stairs up from the 13th Street side; the
 * stucco walls and the bands of windows; the roof, its parapet, the tower over the north bay and the chimney's top.
 * Layout and sourcing: layout.ts.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BAND, CHIMNEY, FIRST, FRAMES, FRAME_DEPTH, GARAGE, inRect, KITCHEN_STAIR, LANDINGS, LENGTH, LIVING_STAIR, NORTH_BAY,
  PLATFORM, POSTS, Rect, SHOWER, SOUTH_WALL_X, STAIR_Z, TOWER, Y, DEPTH,
} from './layout';

/** the frames' concrete, cast in place and left unsurfaced [documented], board-formed [assumed] */
export const CONCRETE = [0xc2bdb2, 0xbab5aa];
/** white stucco on the wood-framed walls [documented: "white plaster"] */
export const STUCCO = [0xf3f0e8, 0xede9e0];
/** the windows' frames, green today [documented: Galerie, 2026]; the glass */
export const FRAME = 0x3f5d47;
export const GLASS = 0xd6e7ea;
export const BOARDS = 0xb08f66; // 1″ board floors [documented]
export const SLAB = 0xe6e2d8;
export const DOOR = 0x7a5b40;

const concrete = (_x: number, y: number) => CONCRETE[y % 2];
const stucco = (x: number, y: number, z: number) => STUCCO[Math.floor(hash2(x + z * 3, Math.floor(y / 6)) * 2)];
const band = (y: number, a: number, b: number) => y >= a && y < b;
const isFrame = (x: number) => FRAMES.includes(x);
const isPost = (x: number, z: number) => isFrame(x) && POSTS.some(([a, b]) => z >= a && z < b);

/**
 * Schindler's windows: wood multi-light sash with interlocking rectangular muntins, mostly horizontal bars with small offset
 * L-shaped lights [documented: sheets 5–7]. `u` runs along the wall, `y0..y1` is the band; the grid every 4 studs and 4 plates,
 * with an offset short bar in every other light [assumed: the rhythm].
 */
export function muntin(u: number, y: number, y0: number, y1: number): 'frame' | 'glass' {
  if (y === y0 || y === y1 - 1) return 'frame';
  const uu = ((u % 4) + 4) % 4, yy = (y - y0) % 4;
  if (uu === 0) return 'frame';
  if (yy === 0) return 'frame';
  if (yy === 2 && uu === 1 && ((Math.floor(u / 4) + Math.floor((y - y0) / 4)) & 1)) return 'frame';
  return 'glass';
}

/** the footings under the posts and the ground slab under the frames (foundation) [documented: the frames stand on the sand] */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  b.box(0, 0, LENGTH, FRAME_DEPTH, -3, 0, { kind: 'brick', color: 0xb0aba0 });
}

/** the living floor, +10′-0″, with the north bay's and the balcony's (floor) [documented] */
export function buildFloor(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  const inFloor = (x: number, z: number) => inRect(x, z, FIRST) || inRect(x, z, NORTH_BAY) || inRect(x, z, [SOUTH_WALL_X, 18, LENGTH, 21]);
  b.box(0, 0, LENGTH, 21, Y.F1 - Y.SLAB, Y.F1 - 1, { kind: 'plate', color: SLAB, mask: inFloor });
  b.box(0, 0, LENGTH, 21, Y.F1 - 1, Y.F1, { kind: 'tile', color: (x) => (x >= SOUTH_WALL_X ? SLAB : BOARDS), mask: inFloor });
}

/** the five frames, the bedrooms' floor between them, the bath's floor, the chimney, the stairs (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the frames: three posts each from the ground to the roof, a beam under the living floor and one under the roof, across
  // the house; seen end on from the north or the south they make the "figure 8" [documented: sheets 2–4, 9, 10]
  for (const x of FRAMES) {
    b.newGroup();
    for (const [z0, z1] of POSTS) b.box(x, z0, x + 1, z1, 0, Y.ROOF, { kind: 'brick', color: concrete });
    // in two-plate courses: under the living floor's slab, and up to its level beyond it
    b.box(x, 0, x + 1, FRAME_DEPTH, Y.F1_BEAM, Y.F1, { kind: 'brick', unit: 2, color: concrete });
    b.box(x, 0, x + 1, DEPTH, Y.CEILING - 3, Y.CEILING, { kind: 'brick', color: concrete, mask: (_x, z) => z < FRAME_DEPTH || x > BAND[0] });
  }
  // the bedrooms' floor and the gallery over the living room, hung from the frames [documented: "suspended by iron rods"]
  b.newGroup();
  const stairHole: Rect = [1, 15, 4, 21];
  b.box(1, 13, BAND[2], DEPTH, Y.F2 - Y.SLAB, Y.F2, {
    kind: 'plate', color: (_x, y) => (y === Y.F2 - 1 ? BOARDS : SLAB),
    mask: (x, z) => !inRect(x, z, stairHole) && !(x < BAND[0] && z >= 18) && !(x >= SOUTH_WALL_X && z < 18),
  });
  // the bath's floor over the kitchen, +18′-9″ [documented]
  b.newGroup();
  b.box(1, 1, 16, 13, Y.BATH - Y.SLAB, Y.BATH, { kind: 'plate', color: SLAB });
  // the chimney on the east wall, concrete finished in stucco, from the ground to the roof [documented: sheets 2, 3, 7]
  b.newGroup();
  b.box(CHIMNEY[0], CHIMNEY[1], CHIMNEY[2], CHIMNEY[3], 0, Y.ROOF, {
    kind: 'brick', color: stucco,
    // the fireplace opens to the living room [documented: sheet 3]
    mask: (x, z, y) => !(z === CHIMNEY[3] - 1 && x >= 31 && x < 34 && band(y, Y.F1, Y.F1 + 6)),
  });
  b.box(31, CHIMNEY[3] - 1, 34, CHIMNEY[3], Y.F1, Y.F1 + 1, { kind: 'plate', color: 0x2a2725 });
  // the landings at the top of the two outside stairs [documented: sheet 3]
  b.newGroup();
  for (const r of LANDINGS) b.box(r[0], r[1], r[2], r[3], Y.F1 - Y.SLAB, Y.F1, { kind: 'plate', color: concrete });
  // the entrance platform on the 13th Street side [documented: sheet 2]
  b.newGroup();
  b.box(PLATFORM[0], PLATFORM[1], PLATFORM[2], PLATFORM[3], 0, 3, { kind: 'brick', color: concrete });
  // the two concrete stairs from it [documented: one with 11″ treads up to the kitchen, one with 1′-10″ treads to the living room]
  b.newGroup();
  for (let i = 0; i < KITCHEN_STAIR.x0 - KITCHEN_STAIR.x1 + 1; i++) {
    const x = KITCHEN_STAIR.x0 - i, top = 3 + 2 * (i + 1);
    b.box(x, STAIR_Z[0], x + 1, STAIR_Z[1], top - 2, Math.min(top, Y.F1), { kind: 'plate', color: concrete });
  }
  b.newGroup();
  const n = LIVING_STAIR.x1 - LIVING_STAIR.x0 + 1;
  for (let i = 0; i < n; i++) {
    const x = LIVING_STAIR.x0 + i, top = 3 + Math.ceil((22 * (i + 1)) / n);
    b.box(x, STAIR_Z[0], x + 1, STAIR_Z[1], top - 2, top, { kind: 'plate', color: concrete });
  }
  // the stair inside, in the north-west corner, up to the bedrooms' floor [documented: sheets 3, 4]
  b.newGroup();
  for (let z = 20; z >= 15; z--) b.box(1, z, 4, z + 1, Y.F1 + 2 * (20 - z), Y.F1 + 2 * (21 - z), { kind: 'plate', color: BOARDS });
  // the partitions: the bedrooms' on the frames, their wall to the gallery, the kitchen's [documented: sheets 3, 4]
  b.newGroup();
  b.box(BAND[0], 17, BAND[2], DEPTH, Y.F2, Y.CEILING - 3, {
    kind: 'brick', color: stucco,
    mask: (x, z, y) => {
      if (z === 17) return x >= 5 && !isFrame(x) && !((((x - 5) % 12) + 12) % 12 >= 2 && (((x - 5) % 12) + 12) % 12 < 5 && y < Y.F2 + 18);
      return (x === 16 || x === 28 || x === 40) && z > 17;
    },
  });
  b.box(16, 1, 17, 13, Y.F1, Y.KITCHEN_CEIL, { kind: 'brick', color: stucco, mask: (_x, z, y) => !(z >= 8 && z < 11 && y < Y.F1 + 18) });
}

/** the outer walls: stucco, with the bands of windows [documented: sheets 5–8] */
export function wallAt(x: number, y: number, z: number): 'stucco' | 'frame' | 'glass' | 'door' | null {
  // the east wall: the kitchen's windows, and the living room's two bands, low and clerestory [documented: sheet 7]
  if (z === 0 && x < SOUTH_WALL_X && !isPost(x, z) && !inRect(x, z, CHIMNEY) && band(y, Y.F1, Y.CEILING)) {
    if (x < 17) return band(y, 31, 41) ? muntin(x, y, 31, 41) : 'stucco';
    if (band(y, 29, 43)) return muntin(x, y, 29, 43);
    if (band(y, 50, 58)) return muntin(x, y, 50, 58);
    return 'stucco';
  }
  // the living room's south wall: glass two storeys high, to the ocean [documented: sheet 6]
  if (x === SOUTH_WALL_X && z >= 1 && z < 16 && band(y, Y.F1, Y.CEILING)) return muntin(z, y, Y.F1, Y.CEILING);
  // the living floor's west wall, under the bedrooms, between the middle posts [documented: sheet 5], doors to the landings
  if (z === 17 && x >= 17 && x < SOUTH_WALL_X && !isFrame(x) && band(y, Y.F1, Y.F2 - Y.SLAB)) {
    if ((band(x, 18, 21) || band(x, 49, 52)) && y < Y.F1 + 18) return 'door';
    return band(y, Y.F1 + 4, Y.F2 - Y.SLAB - 1) ? muntin(x, y, Y.F1 + 4, Y.F2 - Y.SLAB - 1) : 'stucco';
  }
  // the north bay: its west wall up to the roof, the north wall with the garage's front below [documented: sheets 5, 8]
  if (z === 20 && x < 17 && band(y, Y.F1, Y.CEILING)) return band(y, 31, 41) || band(y, Y.BATH + 3, Y.CEILING - 2) ? muntin(x, y, 31, 41) : 'stucco';
  if (x === 0 && z < 21 && band(y, Y.F1, Y.CEILING)) return band(y, 31, 38) && band(z, 4, 12) ? muntin(z, y, 31, 38) : 'stucco';
  // the bedrooms' band: a solid stucco band where the sleeping porches' rail was, then the windows the porches' French doors
  // became, about sixteen [documented: sheet 5, "former wall moved to balcony rail c.1928"]
  if (z === DEPTH - 1 && x >= BAND[0] && x < BAND[2] && band(y, Y.F2, Y.CEILING)) return band(y, 51, 59) ? muntin(x - 1, y, 51, 59) : 'stucco';
  if (x === BAND[2] - 1 && z >= 18 && z < DEPTH && band(y, Y.F2, Y.CEILING)) return band(y, 47, 58) ? muntin(z, y, 47, 58) : 'stucco';
  if (x === BAND[0] && z >= 21 && z < DEPTH && band(y, Y.F2, Y.CEILING)) return 'stucco';
  return null;
}

/** the ground floor: the garage at the north end, its board door on the alley; the shower in the middle [documented] */
function groundWall(x: number, y: number, z: number): 'stucco' | 'door' | null {
  if (y >= Y.F1_BEAM) return null;
  if (inRect(x, z, GARAGE) && (z === GARAGE[1] || z === GARAGE[3] - 1 || x === GARAGE[2] - 1) && !isPost(x, z)) return 'stucco';
  if (x === 0 && z >= 1 && z < 15) return y < 19 ? 'door' : 'stucco';
  if (inRect(x, z, SHOWER) && (x === SHOWER[0] || x === SHOWER[2] - 1 || z === SHOWER[1] || z === SHOWER[3] - 1)) return y < 18 ? 'stucco' : null;
  return null;
}

export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const all = (x: number, y: number, z: number) => wallAt(x, y, z) ?? groundWall(x, y, z);
  // a plate at a time, so the window bands start and end exactly where the drawings put them
  const kinds = [['stucco', 'plate'], ['frame', 'plate'], ['glass', 'glass'], ['door', 'plate']] as const;
  for (const [what, kind] of kinds) {
    b.newGroup();
    b.box(0, 0, LENGTH, DEPTH, 0, Y.CEILING, {
      kind, unit: 1, color: what === 'stucco' ? stucco : what === 'frame' ? FRAME : what === 'glass' ? GLASS : DOOR,
      mask: (x, z, y) => all(x, y, z) === what,
    });
  }
  // the balcony's solid stucco parapet past the living room's glass [documented: sheet 6]
  b.newGroup();
  b.box(SOUTH_WALL_X, 0, LENGTH, 21, Y.F1, Y.F1 + 9, {
    kind: 'brick', color: stucco, mask: (x, z) => x === LENGTH - 1 || (z === 0 && x > SOUTH_WALL_X) || (z === 20 && x > SOUTH_WALL_X),
  });
}

/** the roof: the slab, its parapet, the tower over the north bay, the chimney's top (roof) [documented: sheets 5–10] */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.newGroup();
  b.box(0, 0, BAND[2], DEPTH, Y.CEILING, Y.ROOF, { kind: 'brick', color: (x, y, z) => (y < Y.CEILING + 3 ? SLAB : stucco(x, y, z)) });
  b.newGroup();
  b.box(0, 0, BAND[2], DEPTH, Y.ROOF, Y.PARAPET, {
    kind: 'brick', color: stucco, mask: (x, z) => (x === 0 || z === 0 || x === BAND[2] - 1 || z === DEPTH - 1) && !inRect(x, z, TOWER),
  });
  // the tower: the bath's upper half and the stair to the sun deck, its door onto the deck [documented: sheets 5, 6, 9]
  b.newGroup();
  b.box(TOWER[0], TOWER[1], TOWER[2], TOWER[3], Y.ROOF, Y.TOWER, {
    kind: 'brick', color: stucco,
    mask: (x, z, y) => (x === TOWER[0] || z === TOWER[1] || x === TOWER[2] - 1 || z === TOWER[3] - 1) && !(z === TOWER[1] && x >= 6 && x < 9 && y < Y.ROOF + 18),
  });
  b.box(TOWER[0], TOWER[1], TOWER[2], TOWER[3], Y.TOWER, Y.TOWER + 1, { kind: 'plate', color: SLAB });
  b.box(6, TOWER[1], 9, TOWER[1] + 1, Y.ROOF, Y.ROOF + 18, { kind: 'brick', color: DOOR });
  // the chimney's top [documented: sheet 9]
  b.newGroup();
  b.box(31, 0, 34, 3, Y.ROOF, Y.ROOF + 9, { kind: 'brick', color: stucco });
}

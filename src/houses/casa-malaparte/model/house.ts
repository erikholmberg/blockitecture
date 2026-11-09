/**
 * Casa Malaparte itself (spec 031): rock foundations, the lower floor, the red walls and the upper floor, the windows, then the
 * roof terrace in terracotta tiles, the wedge of steps rising to it, and the white curving wall standing on it. Layout and
 * sourcing: layout.ts.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { HOUSE, inRect, Rect, ROOF_WALL, STAIR, Y } from './layout';
import { groundPlates } from './site';

/** Pompeian red [documented]: the walls and the stair, varying a little course to course */
export const RED = [0xb3432f, 0xab3e2b, 0xb84a34];
export const red = (x: number, y: number, z: number) => RED[Math.floor(hash2(Math.floor((x + z) / 6), Math.floor(y / 6)) * RED.length)];
export const WHITE = 0xf1eee6;
/** the roof terrace's terracotta tiles [assumed: photographs] */
export const TERRACOTTA = [0xb87a52, 0xa86c47, 0xc28a5f];
/** the flagstone floors [documented: photograph of the living room] */
export const FLAG = [0x9a958a, 0xa8a397, 0x8f8a80];
export const FRAME = 0x3b3a34;
export const GLASS = 0xdff1f5;
/** the floor slabs, under the flagstones */
export const SLAB = 0xb9b4a8;

const box = (b: Builder, r: Rect, y0: number, y1: number, color: number | ((x: number, y: number, z: number) => number), kind: 'brick' | 'plate' | 'tile' = 'brick') =>
  b.box(r[0], r[1], r[2], r[3], y0, y1, { kind, color });

/** the house's walls are on the rock: a footing ring under them, down to the cliff top wherever it falls away [assumed] */
export function buildFoundations(b: Builder) {
  b.setPhase(P.FOUNDATION);
  const [x0, z0, x1, z1] = HOUSE;
  const ring = (x: number, z: number) => x === x0 || x === x1 - 1 || z === z0 || z === z1 - 1;
  let lo = 0;
  for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) if (ring(x, z)) lo = Math.min(lo, groundPlates(x, z));
  b.box(x0, z0, x1, z1, Math.min(lo, Y.LOWER - 6), Y.LOWER - 3, { kind: 'brick', mask: ring, color: red });
}

/** the lower floor's slab, flagstone on top (floor) */
export function buildLowerFloor(b: Builder) {
  b.setPhase(P.FLOOR);
  box(b, HOUSE, Y.LOWER - 3, Y.LOWER - 1, SLAB, 'plate');
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.LOWER - 1, Y.LOWER, { kind: 'tile', color: (x, _y, z) => FLAG[Math.floor(hash2(x >> 1, z >> 1) * 3)] });
}

/** windows: a dark frame round glass, cut into a wall line [assumed: their sizes and rhythm from photographs] */
const WINDOWS: { r: Rect; y0: number; y1: number }[] = [];
for (const z of [HOUSE[1], HOUSE[3] - 1]) {
  for (let x = 70; x < 174; x += 8) WINDOWS.push({ r: [x, z, x + 3, z + 1], y0: 8, y1: 18 }); // the lower floor's small windows
  for (const x of [80, 100, 124, 150]) WINDOWS.push({ r: [x, z, x + 8, z + 1], y0: Y.UPPER + 6, y1: Y.UPPER + 24 }); // the great windows
}
WINDOWS.push({ r: [HOUSE[2] - 1, -12, HOUSE[2], -5], y0: Y.UPPER + 6, y1: Y.UPPER + 24 }, { r: [HOUSE[2] - 1, 5, HOUSE[2], 12], y0: Y.UPPER + 6, y1: Y.UPPER + 24 });
const inWindow = (x: number, y: number, z: number) => WINDOWS.some((w) => inRect(x, z, w.r) && y >= w.y0 && y < w.y1);

/** the red walls, two storeys, and the upper floor (structure) */
export function buildWalls(b: Builder) {
  b.setPhase(P.STRUCTURE);
  const [x0, z0, x1, z1] = HOUSE;
  const ring = (x: number, z: number) => x === x0 || x === x1 - 1 || z === z0 || z === z1 - 1;
  b.box(x0, z0, x1, z1, Y.LOWER, Y.ROOF - 3, {
    kind: 'brick', mask: (x, z, y) => ring(x, z) && ![0, 1, 2].some((k) => inWindow(x, y + k, z)), color: red,
  });
  // the upper floor, flagstone on top
  b.box(x0 + 1, z0 + 1, x1 - 1, z1 - 1, Y.UPPER - 3, Y.UPPER - 1, { kind: 'plate', color: SLAB });
  b.box(x0 + 1, z0 + 1, x1 - 1, z1 - 1, Y.UPPER - 1, Y.UPPER, { kind: 'tile', color: (x, _y, z) => FLAG[Math.floor(hash2(x >> 1, z >> 1) * 3)] });
  // inner walls of the lower floor: rooms off a corridor [assumed]
  for (const x of [96, 120, 146]) box(b, [x, z0 + 1, x + 1, z1 - 1], Y.LOWER, Y.UPPER - 3, WHITE);
  // the stair inside, from the lower floor to the upper [assumed]
  b.newGroup();
  for (let i = 0; i < 10; i++) box(b, [100 + i * 2, -14, 102 + i * 2, -10], Y.LOWER, Y.LOWER + 3 * (i + 1), FLAG[0]);
}

/** the windows: dark frames round the glass (envelope) */
export function buildWindows(b: Builder) {
  b.setPhase(P.ENVELOPE);
  for (const w of WINDOWS) {
    b.newGroup();
    const [x0, z0, x1, z1] = w.r;
    b.box(x0, z0, x1, z1, w.y0, w.y1, {
      kind: 'plate', mask: (x, z, y) => (x1 - x0 > 1 ? x === x0 || x === x1 - 1 : z === z0 || z === z1 - 1) || y === w.y0 || y === w.y1 - 1, color: FRAME,
    });
    b.box(x0, z0, x1, z1, w.y0, w.y1, { kind: 'glass', color: GLASS });
  }
}

/**
 * The roof (roof): the terrace's slab in terracotta, flush with the walls and with no parapet [documented]; the inverted
 * pyramid of steps rising to it from the land [documented]; the white curving wall standing free on it [documented].
 */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  const [x0, z0, x1, z1] = HOUSE;
  b.newGroup();
  box(b, HOUSE, Y.ROOF - 3, Y.ROOF - 1, red);
  b.box(x0, z0, x1, z1, Y.ROOF - 1, Y.ROOF, { kind: 'tile', color: (x, _y, z) => TERRACOTTA[Math.floor(hash2(x >> 1, z) * 3)] });
  // the stair: each step a little wider than the one below, a solid wedge of red masonry
  b.newGroup();
  STAIR.forEach((s, i) => {
    const below = i === 0 ? null : STAIR[i - 1];
    // only what shows: the riser at the step's front (down to the ground where the step below doesn't hide it) and the side
    // walls down to the ground; the inside stays hollow
    b.box(s.x0, s.z0, s.x1, s.z1, groundPlates(s.x0, 0), s.top - 1, {
      kind: 'brick', color: red,
      mask: (x, z, y) => z === s.z0 || z === s.z1 - 1 || (x === s.x0 && (y >= s.top - 4 || !below || z <= below.z0 || z >= below.z1 - 1)),
    });
    b.box(s.x0, s.z0, s.x1, s.z1, s.top - 1, s.top, { kind: 'tile', color: (x, _y, z) => TERRACOTTA[Math.floor(hash2(x, z) * 3)] });
  });
  // the white wall: a curve standing on the terrace
  b.newGroup();
  const { cx, cz, r, from, to } = ROOF_WALL;
  const cells = new Set<string>();
  for (let a = from; a <= to; a += 0.02) cells.add(`${Math.round(cx + r * Math.cos(a))},${Math.round(cz + r * Math.sin(a))}`);
  for (const c of cells) {
    const [x, z] = c.split(',').map(Number);
    if (inRect(x, z, HOUSE)) b.box(x, z, x + 1, z + 1, Y.ROOF, Y.ROOF + Y.WALL, { kind: 'brick', color: WHITE });
  }
}

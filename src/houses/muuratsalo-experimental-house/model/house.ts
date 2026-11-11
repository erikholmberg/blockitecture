/**
 * The Muuratsalo Experimental House itself (spec 058): the footings, the guest wing's posts on the boulders; the floors and the
 * courtyard's paving round the fire pit; the brick walls, white outside and toward the rooms, a patchwork of some fifty test
 * panels of brick and tile toward the courtyard; the windows, the doors and the guest wing's timber walls; the roofs.
 * Layout and sourcing: layout.ts.
 */
import { C } from '@/engine/catalog';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  COURT, EAST_WING, FIRE_PIT, GUEST, inRect, MAIN, northRoof, NORTH_WING, SOUTH_OPENING, WEST_OPENING, Y,
} from './layout';
import { GUEST_GROUND } from './site';

/** white-painted plastered brick outside [documented]; the felt roofs [documented: the section; their colour assumed] */
export const WHITE = [0xf4f2ec, 0xeeebe3];
export const FELT = 0x3a3836;
export const TIMBER = 0x6f5c48; // the guest wing [documented: wood]
export const FRAME = 0x4b3b2d; // the windows' wooden frames [documented: wood]
export const GLASS = 0xd5e3e3;

/**
 * The courtyard's patchwork [documented: about fifty test panels of bricks and ceramic tiles, laid in stacked and running bonds,
 * some with headers standing proud; the courtyard's floor paved in brick patterns too]. Each panel's material and bond is
 * picked from what the sources describe [assumed: which is where].
 */
const REDS = [[0xa4482f, 0x963f2a], [0x8f3b28, 0x7f3423], [0xb5583a, 0xa54d32], [0x7e3324, 0x6d2c20], [0xc0694a, 0xad5d41], [0x9c4a36, 0x8a412f]];
const TILES = [[0x2f3c46, 0x3a4954], [0xd8d3c4, 0xcdc7b6], [0x4c5e3e, 0x56694a], [0x8a6a3a, 0x7d5f33], [0x6f7f87, 0x63737b]];
export function patch(u: number, y: number, wall: number): number {
  const row = Math.floor(y / 8), off = (row * 3) % 5, col = Math.floor((u + off) / 5);
  const h = hash2(col * 7 + wall * 31, row * 13 + wall);
  const course = Math.floor(y / 2);
  if (h < 0.8) {
    const [a, b] = REDS[Math.floor(hash2(col, row * 5 + wall) * REDS.length)];
    if (h < 0.5) return ((u + (course & 1)) & 1) === 0 ? a : b; // running bond
    if (h < 0.66) return (u & 1) === 0 ? a : b; // stacked bond
    return (u + course) % 3 === 0 ? b : a; // headers standing out, in diagonals
  }
  const [a, b] = TILES[Math.floor(hash2(row, col * 3 + wall) * TILES.length)];
  return ((u + course) & 1) === 0 ? a : b;
}

const white = (x: number, y: number, z: number) => WHITE[Math.floor(hash2(x + z * 5, Math.floor(y / 9)) * 2)];

/** What's at a wall cell: 'white', 'patch' (a courtyard face), or null (no wall); `top` is the wall's top there. */
export function wallAt(x: number, z: number): { top: number; face: 'white' | 'patch'; u: number; id: number } | null {
  const inCourtSpan = x < COURT[2];
  // the courtyard's west wall, free-standing: white toward the lake, patchwork toward the courtyard
  if (z >= COURT[1] && z < COURT[3] && x <= 1) return { top: Y.COURT_WALL, face: x === 1 ? 'patch' : 'white', u: z, id: 1 };
  // its south wall: the 265 cm return, then the opening [documented]
  if ((z === 45 || z === 46) && x < SOUTH_OPENING[0]) return { top: Y.COURT_WALL, face: z === 45 ? 'patch' : 'white', u: x, id: 2 };
  // the studio wing's courtyard wall, two layers: patchwork outside, white inside
  if ((z === 14 || z === 15) && inCourtSpan) return { top: northRoof(z), face: z === 15 ? 'patch' : 'white', u: x, id: 3 };
  // the bedroom wing's courtyard wall, likewise
  if ((x === 23 || x === 24) && z >= COURT[1] && z < COURT[3]) return { top: Y.LOW, face: x === 23 ? 'patch' : 'white', u: z, id: 4 };
  // the outer walls: white
  if (inRect(x, z, NORTH_WING) && (z === 0 || x === 0 || x === 46)) return { top: northRoof(z), face: 'white', u: 0, id: 0 };
  if (inRect(x, z, NORTH_WING) && z === 15) return { top: northRoof(z), face: 'white', u: 0, id: 0 }; // between the wings
  if (inRect(x, z, EAST_WING) && (x === 46 || z === 46)) return { top: Y.LOW, face: 'white', u: 0, id: 0 };
  return null;
}

/** the windows, the doors and the west wall's slats [documented: the plan's openings; their sizes from the section] */
export function openingAt(x: number, y: number, z: number): 'glass' | 'frame' | 'door' | 'slat' | 'open' | null {
  const band = (a: number, b: number) => y >= a && y < b;
  // the studio's big window to the courtyard
  if ((z === 14 || z === 15) && x >= 3 && x < 20 && band(3, Y.WINDOW_HEAD)) return z === 14 ? 'open' : x % 4 === 3 || y === 3 ? 'frame' : 'glass';
  // the studio's window to the lake, at its west end, and the north windows
  if (x === 0 && z >= 4 && z < 12 && band(6, Y.WINDOW_HEAD)) return z % 4 === 0 ? 'frame' : 'glass';
  if (z === 0 && ((x >= 5 && x < 12) || (x >= 34 && x < 40)) && band(9, 21)) return 'glass';
  // the bedrooms' windows to the east and the south
  if (x === 46 && z >= 16 && ((z >= 20 && z < 26) || (z >= 32 && z < 38) || (z >= 40 && z < 44)) && band(6, 21)) return 'glass';
  if (z === 46 && x >= 30 && x < 40 && band(6, 21)) return 'glass';
  // doors: from the courtyard into the bedroom wing; between the wings; to the guest wing
  if ((x === 23 || x === 24) && z >= 27 && z < 30 && band(0, 20)) return x === 23 ? 'door' : 'open';
  if (z === 15 && x >= 26 && x < 29 && band(0, 20)) return 'open';
  if (x === 46 && z >= 4 && z < 7 && band(0, 20)) return 'open';
  // the west wall's opening toward the lake, a row of slats [documented: the slotted wall]
  if (x <= 1 && z >= WEST_OPENING.z0 && z < WEST_OPENING.z1 && band(WEST_OPENING.y0, WEST_OPENING.y1)) return x === 0 && z % 2 === 0 ? 'slat' : 'open';
  return null;
}

/** the footings, and the guest wing's posts standing on boulders [documented: "building without foundations"] (foundation) */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  b.box(MAIN[0], MAIN[1], MAIN[2], MAIN[3], -3, -2, { kind: 'plate', color: 0x8f8b82 });
  for (const x of [48, 54, 60, 66, 70]) for (const z of [1, 10]) {
    b.newGroup();
    b.box(x - 1, z - 1, x + 2, z + 2, GUEST_GROUND, GUEST_GROUND + 3, { kind: 'brick', color: 0x8a8780, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= 1.3 });
    b.column(x, z, GUEST_GROUND + 3, -2, 0x5d4a38, 'round');
  }
}

/** the floors: boards inside [assumed], the courtyard's brick fields [documented], the fire pit [documented] (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  b.box(MAIN[0], MAIN[1], MAIN[2], MAIN[3], -2, -1, { kind: 'plate', color: 0x8f8b82 });
  b.box(MAIN[0], MAIN[1], MAIN[2], MAIN[3], -1, 0, {
    kind: 'tile', mask: (x, z) => !inRect(x, z, FIRE_PIT),
    color: (x, _y, z) => (inRect(x, z, COURT) ? patch(x + 3 * Math.floor(z / 6), z * 2, 9) : 0xb79a74),
  });
  // the fire pit: a square of dark stones round the embers
  b.newGroup();
  b.box(FIRE_PIT[0], FIRE_PIT[1], FIRE_PIT[2], FIRE_PIT[3], -1, 1, {
    kind: 'brick', unit: 2, color: 0x3d3a37, mask: (x, z) => x === FIRE_PIT[0] || z === FIRE_PIT[1] || x === FIRE_PIT[2] - 1 || z === FIRE_PIT[3] - 1,
  });
  b.box(FIRE_PIT[0] + 1, FIRE_PIT[1] + 1, FIRE_PIT[2] - 1, FIRE_PIT[3] - 1, -1, 0, { kind: 'light', color: C.fire });
  // the guest wing's floor on its posts
  b.newGroup();
  b.box(GUEST[0], GUEST[1], GUEST[2], GUEST[3], -2, 0, { kind: 'plate', color: (_x, y) => (y === -1 ? 0xb79a74 : 0x6f5c48) });
}

/** the brick walls, white and patchwork, and the studio's fireplace and loft (structure) */
export function buildWalls(b: Builder) {
  b.setPhase(P.STRUCTURE);
  b.newGroup();
  b.box(MAIN[0], MAIN[1], MAIN[2], MAIN[3], 0, Y.STUDIO_HIGH, {
    kind: 'plate', unit: 1,
    mask: (x, z, y) => { const w = wallAt(x, z); return !!w && y < w.top && openingAt(x, y, z) === null; },
    color: (x, y, z) => { const w = wallAt(x, z)!; return w.face === 'patch' ? patch(w.u, y, w.id) : white(x, y, z); },
  });
  // the inner partitions: studio | kitchen; the bath; the bedrooms [documented: the plan's rooms; their walls' places scaled]
  b.newGroup();
  const parts: [number, number, number, number][] = [[30, 1, 31, 14], [25, 23, 31, 24], [30, 17, 31, 23], [25, 31, 46, 32], [25, 39, 46, 40]];
  b.box(25, 1, 46, 46, 0, Y.LOW, {
    kind: 'brick', color: WHITE[0],
    mask: (x, z, y) => parts.some((r) => inRect(x, z, r)) && !(y < 20 && ((x === 30 && z >= 6 && z < 9) || (z === 31 && x >= 27 && x < 30) || (z === 39 && x >= 27 && x < 30) || (x === 30 && z >= 18 && z < 21))),
  });
  // [documented: the studio's stair up to its loft] the loft over the studio's west end, on the walls
  b.newGroup();
  b.box(1, 1, 9, 14, 18, 19, { kind: 'plate', color: 0xb79a74 });
  // its stair: solid steps rising toward the loft's edge
  for (let i = 0; i < 6; i++) b.box(14 - i, 9, 15 - i, 13, 0, 3 * i + 3, { kind: 'brick', color: 0x9c7f5c });
  // [assumed] the studio's open fireplace in white brick, its chimney through the roof
  b.newGroup();
  b.box(24, 1, 28, 4, 0, Y.STUDIO_HIGH + 6, { kind: 'brick', color: WHITE[1], mask: (x, z, y) => !(z === 3 && x >= 25 && x < 27 && y < 9) });
}

/** the windows, the doors, the slats; the guest wing's timber walls (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const kinds = [['frame', 'plate', FRAME], ['glass', 'glass', GLASS], ['door', 'plate', FRAME], ['slat', 'plate', WHITE[0]]] as const;
  for (const [what, kind, color] of kinds) {
    b.newGroup();
    b.box(MAIN[0], MAIN[1], MAIN[2], MAIN[3], 0, Y.STUDIO_HIGH, {
      kind, unit: 1, color,
      mask: (x, z, y) => { const w = wallAt(x, z); return !!w && y < w.top && openingAt(x, y, z) === what; },
    });
  }
  // the guest wing: vertical boards [documented: wood], its windows along the south [assumed]
  b.newGroup();
  b.box(GUEST[0], GUEST[1], GUEST[2], GUEST[3], 0, Y.GUEST_ROOF, {
    kind: 'plate', unit: 1,
    mask: (x, z) => x === GUEST[2] - 1 || z === GUEST[1] || z === GUEST[3] - 1 || x === GUEST[0] + 11,
    color: (x, y, z) => {
      const win = (z === GUEST[3] - 1 || z === GUEST[1]) && y >= 6 && y < 18 && ((x >= 50 && x < 56) || (x >= 62 && x < 68));
      if (win) return y === 6 || y === 17 || x % 3 === 2 ? FRAME : 0xc9d8d8;
      if (x === GUEST[0] + 11 && y < 20 && z >= 4 && z < 7) return 0x8a7660; // the door between the two rooms
      return (x + z) % 2 ? TIMBER : 0x655340;
    },
  });
}

/** the roofs: felt on boards, the studio wing's falling from the courtyard, the bedroom wing's and the guest wing's [assumed] */
export function buildRoofs(b: Builder) {
  b.setPhase(P.ROOF);
  for (let z = NORTH_WING[1]; z < NORTH_WING[3]; z++) {
    b.newGroup();
    b.box(NORTH_WING[0], z, NORTH_WING[2], z + 1, northRoof(z), northRoof(z) + Y.ROOF, { kind: 'plate', color: FELT });
  }
  b.newGroup();
  b.box(EAST_WING[0], EAST_WING[1], EAST_WING[2], EAST_WING[3], Y.LOW, Y.LOW + Y.ROOF, { kind: 'plate', color: FELT, mask: (x) => x >= 23 });
  b.newGroup();
  b.box(GUEST[0], GUEST[1], GUEST[2], GUEST[3], Y.GUEST_ROOF, Y.GUEST_ROOF + Y.ROOF, { kind: 'plate', color: FELT });
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[10, 7], [20, 7], [37, 7], [35, 27], [35, 35], [35, 43]]) b.add(x, z, (z < 16 ? northRoof(z) : Y.LOW) - 1, 1, 1, 1, C.warmLight, 'light');
  });
}

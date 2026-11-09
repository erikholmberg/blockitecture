/**
 * Casa Luis Barragán itself (spec 035), from the UNESCO nomination's plans (pp. 63–71): the footings, the volcanic-stone floors,
 * the thick plastered walls of the rooms and the tall living room, library and studio, the first floor, the garden's high walls,
 * the windows (the cross-barred one onto the garden, the library's onto the street), and the roof: its slab and timber beams,
 * the service rooms, the tower, and the terrace walled in pink, orange and white. Layout and sourcing: layout.ts.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  FIRST, FIRST_ROOMS, GARAGE, GARDEN, GROUND_ROOMS, HOUSE, inAny, inRect, LIBRARY, LIVING, LIVING_WINDOW, onEdge, PATIO_ALL, POOL,
  Rect, SERVICE_ROOMS, SERVICE_TERRACE, STREET_WINDOW, STUDIO, STUDIO_WINDOW, TALL_ROOMS, TERRACE, TOWER, VESTIBULE, Y,
} from './layout';
import { groundPlates, LAVA } from './site';

/** rough plaster: grey on the street, pale inside and toward the garden [documented: facades and photographs] */
export const STREET_GREY = 0xa9a398;
export const PLASTER = 0xdcd6ca;
export const WHITE = 0xf2efe8;
/** the walled terrace's colours [documented: "pink, orange and white"; which wall is which, photographs] */
export const PINK = 0xd9719a;
export const ORANGE = 0xd9733a;
export const TERRACE_WHITE = 0xf3f1ec;
export const TERRACE_GREY = 0x9d978c;
/** the street doors, yellow [documented: photograph, p. 9] */
export const YELLOW = 0xe3c25b;
export const PINE = [0xb88a5a, 0xae8050];
export const TIMBER = 0x5a3e2a;
export const GLASS = 0xdfeef2;
export const FRAME = 0x3e3a35;
export const SLAB = 0xb9b4a8;

const plaster = (x: number, _y: number, z: number) => (z === HOUSE[3] - 1 ? STREET_GREY : x === HOUSE[0] || z === HOUSE[1] || x === HOUSE[2] - 1 ? PLASTER : WHITE);
/** a doorway in an inner wall: a 3-ft gap, 7 ft high, every so often along it [assumed] */
const doorway = (x: number, y: number, z: number, base: number) => y < base + 18 && (x * 7 + z * 13) % 11 < 3;
/** the door at the top of the library's stair, into the room above the alcove [documented: photographs; plan p. 65] */
export const STAIR_DOOR = { z0: 121, z1: 125, y0: Y.FIRST, y1: Y.FIRST + 18 };
const stairDoor = (x: number, y: number, z: number) => (x === 46 || x === 47) && z >= STAIR_DOOR.z0 && z < STAIR_DOOR.z1 && y >= STAIR_DOOR.y0 && y < STAIR_DOOR.y1;
const exterior = (x: number, z: number) => x === HOUSE[0] || x === HOUSE[2] - 1 || z === HOUSE[1] || z === HOUSE[3] - 1;

/** openings in the outer walls [documented: the facades, p. 69] */
function opening(x: number, y: number, z: number): 'glass' | 'door' | null {
  const w = LIVING_WINDOW, s = STUDIO_WINDOW, st = STREET_WINDOW;
  if (z === w.z && x >= w.x0 && x < w.x1 && y >= w.y0 && y < w.y1) return 'glass';
  if (z === s.z && x >= s.x0 && x < s.x1 && y >= s.y0 && y < s.y1) return 'glass';
  if (z === st.z && x >= st.x0 && x < st.x1 && y >= st.y0 && y < st.y1) return 'glass';
  if (z === HOUSE[3] - 1 && y < 18 && ((x >= GARAGE[0] + 3 && x < GARAGE[2] - 2) || (x >= VESTIBULE[0] + 2 && x < VESTIBULE[0] + 5))) return 'door';
  // the small windows: the first floor's to the street and the garden, the kitchen's and dining room's to the garden
  if ((z === HOUSE[3] - 1 || z === HOUSE[1]) && x < 47 && y >= Y.FIRST + 9 && y < Y.FIRST + 18 && x % 10 >= 4 && x % 10 < 8) return 'glass';
  if (z === HOUSE[1] && x < 47 && y >= 6 && y < 18 && x % 12 >= 4 && x % 12 < 9) return 'glass';
  return null;
}

/** footings under every wall (foundation), and the reflecting pool's basin */
export function buildFoundations(b: Builder) {
  b.setPhase(P.FOUNDATION);
  const walls = [...GROUND_ROOMS, ...TALL_ROOMS];
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], -6, -3, { kind: 'brick', color: SLAB, mask: (x, z) => walls.some((r) => onEdge(x, z, r)) });
  b.newGroup();
  const [x0, z0, x1, z1] = POOL;
  b.box(x0 - 1, z0 - 1, x1 + 1, z1 + 1, -9, -3, { kind: 'brick', color: 0x6d6a63, mask: (x, z, y) => y < -6 || !inRect(x, z, POOL) });
}

/** the ground floor: volcanic stone in the rooms (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], -3, -1, { kind: 'plate', color: SLAB });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], -1, 0, { kind: 'tile', color: (x, _y, z) => LAVA[Math.floor(hash2(x >> 1, z >> 1) * 3)] });
}

function walls(b: Builder, rooms: Rect[], y0: number, y1: number) {
  for (const r of rooms) {
    b.newGroup();
    b.box(r[0], r[1], r[2], r[3], y0, y1, {
      kind: 'brick', color: plaster,
      mask: (x, z, y) => {
        if (!onEdge(x, z, r)) return false;
        if (exterior(x, z)) return ![0, 1, 2].some((k) => opening(x, y + k, z));
        if ([0, 1, 2].some((k) => stairDoor(x, y + k, z))) return false;
        // the library's west wall carries the stair: one opening into the alcove, at its far end [assumed]
        if ((x === 46 || x === 47) && z >= LIBRARY[1]) return !(z < LIBRARY[1] + 4 && y < y0 + 18);
        return !doorway(x, y, z, y0);
      },
    });
  }
}

/** the walls of every room, the first floor's slab and rooms, the garden's and the patio's high walls (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  walls(b, TALL_ROOMS, Y.GROUND, Y.ROOF - 3);
  walls(b, GROUND_ROOMS, Y.GROUND, Y.FIRST - 3);
  b.newGroup();
  for (const r of FIRST) {
    // the slab's edge is plastered over with the walls
    b.box(r[0], r[1], r[2], r[3], Y.FIRST - 3, Y.FIRST - 1, { kind: 'plate', color: (x, y, z) => (exterior(x, z) ? plaster(x, y, z) : SLAB) });
    b.box(r[0], r[1], r[2], r[3], Y.FIRST - 1, Y.FIRST, { kind: 'tile', color: (x, y, z) => (exterior(x, z) ? plaster(x, y, z) : PINE[Math.floor(hash2(x, z >> 2) * 2)]) });
  }
  walls(b, FIRST_ROOMS, Y.FIRST, Y.ROOF - 3);
  // the garden's walls, high and blank, and the patio's, with a doorway from the garden [documented: plans; height assumed]
  b.newGroup();
  const [gx0, gz0, gx1, gz1] = GARDEN;
  const [px0, pz0, px1, pz1] = PATIO_ALL;
  const gardenWall = (x: number, z: number) =>
    (x === gx0 - 1 && z >= gz0 - 1 && z < gz1) || (z === gz0 - 1 && x >= gx0 - 1 && x <= gx1) || (x === gx1 && z >= gz0 - 1 && z < pz1 - 3) ||
    (z === pz0 && x >= px0 && x <= px1) || (x === px1 && z >= pz0 && z < pz1);
  // they stand on the ground as it climbs, the same height above it all round
  const H = Y.GARDEN_WALL - Y.GARDEN;
  b.box(gx0 - 1, gz0 - 1, px1 + 1, pz1, -12, 90, {
    kind: 'brick', color: PLASTER,
    mask: (x, z, y) => { if (!gardenWall(x, z)) return false; const g = Math.min(groundPlates(x, z), groundPlates(x + 1, z), groundPlates(x - 1, z), groundPlates(x, z + 1), groundPlates(x, z - 1)); return y >= g && y < g + H; },
  });
}

/** the windows in steel frames, the yellow garage and street doors (envelope) */
export function buildWindows(b: Builder) {
  b.setPhase(P.ENVELOPE);
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.GROUND, Y.ROOF - 3, {
    kind: 'glass', color: GLASS,
    mask: (x, z, y) => exterior(x, z) && opening(x, y, z) === 'glass' && !mullion(x, y, z),
  });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.GROUND, Y.ROOF - 3, {
    kind: 'brick', color: FRAME, mask: (x, z, y) => exterior(x, z) && opening(x, y, z) === 'glass' && mullion(x, y, z),
  });
  b.newGroup();
  b.box(HOUSE[0], HOUSE[3] - 1, HOUSE[2], HOUSE[3], Y.GROUND, 18, { kind: 'brick', color: YELLOW, mask: (x, z, y) => opening(x, y, z) === 'door' });
}

/** the window bars: the living room's great cross [documented]; the street window's grid of square panes [documented: p. 9] */
function mullion(x: number, y: number, z: number) {
  const w = LIVING_WINDOW, st = STREET_WINDOW;
  if (z === w.z && x >= w.x0 && x < w.x1) return x === w.crossX || (y >= w.crossY && y < w.crossY + 1);
  if (z === st.z && x >= st.x0 && x < st.x1) return (x - st.x0) % 3 === 0 || (y - st.y0) % 7 === 0;
  return false;
}

/**
 * The roof: the slab over the whole house, the timber beams under it in the tall rooms, the service rooms and their roof,
 * the tower, and the walled terrace's high walls in pink, orange and white (roof).
 */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.ROOF - 3, Y.ROOF - 1, { kind: 'plate', color: (x, y, z) => (exterior(x, z) ? plaster(x, y, z) : SLAB) });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.ROOF - 1, Y.ROOF, { kind: 'tile', color: (x, _y, z) => (inRect(x, z, TERRACE) ? LAVA[Math.floor(hash2(x >> 1, z >> 1) * 3)] : 0xc9c2b4) });
  // the low parapet round the roof's edge
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.ROOF, Y.ROOF + 4, { kind: 'brick', color: plaster, mask: (x, z) => exterior(x, z) && !inRect(x, z, TERRACE) });
  // the timber beams, under the slab of the living room, the library and the studio [documented: photographs]
  b.hanging(P.ROOF, () => {
    for (const r of [LIVING, LIBRARY, STUDIO]) {
      b.newGroup();
      for (let x = r[0] + 2; x < r[2] - 1; x += 3) b.box(x, r[1] + 1, x + 1, r[3] - 1, Y.ROOF - 5, Y.ROOF - 3, { kind: 'plate', color: TIMBER });
    }
  });
  // the service rooms and the laundry, with their own roof; the service terrace's walls
  for (const r of SERVICE_ROOMS) {
    b.newGroup();
    b.box(r[0], r[1], r[2], r[3], Y.ROOF, Y.SERVICE - 3, { kind: 'brick', color: WHITE, mask: (x, z, y) => onEdge(x, z, r) && !doorway(x, y, z, Y.ROOF) });
    b.box(r[0], r[1], r[2], r[3], Y.SERVICE - 3, Y.SERVICE, { kind: 'plate', color: SLAB });
  }
  b.newGroup();
  const st = SERVICE_TERRACE;
  b.box(st[0], st[1], st[2], st[3], Y.ROOF, Y.ROOF + 18, { kind: 'brick', color: TERRACE_WHITE, mask: (x, z) => onEdge(x, z, st) && z !== st[1] });
  b.newGroup();
  b.box(TOWER[0], TOWER[1], TOWER[2], TOWER[3], Y.ROOF, Y.TOWER, { kind: 'brick', color: TERRACE_GREY, mask: (x, z) => onEdge(x, z, TOWER) });
  b.box(TOWER[0], TOWER[1], TOWER[2], TOWER[3], Y.TOWER, Y.TOWER + 2, { kind: 'plate', color: TERRACE_GREY });
  // the walled terrace: each wall its own colour and height, all above eye level, open to the sky
  b.newGroup();
  const [tx0, tz0, tx1, tz1] = TERRACE;
  const wall = (x: number, z: number): [number, number] | null => {
    if (z === tz0) return [ORANGE, 26]; // toward the garden: orange, the tallest
    if (x === tx1 - 1) return [PINK, 22]; // toward the studio's roof: pink
    if (x === tx0) return [TERRACE_WHITE, 18]; // toward the service rooms: white
    if (z === tz1 - 1) return [TERRACE_GREY, 16]; // to the street: the grey of the facade
    return null;
  };
  b.box(tx0, tz0, tx1, tz1, Y.ROOF, Y.ROOF + 26, {
    kind: 'brick',
    mask: (x, z, y) => { const w = wall(x, z); return !!w && y < Y.ROOF + w[1]; },
    color: (x, _y, z) => wall(x, z)?.[0] ?? WHITE,
  });
}

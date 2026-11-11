/**
 * The Sonneveld House itself (spec 060): the foundation; the ground floor; the steel frame, the upper floors, the balconies'
 * slabs, the helical main stair and the spiral down to the garden; the white walls, the tiled ground floor, the ribbon windows
 * and the balconies' parapets; the roof terrace with its balustrade, the stair tower, its canopy and the chimney.
 * Layout and sourcing: layout.ts.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BALCONY, BLOCK, CANOPY, CHIMNEY, COLUMNS_X, COLUMNS_Z, GARAGE, inRect, inStair, KITCHEN, RECESS, RIBBON, SETBACK, SPIRAL,
  stairStep, stairVoid, STEPS, STREET_WINDOWS, TOWER, Y,
} from './layout';

/** white render [documented]; pale glazed tiles on the ground floor [documented: tiled; the colour assumed]; slender steel
 * windows, silver-grey [documented: steel; the colour assumed]; the steel frame's columns */
export const WHITE = [0xf5f4ef, 0xefeee8];
export const TILE = [0xe3dcc6, 0xd9d2bb];
export const STEEL = 0xaeb4b8;
export const GLASS = 0xd3e4e8;
export const COLUMN = 0xdcdcd6;
export const SLAB = 0xe4e2da;
export const DOOR = 0x2c3034;

const white = (x: number, y: number, z: number) => WHITE[Math.floor(hash2(x + z * 3, Math.floor(y / 9)) * 2)];
const tile = (x: number, y: number, z: number) => TILE[(x + z + Math.floor(y / 2)) & 1];
const band = (y: number, a: number, b: number) => y >= a && y < b;
const inAny = (x: number, pairs: [number, number][]) => pairs.some(([a, b]) => x >= a && x < b);

type Cell = 'white' | 'tile' | 'steel' | 'glass' | 'door' | null;
/** a window: steel at its edges and every `every` studs, glass between */
const win = (u: number, y: number, u0: number, u1: number, y0: number, y1: number, every = 4): Cell =>
  u === u0 || u === u1 - 1 || y === y0 || y === y1 - 1 || (u - u0) % every === 0 ? 'steel' : 'glass';

/** the ground floor's walls [scaled: the plans and the west elevation] */
function groundWall(x: number, y: number, z: number): Cell {
  if (y >= Y.F1 - Y.SLAB) return null;
  const [x0, , x1, z1] = BLOCK;
  // the street wall, set back behind the columns: tiled, a high strip of small windows, larger glass at the south end
  if (z === SETBACK && x >= x0 && x < x1) {
    if (band(x, 2, 14) && band(y, 5, 23)) return win(x, y, 2, 14, 5, 23);
    if (band(x, 16, 40) && band(y, 18, 23)) return win(x, y, 16, 40, 18, 23, 3);
    return 'tile';
  }
  // the south wall: the daughters' studio, glazed onto the garden [documented]
  if (x === x0 && z > SETBACK && z < z1) return band(y, 2, 23) && z < z1 - 1 ? win(z, y, SETBACK + 1, z1 - 1, 2, 23) : 'white';
  // the east wall: the servants' rooms [scaled]
  if (z === z1 - 1 && x > x0 && x < KITCHEN[0]) return (band(x, 8, 14) || band(x, 22, 28)) && band(y, 9, 20) ? win(x, y, x < 15 ? 8 : 22, x < 15 ? 14 : 28, 9, 20, 3) : 'white';
  // the north wall: the front door [documented: on the north side by the north-west corner], the stair's tall window
  if (x === x1 - 1 && z >= SETBACK && z < z1) {
    if (band(z, 6, 9) && y < 20) return 'door';
    if (band(z, 12, 17) && band(y, 3, 23)) return win(z, y, 12, 17, 3, 23, 2);
    return z < 12 ? 'tile' : 'white';
  }
  // the garage in the wing [documented], its doors on the drive's side [assumed]
  if (inRect(x, z, GARAGE) && y < Y.GARAGE_ROOF - 3) {
    if (x === GARAGE[2] - 1) return band(z, 35, 50) && y < 21 ? 'door' : 'white';
    if (z === GARAGE[3] - 1 || (z === GARAGE[1] && x >= BLOCK[2]) || x === GARAGE[0]) return 'white';
  }
  return null;
}

/** the upper floors' walls [scaled: the plans and elevations] */
function upperWall(x: number, y: number, z: number): Cell {
  const [x0, z0, x1, z1] = BLOCK;
  const f = y < Y.F2 - Y.SLAB ? Y.F1 : Y.F2;
  if (y < Y.F1 || y >= Y.ROOF - Y.SLAB || band(y, Y.F2 - Y.SLAB, Y.F2)) return null;
  const recess = inRect(x, z, RECESS);
  // the street front: one ribbon window on the first floor, four windows on the second [scaled]
  if (z === z0 && x >= x0 && x < x1) {
    if (f === Y.F1 && band(x, RIBBON.x0, RIBBON.x1) && band(y, RIBBON.y0, RIBBON.y1))
      return y === RIBBON.y0 || y === RIBBON.y1 - 1 || RIBBON.mullions.includes(x) ? 'steel' : 'glass';
    if (f === Y.F2 && band(y, 61, 74)) for (const [a, c] of STREET_WINDOWS) if (band(x, a, c)) return win(x, y, a, c, 61, 74, 5);
    return 'white';
  }
  // the south end: closed white wall, but for the balconies' corner [documented]
  if (x === x0 && z > z0 && z < RECESS[1]) return 'white';
  // behind the balconies: glass from floor to ceiling [scaled]
  if (x === RECESS[2] && z >= RECESS[1] && z < z1) return band(y, f, f + 22) ? win(z, y, RECESS[1], z1, f, f + 22, 5) : 'white';
  if (z === RECESS[1] && x >= x0 && x < RECESS[2]) return band(y, f, f + 22) && x > x0 ? win(x, y, x0 + 1, RECESS[2], f, f + 22, 5) : 'white';
  // the east side: the dining room's and the bedrooms' windows [scaled]
  if (z === z1 - 1 && x > RECESS[2] && x < KITCHEN[0]) return band(x, 21, 35) && band(y, f + 7, f + 20) ? win(x, y, 21, 35, f + 7, f + 20, 5) : 'white';
  if (z === z1 - 1 && x >= KITCHEN[0] && x < x1 && f === Y.F2) return band(x, 41, 49) && band(y, f + 7, f + 20) ? win(x, y, 41, 49, f + 7, f + 20) : 'white';
  // the north end: the stair's tall windows, a short strip on the first floor [scaled]
  if (x === x1 - 1 && z > z0 && z < z1 && !recess) {
    if (band(z, 12, 17) && band(y, f + 3, f + 23)) return win(z, y, 12, 17, f + 3, f + 23, 2);
    if (f === Y.F1 && band(z, 21, 29) && band(y, f + 9, f + 17)) return win(z, y, 21, 29, f + 9, f + 17);
    return 'white';
  }
  // the kitchen over the garage [documented], its windows to the east and the north
  if (f === Y.F1 && inRect(x, z, KITCHEN) && z >= z1) {
    if (z === KITCHEN[3] - 1) return band(x, 40, 50) && band(y, f + 8, f + 19) ? win(x, y, 40, 50, f + 8, f + 19, 3) : 'white';
    if (x === KITCHEN[2] - 1) return band(z, 36, 50) && band(y, f + 8, f + 19) ? win(z, y, 36, 50, f + 8, f + 19) : 'white';
    if (x === KITCHEN[0]) return 'white';
  }
  // the screen wall sheltering the wing's roof terrace, continuing the north front [scaled: about 13.1 m in all]
  if (f === Y.F2 && x === x1 - 1 && z >= z1 && z < 43) return 'white';
  return null;
}
export const wallAt = (x: number, y: number, z: number): Cell => groundWall(x, y, z) ?? upperWall(x, y, z);

/** the foundation: a concrete raft [assumed; the basement under the north part isn't modelled] (foundation) */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  b.box(BLOCK[0], BLOCK[1], GARAGE[2], GARAGE[3], -3, -1, { kind: 'plate', color: 0x9d998f, mask: (x, z) => inRect(x, z, BLOCK) || inRect(x, z, GARAGE) });
}

/** the ground floor (floor): tiles, darker in the garage [assumed] */
export function buildFloor(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  b.box(BLOCK[0], BLOCK[1], GARAGE[2], GARAGE[3], -1, 0, {
    kind: 'tile', color: (x, _y, z) => (inRect(x, z, GARAGE) ? 0x8f8d86 : z < SETBACK ? 0xb9b5ac : 0xc9c2ae),
    mask: (x, z) => inRect(x, z, BLOCK) || inRect(x, z, GARAGE),
  });
}

const slabAt = (x: number, z: number, f: number) =>
  (inRect(x, z, BLOCK) || (f !== Y.ROOF && inRect(x, z, BALCONY)) || (f !== Y.ROOF && inRect(x, z, KITCHEN))) && !stairVoid(x, z);

/** the frame, the floors and the stairs (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the steel columns [documented: a steel skeleton; the grid scaled], free under the overhang on the street side
  b.newGroup();
  // on the street line they stand free below, and a stud inside the front above, behind the ribbon window's glass [scaled]
  for (const x of COLUMNS_X) for (const z of COLUMNS_Z) {
    if (z !== 0) { b.box(x, z, x + 1, z + 1, 0, Y.ROOF - Y.SLAB, { kind: 'brick', color: COLUMN }); continue; }
    b.box(x, 0, x + 1, 1, 0, Y.F1 - Y.SLAB, { kind: 'brick', unit: 1, color: COLUMN });
    b.box(x, 1, x + 1, 2, Y.F1, Y.ROOF - Y.SLAB, { kind: 'brick', color: COLUMN });
  }
  // the garage's roof, with the staff's balcony on its north strip [scaled]
  b.newGroup();
  b.box(BLOCK[2], GARAGE[1], GARAGE[2], GARAGE[3], Y.GARAGE_ROOF - 3, Y.GARAGE_ROOF - 1, { kind: 'plate', color: SLAB });
  // the floors [documented: concrete floors on the steel], in linoleum [documented; the colours assumed]; the balconies' slabs
  for (const f of [Y.F1, Y.F2]) {
    b.newGroup();
    b.box(BALCONY[0], BLOCK[1], BLOCK[2], KITCHEN[3], f - Y.SLAB, f - 1, { kind: 'plate', color: WHITE[0], mask: (x, z) => slabAt(x, z, f) });
    b.box(BALCONY[0], BLOCK[1], BLOCK[2], KITCHEN[3], f - 1, f, {
      kind: 'tile', mask: (x, z) => slabAt(x, z, f),
      // white at the slab's edge, where it shows on the fronts
      color: (x, _y, z) => {
        if (!inRect(x, z, BLOCK) || inRect(x, z, RECESS)) return !inRect(x, z, [BLOCK[0] + 1, BLOCK[1] + 1, BLOCK[2] - 1, KITCHEN[3] - 1]) || x < BLOCK[0] + 1 ? WHITE[0] : 0xcfcbc0;
        if (!inRect(x, z, [BLOCK[0] + 1, BLOCK[1] + 1, BLOCK[2] - 1, BLOCK[3] - 1])) return WHITE[0];
        return f === Y.F1 ? (z >= 17 ? 0xe0b83a : 0x8b7355) : 0x9fa6a0;
      },
    });
  }
  // the main stair: a helix of twelve steps to a turn, two turns to a storey… in blocks, one solid turn a storey, each step
  // standing on its own floor [documented: black marble treads; its shape scaled]
  for (const f of [0, Y.F1, Y.F2]) {
    b.newGroup();
    b.box(41, 10, 51, 20, f, f + 27, {
      kind: 'brick', unit: 1, mask: (x, z, y) => inStair(x, z) && y < f + Math.round((27 * (stairStep(x, z) + 1)) / STEPS),
      color: (x, y, z) => (y === f + Math.round((27 * (stairStep(x, z) + 1)) / STEPS) - 1 ? 0x26282a : WHITE[1]),
    });
  }
  // the steel spiral from the first floor's balcony down to the garden [documented]: a post and twelve steps on steel bars
  b.newGroup();
  b.column(SPIRAL.cx, SPIRAL.cz, 0, Y.F1 + 9, STEEL, 'round');
  for (let dz = -3; dz <= 3; dz++)
    for (let dx = -3; dx <= 3; dx++) {
      const r = Math.hypot(dx, dz);
      if (r < 0.9 || r > SPIRAL.r) continue;
      const a = (Math.atan2(dz, dx) + Math.PI) / (2 * Math.PI), top = Math.max(2, Math.round((Y.F1 * (Math.floor(a * 14) + 1)) / 14));
      const x = SPIRAL.cx + dx, z = SPIRAL.cz + dz;
      if (inRect(x, z, BALCONY)) continue;
      if (r > 2.6 && (Math.floor(a * 14) & 1) === 0) b.box(x, z, x + 1, z + 1, 0, top - 1, { kind: 'bar', color: STEEL });
      b.box(x, z, x + 1, z + 1, top - 1, top, { kind: 'plate', color: 0x6f7478 });
    }
  // the partitions [scaled: the plans' rooms], white; doors left open
  b.newGroup();
  const parts: { r: [number, number, number, number]; f: number; doors: [number, number, number, number][] }[] = [
    { r: [35, 5, 36, 31], f: 0, doors: [[35, 20, 36, 23]] }, // the hall and the stairs | the servants' rooms and the studio
    { r: [1, 16, 35, 17], f: 0, doors: [[20, 16, 23, 17]] }, // the studio and the hall | the servants' rooms
    { r: [36, 1, 37, 20], f: Y.F1, doors: [[36, 3, 37, 8]] }, // the library | the stair
    { r: [17, 17, 38, 18], f: Y.F1, doors: [[24, 17, 30, 18]] }, // the living room | the dining room
    { r: [1, 16, 37, 17], f: Y.F2, doors: [[20, 16, 23, 17], [30, 16, 33, 17], [8, 16, 11, 17]] }, // the bedrooms either side of the hall
    { r: [24, 1, 25, 16], f: Y.F2, doors: [] },
    { r: [26, 18, 27, 31], f: Y.F2, doors: [] },
    { r: [36, 1, 37, 9], f: Y.F2, doors: [] },
  ];
  b.box(1, 1, 51, 31, 0, Y.ROOF - Y.SLAB, {
    kind: 'brick', color: WHITE[0],
    mask: (x, z, y) => parts.some((p) => inRect(x, z, p.r) && band(y, p.f, p.f + 24) && !(y < p.f + 20 && p.doors.some((d) => inRect(x, z, d)))),
  });
}

/** the walls, the windows and the balconies' parapets (envelope), a plate at a time so the bands sit where they're drawn */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const kinds = [['white', 'plate', white], ['tile', 'plate', tile], ['steel', 'plate', STEEL], ['glass', 'glass', GLASS], ['door', 'plate', DOOR]] as const;
  for (const [what, kind, color] of kinds) {
    b.newGroup();
    b.box(BLOCK[0], BLOCK[1], GARAGE[2], GARAGE[3], 0, Y.ROOF - Y.SLAB, { kind, unit: 1, color, mask: (x, z, y) => wallAt(x, y, z) === what });
  }
  // the balconies' solid white parapets, about 1.2 m [scaled], open where the spiral stair lands on the first floor's
  for (const f of [Y.F1, Y.F2]) {
    b.newGroup();
    b.box(BALCONY[0], BALCONY[1], BALCONY[2], BALCONY[3], f, f + 10, {
      kind: 'brick', color: white,
      mask: (x, z) => (x === BALCONY[0] || z === BALCONY[3] - 1 || (z === BALCONY[1] && x < BLOCK[0])) && !(f === Y.F1 && z === BALCONY[3] - 1 && x >= -2 && x < 1),
    });
  }
  // the staff's balcony on the garage's roof: a white parapet [scaled]
  b.newGroup();
  b.box(BLOCK[2], GARAGE[1], GARAGE[2], GARAGE[3], Y.GARAGE_ROOF - 1, Y.GARAGE_ROOF + 8, {
    kind: 'brick', color: white, mask: (x, z) => x === GARAGE[2] - 1 || z === GARAGE[3] - 1 || z === GARAGE[1],
  });
}

/** the roof terrace: its deck, the balustrade of steel tube and mesh, the stair tower, the canopy and the chimney (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.newGroup();
  b.box(BLOCK[0], BLOCK[1], BLOCK[2], BLOCK[3], Y.ROOF - Y.SLAB, Y.ROOF, { kind: 'plate', color: (_x, y) => (y === Y.ROOF - 1 ? 0xbdb9ae : SLAB), mask: (x, z) => !stairVoid(x, z) });
  // the stair tower [scaled; its rounded north end squared off in blocks], a door onto the terrace
  b.newGroup();
  b.box(TOWER[0], TOWER[1], TOWER[2], TOWER[3], Y.ROOF, Y.TOWER - 2, {
    kind: 'brick', color: white,
    mask: (x, z, y) => (x === TOWER[0] || z === TOWER[1] || x === TOWER[2] - 1 || z === TOWER[3] - 1) && !(x === TOWER[0] && z >= 13 && z < 16 && y < Y.ROOF + 18),
  });
  b.box(TOWER[0], TOWER[1], TOWER[2], TOWER[3], Y.TOWER - 2, Y.TOWER, { kind: 'plate', color: SLAB });
  // the canopy reaching south from it, on two steel posts [scaled]
  b.newGroup();
  for (const z of [CANOPY[1], CANOPY[3] - 1]) b.box(CANOPY[0], z, CANOPY[0] + 1, z + 1, Y.ROOF, Y.TOWER - 2, { kind: 'bar', color: STEEL });
  b.box(CANOPY[0], CANOPY[1], CANOPY[2], CANOPY[3], Y.TOWER - 2, Y.TOWER - 1, { kind: 'plate', color: SLAB });
  // the chimney [scaled]
  b.newGroup();
  b.box(CHIMNEY[0], CHIMNEY[1], CHIMNEY[2], CHIMNEY[3], Y.ROOF, Y.CHIMNEY, { kind: 'brick', color: white });
  // the balustrade: steel posts every 4 ft, a top rail, mesh between [documented: tubular steel and mesh]
  b.newGroup();
  const edge = (x: number, z: number) => x === BLOCK[0] || z === BLOCK[1] || x === BLOCK[2] - 1 || z === BLOCK[3] - 1;
  for (let z = BLOCK[1]; z < BLOCK[3]; z++)
    for (let x = BLOCK[0]; x < BLOCK[2]; x++) {
      if (!edge(x, z) || inRect(x, z, TOWER)) continue;
      const post = (x + z) % 4 === 0;
      if (post) b.box(x, z, x + 1, z + 1, Y.ROOF, Y.RAIL - 1, { kind: 'bar', color: STEEL });
      else b.box(x, z, x + 1, z + 1, Y.ROOF + 4, Y.ROOF + 5, { kind: 'tile', color: 0xb9bdc0 });
      b.box(x, z, x + 1, z + 1, Y.RAIL - 1, Y.RAIL, { kind: 'tile', color: STEEL });
    }
}

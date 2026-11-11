/**
 * Unity Temple itself (spec 062): the footings and plinth; the floors; the poured concrete walls of the temple with its four
 * stair towers, piers and galleries, the foyer and its terraces' bulkheads, Unity House; the clerestories' ornamented columns
 * and glass, the doors and the inscription; the cross of roof slabs, the coffered amber skylights and the attic over them.
 * Layout and sourcing: layout.ts.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  ALCOVE_E, ALCOVE_N, ALCOVE_W, ATTIC, AXIS, CHIMNEY, CORNERS, DOORS, FOYER, HALL, HALL_ROOF, inRect, inRoof, inUnityHouse, mirror,
  onRing, PIERS, Rect, SQUARE, TEMPLE, TERRACE_E, TERRACE_W, TOWERS, WING_E, WING_W, Y,
} from './layout';

/** poured concrete with a washed pebble aggregate, warm grey to buff [documented: the finish; the colour scaled from
 * photographs]; the columns' cast ornament, in shadow; clear clerestory glass; amber art glass; oak */
export const CONCRETE = [0xa99d87, 0xa1957f, 0xb1a58f];
export const ORNAMENT = [0x7a715e, 0x938a75];
export const GLASS = 0xdfe6dc;
export const AMBER = 0xf2bd5c;
export const OAK = 0x6b4a2e;
export const PLASTER = 0xe6dcbf; // the restored interior's cream and yellow plaster [documented]
export const BRONZE = 0x7a6436;

const concrete = (x: number, y: number, z: number) => CONCRETE[Math.floor(hash2(Math.floor((x + z) / 6), Math.floor(y / 9)) * CONCRETE.length)];
const band = (v: number, a: number, b: number) => v >= a && v < b;
/** the clerestory's columns along a 38 ft alcove wall: six, two studs square, at about 7 ft centres [scaled] */
export const COLUMN_AT = [0, 1, 7, 8, 14, 15, 22, 23, 29, 30, 36, 37];
/** a column's cells: plain below, the cast ornament on its upper 5 ft [documented] */
const columnColor = (u: number, y: number, top: number) => (y >= top - 15 ? ORNAMENT[(u + Math.floor(y / 3)) & 1] : CONCRETE[0]);

/** the temple's solid wall cells in plan (towers' shells, the three proud alcove walls, the wall to the foyer) */
function templeWall(x: number, z: number): 'tower' | 'alcove' | 'south' | null {
  if (TOWERS.some((t) => onRing(x, z, t))) return 'tower';
  if (x === ALCOVE_N.x && band(z, ALCOVE_N.z0, ALCOVE_N.z1)) return 'alcove';
  if ((z === ALCOVE_E.z || z === ALCOVE_W.z) && band(x, ALCOVE_E.x0, ALCOVE_E.x1)) return 'alcove';
  if (x === TEMPLE[2] - 1 && band(z, 26, 66)) return 'south';
  return null;
}
/** the notches between the towers and the alcove walls, with their tall slit windows [documented: sheet 2] */
const notch = (x: number, z: number) =>
  (x === 1 && (z === 26 || z === 65)) || ((z === 14 || z === 77) && (x === 13 || x === 52));
/** where the foyer opens into the temple, either side of the pulpit [documented: sheet 4] */
const templeDoor = (y: number, z: number) => (band(z, 27, 30) || band(z, 62, 65)) && band(y, Y.FOYER, Y.FOYER + 21);

/** Unity House's wall cells in plan, and each one's top */
function houseWall(x: number, z: number): number | null {
  for (const c of CORNERS) if (onRing(x, z, c)) return Y.LINK;
  for (const w of [WING_E, WING_W]) if (inRect(x, z, w) && (x === w[0] || x === w[2] - 1) && !inRect(x, z, HALL)) return Y.WING_SLAB;
  if (onRing(x, z, HALL)) {
    if ((z === HALL[1] || z === HALL[3] - 1) && x > WING_E[0] && x < WING_E[2] - 1) return null; // open to the wings
    return Y.LINK;
  }
  return null;
}

/** the footings and the plinth: the walls' foot up to the floors (foundation) [scaled: the two-step water table] */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  b.box(TEMPLE[0] - 1, TEMPLE[1] - 1, TEMPLE[2], TEMPLE[3] + 1, 0, Y.AUDITORIUM, { kind: 'brick', color: concrete, mask: (x, z) => templeWall(x, z) !== null || notch(x, z) });
  b.newGroup();
  b.box(FOYER[0], FOYER[1], FOYER[2], FOYER[3], 0, Y.FOYER, { kind: 'brick', color: concrete, mask: (x, z) => z === FOYER[1] || z === FOYER[3] - 1 });
  b.box(HALL[0], 0, HALL[2], 92, 0, Y.FOYER, { kind: 'brick', color: concrete, mask: (x, z) => houseWall(x, z) !== null || ((z === 0 || z === 91) && band(x, WING_E[0], WING_E[2])) });
}

/** the floors (floor): the auditorium's at +7 ft, the foyer's and Unity House's at +3.3 ft [scaled] */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  b.box(TEMPLE[0], TEMPLE[1], TEMPLE[2], TEMPLE[3], Y.AUDITORIUM - 2, Y.AUDITORIUM, { kind: 'plate', color: 0x9a8f7c, mask: (x, z) => !TOWERS.some((t) => inRect(x, z, t)) });
  b.newGroup();
  b.box(FOYER[0], 0, HALL[2], 92, Y.FOYER - 2, Y.FOYER, { kind: 'plate', color: 0x9a8f7c, mask: (x, z) => inRect(x, z, FOYER) || inUnityHouse(x, z) });
}

/** the concrete (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the temple's walls: the stair towers to +29 ft, the alcove walls solid to the clerestory's sill [scaled]
  b.newGroup();
  b.box(TEMPLE[0] - 1, TEMPLE[1] - 1, TEMPLE[2], TEMPLE[3] + 1, Y.AUDITORIUM, Y.TOWER, {
    kind: 'brick', color: concrete,
    mask: (x, z, y) => {
      const w = templeWall(x, z);
      if (w === 'tower') return true;
      if (w === 'alcove') return y < Y.SILL;
      return w === 'south' && y < Y.SILL && !templeDoor(y, z);
    },
  });
  // the four hollow piers at the corners of the central square, from the floor to the roof [documented]
  b.newGroup();
  for (const p of PIERS) b.box(p[0], p[1], p[2], p[3], Y.AUDITORIUM, Y.CEILING, { kind: 'brick', color: PLASTER, mask: (x, z) => onRing(x, z, p) });
  // the galleries: two tiers in the north, east and west alcoves [documented], each with a plastered front trimmed in oak
  const alcoves: Rect[] = [[1, 30, 17, 62], [17, 14, 49, 30], [17, 62, 49, 78]];
  for (const g of [Y.GALLERY1, Y.GALLERY2]) {
    b.newGroup();
    for (const a of alcoves) b.box(a[0], a[1], a[2], a[3], g - 2, g, { kind: 'plate', color: 0x9a8f7c });
    const front = (x: number, z: number) => (x === 16 && band(z, 30, 62)) || ((z === 29 || z === 62) && band(x, 17, 49));
    b.box(1, 14, 49, 78, g, g + 9, { kind: 'brick', color: (_x, y) => (y >= g + 6 ? OAK : PLASTER), mask: front });
  }
  // the steps up from the foyer to the auditorium, either side of the pulpit [documented: sheet 4; their run scaled]
  b.newGroup();
  for (const z0 of [27, 62]) for (let i = 0; i < 3; i++) b.box(64 - i, z0, 65 - i, z0 + 3, Y.FOYER - 2, Y.FOYER + 3 * (i + 1), { kind: 'brick', color: concrete });
  // the pulpit's platform and the organ's screen behind it, on the south side [documented]
  b.newGroup();
  b.box(49, 38, 56, 54, Y.AUDITORIUM, Y.AUDITORIUM + 6, { kind: 'brick', color: PLASTER });
  b.box(56, 31, 57, 61, Y.AUDITORIUM, Y.SILL, { kind: 'brick', color: (x, y, z) => (z % 2 ? OAK : PLASTER) });
  // the foyer's walls over the doors, up to its roof [scaled]
  b.newGroup();
  b.box(FOYER[0], FOYER[1], FOYER[2], FOYER[3], Y.FOYER, Y.LINK - 2, {
    kind: 'brick', color: concrete,
    mask: (x, z, y) => (z === FOYER[1] || z === FOYER[3] - 1) && !(band(x, DOORS.x0, DOORS.x1) && y < Y.FOYER + 21),
  });
  // the terraces' bulkhead walls, hiding the doors from the street [documented: sheet 3], and the steps up at their north ends
  for (const [t, sgn] of [[TERRACE_W, 1], [TERRACE_E, -1]] as const) {
    b.newGroup();
    const zo = sgn > 0 ? t[3] - 1 : t[1];
    b.box(t[0], t[1], t[2], t[3], Y.FOYER, Y.BULKHEAD, { kind: 'brick', color: concrete, mask: (x, z) => z === zo || (x === t[0] && (sgn > 0 ? z >= 92 : z < 0)) });
    const [za, zb] = sgn > 0 ? [80, 92] : [0, 12];
    for (let i = 0; i < 3; i++) b.box(62 + i, za, 63 + i, zb, 0, 3 * (i + 1), { kind: 'brick', color: concrete });
    // the piers by the steps, cast with the building's name [documented: sheet 2]
    b.box(60, sgn > 0 ? 92 : -3, 66, sgn > 0 ? 95 : 0, 0, 21, { kind: 'brick', color: concrete });
  }
  // Unity House's walls [documented: sheet 4], the foyer's opening and the kitchen bay's windows left out
  b.newGroup();
  b.box(HALL[0], 0, HALL[2], 92, Y.FOYER, Y.LINK, {
    kind: 'brick', color: concrete,
    mask: (x, z, y) => {
      const top = houseWall(x, z);
      if (top === null || y >= top) return false;
      if (x === HALL[0] && band(z, FOYER[1] + 1, FOYER[3] - 1) && y < Y.FOYER + 21) return false;
      return !houseWindow(x, y, z);
    },
  });
  // its balconies in the wings [documented], their fronts trimmed in oak, and the chimney on the south wall [scaled]
  b.newGroup();
  for (const w of [WING_E, WING_W]) {
    b.box(w[0] + 1, w[1] + 1, w[2] - 1, w[3] - 1, Y.HALL_BALCONY - 2, Y.HALL_BALCONY, { kind: 'plate', color: 0x9a8f7c });
    const zf = w === WING_E ? w[3] - 1 : w[1];
    b.box(w[0] + 1, zf, w[2] - 1, zf + 1, Y.HALL_BALCONY, Y.HALL_BALCONY + 9, { kind: 'brick', color: (_x, y) => (y >= Y.HALL_BALCONY + 6 ? OAK : PLASTER) });
  }
  b.newGroup();
  b.box(CHIMNEY[0], CHIMNEY[1], CHIMNEY[2], CHIMNEY[3], Y.FOYER, Y.CHIMNEY, { kind: 'brick', color: concrete, mask: (x, z, y) => !(x === CHIMNEY[0] && y < Y.FOYER + 9 && z > CHIMNEY[1] && z < CHIMNEY[3] - 1) });
}

/** the kitchen bay's windows on Unity House's south wall, two storeys [scaled: sheet 3] */
function houseWindow(x: number, y: number, z: number): boolean {
  return x === HALL[2] - 1 && (band(z, 22, 30) || band(z, 62, 70)) && (band(y, 15, 27) || band(y, 36, 48));
}

/** the columns, the glass and the doors (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  // the temple's clerestories: six columns a side, the glass between them [documented], on the south side too [assumed]
  b.newGroup();
  const clerestory = (x: number, z: number): number | null => {
    if (x === ALCOVE_N.x && band(z, ALCOVE_N.z0, ALCOVE_N.z1)) return z - ALCOVE_N.z0;
    if (x === TEMPLE[2] - 1 && band(z, ALCOVE_N.z0, ALCOVE_N.z1)) return z - ALCOVE_N.z0;
    if ((z === ALCOVE_E.z || z === ALCOVE_W.z) && band(x, ALCOVE_E.x0, ALCOVE_E.x1)) return x - ALCOVE_E.x0;
    return null;
  };
  b.box(TEMPLE[0] - 1, TEMPLE[1] - 1, TEMPLE[2], TEMPLE[3] + 1, Y.SILL, Y.CEILING, {
    kind: 'brick', color: (x, y, z) => columnColor(clerestory(x, z)!, y, Y.CEILING),
    mask: (x, z) => { const u = clerestory(x, z); return u !== null && COLUMN_AT.includes(u); },
  });
  b.box(TEMPLE[0] - 1, TEMPLE[1] - 1, TEMPLE[2], TEMPLE[3] + 1, Y.SILL, Y.CEILING, {
    kind: 'glass', unit: 11, color: GLASS, mask: (x, z) => { const u = clerestory(x, z); return u !== null && !COLUMN_AT.includes(u); },
  });
  // the slit windows in the notches beside the towers [documented]
  b.newGroup();
  b.box(TEMPLE[0], TEMPLE[1], TEMPLE[2], TEMPLE[3], Y.AUDITORIUM, Y.TOWER, { kind: 'glass', unit: 6, color: AMBER, mask: (x, z) => notch(x, z) });
  // the foyer's doors: a bank of six on each side, oak and art glass [documented]; the inscription over them in bronze
  // letters, FOR THE WORSHIP OF GOD AND THE SERVICE OF MAN [documented], shown as a band of bronze
  for (const z of [FOYER[1], FOYER[3] - 1]) {
    b.newGroup();
    b.box(DOORS.x0, z, DOORS.x1, z + 1, Y.FOYER, Y.FOYER + 21, { kind: 'brick', color: OAK, mask: (x) => (x - DOORS.x0) % 10 === 0 || (x - DOORS.x0) % 10 === 9 });
    b.box(DOORS.x0, z, DOORS.x1, z + 1, Y.FOYER, Y.FOYER + 21, { kind: 'glass', unit: 7, color: AMBER, mask: (x) => (x - DOORS.x0) % 10 !== 0 && (x - DOORS.x0) % 10 !== 9 });
    const zo = z === FOYER[1] ? z - 1 : z + 1;
    b.box(DOORS.x0 + 1, zo, DOORS.x1 - 1, zo + 1, 36, 38, { kind: 'tile', color: BRONZE, mask: (x) => x % 5 !== 0 });
    b.box(DOORS.x0 + 2, zo, DOORS.x1 - 2, zo + 1, 39, 41, { kind: 'tile', color: BRONZE, mask: (x) => x % 4 !== 0 });
  }
  // Unity House's wing ends: solid to +9 ft, four ornamented columns, glass between [scaled], and the kitchen bay's windows
  for (const w of [WING_E, WING_W]) {
    const z = w === WING_E ? w[1] : w[3] - 1, col = (x: number) => [1, 2, 7, 8, 14, 15, 20, 21].includes(x - w[0]);
    b.newGroup();
    b.box(w[0], z, w[2], z + 1, Y.FOYER, Y.WING_SILL, { kind: 'brick', color: concrete });
    b.box(w[0], z, w[2], z + 1, Y.WING_SILL, Y.WING_SLAB, { kind: 'brick', color: (x, y) => columnColor(x, y, Y.WING_SLAB), mask: (x) => col(x) || x === w[0] || x === w[2] - 1 });
    b.box(w[0], z, w[2], z + 1, Y.WING_SILL, Y.WING_SLAB, { kind: 'glass', unit: 10, color: GLASS, mask: (x) => !col(x) && x !== w[0] && x !== w[2] - 1 });
  }
  b.newGroup();
  b.box(HALL[2] - 1, HALL[1], HALL[2], HALL[3], Y.FOYER, Y.LINK, { kind: 'glass', unit: 6, color: GLASS, mask: (x, z, y) => houseWindow(x, y, z) });
}

/** the roofs (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  const inSquare = (x: number, z: number) => inRect(x, z, SQUARE);
  // the cross of slabs over the temple [scaled], open over the central square for the skylights
  b.newGroup();
  b.box(-5, 8, 71, 84, Y.CEILING, Y.ROOF, { kind: 'brick', color: concrete, mask: (x, z) => inRoof(x, z) && !inSquare(x, z) });
  // the coffered ceiling: 25 skylights of amber glass, five by five [documented], between concrete beams
  const beam = (v: number) => v % 6 === 0 || v === 31;
  b.newGroup();
  b.box(SQUARE[0], SQUARE[1], SQUARE[2], SQUARE[3], Y.CEILING, Y.ROOF, { kind: 'brick', color: PLASTER, mask: (x, z) => beam(x - SQUARE[0]) || beam(z - SQUARE[1]) });
  b.box(SQUARE[0], SQUARE[1], SQUARE[2], SQUARE[3], Y.CEILING + 3, Y.CEILING + 4, { kind: 'light', color: AMBER, mask: (x, z) => !beam(x - SQUARE[0]) && !beam(z - SQUARE[1]) });
  // the attic block round the skylights, four small square openings a face [scaled], its cap, and the glass roof inside
  b.newGroup();
  b.box(ATTIC[0], ATTIC[1], ATTIC[2], ATTIC[3], Y.ROOF, Y.ATTIC, {
    kind: 'brick', color: (x, y, z) => (band(y, Y.ROOF + 6, Y.ROOF + 9) && ((x + z) % 9 === 4) ? 0x3a3630 : concrete(x, y, z)), mask: (x, z) => onRing(x, z, ATTIC),
  });
  b.box(ATTIC[0] - 1, ATTIC[1] - 1, ATTIC[2] + 1, ATTIC[3] + 1, Y.ATTIC, Y.ATTIC + 2, { kind: 'plate', color: CONCRETE[2], mask: (x, z) => !inRect(x, z, [ATTIC[0] + 2, ATTIC[1] + 2, ATTIC[2] - 2, ATTIC[3] - 2]) });
  b.box(ATTIC[0] + 2, ATTIC[1] + 2, ATTIC[2] - 2, ATTIC[3] - 2, Y.ATTIC, Y.ATTIC + 1, { kind: 'glass', unit: 1, sizes: [[8, 8], [4, 4], [2, 2], [1, 1]], color: 0xe9e2c4 });
  // the towers' roofs
  b.newGroup();
  for (const t of TOWERS) b.box(t[0], t[1], t[2], t[3], Y.TOWER, Y.TOWER + 2, { kind: 'plate', color: CONCRETE[2] });
  // the foyer's roof, with planter boxes on it [scaled]
  b.newGroup();
  b.box(FOYER[0], FOYER[1], FOYER[2], FOYER[3], Y.LINK - 2, Y.LINK, { kind: 'plate', color: CONCRETE[2] });
  for (const z of [FOYER[1], FOYER[3] - 2]) b.box(70, z, 86, z + 2, Y.LINK, Y.LINK + 3, { kind: 'brick', color: 0x4f7a3a });
  // Unity House: the wings' slabs, overhanging [scaled]; the corner blocks' and the hall's roofs; the parapet round the hall's
  // skylight and its glass [scaled; documented: seven coffers of yellow, green and brown glass]
  b.newGroup();
  for (const w of [WING_E, WING_W]) b.box(w[0] - 2, w === WING_E ? w[1] - 2 : w[1], w[2] + 2, w === WING_E ? w[3] : w[3] + 2, Y.WING_SLAB, Y.WING_SLAB + 6, { kind: 'brick', color: concrete, mask: (x, z) => !inRect(x, z, HALL) });
  for (const c of CORNERS) b.box(c[0], c[1], c[2], c[3], Y.LINK, Y.LINK + 2, { kind: 'plate', color: CONCRETE[2] });
  b.newGroup();
  b.box(HALL[0], HALL[1], HALL[2], HALL[3], Y.LINK, Y.LINK + 2, { kind: 'plate', color: CONCRETE[2], mask: (x, z) => !inRect(x, z, [HALL_ROOF[0] + 1, HALL_ROOF[1] + 1, HALL_ROOF[2] - 1, HALL_ROOF[3] - 1]) });
  b.box(HALL_ROOF[0], HALL_ROOF[1], HALL_ROOF[2], HALL_ROOF[3], Y.LINK + 2, Y.HALL, { kind: 'brick', color: concrete, mask: (x, z) => onRing(x, z, HALL_ROOF) });
  b.box(HALL_ROOF[0] + 1, HALL_ROOF[1] + 1, HALL_ROOF[2] - 1, HALL_ROOF[3] - 1, Y.HALL - 1, Y.HALL, {
    kind: 'light', color: (x, _y, z) => [AMBER, 0xa7b86a, 0xb98a4a][Math.floor((z - HALL_ROOF[1]) / 6) % 3],
  });
}

export { AXIS, mirror };

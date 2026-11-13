/**
 * The Villa Savoye itself (spec 074): the footings; the ground floor's slab and the drive's gravel bed under the box; the 25
 * pilotis, the first floor's slab, the ramp's two inner flights and the helical stair; the dark green ground floor with its curve
 * of glass, the white box with its ribbon window on all four sides, the sliding glass onto the terrace; the roof garden, the
 * ramp's two outer flights and the solarium's curved screens. The gardener's lodge by the gate. Layout and sourcing: layout.ts.
 */
import { BoxOpts, Builder } from '@/engine/voxel';
import { P } from '../phases';
import {
  CURVE, ENTRANCE, FLIGHTS, flightTop, GARAGE, GARAGE_DOORS, GARDEN, HOUSE, inGround, inRect, inSolarium, LANDINGS, LODGE, LODGE_Y,
  onCurve, onGroundEdge, onRing, onScreen, PILOTIS, PLANTERS, RAMP, Rect, SLIDING, SOL_OPENING, SOL_X1, STAIR, TABLE, TERRACE, WELL, Y,
} from './layout';
import { GRAVEL } from './site';

/** white render above [documented: white is the villa's dominant colour]; the ground floor dark green, "vert anglais"
 * [documented]; the steel frames of the windows dark grey [assumed: photographs] */
export const WHITE = 0xf2f0e9;
export const GREEN = 0x2e4a37;
export const STEEL = 0x3b3f42;
export const GLASS = 0xbcd2d8;
export const CONCRETE = 0xa39f95;
export const WHITES = new Set([WHITE]);
export const GREENS = new Set([GREEN]);

const band = (v: number, a: number, b: number) => v >= a && v < b;
/** box() tests a mask at each course's bottom only, so a wall with openings is laid in runs that break at the openings' edges */
function layered(b: Builder, r: [number, number, number, number], y0: number, y1: number, cuts: number[], o: BoxOpts) {
  const ys = [y0, ...cuts.filter((c) => c > y0 && c < y1).sort((a, c) => a - c), y1];
  for (let i = 1; i < ys.length; i++) b.box(r[0], r[1], r[2], r[3], ys[i - 1], ys[i], o);
}
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** is a façade cell of the box in front of the terrace (the ribbon window open there) [documented] */
export const facingTerrace = (x: number, z: number) =>
  (z === HOUSE[3] - 1 && x >= TERRACE[0]) || (x === HOUSE[2] - 1 && z >= TERRACE[1]);
/** the two "baby piloti" in the terrace's open slot [documented], on the south-west front [assumed: their places] */
export const BABY_PILOTI: [number, number][] = [[49, 64], [61, 64]];

/** the footings (foundation) [assumed]: a pad under each piloti, the lodge's strip footing */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  for (const [px, pz] of PILOTIS) b.box(px - 1, pz - 1, px + 2, pz + 2, -3, -1, { kind: 'brick', color: CONCRETE });
  b.newGroup();
  b.box(LODGE[0], LODGE[1], LODGE[2], LODGE[3], -3, -1, { kind: 'brick', color: CONCRETE, mask: (x, z) => onRing(x, z, LODGE) });
}

/** the ground floor's slab, the drive's gravel bed under the box (floor) [documented: the drive passed under the house] */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  const [x0, z0, x1, z1] = HOUSE;
  b.box(x0, z0, x1, z1, -3, -1, { kind: 'brick', color: (x, _y, z) => (inGround(x, z) ? CONCRETE : GRAVEL[1]) });
  // the hall's pale tiled floor, the garage's concrete [assumed]; fine gravel round them
  b.box(x0, z0, x1, z1, -1, 0, {
    kind: 'plate', color: (x, _y, z) => (!inGround(x, z) ? GRAVEL[((x >> 2) + (z >> 2)) & 1] : inRect(x, z, GARAGE) ? 0x9c9a93 : 0xd8d5cc),
  });
  b.newGroup();
  b.box(LODGE[0], LODGE[1], LODGE[2], LODGE[3], -3, 0, { kind: 'brick', color: 0xcfcbc0 });
}

/** the stair's steps: 13 steps of 2 plates round a pole [assumed] */
export function stairSteps(): { x: number; z: number; top: number }[] {
  const out: { x: number; z: number; top: number }[] = [];
  for (let k = 1; k <= 13; k++) {
    const t = (k * Math.PI) / 6;
    for (const r of [1, 2]) out.push({ x: STAIR.cx + Math.round(r * Math.cos(t)), z: STAIR.cz + Math.round(r * Math.sin(t)), top: 2 * k });
  }
  return out;
}

/** a flight of the ramp: plates stepping one plate per 2 studs [assumed], 2 plates thick */
function flight(b: Builder, i: number) {
  const f = FLIGHTS[i];
  for (let x = f.x0; x < f.x1; x++) {
    const t = flightTop(f, x);
    b.box(x, f.z[0], x + 1, f.z[1], Math.max(t - 2, 0), t, { kind: 'plate', color: WHITE });
  }
}
/** the ramp's low wall between its two flights [assumed: photographs], on the middle row of pilotis */
function divider(b: Builder, lo: number, hi: number, yMin: number) {
  for (let x = RAMP.x0 + 2; x < RAMP.x1; x++) {
    const a = flightTop(FLIGHTS[lo], x), c = flightTop(FLIGHTS[hi], x);
    b.box(x, 32, x + 1, 33, Math.max(Math.min(a, c) - 2, yMin), Math.max(a, c) + 6, { kind: 'brick', color: WHITE });
  }
}

/** the pilotis, the first floor, the ramp's inner flights, the stair (structure); the lodge's walls */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the 25 pilotis, round and white [documented], from the ground to the first floor's slab; the two in the ramp's well on up
  // to the roof [assumed]
  b.newGroup();
  for (const [x, z] of PILOTIS) b.column(x, z, 0, inRect(x, z, WELL) ? Y.CEILING : Y.SLAB, WHITE, 'round');
  // the inner ramp: from the hall to the landing, and back up to the first floor [documented: two parallel flights]
  b.newGroup();
  flight(b, 0);
  b.box(RAMP.landing[0], WELL[1], RAMP.landing[1], WELL[3], LANDINGS[0] - 2, LANDINGS[0], { kind: 'plate', color: WHITE });
  flight(b, 1);
  divider(b, 0, 1, 0);
  // the low walls on the flights' open sides, up to the first floor
  for (let x = RAMP.x0; x < RAMP.x1; x++) {
    const a = flightTop(FLIGHTS[0], x);
    b.box(x, 37, x + 1, 38, Math.max(a - 2, 0), Math.min(a + 6, Y.SLAB), { kind: 'brick', color: WHITE });
    if (x >= FLIGHTS[1].x0) {
      const c = flightTop(FLIGHTS[1], x);
      b.box(x, 27, x + 1, 28, c - 2, Math.min(c + 6, Y.SLAB), { kind: 'brick', color: WHITE });
    }
  }
  // the helical stair beside the ramp [documented]: a pole and its steps
  b.newGroup();
  b.column(STAIR.cx, STAIR.cz, 0, Y.FIRST + 6, STEEL_POLE, 'bar');
  for (const s of stairSteps()) b.add(s.x, s.z, s.top - 1, 1, 1, 1, WHITE, 'tile');
  // the first floor's slab on the pilotis, open over the ramp and the stair; the rooms' floors [assumed colours]
  b.newGroup();
  const open = (x: number, z: number) => inRect(x, z, WELL) || inRect(x, z, STAIR.hole);
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.SLAB, Y.FIRST - 1, { kind: 'brick', color: WHITE, mask: (x, z) => !open(x, z) });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.FIRST - 1, Y.FIRST, {
    kind: 'plate', mask: (x, z) => !open(x, z),
    color: (x, _y, z) => (onRing(x, z, HOUSE) ? WHITE : inRect(x, z, TERRACE) ? 0xc9c4b7 : 0xd6d2c8),
  });
  // the lodge's walls [documented: three blind, one long window on the south front; its height assumed]
  b.newGroup();
  layered(b, LODGE, 0, LODGE_Y.WALL, [LODGE_Y.SILL, LODGE_Y.HEAD, LODGE_Y.HEAD + 2], { kind: 'brick', color: WHITE, mask: (x, z, y) => onRing(x, z, LODGE) && lodgeOpening(x, y, z) === null });
}
const STEEL_POLE = 0x6a6e70;

/** the lodge's long window and its door, both on its south front (z = LODGE[3] − 1) [documented: the window; door assumed] */
export function lodgeOpening(x: number, y: number, z: number): 'window' | 'door' | null {
  if (z !== LODGE[3] - 1) return null;
  if (band(x, LODGE[0] + 2, LODGE[2] - 6) && band(y, LODGE_Y.SILL, LODGE_Y.HEAD)) return 'window';
  if (band(x, LODGE[2] - 5, LODGE[2] - 2) && band(y, 0, LODGE_Y.HEAD + 2)) return 'door';
  return null;
}

/** the ground floor's windows in its green walls [assumed: photographs] */
const groundWindow = (x: number, y: number, z: number) =>
  band(y, 8, Y.GF_HEAD) && ((z === 16 && (band(x, 35, 42) || band(x, 45, 52) || band(x, 55, 61))) || (z === 48 && band(x, 35, 53)));
const garageDoor = (x: number, y: number, z: number) => z === 48 && band(x, GARAGE_DOORS[0], GARAGE_DOORS[1]) && y < Y.GF_HEAD;
/** a mullion of the curve: every 3 studs round the arc [assumed] */
const curveMullion = (x: number, z: number) => {
  const a = Math.atan2(z + 0.5 - CURVE.cz, CURVE.cx - x - 0.5); // −90°…90° round the hall
  return Math.round(a * CURVE.r) % 4 === 0;
};

/** the ribbon window: sill and head plates, a steel mullion every 4 studs, glass between [documented: sliding steel windows] */
export function ribbon(x: number, y: number, z: number): 'frame' | 'glass' | 'open' | 'pilotino' | null {
  if (!onRing(x, z, HOUSE) || !band(y, Y.SILL, Y.HEAD)) return null;
  if (facingTerrace(x, z)) return BABY_PILOTI.some(([bx, bz]) => bx === x && bz === z) ? 'pilotino' : 'open';
  const along = z === 0 || z === HOUSE[3] - 1 ? x : z;
  if (y === Y.SILL || y === Y.HEAD - 1 || along % 4 === 0) return 'frame';
  return 'glass';
}

/** the green ground floor and its curve of glass, the white box and its ribbon window, the sliding glass (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const [x0, z0, x1, z1] = HOUSE;
  // the ground floor's walls, dark green [documented], with their windows and the garage doors [assumed]
  b.newGroup();
  const edge = (x: number, z: number) => onGroundEdge(x, z);
  layered(b, [x0, 16, x1, 49], 0, Y.SLAB, [8, Y.GF_HEAD], {
    kind: 'brick', color: GREEN,
    mask: (x, z, y) => edge(x, z) && !onCurve(x, z) && !groundWindow(x, y, z) && !garageDoor(x, y, z),
  });
  b.newGroup();
  b.box(x0, 16, x1, 49, 0, Y.GF_HEAD, { kind: 'tile', color: 0x26392c, mask: (x, z, y) => garageDoor(x, y, z) });
  b.box(x0, 16, x1, 49, 8, Y.GF_HEAD, { kind: 'plate', unit: 1, color: GREEN, mask: (x, z, y) => groundWindow(x, y, z) && (y === 8 || y === Y.GF_HEAD - 1) });
  b.box(x0, 16, x1, 49, 8, Y.GF_HEAD, { kind: 'glass', unit: 1, color: GLASS, mask: (x, z, y) => groundWindow(x, y, z) && y > 8 && y < Y.GF_HEAD - 1 });
  // the curve of glass round the hall [documented], in dark green steel frames [assumed], the glass doors at its middle
  b.newGroup();
  const curveFrame = (x: number, y: number, z: number) => y < 1 || y === Y.GF_HEAD || y >= Y.SLAB - 1 || curveMullion(x, z) || (band(z, ENTRANCE[0], ENTRANCE[1]) && (z === ENTRANCE[0] || z === ENTRANCE[1] - 1) && y < Y.GF_HEAD);
  b.box(x0, 16, 33, 49, 0, Y.SLAB, { kind: 'plate', unit: 1, color: GREEN, mask: (x, z, y) => onCurve(x, z) && curveFrame(x, y, z) });
  b.box(x0, 16, 33, 49, 0, Y.SLAB, { kind: 'glass', unit: 1, color: GLASS, mask: (x, z, y) => onCurve(x, z) && !curveFrame(x, y, z) });
  // the white box: its walls round the first floor and up to the roof garden's parapet [documented: white; heights assumed]
  b.newGroup();
  layered(b, HOUSE, Y.FIRST, Y.PARAPET, [Y.SILL, Y.HEAD], { kind: 'brick', color: WHITE, mask: (x, z, y) => onRing(x, z, HOUSE) && ribbon(x, y, z) === null });
  // the ribbon window on all four sides [documented]: glazed in front of the rooms, open in front of the terrace
  b.newGroup();
  b.box(x0, z0, x1, z1, Y.SILL, Y.HEAD, { kind: 'plate', unit: 1, color: STEEL, mask: (x, z, y) => ribbon(x, y, z) === 'frame' });
  b.box(x0, z0, x1, z1, Y.SILL, Y.HEAD, { kind: 'glass', unit: 1, color: GLASS, mask: (x, z, y) => ribbon(x, y, z) === 'glass' });
  b.newGroup();
  for (const [x, z] of BABY_PILOTI) b.column(x, z, Y.SILL, Y.HEAD, WHITE, 'round');
  // the sliding glass walls onto the terrace [documented: the living room's], steel mullions every 4 studs
  b.newGroup();
  const slide = (x: number, z: number) => SLIDING.some((r) => inRect(x, z, r));
  const slideFrame = (x: number, y: number, z: number) => y === Y.FIRST || y >= Y.CEILING - 1 || (x === 37 ? z : x) % 4 === 0;
  b.box(37, 37, 72, 64, Y.FIRST, Y.CEILING, { kind: 'plate', unit: 1, color: STEEL, mask: (x, z, y) => slide(x, z) && slideFrame(x, y, z) });
  b.box(37, 37, 72, 64, Y.FIRST, Y.CEILING, { kind: 'glass', unit: 1, color: GLASS, mask: (x, z, y) => slide(x, z) && !slideFrame(x, y, z) });
  // the lodge's long window in steel, and its door
  b.newGroup();
  b.box(LODGE[0], LODGE[3] - 1, LODGE[2], LODGE[3], 0, LODGE_Y.WALL, {
    kind: 'plate', unit: 1, color: STEEL,
    mask: (x, z, y) => (lodgeOpening(x, y, z) === 'window' && (y === LODGE_Y.SILL || y === LODGE_Y.HEAD - 1 || x % 4 === 0)) || lodgeOpening(x, y, z) === 'door',
  });
  b.box(LODGE[0], LODGE[3] - 1, LODGE[2], LODGE[3], LODGE_Y.SILL, LODGE_Y.HEAD, {
    kind: 'glass', unit: 1, color: GLASS, mask: (x, z, y) => lodgeOpening(x, y, z) === 'window',
  });
}

/** the roof garden's floor: concrete slabs with lines of grass in their joints [documented]; plain roof elsewhere [assumed] */
export function roofColor(x: number, z: number): number {
  if (inSolarium(x, z) || inRect(x, z, GARDEN)) return x % 5 === 0 || z % 5 === 0 ? 0x6f9a4c : 0xcdc8bb;
  return 0x9a968c;
}

/** the roof slab, the ramp's outer flights, the roof garden and the solarium (roof); the lodge's roof */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  const [x0, z0, x1, z1] = HOUSE;
  const open = (x: number, z: number) => inRect(x, z, WELL) || inRect(x, z, TERRACE);
  b.newGroup();
  b.box(x0, z0, x1, z1, Y.CEILING, Y.ROOF - 1, { kind: 'brick', color: WHITE, mask: (x, z) => !onRing(x, z, HOUSE) && !open(x, z) });
  b.box(x0, z0, x1, z1, Y.ROOF - 1, Y.ROOF, { kind: 'plate', color: (x, _y, z) => roofColor(x, z), mask: (x, z) => !onRing(x, z, HOUSE) && !open(x, z) });
  // the ramp's outer flights, from the first floor to the roof garden [documented: finishing outside]
  b.newGroup();
  flight(b, 2);
  b.box(RAMP.landing[0], WELL[1], RAMP.landing[1], WELL[3], LANDINGS[1] - 2, LANDINGS[1], { kind: 'plate', color: WHITE });
  flight(b, 3);
  divider(b, 2, 3, Y.FIRST);
  // the low walls round the openings in the roof, leaving the ramp's arrival open [assumed]
  b.newGroup();
  const arrival: Rect = [22, 28, 24, 32];
  const parapet = (x: number, z: number) => !onRing(x, z, HOUSE) && !open(x, z) && !inRect(x, z, arrival) && N4.some(([dx, dz]) => open(x + dx, z + dz));
  b.box(x0, z0, x1, z1, Y.ROOF, Y.ROOF + 6, { kind: 'brick', color: WHITE, mask: (x, z) => parapet(x, z) });
  // the solarium's curved screens [documented], up to 9.40 m, with the opening toward the Seine [documented]
  b.newGroup();
  const hole = (x: number, y: number, z: number) => x === SOL_OPENING.x && band(z, SOL_OPENING.z[0], SOL_OPENING.z[1]) && band(y, SOL_OPENING.y[0], SOL_OPENING.y[1]);
  for (const part of ['A', 'straight', 'B'] as const) {
    b.newGroup();
    layered(b, [0, 0, SOL_X1, 40], Y.ROOF, Y.SOLARIUM, SOL_OPENING.y, { kind: 'brick', color: WHITE, mask: (x, z, y) => onScreen(x, z) === part && !hole(x, y, z) });
  }
  // the planters [documented] and the fixed concrete table [documented]
  b.newGroup();
  for (const r of PLANTERS) {
    b.box(r[0], r[1], r[2], r[3], Y.ROOF, Y.ROOF + 4, { kind: 'brick', color: WHITE, mask: (x, z) => !onRing(x, z, HOUSE) && onRing(x, z, r) });
    b.box(r[0], r[1], r[2], r[3], Y.ROOF, Y.ROOF + 4, { kind: 'brick', color: (x, y) => (y >= Y.ROOF + 3 ? 0x5d8a42 : 0x6b5744), mask: (x, z) => !onRing(x, z, HOUSE) });
  }
  b.newGroup();
  b.box(TABLE[0], TABLE[1], TABLE[2], TABLE[3], Y.ROOF, Y.ROOF + 5, { kind: 'brick', color: WHITE, mask: (x) => x === TABLE[0] + 1 || x === TABLE[2] - 2 });
  b.box(TABLE[0], TABLE[1], TABLE[2], TABLE[3], Y.ROOF + 5, Y.ROOF + 6, { kind: 'plate', color: WHITE });
  // the lodge's flat roof [assumed]
  b.newGroup();
  b.box(LODGE[0], LODGE[1], LODGE[2], LODGE[3], LODGE_Y.WALL, LODGE_Y.ROOF, { kind: 'brick', color: WHITE });
}

/**
 * The Haus am Horn itself (spec 063): the footings; the floors in each room's colour; the walls, with the living room's taller
 * block in the middle and the partitions of the ring round it; the windows, the doors and the clerestory; the two flat roofs
 * and the chimney. Layout and sourcing: layout.ts.
 */
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { CLERESTORY, CORE, CORE_DOORS, HOUSE, inRect, LIVING, NICHE_OPENING, onRing, OPENINGS, PARTITIONS, Y } from './layout';

/** light warm grey-white render down to the ground [scaled: photographs of the 2019 restoration; in 1923 silver-grey Terranova,
 * documented]; white window frames; the clerestory's dark iron frames and frosted glass [documented]; dark grey roofs */
export const RENDER = [0xeeebe2, 0xe8e5db];
export const FRAME = 0xfafaf6;
export const IRON = 0x33363a;
export const GLASS = 0xcfe0e4;
export const FROSTED = 0xeef1ec;
export const ROOFING = 0x55585b;
/** the living room's walls: olive green and light yellow [documented: Arndt and Maltan's scheme] */
export const OLIVE = 0x8c9160;
export const LIGHT_YELLOW = 0xf0e3a4;
export const OCHRE = 0xc99a45;

const render = (x: number, y: number, z: number) => RENDER[(Math.floor((x + z) / 5) + Math.floor(y / 6)) & 1];
const band = (v: number, a: number, b: number) => v >= a && v < b;
const inAny = (v: number, runs: [number, number][]) => runs.some(([a, b]) => v >= a && v < b);

/** which room a cell of the plan is in [scaled: the 1923 plan] */
export type Room = 'living' | 'kitchen' | 'pantry' | 'wc' | 'entrance' | 'stair' | 'guest' | 'niche' | 'man' | 'bath' | 'lady' | 'children' | 'dining';
export function roomAt(x: number, z: number): Room {
  if (inRect(x, z, CORE)) return 'living';
  if (z < 10 && x >= 10) return x < 12 ? 'kitchen' : x < 22 ? 'dining' : 'children';
  if (x >= 32) return z < 12 ? 'children' : z < 26 ? 'lady' : 'bath';
  if (z >= 32) return x >= 34 ? 'bath' : x >= 21 ? 'man' : x >= 12 ? 'niche' : 'guest';
  return z < 9 ? 'kitchen' : z < 12 ? 'pantry' : z < 18 ? 'wc' : z < 23 ? 'entrance' : z < 31 ? 'stair' : 'guest';
}
/** the floors: rubber and Triolin [documented]; the dining room's chequered in red, blue and white [documented]; the others'
 * colours [assumed] */
export function floorColor(x: number, z: number): number {
  switch (roomAt(x, z)) {
    case 'dining': return [0xc23b2e, 0xf1efe8, 0x3f66a8, 0xf1efe8][((x & 1) * 2 + (z & 1) + (x & 2)) % 4];
    case 'living': return 0x9a9484;
    case 'kitchen': case 'pantry': case 'bath': case 'wc': return 0xdedcd3;
    case 'children': return 0xb8b3a2;
    case 'lady': return 0xa7a59a;
    case 'man': case 'niche': return 0x7d7868;
    default: return 0x8f8a7c;
  }
}

/** an outer wall's opening at a cell: a window, a door, or none */
export function outerOpening(x: number, y: number, z: number): 'window' | 'door' | null {
  const w = band(y, Y.SILL, Y.HEAD), d = band(y, 0, Y.HEAD);
  if (x === HOUSE[0]) return w && inAny(z, OPENINGS.north.windows) ? 'window' : d && inAny(z, [OPENINGS.north.door]) ? 'door' : null;
  if (z === HOUSE[1]) return w && inAny(x, OPENINGS.east.windows) ? 'window' : d && inAny(x, [OPENINGS.east.door]) ? 'door' : null;
  if (x === HOUSE[2] - 1) return w && inAny(z, OPENINGS.south.windows) ? 'window' : null;
  if (z === HOUSE[3] - 1) return w && inAny(x, OPENINGS.west.windows) ? 'window' : null;
  return null;
}
/** the clerestory's cells: on the two fronts of the middle block that have it [documented] */
export const clerestory = (x: number, y: number, z: number) =>
  band(y, Y.RING_ROOF, Y.CEILING) && ((x === CORE[2] - 1 && band(z, CLERESTORY[0], CLERESTORY[1])) || (z === CORE[3] - 1 && band(x, CLERESTORY[0], CLERESTORY[1])));
const coreOpen = (x: number, y: number, z: number) =>
  (y < Y.HEAD && CORE_DOORS.some((d) => inRect(x, z, d))) || (y < Y.RING_CEILING && inRect(x, z, NICHE_OPENING)) || clerestory(x, y, z);

/** the footings and the plinth (foundation) [assumed: the partial cellar isn't modelled] */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.GROUND - 3, Y.GROUND, { kind: 'brick', color: 0x9d998f });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.GROUND, 0, { kind: 'brick', color: render, mask: (x, z) => onRing(x, z, HOUSE) });
}

/** the floors (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.GROUND, -1, { kind: 'plate', color: 0x9d998f });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], -1, 0, { kind: 'tile', color: (x, _y, z) => floorColor(x, z) });
}

/** the walls (structure) [documented: slag-concrete blocks, rendered] */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the outer walls up to the roof's edge, the windows and doors left open; the corners stand a little proud in the real house
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], 0, Y.RING_CEILING, { kind: 'brick', color: render, mask: (x, z, y) => onRing(x, z, HOUSE) && outerOpening(x, y, z) === null });
  // the living room's block, to its own ceiling: olive green and light yellow inside [documented], render above the ring's roof
  b.newGroup();
  const coreColor = (x: number, y: number, z: number) => (y >= Y.RING_CEILING ? render(x, y, z) : x === CORE[0] || z === CORE[1] ? OLIVE : LIGHT_YELLOW);
  for (const [y0, y1] of [[0, Y.RING_ROOF], [Y.RING_ROOF, Y.CEILING]])
    b.box(CORE[0], CORE[1], CORE[2], CORE[3], y0, y1, { kind: 'brick', color: coreColor, mask: (x, z, y) => onRing(x, z, CORE) && !coreOpen(x, y, z) });
  // the ring's partitions [scaled], the dining room's in ochre [documented], the others pale [assumed]
  b.newGroup();
  PARTITIONS.forEach((p, i) =>
    b.box(p.r[0], p.r[1], p.r[2], p.r[3], 0, Y.RING_CEILING, {
      kind: 'brick', color: i < 2 ? OCHRE : i < 4 ? LIGHT_YELLOW : 0xe9e6dc, mask: (x, z, y) => !(y < Y.HEAD && inRect(x, z, p.door)),
    }));
  // the entrance's landing and two steps [scaled], and the steps at the children's room's garden door [documented: its own door]
  b.newGroup();
  b.box(-3, OPENINGS.north.door[0] - 1, 0, OPENINGS.north.door[1] + 1, Y.GROUND, 0, { kind: 'brick', color: 0xcfcbc0 });
  b.box(-4, OPENINGS.north.door[0] - 1, -3, OPENINGS.north.door[1] + 1, Y.GROUND, -1, { kind: 'plate', color: 0xcfcbc0 });
  b.box(OPENINGS.east.door[0], -2, OPENINGS.east.door[1], 0, Y.GROUND, -1, { kind: 'plate', color: 0xcfcbc0 });
}

/** the windows, the doors and the clerestory (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  // the windows: white frames [scaled: photographs], the wider ones in two or three lights
  b.newGroup();
  const frame = (x: number, y: number, z: number) => {
    if (y === Y.SILL || y === Y.HEAD - 1) return true;
    const u = x === HOUSE[0] || x === HOUSE[2] - 1 ? z : x;
    const runs = x === HOUSE[0] ? OPENINGS.north.windows : x === HOUSE[2] - 1 ? OPENINGS.south.windows : z === HOUSE[1] ? OPENINGS.east.windows : OPENINGS.west.windows;
    const run = runs.find(([a, c]) => u >= a && u < c)!;
    return u === run[0] || u === run[1] - 1 || (run[1] - run[0] > 5 && (u - run[0]) % 3 === 0);
  };
  const isWin = (x: number, y: number, z: number) => onRing(x, z, HOUSE) && outerOpening(x, y, z) === 'window';
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.SILL, Y.HEAD, { kind: 'plate', unit: 1, color: FRAME, mask: (x, z, y) => isWin(x, y, z) && frame(x, y, z) });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.SILL, Y.HEAD, { kind: 'glass', unit: 1, color: GLASS, mask: (x, z, y) => isWin(x, y, z) && !frame(x, y, z) });
  // the doors: the front door and the children's room's garden door [scaled]
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], 0, Y.HEAD, { kind: 'brick', color: 0xd8d5cb, mask: (x, z, y) => onRing(x, z, HOUSE) && outerOpening(x, y, z) === 'door' });
  // the clerestory: frosted glass in dark iron frames, three panes a side [documented]
  b.newGroup();
  const pane = (u: number) => u === CLERESTORY[0] || u === CLERESTORY[1] - 1 || (u - CLERESTORY[0]) % 5 === 0;
  const cu = (x: number, z: number) => (x === CORE[2] - 1 ? z : x);
  b.box(CORE[0], CORE[1], CORE[2], CORE[3], Y.RING_ROOF, Y.CEILING, { kind: 'brick', unit: 8, color: IRON, mask: (x, z, y) => clerestory(x, y, z) && pane(cu(x, z)) });
  b.box(CORE[0], CORE[1], CORE[2], CORE[3], Y.RING_ROOF, Y.CEILING, { kind: 'glass', unit: 8, color: FROSTED, mask: (x, z, y) => clerestory(x, y, z) && !pane(cu(x, z)) });
}

/** the two flat roofs and the chimney (roof) [scaled: very shallow pyramids that read as flat, dark grey] */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.newGroup();
  const ring = (x: number, z: number) => !inRect(x, z, LIVING);
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.RING_CEILING, Y.RING_ROOF - 2, { kind: 'brick', color: (x, y, z) => (onRing(x, z, HOUSE) ? FRAME : 0xdedbd2), mask: (x, z, y) => ring(x, z) && !onRing(x, z, CORE) });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.RING_ROOF - 2, Y.RING_ROOF, { kind: 'plate', color: (x, _y, z) => (onRing(x, z, HOUSE) ? FRAME : ROOFING), mask: (x, z) => !inRect(x, z, CORE) });
  b.newGroup();
  b.box(CORE[0], CORE[1], CORE[2], CORE[3], Y.CEILING, Y.ROOF - 2, { kind: 'brick', color: (x, _y, z) => (onRing(x, z, CORE) ? FRAME : 0xdedbd2) });
  b.box(CORE[0], CORE[1], CORE[2], CORE[3], Y.ROOF - 2, Y.ROOF, { kind: 'plate', color: (x, _y, z) => (onRing(x, z, CORE) ? FRAME : ROOFING) });
  b.newGroup();
  b.box(CORE[0], CORE[1], CORE[0] + 3, CORE[1] + 3, Y.ROOF, Y.CHIMNEY, { kind: 'brick', color: render });
}

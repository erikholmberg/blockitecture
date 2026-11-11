/**
 * The Neue Nationalgalerie itself (spec 057): the granite podium with its terrace, the stair up from Potsdamer Straße and the
 * sunken sculpture garden's walls; the hall's floor; the eight cruciform columns; the glass walls; the roof, a square of black
 * steel girders on the 3.6 m grid. Layout and sourcing: layout.ts.
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { BAY, COLUMNS, DOORS, GARDEN, HALL, inColumn, inRect, PODIUM, ROOF, STREET_STAIR, Y } from './layout';
import { groundPlates } from './site';

/** black-painted steel [documented]; the terrace's light grey Striegau granite in 1.2 m squares [documented: the material;
 * the squares scaled]; the hall's grey Epprechtstein granite [documented]; the glass */
export const STEEL = 0x1e1f21;
export const GRANITE = [0xbab9b3, 0xb1b0aa];
export const HALL_GRANITE = [0x9f9e98, 0x98978f];
export const GLASS = 0xd2e2e6;

const squares = (pal: number[]) => (x: number, _y: number, z: number) => pal[(Math.floor(x / 4) + Math.floor(z / 4)) & 1];
const ring = (x: number, z: number, r: [number, number, number, number]) =>
  inRect(x, z, r) && (x === r[0] || z === r[1] || x === r[2] - 1 || z === r[3] - 1);

/** the podium (foundation): the terrace's granite over the lower floor, the stair from the street, the garden's walls */
export function buildPodium(b: Builder) {
  b.setPhase(P.FOUNDATION);
  // (its edge, from the ground up to the terrace, is the site's: granite-faced [documented: the plinth's cladding])
  // the terrace [documented], in granite squares; the hall's floor is the next phase
  b.newGroup();
  b.box(PODIUM[0], PODIUM[1], PODIUM[2], PODIUM[3], -3, -1, { kind: 'plate', color: 0x8f8d86 });
  b.box(PODIUM[0], PODIUM[1], PODIUM[2], PODIUM[3], -1, 0, { kind: 'tile', color: squares(GRANITE), mask: (x, z) => !inRect(x, z, HALL) });
  // the wide stair up from Potsdamer Straße [documented: about 36 m along the street edge], a plate a step
  b.newGroup();
  for (let z = STREET_STAIR[1]; z < STREET_STAIR[3]; z++) {
    const top = z - STREET_STAIR[3] + 1;
    b.box(STREET_STAIR[0], z, STREET_STAIR[2], z + 1, -24, top, { kind: 'plate', color: GRANITE[1], mask: (x, zz, y) => y >= groundPlates(x, zz) });
  }
  // the sculpture garden's walls, granite up to the terrace [documented]
  b.newGroup();
  b.box(GARDEN[0], GARDEN[1], GARDEN[2], GARDEN[3], Y.GARDEN, 0, { kind: 'brick', color: GRANITE[1], mask: (x, z, y) => ring(x, z, GARDEN) && z > GARDEN[1] && y >= groundPlates(x, z) });
}

/** the hall's floor (floor) [documented: Epprechtstein granite] */
export function buildFloor(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  b.box(HALL[0], HALL[1], HALL[2], HALL[3], -1, 0, { kind: 'tile', color: squares(HALL_GRANITE) });
}

/** the eight columns: black steel crosses from the terrace to the roof [documented: cruciform, two to a side] (structure) */
export function buildColumns(b: Builder) {
  b.setPhase(P.STRUCTURE);
  for (const [cx, cz] of COLUMNS) {
    b.newGroup();
    // up into the roof's depth, to its top: the roof rests on them [documented: the roof's load goes straight to the eight]
    b.box(cx - 1, cz - 1, cx + 2, cz + 2, 0, Y.ROOF - 1, { kind: 'brick', color: STEEL, mask: (x, z) => inColumn(x, z) });
  }
}

/**
 * The glass walls (envelope): black steel mullions every 3.6 m [documented: 56 upper panes, 3.40 m wide], a lower pane and a
 * 5.40 m upper pane [documented], the doors in the street front's middle bays [documented: facing Potsdamer Straße]
 */
export function glassAt(x: number, y: number, z: number): 'glass' | 'steel' | null {
  if (!ring(x, z, HALL) || y < 0 || y >= Y.CEILING) return null;
  const u = z === HALL[1] || z === HALL[3] - 1 ? x : z;
  if (u % BAY === 0 || u === HALL[2] - 1) return 'steel';
  if (y === Y.UPPER_PANE - 1) return 'steel';
  if (z === HALL[1] && DOORS.some(([a, c]) => x >= a && x < c) && (x === DOORS[0][0] + 3 || x === DOORS[1][0] + 3 || y === 18)) return 'steel';
  return 'glass';
}
export function buildGlass(b: Builder) {
  b.setPhase(P.ENVELOPE);
  // the mullions, full height, and the doors' frames
  b.newGroup();
  b.box(HALL[0], HALL[1], HALL[2], HALL[3], 0, Y.CEILING, { kind: 'brick', color: STEEL, mask: (x, z) => glassAt(x, 30, z) === 'steel' });
  b.box(HALL[0], HALL[1], HALL[2], HALL[3], 0, 18, { kind: 'brick', color: STEEL, mask: (x, z) => glassAt(x, 0, z) === 'steel' });
  // the transom between the lower panes and the upper, and the doors' heads
  b.newGroup();
  b.box(HALL[0], HALL[1], HALL[2], HALL[3], Y.UPPER_PANE - 1, Y.UPPER_PANE, { kind: 'plate', color: STEEL, mask: (x, z) => ring(x, z, HALL) });
  b.box(HALL[0], HALL[1], HALL[2], HALL[3], 18, 19, { kind: 'plate', color: STEEL, mask: (x, z) => glassAt(x, 18, z) === 'steel' });
  // the panes: below the transom and above it, in full courses
  b.newGroup();
  for (const [y0, y1] of [[0, Y.UPPER_PANE - 1], [Y.UPPER_PANE, Y.CEILING]])
    b.box(HALL[0], HALL[1], HALL[2], HALL[3], y0, y1, { kind: 'glass', color: GLASS, mask: (x, z) => glassAt(x, 30, z) === 'glass' });
}

/**
 * The roof (roof): 1.8 m deep [documented], a square grid of black steel girders on the 3.6 m grid [documented], closed on top,
 * its edge a deep black fascia; lights in the coffers [documented: the ceiling's light fittings; their number assumed]
 */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  const girder = (x: number, z: number) => x % BAY === 0 || z % BAY === 0 || x === ROOF[2] - 1 || z === ROOF[3] - 1;
  b.newGroup();
  b.box(ROOF[0], ROOF[1], ROOF[2], ROOF[3], Y.CEILING, Y.ROOF - 1, { kind: 'brick', color: STEEL, mask: (x, z) => girder(x, z) });
  b.newGroup();
  b.box(ROOF[0], ROOF[1], ROOF[2], ROOF[3], Y.ROOF - 1, Y.ROOF, { kind: 'plate', color: (x, _y, z) => (girder(x, z) ? STEEL : 0x2a2b2d) });
  b.hanging(P.ROOF, () => {
    for (let i = 0; i < 18; i += 2) for (let j = 0; j < 18; j += 2) {
      const x = i * BAY + 6, z = j * BAY + 6;
      if (inRect(x, z, HALL)) b.add(x - 1, z - 1, Y.ROOF - 2, 2, 2, 1, C.warmLight, 'light');
    }
  });
}

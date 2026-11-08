import { C } from '@/engine/catalog';
import { P } from '@/houses/stahl-house/phases';
import { Builder } from '@/engine/voxel';
import {
  BEDROOMS, CORNER, HOUSE, inAny, inPool, inRect, LIVING, ROOF, TERRACE, Y,
} from '@/houses/stahl-house/model/layout';

/** Concrete grade beams that carry the cantilevered living room (built before the terrain). */
export function buildCantileverBeams(b: Builder) {
  b.setPhase(P.FOUNDATION);
  for (const z of [30, 39, 48]) b.box(44, z, 70, z + 2, -9, 0, { kind: 'brick', color: C.concreteDark });
  // pier set back from the cliff edge
  b.box(50, 30, 54, 50, -24, -9, { kind: 'brick', color: C.concreteDark });
}

const bathRect = [1, 41, 19, 49] as const;

export function buildSlabs(b: Builder) {
  b.setPhase(P.FOUNDATION);
  for (const r of HOUSE) b.box(r[0], r[1], r[2], r[3], 0, 1, { kind: 'plate', color: C.concreteDark });

  b.setPhase(P.FLOOR);
  for (const r of HOUSE)
    b.box(r[0], r[1], r[2], r[3], 1, 2, {
      kind: 'tile',
      color: (x, _y, z) =>
        x >= bathRect[0] && x < bathRect[2] && z >= bathRect[1] && z < bathRect[3] ? C.blueTile : C.beige,
    });
  // pool terrace (concrete) all round the pool, inside the L
  const T = TERRACE;
  const terraceMask = (x: number, z: number) => !inPool(x, z) && !inAny(x, z, HOUSE);
  b.box(T[0], T[1], T[2], T[3], 0, 1, { kind: 'plate', color: C.concreteDark, mask: terraceMask });
  b.box(T[0], T[1], T[2], T[3], 1, 2, {
    kind: 'tile',
    mask: terraceMask,
    color: (x, _y, z) => ((x % 8 === 0 || z % 8 === 0) ? C.offWhite : C.concrete),
  });
  // narrow catwalk on the south side of the house
  b.box(0, 50, 56, 52, 0, 1, { kind: 'plate', color: C.concreteDark });
  b.box(0, 50, 56, 52, 1, 2, { kind: 'tile', color: C.concrete });
  // walkway along the bedroom wing, from carport to terrace
  b.box(20, -14, 27, -10, 0, 1, { kind: 'plate', color: C.concreteDark });
}

/** Columns: [x, z] cells, 20 ft module. */
export const COLUMNS: [number, number][] = [
  // living wing
  [19, 30], [40, 30], [60, 30], [69, 30],
  [19, 49], [40, 49], [60, 49], [69, 49], [69, 40],
  // bedroom wing & corner
  [0, -10], [0, 10], [0, 30], [0, 49], [19, -10], [19, 10],
  // carport
  [0, -34], [23, -34],
];
export const MULLIONS: [number, number][] = [
  [30, 30], [50, 30], [30, 49], [50, 49], [69, 35], [69, 45],
  [19, 0], [19, 20],
];

/** Header lines (along the wall planes), as rects. */
const HEADERS: [number, number, number, number][] = [
  [19, 30, 70, 31], // living north (pool side)
  [0, 49, 70, 50], // south
  [69, 30, 70, 50], // east end
  [0, -10, 1, 50], // street wall
  [19, -10, 20, 31], // bedroom east (pool side)
  [0, -10, 20, -9], // bedroom north
];

export function buildSteel(b: Builder) {
  b.setPhase(P.STEEL);
  // columns: thin dark steel H-sections
  for (const [x, z] of COLUMNS) {
    const base = inRect(x, z, [-2, -38, 26, -10]) ? Y.FLOOR : Y.FLOOR;
    b.box(x, z, x + 1, z + 1, base, Y.WALL_TOP, { kind: 'brick', color: C.steel });
  }
  for (const [x, z] of MULLIONS) b.box(x, z, x + 1, z + 1, Y.FLOOR, Y.WALL_TOP, { kind: 'tile', unit: 3, color: C.steel });

  // fascia ring first so beams stop against it
  const inRoof = (x: number, z: number) => inAny(x, z, ROOF);
  const fascia = (x: number, z: number) =>
    inRoof(x, z) && (!inRoof(x + 1, z) || !inRoof(x - 1, z) || !inRoof(x, z + 1) || !inRoof(x, z - 1));
  b.setPhase(P.ROOF);
  for (const r of ROOF) b.box(r[0], r[1], r[2], r[3], 27, Y.ROOF_TOP + 1, { kind: 'brick', unit: 5, color: C.steel, mask: fascia, studs: false });

  b.setPhase(P.STEEL);
  for (const h of HEADERS) b.box(h[0], h[1], h[2], h[3], Y.WALL_TOP, Y.BEAM_TOP, { kind: 'brick', color: C.steel });
  // exposed roof beams, running out over the eaves
  for (const x of [10, 30, 50, 60]) b.box(x, 23, x + 1, 57, Y.WALL_TOP, Y.BEAM_TOP, { kind: 'brick', color: C.steel });
  for (const x of [40]) b.box(x, 23, x + 1, 57, Y.WALL_TOP, Y.BEAM_TOP, { kind: 'brick', color: C.steel });
  for (const z of [35, 44]) b.box(70, z, 77, z + 1, Y.WALL_TOP, Y.BEAM_TOP, { kind: 'brick', color: C.steel });
  for (const z of [-34, -22, 0, 10, 20]) b.box(-2, z, 27, z + 1, Y.WALL_TOP, Y.BEAM_TOP, { kind: 'brick', color: C.steel });
  // perimeter edge beams carrying the deep overhangs
  b.box(-2, 23, 27, 24, Y.WALL_TOP, Y.BEAM_TOP, { kind: 'brick', color: C.steel, mask: (x) => x >= 20 });
  b.box(26, -36, 27, 23, Y.WALL_TOP, Y.BEAM_TOP, { kind: 'brick', color: C.steel });
  b.box(20, 23, 77, 24, Y.WALL_TOP, Y.BEAM_TOP, { kind: 'brick', color: C.steel });

  // roof deck (white ribbed ceiling) and roof surface
  b.setPhase(P.ROOF);
  for (const r of ROOF) b.box(r[0], r[1], r[2], r[3], Y.BEAM_TOP, Y.DECK_TOP, { kind: 'plate', color: C.white });
  for (const r of ROOF)
    b.box(r[0], r[1], r[2], r[3], Y.DECK_TOP, Y.ROOF_TOP, {
      kind: 'tile',
      color: (x, _y, z) => ((x * 7 + z * 3) % 23 === 0 ? C.midGray : C.lightGray),
    });
  // a couple of roof vents
  b.add(8, 20, Y.ROOF_TOP, 2, 2, 3, C.darkGray, 'brick');
  b.add(10, 42, Y.ROOF_TOP, 2, 2, 3, C.darkGray, 'brick');
}

export { LIVING, CORNER, BEDROOMS };

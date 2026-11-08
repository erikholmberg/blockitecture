import { C } from '@/engine/catalog';
import { P } from '@/houses/stahl-house/phases';
import { Builder } from '@/engine/voxel';
import { Y } from '@/houses/stahl-house/model/layout';

type Opening = [from: number, to: number];
const outside = (v: number, ops: Opening[]) => !ops.some(([a, b]) => v >= a && v < b);

/** Floor-to-ceiling plate glass, solid street wall and interior partitions. */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const glass = { kind: 'glass' as const, color: C.glass };

  // living wing, pool side (north) – entry and sliding doors left open
  const livingDoors: Opening[] = [[41, 46], [52, 56]];
  b.box(20, 30, 69, 31, Y.FLOOR, Y.WALL_TOP, { ...glass, mask: (x) => outside(x, livingDoors) });
  // living wing view side (south) and the cantilevered east end
  b.box(20, 49, 69, 50, Y.FLOOR, Y.WALL_TOP, glass);
  b.box(69, 30, 70, 50, Y.FLOOR, Y.WALL_TOP, glass);
  // bedroom wing, pool side (east)
  const bedDoors: Opening[] = [[15, 19], [-6, -2]];
  b.box(19, -9, 20, 30, Y.FLOOR, Y.WALL_TOP, { ...glass, mask: (_x, z) => outside(z, bedDoors) });

  // street façade: solid wall of vertical decking boards
  const boards = (x: number, _y: number, z: number) => ((x + z) % 2 === 0 ? C.tan : C.beige);
  b.box(0, -9, 1, 49, Y.FLOOR, Y.WALL_TOP, { kind: 'brick', color: boards });
  b.box(0, 49, 19, 50, Y.FLOOR, Y.WALL_TOP, { kind: 'brick', color: boards }); // service corner, south
  // bedroom wing north wall facing carport, with door
  b.box(1, -10, 19, -9, Y.FLOOR, Y.WALL_TOP, { kind: 'brick', color: boards, mask: (x) => outside(x, [[8, 11]]) });
  // door frame / transom above the carport door
  b.box(8, -10, 11, -9, 20, Y.WALL_TOP, { kind: 'brick', color: C.steel });

  // interior partitions (gypsum board – white)
  const wall = { kind: 'brick' as const, color: C.white };
  b.box(1, 10, 19, 11, Y.FLOOR, Y.WALL_TOP, { ...wall, mask: (x) => outside(x, [[14, 17]]) }); // master | children
  b.box(1, 0, 9, 1, Y.FLOOR, Y.WALL_TOP, wall); // children's room split in two
  b.box(1, 30, 19, 31, Y.FLOOR, Y.WALL_TOP, { ...wall, mask: (x) => outside(x, [[13, 16]]) }); // master | dressing
  b.box(19, 31, 20, 49, Y.FLOOR, Y.WALL_TOP, { ...wall, mask: (_x, z) => outside(z, [[32, 35]]) }); // corner | kitchen
  b.box(1, 40, 19, 41, Y.FLOOR, Y.WALL_TOP, { ...wall, mask: (x) => outside(x, [[4, 7]]) }); // dressing | bath
  // bathroom: sunken shower enclosure in mosaic tile, WC compartment
  const mosaic = (x: number, y: number, z: number) => ((x + y + z) % 3 === 0 ? C.sandBlue : C.blueTile);
  b.box(6, 44, 7, 49, Y.FLOOR, 18, { kind: 'brick', color: mosaic });
  b.box(1, 44, 6, 45, Y.FLOOR, 18, { kind: 'brick', color: mosaic, mask: (x) => x >= 4 });
  b.box(9, 44, 10, 49, Y.FLOOR, Y.WALL_TOP, wall);
  // mechanical / service closet
  b.box(14, 31, 15, 37, Y.FLOOR, Y.WALL_TOP, wall);
}

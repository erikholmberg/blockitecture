/**
 * The Sonneveld House's rooms (spec 060), in the palette the house is known for: vermilion red, cornflower blue and canary
 * yellow against bronze, brown and grey, with chromed tubular steel furniture [documented: the Nieuwe Instituut; Bart van der
 * Leck's colours for Metz & Co, Gispen's furniture]. Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { Y } from './layout';

const RED = 0xd4452c, BLUE = 0x5b82c9, YELLOW = 0xf0c53a, BRONZE = 0x8a7350, BEIGE = 0xd9cdb4, CHROME = 0xc9ccce, WOOD = 0x9b7650, LINEN = 0xeeeae0;

/** a Gispen chair: a chromed tube frame under a coloured seat and back [documented: Gispen; the model assumed] */
function chair(b: Builder, x: number, z: number, y: number, color: number, back: 'x' | 'z' = 'z') {
  b.add(x, z, y, 1, 1, 3, CHROME, 'bar');
  b.add(x, z, y + 3, 1, 1, 1, color, 'plate');
  if (back === 'z') b.add(x, z + 1, y, 1, 1, 7, color, 'brick'); else b.add(x + 1, z, y, 1, 1, 7, color, 'brick');
}

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F1 = Y.F1, F2 = Y.F2;
  // ground floor. [documented: the daughters' studio at the south end] a table and stools
  b.newGroup();
  b.box(6, 20, 12, 24, 6, 7, { kind: 'tile', color: WOOD });
  for (const [x, z] of [[6, 20], [11, 20], [6, 23], [11, 23]]) b.add(x, z, 0, 1, 1, 6, CHROME, 'bar');
  // [documented: two servants' rooms along the east side] a bed in each
  for (const x of [20, 28]) {
    b.newGroup();
    b.box(x, 24, x + 6, 28, 0, 2, { kind: 'plate', color: WOOD });
    b.box(x, 24, x + 6, 28, 2, 3, { kind: 'plate', color: LINEN });
  }
  // first floor. [documented: the living room in bronze, brown and beige, with orange-red armchairs] a sofa, two armchairs,
  // a low table on a beige carpet
  b.newGroup();
  b.box(4, 5, 16, 14, F1, F1 + 1, { kind: 'tile', color: BEIGE });
  b.box(5, 3, 13, 5, F1, F1 + 3, { kind: 'brick', color: BRONZE });
  b.box(5, 2, 13, 3, F1, F1 + 6, { kind: 'brick', color: BRONZE });
  b.newGroup();
  for (const x of [5, 11]) { b.box(x, 10, x + 2, 12, F1 + 1, F1 + 4, { kind: 'brick', color: RED }); b.box(x, 12, x + 2, 13, F1 + 1, F1 + 7, { kind: 'brick', color: RED }); }
  b.box(8, 7, 10, 9, F1 + 1, F1 + 4, { kind: 'brick', color: CHROME });
  // [documented: the library at the north end, a yellow desk chair] the desk, the chair, the bookshelves along the partition
  b.newGroup();
  b.box(26, 5, 32, 8, F1 + 6, F1 + 7, { kind: 'tile', color: WOOD });
  for (const [x, z] of [[26, 5], [31, 5], [26, 7], [31, 7]]) b.add(x, z, F1, 1, 1, 6, CHROME, 'bar');
  chair(b, 28, 9, F1, YELLOW);
  b.newGroup();
  b.box(35, 9, 36, 19, F1, F1 + 18, { kind: 'brick', color: BRONZE });
  // [documented: the dining room, red cabinets, blue curtains, a yellow floor] the table and six chairs, the cabinets
  b.newGroup();
  b.box(23, 22, 31, 26, F1 + 6, F1 + 7, { kind: 'tile', color: WOOD });
  for (const [x, z] of [[23, 22], [30, 22], [23, 25], [30, 25]]) b.add(x, z, F1, 1, 1, 6, CHROME, 'bar');
  b.newGroup();
  for (const x of [24, 27, 29]) { chair(b, x, 19, F1, 0x2c2e30, 'z'); b.add(x, 27, F1, 1, 1, 3, CHROME, 'bar'); b.add(x, 27, F1 + 3, 1, 1, 1, 0x2c2e30, 'plate'); }
  b.newGroup();
  b.box(33, 19, 37, 21, F1, F1 + 9, { kind: 'brick', color: RED });
  b.box(18, 29, 19, 31, F1, F1 + 21, { kind: 'brick', color: BLUE });
  b.box(36, 29, 37, 31, F1, F1 + 21, { kind: 'brick', color: BLUE });
  // [documented: the kitchen in the wing, Bruynzeel units by Piet Zwart] counters along its walls
  b.newGroup();
  b.box(39, 33, 41, 52, F1, F1 + 7, { kind: 'brick', color: LINEN });
  b.box(39, 33, 41, 52, F1 + 7, F1 + 8, { kind: 'tile', color: 0x8c8f8f });
  // second floor. [documented: the parents' bedroom at the south-east, the daughters' bedrooms on the east, a bedroom on the
  // west] a bed in each, in the three colours [assumed: which colour where]
  for (const [x, z, c] of [[19, 22, BLUE], [30, 22, YELLOW], [8, 5, RED], [28, 5, BLUE]] as const) {
    b.newGroup();
    b.box(x, z, x + 5, z + 7, F2, F2 + 2, { kind: 'plate', color: WOOD });
    b.box(x, z, x + 5, z + 7, F2 + 2, F2 + 3, { kind: 'plate', color: LINEN });
    b.box(x, z + 5, x + 5, z + 7, F2 + 3, F2 + 4, { kind: 'plate', color: c });
  }
  // [documented: the daughters' bathroom, turquoise tiles] a tub against a turquoise wall panel
  b.newGroup();
  b.box(27, 26, 32, 29, F2, F2 + 4, { kind: 'brick', color: LINEN });
  b.box(27, 29, 33, 31, F2, F2 + 15, { kind: 'brick', color: C.turquoise });
  // [documented: garden furniture by Erich Dieckmann] two chairs on the first floor's balcony
  b.newGroup();
  chair(b, 5, 22, F1, LINEN);
  chair(b, 9, 22, F1, LINEN);
}

/** [documented: Gispen lamps] globe lights under the ceilings, with the roof */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z, y] of [[9, 8, Y.F2 - 2], [28, 8, Y.F2 - 2], [27, 24, Y.F2 - 2], [10, 8, Y.ROOF - 2], [30, 24, Y.ROOF - 2], [10, 20, Y.F1 - 2]])
      b.add(x, z, y - 3, 1, 1, 3, C.warmLight, 'lamp');
  });
}

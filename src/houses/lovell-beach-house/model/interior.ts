/**
 * The Lovell Beach House's interior (spec 056): the rooms HABS CA-1986 names, furnished generically: it's a private home, so
 * nothing here is the family's. Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { BEDROOMS, Y } from './layout';

const WOOD = 0x9b7650;
const LINEN = 0xe9e3d3;
const CUSHION = 0x6f7f6a;
const RUG = 0xb9a27c;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F1 = Y.F1, F2 = Y.F2;
  // [documented: the built-in unit between the living and the dining area, sheets 3 and 10] in wood
  b.newGroup();
  b.box(28, 5, 30, 13, F1, F1 + 9, { kind: 'brick', color: WOOD });
  // [documented: the dining area] a table and benches [assumed]
  b.newGroup();
  b.box(20, 5, 26, 9, F1 + 5, F1 + 6, { kind: 'tile', color: WOOD });
  for (const [x, z] of [[20, 5], [25, 5], [20, 8], [25, 8]]) b.add(x, z, F1, 1, 1, 5, WOOD, 'bar');
  b.box(20, 3, 26, 4, F1, F1 + 3, { kind: 'brick', color: WOOD });
  b.box(20, 10, 26, 11, F1, F1 + 3, { kind: 'brick', color: WOOD });
  // [documented: the living area] a long low sofa facing the glass to the ocean, a rug, a low table [assumed]
  b.newGroup();
  b.box(38, 3, 39, 13, F1, F1 + 6, { kind: 'brick', color: CUSHION });
  b.box(39, 3, 41, 13, F1, F1 + 3, { kind: 'brick', color: CUSHION });
  b.newGroup();
  b.box(42, 3, 51, 13, F1, F1 + 1, { kind: 'tile', color: RUG });
  b.box(44, 6, 48, 10, F1 + 1, F1 + 3, { kind: 'brick', color: WOOD });
  // [assumed] two armchairs by the fireplace
  b.newGroup();
  b.box(31, 7, 33, 9, F1, F1 + 4, { kind: 'brick', color: CUSHION });
  b.box(34, 7, 36, 9, F1, F1 + 4, { kind: 'brick', color: CUSHION });
  // [documented: the kitchen and the breakfast area in the north bay] counters along the north wall, a table [assumed]
  b.newGroup();
  b.box(1, 1, 3, 13, F1, F1 + 7, { kind: 'brick', color: LINEN });
  b.box(1, 1, 3, 13, F1 + 7, F1 + 8, { kind: 'tile', color: 0x8c8f8f });
  b.newGroup();
  b.box(8, 4, 12, 8, F1 + 5, F1 + 6, { kind: 'tile', color: WOOD });
  for (const [x, z] of [[8, 4], [11, 4], [8, 7], [11, 7]]) b.add(x, z, F1, 1, 1, 5, WOOD, 'bar');
  // [documented: four bedrooms in a row, one to a bay] a bed in each, under the windows to 13th Street [assumed]
  for (const [x0, , x1] of BEDROOMS) {
    b.newGroup();
    const x = Math.floor((x0 + x1) / 2) - 2;
    b.box(x, 24, x + 5, 31, F2, F2 + 2, { kind: 'plate', color: WOOD });
    b.box(x, 24, x + 5, 31, F2 + 2, F2 + 3, { kind: 'plate', color: LINEN });
  }
  // [assumed] the gallery's rail over the living room, a wooden top on posts
  b.newGroup();
  for (let x = 17; x < 53; x += 4) if (![28, 40, 52].includes(x)) b.add(x, 13, F2, 1, 1, 9, WOOD, 'bar');
  b.box(17, 13, 53, 14, F2 + 9, F2 + 10, { kind: 'tile', color: WOOD, mask: (x) => ![28, 40, 52].includes(x) });
  // [documented: the bath over the kitchen, +18′-9″] a tub [assumed]
  b.newGroup();
  b.box(2, 2, 7, 5, Y.BATH, Y.BATH + 4, { kind: 'brick', color: LINEN });
}

/** [assumed] lights under the ceilings, with the roof */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const x of [23, 34, 46]) b.add(x, 8, Y.CEILING - 4, 2, 1, 1, C.warmLight, 'light');
    for (const x of [10, 22, 34, 46]) b.add(x, 25, Y.CEILING - 4, 1, 1, 1, C.warmLight, 'light');
  });
}

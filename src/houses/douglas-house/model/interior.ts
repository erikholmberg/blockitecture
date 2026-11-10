/**
 * The Douglas House's interior (spec 045): the rooms the nomination describes floor by floor, furnished generically in white:
 * it's a private home, so nothing here is the owners' (spec 045, Q5). The quarter-round stair is pink, the only colour inside
 * that isn't white [documented]. Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { CORNER, inStairwell, stairStep, Y } from './layout';

const WHITE = 0xf2f1ec;
const PALE = 0xdcdad3;
const GREY = 0x9c9e9f;
const OAK = 0xb79a74;
const PINK = 0xe2588f;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // [documented: one quarter-round stair at the north-east corner, painted pink] a flight of twelve wedge steps a floor, round
  // the quarter, each flight standing on its own floor
  for (const f of [Y.F1, Y.F2, Y.F3]) {
    b.newGroup();
    b.box(0, 0, CORNER.cx, CORNER.cz, f, f + 25, {
      kind: 'brick', color: PINK,
      mask: (x, z, y) => inStairwell(x, z) && y < f + 2 * (stairStep(x, z) + 1),
    });
  }
  const F1 = Y.F1, F2 = Y.F2, F3 = Y.F3, F4 = Y.F4;
  // 1st floor. [documented: the dining room] a table and six chairs by the glass
  b.newGroup();
  for (const [x, z] of [[8, 21], [15, 21], [8, 25], [15, 25]]) b.add(x, z, F1, 1, 1, 6, WHITE, 'bar');
  b.add(8, 21, F1 + 6, 8, 5, 1, WHITE, 'plate');
  b.newGroup();
  for (const x of [9, 12, 14]) for (const z of [20, 26]) b.add(x, z, F1, 1, 1, 4, PALE, 'brick');
  // [documented: the kitchen] counters along the road wall
  b.newGroup();
  b.box(8, 1, 16, 3, F1, F1 + 7, { kind: 'brick', color: WHITE });
  b.box(10, 1, 12, 3, F1 + 7, F1 + 8, { kind: 'tile', color: GREY });
  // [documented: the laundry] the washer and the dryer
  b.newGroup();
  b.box(17, 1, 22, 3, F1, F1 + 7, { kind: 'brick', color: WHITE });
  // [documented: a bedroom with its bath] the bed, and the bath's tub
  b.newGroup();
  b.box(34, 19, 40, 26, F1, F1 + 2, { kind: 'plate', color: OAK });
  b.box(34, 19, 40, 26, F1 + 2, F1 + 3, { kind: 'plate', color: WHITE });
  b.newGroup();
  b.box(39, 1, 44, 4, F1, F1 + 5, { kind: 'brick', color: WHITE });
  // 2nd floor. [assumed] two long white sofas facing the lake, a low table, a rug, in the double-height living room
  b.newGroup();
  b.box(12, 20, 28, 22, F2, F2 + 3, { kind: 'brick', color: WHITE });
  b.box(12, 19, 28, 20, F2, F2 + 6, { kind: 'brick', color: WHITE });
  b.box(30, 18, 32, 26, F2, F2 + 3, { kind: 'brick', color: WHITE });
  b.newGroup();
  b.box(11, 23, 29, 29, F2, F2 + 1, { kind: 'tile', color: PALE });
  b.box(16, 24, 24, 27, F2 + 1, F2 + 3, { kind: 'plate', color: GREY });
  // [documented: the wet bar] along the road wall
  b.newGroup();
  b.box(10, 1, 20, 3, F2, F2 + 7, { kind: 'brick', color: WHITE });
  // [documented: the main bedroom] its bed
  b.newGroup();
  b.box(33, 3, 39, 10, F2, F2 + 2, { kind: 'plate', color: OAK });
  b.box(33, 3, 39, 10, F2 + 2, F2 + 3, { kind: 'plate', color: WHITE });
  // 3rd floor. [documented: three bedrooms and a bath] a bed in each, the bath's tub
  for (const x of [9, 25, 37]) {
    b.newGroup();
    b.box(x, 2, x + 5, 9, F3, F3 + 2, { kind: 'plate', color: OAK });
    b.box(x, 2, x + 5, 9, F3 + 2, F3 + 3, { kind: 'plate', color: WHITE });
  }
  b.newGroup();
  b.box(18, 1, 22, 4, F3, F3 + 5, { kind: 'brick', color: WHITE });
  // [documented: a built-in desk overlooking the living room] along the gallery's edge
  b.newGroup();
  b.box(30, 13, 38, 14, F3, F3 + 7, { kind: 'brick', color: WHITE });
  // [assumed] a white rail along the rest of the gallery's edge, over the living room
  b.newGroup();
  for (let x = 9; x < 45; x += 3) if (x < 30 || x >= 38) b.add(x, 14, F3, 1, 1, 8, WHITE, 'bar');
  b.box(9, 14, 45, 15, F3 + 8, F3 + 9, { kind: 'tile', color: WHITE, mask: (x) => x < 30 || x >= 38 });
  // 4th floor. [documented: the entry's beverage fridge and two closets]
  b.newGroup();
  b.box(40, 1, 43, 3, F4, F4 + 9, { kind: 'brick', color: WHITE });
  b.box(28, 1, 38, 3, F4, F4 + 20, { kind: 'brick', color: PALE });
}

/** [assumed] lights under the ceilings, with the roof */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z, y] of [[12, 23, Y.F2 - 4], [36, 7, Y.F2 - 4], [36, 22, Y.F2 - 4], [36, 6, Y.F3 - 4], [20, 22, Y.F4 - 6], [12, 6, Y.F4 - 4], [30, 7, Y.TOP - 4]])
      b.add(x, z, y, 2, 1, 1, C.warmLight, 'light');
  });
}

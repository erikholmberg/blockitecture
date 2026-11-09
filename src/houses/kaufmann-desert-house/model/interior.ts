/**
 * The Kaufmann Desert House's interior (spec 033 Q2): the living room with its fireplace and Neutra's built-ins, the
 * dining table, the master bedroom, the guest rooms, the kitchen and the staff room, as block approximations. There are no
 * published inventories, so most pieces are read from photographs; each says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { stone } from './house';
import { Y } from './layout';

const WALNUT = 0x6e4a2f; // Neutra's built-in cabinetry [assumed: photographs]
const LINEN = 0xe9e2d2;
const SLATE = 0x4a4f55;
const CUSHION = 0xc8b48a;
const STEEL = 0xc9ccd0;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = Y.FLOOR;
  // [documented] the living room's fireplace, stone, against its north wall [place assumed: photographs]
  b.newGroup();
  b.box(66, 71, 73, 74, F, Y.CEILING, { kind: 'brick', color: stone });
  b.box(65, 74, 74, 76, F, F + 1, { kind: 'plate', color: SLATE }); // the hearth [assumed]
  b.add(68, 74, F + 1, 3, 1, 1, C.fire, 'light'); // [assumed] a fire

  // [assumed: photographs] the long low sofa facing the fire, and its coffee table
  b.newGroup();
  b.box(62, 82, 78, 85, F, F + 3, { kind: 'brick', color: CUSHION });
  b.box(62, 84, 78, 85, F + 3, F + 6, { kind: 'brick', color: CUSHION });
  b.box(66, 78, 74, 81, F, F + 2, { kind: 'plate', color: WALNUT });
  // [assumed: photographs] two lounge chairs by the glass, toward the pool
  b.newGroup();
  for (const z of [76, 86]) {
    b.box(86, z, 89, z + 3, F, F + 2, { kind: 'plate', color: LINEN });
    b.box(88, z, 89, z + 3, F + 2, F + 5, { kind: 'brick', color: LINEN });
  }
  // [assumed: photographs] Neutra's built-in walnut cabinet along the north wall
  b.newGroup();
  b.box(76, 71, 94, 73, F, F + 7, { kind: 'brick', color: WALNUT });

  // [assumed: photographs] the dining table and six chairs, at the living room's west end by the kitchen
  b.newGroup();
  for (const [x, z] of [[49, 87], [56, 87], [49, 91], [56, 91]]) b.add(x, z, F, 1, 1, 6, STEEL, 'bar');
  b.add(49, 87, F + 6, 8, 5, 1, WALNUT, 'plate');
  for (const [x, z] of [[47, 88], [47, 90], [58, 88], [58, 90], [52, 85], [52, 93]]) b.add(x, z, F, 1, 1, 4, LINEN, 'brick');

  // [assumed: published plan] the master bedroom: the bed, its side tables, a built-in desk and the dresser
  b.newGroup();
  b.box(111, 61, 118, 68, F, F + 2, { kind: 'plate', color: WALNUT });
  b.box(111, 61, 118, 68, F + 2, F + 3, { kind: 'plate', color: LINEN });
  b.box(110, 61, 111, 63, F, F + 4, { kind: 'brick', color: WALNUT });
  b.box(118, 61, 119, 63, F, F + 4, { kind: 'brick', color: WALNUT });
  b.newGroup();
  b.box(125, 68, 127, 76, F, F + 6, { kind: 'brick', color: WALNUT }); // [assumed] the desk
  b.box(103, 61, 108, 63, F, F + 8, { kind: 'brick', color: WALNUT }); // [assumed] the dresser

  // [assumed: published plan] the guest rooms: two beds and a desk
  b.newGroup();
  for (const x of [64, 72]) {
    b.box(x, 21, x + 5, 27, F, F + 2, { kind: 'plate', color: WALNUT });
    b.box(x, 21, x + 5, 27, F + 2, F + 3, { kind: 'plate', color: LINEN });
  }
  b.newGroup();
  b.box(76, 37, 81, 39, F, F + 6, { kind: 'brick', color: WALNUT });

  // [assumed: published plan] the kitchen: counters along the service wing's north wall, steel-topped
  b.newGroup();
  b.box(28, 67, 46, 69, F, F + 7, { kind: 'brick', color: 0xe6e1d5 });
  b.box(28, 67, 46, 69, F + 7, F + 8, { kind: 'plate', color: STEEL });
  // [assumed: published plan] the staff room: a bed and a table
  b.newGroup();
  b.box(7, 68, 12, 74, F, F + 2, { kind: 'plate', color: WALNUT });
  b.box(7, 68, 12, 74, F + 2, F + 3, { kind: 'plate', color: LINEN });
  b.box(17, 76, 21, 79, F, F + 6, { kind: 'brick', color: WALNUT });

  // [assumed] a car of the 1940s in the garage
  b.newGroup();
  for (const [x, z] of [[33, 106], [37, 106], [33, 116], [37, 116]]) b.add(x, z, F, 1, 2, 2, C.darkGray, 'round');
  b.box(32, 104, 39, 120, F + 2, F + 5, { kind: 'brick', color: 0x2f4a3a });
  b.box(33, 108, 38, 115, F + 5, F + 8, { kind: 'brick', color: 0x2f4a3a });
}

/** [assumed] ceiling lights in the rooms and under the overhangs, hung with the roof */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[60, 80], [80, 92], [52, 89], [114, 72], [70, 32], [36, 74], [40, 115], [57, 50], [37, 92]])
      b.add(x, z, Y.CEILING - 1, 2, 1, 1, C.warmLight, 'light');
  });
}

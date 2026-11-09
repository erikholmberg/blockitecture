/**
 * The Farnsworth House's interior (spec 022 Q2): the free-standing primavera core and teak wardrobe from HABS IL-1105
 * sheets 6–7, and Mies's furniture in the areas sheet 3 names (dining, sleeping, living, office), as block
 * approximations; product names in the code only. Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { CORE, FIREPLACE, KITCHEN_COUNTER, WARDROBE, Y } from './layout';

const PRIMAVERA = 0xd8b67a; // the core's pale wood [documented: sheet 6, interior finishes]
const TEAK = 0x8a5a33; // the wardrobe [documented: sheet 7]
const LEATHER = 0x2a2624;
const CHROME = 0xc9ccd0;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = Y.FLOOR;
  // [documented] the core: primavera panels, short of the ceiling, the bathrooms and the mechanical room inside
  b.newGroup();
  b.box(CORE[0], CORE[1], CORE[2], CORE[3], F, Y.CORE_TOP, { kind: 'brick', color: PRIMAVERA });
  // [documented] the kitchen counter along the core's north side, steel-topped
  b.newGroup();
  b.box(KITCHEN_COUNTER[0], KITCHEN_COUNTER[1], KITCHEN_COUNTER[2], KITCHEN_COUNTER[3], F, F + 7, { kind: 'brick', color: PRIMAVERA });
  b.box(KITCHEN_COUNTER[0], KITCHEN_COUNTER[1], KITCHEN_COUNTER[2], KITCHEN_COUNTER[3], F + 7, F + 8, { kind: 'plate', color: CHROME });
  // [documented] the fireplace on the core's south side, open to the living area
  b.newGroup();
  b.box(FIREPLACE[0], FIREPLACE[1], FIREPLACE[2], FIREPLACE[3], F, F + 1, { kind: 'plate', color: C.darkGray });
  b.add(81, 22, F + 1, 3, 1, 1, C.fire, 'light'); // [assumed] a fire
  // [documented] the teak wardrobe, free-standing near the east end
  b.newGroup();
  b.box(WARDROBE[0], WARDROBE[1], WARDROBE[2], WARDROBE[3], F, F + 15, { kind: 'brick', color: TEAK });

  // [assumed: photographs] the living area: two Barcelona chairs and a stool around a low table, on a rug
  b.newGroup();
  b.box(78, 26, 90, 34, F, F + 1, { kind: 'tile', color: 0xd9d2c3 });
  for (const x of [79, 86]) {
    b.add(x, 27, F + 1, 3, 3, 2, LEATHER, 'brick');
    b.add(x, 27, F + 3, 3, 1, 4, LEATHER, 'brick');
  }
  b.add(83, 31, F + 1, 2, 2, 2, LEATHER, 'brick');
  b.add(82, 28, F + 1, 3, 2, 1, CHROME, 'plate'); // the low glass-topped table, as a plate [assumed]
  // [assumed: photographs] the dining table and four chairs in the dining area (sheet 3 names it)
  b.newGroup();
  for (const [x, z] of [[56, 12], [60, 12], [56, 15], [60, 15]]) b.add(x, z, F, 1, 1, 6, CHROME, 'bar');
  b.add(56, 12, F + 6, 5, 4, 1, 0x3a2a20, 'plate');
  for (const [x, z] of [[55, 13], [61, 13], [58, 11], [58, 16]]) b.add(x, z, F, 1, 1, 4, LEATHER, 'brick');
  // [assumed: photographs] the bed in the sleeping area (sheet 3 names it)
  b.newGroup();
  b.box(98, 11, 104, 17, F, F + 2, { kind: 'plate', color: TEAK });
  b.box(98, 11, 104, 17, F + 2, F + 3, { kind: 'plate', color: C.offWhite });
  // [assumed: photographs] the desk and chair in the office area (sheet 3 names it)
  b.newGroup();
  for (const [x, z] of [[54, 29], [58, 29], [54, 31], [58, 31]]) b.add(x, z, F, 1, 1, 6, CHROME, 'bar');
  b.add(54, 29, F + 6, 5, 3, 1, 0x3a2a20, 'plate');
  b.add(56, 33, F, 1, 1, 4, LEATHER, 'brick');
}

/** [assumed] ceiling lights over the living and dining areas, hung with the roof */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[58, 14], [84, 30], [100, 14]]) b.add(x, z, Y.CEILING - 1, 2, 1, 1, C.warmLight, 'light');
  });
}

/**
 * The Lovell Health House's interior (spec 034 Q2): the rooms HABS CA-1936 names and draws (sheets 3–5), furnished as block
 * approximations. The plans draw the built-ins (the kitchen, the living room's long seat, the fireplace, the stair); the loose
 * furniture is read from photographs. Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { WHITE } from './house';
import { Y } from './layout';

const LINEN = 0xe6e0d2;
const LEATHER = 0x5a4636;
const BLACK = 0x2a2a2c;
const WOOD = 0x8a6a48;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = Y.LIVING, T = Y.THIRD;
  // [documented: sheet 4] the kitchen's counters, along its north wall and the island toward the living room
  b.newGroup();
  b.box(46, 21, 67, 23, F, F + 7, { kind: 'brick', color: WHITE });
  b.box(55, 30, 67, 32, F, F + 7, { kind: 'brick', color: WHITE });
  // [documented: sheet 4] the living room's long built-in seat below the kitchen's wall
  b.newGroup();
  b.box(57, 34, 68, 37, F, F + 3, { kind: 'brick', color: LINEN });
  b.box(57, 34, 68, 35, F + 3, F + 6, { kind: 'brick', color: LINEN });
  // [documented: sheet 4] the fireplace on the living room's south side, and its hearth
  b.newGroup();
  b.box(54, 49, 61, 52, F, F + 12, { kind: 'brick', color: WHITE });
  b.add(56, 48, F, 3, 1, 1, C.fire, 'light'); // [assumed] a fire
  // [assumed: photographs] the dining table and its chairs at the west end, by the porch
  b.newGroup();
  for (const [x, z] of [[32, 42], [39, 42], [32, 46], [39, 46]]) b.add(x, z, F, 1, 1, 6, BLACK, 'bar');
  b.add(32, 42, F + 6, 8, 5, 1, WOOD, 'plate');
  for (const [x, z] of [[30, 43], [30, 45], [41, 43], [41, 45], [35, 40], [35, 48]]) b.add(x, z, F, 1, 1, 4, LEATHER, 'brick');
  // [assumed: photographs] lounge chairs and a low table in the living room
  b.newGroup();
  for (const x of [44, 49]) b.box(x, 44, x + 3, 47, F, F + 3, { kind: 'brick', color: LEATHER });
  b.box(45, 41, 51, 43, F, F + 2, { kind: 'plate', color: BLACK });
  // [documented: sheet 4] the main stair up to the third floor, beside the library
  b.newGroup();
  for (let i = 0; i < 9; i++) b.box(61 + i, 47, 62 + i, 51, F, F + 3 * (i + 1), { kind: 'brick', color: WHITE });
  // [documented: sheet 4, "library"] shelves along the library's wall [assumed: their height]
  b.newGroup();
  b.box(72, 40, 86, 41, F, F + 18, { kind: 'brick', color: WOOD });
  // [documented: sheet 4, "guest room 1, 2"] a bed in each guest room [assumed: the beds]
  b.newGroup();
  for (const [x, z] of [[76, 25], [91, 27]]) {
    b.box(x, z, x + 7, z + 4, F, F + 2, { kind: 'plate', color: WOOD });
    b.box(x, z, x + 7, z + 4, F + 2, F + 3, { kind: 'plate', color: LINEN });
  }

  // [documented: sheet 5, "sleeping porch", "living room 3, 4"] beds on the third floor
  b.newGroup();
  for (const [x, z] of [[22, 42], [34, 25], [40, 17], [52, 17]]) {
    b.box(x, z, x + 6, z + 3, T, T + 2, { kind: 'plate', color: WOOD });
    b.box(x, z, x + 6, z + 3, T + 2, T + 3, { kind: 'plate', color: LINEN });
  }
  // [documented: sheet 5, "study"] the study's built-in seat and desk
  b.newGroup();
  b.box(45, 37, 48, 47, T, T + 3, { kind: 'brick', color: LINEN });
  b.box(50, 44, 56, 46, T, T + 6, { kind: 'brick', color: WOOD });
  // [documented: sheet 5, "dressing room"] its cabinets
  b.newGroup();
  b.box(34, 46, 36, 51, T, T + 15, { kind: 'brick', color: WOOD });
  // [documented: sheet 3, "laundry"] the laundry's tubs, on the pool floor
  b.newGroup();
  b.box(57, 30, 63, 33, Y.POOL, Y.POOL + 7, { kind: 'brick', color: WHITE });
}

/** [assumed] ceiling lights in the main rooms, hung with the roof */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[40, 44], [60, 42], [80, 48], [85, 28]]) b.add(x, z, Y.CEILING_LIVING - 1, 2, 1, 1, C.warmLight, 'light');
    for (const [x, z] of [[30, 45], [50, 40], [40, 25], [70, 45]]) b.add(x, z, Y.CEILING_THIRD - 1, 2, 1, 1, C.warmLight, 'light');
  });
}

/**
 * Casa Malaparte's interior (spec 031 Q2): the great living room on the upper floor's sea end, and the rooms below. Each piece
 * says [documented] (spec 031 research; the living-room photograph by Ernest Delaville, CC BY 2.0) or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { FIREPLACE, Y } from './layout';
import { WHITE } from './house';

const WOOD = 0x6b4a32;
const STONE = 0xc9c3b5;
const LINEN = 0xe8e2d4;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = Y.UPPER;
  // [documented] the fireplace in the living room's end wall, its back a pane of glass onto the sea: a stone hearth and surround
  b.newGroup();
  b.box(FIREPLACE[0] - 3, FIREPLACE[1] - 1, FIREPLACE[0], FIREPLACE[3] + 1, F, F + 2, { kind: 'brick', color: STONE });
  b.box(FIREPLACE[0] - 1, FIREPLACE[1] - 1, FIREPLACE[0], FIREPLACE[1], F + 2, F + 16, { kind: 'brick', color: STONE });
  b.box(FIREPLACE[0] - 1, FIREPLACE[3], FIREPLACE[0], FIREPLACE[3] + 1, F + 2, F + 16, { kind: 'brick', color: STONE });
  b.add(FIREPLACE[0] - 2, FIREPLACE[1], F + 2, 1, FIREPLACE[3] - FIREPLACE[1], 1, C.fire, 'light'); // [assumed] a fire
  // [documented: photograph] two long, low wooden tables down the room
  b.newGroup();
  for (const z of [-7, 4]) {
    for (const x of [128, 146]) b.add(x, z, F, 2, 3, 4, WOOD, 'brick');
    b.box(127, z, 150, z + 3, F + 4, F + 5, { kind: 'plate', color: WOOD });
  }
  // [documented: photograph] long benches against the walls, under the windows
  b.newGroup();
  b.box(122, -14, 168, -12, F, F + 3, { kind: 'brick', color: WHITE });
  b.box(122, 12, 168, 14, F, F + 3, { kind: 'brick', color: WHITE });
  // [assumed] a sofa facing the fire, linen-covered
  b.newGroup();
  b.box(160, -6, 163, 6, F, F + 3, { kind: 'brick', color: LINEN });
  b.box(158, -6, 160, 6, F, F + 6, { kind: 'brick', color: LINEN });
  // [assumed] a writing desk by the great window on the north side, and its chair
  b.newGroup();
  b.box(102, -13, 108, -10, F, F + 6, { kind: 'brick', color: WOOD });
  b.add(104, -9, F, 1, 1, 4, WOOD, 'brick');

  // --- the lower floor ---
  const G = Y.LOWER;
  // [assumed] bedrooms: beds in the rooms between the inner walls
  b.newGroup();
  for (const x of [124, 150]) {
    b.box(x, -12, x + 6, -5, G, G + 2, { kind: 'plate', color: WOOD });
    b.box(x, -12, x + 6, -5, G + 2, G + 3, { kind: 'plate', color: LINEN });
  }
  // [assumed] the kitchen at the land end: a counter along the wall
  b.newGroup();
  b.box(68, -14, 92, -12, G, G + 7, { kind: 'brick', color: WHITE });
  b.box(68, -14, 92, -12, G + 7, G + 8, { kind: 'plate', color: STONE });
  // [assumed] a long table in the dining room below the living room
  b.newGroup();
  for (const [x, z] of [[160, -3], [170, -3], [160, 2], [170, 2]]) b.add(x, z, G, 1, 1, 6, WOOD, 'bar');
  b.box(160, -3, 171, 3, G + 6, G + 7, { kind: 'plate', color: WOOD });
}

/** [assumed] lamps hung from the living room's ceiling, with the roof */
export function buildLamps(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const x of [134, 154]) b.add(x, -1, Y.ROOF - 5, 2, 2, 1, C.warmLight, 'light');
  });
}

/**
 * The Rietveld Schröder House's interior (spec 019 Q2): the upper floor open as the living zone, its painted floor and
 * its sliding partitions stowed, and Rietveld's furniture as recognisable block approximations (product names in the
 * code only). Each piece says whether it is [documented] (spec 019 sources) or [assumed] (photographs; no plans).
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { BATH_WALLS, inAny, inRect, STAIR, UPPER_FLOOR, W, Y } from './layout';
import { BLACK, BLUE, GREY, GREY_LIGHT, RED, WHITE, YELLOW } from './house';

const F2 = Y.L2 - 1; // the upper floor's top before its paint

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // [assumed: photographs] the upper floor painted in rectangles of grey, red, black and white, marking where the
  // partitions run when they're closed
  b.newGroup();
  b.box(UPPER_FLOOR[0] + 1, UPPER_FLOOR[1] + 1, UPPER_FLOOR[2] - 1, UPPER_FLOOR[3] - 1, F2, F2 + 1, {
    kind: 'tile',
    mask: (x, z) => !inRect(x, z, STAIR) && !inAny(x, z, BATH_WALLS),
    color: (x, _y, z) => (x >= 16 && z >= 21 && z < 29 ? RED : x < 9 && z >= 9 && z < 13 ? BLACK : x >= 9 && x < 15 && z >= 22 ? WHITE : GREY_LIGHT),
  });
  const F = F2 + 1; // furniture stands here

  // [documented: sliding and revolving panels divide the upper floor] the panels, slid back against the walls
  b.newGroup();
  for (const [x0, z0, x1, z1, col] of [[1, 13, 9, 14, GREY], [15, 9, 16, 13, WHITE], [16, 20, 23, 21, GREY]] as [number, number, number, number, number][])
    b.box(x0, z0, x1, z1, F, Y.ROOF - 4, { kind: 'brick', color: col });

  // [documented] the Red and Blue chair: a blue seat and a red back on a black frame with yellow ends
  b.newGroup();
  b.add(18, 25, F, 1, 1, 4, BLACK, 'bar');
  b.add(19, 26, F, 1, 1, 4, BLACK, 'bar');
  b.add(18, 25, F + 4, 2, 2, 1, BLUE, 'plate');
  b.add(18, 25, F + 5, 2, 1, 7, RED, 'tile');
  b.add(19, 26, F + 5, 1, 1, 1, YELLOW, 'tile');

  // [assumed] a square table with a white top and chairs, in the living zone
  b.newGroup();
  for (const [x, z] of [[11, 24], [13, 24], [11, 26], [13, 26]]) b.add(x, z, F, 1, 1, 6, BLACK, 'bar');
  b.add(11, 24, F + 6, 3, 3, 1, WHITE, 'plate');
  // [documented: three bedrooms upstairs] two beds, low, on black frames
  b.newGroup();
  b.box(2, 2, 8, 5, F, F + 2, { kind: 'plate', color: BLACK });
  b.box(2, 2, 8, 5, F + 2, F + 3, { kind: 'plate', color: C.offWhite });
  b.box(19, 10, 23, 15, F, F + 2, { kind: 'plate', color: BLACK });
  b.box(19, 10, 23, 15, F + 2, F + 3, { kind: 'plate', color: C.offWhite });
  // [documented: the bathroom upstairs] a white tub
  b.newGroup();
  b.box(17, 2, 23, 5, F, F + 4, { kind: 'brick', color: WHITE });
  // [assumed] a cupboard in primary colours by the stair
  b.newGroup();
  b.box(5, 15, 8, 17, F, F + 9, { kind: 'brick', color: (_x, y) => (y < F + 3 ? BLUE : y < F + 6 ? WHITE : RED) });

  // --- the ground floor ---
  const G = Y.L1;
  // [documented: a kitchen] the kitchen counter along the back wall, under the window [assumed: position]
  b.newGroup();
  b.box(2, 2, 9, 4, G, G + 6, { kind: 'brick', color: WHITE });
  b.box(2, 2, 9, 4, G + 6, G + 7, { kind: 'plate', color: BLACK });
  // [assumed] the kitchen table
  b.newGroup();
  for (const [x, z] of [[3, 7], [6, 7], [3, 10], [6, 10]]) b.add(x, z, G, 1, 1, 6, BLACK, 'bar');
  b.add(3, 7, G + 6, 4, 4, 1, WHITE, 'plate');
  // [documented: three sitting/bedrooms around the stair] a desk in the front room and a daybed in the studio [assumed: which]
  b.newGroup();
  b.box(2, 25, 8, 28, G, G + 6, { kind: 'brick', color: GREY });
  b.box(16, 24, 22, 27, G, G + 3, { kind: 'plate', color: BLACK });
  b.box(16, 24, 22, 27, G + 3, G + 4, { kind: 'plate', color: BLUE });
  // [documented: Rietveld's furniture in the house] a Berlin chair: black, grey and white slabs [assumed: where]
  b.newGroup();
  b.add(W - 6, 15, G, 1, 2, 6, BLACK, 'brick');
  b.add(W - 5, 15, G, 2, 2, 3, GREY, 'brick');
  b.add(W - 5, 15, G + 3, 1, 2, 5, WHITE, 'brick');
}

/** [documented] the hanging lamp of 1922: glass tubes hung crosswise from the ceiling (with the roof) */
export function buildLamp(b: Builder) {
  b.hanging(P.ROOF, () => {
    b.add(12, 25, Y.ROOF - 6, 3, 1, 1, C.warmLight, 'light');
    b.add(13, 24, Y.ROOF - 8, 1, 3, 1, C.warmLight, 'light');
    b.add(13, 25, Y.ROOF - 11, 1, 1, 3, C.warmLight, 'light');
    // and one over the kitchen table downstairs
    b.add(4, 8, Y.L2 - 5, 2, 1, 1, C.warmLight, 'light');
  });
}

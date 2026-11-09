/**
 * The Ennis House's interior (spec 025 Q2): the main rooms along the house, at block scale. Each piece says whether it is
 * [documented] (NRHP, the Ennis House Foundation, Wikipedia) or [assumed] (photographs; no plans).
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { Y } from './layout';

const TEAK = 0x8a5a33;
const LEATHER = 0x5a3b28;
/** the wisteria mosaic: iridescent glass in lilac, green and gold [documented: the glass-mosaic fireplace] */
const MOSAIC = [0x9a7fb8, 0x6f9a5a, 0xc9a94a, 0xb59ad0];

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = Y.FLOOR;
  // [documented] the glass-mosaic fireplace: wisteria in glass tesserae over the hearth, in the living room [position assumed]
  b.newGroup();
  b.box(64, 20, 72, 22, F, F + 3, { kind: 'brick', color: C.darkGray });
  b.box(64, 20, 72, 21, F + 3, F + 15, { kind: 'brick', color: (x, y) => MOSAIC[(x * 3 + y) % MOSAIC.length] });
  b.add(66, 22, F, 4, 1, 1, C.fire, 'light'); // [assumed] a fire on the hearth
  // [assumed: photographs] the living room: two long teak-framed sofas facing across a low table, on a rug
  b.newGroup();
  b.box(76, 30, 104, 48, F, F + 1, { kind: 'tile', color: 0x8a6a4a });
  b.box(78, 31, 102, 34, F + 1, F + 4, { kind: 'brick', color: LEATHER });
  b.box(78, 44, 102, 47, F + 1, F + 4, { kind: 'brick', color: LEATHER });
  b.box(84, 37, 96, 41, F + 1, F + 3, { kind: 'brick', color: TEAK });
  // [documented: the dining room, raised a few steps; position and furniture assumed] the dining table and its high-backed chairs
  b.newGroup();
  for (const [x, z] of [[124, 28], [134, 28], [124, 40], [134, 40]]) b.add(x, z, F, 1, 1, 6, TEAK, 'bar');
  b.box(124, 28, 135, 41, F + 6, F + 7, { kind: 'plate', color: TEAK });
  for (const z of [26, 43]) for (const x of [125, 128, 131, 134]) { b.add(x, z, F, 1, 1, 4, TEAK, 'brick'); b.add(x, z, F + 4, 1, 1, 8, TEAK, 'brick'); }
  // [documented: the long north loggia] its benches and planters along the north windows [assumed]
  b.newGroup();
  for (let x = 46; x < 112; x += 12) b.box(x, 10, x + 6, 12, F, F + 3, { kind: 'brick', color: TEAK });
  // [assumed] bedrooms in the east wing: two beds
  b.newGroup();
  for (const x of [182, 196]) { b.box(x, 12, x + 7, 20, F, F + 2, { kind: 'plate', color: TEAK }); b.box(x, 12, x + 7, 20, F + 2, F + 3, { kind: 'plate', color: C.offWhite }); }
  // [assumed] the kitchen counters in the middle mass
  b.newGroup();
  b.box(120, 6, 140, 8, F, F + 7, { kind: 'brick', color: C.lightGray });
  // [assumed] a grand piano in the living room's west end
  b.newGroup();
  for (const [x, z] of [[44, 50], [49, 50], [46, 56]]) b.add(x, z, F, 1, 1, 5, C.black, 'bar');
  b.box(43, 49, 51, 58, F + 5, F + 7, { kind: 'brick', color: C.black });
}

/** [assumed] lanterns hung from the teak ceilings, with the roofs */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z, y] of [[90, 38, Y.T3 - 6], [130, 34, 40 - 6], [70, 12, Y.T2 - 6], [200, 20, Y.T1 - 6]]) b.add(x, z, y, 2, 2, 1, C.warmLight, 'light');
  });
}

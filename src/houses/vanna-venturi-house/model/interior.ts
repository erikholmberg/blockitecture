/**
 * The Vanna Venturi House's interior (spec 044): the stair squeezed round the chimney and its run to nowhere [documented], the
 * fireplace's hearth [documented], and the rooms of the plan furnished generically: the house was designed round Vanna Venturi's
 * own antique and reproduction furniture, but it is a private home today, so nothing here is the owners' (spec 044, Q4).
 * Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { CHIMNEY, HEARTH, NOWHERE, STAIR, Y } from './layout';

const OAK = 0xa8825a;
const WALNUT = 0x6b4a32;
const LINEN = 0xebe6d8;
const SAGE = 0x8a9a7c;
const ROSE = 0xb07a72;
const WHITE = 0xf3f1ea;
const STEEL = 0x9a9ea2;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = Y.FLOOR;
  // [documented: the stair rises beside the chimney to the upstairs room] fourteen steps of 2 plates, toward the front
  b.newGroup();
  for (let i = 0; i < STAIR.steps; i++) {
    const z = STAIR.zTop + STAIR.steps - 1 - i;
    b.box(STAIR.x0, z, STAIR.x1, z + 1, F, F + 2 * (i + 1), { kind: 'brick', color: OAK });
  }
  // [documented: the stair's top run leads nowhere] four more steps up from the upstairs floor, ending in the air
  b.newGroup();
  for (let i = 0; i < NOWHERE.steps; i++) {
    const z = NOWHERE.z0 - i;
    b.box(NOWHERE.x0, z, NOWHERE.x1, z + 1, Y.UPPER, Y.UPPER + 2 * (i + 1), { kind: 'brick', color: OAK });
  }
  // [documented: the fireplace] its hearth, a stone step in front of the opening
  b.newGroup();
  b.box(HEARTH.x0 - 1, CHIMNEY[3], HEARTH.x1 + 1, CHIMNEY[3] + 2, F, F + 1, { kind: 'tile', color: 0x8c8780 });
  // [assumed] a sofa facing the fireplace, two armchairs, a low table, a rug
  b.newGroup();
  b.box(25, 20, 34, 23, F, F + 3, { kind: 'brick', color: SAGE });
  b.box(25, 22, 34, 23, F + 3, F + 6, { kind: 'brick', color: SAGE });
  b.newGroup();
  for (const x of [25, 33]) b.box(x, 14, x + 2, 17, F, F + 4, { kind: 'brick', color: ROSE });
  b.newGroup();
  const armchair = (x: number, z: number) => (x === 25 || x === 26 || x === 33 || x === 34) && z >= 14 && z < 17;
  b.box(25, 13, 36, 19, F, F + 1, { kind: 'tile', color: 0xc9b99a, mask: (x, z) => !armchair(x, z) });
  b.box(27, 15, 32, 18, F + 1, F + 3, { kind: 'plate', color: WALNUT });
  // [assumed] the dining table and its chairs in the dining room
  b.newGroup();
  for (const [x, z] of [[37, 4], [42, 4], [37, 8], [42, 8]]) b.add(x, z, F, 1, 1, 6, WALNUT, 'bar');
  b.add(37, 4, F + 6, 6, 5, 1, WALNUT, 'plate');
  b.newGroup();
  for (const x of [38, 41]) for (const z of [3, 10]) b.add(x, z, F, 1, 1, 4, OAK, 'brick');
  // [assumed] the kitchen's counters along the front and the end, and a small table
  b.newGroup();
  b.box(1, 1, 19, 3, F, F + 7, { kind: 'brick', color: WHITE });
  b.box(1, 3, 3, 9, F, F + 7, { kind: 'brick', color: WHITE });
  b.box(8, 1, 10, 3, F + 7, F + 8, { kind: 'tile', color: STEEL });
  b.newGroup();
  b.box(10, 5, 14, 8, F, F + 6, { kind: 'brick', color: OAK });
  // [assumed] the bath's tub and basin; the utility room's washer
  b.newGroup();
  b.box(1, 14, 6, 18, F, F + 5, { kind: 'brick', color: WHITE });
  b.box(6, 10, 8, 12, F, F + 6, { kind: 'brick', color: WHITE });
  b.newGroup();
  b.box(10, 10, 13, 13, F, F + 7, { kind: 'brick', color: WHITE });
  // [assumed] the beds: the main bedroom's, the small bedroom's, and the upstairs room's
  for (const [x, z, y] of [[49, 16, F], [50, 3, F], [26, 13, Y.UPPER]] as const) {
    b.newGroup();
    b.box(x, z, x + 5, z + 7, y, y + 2, { kind: 'plate', color: OAK });
    b.box(x, z, x + 5, z + 7, y + 2, y + 3, { kind: 'plate', color: LINEN });
    b.box(x, z, x + 5, z + 1, y + 3, y + 5, { kind: 'plate', color: WHITE });
  }
  // [assumed] a chest in each bedroom
  b.newGroup();
  b.box(53, 24, 56, 25, F, F + 7, { kind: 'brick', color: WALNUT });
  b.box(54, 10, 56, 11, F, F + 7, { kind: 'brick', color: WALNUT });
  // [assumed] two chairs on the porch
  b.newGroup();
  for (const x of [3, 7]) b.box(x, 23, x + 2, 25, F, F + 4, { kind: 'brick', color: WHITE });
}

/** [assumed] lights under the ceilings, with the roofs */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[29, 16], [40, 6], [9, 5], [51, 19], [51, 6]]) b.add(x, z, Y.EAVE - 2, 2, 1, 1, C.warmLight, 'light');
    b.add(28, 16, Y.UPPER_WALL - 2, 2, 1, 1, C.warmLight, 'light');
  });
}

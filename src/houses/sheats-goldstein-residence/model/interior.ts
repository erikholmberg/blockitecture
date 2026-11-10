/**
 * The Sheats-Goldstein Residence's interior (spec 040): Lautner's built-in furniture, following the triangles, and the rooms of
 * the plans [documented: the rooms and the built-ins in photographs; their sizes and places assumed unless marked].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { inLiving, inWest, onOutline, Y } from './layout';

const LEATHER = 0xb5652b; // the banquettes' tan leather [documented: photographs]
const CONCRETE_GREY = 0xa39d93;
const WALNUT = 0x5e3d28;
const LINEN = 0xe9e4d6;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = Y.FLOOR;
  // [documented: photographs] the long leather banquette along the living room's north wall, its back against the wall
  b.newGroup();
  b.box(28, -30, 84, 9, F, F + 7, {
    kind: 'brick', color: LEATHER,
    mask: (x, z, y) => {
      if (!inLiving(x, z) || onOutline(x, z)) return false;
      const seat = !inLiving(x, z - 4) || onOutline(x, z - 3);
      const back = !inLiving(x, z - 2) || onOutline(x, z - 1);
      return back ? true : seat && y < F + 3;
    },
  });
  // [documented: photographs] the low concrete tables built in front of it
  b.newGroup();
  for (const [x, z] of [[40, -6], [58, 1]]) b.box(x, z, x + 6, z + 3, F, F + 3, { kind: 'brick', color: CONCRETE_GREY });
  // [documented: plan, the kitchen at the east end] its counters, concrete with a walnut top
  b.newGroup();
  b.box(76, 0, 86, 3, F, F + 6, { kind: 'brick', color: CONCRETE_GREY });
  b.box(76, 0, 86, 3, F + 6, F + 7, { kind: 'plate', color: WALNUT });
  // [assumed] the dining table between the kitchen and the living room
  b.newGroup();
  for (const [x, z] of [[66, 3], [72, 3], [66, 6], [72, 6]]) b.add(x, z, F, 1, 1, 6, WALNUT, 'bar');
  b.add(66, 3, F + 6, 7, 4, 1, WALNUT, 'plate');
  // [documented: plan, level 0] the bedroom wing: a bed and a built-in desk in each room
  for (const [x, z] of [[-90, -30], [-70, -40], [-48, -38], [-26, -26]]) {
    b.newGroup();
    if (!inWest(x, z) || !inWest(x + 6, z + 7)) continue;
    const on = (xx: number, zz: number) => inWest(xx, zz) && !onOutline(xx, zz);
    b.box(x, z, x + 6, z + 7, F, F + 2, { kind: 'plate', color: WALNUT, mask: on });
    b.box(x, z, x + 6, z + 7, F + 2, F + 3, { kind: 'plate', color: LINEN, mask: on });
  }
  // [documented: photographs] the main bedroom on level −1: the bed facing the glass corner, Lautner's desk along the glass
  b.newGroup();
  const L = Y.LOWER;
  b.box(46, 56, 54, 64, L, L + 2, { kind: 'plate', color: WALNUT });
  b.box(46, 56, 54, 64, L + 2, L + 3, { kind: 'plate', color: LINEN });
  b.newGroup();
  b.box(58, 52, 66, 54, L, L + 7, { kind: 'brick', color: CONCRETE_GREY });
  // [assumed] the den on level −1: a built-in sofa against its back wall
  b.newGroup();
  b.box(30, 27, 60, 30, L, L + 3, { kind: 'brick', color: LEATHER });
  b.box(30, 27, 60, 28, L + 3, L + 7, { kind: 'brick', color: LEATHER });
}

/** [assumed] lights hung in the bedroom wing, with its roof (the living room is lit through its skylights) */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const x of [-80, -58, -36]) b.add(x, -30, Y.WING_ROOF - 2, 2, 1, 1, C.warmLight, 'light');
  });
}

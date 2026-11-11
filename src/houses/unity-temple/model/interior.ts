/**
 * Unity Temple's interior (spec 062): the oak pews on the auditorium's floor and in the galleries, the pulpit, Unity House's
 * tables and hearth. The restored palette is cream and yellow plaster, greens and browns, with dark oak trim [documented].
 * Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { CHIMNEY, Y } from './layout';
import { OAK } from './house';

const SEAT = 0x7d5a38;
const GREEN = 0x7f8f5a;

/** a pew: an oak seat and a back, facing +x (toward the pulpit) or along z */
function pew(b: Builder, x0: number, z0: number, x1: number, z1: number, y: number, facing: 'x' | 'z+' | 'z-') {
  if (facing === 'x') {
    b.box(x0 + 1, z0, x0 + 2, z1, y, y + 3, { kind: 'brick', color: SEAT });
    b.box(x0, z0, x0 + 1, z1, y, y + 6, { kind: 'brick', color: OAK });
  } else {
    const back = facing === 'z+' ? z0 : z0 + 1, seat = facing === 'z+' ? z0 + 1 : z0;
    b.box(x0, seat, x1, seat + 1, y, y + 3, { kind: 'brick', color: SEAT });
    b.box(x0, back, x1, back + 1, y, y + 6, { kind: 'brick', color: OAK });
  }
}

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const A = Y.AUDITORIUM;
  // [documented: the auditorium's floor seats face the pulpit on the south side] seven rows of oak pews, an aisle down the middle
  for (let x = 20; x <= 44; x += 4) {
    b.newGroup();
    pew(b, x, 32, x + 2, 44, A, 'x');
    pew(b, x, 48, x + 2, 60, A, 'x');
  }
  // [documented: two tiers of galleries on three sides] pews in each, facing the centre
  for (const g of [Y.GALLERY1, Y.GALLERY2]) {
    b.newGroup();
    for (const x of [4, 9]) pew(b, x, 32, x + 2, 60, g, 'x');
    b.newGroup();
    for (const z of [17, 22]) pew(b, 19, z, 47, z + 2, g, 'z+');
    b.newGroup();
    for (const z of [69, 74]) pew(b, 19, z, 47, z + 2, g, 'z-');
  }
  // [documented: the pulpit on the south side] a lectern on the platform, two chairs behind it [assumed]
  b.newGroup();
  b.box(50, 44, 52, 48, A + 6, A + 15, { kind: 'brick', color: OAK });
  b.box(54, 40, 55, 42, A + 6, A + 12, { kind: 'brick', color: OAK });
  b.box(54, 50, 55, 52, A + 6, A + 12, { kind: 'brick', color: OAK });
  // [assumed] a bench in the foyer
  b.newGroup();
  b.box(72, 45, 84, 47, Y.FOYER, Y.FOYER + 3, { kind: 'brick', color: SEAT });
  // Unity House. [documented: the congregation's hall, a fireplace on its south wall] three long tables with benches, a hearth
  for (const x of [104, 111, 118]) {
    b.newGroup();
    b.box(x, 30, x + 3, 62, Y.FOYER + 6, Y.FOYER + 7, { kind: 'tile', color: SEAT });
    for (const z of [30, 46, 61]) b.add(x + 1, z, Y.FOYER, 1, 1, 6, OAK, 'bar');
    b.box(x - 1, 30, x, 62, Y.FOYER, Y.FOYER + 3, { kind: 'brick', color: OAK });
  }
  b.newGroup();
  b.box(CHIMNEY[0] - 2, CHIMNEY[1] - 2, CHIMNEY[0], CHIMNEY[3] + 2, Y.FOYER, Y.FOYER + 1, { kind: 'tile', color: 0x5a5148 });
  b.add(CHIMNEY[0], CHIMNEY[1] + 1, Y.FOYER, 1, 2, 2, C.fire, 'light');
  // [documented: the kitchen behind the fireplace] counters along the south wall
  b.newGroup();
  b.box(139, 34, 141, 58, Y.FOYER, Y.FOYER + 7, { kind: 'brick', color: 0xd9cfb4 });
  // [documented: balconies in the wings, used as class rooms] a table in each
  for (const z of [5, 83]) {
    b.newGroup();
    b.box(106, z, 117, z + 4, Y.HALL_BALCONY + 6, Y.HALL_BALCONY + 7, { kind: 'tile', color: SEAT });
    for (const x of [106, 116]) b.add(x, z + 1, Y.HALL_BALCONY, 1, 1, 6, OAK, 'bar');
  }
  // [documented: the palette's greens] runners down the auditorium's aisle and the foyer
  b.newGroup();
  b.box(19, 45, 48, 47, A, A + 1, { kind: 'tile', color: GREEN });
}

/** [documented: pendant white glass globes] globes hung by the four piers and in Unity House, with the roof */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[19, 32], [19, 59], [46, 32], [46, 59]]) {
      b.add(x, z, 48, 1, 1, Y.CEILING - 48, 0x6b4a2e, 'bar');
      b.add(x, z, 45, 1, 1, 3, C.warmLight, 'lamp');
    }
    for (const [x, z] of [[108, 36], [108, 56], [120, 36], [120, 56]]) b.add(x, z, Y.LINK - 12, 1, 1, 3, C.warmLight, 'lamp');
  });
}

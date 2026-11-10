/**
 * The Rose Seidler House's interior (spec 043): the rooms of Seidler's plan, furnished as the museum keeps them, with the
 * 1950 furniture and colours restored [documented: Museums of History NSW, the heritage listing]. Each piece says
 * [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { BLACK, BLUE, RED, YELLOW } from './house';
import { BED2, BED3, FLAT, MAIN_BED, STAIR, Y } from './layout';

const OAK = 0xb08a5a;
const WALNUT = 0x6e4b30;
const GREY = 0x8b8d8f;
const LINEN = 0xece7da;
const STEEL = 0x9a9ea2;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = Y.FLOOR;
  // [documented: the freestanding stone fireplace] in the living room, open on its sides
  b.newGroup();
  b.box(8, 28, 12, 31, F, F + 18, { kind: 'brick', color: 0xc2a06a });
  // [documented: Seidler's sofa, made by Paul Kafka] a long low sofa facing the north glass, in grey
  b.newGroup();
  b.box(3, 34, 15, 37, F, F + 3, { kind: 'brick', color: GREY });
  b.box(3, 33, 15, 34, F, F + 6, { kind: 'brick', color: GREY });
  // [documented: Seidler's coffee table] in front of it
  b.newGroup();
  b.box(6, 38, 12, 40, F, F + 2, { kind: 'plate', color: WALNUT });
  // [documented: Saarinen's Womb chair in red, and Eames's LCW chairs]
  b.newGroup();
  b.box(15, 37, 18, 40, F, F + 4, { kind: 'brick', color: RED });
  b.box(15, 39, 18, 40, F + 4, F + 7, { kind: 'brick', color: RED });
  b.newGroup();
  for (const [x, z] of [[2, 24], [5, 24]]) {
    b.add(x, z, F, 2, 2, 2, WALNUT, 'plate');
    b.add(x, z + 1, F + 2, 2, 1, 3, WALNUT, 'plate');
  }
  // [assumed] a rug beside the fireplace
  b.newGroup();
  b.box(13, 26, 18, 32, F, F + 1, { kind: 'tile', color: 0xd8cfb8 });
  // [documented: Seidler's dining table] and Eames chairs round it
  b.newGroup();
  for (const [x, z] of [[5, 12], [12, 12], [5, 15], [12, 15]]) b.add(x, z, F, 1, 1, 6, BLACK, 'bar');
  b.add(5, 12, F + 6, 8, 4, 1, WALNUT, 'plate');
  b.newGroup();
  for (const x of [6, 10]) for (const z of [11, 16]) b.add(x, z, F, 1, 1, 4, x === 6 ? YELLOW : BLACK, 'brick');
  // [documented: the 1950 kitchen, one of Australia's best equipped] counters along its walls, the stove, the sink
  b.newGroup();
  b.box(1, 1, 8, 3, F, F + 7, { kind: 'brick', color: 0xe9e6df });
  b.box(1, 3, 3, 9, F, F + 7, { kind: 'brick', color: 0xe9e6df });
  b.box(5, 1, 7, 3, F + 7, F + 8, { kind: 'tile', color: STEEL });
  // [documented: the servery hatch's bench] under the hatch, on the kitchen side
  b.box(4, 8, 9, 10, F, F + 7, { kind: 'brick', color: 0xe9e6df });
  // [assumed] the laundry's tub and copper
  b.newGroup();
  b.box(13, 1, 16, 3, F, F + 7, { kind: 'brick', color: STEEL });
  // [documented: the stair up from the entry foyer] steps of 2 plates through the floor into the playroom
  b.newGroup();
  for (let i = 0; i < 10; i++) b.box(STAIR[0], STAIR[1] + i, STAIR[2], STAIR[1] + i + 1, Y.LOWER_FLOOR, Y.LOWER_FLOOR + 2 * (i + 1), { kind: 'brick', color: OAK });
  // [assumed] a rail round the stair's opening in the playroom
  b.newGroup();
  for (let z = STAIR[1]; z <= STAIR[3]; z += 2) b.add(STAIR[2], z, F, 1, 1, 8, BLACK, 'bar');
  b.box(STAIR[2], STAIR[1], STAIR[2] + 1, STAIR[3] + 1, F + 8, F + 9, { kind: 'tile', color: BLACK });
  // [documented: the playroom's yellow curtains] drawn back at both ends of its glass to the deck
  b.newGroup();
  b.box(20, 18, 22, 19, F, F + 21, { kind: 'brick', color: YELLOW });
  b.box(30, 18, 33, 19, F, F + 21, { kind: 'brick', color: YELLOW });
  // [assumed] a low play table and a toy shelf
  b.newGroup();
  b.box(26, 6, 31, 10, F, F + 3, { kind: 'brick', color: OAK });
  b.box(31, 12, 33, 17, F, F + 6, { kind: 'brick', color: BLUE });
  // [documented: blue bedspreads; Seidler's built-in cabinets] a bed in each bedroom, a built-in wardrobe along a wall
  for (const [r, bx, bz, w] of [[MAIN_BED, 38, 3, 6], [BED2, 40, 22, 4], [BED3, 40, 33, 4]] as const) {
    b.newGroup();
    b.box(bx, bz, bx + w, bz + 7, F, F + 2, { kind: 'plate', color: OAK });
    b.box(bx, bz, bx + w, bz + 7, F + 2, F + 3, { kind: 'plate', color: BLUE });
    b.box(bx, bz, bx + w, bz + 1, F + 3, F + 5, { kind: 'plate', color: LINEN });
    b.newGroup();
    b.box(r[0] + 1, r[3] - 3, r[0] + 6, r[3] - 1, F, F + 18, { kind: 'brick', color: OAK });
  }
  // [assumed] the ensuite's basin and bath
  b.newGroup();
  b.box(47, 15, 48, 18, F, F + 5, { kind: 'brick', color: 0xffffff });
  b.box(42, 17, 46, 20, F, F + 6, { kind: 'brick', color: 0xffffff });
  // [assumed] below: a table-tennis table in the recreation area
  b.newGroup();
  for (const [x, z] of [[6, 26], [14, 26], [6, 30], [14, 30]]) b.add(x, z, Y.LOWER_FLOOR, 1, 1, 6, BLACK, 'bar');
  b.add(6, 26, Y.LOWER_FLOOR + 6, 9, 5, 1, 0x2f6b4a, 'plate');
  // [assumed] the caretaker's bed and table in the flat
  b.newGroup();
  b.box(FLAT[0] + 2, FLAT[1] + 10, FLAT[0] + 6, FLAT[1] + 17, Y.LOWER_FLOOR, Y.LOWER_FLOOR + 3, { kind: 'brick', color: OAK });
  b.box(FLAT[2] - 5, FLAT[1] + 3, FLAT[2] - 2, FLAT[1] + 6, Y.LOWER_FLOOR, Y.LOWER_FLOOR + 6, { kind: 'brick', color: WALNUT });
}

/** [assumed] lights hung under the roof, with the roof, and two under the floor in the recreation area */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[9, 34], [9, 14], [26, 10], [41, 7], [41, 25], [41, 35]]) b.add(x, z, Y.ROOF - 2, 2, 1, 1, C.warmLight, 'light');
  });
}

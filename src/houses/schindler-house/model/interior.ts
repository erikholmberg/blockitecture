/**
 * The Schindler House's rooms (spec 081), as blocky stand-ins for what was in them; product and maker names in the code only.
 * The house has no living room and no bedrooms [documented]: a studio for each adult, the shared kitchen, the guest apartment,
 * the two small baths, and the sleeping baskets on the roof. Where each piece stands is [assumed] unless marked; HABS found no
 * built-in light fixtures [documented], so nothing hangs from the roof.
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { CONCRETE, fireplaces } from './house';
import { DIAMOND, NORTH_BASKET, ROOMS, SOUTH_BASKET, Y } from './layout';

/** the built-in cabinets and shelves [documented: HABS, "plywood cabinets"], a pale fir plywood [assumed] */
export const PLYWOOD = 0xc9a877;
/** the copper panels over the 45° chimney's fireplaces [documented: HABS] */
export const COPPER = 0xb8703e;
const DESK = 0x6e4a32;
const CUSHION = [0xb5893f, 0x7e8a5a, 0xa0523a]; // floor cushions [assumed: ochre, olive, rust]
const LINEN = 0xece6d6;
export const MATTRESS = 0xd9d0bb;
export const BLANKET = [0x8c6a4a, 0x6f7f68];
/** the baths' and the kitchens' fittings [assumed] */
export const ENAMEL = 0xe8e6e0;
const STOVE = 0x3a3836;

/** a table: four legs and a top; `h` plates to the top's top */
function table(b: Builder, x0: number, z0: number, x1: number, z1: number, h: number, top = DESK, legs = DESK) {
  b.newGroup();
  for (const [x, z] of [[x0, z0], [x1 - 1, z0], [x0, z1 - 1], [x1 - 1, z1 - 1]]) b.column(x, z, 0, h - 1, legs, 'bar');
  b.box(x0, z0, x1, z1, h - 1, h, { kind: 'plate', color: top });
}
/** a drafting table: a tilted board on two trestles, as a stepped top [assumed] */
function draftingTable(b: Builder, x: number, z: number) {
  b.newGroup();
  for (const xx of [x, x + 3]) b.box(xx, z, xx + 1, z + 3, 0, 8, { kind: 'brick', color: DESK });
  b.box(x, z, x + 4, z + 1, 8, 10, { kind: 'plate', color: PLYWOOD });
  b.box(x, z + 1, x + 4, z + 3, 8, 9, { kind: 'plate', color: PLYWOOD });
}
/** a low stool or chair [assumed] */
const chair = (b: Builder, x: number, z: number, c = DESK) => { b.newGroup(); b.add(x, z, 0, 1, 1, 4, c, 'brick'); };

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const { chaceA, chaceB, pauline, rudolph, kitchen, guest, northHall, southHall } = ROOMS;

  // [documented] the studios' built-in cabinets and shelves along their concrete back walls; low, below the slits' view
  b.newGroup();
  b.box(chaceA[0] + 1, chaceA[1], chaceA[2] - 1, chaceA[1] + 2, 0, 9, { kind: 'brick', color: PLYWOOD });
  b.newGroup();
  b.box(chaceB[0] + 1, chaceB[1], chaceB[2] - 4, chaceB[1] + 2, 0, 9, { kind: 'brick', color: PLYWOOD });
  b.newGroup();
  b.box(pauline[0] + 1, pauline[3] - 2, pauline[2] - 1, pauline[3], 0, 9, { kind: 'brick', color: PLYWOOD });
  b.newGroup();
  b.box(rudolph[0] + 4, rudolph[3] - 2, rudolph[2] - 1, rudolph[3], 0, 9, { kind: 'brick', color: PLYWOOD });
  // [documented] the tall shelves at the studios' ends [assumed: their height, 6 ft]
  b.newGroup();
  b.box(chaceA[0], chaceA[1] + 3, chaceA[0] + 1, chaceA[1] + 9, 0, 15, { kind: 'brick', color: PLYWOOD });
  b.box(chaceB[2] - 1, chaceB[1] + 3, chaceB[2], chaceB[1] + 11, 0, 15, { kind: 'brick', color: PLYWOOD });

  // [documented] Schindler's drafting room, with two drafting tables (Neutra worked beside him, per the NRHP), in the south wing
  draftingTable(b, rudolph[0] + 8, rudolph[1] + 3);
  draftingTable(b, rudolph[0] + 14, rudolph[1] + 3);
  chair(b, rudolph[0] + 9, rudolph[1] + 7);
  chair(b, rudolph[0] + 15, rudolph[1] + 7);
  // [assumed] a desk in each of the other studios, with a chair
  table(b, chaceA[0] + 6, chaceA[1] + 6, chaceA[0] + 11, chaceA[1] + 9, 7);
  chair(b, chaceA[0] + 8, chaceA[1] + 10);
  table(b, chaceB[0] + 4, chaceB[1] + 6, chaceB[0] + 9, chaceB[1] + 9, 7);
  chair(b, chaceB[0] + 6, chaceB[1] + 10);
  table(b, pauline[0] + 7, pauline[1] + 14, pauline[0] + 10, pauline[1] + 19, 7);
  chair(b, pauline[0] + 6, pauline[1] + 16);
  // [assumed] floor cushions round a low table in each studio, by its patio wall (Schindler's floor-level living)
  for (const [x, z] of [[chaceA[0] + 5, chaceA[3] - 6], [chaceB[0] + 8, chaceB[3] - 6], [pauline[0] + 2, pauline[1] + 4], [rudolph[0] + 4, rudolph[1] + 1]]) {
    b.newGroup();
    b.box(x, z, x + 3, z + 2, 0, 2, { kind: 'brick', color: DESK });
    b.add(x - 2, z, 0, 2, 2, 2, CUSHION[0], 'brick');
    b.add(x + 3, z, 0, 2, 2, 2, CUSHION[1], 'brick');
    b.add(x, z + 2, 0, 3, 2, 1, CUSHION[2], 'plate');
  }

  // [assumed] the shared kitchen: counters along the street wall, a sink and a stove in them [documented: "the kitchen"]
  b.newGroup();
  b.box(kitchen[2] - 2, kitchen[1] + 1, kitchen[2], kitchen[1] + 9, 0, 9, { kind: 'brick', color: PLYWOOD });
  b.newGroup();
  b.add(kitchen[2] - 2, kitchen[1] + 4, 9, 2, 2, 1, ENAMEL, 'tile');
  b.add(kitchen[2] - 2, kitchen[1] + 9, 0, 2, 2, 9, STOVE, 'brick');
  b.newGroup();
  b.box(kitchen[0], kitchen[1] + 1, kitchen[0] + 2, kitchen[1] + 8, 0, 15, { kind: 'brick', color: PLYWOOD });
  table(b, kitchen[0] + 5, kitchen[1] + 4, kitchen[0] + 10, kitchen[1] + 7, 7);

  // [documented] the guest apartment: its own kitchenette and bath [documented: Wikipedia]; a bed and a table [assumed]
  b.newGroup();
  b.box(guest[2] - 2, guest[1] + 1, guest[2], guest[1] + 7, 0, 9, { kind: 'brick', color: PLYWOOD });
  b.add(guest[2] - 2, guest[1] + 3, 9, 2, 2, 1, ENAMEL, 'tile');
  b.newGroup();
  b.box(guest[0] + 6, guest[1] + 1, guest[0] + 12, guest[1] + 5, 0, 2, { kind: 'brick', color: DESK });
  b.box(guest[0] + 6, guest[1] + 1, guest[0] + 12, guest[1] + 5, 2, 3, { kind: 'plate', color: LINEN });
  b.newGroup();
  b.add(guest[0] + 1, guest[1] + 9, 0, 1, 2, 3, ENAMEL, 'brick');
  b.add(guest[0] + 1, guest[1] + 12, 0, 2, 1, 7, ENAMEL, 'brick');
  table(b, guest[0] + 16, guest[1] + 10, guest[0] + 20, guest[1] + 13, 7);

  // [assumed] the small baths by each entrance: a WC and a basin
  b.newGroup();
  b.add(northHall[2] - 2, northHall[1], 0, 1, 2, 3, ENAMEL, 'brick');
  b.add(northHall[2] - 5, northHall[1], 0, 2, 1, 7, ENAMEL, 'brick');
  b.newGroup();
  b.add(southHall[0], southHall[3] - 3, 0, 1, 2, 3, ENAMEL, 'brick');
  b.add(southHall[0] + 3, southHall[3] - 1, 0, 2, 1, 7, ENAMEL, 'brick');

  // [documented] the copper panels over the 45° chimney's two fireplaces [documented: HABS], on its faces above the openings
  b.newGroup();
  const dx = Math.floor(DIAMOND.x - 1), zn = Math.floor(DIAMOND.z - DIAMOND.r) - 1, zs = Math.ceil(DIAMOND.z + DIAMOND.r);
  b.box(dx, zn, dx + 2, zn + 1, Y.FIREPLACE, Y.FIREPLACE + 6, { kind: 'tile', color: COPPER });
  b.box(dx, zs, dx + 2, zs + 1, Y.FIREPLACE, Y.FIREPLACE + 6, { kind: 'tile', color: COPPER });
  // [assumed] fires laid in the indoor and outdoor fireplaces
  b.newGroup();
  for (const o of fireplaces()) b.box(o.open[0], o.open[1], o.open[2], o.open[3], 0, 1, { kind: 'light', color: C.fire });

  // [documented] the sleeping baskets: the households slept outdoors on the roof; a mattress or two in each [assumed]
  const [n] = NORTH_BASKET, [s0, s1] = SOUTH_BASKET;
  for (const [x, z] of [[n[0] + 6, n[1] + 2], [n[0] + 6, n[1] + 7], [s0[0] + 6, s0[1] + 2], [s1[0] + 2, s1[1] + 1]]) {
    b.newGroup();
    b.box(x, z, x + 6, z + 4, Y.BASKET_FLOOR, Y.BASKET_FLOOR + 2, { kind: 'brick', color: MATTRESS });
    b.box(x + 2, z, x + 6, z + 4, Y.BASKET_FLOOR + 2, Y.BASKET_FLOOR + 3, { kind: 'plate', color: BLANKET[(x + z) % 2] });
  }
}

export { CONCRETE };

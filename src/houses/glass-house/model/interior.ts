/**
 * The two houses' interiors (spec 073), as block stand-ins; product names in the code only. No plan of the Glass House was
 * available (spec 073 Q3), so where each piece stands is [assumed] from the photographs; what the pieces are is [documented]
 * by the NHL nomination and the National Trust, or [scaled] from the Library of Congress photographs.
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { BRICK, CYL, FIREPLACE, KITCHEN, RUG, STORAGE, Y } from './layout';

/** the walnut of the kitchen unit and the storage wall [documented: "walnut-veneered storage cabinets"] */
export const WALNUT = 0x5b3a26;
const CHROME = 0xc9ccd0;
const TAN_LEATHER = 0xb5895a; // the Barcelona chairs and stool [scaled: photographs]
const DAYBED_LEATHER = 0x5a3b2a; // the tufted daybed [scaled]
const BLACK_LEATHER = 0x2a2624;
const RUG_WHITE = 0xefece3; // [scaled: "a white rectangular rug"]
const PLASTER = 0xf1eee6; // the Brick House's 1953 rooms [documented: white plaster vaults]
const LINEN = 0xe9e4d6;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = 0;
  // [documented] the kitchen: "one long line of 42″ high cabinets", walnut; north of the cylinder [assumed: place]
  b.newGroup();
  b.box(KITCHEN[0], KITCHEN[1], KITCHEN[2], KITCHEN[3], F, Y.KITCHEN, { kind: 'brick', color: WALNUT });
  // [documented] the walnut storage wall between the bedroom and the rest of the room, about 6 ft high [scaled]
  b.newGroup();
  b.box(STORAGE[0], STORAGE[1], STORAGE[2], STORAGE[3], F, Y.STORAGE, { kind: 'brick', color: WALNUT });
  // [scaled] the bedroom: a low bed against the walnut wall
  b.newGroup();
  b.box(8, 6, 13, 12, F, F + 2, { kind: 'plate', color: WALNUT });
  b.box(8, 6, 13, 12, F + 2, F + 3, { kind: 'plate', color: LINEN });
  // [documented] the small desk in the bedroom, at the glass [scaled], and a tubular chair [scaled]
  b.newGroup();
  for (const [x, z] of [[22, 1], [25, 1], [22, 2], [25, 2]]) b.column(x, z, F, F + 6, CHROME, 'bar');
  b.box(22, 1, 26, 3, F + 6, F + 7, { kind: 'plate', color: WALNUT });
  b.add(23, 4, F, 2, 2, 3, BLACK_LEATHER, 'brick');
  b.add(23, 5, F + 3, 2, 1, 3, BLACK_LEATHER, 'brick');

  // [documented] the living area, marked by a rug [scaled: white, rectangular], by the west glass [assumed]
  b.newGroup();
  b.box(RUG[0], RUG[1], RUG[2], RUG[3], F, F + 1, { kind: 'tile', color: RUG_WHITE });
  const R = F + 1;
  // [documented] two Barcelona chairs facing the daybed across the table [scaled], their backs to the cylinder
  for (const z of [35, 43]) {
    b.newGroup();
    b.add(10, z, R, 3, 3, 2, TAN_LEATHER, 'brick');
    b.add(12, z, R + 2, 1, 3, 4, TAN_LEATHER, 'brick');
  }
  // [documented] the Barcelona stool
  b.newGroup();
  b.add(10, 39, R, 2, 2, 2, TAN_LEATHER, 'brick');
  // [documented] the tufted daybed Mies designed for Johnson, with its bolster [scaled]
  b.newGroup();
  b.box(4, 36, 6, 45, R, R + 2, { kind: 'brick', color: DAYBED_LEATHER });
  b.add(4, 44, R + 2, 2, 1, 1, DAYBED_LEATHER, 'brick');
  // [scaled] the low glass-topped table between them
  b.newGroup();
  b.box(7, 38, 9, 42, R, R + 1, { kind: 'plate', color: CHROME });
  b.box(7, 38, 9, 42, R + 1, R + 2, { kind: 'glass', unit: 1, color: C.glass });
  // [documented] The Burial of Phocion (attributed to Poussin) on a free-standing easel [scaled], facing the Nadelman
  b.newGroup();
  for (const x of [6, 10]) b.column(x, 50, F, F + 12, WALNUT, 'bar');
  b.box(5, 49, 12, 50, F + 5, F + 12, { kind: 'tile', color: (x, y) => (y === F + 5 || y === F + 11 || x === 5 || x === 11 ? 0xa8833a : y > F + 8 ? 0x6f8a8c : 0x56603e) });
  // [documented] Elie Nadelman's Two Circus Women, on a plinth [assumed], across the living area from the Poussin
  b.newGroup();
  b.box(5, 30, 7, 32, F, F + 6, { kind: 'brick', color: 0xe7e3d8 });
  b.add(5, 30, F + 6, 1, 1, 7, 0xd9cdb5, 'brick');
  b.add(6, 31, F + 6, 1, 1, 6, 0xd9cdb5, 'brick');

  // [assumed] the dining table and four chairs, in the south-east corner (not examined in any photograph)
  b.newGroup();
  for (const [x, z] of [[21, 43], [25, 43], [21, 46], [25, 46]]) b.column(x, z, F, F + 6, CHROME, 'bar');
  b.box(21, 43, 26, 47, F + 6, F + 7, { kind: 'plate', color: 0x2c2a28 });
  for (const [x, z] of [[19, 44], [27, 44], [23, 41], [23, 48]]) b.add(x, z, F, 1, 1, 4, BLACK_LEATHER, 'brick');

  // [documented] the bathroom inside the cylinder: a WC and a basin [assumed: place]
  b.newGroup();
  b.add(CYL.x - 2, CYL.z + 2, F, 1, 2, 3, C.white, 'brick');
  b.add(CYL.x - 2, CYL.z - 3, F, 2, 1, 6, C.white, 'brick');
  // [documented] the fire in the fireplace on the cylinder's outer face
  b.newGroup();
  b.add(FIREPLACE[0], FIREPLACE[1], F, 1, FIREPLACE[3] - FIREPLACE[1], 1, C.fire, 'light');

  buildBrickHouseInterior(b);
}

/**
 * The Brick House's 1953 interior [scaled: ArchDaily's plan]: the reading room at the north end, the corridor along the west
 * front from the door, the bathroom, and the bedroom with its freestanding plaster canopy under low vaults ("ten by thirty
 * feet" [documented], here 10 × 24 to fit the room [assumed]).
 */
function buildBrickHouseInterior(b: Builder) {
  const F = 0, [x0, z0, x1, z1] = BRICK, top = Y.BRICK_CEILING;
  // [scaled] the partitions, white plaster to the ceiling, each with a doorway [assumed]
  b.newGroup();
  b.box(x0 + 1, z0 + 15, x1 - 1, z0 + 16, F, top, { kind: 'brick', color: PLASTER, mask: (x, _z, y) => !(x >= x0 + 2 && x < x0 + 5 && y < 18) });
  b.box(x0 + 5, z0 + 16, x0 + 6, z1 - 1, F, top, { kind: 'brick', color: PLASTER, mask: (_x, z, y) => !(((z >= z0 + 19 && z < z0 + 22) || (z >= z0 + 35 && z < z0 + 38)) && y < 18) });
  b.box(x0 + 6, z0 + 24, x1 - 1, z0 + 25, F, top, { kind: 'brick', color: PLASTER });
  // [documented] the bedroom's plaster canopy: slender columns, and low vaults stepping up to the middle [scaled]
  b.newGroup();
  const cx0 = x0 + 7, cx1 = x0 + 17, cz0 = z0 + 26, cz1 = z0 + 50;
  for (const x of [cx0, cx1 - 1]) for (const z of [cz0, (cz0 + cz1) >> 1, cz1 - 1]) b.column(x, z, F, F + 15, PLASTER, 'bar');
  b.box(cx0, cz0, cx1, cz1, F + 15, F + 16, { kind: 'plate', color: PLASTER });
  b.box(cx0 + 2, cz0 + 1, cx1 - 2, cz1 - 1, F + 16, F + 17, { kind: 'plate', color: PLASTER });
  b.box(cx0 + 4, cz0 + 2, cx1 - 4, cz1 - 2, F + 17, F + 18, { kind: 'plate', color: PLASTER });
  // [assumed] the bed under the canopy
  b.newGroup();
  b.box(cx0 + 2, z0 + 35, cx1 - 2, z0 + 42, F, F + 2, { kind: 'plate', color: 0x6b4a32 });
  b.box(cx0 + 2, z0 + 35, cx1 - 2, z0 + 42, F + 2, F + 3, { kind: 'plate', color: LINEN });
  // [documented] the reading room: bookshelves along its north wall [assumed], two chairs and a table [assumed]
  b.newGroup();
  b.box(x0 + 2, z0 + 1, x1 - 2, z0 + 3, F, F + 15, { kind: 'brick', color: WALNUT });
  for (const x of [x0 + 4, x0 + 11]) { b.add(x, z0 + 7, F, 3, 3, 2, TAN_LEATHER, 'brick'); b.add(x, z0 + 9, F + 2, 3, 1, 4, TAN_LEATHER, 'brick'); }
  b.add(x0 + 8, z0 + 7, F, 2, 2, 4, WALNUT, 'brick');
  // [assumed] the bathroom's basin and bath
  b.newGroup();
  b.add(x1 - 6, z0 + 16, F, 5, 3, 4, C.white, 'brick');
  b.add(x0 + 8, z0 + 16, F, 2, 1, 6, C.white, 'brick');
}

/** [documented] the six spotlights over the kitchen, hung with the roof (the Brick House stays dark at dusk: spec 073) */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (let i = 0; i < 6; i++) b.add(KITCHEN[0] + 1 + i * 2, KITCHEN[1] + 1, Y.CEILING - 1, 1, 1, 1, C.warmLight, 'light');
  });
}

/**
 * The Villa Savoye's rooms (spec 074), as the CMN shows them today (Q4): the partitions in their colours and only the fitted
 * pieces (spec 074, Out of scope: no loose furniture). Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { FIRST_DOORS, FIRST_PARTS, GROUND_DOORS, GROUND_PARTS, inRect, STORAGE_PARTS, Y } from './layout';

/** [documented: the living room's walls light blue, pink and white] */
export const LIGHT_BLUE = 0xa9c4d6;
export const PINK = 0xe4b4a6;
const WHITE = 0xf2f0e9, TILE = 0xf6f5f0, METAL = 0x9fa4a6, BATH_BLUE = 0x2f6aa8, DARK_TILE = 0x3a3d40, WOOD = 0xb08a5c;
const PART_COLOR = { white: 0xeeece4, blue: LIGHT_BLUE, pink: PINK, tile: TILE };
const DOOR_H = 18;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // the ground floor's partitions: the hall, the maids' rooms, the laundry, the chauffeur's flat, the garage [documented: the
  // rooms; their walls assumed white]
  b.newGroup();
  for (const r of GROUND_PARTS)
    b.box(r[0], r[1], r[2], r[3], 0, Y.SLAB, { kind: 'brick', color: 0xe9e7df, mask: (x, z, y) => !(y < DOOR_H && GROUND_DOORS.some((d) => inRect(x, z, d))) });
  // [assumed: photographs] the washbasin standing free in the hall, by the entrance
  b.newGroup();
  b.add(21, 41, 0, 1, 1, 6, WHITE, 'round');
  b.add(20, 41, 6, 3, 2, 2, WHITE, 'brick');
  // [assumed] the laundry's tubs and the maids' basins
  b.newGroup();
  b.box(55, 17, 61, 19, 0, 7, { kind: 'brick', color: TILE });
  b.add(34, 17, 0, 2, 1, 7, WHITE, 'brick');
  b.add(45, 17, 0, 2, 1, 7, WHITE, 'brick');
  // [assumed] the WC and store at the south-east end
  b.newGroup();
  b.add(70, 17, 0, 1, 2, 4, WHITE, 'brick');
  b.box(64, 23, 72, 26, 0, 15, { kind: 'brick', color: WOOD });

  // the first floor's partitions [assumed places], the living room's in light blue and pink [documented], the kitchen's tiled
  // white [documented]
  b.newGroup();
  for (const p of FIRST_PARTS)
    b.box(p.r[0], p.r[1], p.r[2], p.r[3], Y.FIRST, Y.CEILING, {
      kind: 'brick', color: PART_COLOR[p.c], mask: (x, z, y) => !(y < Y.FIRST + DOOR_H && FIRST_DOORS.some((d) => inRect(x, z, d))),
    });
  // [documented: built-in storage at head height that also forms the partitions between the bedrooms] cupboards in pale wood
  // up to head height, open above
  b.newGroup();
  for (const r of STORAGE_PARTS)
    b.box(r[0], r[1], r[2], r[3], Y.FIRST, Y.FIRST + 17, { kind: 'brick', color: WOOD, mask: (x, z, y) => !(FIRST_DOORS.some((d) => inRect(x, z, d)) && y < Y.FIRST + DOOR_H) });
  b.newGroup();
  b.box(26, 1, 37, 3, Y.FIRST, Y.FIRST + 17, { kind: 'brick', color: WOOD });
  b.box(48, 1, 61, 3, Y.FIRST, Y.FIRST + 17, { kind: 'brick', color: WOOD });
  // [documented: the kitchen tiled in white, with metal-fronted cupboards] white tiled counters along the walls, the cupboards
  b.newGroup();
  b.box(1, 1, 15, 3, Y.FIRST, Y.FIRST + 8, { kind: 'brick', color: TILE });
  b.box(1, 3, 3, 12, Y.FIRST, Y.FIRST + 8, { kind: 'brick', color: TILE });
  b.newGroup();
  b.box(1, 12, 3, 18, Y.FIRST, Y.FIRST + 18, { kind: 'brick', color: METAL });
  b.box(1, 1, 15, 2, Y.FIRST + 8, Y.FIRST + 9, { kind: 'tile', color: METAL });
  // [assumed] the pantry's shelves
  b.newGroup();
  b.box(17, 1, 24, 2, Y.FIRST, Y.FIRST + 18, { kind: 'brick', color: WOOD });
  // [documented: the blue ceramic bathtub in the main bathroom] the bath, sunk in blue tiles; [assumed: photographs] the tiled
  // chaise beside it, the basin
  b.newGroup();
  b.box(64, 8, 71, 12, Y.FIRST, Y.FIRST + 3, { kind: 'brick', color: BATH_BLUE });
  b.box(64, 12, 68, 16, Y.FIRST, Y.FIRST + 4, { kind: 'brick', color: DARK_TILE });
  b.box(64, 15, 68, 16, Y.FIRST + 4, Y.FIRST + 7, { kind: 'brick', color: DARK_TILE });
  b.add(70, 2, Y.FIRST, 1, 2, 8, WHITE, 'brick');
  // [assumed] the other bathroom: a bath and a basin
  b.newGroup();
  b.box(40, 1, 46, 4, Y.FIRST, Y.FIRST + 4, { kind: 'brick', color: WHITE });
  b.add(45, 14, Y.FIRST, 1, 2, 8, WHITE, 'brick');
  // [assumed: photographs] the living room's fireplace against the pink wall, its flue to the ceiling
  b.newGroup();
  b.box(25, 38, 29, 40, Y.FIRST, Y.FIRST + 6, { kind: 'brick', color: 0x4a4c4e });
  b.box(26, 38, 28, 39, Y.FIRST + 6, Y.CEILING, { kind: 'brick', color: 0x4a4c4e });
}

/** [assumed] ceiling lights in the rooms, hung with the roof; the hall's from the first floor's slab */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[10, 48], [28, 52], [12, 30], [8, 10], [32, 10], [54, 10], [66, 28], [40, 23]]) b.add(x, z, Y.CEILING - 1, 1, 1, 1, C.warmLight, 'light');
  });
  b.hanging(P.INTERIOR, () => {
    for (const [x, z] of [[30, 22], [28, 38], [44, 38], [40, 21], [50, 44]]) b.add(x, z, Y.SLAB - 1, 1, 1, 1, C.warmLight, 'light');
  });
}

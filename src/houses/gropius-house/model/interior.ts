/**
 * The Gropius House's rooms (spec 078), as block stand-ins; product names in the code only. No plan with dimensions was found
 * (spec 078 Q4), so where each partition stands is [assumed], placed from the NHL nomination's descriptions of the rooms and the
 * HABS photographs (MA-1228, nos. 27–42); only the living and dining rooms' sizes are [documented]. What the pieces are is
 * [documented] by the nomination and Wikipedia.
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { glassBlock } from './house';
import { FIREPLACE, PARTITION_X, PARTITION_Z, Rect, Y } from './layout';

export const PLASTER = 0xf3f1ea;
const CHROME = 0xc9ccd0;
const BLACK = 0x2a2a2c;
const IVORY = 0xeee6d2;
const WALNUT = 0x6b4a32;
const OAK_WOOD = 0xb08a5c;
const LINEN = 0xe9e4d6;
const FABRIC = [0x8a8579, 0x5f6a6e, 0xb4a48a]; // [assumed: muted, from the HABS photographs in black and white]
const CURTAIN = 0xd8cfbd;
const ENAMEL = 0xf4f4f0; // the kitchen's white-glazed metal cabinets [documented]
/** the master suite's plate-glass partition [documented] */
export const PLATE_GLASS = 0xd3e6e8;

/** a partition, cells along x at z (or along z at x), from y0 to y1, with openings [a, b) below `below` */
function wall(b: Builder, r: Rect, y0: number, y1: number, open: [number, number][] = [], below = y0 + Y.DOOR) {
  const alongX = r[2] - r[0] > 1;
  b.box(r[0], r[1], r[2], r[3], y0, y1, {
    kind: 'brick', color: PLASTER,
    mask: (x, z, y) => !open.some(([a, c]) => (alongX ? x : z) >= a && (alongX ? x : z) < c && y < below),
  });
}

/** the ground floor's partitions [assumed], each with its doorways */
export const GF_WALLS: { r: Rect; open: [number, number][] }[] = [
  { r: [15, 1, 16, 10], open: [] }, // the living room | the study, the bookshelves' wall
  { r: [28, 1, 29, 21], open: [[2, 5], [15, 18]] }, // the study and the dining room | the hall
  { r: [38, 1, 39, 21], open: [[4, 6], [12, 15]] }, // the hall | the service rooms
  { r: [39, 9, 54, 10], open: [[46, 48]] }, // the maid's rooms | the back hall, the pantry and the kitchen
  { r: [44, 1, 45, 21], open: [[15, 17]] }, // the maid's bath | the maid's room; the back hall | the pantry
  { r: [48, 10, 49, 21], open: [[12, 14]] }, // the pantry | the kitchen
];
/** the upper floor's partitions [assumed] */
export const UP_WALLS: { r: Rect; open: [number, number][] }[] = [
  { r: [28, 1, 29, 21], open: [[9, 11]] }, // Ati's room | the upper hall
  { r: [29, 14, 42, 15], open: [[30, 32]] }, // the upper hall | the guest room
  { r: [38, 1, 39, 8], open: [[3, 5]] }, // the upper hall | the bathroom
  { r: [39, 7, 42, 8], open: [] }, // the bathroom | the linen alcove
  { r: [42, 1, 43, 14], open: [[9, 11]] }, // the linen alcove | the dressing room
  { r: [41, 15, 42, 28], open: [] }, // the guest room | the master bedroom
  { r: [42, 14, 44, 15], open: [] }, // the master suite's partition, west of the glass
];
/** the master suite's plate glass, "4½ × 9½ ft" [documented], between the bedroom and the dressing room */
export const MASTER_GLASS: Rect = [44, 14, 54, 15];

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = 0, U = Y.UP;

  // ---------- the ground floor ----------
  // [assumed] the partitions, plaster to the upper floor's frame
  b.newGroup();
  for (const w of GF_WALLS) wall(b, w.r, F, Y.GF_CEIL, w.open);
  // [documented] the study's glass-block partition to the dining room, "slightly angled", curving out: one block a stud
  b.newGroup();
  for (let x = PARTITION_X[0]; x < PARTITION_X[1]; x++) for (let y = F; y < Y.GF_CEIL; y += 3) b.add(x, PARTITION_Z(x), y, 1, 1, 3, glassBlock(x, y), 'light');
  // [documented] the living room: bookshelves over a daybed on its north wall
  b.newGroup();
  for (const x of [3, 12]) b.box(x, 1, x + 1, 2, F, 12, { kind: 'brick', color: WALNUT });
  b.box(4, 1, 12, 2, 6, 12, { kind: 'brick', unit: 2, color: (_x, y) => (y % 2 ? WALNUT : 0x9a7a52) });
  b.box(4, 2, 12, 5, F, F + 3, { kind: 'brick', color: FABRIC[0] });
  // [documented] the mantel-less fireplace in the chimney, the fire in it
  b.newGroup();
  b.add(FIREPLACE[0], FIREPLACE[1], F, 1, FIREPLACE[3] - FIREPLACE[1], 1, C.fire, 'light');
  // [documented] the divans and the sofa; [assumed] facing the fire across a low table
  b.newGroup();
  b.box(10, 11, 13, 17, F, F + 3, { kind: 'brick', color: FABRIC[1] });
  b.box(12, 11, 13, 17, F + 3, F + 5, { kind: 'brick', color: FABRIC[1] });
  b.box(4, 13, 10, 15, F, F + 3, { kind: 'brick', color: FABRIC[2] });
  b.box(5, 6, 8, 9, F, F + 2, { kind: 'plate', color: BLACK });
  // [documented] Breuer's chaise by the west window [assumed: where]
  b.newGroup();
  b.add(3, 16, F, 2, 4, 2, 0x9c7b56, 'brick');
  b.add(3, 16, F + 2, 2, 1, 3, 0x9c7b56, 'brick');
  // [documented] the curtain line between the living and dining rooms, drawn back: a fixed panel [assumed: where it hangs]
  b.newGroup();
  b.box(15, 18, 16, 21, F, Y.GF_CEIL, { kind: 'tile', color: CURTAIN });
  // [documented] the dining room: the round ivory-topped table and its tubular-steel chairs [documented: Wikipedia]
  b.newGroup();
  b.column(21, 15, F, F + 6, CHROME, 'bar');
  b.add(19, 13, F + 6, 4, 4, 1, IVORY, 'plate');
  for (const [x, z] of [[21, 11], [21, 19], [17, 15], [25, 15]]) { b.add(x, z, F, 1, 1, 4, CHROME, 'bar'); b.add(x, z, F + 4, 1, 1, 1, BLACK, 'plate'); }
  // [documented] the chrome-legged buffet on the curved wall
  b.newGroup();
  for (const x of [17, 24]) b.column(x, 11, F, F + 3, CHROME, 'bar');
  b.box(17, 11, 25, 12, F + 3, F + 7, { kind: 'brick', color: WALNUT, mask: (x) => PARTITION_Z(x) < 11 });
  // [documented] the study: Breuer's double desk on the north wall, a chair either side [assumed]
  b.newGroup();
  for (const x of [18, 25]) b.box(x, 1, x + 1, 4, F, F + 6, { kind: 'brick', color: OAK_WOOD });
  b.box(18, 1, 26, 4, F + 6, F + 7, { kind: 'plate', color: OAK_WOOD });
  for (const x of [20, 23]) { b.add(x, 5, F, 2, 2, 3, BLACK, 'brick'); b.add(x, 6, F + 3, 2, 1, 3, BLACK, 'brick'); }
  // [documented] the hall's open coat closet: a rail on chrome posts by the door [assumed: where]
  b.newGroup();
  for (const z of [3, 6]) b.column(30, z, F, F + 15, CHROME, 'bar');
  b.box(30, 3, 31, 7, F + 15, F + 16, { kind: 'plate', color: CHROME });
  // [documented] the kitchen and pantry: white-glazed metal cabinets [documented], along their walls [assumed]
  b.newGroup();
  b.box(49, 18, 54, 21, F, F + 9, { kind: 'brick', color: ENAMEL });
  b.box(52, 10, 54, 18, F, F + 9, { kind: 'brick', color: ENAMEL });
  b.box(45, 18, 48, 21, F, F + 15, { kind: 'brick', color: ENAMEL });
  // [documented] the maid's room and bath in the north-east: a bed, a basin, a WC [assumed: where]
  b.newGroup();
  b.box(48, 1, 54, 4, F, F + 3, { kind: 'plate', color: LINEN });
  b.add(40, 1, F, 2, 1, 7, C.white, 'brick');
  b.add(42, 1, F, 1, 2, 3, C.white, 'brick');
  // [assumed] the lavatory off the back hall
  b.add(42, 19, F, 1, 2, 3, C.white, 'brick');
  // [assumed] the ceiling lamps downstairs, hung from the upper floor's frame
  b.newGroup();
  for (const [x, z] of [[8, 11], [21, 15], [22, 5], [32, 10], [51, 14]]) b.add(x, z, Y.GF_CEIL - 1, 1, 1, 1, C.warmLight, 'light');

  // ---------- the upper floor ----------
  // [assumed] the partitions, plaster to the roof
  b.newGroup();
  for (const w of UP_WALLS) wall(b, w.r, U, Y.ROOF, w.open, U + Y.DOOR);
  // [documented] the master suite's plate-glass partition, about 4½ ft high [documented], plaster above it [assumed]
  b.newGroup();
  b.box(MASTER_GLASS[0], MASTER_GLASS[1], MASTER_GLASS[2], MASTER_GLASS[3], U, U + 11, { kind: 'glass', unit: 11, color: PLATE_GLASS });
  b.box(MASTER_GLASS[0], MASTER_GLASS[1], MASTER_GLASS[2], MASTER_GLASS[3], U + 11, Y.ROOF, { kind: 'brick', color: PLASTER });
  // [documented] the master bedroom: the bed [assumed: where]; the dressing room's dressing table [documented]
  b.newGroup();
  b.box(46, 21, 51, 27, U, U + 2, { kind: 'plate', color: WALNUT });
  b.box(46, 21, 51, 27, U + 2, U + 3, { kind: 'plate', color: LINEN });
  b.box(44, 1, 49, 3, U, U + 7, { kind: 'brick', color: OAK_WOOD });
  b.add(46, 1, U + 7, 2, 1, 6, 0xc6d2d4, 'tile');
  // [documented] the guest room: two beds head to foot along the south wall, and a desk
  b.newGroup();
  for (const x0 of [29, 35]) { b.box(x0, 24, x0 + 6, 27, U, U + 2, { kind: 'plate', color: WALNUT }); b.box(x0, 24, x0 + 6, 27, U + 2, U + 3, { kind: 'plate', color: LINEN }); }
  b.box(36, 15, 40, 17, U, U + 7, { kind: 'brick', color: OAK_WOOD, mask: (x) => x === 36 || x === 39 });
  b.box(36, 15, 40, 17, U + 7, U + 8, { kind: 'plate', color: OAK_WOOD });
  // [documented] Ati's room: the sleeping alcove on its north side behind a curtain [documented], its bed and her desk [assumed]
  b.newGroup();
  b.box(16, 1, 22, 4, U, U + 2, { kind: 'plate', color: WALNUT });
  b.box(16, 1, 22, 4, U + 2, U + 3, { kind: 'plate', color: LINEN });
  b.box(15, 5, 23, 6, U, Y.ROOF, { kind: 'tile', color: CURTAIN, mask: (x) => x < 19 });
  b.box(22, 18, 27, 20, U, U + 7, { kind: 'brick', color: OAK_WOOD, mask: (x) => x === 22 || x === 26 });
  b.box(22, 18, 27, 20, U + 7, U + 8, { kind: 'plate', color: OAK_WOOD });
  // [documented] the bathrooms, stacked; [assumed] a basin and a tub
  b.newGroup();
  b.add(39, 1, U, 3, 2, 5, C.white, 'brick');
  b.add(40, 5, U, 1, 2, 3, C.white, 'brick');
  // [documented] the linen and sewing alcove: shelves [assumed]
  b.newGroup();
  b.box(39, 8, 42, 10, U, U + 15, { kind: 'brick', color: OAK_WOOD });
}

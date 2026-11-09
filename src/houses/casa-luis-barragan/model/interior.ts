/**
 * Casa Luis Barragán's interior (spec 035 Q2): the rooms the nomination's plans name (pp. 63–67), with Barragán's own furniture
 * as block approximations, read from the nomination's photographs; and the library's stair of timber treads cantilevered from
 * the wall, with no rail. Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { WHITE } from './house';
import { LIBRARY, Rect, Y } from './layout';

const PINE = 0x9a6a3c; // Barragán's furniture: plain pine and leather [documented: photographs]
const DARK = 0x4a3526;
const LEATHER = 0x6b4a32;
const LINEN = 0xe8e1d0;
const WOOL = 0xb7ab92;

/** the library's stair: treads fixed only to the wall at x = 47, climbing toward the door above [documented: photographs] */
export const STAIR_TREADS: Rect[] = Array.from({ length: 8 }, (_, i) => [LIBRARY[0] + 1, 137 - 2 * i, LIBRARY[0] + 4, 139 - 2 * i] as Rect);
export const treadTop = (i: number) => Y.GROUND + 3 * (i + 1);

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = Y.GROUND, U = Y.FIRST;
  // [documented: photographs] the library's stair: timber treads cantilevered from the wall, no rail, nothing under them
  b.newGroup();
  STAIR_TREADS.forEach((r, i) => b.box(r[0], r[1], r[2], r[3], treadTop(i) - 1, treadTop(i), { kind: 'plate', color: PINE }));
  // [documented: photographs] the library's shelves along its east wall, and its desk and chairs
  b.newGroup();
  b.box(68, 117, 69, 139, F, F + 30, { kind: 'brick', color: DARK });
  b.box(57, 126, 63, 129, F, F + 7, { kind: 'brick', color: PINE });
  for (const z of [125, 130]) b.add(59, z, F, 2, 1, 4, LEATHER, 'brick');
  // [documented: photographs] the living room: the sofa and armchairs facing the great window, a low table between
  b.newGroup();
  b.box(52, 106, 64, 109, F, F + 3, { kind: 'brick', color: WOOL });
  b.box(52, 108, 64, 109, F + 3, F + 7, { kind: 'brick', color: WOOL });
  for (const x of [50, 64]) b.box(x, 99, x + 3, 102, F, F + 3, { kind: 'brick', color: LEATHER });
  b.box(55, 100, 61, 103, F, F + 2, { kind: 'plate', color: DARK });
  // [documented: p. 63, "dining room"; photographs] the long dining table and its chairs
  b.newGroup();
  for (const [x, z] of [[33, 95], [43, 95], [33, 99], [43, 99]]) b.add(x, z, F, 1, 1, 6, DARK, 'bar');
  b.add(33, 95, F + 6, 11, 5, 1, PINE, 'plate');
  for (const x of [34, 37, 40]) for (const z of [93, 101]) b.add(x, z, F, 1, 1, 4, PINE, 'brick');
  // [documented: p. 63, "breakfast room"] its small table
  b.newGroup();
  b.box(23, 96, 27, 99, F, F + 6, { kind: 'brick', color: PINE });
  // [documented: p. 63, "kitchen"] counters along the kitchen's walls
  b.newGroup();
  b.box(5, 89, 19, 91, F, F + 7, { kind: 'brick', color: WHITE });
  // [documented: p. 16, the hall's chair and table at the foot of the stair] and the hall's stair up to the first floor
  b.newGroup();
  b.add(36, 112, F, 2, 2, 4, PINE, 'brick');
  b.box(37, 116, 40, 118, F, F + 6, { kind: 'brick', color: DARK });
  b.newGroup();
  for (let i = 0; i < 8; i++) b.box(17 + i, 109, 18 + i, 112, F, F + 3 * (i + 1), { kind: 'brick', color: 0x4c4945 });
  // [documented: p. 63, "studio"] the drafting tables and a long shelf
  b.newGroup();
  for (const x of [76, 88]) b.box(x, 96, x + 7, 100, F, F + 8, { kind: 'brick', color: PINE });
  b.box(104, 90, 105, 110, F, F + 20, { kind: 'brick', color: DARK });
  // [documented: p. 65, the bedrooms] beds: Barragán's narrow bed, the guest room's
  b.newGroup();
  for (const [x, z, w] of [[8, 92, 4], [31, 92, 6], [8, 129, 5]] as [number, number, number][]) {
    b.box(x, z, x + w, z + 7, U, U + 2, { kind: 'plate', color: PINE });
    b.box(x, z, x + w, z + 7, U + 2, U + 3, { kind: 'plate', color: LINEN });
  }
}

/** [assumed] lamps hung in the main rooms, with the roof */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[58, 100], [58, 128], [88, 100]]) b.add(x, z, Y.ROOF - 6, 2, 1, 1, C.warmLight, 'light');
    for (const [x, z] of [[38, 97], [12, 97]]) b.add(x, z, Y.FIRST - 4, 2, 1, 1, C.warmLight, 'light');
  });
}

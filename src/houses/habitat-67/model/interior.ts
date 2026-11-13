/**
 * Habitat 67's interior (spec 072): one sample dwelling of two boxes on the 10th floor, furnished with blocky stand-ins for its
 * documented fittings, and the lift cabs in the three cores. With 146 dwellings, every other box stays empty. Each piece says
 * [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { BASE_TOP, CORES, DWELLING, levelY } from './layout';

/** wooden strip floors [documented] */
const OAK = [0xb08458, 0xa77b50];
/** the moulded fibreglass bathroom [documented: fibreglass bathrooms] */
const FIBREGLASS = 0xeceae4;
/** the modular kitchen, with Formica doors [documented]; their colour [assumed] */
const FORMICA = 0xe58a3a;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const [A, B] = DWELLING;
  const y = levelY(A.l) + 1;
  // [documented] wooden strip floors through both boxes, in strips along the box
  b.newGroup();
  for (const bx of DWELLING) {
    const [x0, z0, x1, z1] = bx.r;
    b.box(x0 + 1, z0 + 1, x1 - 1, z1 - 1, y, y + 1, { kind: 'tile', sizes: [[8, 2], [4, 2], [2, 2], [2, 1], [1, 1]], color: (_x, _y, z) => OAK[z & 1] });
  }
  const f = y + 1;
  // [documented] the moulded bathroom: one fibreglass pod in the first box's corner [assumed: where]
  b.newGroup();
  b.box(A.x + 2, A.z + 2, A.x + 10, A.z + 9, f, f + 18, { kind: 'brick', unit: 9, sizes: [[8, 7], [8, 4], [4, 4], [2, 2], [1, 1]], color: FIBREGLASS });
  // [documented] the modular kitchen: a run of units with Formica doors along the long wall [assumed: its layout]
  b.newGroup();
  b.box(A.x + 21, A.z + 14, A.x + 36, A.z + 17, f, f + 7, { kind: 'brick', unit: 7, sizes: [[6, 3], [3, 3], [2, 2], [1, 1]], color: FORMICA });
  b.box(A.x + 21, A.z + 14, A.x + 36, A.z + 17, f + 7, f + 8, { kind: 'tile', sizes: [[6, 3], [3, 3], [1, 1]], color: 0xf1efe8 });
  // [assumed] a dining table and four chairs
  b.newGroup();
  for (const [dx, dz] of [[16, 5], [22, 5], [16, 9], [22, 9]]) b.add(A.x + dx, A.z + dz, f, 1, 1, 6, 0x4a3b2e, 'bar');
  b.box(A.x + 16, A.z + 5, A.x + 23, A.z + 10, f + 6, f + 7, { kind: 'tile', color: 0x6b4f3a });
  for (const [dx, dz] of [[18, 3], [21, 3], [18, 11], [21, 11]]) b.add(A.x + dx, A.z + dz, f, 1, 1, 4, 0x2f3133, 'brick');
  // [assumed] the living room in the second box: a sofa and a low table before the window wall
  b.newGroup();
  b.box(B.x + 4, B.z + 11, B.x + 16, B.z + 15, f, f + 3, { kind: 'brick', unit: 3, color: 0x7d8a77 });
  b.box(B.x + 4, B.z + 15, B.x + 16, B.z + 16, f, f + 7, { kind: 'brick', unit: 7, color: 0x7d8a77 });
  b.box(B.x + 7, B.z + 6, B.x + 13, B.z + 9, f, f + 3, { kind: 'brick', unit: 3, color: 0x6b4f3a });
  // [assumed] a bed at the far end
  b.newGroup();
  b.box(B.x + 24, B.z + 4, B.x + 34, B.z + 12, f, f + 3, { kind: 'brick', unit: 3, sizes: [[8, 5], [5, 5], [4, 4], [2, 2], [1, 1]], color: 0x8a6a4a });
  b.box(B.x + 24, B.z + 4, B.x + 34, B.z + 12, f + 3, f + 4, { kind: 'plate', color: 0xeeeae0 });
  // [documented: three lifts] a cab at the foot of each core
  b.newGroup();
  for (const c of CORES) b.box(c[0] + 4, c[1] + 6, c[0] + 12, c[1] + 13, BASE_TOP, BASE_TOP + 20, { kind: 'brick', unit: 10, sizes: [[8, 7], [4, 4], [2, 2], [1, 1]], color: 0x9aa0a4 });
}

/** [assumed] lights over the dwelling's rooms, with the roof */
export function buildLights(b: Builder) {
  const [A, B] = DWELLING;
  const y = levelY(A.l + 1) - 2;
  b.hanging(P.ROOF, () => {
    b.add(A.x + 19, A.z + 7, y, 2, 2, 1, C.warmLight, 'light');
    b.add(B.x + 10, B.z + 8, y, 2, 2, 1, C.warmLight, 'light');
  });
}

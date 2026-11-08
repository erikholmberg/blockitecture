import { BIG_SIZES, C } from '@/engine/catalog';
import { P } from '@/houses/stahl-house/phases';
import { Builder } from '@/engine/voxel';
import { inPool, POOL_INLETS, POOL_MAIN, Y } from '@/houses/stahl-house/model/layout';

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const isLining = (x: number, z: number) =>
  inPool(x, z) && N4.some(([dx, dz]) => !inPool(x + dx, z + dz));
const isCoping = (x: number, z: number) =>
  !inPool(x, z) && [...N4, [1, 1], [1, -1], [-1, 1], [-1, -1]].some(([dx, dz]) => inPool(x + dx, z + dz));

const BX0 = POOL_MAIN[0] - 1, BZ0 = POOL_MAIN[1] - 1, BX1 = POOL_MAIN[2] + 1, BZ1 = 29;

/** Pool basin: tiled floor, lining walls, white coping, stepping slabs (foundation phase). */
export function buildPoolBasin(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.box(BX0, BZ0, BX1, BZ1, Y.POOL_BOTTOM, Y.POOL_BOTTOM + 1, {
    kind: 'plate',
    mask: (x, z) => inPool(x, z),
    color: (x, _y, z) => (x === 42 && z > 4 && z < 20 ? C.darkBlue : C.poolDeep),
  });
  b.box(BX0, BZ0, BX1, BZ1, Y.POOL_BOTTOM + 1, 0, {
    kind: 'brick',
    mask: (x, z) => isLining(x, z),
    color: C.poolTile,
    studs: false,
  });
  // coping
  b.box(BX0, BZ0, BX1, BZ1, 0, 1, { kind: 'plate', mask: isCoping, color: C.concreteDark });
  b.box(BX0, BZ0, BX1, BZ1, 1, 2, { kind: 'tile', mask: isCoping, color: C.white });
  // concrete slabs spanning the inlets – the entrance path
  for (const r of POOL_INLETS) {
    b.add(r[0], 24, 0, r[2] - r[0], 3, 1, C.concreteDark, 'plate', { force: true });
    b.add(r[0], 24, 1, r[2] - r[0], 3, 1, C.concrete, 'tile', { force: true });
  }
}

/** Water goes in at the very end. */
export function buildPoolWater(b: Builder) {
  b.newGroup();
  // a single surface layer reads as clear water; the tiled basin shows through
  b.box(BX0, BZ0, BX1, BZ1, -2, -1, {
    kind: 'water',
    unit: 1,
    sizes: BIG_SIZES,
    mask: (x, z) => inPool(x, z) && !isLining(x, z),
    color: C.water,
  });
}

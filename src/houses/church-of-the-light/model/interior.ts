/**
 * The Church of the Light's interior (spec 055): the pews of stained scaffold boards stepping down toward the cross, and the few
 * pieces at the altar. Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { CROSSING, DIAG, diagZ, floorTop, INSIDE, rowX0, ROWS, Y } from './layout';
import { DARK_WOOD } from './house';

const BOARD = 0x3a312b;

/** where a row's benches end: at the long wall, or short of the 15° wall where it cuts in [documented: the rows get shorter] */
function rowEnd(x0: number): number {
  if (x0 + 2 < DIAG.x0 || x0 > CROSSING.x) return INSIDE[3] - 1;
  return Math.min(INSIDE[3] - 1, Math.floor(diagZ(x0 + 2)) - 1);
}

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // [documented: 12 rows at 900 mm, each on its own step, two benches end to end with no aisle, of reused scaffold boards]
  // a back of boards and a seat a stud in front of it, facing the cross
  for (let k = 0; k < ROWS; k++) {
    const x0 = rowX0(k), y = floorTop(x0), z0 = INSIDE[1] + 1, z1 = rowEnd(x0);
    if (z1 - z0 < 4) continue;
    const mid = Math.round((z0 + z1) / 2);
    for (const [a, c] of [[z0, mid], [mid, z1]]) {
      b.newGroup();
      b.box(x0 + 1, a, x0 + 2, c, y, y + 3, { kind: 'brick', color: DARK_WOOD });
      b.box(x0, a, x0 + 1, c, y, y + 7, { kind: 'brick', color: BOARD });
    }
  }
  // [assumed: photographs] the lectern, a plain dark box beside the cross
  b.newGroup();
  b.box(53, 14, 55, 16, Y.ALTAR, Y.ALTAR + 9, { kind: 'brick', color: DARK_WOOD });
  // [assumed: photographs] the communion table, low and dark, before the cross
  b.newGroup();
  b.box(52, 6, 55, 9, Y.ALTAR, Y.ALTAR + 6, { kind: 'brick', color: DARK_WOOD, mask: (x, z) => x === 52 || x === 54 || z === 6 || z === 8 });
  b.box(52, 6, 55, 9, Y.ALTAR + 6, Y.ALTAR + 7, { kind: 'tile', color: DARK_WOOD });
  // [assumed] a bench for the minister against the street-side wall
  b.newGroup();
  b.box(51, INSIDE[1], 56, INSIDE[1] + 1, Y.ALTAR, Y.ALTAR + 3, { kind: 'brick', color: BOARD });
  // [documented: a plain room] nothing on the walls: the cross is the only image
}

/** [assumed] small lights under the ceiling, with the roof */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const x of [8, 24, 40]) for (const z of [5, 9]) b.add(x, z, Y.CEILING - 1, 1, 1, 1, C.warmLight, 'light');
  });
}

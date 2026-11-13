/**
 * The Barcelona Pavilion's interior (spec 075): what stands free inside the open frame before the walls go up. The golden onyx
 * wall, the black carpet before it, the Barcelona chairs and stools in white leather on chrome frames, and the glass-topped
 * table. The chairs are blocky stand-ins, not their real curves (spec: out of scope). Each piece says [documented] or [assumed].
 */
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { CHROME, STONES } from './house';
import { ONYX, Rect, Y } from './layout';

/** [documented: a black carpet under the chairs] before the onyx wall [scaled: photographs], about 6 × 3.4 m [assumed] */
export const CARPET: Rect = [ONYX[0] + 1, ONYX[1] - 12, ONYX[2] - 1, ONYX[1] - 1];
/** [documented: white leather] [assumed: a warm white] */
const LEATHER = 0xf1ece2;
const BLACK = 0x1c1d1f;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // [documented: golden onyx from the Atlas, 3.10 m high, panels 2.35 × 1.55 m, two high]; panels drawn 7½ studs by 12½ plates
  b.newGroup();
  const [x0, z0, x1, z1] = ONYX;
  b.box(x0, z0, x1, z1, 0, Y.CEILING, {
    kind: 'brick', color: (x, y) => STONES.onyx[(Math.floor((x - x0) / 7.5) + (y < 12 ? 0 : 1)) % 3],
  });
  // [documented: the black carpet]
  b.newGroup();
  b.box(CARPET[0], CARPET[1], CARPET[2], CARPET[3], 0, 1, { kind: 'tile', color: BLACK });
  // [documented: two Barcelona chairs before the onyx, in white leather on chrome; WikiArquitectura: four chairs inside]
  // [assumed: where they stand on the carpet, facing out toward the front glass, their backs to the onyx]
  const back = CARPET[3] - 1;
  for (const x of [CARPET[0] + 4, CARPET[2] - 6]) {
    b.newGroup();
    b.box(x, back - 2, x + 2, back + 1, 1, 2, { kind: 'plate', color: CHROME }); // the X-frame
    b.box(x, back - 2, x + 2, back, 2, 4, { kind: 'tile', color: LEATHER }); // the seat cushion
    b.box(x, back, x + 2, back + 1, 2, 7, { kind: 'tile', color: LEATHER }); // the back cushion
    // [documented: the Barcelona stool, its ottoman] before each chair
    b.newGroup();
    b.box(x, back - 6, x + 2, back - 4, 1, 2, { kind: 'plate', color: CHROME });
    b.box(x, back - 6, x + 2, back - 4, 2, 3, { kind: 'tile', color: LEATHER });
  }
  // [documented: black glass table tops] [assumed: one low table between the chairs, on a chrome cross]
  b.newGroup();
  const tx = (CARPET[0] + CARPET[2]) >> 1, tz = back - 4;
  b.box(tx - 1, tz, tx + 1, tz + 2, 1, 4, { kind: 'bar', color: CHROME, mask: (x, z) => (x - tx + 1) === (z - tz) });
  b.box(tx - 1, tz, tx + 1, tz + 2, 4, 5, { kind: 'tile', color: BLACK });
  // [documented: four chairs inside (WikiArquitectura)] [assumed: the second pair behind the onyx, facing the long marble wall]
  for (const x of [ONYX[0] + 4, ONYX[0] + 9]) {
    b.newGroup();
    b.box(x, ONYX[3] + 3, x + 2, ONYX[3] + 6, 0, 1, { kind: 'plate', color: CHROME });
    b.box(x, ONYX[3] + 4, x + 2, ONYX[3] + 6, 1, 3, { kind: 'tile', color: LEATHER });
    b.box(x, ONYX[3] + 3, x + 2, ONYX[3] + 4, 1, 6, { kind: 'tile', color: LEATHER });
  }
}

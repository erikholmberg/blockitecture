/**
 * The Neue Nationalgalerie's hall (spec 057): the two room-high shafts clad in green Tinos marble, the two timber cloakrooms with
 * the stairs down to the lower floor, and a few pieces of the hall's furniture. Each piece says [documented] or [assumed].
 */
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { CLOAK_TOP, CLOAKS, SHAFTS, Y } from './layout';

const MARBLE = [0x5d7a64, 0x67836d];
const TIMBER = 0x8b6a4b;
const LEATHER = 0x5b4a3c;
const CHROME = 0xc9ccce;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // [documented: two service shafts clad in green Tinos marble, floor to ceiling, in the hall's west half]
  for (const [x0, z0, x1, z1] of SHAFTS) {
    b.newGroup();
    b.box(x0, z0, x1, z1, 0, Y.CEILING, { kind: 'brick', color: (x, y) => MARBLE[(Math.floor(x / 3) + Math.floor(y / 9)) & 1] });
  }
  // [documented: two cloakroom units in timber in the east half, each with a stair down to the lower floor; their height assumed]
  for (const [x0, z0, x1, z1] of CLOAKS) {
    b.newGroup();
    b.box(x0, z0, x1, z1, 0, CLOAK_TOP, {
      kind: 'brick', color: TIMBER,
      // [assumed] the stair's opening on the side toward the hall's middle
      mask: (x, z, y) => !(z === z1 - 1 && x >= x0 + 8 && x < x0 + 16 && y < 21),
    });
    b.box(x0 + 8, z1 - 1, x0 + 16, z1, 21, CLOAK_TOP, { kind: 'brick', color: TIMBER });
    // [documented: the cloakrooms' counters, Labrador granite] along the street side
    b.box(x0, z0 - 1, x1, z0, 0, 3, { kind: 'brick', color: 0x3b3d42 });
  }
  // [assumed] the hall's furniture: two pairs of Barcelona chairs and a daybed, as photographs of the reopened hall show
  for (const [x, z] of [[96, 96], [120, 96]]) {
    b.newGroup();
    b.box(x, z, x + 2, z + 2, 0, 2, { kind: 'brick', color: CHROME });
    b.box(x, z, x + 2, z + 2, 2, 3, { kind: 'plate', color: LEATHER });
    b.box(x + 4, z, x + 6, z + 2, 0, 2, { kind: 'brick', color: CHROME });
    b.box(x + 4, z, x + 6, z + 2, 2, 3, { kind: 'plate', color: LEATHER });
  }
  b.newGroup();
  b.box(104, 120, 112, 123, 0, 2, { kind: 'brick', color: CHROME });
  b.box(104, 120, 112, 123, 2, 3, { kind: 'plate', color: LEATHER });
  // [assumed] free-standing display walls for an exhibition, in white
  for (const [x, z] of [[40, 100], [168, 100], [104, 150]]) {
    b.newGroup();
    b.box(x, z, x + 10, z + 1, 0, 24, { kind: 'brick', color: 0xf1efe9 });
  }
}

/**
 * Taliesin West's rooms (spec 077), as blocky stand-ins (spec 077, Out of scope: the furniture's real forms): the drafting studio's
 * tables and benches, its stepped fire pit and the icicle pendants; the Garden Room's carpet, built-in benches, origami chairs,
 * triangular tables and piano; the Dining Cove's table; the Kiva's long table. Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { BEAMS_X, DINING_COVE, FIRE_PIT, GARDEN_ROOM, GR_FIREPLACE, KIVA, roofUnder, Y } from './layout';
import { CHEROKEE, FLAGSTONE, grLampY } from './house';

const WOOD = 0x8b5e3c, CUSHION = 0xd8ccb2, CARPET = 0xf1eee6, PIANO = 0x1f1d1c, TABLE_TOP = 0x9c6b45, CHAIR = 0xb8432f;

/** a table: four legs and a top [assumed: their sizes] */
function table(b: Builder, x0: number, z0: number, w: number, d: number, y: number, h: number, top: number, legs = WOOD) {
  b.newGroup();
  for (const [x, z] of [[x0, z0], [x0 + w - 1, z0], [x0, z0 + d - 1], [x0 + w - 1, z0 + d - 1]]) b.add(x, z, y, 1, 1, h, legs, 'bar');
  b.box(x0, z0, x0 + w, z0 + d, y + h, y + h + 1, { kind: 'plate', color: top });
}

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // [documented: Wright's drafting tables and benches, in Cherokee red] two tables in each bay but the fire pit's, a bench
  // between them [assumed: their places and sizes]
  for (let k = 1; k < 10; k++) {
    const x0 = BEAMS_X[k] + 2;
    for (const z0 of [5, 18]) table(b, x0, z0, 5, 4, Y.FLOOR, 7, CHEROKEE, CHEROKEE);
    b.newGroup();
    b.add(x0, 12, Y.FLOOR, 1, 1, 3, CHEROKEE, 'bar');
    b.add(x0 + 4, 12, Y.FLOOR, 1, 1, 3, CHEROKEE, 'bar');
    b.box(x0, 12, x0 + 5, 14, 3, 4, { kind: 'plate', color: CHEROKEE });
  }
  // [documented: the stepped fire pit on the flagstones at the south-east end] two steps of flagstone round a fire [assumed]
  b.newGroup();
  const [fx0, fz0, fx1, fz1] = FIRE_PIT;
  b.box(fx0, fz0, fx1, fz1, Y.FLOOR, Y.FLOOR + 2, { kind: 'plate', color: FLAGSTONE[0], mask: (x, z) => x === fx0 || x === fx1 - 1 || z === fz0 || z === fz1 - 1 });
  b.box(fx0 + 1, fz0 + 1, fx1 - 1, fz1 - 1, Y.FLOOR, Y.FLOOR + 1, { kind: 'plate', color: FLAGSTONE[2], mask: (x, z) => x === fx0 + 1 || x === fx1 - 2 || z === fz0 + 1 || z === fz1 - 2 });
  b.add(fx0 + 2, fz0 + 3, Y.FLOOR, 2, 2, 1, C.fire, 'light');

  // the Garden Room [documented: HABS AZ-218-G]
  const [gx0, gz0, gx1, gz1] = GARDEN_ROOM;
  // [documented: the floor's shag carpet, now white] over the floor, clear of the walls
  b.newGroup();
  b.box(gx0 + 4, gz0 + 2, gx1 - 2, gz1 - 7, Y.FLOOR, Y.FLOOR + 1, { kind: 'tile', color: CARPET });
  // [documented: built-in benches along the west wall] a long seat and its back, upholstered [assumed]
  b.newGroup();
  b.box(gx0 + 1, gz0 + 3, gx0 + 4, gz1 - 9, Y.FLOOR, Y.FLOOR + 3, { kind: 'brick', color: WOOD });
  b.box(gx0 + 1, gz0 + 3, gx0 + 4, gz1 - 9, Y.FLOOR + 3, Y.FLOOR + 4, { kind: 'plate', color: CUSHION });
  b.box(gx0 + 1, gz0 + 3, gx0 + 2, gz1 - 9, Y.FLOOR + 4, Y.FLOOR + 8, { kind: 'brick', color: CUSHION });
  // [documented: origami chairs] in pairs round [documented: small triangular tables] on the carpet [assumed: places]
  for (const [cx, cz] of [[216, 48], [226, 50], [216, 62], [226, 66], [218, 76]]) {
    b.newGroup();
    // the table: a triangle of plates on a leg
    b.add(cx + 1, cz + 1, Y.FLOOR + 1, 1, 1, 4, WOOD, 'bar');
    b.box(cx, cz, cx + 3, cz + 3, Y.FLOOR + 5, Y.FLOOR + 6, { kind: 'plate', color: TABLE_TOP, mask: (x, z) => x - cx + (z - cz) <= 2 });
    for (const [x, z] of [[cx - 3, cz], [cx + 4, cz + 1]]) {
      b.newGroup();
      b.box(x, z, x + 2, z + 2, Y.FLOOR + 1, Y.FLOOR + 3, { kind: 'brick', color: CHAIR });
      b.box(x, z, x + 2, z + 1, Y.FLOOR + 3, Y.FLOOR + 7, { kind: 'brick', color: CHAIR });
    }
  }
  // [documented: the piano by the fireplace] a grand piano's stand-in [assumed: its place]
  b.newGroup();
  const px = GR_FIREPLACE[2] + 2, pz = GR_FIREPLACE[1] - 7;
  for (const [x, z] of [[px, pz], [px + 4, pz], [px + 2, pz + 5]]) b.add(x, z, Y.FLOOR + 1, 1, 1, 5, PIANO, 'bar');
  b.box(px, pz, px + 5, pz + 6, Y.FLOOR + 6, Y.FLOOR + 8, { kind: 'brick', color: PIANO });

  // the Dining Cove [documented]: its table and benches [assumed]
  const [dx0, dz0, dx1, dz1] = DINING_COVE;
  table(b, dx0 + 7, dz0 + 5, 10, 4, Y.FLOOR, 6, TABLE_TOP);
  b.newGroup();
  b.box(dx0 + 7, dz0 + 3, dx0 + 17, dz0 + 4, Y.FLOOR, Y.FLOOR + 4, { kind: 'brick', color: WOOD });
  b.box(dx0 + 7, dz1 - 5, dx0 + 17, dz1 - 4, Y.FLOOR, Y.FLOOR + 4, { kind: 'brick', color: WOOD });
  void dx1;

  // the Kiva [assumed: a long table and its benches, for the apprentices' meetings and films]
  const kx = KIVA[0][0] + 6, kz = KIVA[0][1] + 10;
  table(b, kx, kz, 14, 4, Y.KIVA_FLOOR, 6, TABLE_TOP);
  b.newGroup();
  b.box(kx, kz - 2, kx + 14, kz - 1, Y.KIVA_FLOOR, Y.KIVA_FLOOR + 4, { kind: 'brick', color: WOOD });
  b.box(kx, kz + 5, kx + 14, kz + 6, Y.KIVA_FLOOR, Y.KIVA_FLOOR + 4, { kind: 'brick', color: WOOD });
}

/** [documented: carved "icicle" pendant lamps hung across the studio] a wooden stem and a glowing drop under every bay's
 * middle, in two rows [assumed]; the other rooms' ceiling lights [assumed], all hung with the roof */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (let k = 0; k < 12; k++) {
      const x = Math.round((BEAMS_X[k] + BEAMS_X[k + 1]) / 2);
      for (const z of [9, 21]) {
        const u = roofUnder(z);
        b.add(x, z, u - 2, 1, 1, 2, WOOD, 'bar');
        b.add(x, z, u - 4, 1, 1, 2, C.warmLight, 'light');
      }
    }
    for (const [x, z] of [[214, 52], [226, 58], [214, 70], [226, 76]]) b.add(x, z, grLampY(x, z) - 1, 1, 1, 1, C.warmLight, 'light');
    for (const [x, z] of [[205, 31], [212, 31], [110, 30], [150, 35]]) b.add(x, z, Y.FLAT_ROOF - 1, 1, 1, 1, C.warmLight, 'light');
    for (const [x, z] of [[212, -30], [222, -24]]) b.add(x, z, Y.KIVA_ROOF - 1, 1, 1, 1, C.warmLight, 'light');
  });
}

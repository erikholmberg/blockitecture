/**
 * The Bauhaus Dessau's interior (spec 076 Q5): the workshops behind the glass, the Aula's seats and lamps, the canteen, one
 * Prellerhaus studio, and the partitions of the north wing, the bridge and the Prellerhaus. Blocky stand-ins, as at the Haus
 * am Horn: product names in comments only. Each piece says [documented], [scaled] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { AULA, BRIDGE, CANTEEN, CEIL, COLUMN_X, FL, P_CEIL, LINK_ROOF, NORTH, P_BAYS, P_CORRIDOR, PFL, PRELLER, STAGE, STOREY, WORKSHOP } from './layout';

/** [documented: de.wikipedia] orange and blue on the ground floor; yellow, cinnabar red and cobalt blue above */
export const ORANGE = 0xd97a2b;
export const BLUE = 0x2f5c9a;
export const YELLOW = 0xe9c132;
export const CINNABAR = 0xc23a24;
export const COBALT = 0x1f4fa0;
/** [documented] each floor's colour [assumed: which wall takes which] */
export const FLOOR_COLOURS = [ORANGE, YELLOW, CINNABAR, COBALT, YELLOW];
const WOOD = 0xa8794a, DARK_WOOD = 0x6e4a2e, STEEL = 0xb8bec2, CLOTH = 0x2c2d30, LINEN = 0xe6dfcf, WHITE = 0xf3f1ea;
const PANEL = [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]];

/** the workshop benches, each one piece 8 × 3 studs and 7 plates high [assumed]: on every workshop floor */
export const BENCH_Z = [176, 198];
export const BENCH_X = COLUMN_X.slice(0, -1).map((x) => x + 5);
/** the looms on the second upper floor [assumed: the weaving workshop, documented at the Bauhaus; its floor assumed] */
export const LOOM_FLOOR = 2;

/** one studio furnished: on the first upper floor, behind the second east balcony [assumed layout] */
export const STUDIO = { x0: P_BAYS[1] + 1, x1: P_BAYS[2], z0: 1, z1: P_CORRIDOR.z0 - 1, l: 1 };

function partition(b: Builder, x0: number, z0: number, x1: number, z1: number, y0: number, y1: number, color: number, doors: (x: number, z: number) => boolean) {
  b.box(x0, z0, x1, z1, y0, y1, { kind: 'brick', unit: y1 - y0, sizes: PANEL, color, mask: (x, z) => !doors(x, z) });
}

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // ---- the workshops [documented: the workshop wing; their fittings assumed] ----
  for (let l = 0; l < 3; l++) {
    const y = FL(l);
    b.newGroup();
    for (const z of BENCH_Z)
      for (const x of BENCH_X) {
        if (l === LOOM_FLOOR && z === BENCH_Z[1]) {
          // [assumed] a loom: two dark posts, the beam, the warp stretched between them
          b.add(x, z, y, 1, 3, 14, DARK_WOOD, 'brick');
          b.add(x + 7, z, y, 1, 3, 14, DARK_WOOD, 'brick');
          b.add(x + 1, z + 1, y + 4, 6, 1, 9, LINEN, 'brick');
          b.add(x, z, y + 14, 8, 3, 1, DARK_WOOD, 'plate');
        } else b.add(x, z, y, 8, 3, 7, WOOD, 'brick');
      }
  }
  // ---- the Aula [documented: Breuer's tubular-steel seats facing the stage]: five rows, an aisle down the middle ----
  b.newGroup();
  for (let r = 0; r < 5; r++) {
    const z = AULA[1] + 4 + r * 3;
    for (let x = AULA[0] + 3; x < AULA[2] - 3; x += 2) {
      if (x >= 185 && x < 189) continue; // [assumed] the aisle
      b.add(x, z, FL(0), 1, 1, 4, CLOTH, 'brick'); // the seat [documented: fabric on tubular steel]
      b.add(x, z + 1, FL(0), 1, 1, 9, STEEL, 'bar'); // the back, behind it: they face the stage (−z)
    }
  }
  // ---- the canteen [documented: the Mensa, Breuer's stools]: tables and stools [assumed: their number] ----
  for (const x of [166, 178, 190, 202])
    for (const z of [CANTEEN[1] + 5, CANTEEN[1] + 14, CANTEEN[1] + 23]) {
      b.newGroup();
      b.add(x, z, FL(0), 6, 3, 7, WHITE, 'brick');
      for (const dx of [1, 4]) for (const dz of [-2, 4]) b.add(x + dx, z + dz, FL(0), 1, 1, 5, STEEL, 'round');
    }
  // ---- the partitions [documented: the north wing's classrooms, the bridge's offices; their layout assumed] ----
  for (let l = 0; l < 3; l++) {
    const y0 = FL(l), y1 = CEIL(l), c = FLOOR_COLOURS[l];
    b.newGroup();
    // the north wing: a corridor down its length, classrooms either side, a door to each
    for (const x of [27, 35]) partition(b, x, NORTH[1] + 1, x + 1, NORTH[3] - 1, y0, y1, l === 0 ? BLUE : c, (_x, z) => (z - NORTH[1]) % 24 >= 10 && (z - NORTH[1]) % 24 < 13);
    for (const z of [146, 170, 194, 218]) {
      partition(b, NORTH[0] + 1, z, 27, z + 1, y0, y1, WHITE, () => false);
      partition(b, 36, z, NORTH[2] - 1, z + 1, y0, y1, WHITE, () => false);
    }
    // the bridge's offices [documented: the administration], on its two floors
    if (l >= 1) for (const x of [91, 119]) partition(b, x, BRIDGE[1] + 1, x + 1, BRIDGE[3] - 1, y0, y1, c, (_x, z) => z >= 130 && z < 134);
  }
  // ---- the Prellerhaus [documented: seven studios a floor off a central corridor, a shared kitchen] ----
  for (let l = 1; l <= 4; l++) {
    const y0 = PFL(l), y1 = P_CEIL(l), c = FLOOR_COLOURS[l];
    b.newGroup();
    for (const z of [P_CORRIDOR.z0 - 1, P_CORRIDOR.z1]) partition(b, PRELLER[0] + 1, z, PRELLER[2] - 1, z + 1, y0, y1, c, (x) => (x - PRELLER[0]) % 16 >= 9 && (x - PRELLER[0]) % 16 < 12);
    for (const x of P_BAYS.slice(1)) {
      partition(b, x, PRELLER[1] + 1, x + 1, P_CORRIDOR.z0 - 1, y0, y1, WHITE, () => false);
      partition(b, x, P_CORRIDOR.z1 + 1, x + 1, PRELLER[3] - 1, y0, y1, WHITE, () => false);
    }
  }
  // one studio furnished [assumed layout; documented: Breuer's furniture in the studios]: a bed, a desk at the window, a cupboard
  const s = STUDIO, y = PFL(s.l);
  b.newGroup();
  b.add(s.x0 + 1, s.z1 - 4, y, 7, 3, 2, STEEL, 'plate');
  b.add(s.x0 + 1, s.z1 - 4, y + 2, 7, 3, 1, LINEN, 'plate');
  b.newGroup();
  b.add(s.x1 - 6, s.z0 + 1, y, 5, 2, 7, WOOD, 'brick');
  b.add(s.x1 - 4, s.z0 + 4, y, 1, 1, 4, CLOTH, 'brick');
  b.newGroup();
  b.add(s.x1 - 4, s.z1 - 3, y, 3, 2, 18, WHITE, 'brick');
  void STAGE; void LINK_ROOF; void STOREY; void WORKSHOP; void C;
}

/** [documented: the Aula's silvered ceiling and its nickel-plated tube lamps] hung from the link's roof */
export const AULA_LAMPS: [number, number][] = [];
for (let x = AULA[0] + 4; x < AULA[2] - 3; x += 8) for (let z = AULA[1] + 4; z < AULA[3] - 2; z += 6) AULA_LAMPS.push([x, z]);

export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    // the silvered ceiling under the link's roof slab
    b.box(AULA[0], AULA[1], AULA[2], AULA[3], LINK_ROOF - 1, LINK_ROOF, { kind: 'tile', unit: 1, color: 0xd2d5d8 });
    for (const [x, z] of AULA_LAMPS) {
      b.add(x, z, LINK_ROOF - 4, 1, 1, 3, STEEL, 'bar');
      b.add(x - 1, z, LINK_ROOF - 5, 3, 1, 1, C.warmLight, 'light');
    }
    // [assumed] lights over the workshops' benches, under each slab
    for (let l = 0; l < 3; l++) for (const x of [180, 244]) for (const z of [181, 203]) b.add(x, z, CEIL(l) - 1, 2, 2, 1, C.warmLight, 'light');
  });
}

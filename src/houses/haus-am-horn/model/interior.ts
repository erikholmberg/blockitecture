/**
 * The Haus am Horn's rooms (spec 063), furnished as for the 1923 exhibition with pieces from the Bauhaus workshops
 * [documented: de.wikipedia, the Bauhaus Kooperation]. The pieces are blocky stand-ins for the originals; their colours follow
 * the sources where they say. Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';

const CHERRY = 0xa8643c, LEMON = 0xd9b56a, BLACK = 0x2a2b2d, WHITE = 0xf3f1ea, GREY = 0x9a9c9a;
const RED = 0xc8372d, BLUE = 0x3a62a8, YELLOW = 0xf0c62e;

const bed = (b: Builder, x: number, z: number, w: number, d: number, frame: number) => {
  b.box(x, z, x + w, z + d, 0, 2, { kind: 'plate', color: frame });
  b.box(x, z, x + w, z + d, 2, 3, { kind: 'plate', color: WHITE });
};

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // the living room. [documented: Martha Erps's 4 × 4 m carpet, its colours lost] a carpet in bands [assumed colours]
  b.newGroup();
  b.box(14, 14, 27, 27, 0, 1, { kind: 'tile', color: (x, _y, z) => [0x9c6b4a, 0xc9b98f, 0x6f7a6a][Math.floor((x - 14 + (z - 14)) / 5) % 3] });
  // [documented: Marcel Breuer's living-room cabinet, sofa, table and chairs] in cherry and lemon wood with black
  b.newGroup();
  b.box(13, 11, 21, 13, 0, 15, { kind: 'brick', color: (x, y) => (y >= 9 && x < 17 ? BLACK : CHERRY) });
  b.newGroup();
  b.box(15, 16, 23, 18, 1, 4, { kind: 'brick', color: GREY });
  b.box(15, 15, 23, 16, 1, 7, { kind: 'brick', color: CHERRY });
  b.newGroup();
  b.box(18, 20, 22, 24, 1, 4, { kind: 'brick', color: LEMON });
  for (const [x, z] of [[15, 21], [24, 21]]) { b.add(x, z, 1, 2, 2, 3, CHERRY, 'brick'); b.add(x, z + 2, 1, 2, 1, 6, BLACK, 'brick'); }
  // [documented: Gyula Pap's floor lamp] a slim steel stem and a glass disc
  b.newGroup();
  b.add(27, 13, 0, 1, 1, 15, 0xc9ccce, 'bar');
  b.add(27, 13, 15, 1, 1, 3, C.warmLight, 'lamp');
  // the niche. [documented: Breuer's desk at the window, Carl Jucker's desk lamp] the desk, a chair, the lamp
  b.newGroup();
  b.box(14, 38, 20, 40, 6, 7, { kind: 'tile', color: CHERRY });
  for (const x of [14, 19]) b.add(x, 38, 0, 1, 2, 6, CHERRY, 'brick');
  b.add(17, 36, 0, 1, 1, 4, BLACK, 'brick');
  b.add(19, 39, 7, 1, 1, 3, C.warmLight, 'lamp');
  // the dining room. [documented: Erich Dieckmann's table and chairs] a round table and four chairs on the chequered floor
  b.newGroup();
  b.box(15, 3, 19, 7, 5, 6, { kind: 'tile', color: BLACK, mask: (x, z) => Math.hypot(x - 16.5, z - 4.5) < 2.6 });
  b.add(17, 5, 0, 1, 1, 5, BLACK, 'bar');
  for (const [x, z] of [[14, 5], [19, 5], [17, 2], [17, 8]]) b.add(x, z, 0, 1, 1, 4, 0x8a4b2f, 'brick');
  // the kitchen. [documented: the fitted kitchen by Benita Otte and Ernst Gebhardt, Theodor Bogler's storage jars] white
  // units along two walls, the jars on a shelf
  b.newGroup();
  b.box(1, 1, 11, 3, 0, 7, { kind: 'brick', color: WHITE });
  b.box(1, 3, 3, 8, 0, 7, { kind: 'brick', color: WHITE });
  b.box(1, 1, 11, 2, 12, 13, { kind: 'tile', color: WHITE });
  for (const x of [2, 4, 6, 8]) b.add(x, 1, 13, 1, 1, 2, [0xd9d2c0, 0x8a6a4a][x % 4 === 0 ? 1 : 0], 'round');
  // the children's room. [documented: Alma Buscher's toy cabinet in yellow, red and blue, and wall boards to draw on] the
  // cabinet as coloured boxes, a board on the wall, a child's bed
  b.newGroup();
  [YELLOW, RED, BLUE, WHITE, YELLOW].forEach((c, i) => b.add(24 + i * 2, 7, 0, 2, 2, 3 + 3 * (i % 2), c, 'brick'));
  b.newGroup();
  b.box(34, 1, 40, 2, 4, 12, { kind: 'brick', color: (x) => [RED, BLUE, YELLOW][Math.floor((x - 34) / 2) % 3] });
  b.newGroup();
  bed(b, 34, 6, 6, 4, WHITE);
  // the lady's room. [documented: Breuer's dressing table with its round mirror] the table, the mirror, a bed
  b.newGroup();
  b.box(38, 18, 40, 22, 0, 6, { kind: 'brick', color: LEMON });
  b.add(39, 19, 6, 1, 2, 6, 0xd7e3e6, 'brick');
  b.newGroup();
  bed(b, 33, 14, 7, 3, CHERRY);
  // the man's room. [documented: Dieckmann's furniture in black-stained oak] a bed, a desk, a wardrobe
  b.newGroup();
  bed(b, 23, 33, 7, 3, BLACK);
  b.box(30, 38, 34, 40, 0, 6, { kind: 'brick', color: BLACK });
  b.box(22, 38, 25, 40, 0, 15, { kind: 'brick', color: BLACK });
  // the bathroom. [documented: lined in white opaque glass] the tub and a basin
  b.newGroup();
  b.box(36, 37, 41, 40, 0, 4, { kind: 'brick', color: WHITE });
  b.add(36, 28, 0, 2, 2, 6, WHITE, 'brick');
  // the guest room. [documented: a guest room with a washstand] a bed and the washstand
  b.newGroup();
  bed(b, 2, 34, 7, 3, CHERRY);
  b.add(9, 38, 0, 2, 2, 6, WHITE, 'brick');
}

/** [documented: László Moholy-Nagy's lamps] ceiling lights, with the roofs */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    b.add(20, 20, 33, 2, 2, 1, C.warmLight, 'light');
    for (const [x, z] of [[6, 5], [17, 5], [36, 20], [28, 36], [5, 20]]) b.add(x, z, 20, 1, 1, 1, C.warmLight, 'light');
  });
}

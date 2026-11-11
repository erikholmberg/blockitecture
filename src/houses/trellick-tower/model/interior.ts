/**
 * Trellick Tower's interior (spec 061): the brightly coloured tiles of the corridors [documented: "brightly coloured tiles to
 * corridors and lift walls"], the entrance hall's screen of coloured glass [documented: 11 ft square, of 11-inch units; its
 * colours assumed], the three lifts [documented], and one flat furnished as a sample [assumed]. With 217 flats, the rest stay
 * empty. Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { CORRIDOR, CORRIDORS, levelY, TOWER } from './layout';

/** a colour to each corridor floor [documented: brightly coloured; which colour where assumed] */
const TILES = [0xd4452c, 0xe8a628, 0x3f7fbf, 0x3f9a6a, 0xd9662c, 0x7a5aa8, 0xe3c53a, 0x2f8f9a, 0xc9435c, 0x5aa33f];

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // [documented] the corridors' tiles, a colour a floor
  CORRIDORS.forEach((l, i) => {
    b.newGroup();
    b.box(CORRIDOR[0], CORRIDOR[1] + 1, CORRIDOR[2], CORRIDOR[3], levelY(l) + 1, levelY(l) + 2, { kind: 'tile', color: TILES[i % TILES.length] });
  });
  // [documented: three lifts] the cars at the foot of the service tower, and coloured tiles on the lift lobby's floor
  b.newGroup();
  b.box(TOWER[0] + 14, TOWER[1] + 12, TOWER[2] - 1, TOWER[3] - 8, 0, 1, { kind: 'tile', color: TILES[2] });
  for (let i = 0; i < 3; i++) b.box(TOWER[0] + 3 + i * 7, TOWER[1] + 3, TOWER[0] + 9 + i * 7, TOWER[1] + 9, 0, 18, { kind: 'brick', color: 0x9aa0a4 });
  // [documented] the entrance hall's glass screen, squares of coloured glass in a dark frame
  b.newGroup();
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++)
    b.add(30 + i * 2, 20, j * 3, 2, 1, 3, [0xd4452c, 0xe8a628, 0x3f7fbf, 0x3f9a6a][(i + j * 3) % 4], 'glass');
  // [assumed] a sample flat on the 30th floor, in the third bay: a sofa and a table by the balcony, a bed toward the corridor
  const y = levelY(31) + 1;
  b.newGroup();
  b.box(50, 30, 58, 32, y, y + 3, { kind: 'brick', color: 0x6f7f6a });
  b.box(50, 29, 58, 30, y, y + 6, { kind: 'brick', color: 0x6f7f6a });
  b.box(52, 34, 56, 37, y, y + 3, { kind: 'brick', color: 0x9b7650 });
  b.newGroup();
  b.box(60, 10, 66, 17, y, y + 2, { kind: 'plate', color: 0x9b7650 });
  b.box(60, 10, 66, 17, y + 2, y + 3, { kind: 'plate', color: 0xeeeae0 });
  b.newGroup();
  b.box(48, 12, 52, 16, y + 5, y + 6, { kind: 'tile', color: 0x9b7650 });
  for (const [x, z] of [[48, 12], [51, 12], [48, 15], [51, 15]]) b.add(x, z, y, 1, 1, 5, 0xc9ccce, 'bar');
}

/** [assumed] lights in the boiler house and the entrance hall, with the roof */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const x of [20, 60, 100]) b.add(x, 20, levelY(1) - 1, 2, 2, 1, C.warmLight, 'light');
  });
}

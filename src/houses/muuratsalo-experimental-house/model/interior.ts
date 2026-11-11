/**
 * The Muuratsalo Experimental House's rooms (spec 058): the studio, the kitchen, the bedrooms, the guest rooms, furnished
 * simply in pale wood, as a summer house would be. Each piece says [documented] or [assumed].
 */
import { Builder } from '@/engine/voxel';
import { P } from '../phases';

const BIRCH = 0xd6bf94; // Aalto's bent birch [assumed]
const LINEN = 0xece6d6;
const RED = 0xa94a35;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // [documented: the studio, Aalto's painting room] a long work table and an easel by the window to the courtyard
  b.newGroup();
  b.box(14, 4, 22, 7, 7, 8, { kind: 'tile', color: BIRCH });
  for (const [x, z] of [[14, 4], [21, 4], [14, 6], [21, 6]]) b.add(x, z, 0, 1, 1, 7, BIRCH, 'bar');
  b.newGroup();
  b.box(18, 11, 19, 12, 0, 15, { kind: 'brick', color: 0x7d6a52 });
  b.box(17, 11, 20, 12, 8, 14, { kind: 'plate', color: 0xf3efe6 });
  // [assumed] a low sofa and two armchairs by the fireplace
  b.newGroup();
  b.box(19, 1, 23, 3, 0, 3, { kind: 'brick', color: RED });
  b.box(26, 6, 28, 8, 0, 3, { kind: 'brick', color: LINEN });
  b.box(22, 6, 24, 8, 0, 3, { kind: 'brick', color: LINEN });
  // [documented: the kitchen] counters along its north wall
  b.newGroup();
  b.box(32, 1, 45, 3, 0, 7, { kind: 'brick', color: LINEN });
  b.box(32, 1, 45, 3, 7, 8, { kind: 'tile', color: 0x8c8f8f });
  // [assumed] the dining table in the kitchen end
  b.newGroup();
  b.box(35, 8, 41, 11, 6, 7, { kind: 'tile', color: BIRCH });
  for (const [x, z] of [[35, 8], [40, 8], [35, 10], [40, 10]]) b.add(x, z, 0, 1, 1, 6, BIRCH, 'bar');
  // [documented: two bedrooms and a guest room in the bedroom wing] a bed in each
  for (const z of [33, 41, 25]) {
    b.newGroup();
    b.box(38, z, 44, z + 4, 0, 2, { kind: 'plate', color: BIRCH });
    b.box(38, z, 44, z + 4, 2, 3, { kind: 'plate', color: LINEN });
  }
  // [documented: the bath in the corner of the L] a tub
  b.newGroup();
  b.box(25, 17, 29, 20, 0, 4, { kind: 'brick', color: LINEN });
  // [documented: two guest rooms, "VIERASH."] a bed in each
  for (const x of [50, 62]) {
    b.newGroup();
    b.box(x, 2, x + 6, 6, 0, 2, { kind: 'plate', color: BIRCH });
    b.box(x, 2, x + 6, 6, 2, 3, { kind: 'plate', color: LINEN });
  }
  // [assumed] a bench in the courtyard by the fire pit
  b.newGroup();
  b.box(4, 36, 9, 38, 0, 3, { kind: 'brick', color: BIRCH });
}

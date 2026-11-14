/**
 * The Salk Institute's rooms (spec 079), as blocky stand-ins (spec 079, Out of scope: the real layout and equipment): the top lab
 * floor fitted out in each wing, the other lab floors left empty to show the clear span; the ducts and pipes through the service
 * floors' trusses; a desk, a chair, a bookcase and oak panelling in each study; the library's shelves. Each piece says
 * [documented] or [assumed].
 */
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { BLOCK, LAB, mirrorZ, STOREYS, studies, TOWER_BACK, TRUSS_X, Y } from './layout';

/** [documented: oak panelling inside the studies, Docomomo] */
export const OAK = 0xc49a62;
const BENCH = 0x5d6266, BENCH_TOP = 0xe8e6e0, SHELF = 0xc8ccd0, HOOD = 0xd9dcdf, DUCT = 0xa9aeb2, PIPE = 0x7d8388, DESK = OAK, CHAIR = 0x3f4549, BOOKS = [0x8b3a2f, 0x2f4a6b, 0xc9b27a];

/** a box in the north wing and its mirror image in the south [documented: mirror-image wings] */
function both(b: Builder, x0: number, z0: number, x1: number, z1: number, y0: number, y1: number, color: number, sizes?: number[][], kind: 'brick' | 'plate' | 'tile' = 'brick') {
  b.box(x0, z0, x1, z1, y0, y1, { kind, unit: y1 - y0, color, sizes });
  b.box(x0, mirrorZ(z1 - 1), x1, mirrorZ(z0) + 1, y0, y1, { kind, unit: y1 - y0, color, sizes });
}

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const top = STOREYS[4]; // the top lab floor
  const y = top.y0;
  // [assumed: the fitted floor's layout] five rows of lab benches down the column-free floor [documented: column-free], each a
  // base, a white top and a shelf over its middle [assumed]
  for (const z of [100, 112, 124, 136, 148]) {
    b.newGroup();
    both(b, LAB[0] + 6, z, LAB[2] - 6, z + 3, y, y + 8, BENCH, [[16, 3], [8, 3], [4, 3], [2, 3], [1, 3]]);
    both(b, LAB[0] + 6, z, LAB[2] - 6, z + 3, y + 8, y + 9, BENCH_TOP, [[16, 3], [8, 3], [4, 3], [2, 3], [1, 3]], 'plate');
    both(b, LAB[0] + 6, z + 1, LAB[2] - 6, z + 2, y + 9, y + 17, SHELF, [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]]);
  }
  // [assumed] fume hoods along the outer wall, one in each bay between the trusses
  b.newGroup();
  for (const tx of TRUSS_X.slice(0, -1)) both(b, tx + 6, BLOCK[3] - 4, tx + 14, BLOCK[3] - 1, y, y + 20, HOOD, [[8, 3], [4, 3], [2, 3], [1, 3]]);

  // [documented: the service floors carry the pipes and ducts] a duct and a pipe run down each service floor, through the
  // trusses' openings, resting on their chords [assumed: sizes and places]
  for (const s of STOREYS.filter((st) => st.kind === 'service')) {
    b.newGroup();
    const yy = s.y0 + Y.CHORD;
    // pieces 20 studs long, each across one truss, so each rests on a chord
    both(b, LAB[0], 101, TRUSS_X[0] - 10, 107, yy, yy + 6, DUCT, [[16, 6], [8, 6], [4, 6], [2, 6], [1, 6]]);
    both(b, TRUSS_X[0] - 10, 101, TRUSS_X[TRUSS_X.length - 1] + 10, 107, yy, yy + 6, DUCT, [[20, 6]]);
    both(b, TRUSS_X[TRUSS_X.length - 1] + 10, 101, LAB[2], 107, yy, yy + 6, DUCT, [[16, 6], [8, 6], [4, 6], [2, 6], [1, 6]]);
    for (const pz of [131, 133, 152]) {
      both(b, LAB[0], pz, TRUSS_X[0] - 10, pz + 1, yy, yy + 2, PIPE, [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]]);
      both(b, TRUSS_X[0] - 10, pz, TRUSS_X[TRUSS_X.length - 1] + 10, pz + 1, yy, yy + 2, PIPE, [[20, 1]]);
      both(b, TRUSS_X[TRUSS_X.length - 1] + 10, pz, LAB[2], pz + 1, yy, yy + 2, PIPE, [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]]);
    }
  }

  // the studies [documented: 36, with oak panelling inside]: a desk under the teak window, a chair, a bookcase on the back wall
  // and the oak lining of the flat front wall [assumed: their places and sizes]
  for (const st of studies()) {
    const e = st.x0, fy = st.y;
    b.newGroup();
    both(b, e + 13, 47, e + 16, 49, fy, fy + 6, DESK, [[3, 2], [1, 2], [1, 1]]); // the desk, in the bay [assumed]
    both(b, e + 13, 50, e + 15, 52, fy, fy + 4, CHAIR, [[2, 2]]); // the chair
    both(b, e + 4, TOWER_BACK - 2, e + 12, TOWER_BACK - 1, fy, fy + 14, BOOKS[st.tower % 3], [[8, 1], [4, 1], [2, 1], [1, 1]]); // the bookcase
    both(b, e + 1, 48, e + 12, 49, fy, fy + 16, OAK, [[11, 1], [8, 1], [4, 1], [3, 1], [2, 1], [1, 1]]); // the oak panelling [documented]
  }

  // the library in the south wing [documented: OSM's node, "Salk Institute Library", on the south wing's plaza side]: rows of
  // shelves on the lab floor below the plaza [assumed: its floor and layout]
  b.newGroup();
  const ly = STOREYS[2].y0;
  for (let z = -150; z <= -100; z += 6)
    b.box(160, z, 200, z + 1, ly, ly + 15, { kind: 'brick', unit: 15, sizes: [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]], color: BOOKS[((z / 6) | 0) & 1 ? 1 : 0] });
}


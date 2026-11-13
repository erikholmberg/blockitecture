/**
 * The Barcelona Pavilion's last phase (spec 075): the water in the two pools [documented: the large one light green, the small
 * one over black glass], a stand-in for Georg Kolbe's statue in the small pool (Q2), and the trees: the rows flanking the
 * forecourt at OSM's places [documented: OSM's natural=tree nodes] and a few on the slope behind [assumed].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { inRect, LARGE_POOL, PLINTH, SMALL_POOL, STATUE, Y } from './layout';
import { HeightMap, TERRAIN } from './site';

/** [documented: OSM's trees in the lot, in model ft] the rows either side of the forecourt toward the Plaça de Carles Buïgas */
export const OSM_TREES: [number, number][] = [
  [0, -68], [0, -86], [0, -104], [0, -122], [0, -142],
  [-28, -44], [-28, -70], [-28, -89], [-28, -107], [-28, -125], [-28, -145],
  [161, -66], [161, -84], [161, -102], [161, -120], [161, -141],
  [186, -64], [186, -82], [186, -100], [186, -120], [186, -140], [186, -158],
];
/** [assumed: photographs show trees on the grass up the slope behind the pavilion] */
const SLOPE_TREES: [number, number][] = [[-40, 70], [-20, 112], [30, 100], [120, 112], [200, 100], [215, 45], [-45, 25]];

/** [documented: bronze, 1.73 m high] the statue's stand-in: a standing figure only in outline, arms raised over its head */
export const BRONZE = 0x5e4a33;

function tree(b: Builder, x: number, z: number, y: number, h: number, rs: number[], colors: number[]) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x5a4636, 'round');
  rs.forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + h + i * 3, y + h + 3 + i * 3, { kind: 'brick', color: colors[i % colors.length], mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3 }));
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // a stand-in for Georg Kolbe's "Der Morgen" (1925; a 1986 cast) [documented: OSM's node 10106337168; 1.73 × 0.87 × 0.75 m]:
  // not a likeness (Q2). On a low travertine stand in the water [assumed].
  b.newGroup();
  const [sx, sz] = STATUE;
  b.box(sx, sz, sx + 3, sz + 2, Y.POOL_FLOOR, 0, { kind: 'brick', color: 0xd8ccb1 });
  b.box(sx + 1, sz, sx + 3, sz + 1, 0, 11, { kind: 'brick', color: BRONZE }); // legs and body
  b.box(sx + 1, sz, sx + 2, sz + 1, 11, 14, { kind: 'brick', color: BRONZE }); // the head
  b.box(sx, sz, sx + 1, sz + 1, 8, 13, { kind: 'brick', color: BRONZE }); // an arm raised
  b.box(sx + 2, sz, sx + 3, sz + 1, 11, 13, { kind: 'brick', color: BRONZE }); // the other, over the head
  // the water [documented: the large pool's light green; the small pool's dark over black glass]
  b.newGroup();
  b.box(LARGE_POOL[0], LARGE_POOL[1], LARGE_POOL[2], LARGE_POOL[3], Y.POOL_FLOOR, Y.WATER, { kind: 'water', color: 0x9fd6c2 });
  b.newGroup();
  b.box(SMALL_POOL[0], SMALL_POOL[1], SMALL_POOL[2], SMALL_POOL[3], Y.POOL_FLOOR, Y.WATER, { kind: 'water', color: 0x6f9c98 });
  // the trees: plane trees along the forecourt [assumed: the species], pines and holm oaks up the slope [assumed]
  for (const [x, z] of OSM_TREES) {
    if (!inRect(x, z, [TERRAIN.x0 + 6, TERRAIN.z0 + 6, TERRAIN.x1 - 6, TERRAIN.z1 - 6])) continue;
    tree(b, x, z, hm.at(x, z), 18 + Math.floor(hash2(x, z) * 6), [3, 5, 6, 6, 5, 3], [0x5f8a3c, 0x6b9545]);
  }
  for (const [x, z] of SLOPE_TREES) {
    if (inRect(x, z, [PLINTH[0] - 6, PLINTH[1] - 6, PLINTH[2] + 6, PLINTH[3] + 6])) continue;
    tree(b, x, z, hm.at(x, z), 16 + Math.floor(hash2(z, x) * 8), [3, 4, 5, 5, 4, 2], [0x3f6b34, 0x4b7a3c]);
  }
}

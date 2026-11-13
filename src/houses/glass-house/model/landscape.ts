/**
 * The Glass House's landscape (spec 073): the crushed-stone paths and the granite curb and steps [documented: the nomination],
 * the stone wall [documented: OSM], the round pool and its granite deck [documented], the pond with the Pavilion standing in it
 * [documented: "about 32 feet square", a pinwheel of square bays, columns about every 4 ft, at about two-thirds scale], the big
 * oak on the knoll [documented: the Trust; its place assumed], and the woods round the lawn and down the bluff [assumed].
 */
import { segDist } from '@/engine/lot';
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { BRICK, HOUSE, inRect, PATHS, PAVILION, POOL, Rect, STONE_WALL, Y } from './layout';
import { HeightMap, inPond, inPool, LAWN, POND_LEVEL, TERRAIN } from './site';

const GRANITE = [0xc4c4c0, 0xbcbcb8];
const GRAVEL = [0xcfc8b8, 0xc4bdac];
const CONCRETE = 0xe4e0d4; // the Pavilion's precast concrete [documented], painted white [scaled: photographs]
const STONE = [0x8b8378, 0x7a7266, 0x958c7e];
const LEAVES = [0x3d6a34, 0x2f5c2c, 0x4a7a3a, 0x557f3f];
const OAK = [0x3a6230, 0x46703a];
const WATER = 0x4f7f86;

export const onPath = (x: number, z: number) => PATHS.some((p) => p.slice(1).some((q, i) => segDist(x + 0.5, z + 0.5, p[i], q) < 2));

/** the Pavilion's bays: a pinwheel of 8 ft squares round a square of four [scaled: ArchDaily's plan] */
export const PAVILION_BAYS: [number, number][] = [[1, 1], [2, 1], [1, 2], [2, 2], [2, 0], [3, 2], [1, 3], [0, 1]];
export const inPavilion = (x: number, z: number) =>
  PAVILION_BAYS.some(([i, j]) => inRect(x, z, [PAVILION[0] + i * 8, PAVILION[1] + j * 8, PAVILION[0] + i * 8 + 8, PAVILION[1] + j * 8 + 8]));

/** a broad tree: a trunk and a layered crown */
function tree(b: Builder, x: number, z: number, y: number, trunk: number, rs: number[], colors: number[], t = 1) {
  b.newGroup();
  b.box(x, z, x + t, z + t, y, y + trunk, { kind: 'round', color: 0x4a3b2e });
  const c = x + (t - 1) / 2, d = z + (t - 1) / 2;
  rs.forEach((r, i) =>
    b.box(Math.floor(c - r), Math.floor(d - r), Math.ceil(c + r) + 1, Math.ceil(d + r) + 1, y + trunk + i * 3, y + trunk + 3 + i * 3, {
      kind: 'brick', color: colors[i % colors.length], mask: (xx, zz) => Math.hypot(xx - c, zz - d) <= r + 0.3,
    }));
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the granite steps up to the east door [documented: "up low granite steps"; two steps assumed]
  b.newGroup();
  b.box(HOUSE[2], 25, HOUSE[2] + 3, 31, Y.LAWN, Y.LAWN + 1, { kind: 'tile', color: GRANITE[0] });
  b.box(HOUSE[2], 25, HOUSE[2] + 1, 31, Y.LAWN + 1, -1, { kind: 'tile', color: GRANITE[0] });
  // the crushed-stone paths [documented]
  b.newGroup();
  b.box(26, 22, 126, 118, -12, 12, {
    kind: 'tile', color: (x, _y, z) => GRAVEL[Math.floor(hash2(x, z) * 2)],
    mask: (x, z, y) => onPath(x, z) && y === hm.at(x, z) && !inRect(x, z, HOUSE) && !inRect(x, z, BRICK),
  });
  // the low granite curb round the lawn's outer edge, on the bluff side and the north [documented; its line assumed]
  b.newGroup();
  const curb = (x: number, z: number) => (x === LAWN[0] && z >= LAWN[1] && z < LAWN[3]) || (z === LAWN[1] && x >= LAWN[0] && x < LAWN[2]);
  b.box(LAWN[0], LAWN[1], LAWN[2], LAWN[3], -12, 12, { kind: 'brick', color: GRANITE[1], mask: (x, z, y) => curb(x, z) && y === hm.at(x, z) && !inPool(x, z, POOL.r + POOL.deck) });
  // the stone wall [documented: OSM], about 4 ft high [assumed]
  b.newGroup();
  const [[ax, az], [bx, bz]] = STONE_WALL;
  b.box(Math.floor(Math.min(ax, bx)) - 2, Math.floor(az), Math.ceil(Math.max(ax, bx)) + 2, Math.min(Math.ceil(bz), TERRAIN.z1), -40, 40, {
    kind: 'brick', color: (x, y, z) => STONE[Math.floor(hash2(x * 3 + y, z) * 3)],
    mask: (x, z, y) => segDist(x + 0.5, z + 0.5, [ax, az], [bx, bz]) < 1 && y >= hm.at(x, z) && y < hm.at(x, z) + 9,
  });

  // the pool: round, its granite deck [documented]; the water a little below the deck [assumed]
  b.newGroup();
  const [px0, pz0, px1, pz1] = [POOL.x - POOL.r - POOL.deck, POOL.z - POOL.r - POOL.deck, POOL.x + POOL.r + POOL.deck, POOL.z + POOL.r + POOL.deck];
  b.box(px0, pz0, px1, pz1, -12, 12, { kind: 'tile', color: GRANITE[0], mask: (x, z, y) => !inPool(x, z) && inPool(x, z, POOL.r + POOL.deck) && y === hm.at(x, z) });
  b.box(px0, pz0, px1, pz1, Y.LAWN - 12, Y.LAWN - 1, { kind: 'water', unit: 11, color: 0x6fc6d8, mask: (x, z, y) => inPool(x, z) && y >= hm.at(x, z) });

  // the Pavilion: its own base in the pond, then the colonnades and the roof slabs [documented; height assumed: 6 ft to the
  // roof, about two-thirds of normal scale]
  const base = POND_LEVEL + 1, roof = base + 15;
  b.newGroup();
  b.box(PAVILION[0], PAVILION[1], PAVILION[2], PAVILION[3], POND_LEVEL - 12, base, { kind: 'brick', color: CONCRETE, mask: (x, z, y) => inPavilion(x, z) && y >= hm.at(x, z) - 3 });
  b.newGroup();
  const col = (x: number, z: number) => (x - PAVILION[0]) % 4 === 0 && (z - PAVILION[1]) % 4 === 0;
  const edge = (x: number, z: number) => !inPavilion(x - 1, z) || !inPavilion(x + 1, z) || !inPavilion(x, z - 1) || !inPavilion(x, z + 1);
  // the arches: columns every 4 ft along the bays' edges, a haunch either side of each [scaled]
  const arch = (x: number, z: number, y: number) => {
    if (!inPavilion(x, z) || !edge(x, z)) return false;
    if (col(x, z)) return true;
    const u = (x - PAVILION[0]) % 4 === 0 ? z - PAVILION[1] : x - PAVILION[0];
    return y >= roof - 3 && (u % 4 === 1 || u % 4 === 3);
  };
  b.box(PAVILION[0], PAVILION[1], PAVILION[2], PAVILION[3], base, roof, { kind: 'brick', unit: 3, color: CONCRETE, mask: (x, z, y) => arch(x, z, y) });
  b.box(PAVILION[0], PAVILION[1], PAVILION[2], PAVILION[3], base, roof, { kind: 'bar', color: CONCRETE, mask: (x, z) => inPavilion(x, z) && col(x, z) && !edge(x, z) });
  b.box(PAVILION[0], PAVILION[1], PAVILION[2], PAVILION[3], roof, roof + 2, { kind: 'plate', color: CONCRETE, mask: (x, z) => inPavilion(x, z) });
  // the pond's water, at its level [documented: OSM way 1169420796, the level from the terrain]
  b.newGroup();
  const [wx0, wz0, wx1, wz1] = [-362, 44, -186, 164];
  b.box(wx0, wz0, wx1, wz1, POND_LEVEL - 12, POND_LEVEL, { kind: 'water', unit: 4, color: WATER, mask: (x, z, y) => inPond(x, z) && y >= hm.at(x, z) });

  // the big oak on the knoll, north-west of the house [documented: "a knoll with a large oak tree"; place assumed]
  tree(b, -10, -14, hm.at(-10, -14), 42, [8, 12, 15, 17, 17, 16, 14, 11, 7, 3], OAK, 2);
  // the woods: round the lawn and down the bluff, thinned where the views run [assumed]
  const r = rng(1949);
  const court: Rect = [LAWN[0] - 4, LAWN[1] + 4, LAWN[2] - 10, LAWN[3]];
  const clear: Rect[] = [court, [PAVILION[0] - 10, PAVILION[1] - 10, PAVILION[2] + 10, PAVILION[3] + 10]];
  const corridor = (x: number, z: number) => segDist(x, z, [(PAVILION[0] + PAVILION[2]) / 2, (PAVILION[1] + PAVILION[3]) / 2], [0, 28]) < 26;
  const rd = (x: number, z: number) => Math.hypot(Math.max(court[0] - x, 0, x - court[2]), Math.max(court[1] - z, 0, z - court[3]));
  for (let gz = TERRAIN.z0 + 8; gz < TERRAIN.z1 - 6; gz += 20)
    for (let gx = TERRAIN.x0 + 8; gx < TERRAIN.x1 - 6; gx += 20) {
      const x = gx + Math.floor(hash2(gx, gz) * 11) - 5, z = gz + Math.floor(hash2(gz, gx) * 11) - 5;
      if (clear.some((c) => inRect(x, z, c)) || inPond(x, z) || inPool(x, z, POOL.r + POOL.deck + 6) || onPath(x, z) || corridor(x, z)) continue;
      // thick round the lawn and down the bluff, thinner far off
      const p = rd(x, z) < 45 ? 0.8 : x > -200 ? 0.55 : 0.3;
      if (hash2(x * 3, z * 7) > p) continue;
      const big = r() < 0.4;
      const rs = big ? [4, 6, 7, 6, 4] : [3, 5, 4, 2];
      tree(b, x, z, hm.at(x, z), (big ? 30 : 21) + 3 * Math.floor(r() * 4), rs, [LEAVES[Math.floor(r() * 4)], LEAVES[Math.floor(r() * 4)]]);
    }
}

/**
 * The Kaufmann Desert House's garden (spec 033): the pool's water, the lawn's few palms, and the desert garden around it,
 * boulders, barrel cactus and creosote on the sand [assumed: photographs]; the lot's two other buildings, from OSM, as plain
 * low blocks [documented: their outlines; their look assumed].
 */
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { DRIVE, inAny, inRect, POOL, POOL_TERRACE, ROOFS, STAIR, Y } from './layout';
import { LOT_BUILDINGS } from './lotTerrain';
import { HeightMap, inLawn, TERRAIN } from './site';

const ROCK = [0x9c8f7c, 0x8a7f6e, 0xa89a84];

function inPoly(x: number, z: number, ring: [number, number][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** a fan palm: a tall thin trunk, a round crown [assumed: photographs] */
function palm(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x7a6a55, 'round');
  b.box(x - 1, z - 1, x + 2, z + 2, y + h, y + h + 3, { kind: 'brick', color: 0x5d7a3e });
  b.box(x - 3, z - 3, x + 4, z + 4, y + h + 3, y + h + 4, { kind: 'plate', color: 0x6b8a45 });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the pool's water [documented]
  b.newGroup();
  const [x0, z0, x1, z1] = POOL;
  b.add(x0, z0, Y.POOL_FLOOR, x1 - x0, z1 - z0, Y.POOL - Y.POOL_FLOOR, 0x7fd8ea, 'water');

  // the lot's other buildings: plain, low, white [assumed]
  for (const bl of LOT_BUILDINGS) {
    b.newGroup();
    const xs = bl.ring.map((p) => p[0]), zs = bl.ring.map((p) => p[1]);
    const bx0 = Math.floor(Math.min(...xs)), bx1 = Math.ceil(Math.max(...xs)), bz0 = Math.floor(Math.min(...zs)), bz1 = Math.ceil(Math.max(...zs));
    const g = hm.at((bx0 + bx1) / 2, (bz0 + bz1) / 2);
    b.box(bx0, bz0, bx1, bz1, g, Y.CEILING, { kind: 'brick', color: 0xe9e4da, mask: (x, z) => inPoly(x + 0.5, z + 0.5, bl.ring) });
    b.box(bx0, bz0, bx1, bz1, Y.CEILING, Y.CEILING + 2, { kind: 'plate', color: 0xf1efe9, mask: (x, z) => inPoly(x + 0.5, z + 0.5, bl.ring) });
  }

  // a few tall fan palms on the lawn, and along the drive [assumed: photographs]
  for (const [x, z] of [[170, 70], [178, 146], [92, 132], [24, 150], [56, 156], [140, 30], [8, 40]]) palm(b, x, z, hm.at(x, z), 50 + 3 * Math.floor(hash2(x, z) * 8));

  // the desert garden: boulders, barrel cactus and creosote on the sand, clear of the house, the pool and the lawn
  const r = rng(1946);
  const clear = (x: number, z: number) => {
    for (const [dx, dz] of [[0, 0], [-4, -4], [4, -4], [-4, 4], [4, 4]]) {
      const px = x + dx, pz = z + dz;
      if (inAny(px, pz, ROOFS) || inRect(px, pz, POOL_TERRACE) || inRect(px, pz, DRIVE) || inRect(px, pz, STAIR) || inLawn(px, pz)) return false;
      if (LOT_BUILDINGS.some((bl) => inPoly(px, pz, bl.ring))) return false;
    }
    return true;
  };
  for (let gz = TERRAIN.z0 + 4; gz < TERRAIN.z1 - 4; gz += 9)
    for (let gx = TERRAIN.x0 + 4; gx < TERRAIN.x1 - 4; gx += 9) {
      const x = gx + Math.floor(hash2(gx, gz) * 9) - 4, z = gz + Math.floor(hash2(gz, gx) * 9) - 4;
      if (!clear(x, z)) continue;
      const y = hm.at(x, z), t = hash2(x * 7, z * 3);
      b.newGroup();
      if (t < 0.12) {
        // a boulder
        const s = 3 + Math.floor(r() * 4), c = ROCK[Math.floor(r() * 3)];
        b.box(x, z, x + s, z + s - 1, y, y + 3, { kind: 'brick', color: c });
        if (s > 4) b.box(x + 1, z, x + s - 1, z + s - 2, y + 3, y + 6, { kind: 'brick', color: c });
      } else if (t < 0.24) {
        b.add(x, z, y, 2, 2, 3, 0x5f8a4a, 'round'); // a barrel cactus
      } else if (t < 0.4) {
        const s = 2 + Math.floor(r() * 2);
        b.box(x, z, x + s, z + s, y, y + 3, { kind: 'brick', color: t < 0.32 ? 0x6b7550 : 0x7d8556 }); // creosote
      }
    }
}

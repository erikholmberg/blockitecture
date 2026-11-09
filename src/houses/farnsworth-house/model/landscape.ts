/**
 * The Farnsworth House's landscape (spec 022): the black sugar maple south of the living room, which shades the house
 * [documented: HABS photo caption 27; position assumed], and the trees along the meadow's edges and the river bank.
 */
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { HOUSE, inRect, Rect, TERRACE } from './layout';
import { HeightMap, TERRAIN } from './site';

const LEAVES = [0x3b6a33, 0x2f5c2c, 0x4a7a3a, 0x55833f];

/** a broad tree: a trunk with a few limbs and a wide, layered crown */
function tree(b: Builder, x: number, z: number, y: number, r: () => number, big = false) {
  b.newGroup();
  const trunk = (big ? 30 : 18) + 3 * Math.floor(r() * 4), w = big ? 19 : 9 + 2 * Math.floor(r() * 3);
  const t = big ? 2 : 1;
  b.box(x, z, x + t, z + t, y, y + trunk, { kind: 'round', color: 0x4a3b2e });
  const col = LEAVES[Math.floor(r() * LEAVES.length)];
  [w - 4, w - 2, w, w, w - 2, w - 4, w - 8].forEach((s, i) => {
    if (s < 3) return;
    const o = (s - 1) >> 1, cy = y + trunk + i * 3;
    b.box(x - o, z - o, x - o + s, z - o + s, cy, cy + 3, { kind: 'brick', color: i % 2 ? LEAVES[(i + 1) % 4] : col });
  });
}

const grow = (r: Rect, m: number): Rect => [r[0] - m, r[1] - m, r[2] + m, r[3] + m];

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  const r = rng(1951);
  // the black sugar maple, just south-east of the terrace, its crown over the living room's south glass
  tree(b, 84, 50, hm.at(84, 50), r, true);
  // trees: thickest along the river bank (+z) and the meadow's far edges, none near the house or in front of the terrace
  const clear: Rect[] = [grow(HOUSE, 14), grow(TERRACE, 12), [-60, 30, 30, 120]];
  for (let gz = TERRAIN.z0 + 6; gz < TERRAIN.z1 - 4; gz += 16)
    for (let gx = TERRAIN.x0 + 6; gx < TERRAIN.x1 - 4; gx += 16) {
      const x = gx + Math.floor(hash2(gx, gz) * 9) - 4, z = gz + Math.floor(hash2(gz, gx) * 9) - 4;
      if (clear.some((c) => inRect(x, z, c))) continue;
      const edge = Math.min(x - TERRAIN.x0, TERRAIN.x1 - x, z - TERRAIN.z0, TERRAIN.z1 - z);
      const p = z > 120 ? 0.75 : edge < 40 ? 0.55 : 0.12;
      if (hash2(x * 3, z * 7) < p) tree(b, x, z, hm.at(x, z), r);
    }
}

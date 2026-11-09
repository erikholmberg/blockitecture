/**
 * The Ennis House's landscape (spec 025): the pool of 1940 in the north court [documented: the pool; position assumed],
 * chaparral and native shrubs down the slopes, a few cypresses and palms along Glendower Avenue [assumed: photographs].
 */
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { POOL, Y } from './layout';
import { HeightMap, inHouse, TERRAIN } from './site';
import { textile } from './house';

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the pool: a textile-block rim round still water
  b.newGroup();
  const [x0, z0, x1, z1] = POOL;
  b.box(x0 - 1, z0 - 1, x1 + 1, z1 + 1, Y.FLOOR - 3, Y.FLOOR, { kind: 'brick', mask: (x, z) => x < x0 || x >= x1 || z < z0 || z >= z1, color: textile });
  b.box(x0, z0, x1, z1, Y.FLOOR - 9, Y.FLOOR - 7, { kind: 'plate', color: 0x6fc6d8 });
  b.add(x0, z0, Y.FLOOR - 7, x1 - x0, z1 - z0, 6, 0x7fd8ea, 'water');

  const r = rng(1924);
  for (let gz = TERRAIN.z0 + 6; gz < TERRAIN.z1 - 6; gz += 12)
    for (let gx = TERRAIN.x0 + 6; gx < TERRAIN.x1 - 6; gx += 12) {
      const x = gx + Math.floor(hash2(gx, gz) * 7) - 3, z = gz + Math.floor(hash2(gz, gx) * 7) - 3;
      let near = false;
      for (let dz = -6; dz <= 6 && !near; dz += 3) for (let dx = -6; dx <= 6 && !near; dx += 3) near = inHouse(x + dx, z + dz);
      if (near) continue;
      const y = hm.at(x, z), t = hash2(x * 5, z * 11);
      b.newGroup();
      if (t < 0.55) {
        // chaparral: low dark shrubs
        const w = 3 + Math.floor(r() * 3);
        b.box(x, z, x + w, z + w, y, y + 3, { kind: 'brick', color: t < 0.3 ? 0x4f6b44 : 0x6b7550 });
      } else if (t < 0.7) {
        // an Italian cypress: tall and narrow
        const h = 30 + 3 * Math.floor(r() * 6);
        b.box(x, z, x + 2, z + 2, y, y + h, { kind: 'brick', color: 0x2f4a2c });
      } else if (t < 0.78) {
        // a palm: a thin trunk, a crown of fronds
        const h = 45 + 3 * Math.floor(r() * 6);
        b.column(x, z, y, y + h, 0x7a6a55, 'round');
        b.box(x - 2, z - 2, x + 3, z + 3, y + h, y + h + 2, { kind: 'plate', color: 0x4a7a3a });
      }
    }
}

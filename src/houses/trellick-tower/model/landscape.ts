/**
 * Trellick Tower's landscape (spec 061): the trees of Meanwhile Gardens to the north and east and of the estate's courts
 * [documented: the gardens; the trees' places assumed], clear of the buildings, the terrace and the streets.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { inRect, PODIUM } from './layout';
import { built, HeightMap, streetAt, TERRAIN } from './site';

function plane(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x6a5a48, 'round');
  const c = hash2(x, z) < 0.5 ? 0x4c7638 : 0x5a8640;
  [3, 5, 6, 6, 5, 4, 2].forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + h + i * 3, y + h + 3 + i * 3, { kind: 'brick', color: c, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3 }));
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  for (let gz = TERRAIN.z0 + 8; gz < TERRAIN.z1 - 8; gz += 26)
    for (let gx = TERRAIN.x0 + 8; gx < TERRAIN.x1 - 8; gx += 26) {
      const x = gx + Math.floor(hash2(gx, gz) * 11) - 5, z = gz + Math.floor(hash2(gz, gx) * 11) - 5;
      if (hash2(x * 3, z * 7) < 0.3 || inRect(x, z, [PODIUM[0] - 8, PODIUM[1] - 4, PODIUM[2] + 8, PODIUM[3] + 8])) continue;
      let clear = true;
      for (let dz = -8; dz <= 8 && clear; dz += 2) for (let dx = -8; dx <= 8 && clear; dx += 2) if (streetAt(x + dx, z + dz) || built(x + dx, z + dz)) clear = false;
      if (inRect(x, z, [-70, -20, 0, 50])) clear = false; // under the bridges
      if (clear) plane(b, x, z, hm.at(x, z), 30 + Math.floor(hash2(x, z) * 14));
    }
}

/**
 * Unity Temple's landscape (spec 062): street trees on the parkways along Lake Street and Kenilworth Avenue [assumed: OSM maps
 * none], and low planting against the walls [assumed].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { inBuilding, inRect, TERRACE_E, TERRACE_W } from './layout';
import { HeightMap, streetAt, TERRAIN } from './site';

function elm(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x5a4636, 'round');
  const c = hash2(x, z) < 0.5 ? 0x4c7638 : 0x5a8640;
  [4, 6, 7, 7, 6, 4].forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + h + i * 3, y + h + 3 + i * 3, { kind: 'brick', color: c, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3 }));
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  const near = (x: number, z: number, d: number) => {
    for (let dz = -d; dz <= d; dz += 2) for (let dx = -d; dx <= d; dx += 2) if (inBuilding(x + dx, z + dz) || inRect(x + dx, z + dz, TERRACE_E) || inRect(x + dx, z + dz, TERRACE_W)) return true;
    return false;
  };
  // street trees: on the lawn strips beside the pavements, wherever the ground is neither street nor building
  for (let gz = TERRAIN.z0 + 10; gz < TERRAIN.z1 - 10; gz += 30)
    for (let gx = TERRAIN.x0 + 10; gx < TERRAIN.x1 - 10; gx += 30) {
      const x = gx + Math.floor(hash2(gx, gz) * 9) - 4, z = gz + Math.floor(hash2(gz, gx) * 9) - 4;
      if (near(x, z, 16)) continue;
      let clear = true;
      for (let dz = -3; dz <= 3 && clear; dz++) for (let dx = -3; dx <= 3 && clear; dx++) if (streetAt(x + dx, z + dz) || !b.free(x + dx, z + dz, hm.at(x, z), hm.at(x, z) + 30)) clear = false;
      if (clear) elm(b, x, z, hm.at(x, z), 30 + Math.floor(hash2(x, z) * 12));
    }
  // low evergreen planting against the temple's north wall, either side of its middle [assumed]
  b.newGroup();
  for (const z of [30, 36, 54, 60]) b.add(-3, z, hm.at(-3, z), 2, 2, 3, 0x3f6b35, 'brick');
}

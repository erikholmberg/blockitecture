/**
 * The Church of the Light's landscape (spec 055): the hinoki cypresses along the chapel's street side and by the altar end
 * [documented: the 1:50 plan draws 檜 there; their size assumed], and a few garden trees round the neighbours [assumed].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { BOX, inRect, L_WALL_X } from './layout';
import { HeightMap, streetAt, TERRAIN } from './site';

/** a hinoki cypress: a dark green cone on a short trunk [assumed] */
function hinoki(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + 6, 0x5a4636, 'round');
  const c = hash2(x, z) < 0.5 ? 0x2c4a2e : 0x355736;
  let r = 3;
  for (let yy = y + 6; yy < y + h && r >= 1; yy += 6, r -= 0.5) {
    const rr = Math.round(r);
    b.box(x - rr, z - rr, x + rr + 1, z + rr + 1, yy, yy + 6, { kind: 'brick', color: c, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= rr + 0.3 });
  }
}
/** a garden tree: a trunk and a round crown [assumed] */
function gardenTree(b: Builder, x: number, z: number, y: number) {
  b.newGroup();
  b.column(x, z, y, y + 15, 0x5a4636, 'round');
  const c = hash2(z, x) < 0.5 ? 0x4f7a3a : 0x5c8a3f;
  [3, 4, 4, 3, 2].forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + 15 + i * 3, y + 18 + i * 3, { kind: 'brick', color: c, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3 }));
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // along the street side of the chapel, and beyond the L-shaped wall
  for (const x of [6, 18, 30, 42, 54]) hinoki(b, x, -6, hm.at(x, -6), 54 + Math.floor(hash2(x, 3) * 12));
  for (const z of [3, 12]) hinoki(b, L_WALL_X + 6, z, hm.at(L_WALL_X + 6, z), 60);
  // a few garden trees, clear of the chapel, the streets and the buildings
  for (let gz = TERRAIN.z0 + 8; gz < TERRAIN.z1 - 8; gz += 26)
    for (let gx = TERRAIN.x0 + 8; gx < TERRAIN.x1 - 8; gx += 26) {
      const x = gx + Math.floor(hash2(gx, gz) * 9) - 4, z = gz + Math.floor(hash2(gz, gx) * 9) - 4;
      if (hash2(x * 3, z * 7) < 0.55) continue;
      if (inRect(x, z, [BOX[0] - 12, BOX[1] - 12, L_WALL_X + 12, 40])) continue;
      let clear = true;
      for (let dz = -5; dz <= 5 && clear; dz++) for (let dx = -5; dx <= 5 && clear; dx++) if (streetAt(x + dx, z + dz)) clear = false;
      if (clear && b.free(x, z, hm.at(x, z), hm.at(x, z) + 30)) gardenTree(b, x, z, hm.at(x, z));
    }
}

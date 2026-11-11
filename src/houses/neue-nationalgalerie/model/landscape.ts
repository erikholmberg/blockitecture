/**
 * The Neue Nationalgalerie's landscape (spec 057): trees in the sunken sculpture garden and along the streets [documented: the
 * plan's trees in the garden, along Reichpietschufer and Sigismundstraße; species and places assumed], and a few sculptures in
 * the garden [documented: a sculpture garden; the pieces assumed].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { GARDEN, inRect, PODIUM, Y } from './layout';
import { HeightMap, streetAt, TERRAIN } from './site';

/** a linden: a trunk and a broad round crown [assumed] */
function linden(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x5a4636, 'round');
  const c = hash2(x, z) < 0.5 ? 0x4c7638 : 0x5a8640;
  [4, 5, 6, 6, 5, 3].forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + h + i * 3, y + h + 3 + i * 3, { kind: 'brick', color: c, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3 }));
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the garden: a row of trees along its length, and sculptures on the lawn
  for (let x = GARDEN[0] + 20; x < GARDEN[2] - 10; x += 40) linden(b, x, GARDEN[1] + 50, Y.GARDEN, 30);
  for (const [x, z] of [[30, 248], [110, 262], [190, 246], [240, 270]]) {
    b.newGroup();
    b.box(x, z, x + 3, z + 2, Y.GARDEN, Y.GARDEN + 9 + Math.floor(hash2(x, z) * 9), { kind: 'brick', color: hash2(z, x) < 0.5 ? 0x4b4038 : 0x6e5f4a });
  }
  // street trees beyond the podium, clear of the carriageways
  for (let gz = TERRAIN.z0 + 6; gz < TERRAIN.z1 - 6; gz += 28)
    for (let gx = TERRAIN.x0 + 6; gx < TERRAIN.x1 - 6; gx += 28) {
      const x = gx + Math.floor(hash2(gx, gz) * 7) - 3, z = gz + Math.floor(hash2(gz, gx) * 7) - 3;
      // none on the podium, the garden or the forecourt before the stair [assumed: photographs, an open forecourt]
      if (inRect(x, z, [PODIUM[0] - 8, -122, PODIUM[2] + 8, GARDEN[3] + 8])) continue;
      if (hash2(x * 5, z * 3) < 0.5) continue;
      let clear = true;
      for (let dz = -6; dz <= 6 && clear; dz++) for (let dx = -6; dx <= 6 && clear; dx++) if (streetAt(x + dx, z + dz) === 'road') clear = false;
      const y = hm.at(x, z);
      if (clear && b.free(x, z, y, y + 50)) linden(b, x, z, y, 28 + Math.floor(hash2(x, z) * 10));
    }
}

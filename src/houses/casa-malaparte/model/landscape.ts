/**
 * Casa Malaparte's landscape (spec 031): umbrella pines and Mediterranean scrub on the promontory [assumed: photographs], kept
 * clear of the house, the stair and the roof's view.
 */
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { HOUSE, inRect, inStair, Y } from './layout';
import { coastAt, HeightMap, TERRAIN } from './site';

/** an umbrella pine: a tall bare trunk and a broad flat crown */
function pine(b: Builder, x: number, z: number, y: number, r: () => number) {
  b.newGroup();
  const trunk = 30 + 3 * Math.floor(r() * 6), w = 11 + 2 * Math.floor(r() * 3);
  b.column(x, z, y, y + trunk, 0x6b4f3a, 'round');
  const col = r() < 0.5 ? 0x3d5a2e : 0x4a6b35;
  for (const [s, dy] of [[w - 4, 0], [w, 3], [w - 2, 6]] as [number, number][]) {
    const o = (s - 1) >> 1;
    b.box(x - o, z - o, x - o + s, z - o + s, y + trunk + dy, y + trunk + dy + 3, { kind: 'brick', color: col });
  }
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  const r = rng(1938);
  for (let gz = TERRAIN.z0 + 6; gz < TERRAIN.z1 - 6; gz += 11)
    for (let gx = TERRAIN.x0 + 6; gx < TERRAIN.x1 - 6; gx += 11) {
      const x = gx + Math.floor(hash2(gx, gz) * 7) - 3, z = gz + Math.floor(hash2(gz, gx) * 7) - 3;
      if (coastAt(x, z) < 6) continue; // on the land, back from the cliff edge
      let near = false;
      for (let dz = -7; dz <= 7 && !near; dz += 7) for (let dx = -7; dx <= 7 && !near; dx += 7) near = inRect(x + dx, z + dz, HOUSE) || inStair(x + dx, z + dz);
      if (near) continue;
      const y = hm.at(x, z);
      if (y < Y.SEA) continue;
      const t = hash2(x * 5, z * 3);
      if (t < 0.07) pine(b, x, z, y, r);
      else if (t < 0.8) {
        b.newGroup();
        const s = 3 + Math.floor(r() * 4);
        b.box(x, z, x + s, z + s, y, y + 3, { kind: 'brick', color: t < 0.5 ? 0x4f6b44 : 0x6b7550 });
        if (s > 4) b.box(x + 1, z + 1, x + s - 1, z + s - 1, y + 3, y + 6, { kind: 'brick', color: 0x5f7a4e });
      }
    }
}

/**
 * The Muuratsalo Experimental House's landscape (spec 058): the pines and birches of the island's forest [documented: "mixed
 * forest, mostly pine and birch"; places and sizes assumed], kept clear of the house and thinner toward the lake, so the white
 * walls show from the water [documented: "a tall white frontage on the rock" seen from the lake].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { GUEST, inRect, MAIN } from './layout';
import { HeightMap, TERRAIN } from './site';

/** a Scots pine: a tall bare reddish trunk, a small dark crown high up [assumed] */
function pine(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x8a5a3c, 'round');
  const c = hash2(x, z) < 0.5 ? 0x2f4a30 : 0x3a5735;
  [2, 3, 3, 2, 1].forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + h + i * 3, y + h + 3 + i * 3, { kind: 'brick', color: c, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3 }));
}
/** a birch: a white trunk and a light crown [assumed] */
function birch(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0xe9e5db, 'round');
  const c = hash2(z, x) < 0.5 ? 0x7aa04e : 0x8cb058;
  [2, 3, 3, 2].forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + h - 6 + i * 3, y + h - 3 + i * 3, { kind: 'brick', color: c, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3 && !(xx === x && zz === z) }));
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  for (let gz = TERRAIN.z0 + 5; gz < TERRAIN.z1 - 5; gz += 14)
    for (let gx = TERRAIN.x0 + 5; gx < TERRAIN.x1 - 5; gx += 14) {
      const x = gx + Math.floor(hash2(gx, gz) * 7) - 3, z = gz + Math.floor(hash2(gz, gx) * 7) - 3, t = hash2(x * 3, z * 5);
      if (inRect(x, z, [MAIN[0] - 8, MAIN[1] - 8, MAIN[2] + 10, MAIN[3] + 12]) || inRect(x, z, [GUEST[0] - 4, GUEST[1] - 6, GUEST[2] + 6, GUEST[3] + 6])) continue;
      // thinner toward the lake on the west and south-west, where the house is seen from the water
      const lakeward = x < MAIN[0] || z > MAIN[3];
      if (t < (lakeward ? 0.7 : 0.25)) continue;
      const y = hm.at(x, z);
      if (!b.free(x, z, y, y + 60)) continue;
      if (t < 0.55) birch(b, x, z, y, 34 + Math.floor(t * 20));
      else pine(b, x, z, y, 44 + Math.floor(t * 30));
    }
}

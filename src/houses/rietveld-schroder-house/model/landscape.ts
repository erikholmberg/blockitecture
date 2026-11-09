/**
 * The Rietveld Schröder House's garden (spec 019): the low fence of white posts and black rails along the pavements, a box
 * hedge inside it, a few shrubs, and trees in the garden and along Prins Hendriklaan [assumed: photographs].
 */
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { FOOTPRINT, inRect, Rect } from './layout';
import { BLACK, WHITE } from './house';
import { HeightMap, neighbourCells, PLOT, streetAt, TERRAIN } from './site';

const LEAVES = [0x3d6b35, 0x4f7a3a, 0x5c8a3f];
const HEDGE = 0x2f5a2c;

/** a street or garden tree: a trunk and a rounded crown */
function tree(b: Builder, x: number, z: number, y: number, r: () => number) {
  b.newGroup();
  const trunk = 18 + 3 * Math.floor(r() * 5), w = 7 + 2 * Math.floor(r() * 2);
  b.column(x, z, y, y + trunk, 0x5a4636, 'round');
  const col = LEAVES[Math.floor(r() * LEAVES.length)];
  [w - 2, w, w, w - 2, w - 4].forEach((s, i) => {
    const o = (s - 1) >> 1, cy = y + trunk + i * 3;
    b.box(x - o, z - o, x - o + s, z - o + s, cy, cy + 3, { kind: 'brick', color: i % 2 ? LEAVES[(i + 1) % 3] : col });
  });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  const [x0, z0, x1, z1] = PLOT;
  // the fence: white posts every 3 ft, two black rails [assumed: photographs]
  b.newGroup();
  const fence: [number, number][] = [];
  for (let x = x0 + 1; x < x1; x++) fence.push([x, z1 - 1]);
  for (let z = z0; z < z1 - 1; z++) fence.push([x1 - 1, z]);
  fence.forEach(([x, z], i) => {
    const y = hm.at(x, z);
    if (i % 3 === 0) b.box(x, z, x + 1, z + 1, y, y + 8, { kind: 'brick', color: WHITE });
    else for (const h of [3, 6]) b.box(x, z, x + 1, z + 1, y + h, y + h + 1, { kind: 'plate', color: BLACK });
  });
  // the hedge just inside it
  b.newGroup();
  const hedge: Rect[] = [[x0 + 12, z1 - 3, x1 - 2, z1 - 2], [x1 - 3, z0 + 2, x1 - 2, z1 - 3]];
  for (const r of hedge) b.box(r[0], r[1], r[2], r[3], hm.at(r[0], r[1]), hm.at(r[0], r[1]) + 6, { kind: 'brick', color: HEDGE });

  // trees: a few in the garden, and a row along the far side of Prins Hendriklaan
  const r = rng(1924);
  const { owner, w } = neighbourCells();
  const clear = (x: number, z: number) => {
    for (let dz = -5; dz <= 5; dz++)
      for (let dx = -5; dx <= 5; dx++) {
        const X = x + dx, Z = z + dz;
        if (X < TERRAIN.x0 || X >= TERRAIN.x1 || Z < TERRAIN.z0 || Z >= TERRAIN.z1) return false;
        if (inRect(X, Z, [FOOTPRINT[0] - 4, FOOTPRINT[1] - 4, FOOTPRINT[2] + 6, FOOTPRINT[3] + 6])) return false;
        if (owner[(Z - TERRAIN.z0) * w + (X - TERRAIN.x0)] >= 0) return false;
      }
    return streetAt(x, z) === null;
  };
  const spots: [number, number][] = [[42, 10], [48, 40], [34, -6]];
  for (let x = TERRAIN.x0 + 8; x < TERRAIN.x1 - 8; x += 22) spots.push([x, 92]);
  for (let gz = TERRAIN.z0 + 10; gz < -20; gz += 24)
    for (let gx = TERRAIN.x0 + 10; gx < TERRAIN.x1 - 10; gx += 24) if (hash2(gx, gz) < 0.5) spots.push([gx + 3, gz + 5]);
  for (const [x, z] of spots) if (clear(x, z)) tree(b, x, z, hm.at(x, z), r);
}

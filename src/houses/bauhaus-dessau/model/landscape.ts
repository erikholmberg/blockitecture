/**
 * The Bauhaus Dessau's landscape (spec 076): lime trees where OSM maps trees on the lot [documented: OSM's tree nodes, all along
 * Gropiusallee, no species], and a few on the lawns, where the photographs show large limes by the Prellerhaus but OSM maps none
 * [assumed: their places] (trees.ts); each kept clear of the building, the streets and the neighbours [assumed: a tree that would
 * stand in them is left out]; their heights and crowns [assumed].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { HeightMap, inNeighbour, nearBuilding, onBauhausstrasse, streetAt, TERRAIN } from './site';
import { TREES } from './trees';

function lime(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x5b4a3a, 'round');
  const c = hash2(x, z) < 0.5 ? 0x4f7c38 : 0x5b8a40;
  [3, 5, 7, 8, 8, 7, 6, 4, 2].forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + h + i * 3, y + h + 3 + i * 3, { kind: 'brick', color: c, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3 }));
}

/** a tree may stand here: on the lot, clear of the building (and its crown's reach), the streets and the neighbours */
export function treeClear(x: number, z: number) {
  if (x < TERRAIN.x0 + 8 || z < TERRAIN.z0 + 8 || x >= TERRAIN.x1 - 8 || z >= TERRAIN.z1 - 8) return false;
  if (nearBuilding(x, z, 9)) return false;
  for (let dz = -2; dz <= 2; dz += 2) for (let dx = -2; dx <= 2; dx += 2) if (streetAt(x + dx, z + dz) === 'road' || onBauhausstrasse(x + dx, z + dz) || inNeighbour(x + dx, z + dz)) return false;
  return true;
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  for (const [x, z] of TREES) {
    if (!treeClear(x, z) || !b.free(x, z, hm.at(x, z), hm.at(x, z) + 60)) continue;
    lime(b, x, z, hm.at(x, z), 34 + Math.floor(hash2(x, z) * 16));
  }
}

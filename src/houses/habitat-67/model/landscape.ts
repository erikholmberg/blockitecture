/**
 * Habitat 67's gardens (spec 072): a planter on every terrace that has room for one [documented: every dwelling has a garden
 * terrace on the roof of the box below, with planters], small trees on the bigger ones [documented: the gardens have grown in;
 * which terraces assumed], and trees round the pier's lawns [documented: OSM's park to the north; their places assumed].
 */
import { inPoly } from '@/engine/lot';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { Box, BOXES, inRect, levelY, Rect } from './layout';
import { standsOnRoof } from './house';
import { LOT_SELF } from './lotTerrain';
import { built, HeightMap, streetAt, TERRAIN } from './site';

const LEAF = [0x4f7a38, 0x5d8a42, 0x6b9446];
/** the terraces' planters: concrete troughs [documented]; the greenery in them [assumed] */
export const PLANTER = 0xb7b0a1;

/** a terrace's open floor: on the box's roof, inside its edge, with nothing standing on it */
const openAt = (bx: Box, x: number, z: number) =>
  inRect(x, z, [bx.r[0] + 1, bx.r[1] + 1, bx.r[2] - 1, bx.r[3] - 1]) &&
  [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dz]) => !standsOnRoof(bx, x + dx, z + dz));
const allOpen = (bx: Box, r: Rect) => {
  for (let z = r[1]; z < r[3]; z++) for (let x = r[0]; x < r[2]; x++) if (!openAt(bx, x, z)) return false;
  return true;
};
export const openArea = (bx: Box) => {
  let n = 0;
  for (let z = bx.r[1]; z < bx.r[3]; z++) for (let x = bx.r[0]; x < bx.r[2]; x++) if (openAt(bx, x, z)) n++;
  return n;
};

/** where a terrace's planter goes: a 2 × 8 trough along one of its edges, inside the guardrail [assumed] */
export function planterSpot(bx: Box): Rect | null {
  const [x0, z0, x1, z1] = bx.r;
  const spots: Rect[] = [];
  for (let u = 0; u + 8 <= Math.max(x1 - x0, z1 - z0) - 2; u += 2) {
    if (x0 + 1 + u + 8 <= x1 - 1) spots.push([x0 + 1 + u, z0 + 1, x0 + 9 + u, z0 + 3], [x0 + 1 + u, z1 - 3, x0 + 9 + u, z1 - 1]);
    if (z0 + 1 + u + 8 <= z1 - 1) spots.push([x0 + 1, z0 + 1 + u, x0 + 3, z0 + 9 + u], [x1 - 3, z0 + 1 + u, x1 - 1, z0 + 9 + u]);
  }
  const k = Math.floor(hash2(bx.x, bx.z * 7 + bx.l) * spots.length);
  for (let i = 0; i < spots.length; i++) {
    const s = spots[(k + i) % spots.length];
    if (allOpen(bx, s)) return s;
  }
  return null;
}
export const PLANTERS = BOXES.map(planterSpot);

function tree(b: Builder, x: number, z: number, y: number, h: number, big: boolean) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x6a5a48, 'round');
  const c = LEAF[Math.floor(hash2(x, z) * 3)];
  // the crown in a few square layers, each one piece [assumed]
  const rings = big ? [3, 5, 6, 5, 3] : [1, 2, 1];
  rings.forEach((r, i) => b.add(x - r, z - r, y + h + i * 3, 2 * r + 1, 2 * r + 1, 3, c, 'brick'));
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // [documented] the roof gardens: a planter on each terrace, its shrubs; a small tree on the roomiest
  BOXES.forEach((bx, i) => {
    const s = PLANTERS[i];
    if (!s) return;
    const y = levelY(bx.l + 1) + 1;
    b.newGroup();
    b.box(s[0], s[1], s[2], s[3], y, y + 3, { kind: 'brick', unit: 3, sizes: [[8, 2], [4, 2], [2, 2], [1, 1]], color: PLANTER });
    b.box(s[0], s[1], s[2], s[3], y + 3, y + 4, { kind: 'plate', sizes: [[8, 2], [4, 2], [2, 2], [1, 1]], color: LEAF[i % 3] });
    for (let k = 0; k < 3; k++) {
      const along = s[2] - s[0] > s[3] - s[1];
      const x = along ? s[0] + 1 + k * 3 : s[0], z = along ? s[1] : s[1] + 1 + k * 3;
      b.box(x, z, x + 2, z + 2, y + 4, y + 7, { kind: 'brick', color: LEAF[(i + k) % 3] });
    }
    if (openArea(bx) > 380 && hash2(bx.x, bx.l) < 0.5) {
      const cx = Math.floor((bx.r[0] + bx.r[2]) / 2), cz = Math.floor((bx.r[1] + bx.r[3]) / 2);
      if (allOpen(bx, [cx - 3, cz - 3, cx + 4, cz + 4]) && !inRect(cx, cz, [s[0] - 3, s[1] - 3, s[2] + 3, s[3] + 3])) {
        b.box(cx - 1, cz - 1, cx + 2, cz + 2, y, y + 3, { kind: 'brick', unit: 3, color: PLANTER });
        tree(b, cx, cz, y + 3, 6, false);
      }
    }
  });
  // [assumed] trees on the lawns round the complex, clear of it, the avenue and the paths
  for (let gz = TERRAIN.z0 + 10; gz < TERRAIN.z1 - 10; gz += 34)
    for (let gx = TERRAIN.x0 + 10; gx < TERRAIN.x1 - 10; gx += 34) {
      const x = gx + Math.floor(hash2(gx, gz) * 11) - 5, z = gz + Math.floor(hash2(gz, gx) * 11) - 5;
      if (hash2(x * 3, z * 7) < 0.4) continue;
      let clear = true;
      for (let dz = -8; dz <= 8 && clear; dz += 2) for (let dx = -8; dx <= 8 && clear; dx += 2) if (streetAt(x + dx, z + dz) || built(x + dx, z + dz)) clear = false;
      // not under the boxes' cantilevers: inside OSM's outline the ground is the building's
      if (inPoly(x, z, LOT_SELF[0]) || BOXES.some((bx) => inRect(x, z, [bx.r[0] - 8, bx.r[1] - 8, bx.r[2] + 8, bx.r[3] + 8]))) clear = false;
      if (clear && b.free(x, z, hm.at(x, z), hm.at(x, z) + 30)) tree(b, x, z, hm.at(x, z), 26 + Math.floor(hash2(x, z) * 12), true);
    }
}

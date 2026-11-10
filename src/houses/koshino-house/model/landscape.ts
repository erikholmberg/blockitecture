/**
 * The Koshino House's landscape (spec 039): the pines and broadleaf trees of the national park around it [documented: aerial
 * photograph; species and places assumed], kept off the house, the courtyard and the lawn; and the lot's neighbouring houses
 * from OSM as plain blocks [documented: their outlines; their look assumed].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { inRect, LAWN, LAWN_WALL } from './layout';
import { LOT_BUILDINGS } from './lotTerrain';
import { HeightMap, inCut, onRoad, TERRAIN } from './site';

function inPoly(x: number, z: number, ring: [number, number][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** a Japanese red pine: a tall reddish trunk and flat tiers of needles [assumed: photographs] */
function pine(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x7a4a32, 'round');
  const c = hash2(x, z) < 0.5 ? 0x2f4a2a : 0x36532f;
  b.box(x - 4, z - 4, x + 5, z + 5, y + h - 3, y + h, { kind: 'brick', color: c });
  b.box(x - 2, z - 2, x + 3, z + 3, y + h, y + h + 3, { kind: 'brick', color: c });
  if (h > 50) b.box(x - 3, z - 3, x + 4, z + 4, y + h - 15, y + h - 12, { kind: 'brick', color: c });
}
/** a broadleaf tree: a round crown [assumed] */
function broadleaf(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x5a4a3a, 'round');
  const c = hash2(z, x) < 0.5 ? 0x4b7a3a : 0x3f6a34;
  b.box(x - 3, z - 3, x + 4, z + 4, y + h - 6, y + h, { kind: 'brick', color: c });
  b.box(x - 2, z - 2, x + 3, z + 3, y + h, y + h + 3, { kind: 'brick', color: c });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  for (const bl of LOT_BUILDINGS) b.neighbour(() => {
    b.newGroup();
    const xs = bl.ring.map((p) => p[0]), zs = bl.ring.map((p) => p[1]);
    const bx0 = Math.max(TERRAIN.x0, Math.floor(Math.min(...xs))), bx1 = Math.min(TERRAIN.x1, Math.ceil(Math.max(...xs)));
    const bz0 = Math.max(TERRAIN.z0, Math.floor(Math.min(...zs))), bz1 = Math.min(TERRAIN.z1, Math.ceil(Math.max(...zs)));
    const inside = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, bl.ring);
    let lo = Infinity, hi = -Infinity;
    for (let z = bz0; z < bz1; z++) for (let x = bx0; x < bx1; x++) if (inside(x, z)) { lo = Math.min(lo, hm.at(x, z)); hi = Math.max(hi, hm.at(x, z)); }
    if (lo === Infinity) return;
    const top = hi + 24;
    b.box(bx0, bz0, bx1, bz1, lo, top, { kind: 'brick', color: 0xe6e2d8, mask: inside });
    b.box(bx0, bz0, bx1, bz1, top, top + 1, { kind: 'plate', color: 0x6c6e68, mask: inside });
  });

  const near = (x: number, z: number, d: number) => {
    for (let dz = -d; dz <= d; dz += d) for (let dx = -d; dx <= d; dx += d) if (inCut(x + dx, z + dz) || onRoad(x + dx, z + dz)) return true;
    return false;
  };
  for (let gz = TERRAIN.z0 + 6; gz < TERRAIN.z1 - 6; gz += 13)
    for (let gx = TERRAIN.x0 + 6; gx < TERRAIN.x1 - 6; gx += 13) {
      const x = gx + Math.floor(hash2(gx, gz) * 7) - 3, z = gz + Math.floor(hash2(gz, gx) * 7) - 3, t = hash2(x * 3, z * 5);
      if (near(x, z, 6) || inRect(x, z, LAWN) || LAWN_WALL.some((r) => inRect(x, z, r))) continue;
      if (LOT_BUILDINGS.some((bl) => inPoly(x, z, bl.ring) || inPoly(x + 5, z + 5, bl.ring) || inPoly(x - 5, z - 5, bl.ring))) continue;
      if (t < 0.15) continue;
      const y = hm.at(x, z);
      if (t < 0.7) pine(b, x, z, y, 36 + 6 * Math.floor(t * 8));
      else broadleaf(b, x, z, y, 24 + 3 * Math.floor(t * 4));
    }
}

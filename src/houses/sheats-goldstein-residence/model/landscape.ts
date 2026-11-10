/**
 * The Sheats-Goldstein Residence's landscape (spec 040): the pool's water; the tropical garden round the house [documented:
 * "jungle", photographs; its plants and places assumed] and chaparral beyond; the tennis court on its podium down the slope
 * [documented: Wikipedia; its place assumed]; and the lot's neighbouring houses from OSM as plain blocks [documented: outlines].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { COURT, COURT_Y, inHouse, inPoly, inPool, inRect, POOL } from './layout';
import { LOT_BUILDINGS } from './lotTerrain';
import { HeightMap, onRoad, TERRAIN } from './site';

/** a fan palm: a thin trunk and a tuft of fronds [assumed] */
function palm(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x7a6a55, 'round');
  const c = hash2(x, z) < 0.5 ? 0x3f7a3a : 0x4b8a40;
  b.box(x - 1, z - 1, x + 2, z + 2, y + h, y + h + 3, { kind: 'brick', color: c });
  for (const [dx, dz] of [[-3, 0], [3, 0], [0, -3], [0, 3]]) b.box(x + Math.min(0, dx), z + Math.min(0, dz), x + Math.max(1, dx + 1), z + Math.max(1, dz + 1), y + h - 1, y + h, { kind: 'plate', color: c });
}
/** tropical undergrowth: a broad, low clump of leaves [assumed] */
function clump(b: Builder, x: number, z: number, y: number, s: number) {
  b.newGroup();
  const c = hash2(z, x) < 0.5 ? 0x2f6a34 : 0x3d7a3a;
  b.box(x, z, x + s, z + s, y, y + 3, { kind: 'brick', color: c });
  if (s > 3) b.box(x + 1, z + 1, x + s - 1, z + s - 1, y + 3, y + 6, { kind: 'brick', color: c });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the pool's water
  b.newGroup();
  const [px0, pz0, px1, pz1] = POOL;
  b.box(px0, pz0, px1, pz1, -9, -1, { kind: 'water', color: 0x6fc6d8, mask: (x, z) => inPool(x, z) && inPool(x - 1, z) && inPool(x + 1, z) && inPool(x, z - 1) && inPool(x, z + 1) });

  // the tennis court on its podium: concrete faces down to the ground, the court's surface and lines, a fence round it
  b.newGroup();
  const [cx0, cz0, cx1, cz1] = COURT;
  const edge = (x: number, z: number) => x === cx0 || x === cx1 - 1 || z === cz0 || z === cz1 - 1;
  let lo = COURT_Y;
  for (let z = cz0; z < cz1; z++) for (let x = cx0; x < cx1; x++) if (edge(x, z)) lo = Math.min(lo, hm.at(x, z));
  b.box(cx0, cz0, cx1, cz1, lo, COURT_Y, { kind: 'brick', color: 0xaaa49a, mask: (x, z, y) => edge(x, z) && y >= hm.at(x, z) });
  b.newGroup();
  const line = (x: number, z: number) => {
    const u = x - cx0 - 15, v = z - cz0 - 9; // the court's 78 × 36 ft inside its run-off
    if (u < 0 || u > 77 || v < 0 || v > 35) return false;
    return u === 0 || u === 77 || v === 0 || v === 35 || v === 4 || v === 31 || u === 38 || ((u === 18 || u === 59) && v > 4 && v < 31) || (v === 17 && u > 18 && u < 59);
  };
  b.box(cx0, cz0, cx1, cz1, COURT_Y - 1, COURT_Y, {
    kind: 'tile', mask: (x, z) => !edge(x, z),
    color: (x, _y, z) => (line(x, z) ? 0xf4f4f4 : x - cx0 >= 15 && x - cx0 < 93 && z - cz0 >= 9 && z - cz0 < 45 ? 0x3f6f8f : 0x4f7a5a),
  });
  b.newGroup();
  for (let x = cx0; x < cx1; x += 6) for (const z of [cz0, cz1 - 1]) b.add(x, z, COURT_Y, 1, 1, 24, 0x2e3436, 'bar');
  for (let z = cz0 + 6; z < cz1 - 1; z += 6) for (const x of [cx0, cx1 - 1]) b.add(x, z, COURT_Y, 1, 1, 24, 0x2e3436, 'bar');

  for (const bl of LOT_BUILDINGS) b.neighbour(() => {
    b.newGroup();
    const xs = bl.ring.map((p) => p[0]), zs = bl.ring.map((p) => p[1]);
    const bx0 = Math.max(TERRAIN.x0, Math.floor(Math.min(...xs))), bx1 = Math.min(TERRAIN.x1, Math.ceil(Math.max(...xs)));
    const bz0 = Math.max(TERRAIN.z0, Math.floor(Math.min(...zs))), bz1 = Math.min(TERRAIN.z1, Math.ceil(Math.max(...zs)));
    const inside = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, bl.ring);
    let l = Infinity, hi = -Infinity;
    for (let z = bz0; z < bz1; z++) for (let x = bx0; x < bx1; x++) if (inside(x, z)) { l = Math.min(l, hm.at(x, z)); hi = Math.max(hi, hm.at(x, z)); }
    if (l === Infinity) return;
    // a shell: walls one stud thick round the outline (nothing inside shows), the roof over it
    const wall = (x: number, z: number) => inside(x, z) && !(inside(x - 1, z) && inside(x + 1, z) && inside(x, z - 1) && inside(x, z + 1));
    b.box(bx0, bz0, bx1, bz1, l, hi + 27, { kind: 'brick', color: 0xeae6dc, mask: (x, z, y) => wall(x, z) && y >= hm.at(x, z) - 3 });
    b.box(bx0, bz0, bx1, bz1, hi + 27, hi + 28, { kind: 'plate', color: 0xb8b2a6, mask: inside });
  });

  // the garden: palms and broad-leaved clumps close round the house, chaparral shrubs beyond
  const clear = (x: number, z: number, d: number) => {
    for (let dz = -d; dz <= d; dz += d) for (let dx = -d; dx <= d; dx += d) {
      const xx = x + dx, zz = z + dz;
      if (inHouse(xx, zz) || inRect(xx, zz, COURT) || onRoad(xx, zz) || LOT_BUILDINGS.some((bl) => inPoly(xx, zz, bl.ring))) return false;
    }
    return true;
  };
  for (let gz = TERRAIN.z0 + 6; gz < TERRAIN.z1 - 6; gz += 12)
    for (let gx = TERRAIN.x0 + 6; gx < TERRAIN.x1 - 6; gx += 12) {
      const x = gx + Math.floor(hash2(gx, gz) * 5) - 2, z = gz + Math.floor(hash2(gz, gx) * 5) - 2, t = hash2(x * 3, z * 5);
      if (!clear(x, z, 4)) continue;
      const y = hm.at(x, z), garden = Math.hypot(x - 10, z - 5) < 110;
      if (garden) {
        if (t < 0.3) palm(b, x, z, y, 30 + 6 * Math.floor(t * 20));
        else if (t < 0.8) clump(b, x, z, y, 3 + Math.floor(t * 3));
      } else if (t < 0.35) clump(b, x, z, y, 2 + Math.floor(t * 4));
    }
}

/**
 * The Lovell Health House's landscape (spec 034): the pool's water, chaparral and live oaks on the canyon slope
 * [assumed: photographs], and the lot's other buildings from OSM as plain white blocks [documented: their outlines; look
 * assumed]: among them the 1929 garage and studio up by the street (HABS sheet 9).
 */
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { inAny, POOL, POOL_CRADLE, Rect, ROOFS, TERRACE, BALCONY, BALCONY_N, Y } from './layout';
import { LOT_BUILDINGS } from './lotTerrain';
import { HeightMap, PADS, TERRAIN } from './site';

function inPoly(x: number, z: number, ring: [number, number][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** a live oak: a short trunk and a broad, low crown */
function oak(b: Builder, x: number, z: number, y: number, r: () => number) {
  b.newGroup();
  const h = 12 + 3 * Math.floor(r() * 4), w = 9 + 2 * Math.floor(r() * 3), o = (w - 1) >> 1;
  b.column(x, z, y, y + h, 0x5a4a3a, 'round');
  const c = r() < 0.5 ? 0x46603a : 0x52683f;
  b.box(x - o + 1, z - o + 1, x - o + w - 1, z - o + w - 1, y + h, y + h + 3, { kind: 'brick', color: c });
  b.box(x - o, z - o, x - o + w, z - o + w, y + h + 3, y + h + 6, { kind: 'brick', color: c });
  b.box(x - o + 2, z - o + 2, x - o + w - 2, z - o + w - 2, y + h + 6, y + h + 9, { kind: 'brick', color: c });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  b.newGroup();
  const [x0, z0, x1, z1] = POOL;
  b.add(x0, z0, Y.POOL_BOTTOM, x1 - x0, z1 - z0, Y.WATER - Y.POOL_BOTTOM, 0x7fd8ea, 'water');

  for (const bl of LOT_BUILDINGS) b.neighbour(() => {
    b.newGroup();
    const xs = bl.ring.map((p) => p[0]), zs = bl.ring.map((p) => p[1]);
    const bx0 = Math.floor(Math.min(...xs)), bx1 = Math.ceil(Math.max(...xs)), bz0 = Math.floor(Math.min(...zs)), bz1 = Math.ceil(Math.max(...zs));
    // clipped to the lot: beyond it the neighbourhood renderer has its own terrain
    const inside = (x: number, z: number) => x >= TERRAIN.x0 && x < TERRAIN.x1 && z >= TERRAIN.z0 && z < TERRAIN.z1 && inPoly(x + 0.5, z + 0.5, bl.ring);
    let lo = Infinity, hi = -Infinity;
    for (let z = bz0; z < bz1; z++) for (let x = bx0; x < bx1; x++) if (inside(x, z)) { lo = Math.min(lo, hm.at(x, z)); hi = Math.max(hi, hm.at(x, z)); }
    if (lo === Infinity) return;
    const top = hi + 27;
    b.box(bx0, bz0, bx1, bz1, lo, top, { kind: 'brick', color: 0xeae6dc, mask: inside });
    b.box(bx0, bz0, bx1, bz1, top, top + 1, { kind: 'plate', color: 0xb8b2a6, mask: inside });
  });

  const keepOut: Rect[] = [...ROOFS, TERRACE, BALCONY, BALCONY_N, POOL_CRADLE, ...PADS.map(([r]) => r)];
  const r = rng(1929);
  for (let gz = TERRAIN.z0 + 10; gz < TERRAIN.z1 - 10; gz += 11)
    for (let gx = TERRAIN.x0 + 10; gx < TERRAIN.x1 - 10; gx += 11) {
      const x = gx + Math.floor(hash2(gx, gz) * 7) - 3, z = gz + Math.floor(hash2(gz, gx) * 7) - 3;
      let blocked = false;
      for (const [dx, dz] of [[0, 0], [-5, -5], [5, -5], [-5, 5], [5, 5]]) {
        if (inAny(x + dx, z + dz, keepOut) || LOT_BUILDINGS.some((bl) => inPoly(x + dx, z + dz, bl.ring))) blocked = true;
      }
      if (blocked) continue;
      const y = hm.at(x, z), t = hash2(x * 5, z * 3);
      if (t < 0.12) oak(b, x, z, y, r);
      else if (t < 0.45) {
        b.newGroup();
        const s = 3 + Math.floor(r() * 3);
        b.box(x, z, x + s, z + s, y, y + 3, { kind: 'brick', color: t < 0.35 ? 0x5f6e44 : 0x6b7550 });
        if (s > 4) b.box(x + 1, z + 1, x + s - 1, z + s - 1, y + 3, y + 6, { kind: 'brick', color: 0x56663f });
      }
    }
}

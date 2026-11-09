/**
 * Casa Luis Barragán's garden (spec 035): dense, wild and tall [documented: the nomination's description], as block trees and
 * undergrowth [assumed: species and places]; the patio's clay pots and the reflecting pool [documented: 13, 14]; trees along the
 * street; the lot's other building from OSM as a plain block [documented: its outline; its look assumed].
 */
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { GARDEN, GARDEN_TERRACE, PATIO, POOL, SIDEWALK, Y } from './layout';
import { LOT_BUILDINGS } from './lotTerrain';
import { HeightMap, TERRAIN } from './site';

function inPoly(x: number, z: number, ring: [number, number][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** a tall garden tree: a thin trunk and a broad crown in layers */
function tree(b: Builder, x: number, z: number, y: number, h: number, w: number, color: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x5a4a3a, 'round');
  const o = (w - 1) >> 1;
  b.box(x - o + 2, z - o + 2, x - o + w - 2, z - o + w - 2, y + h - 6, y + h - 3, { kind: 'brick', color });
  b.box(x - o, z - o, x - o + w, z - o + w, y + h - 3, y + h + 3, { kind: 'brick', color });
  b.box(x - o + 2, z - o + 2, x - o + w - 2, z - o + w - 2, y + h + 3, y + h + 6, { kind: 'brick', color });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  b.newGroup();
  const [px0, pz0, px1, pz1] = POOL;
  b.add(px0, pz0, -6, px1 - px0, pz1 - pz0, 2, 0x6fa7b2, 'water');
  // the patio's clay pots, standing on the volcanic stone [documented: "patio de las ollas"]
  b.newGroup();
  const r = rng(1948);
  for (let z = PATIO[1] + 1; z < PATIO[3] - 2; z += 3) for (let x = PATIO[0] + 2; x < PATIO[2] - 2; x += 3) if (r() < 0.55) b.add(x, z, Y.GARDEN, 2, 2, 3 + 3 * Math.floor(r() * 2), r() < 0.5 ? 0xa9603a : 0x8e4f30, 'round');

  // the garden: tall trees close together, undergrowth beneath, off the paved terrace
  const [gx0, gz0, gx1, gz1] = GARDEN;
  for (let gz = gz0 + 5; gz < GARDEN_TERRACE[1] - 2; gz += 9)
    for (let gx = gx0 + 5; gx < gx1 - 4; gx += 9) {
      const x = gx + Math.floor(hash2(gx, gz) * 5) - 2, z = gz + Math.floor(hash2(gz, gx) * 5) - 2, t = hash2(x * 3, z * 7);
      const y = hm.at(x, z);
      if (t < 0.4) tree(b, x, z, y, 45 + 3 * Math.floor(t * 20), 9 + 2 * Math.floor(t * 5), t < 0.2 ? 0x3e6a34 : 0x4b7a3a);
      else {
        b.newGroup();
        const s = 3 + Math.floor(t * 4);
        b.box(x, z, x + s, z + s, y, y + 3 + 3 * Math.floor(t * 2), { kind: 'brick', color: t < 0.7 ? 0x3f6436 : 0x55803f });
      }
    }
  // trees along the street [documented: photograph, p. 9]
  for (let x = TERRAIN.x0 + 8; x < TERRAIN.x1 - 8; x += 26) {
    const z = SIDEWALK[1] + 4;
    tree(b, x, z, hm.at(x, z), 33 + 3 * Math.floor(hash2(x, z) * 4), 11, 0x4f7a3e);
  }
  // the lot's other building, a plain block clipped to the lot
  for (const bl of LOT_BUILDINGS) {
    b.newGroup();
    const xs = bl.ring.map((p) => p[0]), zs = bl.ring.map((p) => p[1]);
    const bx0 = Math.max(TERRAIN.x0, Math.floor(Math.min(...xs))), bx1 = Math.min(TERRAIN.x1, Math.ceil(Math.max(...xs)));
    const bz0 = Math.max(TERRAIN.z0, Math.floor(Math.min(...zs))), bz1 = Math.min(TERRAIN.z1, Math.ceil(Math.max(...zs)));
    const inside = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, bl.ring);
    const g = hm.at((bx0 + bx1) >> 1, (bz0 + bz1) >> 1);
    b.box(bx0, bz0, bx1, bz1, g, Y.ROOF, { kind: 'brick', color: 0xcfc8bb, mask: inside });
    b.box(bx0, bz0, bx1, bz1, Y.ROOF, Y.ROOF + 1, { kind: 'plate', color: 0xa9a297, mask: inside });
  }
}

/**
 * The Vanna Venturi House's landscape (spec 044): the tall deciduous trees round the lawn and behind the house [documented:
 * the survey's many trees and the photographs; places assumed], the arc of crabapples on the front lawn [documented: Philadelphia
 * Magazine; places assumed], and the neighbouring house on the lot's edge from OSM as a plain block [documented: its outline;
 * its look assumed].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { HOUSE, MID, Rect } from './layout';
import { LOT_BUILDINGS } from './lotTerrain';
import { HeightMap, onDrive, TERRAIN } from './site';

function inPoly(x: number, z: number, ring: [number, number][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** a tall deciduous tree: an oak or a tulip tree, with a wide crown in two tiers [assumed] */
function oak(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x5c4a3a, 'round');
  const c = hash2(z, x) < 0.5 ? 0x4b7a3a : 0x426f35;
  const round = (r: number) => (xx: number, zz: number) => Math.hypot(xx - x, zz - z) < r && !(xx === x && zz === z);
  b.box(x - 6, z - 6, x + 7, z + 7, y + h - 18, y + h - 9, { kind: 'brick', color: c, mask: round(5.2) });
  b.box(x - 7, z - 7, x + 8, z + 8, y + h - 9, y + h - 3, { kind: 'brick', color: c, mask: round(6.8) });
  b.box(x - 4, z - 4, x + 5, z + 5, y + h - 3, y + h + 3, { kind: 'brick', color: c, mask: (xx, zz) => Math.hypot(xx - x, zz - z) < 4.4 });
}
/** a crabapple: a short trunk and a low round crown, in pink blossom [assumed: the season] */
function crabapple(b: Builder, x: number, z: number, y: number) {
  b.newGroup();
  b.column(x, z, y, y + 9, 0x5a4636, 'round');
  b.box(x - 2, z - 2, x + 3, z + 3, y + 9, y + 15, { kind: 'brick', color: (xx, yy, zz) => (hash2(xx * 3 + yy, zz) < 0.35 ? 0xe7a3b6 : 0x5f8a45) });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the neighbour on the lot's north-west edge
  for (const bl of LOT_BUILDINGS) b.neighbour(() => {
    b.newGroup();
    const xs = bl.ring.map((p) => p[0]), zs = bl.ring.map((p) => p[1]);
    const bx0 = Math.max(TERRAIN.x0, Math.floor(Math.min(...xs))), bx1 = Math.min(TERRAIN.x1, Math.ceil(Math.max(...xs)));
    const bz0 = Math.max(TERRAIN.z0, Math.floor(Math.min(...zs))), bz1 = Math.min(TERRAIN.z1, Math.ceil(Math.max(...zs)));
    const inside = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, bl.ring);
    let lo = Infinity, hi = -Infinity;
    for (let z = bz0; z < bz1; z++) for (let x = bx0; x < bx1; x++) if (inside(x, z)) { lo = Math.min(lo, hm.at(x, z)); hi = Math.max(hi, hm.at(x, z)); }
    if (lo === Infinity) return;
    const top = hi + 54;
    b.box(bx0, bz0, bx1, bz1, lo, top, { kind: 'brick', color: 0xd9d2c4, mask: inside });
    b.box(bx0, bz0, bx1, bz1, top, top + 1, { kind: 'plate', color: 0x5d5f5c, mask: inside });
  });

  // the arc of crabapples on the front lawn, either side of the drive [documented: "an arc of crabapples"; places assumed]
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.15 + (0.7 * i) / 8), r = 52;
    const x = Math.round(MID + Math.cos(a) * r * 1.4), z = Math.round(-6 - Math.sin(a) * r);
    if (onDrive(x, z) || onDrive(x + 3, z) || onDrive(x - 3, z)) continue;
    crabapple(b, x, z, hm.at(x, z));
  }

  // tall trees round the lawn and behind the house, kept off the house, the drive and the neighbour [documented: the survey]
  const keepOff: Rect = [HOUSE[0] - 14, HOUSE[1] - 70, HOUSE[2] + 14, HOUSE[3] + 34];
  const blocked = (x: number, z: number) =>
    (x >= keepOff[0] && x < keepOff[2] && z >= keepOff[1] && z < keepOff[3]) || onDrive(x, z) ||
    LOT_BUILDINGS.some((bl) => inPoly(x, z, bl.ring) || inPoly(x + 6, z + 6, bl.ring) || inPoly(x - 6, z - 6, bl.ring));
  for (let gz = TERRAIN.z0 + 8; gz < TERRAIN.z1 - 6; gz += 17)
    for (let gx = TERRAIN.x0 + 8; gx < TERRAIN.x1 - 6; gx += 17) {
      const x = gx + Math.floor(hash2(gx, gz) * 9) - 4, z = gz + Math.floor(hash2(gz, gx) * 9) - 4, t = hash2(x * 3, z * 5);
      // more trees behind the house and along the lot's sides than out on the front lawn [documented: photographs]
      const lawn = z < -10 && Math.abs(x - MID) < 50;
      if (t < (lawn ? 0.75 : 0.25) || blocked(x, z) || blocked(x + 5, z + 5) || blocked(x - 5, z - 5)) continue;
      oak(b, x, z, hm.at(x, z), 54 + Math.floor(t * 30));
    }
}

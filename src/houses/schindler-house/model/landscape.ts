/**
 * The Schindler House's gardens (spec 081): "two private outdoor living rooms and several garden courts" [documented: NRHP].
 * The patios' lawns level with the floor and the sunken gardens beside them [documented: HABS; their outline and depth assumed,
 * spec 081 Q4]; the square stepping stones down the west patio's edge [documented: HABS sheet 3]; the tall hedges [documented;
 * their lines and height assumed]; the bamboo along the street [documented: "behind bamboo shoots"; its line assumed]; the
 * driveway's two concrete strips and the sidewalk on the south side [documented: HABS]; street trees on Kings Road [assumed].
 */
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { BAMBOO, DRIVE_STRIPS, HEDGES, inHouse, inRect, Rect, SIDE_WALK, STEPPING_STONES } from './layout';
import { inChimney } from './layout';
import { HeightMap, lawnTop, streetAt, TERRAIN } from './site';

export const LAWN = [0x6a9a48, 0x74a34e];
export const HEDGE = [0x3e6b37, 0x4a7840, 0x36603a];
export const BAMBOO_GREEN = [0x7d9a3e, 0x6c8c36, 0x8aa648];
const STONE = 0xc4bfb3;
const STRIP = 0xc9c4b8;
const LEAVES = [0x3d6a34, 0x4a7a3a, 0x557f3f];
/** the hedges' height: "tall hedges" [documented], about 10 ft [assumed] */
export const HEDGE_TOP = 25;

/** a street tree: a trunk and a layered crown [assumed] */
function tree(b: Builder, x: number, z: number, y: number, trunk: number, rs: number[], colors: number[]) {
  b.newGroup();
  b.box(x, z, x + 1, z + 1, y, y + trunk, { kind: 'round', color: 0x5a4636 });
  rs.forEach((r, i) =>
    b.box(Math.floor(x - r), Math.floor(z - r), Math.ceil(x + r) + 1, Math.ceil(z + r) + 1, y + trunk + i * 3, y + trunk + 3 + i * 3, {
      kind: 'brick', color: colors[i % colors.length], mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3,
    }));
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  const [lx0, lz0, lx1, lz1] = [TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1];
  // the stepping stones, 2 ft square, set in the lawn [documented]
  b.newGroup();
  for (const s of STEPPING_STONES) b.box(s[0], s[1], s[2], s[3], -12, 12, { kind: 'tile', color: STONE, mask: (x, z, y) => y === (lawnTop(x, z) ?? hm.at(x, z)) - 1 });
  // the lawns: the two patios level with the floor, and the sunken gardens [documented]
  b.newGroup();
  b.box(-48, 20, 104, 76, -10, 1, {
    kind: 'plate', color: (x, _y, z) => LAWN[Math.floor(hash2(Math.floor(x / 4), Math.floor(z / 4)) * 2)],
    mask: (x, z, y) => { const t = lawnTop(x, z); return t !== null && y === t - 1 && !inHouse(x, z) && !inChimney(x, z); },
  });
  // the driveway's two concrete strips to the garage [documented], and the sidewalk on the lot's south side [documented]
  b.newGroup();
  for (const r of [...DRIVE_STRIPS, SIDE_WALK] as Rect[])
    b.box(r[0], r[1], Math.min(r[2], 136), r[3], -12, 12, { kind: 'tile', color: STRIP, mask: (x, z, y) => y === hm.at(x, z) && !streetAt(x + 0.5, z + 0.5) });
  // the tall hedges [documented]
  for (const r of HEDGES) {
    b.newGroup();
    b.box(r[0], r[1], r[2], r[3], -12, HEDGE_TOP, {
      kind: 'brick', color: (x, y, z) => HEDGE[Math.floor(hash2(Math.floor(x / 3) + y, Math.floor(z / 3)) * 3)],
      mask: (x, z, y) => y >= (lawnTop(x, z) ?? hm.at(x, z)),
    });
  }
  // the bamboo along the street front [documented]: clumps of tall thin culms, stacked round pieces; a gap for the driveway
  const r = rng(1922);
  for (let z = BAMBOO[1]; z < BAMBOO[3]; z += 5)
    for (let x = BAMBOO[0]; x < BAMBOO[2]; x += 5) {
      if (z >= -13 && z < -3) continue;
      if (r() < 0.3) continue;
      b.newGroup();
      const base = hm.at(x, z), n = 2 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const cx = x + Math.floor(r() * 3), cz = z + Math.floor(r() * 3);
        const top = base + 27 + 3 * Math.floor(r() * 5);
        const c = BAMBOO_GREEN[Math.floor(r() * 3)];
        if (!b.free(cx, cz, base, top)) continue;
        b.column(cx, cz, base, top, c, 'round');
        // a few leaves at its top
        b.box(cx - 1, cz - 1, cx + 2, cz + 2, top, top + 2, { kind: 'plate', color: BAMBOO_GREEN[1], mask: (xx, zz) => xx === cx || zz === cz || hash2(xx * 5, zz * 3) < 0.4 });
      }
    }
  // street trees in the parkway on both sides of Kings Road [assumed]
  for (const [x, z] of [[140, 6], [140, 34], [140, 62], [184, 10], [184, 44], [184, 78]]) {
    if (x >= lx1 || z >= lz1 || x < lx0 || z < lz0) continue;
    tree(b, x, z, hm.at(x, z), 24, [4, 6, 6, 5, 3], LEAVES);
  }
  // a few garden trees by the hedges [assumed]
  for (const [x, z] of [[-30, 10], [108, 70], [-24, 86], [60, 66]]) {
    if (!inRect(x, z, [lx0, lz0, lx1, lz1])) continue;
    tree(b, x, z, hm.at(x, z), 21, [3, 5, 5, 4, 2], LEAVES);
  }
}

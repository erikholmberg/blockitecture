/**
 * The Haus am Horn's garden (spec 063): the hedge round the kitchen garden's four beds [documented], the big copper beech
 * south-west of the house [documented: not original, protected], small fruit trees by the path up from the gate [documented],
 * the plain wire fence along the street [documented], and the plot's other trees [assumed].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { inRect } from './layout';
import { HeightMap, KITCHEN_GARDEN, LAWN, streetAt, TERRAIN } from './site';

function tree(b: Builder, x: number, z: number, y: number, h: number, rs: number[], colors: number[]) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x5a4636, 'round');
  rs.forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + h + i * 3, y + h + 3 + i * 3, { kind: 'brick', color: colors[i % colors.length], mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3 }));
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the kitchen garden's hedge
  b.newGroup();
  const [x0, z0, x1, z1] = KITCHEN_GARDEN;
  for (let x = x0; x < x1; x++) for (const z of [z0, z1 - 1]) if (!(z === z1 - 1 && x >= 18 && x < 24)) b.add(x, z, hm.at(x, z), 1, 1, 6, 0x2f5a2c, 'brick');
  for (let z = z0 + 1; z < z1 - 1; z++) for (const x of [x0, x1 - 1]) b.add(x, z, hm.at(x, z), 1, 1, 6, 0x2f5a2c, 'brick');
  // the copper beech
  tree(b, 62, 64, hm.at(62, 64), 30, [4, 6, 8, 9, 9, 8, 6, 4], [0x6b2f3a, 0x7a3642]);
  // fruit trees by the gate's path
  for (const z of [62, 78, 94]) tree(b, -15, z, hm.at(-15, z), 12, [2, 3, 3, 2], [0x6fa04a, 0x7fb055]);
  // the fence along the street: black posts and wire [documented], set back from the pavement
  b.newGroup();
  for (let x = TERRAIN.x0 + 20; x < TERRAIN.x1 - 20; x++) {
    let z = LAWN[3] + 20;
    while (z < TERRAIN.z1 - 8 && !streetAt(x, z + 3)) z++;
    if (z >= TERRAIN.z1 - 8 || (x >= -9 && x < -4)) continue; // the gate
    const y = hm.at(x, z);
    if (x % 4 === 0) b.add(x, z, y, 1, 1, 9, 0x2a2b2d, 'bar');
    else b.add(x, z, y + 7, 1, 1, 1, 0x2a2b2d, 'tile');
  }
  // the plot's other trees, clear of the lawn, the kitchen garden and the street
  for (let gz = TERRAIN.z0 + 8; gz < TERRAIN.z1 - 8; gz += 24)
    for (let gx = TERRAIN.x0 + 8; gx < TERRAIN.x1 - 8; gx += 24) {
      const x = gx + Math.floor(hash2(gx, gz) * 9) - 4, z = gz + Math.floor(hash2(gz, gx) * 9) - 4;
      if (hash2(x * 3, z * 7) < 0.4 || inRect(x, z, [LAWN[0] - 6, LAWN[1] - 6, LAWN[2] + 6, LAWN[3] + 6]) || inRect(x, z, [x0 - 6, z0 - 6, x1 + 6, z1 + 6])) continue;
      let clear = true;
      for (let dz = -6; dz <= 6 && clear; dz += 2) for (let dx = -6; dx <= 6 && clear; dx += 2) if (streetAt(x + dx, z + dz) || !b.free(x + dx, z + dz, hm.at(x, z), hm.at(x, z) + 40)) clear = false;
      if (clear) tree(b, x, z, hm.at(x, z), 22 + Math.floor(hash2(x, z) * 12), [3, 4, 5, 5, 4, 2], [0x4c7638, 0x5a8640]);
    }
}

/**
 * The Sonneveld House's garden (spec 060): clipped evergreen hedges round the street garden's lawn [documented], the private
 * garden to the south and east with softer planting [documented; its beds assumed], and the Museumpark's trees [assumed].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { BLOCK, GARAGE, inRect } from './layout';
import { HeightMap, PLOT, streetAt, TERRAIN } from './site';

const HEDGE = 0x2f5a2c;

function tree(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x5a4636, 'round');
  const c = hash2(x, z) < 0.5 ? 0x4c7638 : 0x5a8640;
  [3, 4, 5, 5, 4, 2].forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + h + i * 3, y + h + 3 + i * 3, { kind: 'brick', color: c, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3 }));
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  const [x0, z0, x1, z1] = PLOT;
  // the hedges: along the street and the south side of the plot, a gap at the drive [documented: clipped evergreen hedges]
  b.newGroup();
  for (let x = x0; x < x1 - 14; x++) if (!streetAt(x, z0)) b.add(x, z0, hm.at(x, z0), 1, 1, 6, HEDGE, 'brick');
  for (let z = z0 + 1; z < z1; z++) if (!streetAt(x0, z)) b.add(x0, z, hm.at(x0, z), 1, 1, 6, HEDGE, 'brick');
  // a low retaining wall between the street garden and the private garden behind [documented]
  b.newGroup();
  for (let z = z0 + 1; z < 0; z++) b.add(-10, z, hm.at(-10, z), 1, 1, 3, 0xd8d4c8, 'brick');
  // softer planting along the private garden's east edge [documented; the beds assumed]
  b.newGroup();
  for (let x = x0 + 4; x < 30; x += 3) { const z = z1 - 4 + Math.floor(hash2(x, 7) * 2); b.add(x, z, hm.at(x, z), 2, 2, 3 + 3 * Math.floor(hash2(x, 3) * 2), hash2(x, 5) < 0.5 ? 0x5c8a3f : 0x7fa052, 'brick'); }
  // trees: two in the garden, and the park's round the plot, clear of the house, the streets and the neighbours
  const spots: [number, number][] = [[-36, 30], [-44, -10]];
  for (let gz = TERRAIN.z0 + 8; gz < TERRAIN.z1 - 8; gz += 24)
    for (let gx = TERRAIN.x0 + 8; gx < TERRAIN.x1 - 8; gx += 24) {
      const x = gx + Math.floor(hash2(gx, gz) * 9) - 4, z = gz + Math.floor(hash2(gz, gx) * 9) - 4;
      if (hash2(x * 3, z * 7) < 0.45 || inRect(x, z, [PLOT[0] - 4, PLOT[1] - 4, PLOT[2] + 8, PLOT[3] + 4])) continue;
      spots.push([x, z]);
    }
  for (const [x, z] of spots) {
    if (inRect(x, z, [BLOCK[0] - 12, BLOCK[1] - 10, GARAGE[2] + 8, GARAGE[3] + 8])) continue;
    let clear = true;
    for (let dz = -6; dz <= 6 && clear; dz++) for (let dx = -6; dx <= 6 && clear; dx++) if (streetAt(x + dx, z + dz) || !b.free(x + dx, z + dz, hm.at(x, z), hm.at(x, z) + 40)) clear = false;
    if (clear) tree(b, x, z, hm.at(x, z), 24 + Math.floor(hash2(x, z) * 12));
  }
}

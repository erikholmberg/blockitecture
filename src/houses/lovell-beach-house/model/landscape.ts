/**
 * The Lovell Beach House's landscape (spec 056): the rail round the roof's sun deck [documented: the sun deck; its rail
 * assumed], and palms in the garden toward the ocean and along 13th Street [assumed: photographs of the street].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { SUN_DECK, Y } from './layout';
import { HeightMap, streetAt } from './site';

/** a fan palm: a tall bare trunk and a tuft of fronds [assumed] */
function palm(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x7a6650, 'round');
  const c = hash2(x, z) < 0.5 ? 0x4f7a3a : 0x5c8a3f;
  b.box(x - 2, z - 2, x + 3, z + 3, y + h, y + h + 3, { kind: 'brick', color: c, mask: (xx, zz) => Math.abs(xx - x) + Math.abs(zz - z) <= 3 });
  b.box(x - 1, z - 1, x + 2, z + 2, y + h + 3, y + h + 6, { kind: 'brick', color: c });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the sun deck's rail: a wooden top rail on posts along its open sides [assumed]
  b.newGroup();
  const [x0, z0, x1, z1] = SUN_DECK;
  const cells: [number, number][] = [];
  for (let x = x0 + 1; x < x1; x++) cells.push([x, z0 + 1]);
  for (let z = z0 + 2; z < z1; z++) cells.push([x0 + 1, z]);
  cells.forEach(([x, z], i) => { if (i % 3 === 0) b.add(x, z, Y.ROOF, 1, 1, 8, 0x8a6a4a, 'bar'); });
  cells.forEach(([x, z], i) => { if (i % 3) b.add(x, z, Y.ROOF + 7, 1, 1, 1, 0x8a6a4a, 'tile'); });
  // palms: in the garden toward the ocean and along 13th Street [assumed]
  for (const [x, z, h] of [[70, 6, 70], [86, 24, 82], [96, 10, 64], [-6, 44, 78], [40, 44, 74], [92, 44, 80]] as const)
    if (!streetAt(x, z) && b.free(x, z, hm.at(x, z), hm.at(x, z) + h)) palm(b, x, z, hm.at(x, z), h);
}

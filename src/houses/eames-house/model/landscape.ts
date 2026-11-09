/**
 * The Eames House landscape (spec 010b): the eucalyptus row east of the walkway, the meadow, the three Venice pier
 * pilings on the south patio, the carport's canvas awning, potted plants in the courtyard.
 */
import { C } from '@/engine/catalog';
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { CARPORT, COURT, EUCALYPTUS_X, MEADOW, PATIO, WALL_X, Y } from './layout';
import { HeightMap, TERRAIN } from './site';

const BARK = [0xd9d3c4, 0xcfc6b2, 0xe2dccd];
const LEAVES = [C.sandGreen, 0x9aa88a, 0x8c9a76];

/**
 * a eucalyptus: a tall, pale, slightly leaning trunk and a high, loose crown (heights in plates). Every crown clump
 * hangs off a branch that runs out from the trunk at its height, so nothing floats.
 */
function eucalyptus(b: Builder, x: number, z: number, y: number, h: number, r: () => number) {
  b.newGroup();
  const lean = r() < 0.5 ? -1 : 1;
  const trunkAt: number[] = []; // trunk x at each plate height
  let tx = x, bark = BARK[0];
  for (let i = 0; i < h; i += 3) {
    if (i > 0 && i % 45 === 0 && r() < 0.6) tx += lean; // a gentle lean
    if (i % 24 === 0) bark = BARK[Math.floor(r() * BARK.length)]; // bark changes in long, subtle runs
    const thick = i < h * 0.55 ? 2 : 1;
    b.add(tx, z, y + i, thick, thick, 3, bark, 'round', { studs: false });
    for (let k = 0; k < 3; k++) trunkAt[i + k] = tx;
  }
  // crown: branches out from the upper trunk, each ending in a clump of leaves
  const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  for (let c = 0; c < 16; c++) {
    const by = Math.min(h - 3, Math.round(h * (0.58 + r() * 0.4)));
    const [dx, dz] = dirs[Math.floor(r() * dirs.length)];
    const len = 2 + Math.floor(r() * 4);
    const bx = trunkAt[by] ?? tx;
    for (let s = 1; s <= len; s++) b.add(bx + dx * s, z + dz * s, y + by, 1, 1, 1, C.darkTan, 'plate'); // branch
    const ex = bx + dx * len, ez = z + dz * len, col = LEAVES[Math.floor(r() * LEAVES.length)];
    const w = 4 + Math.floor(r() * 4);
    // the clump sits on the branch's tip, with a smaller cap above and a drooping layer below
    b.box(ex - (w >> 1), ez - (w >> 1), ex - (w >> 1) + w, ez - (w >> 1) + w, y + by + 1, y + by + 2, { kind: 'plate', color: col });
    b.box(ex - (w >> 1) + 1, ez - (w >> 1) + 1, ex - (w >> 1) + w - 1, ez - (w >> 1) + w - 1, y + by - 1, y + by, { kind: 'plate', color: col });
    b.box(ex - (w >> 1) + 1, ez - (w >> 1) + 1, ex - (w >> 1) + w - 1, ez - (w >> 1) + w - 1, y + by + 2, y + by + 3, { kind: 'plate', color: col });
  }
}

/** a dense, dark hillside tree (oaks, pittosporum and the like): a short trunk under a stack of shrinking canopy layers */
function hillTree(b: Builder, x: number, z: number, y: number, r: () => number) {
  b.newGroup();
  const trunk = 6 + 3 * Math.floor(r() * 4), w = 5 + 2 * Math.floor(r() * 3);
  b.add(x, z, y, 1, 1, trunk, C.darkWood, 'round', { studs: false });
  const col = r() < 0.5 ? C.darkGreen : C.green;
  for (let layer = 0, s = w; s >= 3; layer++, s -= 2) {
    const o = (w - s) >> 1, cy = y + trunk + layer * 3;
    b.box(x - (w >> 1) + o, z - (w >> 1) + o, x - (w >> 1) + o + s, z - (w >> 1) + o + s, cy, cy + 3, { kind: 'brick', color: layer % 2 ? C.green : col });
  }
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  const r = rng(1949);

  // [documented] the row of eucalyptus east of the walkway (planted in the 1880s by Abbot Kinney): 55–75 ft tall
  for (let z = -26; z <= 158; z += 15 + Math.floor(r() * 5)) {
    const x = EUCALYPTUS_X + Math.round((r() - 0.5) * 4);
    eucalyptus(b, x, z, hm.at(x, z), Math.round((55 + r() * 20) / 0.4 / 3) * 3, r);
  }

  // the planted hill behind the retaining wall: dense, dark trees and shrubs (as in photographs, where they screen the
  // houses further up the slope)
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(TERRAIN.x0 + 4 + r() * (WALL_X - 8 - TERRAIN.x0 - 4));
    const z = Math.floor(-40 + r() * 210);
    hillTree(b, x, z, hm.at(x, z), r);
  }

  // [documented] three pilings salvaged from a Venice pier, in the south patio
  b.newGroup();
  for (const [x, z, h] of [[4, PATIO[1] + 2, 12], [8, PATIO[1] + 5, 9], [5, PATIO[1] + 6, 15]] as const)
    b.add(x, z, Y.FLOOR, 1, 1, h, C.darkWood, 'round');

  // [documented] the carport by the studio's north end, with a canvas awning
  b.newGroup();
  for (const [x, z] of [[1, CARPORT[1]], [18, CARPORT[1]]]) b.add(x, z, Y.FLOOR, 1, 1, 21, C.black, 'bar');
  b.box(CARPORT[0], CARPORT[1], CARPORT[2], CARPORT[3], 22, 23, { kind: 'tile', color: (x) => (x % 4 < 2 ? C.beige : C.offWhite) });

  // potted plants in the courtyard
  for (const [x, z] of [[3, COURT[1] + 3], [15, COURT[1] + 4], [9, COURT[3] - 4]] as const) {
    b.newGroup();
    b.add(x, z, Y.FLOOR, 2, 2, 3, C.nougat, 'brick', { studs: false });
    b.add(x, z, Y.FLOOR + 3, 2, 2, 3, C.green, 'brick');
  }

  // wildflowers in the meadow
  b.newGroup();
  for (let i = 0; i < 140; i++) {
    const x = Math.floor(MEADOW[0] + 4 + r() * (MEADOW[2] - MEADOW[0] - 8));
    const z = Math.floor(MEADOW[1] + 4 + r() * (MEADOW[3] - MEADOW[1] - 8));
    if (x < TERRAIN.x0 || z < TERRAIN.z0) continue;
    const c = hash2(x, z) < 0.6 ? C.yellow : hash2(z, x) < 0.5 ? C.white : C.orange;
    b.add(x, z, hm.at(x, z), 1, 1, 1, c, 'plate');
  }
}

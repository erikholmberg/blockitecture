/**
 * The Douglas House's landscape (spec 045): the white ship's railings round the deck, along the bridge and down the outside
 * stair [documented: "ship's railings"; their build assumed]; the cedars and conifers of the bluff [documented: "the original
 * blanket of cedars, conifers and other indigenous trees"; species mix and places assumed], kept back from the house, the bridge
 * and the parking, and thinner below the glass wall, where the photographs look up from the beach.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { RAIL } from './house';
import { BRIDGE, DECK, HOUSE, LANDING, OUT_STAIR, PARKING, Y } from './layout';
import { HeightMap, TERRAIN } from './site';

type Cell = [x: number, z: number, y: number];
/** a ship's railing: a white post every 3 ft, a middle rail and a top rail, 3.2 ft high [assumed: photographs] */
function rail(b: Builder, cells: Cell[]) {
  b.newGroup();
  const post = (i: number) => i % 3 === 0 || i === cells.length - 1;
  cells.forEach(([x, z, y], i) => { if (post(i)) b.add(x, z, y, 1, 1, 8, RAIL, 'bar'); });
  b.newGroup();
  cells.forEach(([x, z, y], i) => {
    b.add(x, z, y + 8, 1, 1, 1, RAIL, 'tile');
    if (!post(i)) b.add(x, z, y + 4, 1, 1, 1, RAIL, 'tile');
  });
}

/** an eastern white cedar or a pine: a narrow cone of dark tiers on a short trunk [assumed] */
function conifer(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + 9, 0x5a4636, 'round');
  const c = hash2(x, z) < 0.5 ? 0x2f4a32 : 0x38563a;
  let r = 4;
  for (let yy = y + 9; yy < y + h && r >= 1; yy += 6, r -= h > 70 ? 0.5 : 0.75) {
    const rr = Math.round(r);
    b.box(x - rr, z - rr, x + rr + 1, z + rr + 1, yy, yy + 6, { kind: 'brick', color: c, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= rr + 0.3 });
  }
}
/** a paper birch: a white trunk and a small light crown [assumed] */
function birch(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, 0xe8e4da, 'round');
  b.box(x - 2, z - 2, x + 3, z + 3, y + h - 6, y + h, { kind: 'brick', color: 0x7fa052, mask: (xx, zz) => !(xx === x && zz === z) });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  const F4 = Y.F4;
  // the deck's three open sides: north, west to the lake (but where the outside stair leaves it), south [documented]
  rail(b, Array.from({ length: HOUSE[3] - DECK[1] }, (_, i) => [HOUSE[0], DECK[1] + i, F4] as Cell));
  rail(b, Array.from({ length: HOUSE[2] - 2 }, (_, i) => [1 + i, HOUSE[3] - 1, F4] as Cell).filter(([x]) => x < OUT_STAIR.x0 - 1 || x > OUT_STAIR.x0 + 1));
  rail(b, Array.from({ length: HOUSE[3] - DECK[1] - 1 }, (_, i) => [HOUSE[2] - 1, DECK[1] + i, F4] as Cell));
  // the bridge's two sides
  for (const x of [BRIDGE.x0, BRIDGE.x1 - 1]) rail(b, Array.from({ length: BRIDGE.z1 - BRIDGE.z0 }, (_, i) => [x, BRIDGE.z0 + i, F4] as Cell));
  // the outside stair's outer side, and round the landing
  rail(b, Array.from({ length: OUT_STAIR.steps }, (_, i) => [OUT_STAIR.x0 + i, OUT_STAIR.z1 - 1, F4 - Y.SLAB - 2 * i] as Cell));
  const ring: Cell[] = [];
  for (let a = -90; a <= 90; a += 12) {
    const x = Math.round(LANDING.cx + Math.cos((a * Math.PI) / 180) * (LANDING.r - 0.5) - 0.5), z = Math.round(LANDING.cz + Math.sin((a * Math.PI) / 180) * (LANDING.r - 0.5) - 0.5);
    if (x >= HOUSE[2] && !ring.some(([xx, zz]) => xx === x && zz === z)) ring.push([x, z, Y.F2]);
  }
  rail(b, ring);

  // the bluff's trees, kept back from the house, the bridge and the parking
  const clear = (x: number, z: number) =>
    (x > HOUSE[0] - 9 && x < HOUSE[2] + 12 && z > HOUSE[1] - 9 && z < HOUSE[3] + 14) ||
    (x > BRIDGE.x0 - 7 && x < BRIDGE.x1 + 7 && z > BRIDGE.z0 - 3 && z < 0) ||
    (x > PARKING[0] - 5 && x < PARKING[2] + 5 && z > PARKING[1] - 5 && z < PARKING[3] + 3);
  for (let gz = TERRAIN.z0 + 5; gz < TERRAIN.z1 - 5; gz += 12)
    for (let gx = TERRAIN.x0 + 5; gx < TERRAIN.x1 - 5; gx += 12) {
      const x = gx + Math.floor(hash2(gx, gz) * 9) - 4, z = gz + Math.floor(hash2(gz, gx) * 9) - 4, t = hash2(x * 3, z * 5);
      const y = hm.at(x, z);
      if (clear(x, z) || y * 0.4 < -72) continue; // nothing on the beach
      // thinner straight below the glass wall, where the photographs look up from the beach [documented: photographs]
      const below = x > HOUSE[0] - 4 && x < HOUSE[2] + 4 && z >= HOUSE[3];
      if (t < (below ? 0.8 : 0.15)) continue;
      if (t < 0.3) birch(b, x, z, y, 36 + Math.floor(t * 30));
      else conifer(b, x, z, y, 50 + Math.floor(t * 40));
    }
}

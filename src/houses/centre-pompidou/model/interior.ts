/**
 * The Centre Pompidou's interior (spec 080 Q4): blocky stand-ins on four of its open floors: the Forum (level 0) and its
 * mezzanine, the public library (Bpi) on level 2, the museum on level 5 and the restaurant on level 6. The other floors stay open
 * and empty, end to end, which is the building's point [documented: column-free floors of about 50 × 170 m]. No artwork is
 * reproduced: the museum's walls hold plain coloured panels. Each piece says [documented], [scaled] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { put } from './house';
import { BAY, FLOOR_Z0, FLOOR_Z1, frameX, GALLERY_LEVELS, levelY, MEZZ_Y, ROOF_Y, SLAB, TRUSS_Y, TUBE_H, TUBE_Z } from './layout';

/** [assumed] the desks' and counters' white laminate, the library's pale wood, the benches' grey */
const COUNTER = 0xf0efe9;
const BIRCH = 0xcfb48a;
const SHELF = 0x6d7175;
const BENCH = 0x5d6064;
/** [assumed] the museum's plain panels standing in for the works: flat colours, no artwork */
const PANELS = [0xd8432e, 0x2d5aa8, 0xf0c33c, 0x1f1f22, 0x3f8f5a, 0xe9e3d6];

/** a table: a top on two end panels [assumed] */
function table(b: Builder, x: number, z: number, y: number, w: number, d: number, h: number, top: number, leg: number) {
  b.newGroup();
  put(b, x, z, y, 1, d, h - 1, leg);
  put(b, x + w - 1, z, y, 1, d, h - 1, leg);
  put(b, x, z, y + h - 1, w, d, 1, top, 'tile');
}

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  // ---- the Forum (level 0) ----
  const f = levelY(0);
  // [documented: the Forum is the reception hall] the reception desk, a long white counter across the hall's middle [assumed: its shape]
  b.newGroup();
  put(b, frameX(6) + 4, 70, f, 34, 3, 7, COUNTER);
  put(b, frameX(6) + 4, 73, f, 3, 16, 7, COUNTER);
  // [assumed] the ticket desks beside it
  b.newGroup();
  for (const x of [frameX(8) + 6, frameX(8) + 22]) put(b, x, 60, f, 10, 4, 7, COUNTER);
  // [assumed] a run of escalators from the Forum up to the mezzanine, stepped, with their red undersides
  b.newGroup();
  for (let s = 0; s < 13; s++) put(b, frameX(4) - 2 + s * 2, 112, f, 2, 6, 3 * (s + 1), 0xc62a22);
  // [assumed] benches along the hall
  b.newGroup();
  for (const x of [frameX(9) + 6, frameX(10) + 6, frameX(11) + 6]) put(b, x, 140, f, 12, 3, 4, BENCH);
  // [assumed] the bookshop's shelves under the mezzanine
  b.newGroup();
  for (let k = 0; k < 4; k++) put(b, frameX(1) + 4 + k * 16, 140, f, 10, 2, 14, SHELF);
  // [assumed] a café's tables on the mezzanine
  for (let k = 0; k < 5; k++) table(b, frameX(1) + 6 + k * 14, 150, MEZZ_Y, 6, 4, 7, COUNTER, BENCH);

  // ---- the library, the Bpi (level 2) ----
  const l = levelY(2);
  // [documented: the Bpi is an open public library] long rows of reading tables in the south half [assumed: their layout]
  for (let x = frameX(1) + 4; x < frameX(6); x += 20)
    for (const z of [40, 58, 76]) table(b, x, z, l, 14, 5, 7, BIRCH, BIRCH);
  // [assumed] low shelving in the north half, in rows across the floor
  b.newGroup();
  for (let x = frameX(7) + 4; x < frameX(12); x += 10) put(b, x, 100, l, 2, 60, 11, SHELF);
  // [assumed] the information desk
  b.newGroup();
  put(b, frameX(6) + 10, 120, l, 16, 4, 7, COUNTER);

  // ---- the museum (level 5) ----
  const m = levelY(5);
  // [documented: the museum's open plan is divided by movable walls] white partitions, 2 storeys' worth of rooms down the floor
  // [assumed: their layout], each with plain coloured panels standing in for the works [assumed: no artwork reproduced]
  const WALL_H = 30;
  for (let i = 0; i < 12; i++) {
    const x0 = frameX(i) + 6;
    b.newGroup();
    put(b, x0, 60, m, 30, 1, WALL_H, C.white);
    put(b, x0, 120, m, 30, 1, WALL_H, C.white);
    if (i % 2 === 0) put(b, x0 + 14, 61, m, 1, 58, WALL_H, C.white);
    b.newGroup();
    for (let k = 0; k < 3; k++) {
      put(b, x0 + 3 + k * 9, 59, m + 8, 6, 1, 10 + (k % 2) * 4, PANELS[(i + k) % PANELS.length], 'tile');
      put(b, x0 + 3 + k * 9, 121, m + 8, 6, 1, 10 + ((k + 1) % 2) * 4, PANELS[(i + k + 2) % PANELS.length], 'tile');
    }
    // [assumed] a bench in each room
    put(b, x0 + 4, 88, m, 8, 3, 4, BENCH);
  }

  // ---- the restaurant (level 6) ----
  const r = levelY(6);
  // [documented: a restaurant on the top floor] tables at the north end [assumed: their layout]
  for (let x = frameX(10) + 4; x < frameX(13) - 6; x += 12)
    for (const z of [30, 48, 66, 84]) {
      table(b, x, z, r, 5, 5, 7, COUNTER, BENCH);
      put(b, x + 1, z - 2, r, 3, 1, 5, 0x2b2c2e);
      put(b, x + 1, z + 6, r, 3, 1, 5, 0x2b2c2e);
    }
  // [assumed] its bar
  b.newGroup();
  put(b, frameX(9) + 8, 100, r, 24, 4, 8, 0x3a3b3d);
}

/** [assumed] the restaurant's lights, hung from the roof's slab, with the roof */
export function buildLights(b: Builder) {
  const y = ROOF_Y - SLAB - 1;
  b.hanging(P.ROOF, () => {
    for (let x = frameX(10) + 6; x < frameX(13) - 6; x += 12) for (const z of [32, 50, 68, 86]) put(b, x + 1, z + 1, y, 2, 2, 1, C.warmLight, 'light');
    // [assumed] strip lights under every floor's ceiling, along the west front, so the glass glows at dusk
    for (const top of [...TRUSS_Y.slice(0, 5).map((t) => t - SLAB), ROOF_Y - SLAB])
      for (let i = 0; i + 1 < 14; i++) for (const dx of [4, 18, 32]) put(b, frameX(i) + dx, FLOOR_Z0 + 8, top - 1, 8, 2, 1, C.warmLight, 'light');
    // [assumed] and along the Chenille's galleries, under their glass roofs
    for (const n of GALLERY_LEVELS) for (let x = 6; x < 540; x += 21) put(b, x, TUBE_Z[0] + 6, levelY(n) + TUBE_H - 1, 6, 2, 1, C.warmLight, 'light');
  });
}

/** the interior's floors, for the tests */
export const FURNISHED = [0, 2, 5, 6].map(levelY);
export { BAY, FLOOR_Z0, FLOOR_Z1, TRUSS_Y };

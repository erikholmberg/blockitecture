/**
 * Fallingwater's interior (spec 017 Q2): Wright's own furnishings, mostly black-walnut built-ins, at brick scale.
 * Each piece says whether it is [documented] (drawn on HABS PA-5346 sheets 4–6, or in the NHL nomination) or [assumed].
 * Positions in the layout.ts frame; first-floor furniture stands on the flagstone (y = 0).
 */
import { C } from '@/engine/catalog';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { BOULDER, Y } from './layout';
import { groundPlates } from './site';

const WALNUT = 0x5a3a24;
const WALNUT_LIGHT = 0x6e4a2e;
/** the cushions on the built-in seating: rust, ochre and a deep red [assumed: photographs' warm colours] */
const CUSHIONS = [0xb5562b, 0xc98a3a, 0x8f2f22];

/** the boulder that was on the site, left to come up through the living-room floor as the hearth [documented] */
export function buildBoulder(b: Builder) {
  b.setPhase(P.SITE);
  const [x0, z0, x1, z1] = BOULDER;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (let z = z0; z < z1; z++)
    for (let x = x0; x < x1; x++) {
      // an irregular, rounded top: highest in the middle, just above the floor
      const e = Math.hypot((x + 0.5 - cx) / ((x1 - x0) / 2), (z + 0.5 - cz) / ((z1 - z0) / 2));
      if (e > 1.05) continue;
      const top = e < 0.5 ? 2 : e < 0.85 ? 1 + Math.round(hash2(x, z)) : 0;
      if (top <= 0) continue;
      const g = groundPlates(x, z);
      const col = hash2(x * 3, z * 5) < 0.5 ? 0x8a8070 : 0x7b7264;
      b.box(x, z, x + 1, z + 1, g, top, { kind: 'brick', color: col, unit: 3 });
    }
}

/** a built-in seat: a walnut base and cushions */
function seat(b: Builder, x0: number, z0: number, x1: number, z1: number, y: number) {
  b.newGroup();
  b.box(x0, z0, x1, z1, y, y + 3, { kind: 'brick', color: WALNUT });
  b.box(x0, z0, x1, z1, y + 3, y + 4, { kind: 'plate', color: (x, _y, z) => CUSHIONS[Math.floor(hash2(Math.floor(x / 3), z) * CUSHIONS.length)] });
}

/** a table: four walnut legs and a top `h` plates up */
function table(b: Builder, x0: number, z0: number, x1: number, z1: number, y: number, h: number) {
  b.newGroup();
  for (const [x, z] of [[x0, z0], [x1 - 1, z0], [x0, z1 - 1], [x1 - 1, z1 - 1]]) b.column(x, z, y, y + h - 1, WALNUT, 'bar');
  b.box(x0, z0, x1, z1, y + h - 1, y + h, { kind: 'plate', color: WALNUT_LIGHT });
}

/** a bed: a walnut base and a pale cover */
function bed(b: Builder, x0: number, z0: number, x1: number, z1: number, y: number) {
  b.newGroup();
  b.box(x0, z0, x1, z1, y, y + 2, { kind: 'plate', color: WALNUT });
  b.box(x0, z0, x1, z1, y + 2, y + 3, { kind: 'plate', color: C.offWhite });
}

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = Y.L1;
  // --- the living room ---
  // [documented] the long built-in seat along the south glass (sheet 4: the double line from x 31 to 52)
  seat(b, 31, 63, 51, 66, F);
  // [documented] the built-in desk and seat under the west windows (sheet 4)
  seat(b, 26, 41, 29, 51, F);
  // [documented] the built-in sofa along the stone core, east side (sheet 4)
  seat(b, 59, 33, 62, 45, F);
  // [documented] the coffee table with its half-round end in front of the hatch (sheet 4)
  table(b, 50, 44, 56, 49, F, 3);
  // [documented] the dining table near the kitchen, with four chairs (sheet 4)
  table(b, 32, 22, 37, 27, F, 6);
  b.newGroup();
  for (const [x, z] of [[33, 21], [35, 21], [33, 27], [35, 27]]) {
    b.add(x, z, F, 1, 1, 3, WALNUT, 'brick'); // [assumed] Wright's walnut chairs, as simple blocks with a back
    b.add(x, z, F + 3, 1, 1, 3, WALNUT_LIGHT, 'brick');
  }
  // [documented] the red spherical kettle that swings into the fire, in the hearth's niche
  b.newGroup();
  b.add(29, 38, F, 1, 1, 3, C.darkRed, 'round');
  // [assumed] a fire on the hearth
  b.add(29, 33, F, 2, 3, 1, C.fire, 'light');
  // [assumed] the hassocks: low cushioned stools around the coffee table
  b.newGroup();
  for (const [x, z] of [[48, 45], [48, 47], [57, 46]]) b.add(x, z, F, 1, 1, 3, CUSHIONS[(x + z) % 3], 'brick');

  // --- the kitchen ---
  // [assumed] counters along the west and north walls (steel and walnut), the stove where sheet 4 draws its burners
  b.newGroup();
  b.box(17, 14, 19, 28, F, F + 6, { kind: 'brick', color: C.lightGray });
  b.box(19, 13, 27, 15, F, F + 6, { kind: 'brick', color: C.lightGray });
  b.box(27, 25, 29, 29, F, F + 6, { kind: 'brick', color: C.steel }); // [documented] the stove (sheet 4)
  b.box(21, 18, 25, 22, F, F + 6, { kind: 'brick', color: WALNUT }); // [assumed] a work table

  // --- the second floor ---
  const F2 = Y.L2;
  // [documented] the master bed (sheet 5)
  bed(b, 40, 31, 46, 40, F2);
  // [documented] the guest bed (sheet 5)
  bed(b, 59, 34, 64, 40, F2);
  // [documented] the master bath's tub (sheet 5)
  b.newGroup();
  b.box(47, 34, 53, 37, F2, F2 + 4, { kind: 'brick', color: C.white });
  // [assumed] walnut wardrobes along the dressing room's west wall
  b.newGroup();
  b.box(17, 14, 19, 28, F2, F2 + 15, { kind: 'brick', color: WALNUT });
  // [assumed] a built-in desk in the master bedroom, under the south glass
  seat(b, 31, 42, 38, 44, F2);

  // --- the third floor ---
  const F3 = Y.L3;
  // [documented] the bed in the sleeping alcove (sheet 6)
  bed(b, 50, 21, 55, 25, F3);
  // [assumed] Edgar Jr.'s built-in desk and shelves in the study
  b.newGroup();
  b.box(18, 14, 20, 24, F3, F3 + 6, { kind: 'brick', color: WALNUT });
  b.box(20, 13, 29, 14, F3, F3 + 15, { kind: 'brick', color: WALNUT_LIGHT });
}

/**
 * The Eames House interiors (spec 010b, Q3 as amended by Erik: the actual Eames furniture).
 *
 * Each piece says where its presence comes from:
 *   [documented]   named in the sources gathered for spec 010 (Wikipedia's Eames House article; the Eames Office on the
 *                  built-in alcove sofa);
 *   [assumed]      Eames designs widely associated with the house and its period, but not tied to a source here.
 * Positions are approximate: placed by the documented room layout, not measured from a specific photograph.
 * At brick scale these are recognisable approximations, not replicas of the products.
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { STAIR, X_EAST, X_WEST, Y, Z } from './layout';

const F = Y.FLOOR, M = Y.MEZZ_FLOOR;
const ROSEWOOD = 0x5a2a1a, MAPLE = 0xd8b27a, SHELL = [C.red, C.yellow, C.white, C.orange, C.sandBlue, C.black];

/** four thin legs under a rectangle */
function legs(b: Builder, x0: number, z0: number, x1: number, z1: number, y: number, h: number, color = C.black) {
  for (const [x, z] of [[x0, z0], [x1 - 1, z0], [x0, z1 - 1], [x1 - 1, z1 - 1]]) b.add(x, z, y, 1, 1, h, color, 'bar');
}

/** a molded shell side chair: shell seat and back on thin legs [assumed: molded plastic side chairs (DSW/DSR)] */
/** the cell behind a chair seat, and the seat's footprint covering both cells (spec 012: the back stands on the seat) */
function seatAndBack(x: number, z: number, back: 'n' | 's' | 'e' | 'w') {
  const [bx, bz] = back === 'n' ? [x, z - 1] : back === 's' ? [x, z + 1] : back === 'e' ? [x + 1, z] : [x - 1, z];
  return { bx, bz, sx: Math.min(x, bx), sz: Math.min(z, bz), sw: bx === x ? 1 : 2, sd: bz === z ? 1 : 2 };
}

function shellChair(b: Builder, x: number, z: number, color: number, back: 'n' | 's' | 'e' | 'w') {
  const { bx, bz, sx, sz, sw, sd } = seatAndBack(x, z, back);
  b.add(x, z, F, 1, 1, 4, C.lightGray, 'bar');
  b.add(sx, sz, F + 4, sw, sd, 1, color, 'plate');
  b.add(bx, bz, F + 5, 1, 1, 3, color, 'tile');
}

/** a plywood lounge/dining chair [assumed: LCW / DCW] */
function plywoodChair(b: Builder, x: number, z: number, y: number, back: 'n' | 's' | 'e' | 'w') {
  const { bx, bz, sx, sz, sw, sd } = seatAndBack(x, z, back);
  b.add(x, z, y, 1, 1, 3, C.darkWood, 'bar');
  b.add(sx, sz, y + 3, sw, sd, 1, MAPLE, 'plate');
  b.add(bx, bz, y + 4, 1, 1, 3, MAPLE, 'tile');
}

function plant(b: Builder, x: number, z: number, y: number, h = 9) {
  b.newGroup();
  b.add(x, z, y, 2, 2, 3, C.white, 'brick', { studs: false });
  b.add(x, z, y + 3, 2, 2, 3, C.green, 'brick');
  b.add(x, z, y + 6, 1, 1, h - 6, C.brightGreen, 'round');
}

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const zLiving = Z[13], zSouth = Z[16];

  // ---------------- Living room (double height, south end) ----------------
  // [documented] rugs and tatami mats; a sisal-coloured rug under the seating, tatami along the south glass
  b.newGroup();
  b.box(5, 99, 14, 108, F, F + 1, { kind: 'tile', color: (x, _y, z) => ((x + z) % 6 === 0 ? C.darkTan : C.tan) });
  b.box(14, 110, 18, zSouth - 1, F, F + 1, { kind: 'tile', color: C.beige });

  // [documented] Eames Lounge Chair and ottoman in the living room (Wikipedia): rosewood shells, black leather, swivel base
  b.newGroup();
  b.add(12, 104, F + 1, 1, 1, 2, C.black, 'round');
  b.box(11, 103, 14, 106, F + 3, F + 4, { kind: 'plate', color: ROSEWOOD });
  b.box(11, 103, 14, 105, F + 4, F + 5, { kind: 'tile', color: C.black });
  b.box(11, 105, 14, 106, F + 4, F + 10, { kind: 'brick', color: ROSEWOOD, studs: false }); // back shell
  b.box(11, 104, 14, 105, F + 5, F + 9, { kind: 'brick', color: C.black, studs: false }); // back cushion
  b.newGroup();
  b.add(12, 100, F + 1, 1, 1, 2, C.black, 'round'); // ottoman
  b.box(11, 100, 14, 102, F + 3, F + 4, { kind: 'plate', color: ROSEWOOD });
  b.box(11, 100, 14, 102, F + 4, F + 5, { kind: 'tile', color: C.black });

  // [assumed] a low round-cornered table by the seating (LTR-like)
  b.newGroup();
  b.box(7, 101, 10, 104, F + 3, F + 4, { kind: 'tile', color: C.white });
  legs(b, 7, 101, 10, 104, F + 1, 2);
  plywoodChair(b, 7, 106, F + 1, 's');

  // [assumed: Eames Storage Unit, 1950] shelving along the west wall: black frame, coloured panels, books and objects
  b.newGroup();
  for (const z of [97, 104, 111]) b.add(1, z, F, 1, 1, 18, C.black, 'bar');
  b.box(1, 97, 3, 112, F + 6, F + 7, { kind: 'plate', color: C.white });
  b.box(1, 97, 3, 112, F + 12, F + 13, { kind: 'plate', color: C.white });
  b.box(1, 98, 3, 104, F, F + 6, { kind: 'brick', studs: false, color: (_x, _y, z) => [C.red, C.white, C.sandBlue, C.yellow][z % 4] });
  // [documented] books, seashells, baskets on the shelves
  b.box(1, 105, 3, 111, F + 7, F + 10, { kind: 'brick', studs: false, color: (_x, _y, z) => [C.darkRed, C.darkBlue, C.olive, C.tan, C.orange, C.reddishBrown][z % 6] });
  b.box(1, 98, 3, 103, F + 13, F + 15, { kind: 'brick', color: (_x, _y, z) => (z % 2 ? C.nougat : C.darkTan) });

  // [documented] Native American baskets on the floor, potted plants, a paper lantern hanging in the double height
  b.newGroup();
  for (const [x, z, c] of [[3, 114, C.nougat], [5, 115, C.darkTan], [16, 97, C.nougat]] as const)
    b.add(x, z, F, 1, 1, 3, c, 'round', { studs: false });
  // (spec 012: these used to overlap the shelving and the tatami, so pieces were silently dropped)
  plant(b, 6, 112, F, 14);
  plant(b, 17, 99, F, 18);
  // the lantern hangs from the roof, so it goes in with the roof, top-down (spec 012, as spec 002)
  b.hanging(P.ROOF, () => {
    b.add(10, 106, 30, 1, 1, Y.ROOF_UNDER - 1 - 30, C.black, 'bar'); // cord
    b.add(9, 106, 26, 3, 3, 4, C.warmLight, 'lamp');
  });

  // ---------------- The alcove (one storey, under the mezzanine) ----------------
  // [documented] rosewood paneling in the seating niche, and the built-in L-shaped alcove sofa (Eames Office)
  b.newGroup();
  b.box(X_WEST + 1, 88, X_WEST + 2, zLiving, F, Y.MEZZ, { kind: 'brick', color: ROSEWOOD, studs: false });
  b.box(X_WEST + 2, 88, 12, 89, F, Y.MEZZ, { kind: 'brick', color: ROSEWOOD, studs: false });
  b.newGroup();
  b.box(2, 89, 5, zLiving, F, F + 4, { kind: 'brick', color: C.darkGray }); // seat along the west wall
  b.box(5, 89, 11, 92, F, F + 4, { kind: 'brick', color: C.darkGray }); // and along the back
  b.box(2, 89, 5, zLiving, F + 4, F + 5, { kind: 'tile', color: (x, _y, z) => ((x + z) % 3 ? C.beige : C.offWhite) });
  b.box(5, 89, 11, 92, F + 4, F + 5, { kind: 'tile', color: (x, _y, z) => ((x + z) % 3 ? C.beige : C.offWhite) });
  // [documented] pillows
  for (const [x, z, c] of [[2, 91, C.red], [3, 93, C.yellow], [7, 89, C.sandBlue], [9, 89, C.orange]] as const)
    b.add(x, z, F + 5, 1, 1, 2, c, 'brick', { studs: false });

  // ---------------- Spiral stair just inside the front door (documented, with a skylight above) ----------------
  b.newGroup();
  const [sx0, sz0, sx1, sz1] = STAIR;
  const cx = Math.floor((sx0 + sx1) / 2), cz = Math.floor((sz0 + sz1) / 2);
  b.add(cx, cz, F, 1, 1, Y.MEZZ_FLOOR + 6 - F, C.black, 'round');
  // treads turn around the pole's four faces, so each is fixed to it (spec 012: none in mid-air)
  const sides: [number, number, number, number][] = [[cx + 1, cz, 2, 1], [cx, cz + 1, 1, 2], [cx - 2, cz, 2, 1], [cx, cz - 2, 1, 2]];
  for (let i = 0; i < 9; i++) {
    const [tx, tz, tw, td] = sides[i % 4];
    b.add(tx, tz, F + 2 + i * 2, tw, td, 1, MAPLE, 'plate');
  }

  // ---------------- Dining (under the mezzanine) ----------------
  // [assumed] a white table with molded shell chairs around it
  b.newGroup();
  b.box(9, 74, 15, 78, F + 6, F + 7, { kind: 'tile', color: C.white });
  legs(b, 9, 74, 15, 78, F, 6);
  let k = 0;
  for (const x of [10, 13]) {
    shellChair(b, x, 73, SHELL[k++ % SHELL.length], 'n');
    shellChair(b, x, 78, SHELL[k++ % SHELL.length], 's');
  }
  shellChair(b, 8, 76, SHELL[k++ % SHELL.length], 'w');

  // ---------------- Kitchen (north end, west wall) ----------------
  // [documented] marble-and-steel counters, metal cabinets and a refrigerator
  b.newGroup();
  b.box(X_WEST + 1, Z[9] + 4, X_WEST + 4, 81, F, F + 8, { kind: 'brick', color: C.lightGray, studs: false });
  b.box(X_WEST + 1, Z[9] + 4, X_WEST + 4, 81, F + 8, F + 9, { kind: 'tile', color: (x, _y, z) => ((x + z) % 4 ? C.white : C.offWhite) });
  // one 5-plate piece per cell, flush under the mezzanine deck it hangs from (spec 012)
  b.box(X_WEST + 1, Z[9] + 4, X_WEST + 2, 81, F + 14, Y.MEZZ, { kind: 'brick', unit: 5, color: C.lightGray, studs: false });
  b.newGroup();
  b.box(X_WEST + 1, Z[9] + 1, X_WEST + 4, Z[9] + 4, F, F + 16, { kind: 'brick', color: C.white, studs: false });

  // ---------------- Mezzanine: two bedrooms, two baths, freestanding closets ----------------
  b.newGroup();
  b.box(X_WEST + 1, 80, 12, 81, M, Y.ROOF_UNDER - 1, { kind: 'brick', color: C.white, studs: false }); // partition
  // [documented] sliding panels that open the bedrooms onto the living room
  b.box(X_WEST + 1, zLiving - 1, X_EAST, zLiving, M, M + 15, { kind: 'glass', color: 0xf6f6ee });
  for (const [z0, z1] of [[68, 75], [84, 91]]) {
    b.newGroup();
    b.box(3, z0, 9, z1, M, M + 2, { kind: 'brick', color: C.darkWood }); // bed
    b.box(3, z0, 9, z1, M + 2, M + 3, { kind: 'tile', color: C.white });
    b.box(3, z0, 4, z1, M + 3, M + 4, { kind: 'tile', color: C.offWhite }); // pillow end
  }
  // [documented] two freestanding closets in a dressing niche
  b.newGroup();
  for (const z of [70, 74]) b.box(13, z, 16, z + 3, M, M + 15, { kind: 'brick', color: MAPLE, studs: false });
  // [documented] Ray's bathroom: checkerboard floor and a bathtub
  b.newGroup();
  b.box(X_WEST + 1, 76, 6, 80, M, M + 1, { kind: 'tile', color: (x, _y, z) => ((x + z) % 2 ? C.black : C.white) });
  b.box(X_WEST + 1, 77, 3, 80, M + 1, M + 4, { kind: 'brick', color: C.white, studs: false });

  // ---------------- Studio (north pavilion) ----------------
  const zLoft = Math.round((Z[0] + Z[5]) / 2);
  // [assumed] worktables with plywood chairs in the double-height studio room
  b.newGroup();
  b.box(5, 4, 14, 9, F + 7, F + 8, { kind: 'tile', color: C.white });
  legs(b, 5, 4, 14, 9, F, 7);
  plywoodChair(b, 7, 10, F, 's');
  plywoodChair(b, 11, 10, F, 's');
  b.newGroup();
  b.box(4, 12, 9, 16, F + 7, F + 8, { kind: 'tile', color: MAPLE });
  legs(b, 4, 12, 9, 16, F, 7);
  // [documented] collections: objects on shelves along the north wall
  b.newGroup();
  b.box(2, 1, 14, 2, F, F + 12, { kind: 'brick', studs: false, color: (x, y) => (y % 4 === 0 ? C.white : [C.red, C.tan, C.sandBlue, C.olive, C.yellow][x % 5]) });
  // [documented] steel stair with wood treads up to the loft, along the west wall
  b.newGroup();
  const steps = zLoft - 7;
  let below = F;
  for (let i = 0; i < steps; i++) {
    const y = F + Math.round(((Y.MEZZ_FLOOR - F) * (i + 1)) / steps) - 1;
    // the steel stringer climbs beside the treads, each section touching the last (spec 012)
    b.add(3, 7 + i, below, 1, 1, y + 1 - below, C.black, 'bar');
    b.add(1, 7 + i, y, 2, 1, 1, MAPLE, 'plate');
    below = y;
  }
  // [documented] ground floor of the southern half: kitchenette (south-east), bathroom, storage / former darkroom (south-west)
  b.newGroup();
  b.box(13, Z[5] - 6, X_EAST, Z[5] - 1, F, F + 8, { kind: 'brick', color: C.lightGray, studs: false });
  b.box(13, Z[5] - 6, X_EAST, Z[5] - 1, F + 8, F + 9, { kind: 'tile', color: C.white });
  b.newGroup();
  b.box(7, Z[5] - 8, 8, Z[5] - 1, F, Y.MEZZ, { kind: 'brick', color: C.white, studs: false });
  b.box(X_WEST + 1, Z[5] - 8, 7, Z[5] - 7, F, Y.MEZZ, { kind: 'brick', color: C.white, studs: false });
  b.box(8, Z[5] - 8, 12, Z[5] - 7, F, Y.MEZZ, { kind: 'brick', color: C.white, studs: false });
  // the loft: a bed and a desk, with a rail along its open edge
  b.newGroup();
  b.box(3, zLoft + 8, 9, zLoft + 14, M, M + 2, { kind: 'brick', color: C.darkWood });
  b.box(3, zLoft + 8, 9, zLoft + 14, M + 2, M + 3, { kind: 'tile', color: C.white });
  b.newGroup();
  b.box(12, zLoft + 9, 17, zLoft + 12, M + 7, M + 8, { kind: 'tile', color: MAPLE });
  legs(b, 12, zLoft + 9, 17, zLoft + 12, M, 7);
  plywoodChair(b, 14, zLoft + 13, M, 's');
  b.newGroup();
  b.box(4, zLoft, X_EAST, zLoft + 1, M, M + 3, { kind: 'plate', color: C.white, mask: (x) => x < 11 || x > 16 });
}

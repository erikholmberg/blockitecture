/**
 * The Rietveld Schröder House itself (spec 019): concrete foundations, the ground floor, the steel and the upper floor
 * with its concrete balconies, then the De Stijl envelope (white and grey planes that slide past one another, black
 * frames, and posts and beams in red, blue and yellow), the roof slabs and the roof light. Layout and sourcing: layout.ts.
 */
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import {
  BATH_WALLS, BLUE_POST_EAST, D, EAST_BALCONY, FRONT_BALCONY, FRONT_LEFT_BALCONY, GROUND_FLOOR, Rect, RED_POST_EAST,
  RED_POST_FRONT, ROOF_LIGHT, STAIR, UPPER_FLOOR, W, WALLS1, Y, YELLOW_POST,
} from './layout';

/** the palette [documented: white and greys, black frames, primary colours on linear elements] */
export const WHITE = 0xf2f2ee;
export const GREY_LIGHT = 0xc9cbcb;
export const GREY = 0x9c9ea0;
export const GREY_DARK = 0x4b4e52;
export const BLACK = 0x1e1f21;
export const RED = 0xc4271f;
export const BLUE = 0x1f3f8f;
export const YELLOW = 0xf0c419;
const GLASS = 0xdff1f5;
const WOOD_FLOOR = 0x9a7a55;

const box = (b: Builder, r: Rect, y0: number, y1: number, color: number, kind: 'brick' | 'plate' | 'tile' = 'brick') =>
  b.box(r[0], r[1], r[2], r[3], y0, y1, { kind, color });

/** a window: black frame round the edge of a 1-stud-thick rect, glass inside, a black bar at `bar` (plates) if given */
function window(b: Builder, r: Rect, y0: number, y1: number, opts: { bar?: number; posts?: number[] } = {}) {
  b.newGroup();
  const alongX = r[2] - r[0] > 1;
  const n = alongX ? r[2] - r[0] : r[3] - r[1];
  for (let i = 0; i < n; i++) {
    const c: Rect = alongX ? [r[0] + i, r[1], r[0] + i + 1, r[3]] : [r[0], r[1] + i, r[2], r[1] + i + 1];
    if (i === 0 || i === n - 1 || opts.posts?.includes(i)) { box(b, c, y0, y1, BLACK); continue; }
    box(b, c, y0, y0 + 1, BLACK, 'plate');
    box(b, c, y1 - 1, y1, BLACK, 'plate');
    const mid = opts.bar;
    if (mid !== undefined) {
      b.box(c[0], c[1], c[2], c[3], y0 + 1, mid, { kind: 'glass', color: GLASS });
      box(b, c, mid, mid + 1, BLACK, 'plate');
      b.box(c[0], c[1], c[2], c[3], mid + 1, y1 - 1, { kind: 'glass', color: GLASS });
    } else b.box(c[0], c[1], c[2], c[3], y0 + 1, y1 - 1, { kind: 'glass', color: GLASS });
  }
}

/** the foundations: a concrete strip under the walls, below the ground [documented: concrete foundations] */
export function buildFoundations(b: Builder) {
  b.setPhase(P.FOUNDATION);
  const [x0, z0, x1, z1] = GROUND_FLOOR;
  for (const r of [[x0, z0, x1, z0 + 1], [x0, z1 - 1, x1, z1], [x0, z0, x0 + 1, z1], [x1 - 1, z0, x1, z1]] as Rect[])
    box(b, r, Y.GROUND - 6, Y.GROUND, 0xb9b4a8);
}

/** the ground floor slab (wooden floor on beams) [documented: wooden floors] */
export function buildGroundFloor(b: Builder) {
  b.setPhase(P.FLOOR);
  box(b, GROUND_FLOOR, Y.GROUND, Y.L1 - 1, 0xb9b4a8);
  b.box(GROUND_FLOOR[0], GROUND_FLOOR[1], GROUND_FLOOR[2], GROUND_FLOOR[3], Y.L1 - 1, Y.L1, { kind: 'tile', color: WOOD_FLOOR });
}

/** the frame: the party wall, the ground floor's walls, steel posts, the upper floor and its balconies */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  const top1 = Y.L2 - 3;
  // the party wall against the neighbour, brick, the full height [documented: shares one wall with the last house]
  box(b, [0, 0, 1, D - 1], Y.GROUND, Y.ROOF - 3, 0xd9d6cf);
  // the walls between the ground floor's rooms, brick and plaster [documented: brick and plaster walls; positions assumed]
  for (const r of WALLS1) box(b, r, Y.L1, top1, WHITE);
  // steel posts at the corners that carry the upper floor [documented: steel girders; positions assumed]
  for (const [x, z] of [[W - 2, 1], [W - 2, D - 3], [13, D - 3]] as [number, number][]) b.box(x, z, x + 1, z + 1, Y.L1, top1, { kind: 'brick', color: BLACK });
  // the upper floor on its beams, with the stair's opening [documented: wooden floors on wooden beams]
  b.box(UPPER_FLOOR[0], UPPER_FLOOR[1], UPPER_FLOOR[2], UPPER_FLOOR[3], top1, Y.L2 - 1, {
    kind: 'plate', color: WOOD_FLOOR, mask: (x, z) => !(x >= STAIR[0] && x < STAIR[2] && z >= STAIR[1] && z < STAIR[3]),
  });
  // the stair: a straight flight up through the middle [documented: central staircase; form assumed]
  b.newGroup();
  for (let i = 0; i < 7; i++) b.box(STAIR[0], STAIR[1] + i, STAIR[2], STAIR[1] + i + 1, Y.L1, Y.L1 + 3 * (i + 1), { kind: 'brick', color: BLACK });
  // the concrete balconies [documented]
  b.newGroup();
  for (const r of [FRONT_LEFT_BALCONY, FRONT_BALCONY, EAST_BALCONY]) box(b, r, top1, Y.L2, WHITE);
  // the bathroom's fixed walls upstairs [documented: a separate toilet and bathroom]
  for (const r of BATH_WALLS) box(b, r, Y.L2, Y.ROOF - 3, WHITE);
}

/** the envelope: planes, lines and glass (photographs: Wikimedia Commons "Casa Rietveld Schröder" 01–10, RCE 20339897) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const top1 = Y.L2 - 3, top2 = Y.ROOF - 3;
  const F = D - 3; // the ground floor's front face (its last row)
  const E = W - 2; // and its east face
  // ---- the front (z = D), from the party wall ----
  // [assumed] the bay next to the neighbour: a black-framed window over a dark grey sill wall, a red lintel above
  box(b, [1, F, 9, F + 1], Y.L1, Y.SILL, GREY_DARK);
  window(b, [1, F, 9, F + 1], Y.SILL, top1 - 2, { posts: [4] });
  box(b, [0, F + 1, 10, F + 2], top1 - 2, top1 - 1, RED);
  // [assumed] the rest of the ground floor's front: a white plane with the black front door, then a grey plane
  box(b, [9, F, 13, F + 1], Y.L1, top1, WHITE);
  window(b, [13, F, 16, F + 1], Y.L1, top1 - 3);
  box(b, [16, F, W - 1, F + 1], Y.L1, top1, WHITE);
  box(b, [19, F + 1, W, F + 2], Y.GROUND, 10, GREY); // the low grey plane in front of the corner
  // [assumed] upstairs: the left bay is glass with a red mullion and a blue transom over the balcony
  window(b, [1, D - 2, 9, D - 1], Y.L2, top2, { bar: Y.L2 + 12, posts: [3] });
  box(b, [3, D - 1, 4, D], Y.L2, top2, RED);
  box(b, [1, D - 1, 9, D], Y.L2 + 12, Y.L2 + 13, BLUE);
  // [assumed] the middle is a grey plane, the right a black window band over the white balcony box
  box(b, [9, D - 2, 12, D - 1], Y.L2, top2, GREY);
  box(b, [12, D + 2, 20, D + 3], Y.L2, Y.L2 + 8, WHITE); // the balcony's white parapet box
  box(b, [12, D - 1, 13, D + 2], Y.L2, Y.L2 + 8, WHITE);
  box(b, [19, D - 1, 20, D + 2], Y.L2, Y.L2 + 8, WHITE);
  window(b, [12, D - 2, W - 1, D - 1], Y.L2 + 4, top2);
  box(b, [12, D - 2, W - 1, D - 1], Y.L2, Y.L2 + 4, WHITE);
  // [documented: the corner window opens with no post] the upper front-east corner: glass meets glass
  b.box(W - 1, D - 2, W, D - 1, Y.L2 + 4, top2, { kind: 'glass', color: GLASS });
  // the black railings of the front balconies [assumed: photographs]
  b.newGroup();
  for (const [r, y] of [[[0, D + 1, 10, D + 2] as Rect, Y.L2 + 8], [[12, D + 2, 20, D + 3] as Rect, Y.L2 + 12]] as [Rect, number][]) box(b, r, y, y + 1, BLACK, 'plate');
  for (const x of [0, 9]) box(b, [x, D + 1, x + 1, D + 2], Y.L2, Y.L2 + 8, BLACK);

  // ---- the east side (x = W), facing the motorway ----
  // [assumed] a dark grey plinth, the ground floor's long black window band, a clerestory strip above it
  box(b, [E, 1, E + 1, F + 1], Y.L1, Y.SILL - 2, GREY_DARK);
  window(b, [E, 2, E + 1, F], Y.SILL - 2, top1 - 4, { posts: [9, 18] });
  box(b, [E, 2, E + 1, F], top1 - 4, top1 - 3, WHITE);
  window(b, [E, 2, E + 1, F], top1 - 3, top1);
  box(b, [E, 1, E + 1, 2], Y.SILL - 2, top1, WHITE);
  box(b, [E, F, E + 1, F + 1], Y.SILL - 2, top1, WHITE);
  // [assumed] upstairs: a big grey plane (the parapet), the glass above it, a red beam across, the blue post in the middle
  box(b, [W - 1, 1, W, D - 2], Y.L2, Y.L2 + 9, GREY_LIGHT);
  // (the blue post and the red beam go in first, so the window fills around them)
  box(b, [BLUE_POST_EAST[0], BLUE_POST_EAST[1], BLUE_POST_EAST[0] + 1, BLUE_POST_EAST[1] + 1], Y.L2 + 9, top2, BLUE);
  box(b, [W - 1, 3, W, D - 4], Y.L2 + 15, Y.L2 + 16, RED);
  window(b, [W - 1, 1, W, D - 2], Y.L2 + 9, top2);
  // the east balcony's railing [assumed]
  box(b, [W + 2, 2, W + 3, 11], Y.L2 + 8, Y.L2 + 9, BLACK, 'plate');

  // ---- the back (z = 0) ----
  // [assumed] white planes with a kitchen window below and a band of windows above
  window(b, [2, 1, 9, 2], Y.SILL, top1 - 2);
  box(b, [1, 1, E + 1, 2], Y.L1, top1, WHITE);
  window(b, [3, 0, 20, 1], Y.L2 + 6, top2 - 1, { posts: [8] });
  box(b, [1, 0, W - 1, 1], Y.L2, top2, WHITE);

  // ---- the coloured posts ----
  // [assumed] the tall yellow post at the front, from the ground to above the roof's edge
  box(b, [YELLOW_POST[0], YELLOW_POST[1], YELLOW_POST[0] + 1, YELLOW_POST[1] + 1], Y.GROUND, Y.ROOF + 2, YELLOW);
  // [assumed] the red posts: in front of the east windows, and at the front right corner
  box(b, [RED_POST_EAST[0], RED_POST_EAST[1], RED_POST_EAST[0] + 1, RED_POST_EAST[1] + 1], Y.GROUND, top1, RED);
  box(b, [RED_POST_FRONT[0], RED_POST_FRONT[1], RED_POST_FRONT[0] + 1, RED_POST_FRONT[1] + 1], Y.GROUND, 12, RED);
}

/** the roof: thin white slabs with black edges, overhanging at the front and the east, and the grey roof light */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.newGroup();
  const slabs: Rect[] = [[0, 0, W, D - 1], [0, D - 1, 10, D + 2], [17, D - 1, W + 2, D + 1], [W, 0, W + 2, D - 1]];
  // [assumed] a black line under the edge, the white slab above it
  for (const r of slabs) {
    box(b, r, Y.ROOF - 3, Y.ROOF - 2, BLACK, 'plate');
    box(b, r, Y.ROOF - 2, Y.ROOF, WHITE, 'plate');
  }
  // [documented: a roof light over the stair] a grey cube with glass all round
  b.newGroup();
  const [x0, z0, x1, z1] = ROOF_LIGHT;
  box(b, ROOF_LIGHT, Y.ROOF, Y.ROOF + 3, GREY);
  for (const r of [[x0, z0, x1, z0 + 1], [x0, z1 - 1, x1, z1], [x0, z0 + 1, x0 + 1, z1 - 1], [x1 - 1, z0 + 1, x1, z1 - 1]] as Rect[])
    b.box(r[0], r[1], r[2], r[3], Y.ROOF + 3, Y.LIGHT - 2, { kind: 'glass', color: GLASS });
  box(b, ROOF_LIGHT, Y.LIGHT - 2, Y.LIGHT, GREY);
}

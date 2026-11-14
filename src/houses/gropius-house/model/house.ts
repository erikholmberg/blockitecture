/**
 * The Gropius House itself (spec 078): the stone foundation and the cellar; the floors; the open wooden frame, the upper floor
 * and the deck, the chimney, the hall's stair, the spiral stair and the steel posts; the white vertical siding, the grey steel
 * windows, the glass-block wall, the porch's screens, the deck's parapet and its pink wall, the trellises; the flat roofs, the
 * canopy, the brise-soleil and the deck's open joists. Layout and sourcing: layout.ts.
 */
import { C } from '@/engine/catalog';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BRISE, CANOPY, CANOPY_POSTS, CHIMNEY, DECK, DECK_OPENING, DECK_POST, ENTRY, FIREPLACE, GB_N, GB_X0, gbZ, HOUSE, inCanopy, inRect,
  inUpper, LALLY, onRing, PORCH, Rect, SPIRAL, STAIR, STAIRWELL, TRELLIS_NW, TRELLIS_SE, UPPER, UPPER_EXT, Y,
} from './layout';
import { CELLAR, CELLAR_FLOOR, FOUNDATION } from './site';

/** the siding, the trellises, the parapets and the canopy's fascia: "white-painted vertical redwood siding" [documented] */
export const SIDING = 0xf2f1ea;
/** the steel: window frames "in grey-painted steel" [documented: the nomination; Wikipedia says black, spec 078 Q7], the
 * canopy's posts, the spiral stair ("grey-painted metal" [documented]), the lally columns and the rails */
export const GREY = 0x5f6569;
/** the chimney: "grey-painted brick in Flemish bond" [documented]; headers a shade darker [assumed] */
export const CHIMNEY_GREYS = [0x8e908d, 0x7d7f7c];
/** the deck's north wall, "painted salmon pink in 1949" [documented] */
export const SALMON = 0xe39a82;
/** the glass blocks: Owens-Corning, patterned on both faces [documented]; a pale, frosted block that glows at dusk [assumed] */
export const GLASS_BLOCK = 0xcfe2da;
/** every other block a shade deeper, so the blocks read one by one [assumed] */
export const GLASS_BLOCKS = [GLASS_BLOCK, 0xbdd5cd];
export const glassBlock = (u: number, y: number) => GLASS_BLOCKS[(u + Math.floor(y / 3)) & 1];
export const GLASS = 0xd8ecef;
const DOOR_GLASS = 0xc4dade;
const RIBBED = 0xcbd8d4; // the pantry's ribbed glass [documented]
/** the porch's galvanised steel screens [documented], as grey see-through panels */
export const SCREEN = 0x7f868a;
const CEILING = 0xeeede7;
const ROOFING = 0x6e6a64; // tar and gravel [documented]
const DRAIN = 0x4e4b47;
const DECK_FLOOR = 0x8f8578; // [assumed]
const CONCRETE = 0xc9c3b5;
const BLUESTONE = [0x6f7a85, 0x7a8590, 0x66717c]; // the porch's bluestone slabs [documented]
const BASE_BRICK = 0x8c5442; // the glass block's low base [scaled: HABS 8]
/** fieldstone: the foundation [documented: "a stone foundation"], the retaining walls and the road's wall [documented] */
export const FIELDSTONE = [0x8b8378, 0x7a7266, 0x958c7e, 0x6f685e];
export const fieldstone = (x: number, y: number, z: number) => FIELDSTONE[Math.floor(hash2(Math.floor(x / 2) * 7 + Math.floor(y / 3) * 13, Math.floor(z / 2) * 11) * 4)];
const PL = 0.4;

/* ---------- the walls and their openings ---------- */

/** a wall segment: along x at z (axis 'x') or along z at x (axis 'z'), cells [a, b) */
interface Seg { axis: 'x' | 'z'; line: number; a: number; b: number }
const GF_Y: [number, number] = [0, Y.GF_CEIL];
const UP_Y: [number, number] = [Y.UP, Y.ROOF];
/** the ground floor's walls: the ring of the house */
export const GF_SEGS: Seg[] = [
  { axis: 'x', line: HOUSE[1], a: HOUSE[0], b: HOUSE[2] }, { axis: 'x', line: HOUSE[3] - 1, a: HOUSE[0], b: HOUSE[2] },
  { axis: 'z', line: HOUSE[0], a: HOUSE[1], b: HOUSE[3] }, { axis: 'z', line: HOUSE[2] - 1, a: HOUSE[1], b: HOUSE[3] },
];
/** the upper floor's walls, with the deck's north wall: "a solid wall of siding" [documented] */
export const UP_SEGS: Seg[] = [
  { axis: 'x', line: 0, a: DECK[0], b: UPPER[2] },
  { axis: 'z', line: UPPER[2] - 1, a: 0, b: UPPER_EXT[3] },
  { axis: 'x', line: UPPER_EXT[3] - 1, a: UPPER_EXT[0], b: UPPER_EXT[2] },
  { axis: 'z', line: UPPER_EXT[0], a: UPPER[3] - 1, b: UPPER_EXT[3] },
  { axis: 'x', line: UPPER[3] - 1, a: UPPER[0], b: UPPER_EXT[0] + 1 },
  { axis: 'z', line: UPPER[0], a: 0, b: UPPER[3] },
];
const onSeg = (s: Seg, x: number, z: number) => (s.axis === 'x' ? z === s.line && x >= s.a && x < s.b : x === s.line && z >= s.a && z < s.b);
const segCells = (s: Seg): [number, number][] => Array.from({ length: s.b - s.a }, (_, i) => (s.axis === 'x' ? [s.a + i, s.line] : [s.line, s.a + i]));

export type OpeningKind = 'win' | 'big' | 'door' | 'ribbed' | 'open';
/** an opening in a wall: cells [a, b) along the segment's line, plates [y0, y1) */
export interface Opening { axis: 'x' | 'z'; line: number; a: number; b: number; y: [number, number]; kind: OpeningKind; name: string }
const [n0, n1] = Y.N_WIN, [m0, m1] = Y.MAID_WIN, [g0, g1] = Y.BIG_WIN, [u0, u1] = Y.UP_N_WIN, [s0, s1] = Y.UP_S_WIN;
/**
 * The windows and doors. The north front's narrower bands and the south's wider ones [documented]; the north's heights and
 * where they run [scaled: HABS MA-1228-8]; the living and dining rooms' three big windows, 6 ft high, 10–11½ ft wide
 * [documented], the living room's wrapping its south-west corner [documented: "the living room's big corner window"]; the
 * bedrooms' ribbons [documented: 3 ft high]; one ribbon on each floor at the east end [scaled: HABS 3]. Where the others are
 * along the walls is [assumed].
 */
export const OPENINGS: Opening[] = [
  // the ground floor, north
  { axis: 'x', line: 0, a: 3, b: 13, y: [12, n1], kind: 'win', name: 'living north' },
  { axis: 'x', line: 0, a: 17, b: 27, y: [n0, n1], kind: 'win', name: 'study' },
  { axis: 'x', line: 0, a: ENTRY[0], b: ENTRY[1], y: [0, Y.DOOR], kind: 'door', name: 'entrance' },
  { axis: 'x', line: 0, a: 40, b: 43, y: [m0, m1], kind: 'win', name: 'maid bath' },
  { axis: 'x', line: 0, a: 46, b: 53, y: [m0, m1], kind: 'win', name: 'maid' },
  // the ground floor, south
  { axis: 'x', line: 21, a: 1, b: 12, y: [g0, g1], kind: 'big', name: 'living south' },
  { axis: 'x', line: 21, a: 12, b: 14, y: [0, g1], kind: 'door', name: 'living door' },
  { axis: 'x', line: 21, a: 17, b: 27, y: [g0, g1], kind: 'big', name: 'dining' },
  { axis: 'x', line: 21, a: 35, b: 38, y: [0, Y.DOOR], kind: 'door', name: 'porch door' },
  { axis: 'x', line: 21, a: 46, b: 48, y: [15, n1], kind: 'ribbed', name: 'pantry' },
  { axis: 'x', line: 21, a: 50, b: 52, y: [0, Y.DOOR], kind: 'door', name: 'kitchen door' },
  // the ground floor, west and east
  { axis: 'z', line: 0, a: 10, b: 21, y: [g0, g1], kind: 'big', name: 'living west' },
  { axis: 'z', line: 54, a: 3, b: 19, y: [n0, n1], kind: 'win', name: 'east' },
  // the upper floor
  { axis: 'x', line: 0, a: 17, b: 54, y: [u0, u1], kind: 'win', name: 'upper north' },
  { axis: 'x', line: 0, a: DECK_OPENING[0], b: DECK_OPENING[1], y: [Y.UP, Y.UP + 18], kind: 'open', name: 'deck opening' },
  { axis: 'x', line: 21, a: 16, b: 27, y: [s0, s1], kind: 'win', name: "Ati's room" },
  { axis: 'x', line: 28, a: 30, b: 40, y: [s0, s1], kind: 'win', name: 'guest room' },
  { axis: 'x', line: 28, a: 43, b: 53, y: [s0, s1], kind: 'win', name: 'master bedroom' },
  { axis: 'z', line: 14, a: 16, b: 18, y: [Y.UP, Y.UP + Y.DOOR], kind: 'door', name: 'deck door' },
  { axis: 'z', line: 14, a: 3, b: 12, y: [s0, s1], kind: 'win', name: "Ati's west" },
  { axis: 'z', line: 54, a: 3, b: 26, y: [s0, s1], kind: 'win', name: 'upper east' },
];
const inOpening = (o: Opening, x: number, y: number, z: number) =>
  (o.axis === 'x' ? z === o.line && x >= o.a && x < o.b : x === o.line && z >= o.a && z < o.b) && y >= o.y[0] && y < o.y[1];

/** the living room's corner: a grey steel post between its two big windows [assumed] */
export const CORNER: [number, number] = [0, 21];

export type WallCell = 'wall' | 'chimney' | 'steel' | Opening;
/** what an exterior wall cell is at a height: siding, the chimney, the corner post, or an opening */
export function wallCell(x: number, y: number, z: number): WallCell | null {
  const gf = y >= GF_Y[0] && y < GF_Y[1], up = y >= UP_Y[0] && y < UP_Y[1];
  if (!(gf && GF_SEGS.some((s) => onSeg(s, x, z))) && !(up && UP_SEGS.some((s) => onSeg(s, x, z)))) return null;
  if (inRect(x, z, CHIMNEY)) return 'chimney';
  if (gf && x === CORNER[0] && z === CORNER[1]) return 'steel';
  for (const o of OPENINGS) if (inOpening(o, x, y, z)) return o;
  return 'wall';
}

/* ---------- foundation, floors ---------- */

/** the stone foundation, the cellar under the hall and kitchen [documented]; the porch's and the posts' bases (foundation) */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  // the cellar: its floor and walls [documented: a partial cellar; its depth assumed]
  b.box(CELLAR[0], CELLAR[1], CELLAR[2], CELLAR[3], CELLAR_FLOOR, CELLAR_FLOOR + 1, { kind: 'plate', color: CONCRETE });
  b.box(CELLAR[0] - 1, CELLAR[1] - 1, CELLAR[2] + 1, CELLAR[3] + 1, CELLAR_FLOOR, Y.LAWN - 3, {
    kind: 'brick', color: fieldstone, mask: (x, z) => onRing(x, z, [CELLAR[0] - 1, CELLAR[1] - 1, CELLAR[2] + 1, CELLAR[3] + 1]),
  });
  b.newGroup();
  // the foundation: stone round the edge [documented], solid under the floor [assumed]
  b.box(FOUNDATION[0], FOUNDATION[1], FOUNDATION[2], FOUNDATION[3], Y.LAWN - 3, -1, {
    kind: 'brick', color: (x, y, z) => (onRing(x, z, HOUSE) ? fieldstone(x, y, z) : CONCRETE),
    mask: (x, z) => inRect(x, z, HOUSE) && !inRect(x, z, CHIMNEY),
  });
  // the chimney's footing
  b.box(CHIMNEY[0], CHIMNEY[1], CHIMNEY[2], CHIMNEY[3], Y.LAWN - 3, Y.LAWN, { kind: 'brick', color: fieldstone });
  // the porch's concrete base [documented]
  b.newGroup();
  b.box(PORCH[0], PORCH[1], PORCH[2], PORCH[3], Y.LAWN, Y.LAWN + 1, { kind: 'plate', color: CONCRETE });
  // the footings of the steel posts and the spiral stair [assumed]
  b.newGroup();
  for (const [x, z] of [...CANOPY_POSTS, ...LALLY, [Math.floor(SPIRAL.x), Math.floor(SPIRAL.z)] as [number, number]]) b.add(x, z, Y.LAWN, 1, 1, 1, CONCRETE, 'plate');
}

/** the room each ground-floor cell belongs to, for its floor */
const GF_FLOOR = (x: number, z: number) => {
  if (x >= 29 && x < 38) return 0xa98458; // the hall's cork [documented]
  if (x >= 39 && (z < 9 || x >= 45)) return 0xe4e2dc; // the kitchen, the pantry and the baths: white tile [assumed]
  return 0xb8ae9a; // linoleum [assumed]
};

/** the floors: the ground floor's finishes, the porch's bluestone [documented], the kitchen's steps (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], -1, 0, { kind: 'tile', color: (x, _y, z) => GF_FLOOR(x, z), mask: (x, z) => !inRect(x, z, CHIMNEY) });
  b.newGroup();
  b.box(PORCH[0], PORCH[1], PORCH[2], PORCH[3], Y.LAWN + 1, -1, { kind: 'tile', color: (x, _y, z) => BLUESTONE[Math.floor(hash2(x >> 1, z >> 1) * 3)] });
  // the kitchen entrance's few steps under the overhang, concrete with flagstone pieces [documented]
  b.newGroup();
  for (let i = 0; i < 3; i++) b.box(49, 22 + i, 53, 23 + i, Y.LAWN, Y.LAWN + 3 - i, { kind: 'plate', color: (x) => (x % 2 ? CONCRETE : 0x9a948a) });
}

/* ---------- structure ---------- */

/** the chimney's Flemish bond: a darker header every other brick along each course [assumed] */
const flemish = (x: number, y: number, z: number) => ((x + z + (Math.floor(y / 3) & 1)) % 2 === 0 ? CHIMNEY_GREYS[1] : CHIMNEY_GREYS[0]);

/** the spiral stair's treads: 14 risers of 0.8 ft from the plinth to the deck [assumed: the count], 8 to a turn, each a wedge of
 * the cells round the post, the top one arriving at the deck's opening */
export const SPIRAL_POST: [number, number] = [Math.floor(SPIRAL.x), Math.floor(SPIRAL.z)];
export const SPIRAL_TREADS = 14;
export const treadY = (i: number) => Y.LAWN + 2 + 2 * i;
export function spiralCells(): { x: number; z: number; sector: number }[] {
  const out: { x: number; z: number; sector: number }[] = [];
  const [px, pz] = SPIRAL_POST;
  for (let z = pz - 3; z <= pz + 3; z++)
    for (let x = px - 3; x <= px + 3; x++) {
      const dx = x + 0.5 - SPIRAL.x, dz = z + 0.5 - SPIRAL.z;
      if ((x === px && z === pz) || Math.hypot(dx, dz) > SPIRAL.r) continue;
      out.push({ x, z, sector: (((Math.round(Math.atan2(dz, dx) / (Math.PI / 4)) % 8) + 8) % 8) });
    }
  return out;
}
/** the sector of tread i: the top one points +z, at the opening; each lower one a step back round the post */
export const treadSector = (i: number) => (((2 - (SPIRAL_TREADS - 1 - i)) % 8) + 8) % 8;

/** the frame, the upper floor, the chimney, the stairs, the steel posts (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the chimney, through the deck and above the roof [documented]; the fireplace open in its inner face
  b.newGroup();
  b.box(CHIMNEY[0], CHIMNEY[1], CHIMNEY[2], CHIMNEY[3], Y.LAWN, Y.CHIMNEY, {
    kind: 'brick', color: flemish, mask: (x, z, y) => !(inRect(x, z, FIREPLACE) && y >= 0 && y < 6),
  });
  // the living room's steel corner post [assumed], the deck's thin steel post [scaled: HABS 12]
  b.newGroup();
  b.column(CORNER[0], CORNER[1], 0, Y.GF_CEIL, GREY, 'bar');
  b.column(DECK_POST[0], DECK_POST[1], Y.UP, Y.ROOF - 1, GREY, 'bar');
  // the wooden frame: corner posts and studs every 4 ft, standing open [documented: a balloon frame, 4 × 6 in corner posts;
  // the spacing assumed], and the top plates
  for (const [segs, [y0, y1]] of [[GF_SEGS, GF_Y], [UP_SEGS, UP_Y]] as const) {
    b.newGroup();
    for (const s of segs)
      segCells(s).forEach(([x, z], i) => {
        if (!(i % 4 === 0 || i === s.b - s.a - 1) || !b.free(x, z, y0, y1 - 1)) return;
        for (let y = y0; y < y1 - 1; y++) if (wallCell(x, y, z) !== 'wall') return;
        b.add(x, z, y0, 1, 1, y1 - 1 - y0, SIDING, 'brick');
      });
    for (const s of segs)
      for (const [x, z] of segCells(s)) if (!inRect(x, z, CHIMNEY) && b.free(x, z, y1 - 1, y1)) b.add(x, z, y1 - 1, 1, 1, 1, SIDING, 'plate');
  }
  // the upper floor and the deck's floor: white at the edge, the ceiling below, the floor above
  b.newGroup();
  const slab = (x: number, z: number) => (inRect(x, z, HOUSE) || inRect(x, z, UPPER_EXT)) && !inRect(x, z, STAIRWELL);
  const edge = (x: number, z: number) => onRing(x, z, HOUSE) || (inRect(x, z, UPPER_EXT) && (z === UPPER_EXT[3] - 1 || x === UPPER_EXT[0] || x === UPPER_EXT[2] - 1));
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], UPPER_EXT[3], Y.GF_CEIL, Y.GF_CEIL + 1, { kind: 'plate', color: (x, _y, z) => (edge(x, z) ? SIDING : CEILING), mask: slab });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], UPPER_EXT[3], Y.GF_CEIL + 1, Y.UP, {
    kind: 'tile', color: (x, _y, z) => (edge(x, z) && !inRect(x, z, DECK) ? SIDING : inRect(x, z, DECK) ? DECK_FLOOR : x >= 29 && x < 38 ? 0xa98458 : 0xb8ae9a),
    mask: slab,
  });
  // the hall's stair: 13 risers up the east side, its open side on chrome balusters [documented: "chrome pipe balusters";
  // the run assumed]
  b.newGroup();
  for (let i = 0; i < STAIR.steps; i++) b.box(STAIR.x0, STAIR.zBottom - i, STAIR.x1, STAIR.zBottom - i + 1, 0, 2 * (i + 1), { kind: 'brick', color: 0xb9a27e });
  for (let i = 1; i < STAIR.steps; i += 3) b.column(STAIR.x0 - 1, STAIR.zBottom - i, 2 * (i + 1), 2 * (i + 1) + 6, 0xc9ccd0, 'bar');
  // the lally columns under the brise-soleil and the overhang [documented]
  b.newGroup();
  for (const [x, z] of LALLY) b.column(x, z, Y.LAWN + 1, Y.GF_CEIL, GREY, 'bar');
  // the porch's posts [documented: "a plaster ceiling on posts"; four, assumed]
  for (const [x, z] of [[PORCH[0], PORCH[3] - 1], [PORCH[2] - 1, PORCH[3] - 1], [PORCH[0], 36], [PORCH[2] - 1, 36]]) b.column(x, z, -1, Y.GF_CEIL, GREY, 'bar');
  // the canopy's two thin steel posts [documented]
  b.newGroup();
  for (const [x, z] of CANOPY_POSTS) b.column(x, z, Y.LAWN + 1, Y.CANOPY[0], GREY, 'bar');
  // the spiral stair: a grey steel post, its treads rising round it to the deck [documented]
  b.newGroup();
  b.column(SPIRAL_POST[0], SPIRAL_POST[1], Y.LAWN + 1, Y.UP + 6, GREY, 'bar');
  const cells = spiralCells();
  for (let i = 0; i < SPIRAL_TREADS; i++)
    for (const c of cells) if (c.sector === treadSector(i)) b.add(c.x, c.z, treadY(i), 1, 1, 1, GREY, 'tile');
}

/* ---------- envelope ---------- */

/** vertical boards: 1 stud wide, up to 12 plates long, the joints staggered from board to board [assumed: how the siding reads] */
function boards(b: Builder, x: number, z: number, y0: number, y1: number, ok: (y: number) => boolean, color = SIDING) {
  let y = y0;
  while (y < y1) {
    if (!ok(y) || !b.free(x, z, y, y + 1)) { y++; continue; }
    let e = y;
    while (e < y1 && ok(e) && b.free(x, z, e, e + 1)) e++;
    let first = (x + z) % 2 ? 6 : 12;
    for (let p = y; p < e; ) {
      const h = Math.min(first, e - p);
      b.add(x, z, p, 1, 1, h, color, 'brick');
      p += h;
      first = 12;
    }
    y = e;
  }
}

/** a window: grey steel sill, head and mullions every 4 ft round the panes [documented: grey-painted steel frames] */
function drawOpening(b: Builder, o: Opening) {
  const [y0, y1] = o.y;
  const cell = (u: number): [number, number] => (o.axis === 'x' ? [u, o.line] : [o.line, u]);
  const box = (a: number, bb: number, ya: number, yb: number, opts: Parameters<Builder['box']>[6]) =>
    o.axis === 'x' ? b.box(a, o.line, bb, o.line + 1, ya, yb, opts) : b.box(o.line, a, o.line + 1, bb, ya, yb, opts);
  if (o.kind === 'open') return;
  if (o.kind === 'door') {
    box(o.a, o.b, y1 - 1, y1, { kind: 'plate', color: GREY });
    box(o.a, o.b, y0, y1 - 1, { kind: 'glass', color: DOOR_GLASS });
    return;
  }
  box(o.a, o.b, y0, y0 + 1, { kind: 'plate', color: GREY });
  box(o.a, o.b, y1 - 1, y1, { kind: 'plate', color: GREY });
  for (let u = o.a; u < o.b; u++) if ((u - o.a) % 4 === 0 || u === o.b - 1) { const [x, z] = cell(u); if (b.free(x, z, y0 + 1, y1 - 1)) b.add(x, z, y0 + 1, 1, 1, y1 - 2 - y0, GREY, 'brick'); }
  box(o.a, o.b, y0 + 1, y1 - 1, { kind: 'glass', unit: y1 - 2 - y0, color: o.kind === 'ribbed' ? RIBBED : GLASS });
}

/** the glass-block wall: the cells, one block each, along its 30° line */
export const glassBlockCells = (): [number, number][] => Array.from({ length: GB_N }, (_, i) => [GB_X0 + i, gbZ(GB_X0 + i)]);

/** the siding, the windows and doors, the glass block, the screens, the deck's walls and rail, the trellises (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  // the white siding: vertical boards [documented]
  for (const [segs, [y0, y1]] of [[GF_SEGS, GF_Y], [UP_SEGS, UP_Y]] as const) {
    b.newGroup();
    for (const s of segs) for (const [x, z] of segCells(s)) boards(b, x, z, y0, y1 - 1, (y) => wallCell(x, y, z) === 'wall');
  }
  // the grey steel windows and the plate glass, the doors
  b.newGroup();
  for (const o of OPENINGS) drawOpening(b, o);
  // the glass-block wall at the entrance, 12 × 9 blocks on its low base [scaled], under the canopy's edge [documented]
  b.newGroup();
  for (const [x, z] of glassBlockCells()) {
    b.add(x, z, Y.LAWN, 1, 1, Y.GB_BASE - Y.LAWN, BASE_BRICK, 'brick');
    for (let y = Y.GB_BASE; y < Y.GB_TOP; y += 3) b.add(x, z, y, 1, 1, 3, glassBlock(x, y + 1), 'light');
  }
  // the porch's screens, galvanised steel [documented], between its posts, floor to ceiling
  b.newGroup();
  const screen = (x: number, z: number) => inRect(x, z, PORCH) && (x === PORCH[0] || x === PORCH[2] - 1 || z === PORCH[3] - 1);
  b.box(PORCH[0], PORCH[1], PORCH[0] + 1, PORCH[3], -1, Y.GF_CEIL, { kind: 'glass', color: SCREEN, mask: screen });
  b.box(PORCH[2] - 1, PORCH[1], PORCH[2], PORCH[3], -1, Y.GF_CEIL, { kind: 'glass', color: SCREEN, mask: screen });
  b.box(PORCH[0], PORCH[3] - 1, PORCH[2], PORCH[3], -1, Y.GF_CEIL, { kind: 'glass', color: SCREEN, mask: screen });
  // the deck: its low parapet on the west and south, the pipe rail on it [documented], and the salmon-pink face of its north
  // wall [documented]
  b.newGroup();
  const parapet = (x: number, z: number) => inRect(x, z, DECK) && (x === DECK[0] || z === DECK[3] - 1) && !inRect(x, z, CHIMNEY) && !(x === DECK_POST[0] && z === DECK_POST[1]) && z > 0;
  b.box(DECK[0], DECK[1], DECK[2], DECK[3], Y.UP, Y.UP + 3, { kind: 'brick', color: SIDING, mask: parapet });
  b.box(DECK[0], DECK[1], DECK[2], DECK[3], Y.UP + 3, Y.UP + 7, { kind: 'bar', color: GREY, mask: (x, z) => parapet(x, z) && (x + z) % 4 === 1 });
  b.box(DECK[0], DECK[1], DECK[2], DECK[3], Y.UP + 7, Y.UP + 8, { kind: 'tile', color: GREY, mask: parapet });
  b.box(DECK[0] + 1, 1, DECK[2], 2, Y.UP, Y.ROOF - 1, {
    kind: 'brick', unit: 6, sizes: [[1, 1]], color: SALMON,
    mask: (x, _z, y) => !(x >= DECK_OPENING[0] && x < DECK_OPENING[1] && y < Y.UP + 18),
  });
  // the two trellises of white vertical slats [documented], about 9 ft high [assumed], a rail along their tops
  b.newGroup();
  for (const t of [TRELLIS_NW, TRELLIS_SE]) {
    const along = t[2] - t[0] > 1 ? 'x' : 'z';
    b.box(t[0], t[1], t[2], t[3], Y.LAWN, 21, { kind: 'bar', color: SIDING, mask: (x, z) => (along === 'x' ? x : z) % 2 === 0 });
    b.box(t[0], t[1], t[2], t[3], 21, 22, { kind: 'plate', color: SIDING });
  }
}

/* ---------- roof ---------- */

/** the flat roofs: the main roof behind its parapet with a railing, the canopy, the brise-soleil, the deck's open joists, the
 * porch's roof (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  // the main roof: tar and gravel [documented], the central drain a darker patch [documented], behind a parapet [documented]
  b.newGroup();
  const perim = (x: number, z: number) => UP_SEGS.some((s) => onSeg(s, x, z));
  b.box(UPPER[0], UPPER[1], UPPER[2], UPPER_EXT[3], Y.ROOF, Y.ROOF + 1, {
    kind: 'plate', color: (x, _y, z) => (x >= 35 && x < 38 && z >= 10 && z < 13 ? DRAIN : ROOFING), mask: (x, z) => inUpper(x, z) && !perim(x, z),
  });
  b.newGroup();
  b.box(DECK[0], 0, UPPER[2], UPPER_EXT[3], Y.ROOF, Y.PARAPET, { kind: 'brick', unit: 2, color: SIDING, mask: (x, z) => perim(x, z) && !(z > 0 && x < UPPER[0]) });
  // the railing on the parapet [documented]: grey pipe posts and rail along the long sides [assumed]
  b.newGroup();
  const railLine = (x: number, z: number) => (z === 0 && x >= UPPER[0]) || (z === UPPER_EXT[3] - 1 && x >= UPPER_EXT[0]);
  b.box(UPPER[0], 0, UPPER[2], UPPER_EXT[3], Y.PARAPET, Y.PARAPET + 3, { kind: 'bar', color: GREY, mask: (x, z) => railLine(x, z) && (x % 6 === 2 || x === UPPER[2] - 1) });
  b.box(UPPER[0], 0, UPPER[2], UPPER_EXT[3], Y.PARAPET + 3, Y.PARAPET + 4, { kind: 'tile', color: GREY, mask: railLine });
  // the deck's open joists [documented], spanning from its north wall to a beam on the thin post [scaled: HABS 5/6]
  b.newGroup();
  b.box(DECK[0], DECK[3] - 1, DECK[2], DECK[3], Y.ROOF - 1, Y.ROOF + 1, { kind: 'brick', color: SIDING });
  b.box(DECK[0], 1, DECK[2], DECK[3] - 1, Y.ROOF - 1, Y.ROOF + 1, { kind: 'brick', color: SIDING, mask: (x) => x % 2 === 0 });
  // the brise-soleil on the south: open joists [documented] with aluminium shades between them [documented: aluminium,
  // adjustable; their spacing assumed]
  b.newGroup();
  b.box(BRISE[0], BRISE[1], BRISE[2], BRISE[3], Y.GF_CEIL, Y.UP, { kind: 'brick', unit: 2, color: SIDING, mask: (x, z) => x % 2 === 0 || z === BRISE[3] - 1 });
  b.box(BRISE[0], BRISE[1], BRISE[2], BRISE[3], Y.GF_CEIL + 1, Y.UP, { kind: 'tile', color: 0xbfc4c7, mask: (x) => x % 2 === 1 });
  // the porch's flat roof, its plaster ceiling below [documented]
  b.newGroup();
  b.box(PORCH[0], UPPER_EXT[3], PORCH[2], PORCH[3], Y.GF_CEIL, Y.GF_CEIL + 1, { kind: 'plate', color: (x, _y, z) => (x === PORCH[0] || x === PORCH[2] - 1 || z === PORCH[3] - 1 ? SIDING : CEILING) });
  b.box(PORCH[0], UPPER_EXT[3], PORCH[2], PORCH[3], Y.GF_CEIL + 1, Y.UP, { kind: 'tile', color: (x, _y, z) => (x === PORCH[0] || x === PORCH[2] - 1 || z === PORCH[3] - 1 ? SIDING : ROOFING) });
  // the canopy: a flat white slab at 30° [documented], on the glass block and its two posts, its far end cantilevered
  b.newGroup();
  b.box(CANOPY.x0, -CANOPY.w - 20, CANOPY.x1, 0, Y.CANOPY[0], Y.CANOPY[1], { kind: 'brick', unit: 2, color: SIDING, mask: (x, z) => inCanopy(x, z) });
}

/** the ceiling lights upstairs, and the light under the canopy, hung with the roof */
export function buildRoofLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[21, 10], [33, 8], [34, 21], [47, 21], [47, 7]]) b.add(x, z, Y.ROOF - 1, 1, 1, 1, C.warmLight, 'light');
    b.add(30, -3, Y.CANOPY[0] - 1, 1, 1, 1, C.warmLight, 'light');
  });
}

export const ft = (plates: number) => plates * PL;

/**
 * The Lovell Health House itself (spec 034), from HABS CA-1936: the pool's concrete cradle, the floors, the light steel frame
 * on its 5′-1½″ grid (raised in about 40 hours) with the third floor's slab and the entrance terrace, the white gunite bands and
 * the long ribbons of steel casements, and the roofs with the balconies hung from them on steel rods. Layout and sourcing:
 * layout.ts.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BALCONY, BALCONY_N, GUEST, LAUNDRY, LIBRARY, LIVING, LIVING_SOUTH, NURSERY, POOL, POOL_CRADLE, Rect, TERRACE, THIRD, THIRD_ENTRY,
  UNIT, Y,
} from './layout';
import { groundPlates } from './site';

/** the gunite walls, white [documented: photographs]; the steel frame and casements, dark [documented: photographs] */
export const WHITE = 0xf0eee8;
export const STEEL = 0x353b42;
export const GLASS = 0xcfe6ee;
export const CONCRETE = 0xb9b4a8;
export const CEMENT = [0xc8c3b6, 0xbfbaad];
/** the floors: maple in the living and dining rooms, oak upstairs [documented: the notes on sheets 4–5] */
export const MAPLE = [0xd9b98a, 0xd2b07f];
export const OAK = [0xc49a66, 0xbb915e];
export const POOL_BLUE = 0x8fcfdd;

interface Level { rects: Rect[]; y0: number; y1: number; sill: number; head: number; solidEast?: number }
/** the three storeys: their rooms, floor to ceiling, and the band of windows in each [documented: sheets 3–8; band heights assumed] */
export const LEVELS: Level[] = [
  { rects: [NURSERY, LAUNDRY], y0: Y.POOL, y1: Y.CEILING_POOL, sill: Y.POOL + 6, head: Y.CEILING_POOL - 4, solidEast: 69 },
  { rects: [LIVING, LIVING_SOUTH, GUEST, LIBRARY], y0: Y.LIVING, y1: Y.CEILING_LIVING, sill: Y.LIVING + 4, head: Y.CEILING_LIVING - 3, solidEast: 101 },
  { rects: [THIRD, THIRD_ENTRY], y0: Y.THIRD, y1: Y.CEILING_THIRD, sill: Y.THIRD + 6, head: Y.CEILING_THIRD - 3 },
];

const inAnyR = (x: number, z: number, rs: Rect[]) => rs.some((r) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3]);
/** the unit grid, from the house's north-west corner [documented: 5′-1½″] */
const onGrid = (v: number, o: number) => { const t = (v - o) / UNIT; return Math.abs(t - Math.round(t)) * UNIT < 0.5; };
const GX = 20, GZ = 16;

function boundary(rs: Rect[], x: number, z: number) {
  if (!inAnyR(x, z, rs)) return null;
  const w = !inAnyR(x - 1, z, rs), e = !inAnyR(x + 1, z, rs), n = !inAnyR(x, z - 1, rs), s = !inAnyR(x, z + 1, rs);
  if (!(w || e || n || s)) return null;
  const corner = (w || e) && (n || s);
  const along = n || s ? x : z;
  return { corner, column: corner || onGrid(along, n || s ? GX : GZ), e };
}

const bbox = (rs: Rect[]): Rect => [Math.min(...rs.map((r) => r[0])), Math.min(...rs.map((r) => r[1])), Math.max(...rs.map((r) => r[2])), Math.max(...rs.map((r) => r[3]))];

/** the pool's cradle: concrete walls and floor, plastered blue inside [documented: sheet 3, "U-shaped" cradle; depth assumed] */
export function buildFoundations(b: Builder) {
  b.setPhase(P.FOUNDATION);
  const [x0, z0, x1, z1] = POOL;
  b.box(x0 - 1, z0 - 1, x1 + 1, z1 + 1, Y.POOL_BOTTOM - 3, Y.POOL - 2, {
    kind: 'brick', mask: (x, z, y) => y < Y.POOL_BOTTOM || x < x0 || x >= x1 || z < z0 || z >= z1,
    color: (x, y, z) => (x >= x0 && x < x1 && z >= z0 && z < z1) || (y >= Y.POOL_BOTTOM && (x === x0 - 1 || x === x1 || z === z0 - 1 || z === z1)) ? POOL_BLUE : CONCRETE,
  });
  // concrete footings under every column of the frame
  b.newGroup();
  for (const lv of LEVELS) {
    const [bx0, bz0, bx1, bz1] = bbox(lv.rects);
    for (let z = bz0; z < bz1; z++) for (let x = bx0; x < bx1; x++) {
      const c = boundary(lv.rects, x, z);
      if (!c?.column || lv.y0 > Y.LIVING) continue;
      const g = groundPlates(x, z);
      if (g <= lv.y0 - 3 && !inAnyR(x, z, [POOL])) b.box(x, z, x + 1, z + 1, g - 3, g, { kind: 'brick', color: CONCRETE });
    }
  }
}

/** the pool floor's cement walk, and the living floor's concrete slab with its maple and cement floors (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  const under: Rect = [-1, 12, 71, 61];
  const walk = (x: number, z: number) => !inAnyR(x, z, [[POOL[0] - 1, POOL[1] - 1, POOL[2] + 1, POOL[3] + 1]]);
  b.box(under[0], under[1], under[2], under[3], Y.POOL - 2, Y.POOL - 1, { kind: 'plate', color: CONCRETE, mask: walk });
  b.box(under[0], under[1], under[2], under[3], Y.POOL - 1, Y.POOL, { kind: 'tile', color: (x, _y, z) => CEMENT[Math.floor(hash2(x >> 1, z >> 1) * 2)], mask: walk });
  // the pool's coping
  const [px0, pz0, px1, pz1] = POOL;
  b.box(px0 - 1, pz0 - 1, px1 + 1, pz1 + 1, Y.POOL - 2, Y.POOL, { kind: 'plate', color: WHITE, mask: (x, z) => x < px0 || x >= px1 || z < pz0 || z >= pz1 });
  slab(b, LEVELS[1].rects, Y.LIVING - 3, Y.LIVING, (x, z) => (inAnyR(x, z, [LIVING, LIVING_SOUTH]) ? MAPLE : inAnyR(x, z, [GUEST]) ? OAK : CEMENT)[Math.floor(hash2(x >> 1, z) * 2)]);
}

/** a concrete slab over the rects: a white edge, a finish on top */
function slab(b: Builder, rs: Rect[], y0: number, top: number, finish: (x: number, z: number) => number) {
  const [x0, z0, x1, z1] = bbox(rs);
  const edge = (x: number, z: number) => !inAnyR(x - 1, z, rs) || !inAnyR(x + 1, z, rs) || !inAnyR(x, z - 1, rs) || !inAnyR(x, z + 1, rs);
  b.box(x0, z0, x1, z1, y0, top - 1, { kind: 'plate', mask: (x, z) => inAnyR(x, z, rs), color: (x, _y, z) => (edge(x, z) ? WHITE : CONCRETE) });
  b.box(x0, z0, x1, z1, top - 1, top, { kind: 'tile', mask: (x, z) => inAnyR(x, z, rs), color: (x, _y, z) => (edge(x, z) ? WHITE : finish(x, z)) });
}

/**
 * The frame: the steel columns of every storey on the unit grid, the stilts over the pool floor under the living floor, the
 * third floor's slab and the entrance terrace's slab with its columns (structure).
 */
export function buildFrame(b: Builder) {
  b.setPhase(P.STRUCTURE);
  LEVELS.forEach((lv, i) => {
    b.newGroup();
    const [x0, z0, x1, z1] = bbox(lv.rects);
    const below = i > 0 ? LEVELS[i - 1].rects : [];
    for (let z = z0; z < z1; z++)
      for (let x = x0; x < x1; x++) {
        if (!boundary(lv.rects, x, z)?.column) continue;
        // where no storey below carries it, the column runs down to the ground [documented: sheets 6–8]
        const from = i === 2 && !inAnyR(x, z, below) ? groundPlates(x, z) : lv.y0;
        // the steel shows dark between the windows; above and below them the gunite wraps it, white [documented: photographs]
        b.box(x, z, x + 1, z + 1, from, lv.y1 + 3, { kind: 'brick', color: (_x, y) => (y >= lv.sill && y + 1 <= lv.head ? STEEL : WHITE) });
      }
  });
  // the stilts: the living floor stands on the frame over the pool floor wherever the ground falls away [documented: sheets 3, 8]
  b.newGroup();
  const [lx0, lz0, lx1, lz1] = LIVING;
  for (let z = lz0; z < lz1 + 6; z++)
    for (let x = lx0; x < lx1; x++) {
      if (!(onGrid(x, GX) && onGrid(z, GZ)) && !boundary([LIVING, LIVING_SOUTH], x, z)?.column) continue;
      if (!inAnyR(x, z, [LIVING, LIVING_SOUTH]) || inAnyR(x, z, [NURSERY, LAUNDRY, [POOL[0] - 1, POOL[1] - 1, POOL[2] + 1, POOL[3] + 1]])) continue;
      b.box(x, z, x + 1, z + 1, Y.POOL, Y.LIVING - 3, { kind: 'brick', color: WHITE });
    }
  // the third floor's slab, oak and linoleum [documented: sheet 5]
  b.newGroup();
  slab(b, LEVELS[2].rects, Y.THIRD - 3, Y.THIRD, (x, z) => OAK[Math.floor(hash2(x >> 1, z) * 2)]);
  // the entrance terrace out to the street, on columns from the patio [documented: sheets 4–5]
  b.newGroup();
  const [tx0, tz0, tx1, tz1] = TERRACE;
  for (const x of [tx0 + 4, tx0 + 14, tx0 + 24, tx0 + 34, tx1 - 2]) for (const z of [tz0, tz1 - 1]) b.box(x, z, x + 1, z + 1, groundPlates(x, z), Y.THIRD - 3, { kind: 'brick', color: STEEL });
  slab(b, [TERRACE], Y.THIRD - 3, Y.THIRD, (x, z) => CEMENT[Math.floor(hash2(x >> 1, z >> 1) * 2)]);
}

/** the white gunite bands and the ribbon windows of every storey; the terrace's parapet (envelope) */
export function buildWalls(b: Builder) {
  b.setPhase(P.ENVELOPE);
  for (const lv of LEVELS) {
    b.newGroup();
    const [x0, z0, x1, z1] = bbox(lv.rects);
    const solid = (x: number) => lv.solidEast !== undefined && x >= lv.solidEast;
    b.box(x0, z0, x1, z1, lv.y0, lv.y1, {
      kind: 'brick', color: WHITE,
      mask: (x, z, y) => { const c = boundary(lv.rects, x, z); return !!c && !c.column && (solid(x) || y < lv.sill || y + 3 > lv.head); },
    });
    b.box(x0, z0, x1, z1, lv.sill, lv.head, {
      kind: 'glass', color: GLASS,
      mask: (x, z) => { const c = boundary(lv.rects, x, z); return !!c && !c.column && !solid(x); },
    });
  }
  // the terrace's solid white parapet [documented: sheet 6]
  b.newGroup();
  const [tx0, tz0, tx1, tz1] = TERRACE;
  b.box(tx0, tz0, tx1, tz1, Y.THIRD, Y.THIRD + 9, { kind: 'brick', color: WHITE, mask: (x, z) => (z === tz0 || z === tz1 - 1 || x === tx1 - 1) && x >= THIRD_ENTRY[2] });
}

/**
 * The roofs: the main roof over the third floor and its balconies, with its parapet; the low roofs over the guest wing and
 * the library; and hung from the main roof's frame on steel rods, the balconies with their solid white fronts (roof)
 * [documented: "the balconies are suspended from the roof frame", sheet 1].
 */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  const MAIN: Rect[] = [THIRD, THIRD_ENTRY, BALCONY, BALCONY_N];
  slab(b, MAIN, Y.CEILING_THIRD, Y.ROOF, () => WHITE);
  const [x0, z0, x1, z1] = bbox(MAIN);
  b.box(x0, z0, x1, z1, Y.ROOF, Y.PARAPET, { kind: 'brick', color: WHITE, mask: (x, z) => !!boundary(MAIN, x, z) });
  b.newGroup();
  const LOW: Rect[] = [GUEST, LIBRARY];
  slab(b, LOW, Y.CEILING_LIVING, Y.THIRD, () => WHITE);
  const [lx0, lz0, lx1, lz1] = bbox(LOW);
  b.box(lx0, lz0, lx1, lz1, Y.THIRD, Y.THIRD + 3, { kind: 'brick', color: WHITE, mask: (x, z) => !!boundary(LOW, x, z) && !inAnyR(x, z, MAIN) && !inAnyR(x, z, [TERRACE]) });
  // the hung balconies
  b.hanging(P.ROOF, () => {
    for (const [r, outer] of [[BALCONY, BALCONY[3] - 1], [BALCONY_N, BALCONY_N[1]]] as [Rect, number][]) {
      b.newGroup();
      const [bx0, bz0, bx1, bz1] = r;
      b.box(bx0, bz0, bx1, bz1, Y.THIRD - 3, Y.THIRD, { kind: 'brick', color: WHITE });
      b.box(bx0, bz0, bx1, bz1, Y.THIRD, Y.THIRD + 9, { kind: 'brick', color: WHITE, mask: (x, z) => z === outer || ((x === bx0 || x === bx1 - 1) && !inAnyR(x, z, [THIRD, THIRD_ENTRY])) });
      // the steel rods, from the balcony's front up to the roof's edge, on the unit grid
      for (let x = bx0; x < bx1; x++) if (onGrid(x, GX) && x > bx0 && x < bx1 - 1) b.box(x, outer, x + 1, outer + 1, Y.THIRD + 9, Y.CEILING_THIRD, { kind: 'bar', color: STEEL });
    }
  });
}

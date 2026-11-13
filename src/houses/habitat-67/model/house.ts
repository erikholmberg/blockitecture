/**
 * Habitat 67 itself (spec 072): the footings and the parking level; the ground-level street; the boxes, the lift cores and the
 * streets; the windows, the guardrails and the streets' plexiglass; the open roofs and the streets' covers. Each box is laid
 * like the real precast shell, in large pieces: its floor in two slabs, its walls in panels up to 16 studs long and about half a
 * box high, its roof's edge as a ring beam. Layout and sourcing: layout.ts.
 */
import type { Kind } from '@/engine/catalog';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BASE_TOP, Box, BOXES, CORE_TOP, CORES, DWELLING_DOOR, inRect, isStreetLevel, LEVEL, levelY, Rect, STREET_LEVELS, STREETS,
} from './layout';
import { BASE_BOUNDS, inBase, inTunnel } from './site';

/** the concrete, "grey-beige" [documented], a tone a box so each reads on its own [assumed] */
export const CONCRETE = [0xcbbfa9, 0xc1b49e, 0xd2c6b1];
const SLAB_C = 0xb5a993;
/** dark window frames [scaled: photographs]; the glass; the plexiglass of the streets [documented] */
export const FRAME = 0x33373a;
export const GLASS = 0x46555d;
export const PLEXI = 0xcfe2ea;
/** wooden decking on the terraces [documented] */
export const DECK = [0x8f6c4c, 0x86654a];

/** a box's floor or roof in two slabs, and the strips of its edge */
const SLAB = [[19, 18], [18, 18], [16, 16], [16, 8], [8, 8], [19, 1], [16, 1], [8, 4], [8, 1], [4, 4], [4, 2], [4, 1], [2, 2], [2, 1], [1, 1]];
const BIG = [[32, 16], [20, 10], [16, 16], [16, 10], [16, 8], [10, 10], [10, 5], [8, 8], [8, 4], [4, 4], [4, 2], [2, 2], [2, 1], [1, 1]];
const tone = (bx: Box) => CONCRETE[Math.floor(hash2(bx.x * 3 + bx.l, bx.z * 5 + bx.l) * 3)];

/**
 * Lay a straight run of cells as long pieces: the cells where `want` holds and the space is free, in pieces of at most `max`
 * studs (the first of an odd course shorter, like a running bond). Glass is drawn as a thin pane.
 */
function lay(
  b: Builder, cells: [number, number][], y: number, h: number, color: number, kind: Kind, max: number,
  want: (x: number, z: number) => boolean = () => true, odd = false,
) {
  const alongX = cells.length > 1 && cells[1][0] !== cells[0][0];
  let run: [number, number][] = [];
  let first = true;
  const flush = () => {
    let k = 0;
    while (k < run.length) {
      const m = Math.min(odd && first ? Math.ceil(max / 2) : max, run.length - k);
      const [x, z] = run[k];
      const ok = b.add(x, z, y, alongX ? m : 1, alongX ? 1 : m, h, color, kind);
      if (ok && kind === 'glass') b.bricks[b.bricks.length - 1].thin = alongX ? 2 : 0;
      k += m;
      first = false;
    }
    run = [];
    first = true;
  };
  for (const [x, z] of cells) {
    if (want(x, z) && b.free(x, z, y, y + h)) run.push([x, z]);
    else if (run.length) flush();
  }
  if (run.length) flush();
}

/** what takes space at box level l: the boxes there, the street if it's a street level, the cores up to their tops */
export function occupiers(l: number): Rect[] {
  const out: Rect[] = BOXES.filter((b) => b.l === l).map((b) => b.r);
  if (isStreetLevel(l)) out.push(...STREETS);
  if (levelY(l) < CORE_TOP) out.push(...CORES);
  return out;
}
const OCC = Array.from({ length: 13 }, (_, l) => occupiers(l));
/** a box's roof is covered where something stands on it at the level above */
export const coveredAt = (bx: Box, x: number, z: number) => OCC[bx.l + 1].some((r) => inRect(x, z, r));
const onRing = (r: Rect, x: number, z: number) => x === r[0] || z === r[1] || x === r[2] - 1 || z === r[3] - 1;

/** the four walls of a box: the long ones run the box's full length, the ends fit between them */
interface Side { r: Rect; len: number; end: boolean; cells: [number, number][]; out: (u: number) => [number, number] }
function sides(bx: Box): Side[] {
  const [x0, z0, x1, z1] = bx.r;
  const alongX = bx.o === 'x';
  const line = (fx: number | null, fz: number | null, a: number, c: number): [number, number][] =>
    Array.from({ length: c - a }, (_, i) => (fx !== null ? [fx, a + i] : [a + i, fz!]) as [number, number]);
  // long sides first (they own the corners)
  return alongX
    ? [
        { r: [x0, z0, x1, z0 + 1], len: x1 - x0, end: false, cells: line(null, z0, x0, x1), out: (u) => [x0 + u, z0 - 1] },
        { r: [x0, z1 - 1, x1, z1], len: x1 - x0, end: false, cells: line(null, z1 - 1, x0, x1), out: (u) => [x0 + u, z1] },
        { r: [x0, z0 + 1, x0 + 1, z1 - 1], len: z1 - z0 - 2, end: true, cells: line(x0, null, z0 + 1, z1 - 1), out: (u) => [x0 - 1, z0 + 1 + u] },
        { r: [x1 - 1, z0 + 1, x1, z1 - 1], len: z1 - z0 - 2, end: true, cells: line(x1 - 1, null, z0 + 1, z1 - 1), out: (u) => [x1, z0 + 1 + u] },
      ]
    : [
        { r: [x0, z0, x0 + 1, z1], len: z1 - z0, end: false, cells: line(x0, null, z0, z1), out: (u) => [x0 - 1, z0 + u] },
        { r: [x1 - 1, z0, x1, z1], len: z1 - z0, end: false, cells: line(x1 - 1, null, z0, z1), out: (u) => [x1, z0 + u] },
        { r: [x0 + 1, z0, x1 - 1, z0 + 1], len: x1 - x0 - 2, end: true, cells: line(null, z0, x0 + 1, x1 - 1), out: (u) => [x0 + 1 + u, z0 - 1] },
        { r: [x0 + 1, z1 - 1, x1 - 1, z1], len: x1 - x0 - 2, end: true, cells: line(null, z1 - 1, x0 + 1, x1 - 1), out: (u) => [x0 + 1 + u, z1] },
      ];
}
type Opening = { side: number; u0: number; u1: number; y0: number; y1: number; kind: 'window' | 'end' | 'door' | 'inner' };
/**
 * A box's openings [documented: a window wall at one end or on the terrace side; assumed: which]: each end wall that looks out
 * onto open air is glazed nearly across, each long wall that does gets a window off its middle, and a wall onto a street at
 * its own level gets the dwelling's door [documented: the dwellings are entered directly off the streets].
 */
export function openings(bx: Box): Opening[] {
  const y = levelY(bx.l), out: Opening[] = [];
  const same = BOXES.filter((o) => o.l === bx.l && o !== bx).map((o) => o.r);
  const cores = levelY(bx.l) < CORE_TOP ? CORES : [];
  sides(bx).forEach((s, si) => {
    let blocked = 0, street = 0, n = 0;
    for (let u = 2; u < s.len - 2; u++) {
      const [x, z] = s.out(u);
      n++;
      if (same.some((r) => inRect(x, z, r)) || cores.some((r) => inRect(x, z, r))) blocked++;
      else if (isStreetLevel(bx.l) && STREETS.some((r) => inRect(x, z, r))) street++;
    }
    if (street > n / 2) {
      const m = Math.floor(s.len / 2) + (s.end ? 0 : -8);
      out.push({ side: si, u0: m - 2, u1: m + 2, y0: y + 1, y1: y + 13, kind: 'door' });
    } else if (blocked <= n / 3) {
      // the end glazed wall to wall and floor to ceiling; a long side's window floor to ceiling, off its middle
      if (s.end) out.push({ side: si, u0: 0, u1: s.len, y0: y + 1, y1: y + LEVEL - 1, kind: 'end' });
      else {
        const m = Math.floor(s.len / 2) + (hash2(bx.x, bx.z + si) < 0.5 ? -7 : 7);
        out.push({ side: si, u0: m - 4, u1: m + 4, y0: y + 1, y1: y + LEVEL - 1, kind: 'window' });
      }
    }
  });
  // the sample dwelling's two boxes open into each other [assumed]
  for (const d of DWELLING_DOOR.filter((q) => q.box === bx.i)) {
    const si = sides(bx).findIndex((s) => inRect(d.r[0], d.r[1], s.r) && !s.end);
    const s = sides(bx)[si];
    const u0 = s.cells.findIndex(([x, z]) => x === d.r[0] && z === d.r[1]);
    out.push({ side: si, u0, u1: u0 + Math.max(d.r[2] - d.r[0], d.r[3] - d.r[1]), y0: y + 1, y1: y + 19, kind: 'inner' });
  }
  return out;
}
export const OPEN = BOXES.map(openings);

/** a single flat layer at height y in large pieces: a course number that's even, so long pieces may start a run */
const flat = (y: number) => Math.max(1, y + 1);

/**
 * A terrace's deck: the biggest rectangle of the roof inside its edge with nothing standing on or beside it, if it's at least
 * 4 × 4 [assumed: the decking's extent].
 */
export function deckRect(bx: Box): Rect | null {
  const inner: Rect = [bx.r[0] + 1, bx.r[1] + 1, bx.r[2] - 1, bx.r[3] - 1];
  const standing: Rect[] = [...OCC[bx.l + 1], ...PIERS.filter((p) => p.y0 === levelY(bx.l + 1)).map((p) => [p.x, p.z, p.x + 2, p.z + 2] as Rect)];
  const covers = standing.filter((c) => c[0] < inner[2] + 1 && c[2] > inner[0] - 1 && c[1] < inner[3] + 1 && c[3] > inner[1] - 1);
  const xs0 = [inner[0], ...covers.map((c) => c[2] + 1)].filter((v) => v >= inner[0] && v < inner[2]);
  const xs1 = [inner[2], ...covers.map((c) => c[0] - 1)].filter((v) => v > inner[0] && v <= inner[2]);
  const zs0 = [inner[1], ...covers.map((c) => c[3] + 1)].filter((v) => v >= inner[1] && v < inner[3]);
  const zs1 = [inner[3], ...covers.map((c) => c[1] - 1)].filter((v) => v > inner[1] && v <= inner[3]);
  const clear = (r: Rect) => covers.every((c) => c[0] >= r[2] + 1 || c[2] <= r[0] - 1 || c[1] >= r[3] + 1 || c[3] <= r[1] - 1);
  let best: Rect | null = null, area = 15;
  for (const a of xs0) for (const c of xs1) for (const z0 of zs0) for (const z1 of zs1) {
    if (c - a < 4 || z1 - z0 < 4) continue;
    const r: Rect = [a, z0, c, z1];
    if ((c - a) * (z1 - z0) > area && clear(r)) { best = r; area = (c - a) * (z1 - z0); }
  }
  return best;
}
const PIERS = STREET_LEVELS.filter((l) => l > 0).flatMap((l) => piers(l));
export const DECKS = BOXES.map(deckRect);
/** something stands on a box's roof here: the box above, a street, a core, or a pier of the street above */
export const standsOnRoof = (bx: Box, x: number, z: number) =>
  coveredAt(bx, x, z) || PIERS.some((p) => p.y0 === levelY(bx.l + 1) && x >= p.x && x < p.x + 2 && z >= p.z && z < p.z + 2);

/** one box's walls, band by band between its openings' sills and heads (structure) */
function walls(b: Builder, bx: Box, color: number) {
  const y = levelY(bx.l);
  sides(bx).forEach((s, si) => {
    const ops = OPEN[bx.i].filter((o) => o.side === si);
    const cuts = new Set([y + 1, y + 13, y + LEVEL - 1]);
    for (const o of ops) { cuts.add(o.y0); cuts.add(o.y1); }
    const ys = [...cuts].sort((a, c) => a - c);
    for (let k = 0; k + 1 < ys.length; k++) {
      const ya = ys[k], yb = ys[k + 1];
      const solid = new Set<number>();
      s.cells.forEach((_, u) => { if (!ops.some((o) => u >= o.u0 && u < o.u1 && ya >= o.y0 && ya < o.y1)) solid.add(u); });
      lay(b, s.cells, ya, yb - ya, color, 'brick', 16, (x, z) => solid.has(s.cells.findIndex((c) => c[0] === x && c[1] === z)), ya >= y + 13);
    }
  });
}

/** the footings and the parking level (foundation) [assumed: its build] */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  const [x0, z0, x1, z1] = BASE_BOUNDS;
  b.newGroup();
  b.box(x0, z0, x1, z1, -3, 0, { kind: 'brick', unit: 3, sizes: BIG, color: 0x8a8478, mask: (x, z) => inBase(x, z) });
  // its outer walls, open where the service road runs through [documented: OSM, tunnel=yes]
  const edge = (x: number, z: number) => inBase(x, z) && (!inBase(x + 1, z) || !inBase(x - 1, z) || !inBase(x, z + 1) || !inBase(x, z - 1));
  b.newGroup();
  b.box(x0, z0, x1, z1, 0, BASE_TOP - 4, {
    kind: 'brick', unit: 8, sizes: [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]], color: CONCRETE[1],
    mask: (x, z) => edge(x, z) && !inTunnel(x, z),
  });
  // columns inside, on a 30 ft grid [assumed]
  b.newGroup();
  b.box(x0, z0, x1, z1, 0, BASE_TOP - 4, {
    kind: 'brick', unit: BASE_TOP - 4, sizes: [[2, 2]], color: SLAB_C,
    mask: (x, z) => { const u = (((x - 14) % 30) + 30) % 30, v = (((z - 14) % 30) + 30) % 30; return u < 2 && v < 2 && inBase(x, z) && inBase(x + 1, z + 1) && !edge(x, z) && !edge(x + 1, z + 1) && !inTunnel(x, z) && !inTunnel(x + 1, z + 1); },
  });
  // its roof, the boxes' and the streets' ground
  b.newGroup();
  b.box(x0, z0, x1, z1, BASE_TOP - 4, BASE_TOP, { kind: 'brick', unit: 4, sizes: BIG, color: SLAB_C, mask: (x, z) => inBase(x, z) });
}

/** the ground-level street on the parking level's roof, and the forecourts on the avenue (floor) */
export function buildFloor(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  for (const r of STREETS) b.box(r[0], r[1], r[2], r[3], BASE_TOP, BASE_TOP + 1, { kind: 'tile', sizes: BIG, color: 0xa9a397 });
  // [assumed] steps up onto the street at both its ends, from the lawns
  b.newGroup();
  const [s0, s1] = [STREETS[0], STREETS[STREETS.length - 1]];
  // (the lowest meet the lawn where it eases down toward the real ground)
  for (let i = -3; i < 8; i++) {
    const y = -3 + 3 * i;
    b.box(s0[0] - 16 + 2 * i, s0[1], s0[0], s0[3], y, y + 3, { kind: 'brick', unit: 3, sizes: BIG, color: 0xa9a397 });
    b.box(s1[2], s1[1], s1[2] + 16 - 2 * i, s1[3], y, y + 3, { kind: 'brick', unit: 3, sizes: BIG, color: 0xa9a397 });
  }
  // [assumed] a paved forecourt before each hill on the avenue's side
  b.newGroup();
  for (const c of CORES) b.box(c[0] - 24, -14, c[2] + 24, -4, -3, -2, { kind: 'tile', sizes: BIG, color: 0xc2bcb0 });
}

/** one box's shell: its floor, its walls round its openings, its roof's edge and wherever something stands on it (structure) */
function boxShell(b: Builder, bx: Box) {
  const [x0, z0, x1, z1] = bx.r, y = levelY(bx.l), c = tone(bx);
  b.newGroup();
  b.box(x0, z0, x1, z1, y, y + 1, { kind: 'plate', unit: flat(y), sizes: SLAB, color: SLAB_C });
  walls(b, bx, c);
  // the roof: a ring beam round its edge, and the slab wherever the box above, a street or a core stands on it; the rest is
  // laid with the open roofs
  for (const s of sides(bx)) lay(b, s.cells, y + LEVEL - 1, 1, c, 'plate', 19);
  b.box(x0 + 1, z0 + 1, x1 - 1, z1 - 1, y + LEVEL - 1, y + LEVEL, { kind: 'plate', unit: flat(y + LEVEL - 1), sizes: SLAB, color: c, mask: (x, z) => coveredAt(bx, x, z) });
}

/** the highest thing under (x, z) below street level L: a box's roof, a lower street's deck, the parking level's roof */
function standOn(x: number, z: number, L: number): number {
  let y = inBase(x, z) ? BASE_TOP : -3;
  for (const bx of BOXES) if (bx.l < L && inRect(x, z, bx.r)) y = Math.max(y, levelY(bx.l + 1));
  for (const l of STREET_LEVELS) if (l < L && STREETS.some((r) => inRect(x, z, r))) y = Math.max(y, levelY(l) + 1);
  return y;
}
/** where an upper street spans open air, piers carry it every 30 ft or so [assumed] */
export function piers(L: number): { x: number; z: number; y0: number }[] {
  const out: { x: number; z: number; y0: number }[] = [];
  const below = BOXES.filter((bx) => bx.l === L - 1);
  for (const s of STREETS) {
    const alongX = s[2] - s[0] > s[3] - s[1];
    const len = alongX ? s[2] - s[0] : s[3] - s[1];
    const cell = (u: number): [number, number] => (alongX ? [s[0] + u, s[1] + 1] : [s[0] + 1, s[1] + u]);
    let run = 0;
    for (let u = 0; u < len; u++) {
      const [x, z] = cell(u);
      const held = below.some((bx) => inRect(x, z, bx.r) && inRect(x + 1, z + 1, bx.r)) || CORES.some((r) => inRect(x, z, r) || inRect(x, z - 2, r));
      run = held ? 0 : run + 1;
      if (run === 15 || (run > 15 && (run - 15) % 30 === 0)) out.push({ x, z, y0: standOn(x, z, L) });
    }
  }
  return out;
}

/** the boxes, the cores and the streets, level by level and group by group (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  for (let l = 0; l < 12; l++) {
    // the lift cores rise a level at a time with the boxes [documented: three cores; their build assumed]
    for (const c of CORES) {
      const y0 = levelY(l), y1 = Math.min(levelY(l + 1), CORE_TOP);
      if (y0 >= CORE_TOP) continue;
      b.newGroup();
      b.box(c[0], c[1], c[2], c[3], y0, y1, {
        kind: 'brick', unit: 12, sizes: [[18, 1], [16, 1], [8, 1], [4, 1], [2, 1], [1, 1]], color: CONCRETE[0],
        mask: (x, z, y) => onRing(c, x, z) && !coreDoor(c, l, x, z, y) && !coreSlit(c, x, z, y),
      });
      // a landing at each street [documented: the lifts stop at every street]
      if (isStreetLevel(l) && l > 0) b.box(c[0] + 1, c[1] + 1, c[2] - 1, c[3] - 1, y0, y0 + 1, { kind: 'plate', sizes: BIG, color: SLAB_C });
    }
    // the street at this level: its deck, the piers under its spans, its kerbs [documented: streets on every fourth floor]
    if (isStreetLevel(l) && l > 0) {
      const y = levelY(l);
      b.newGroup();
      for (const p of piers(l)) b.box(p.x, p.z, p.x + 2, p.z + 2, p.y0, y, { kind: 'brick', unit: 50, sizes: [[2, 2]], color: SLAB_C });
      for (const r of STREETS) b.box(r[0], r[1], r[2], r[3], y, y + 1, { kind: 'plate', unit: flat(y), sizes: BIG, color: 0xa9a397 });
      for (const r of STREETS) for (const line of rims(r)) lay(b, line, y + 1, 2, CONCRETE[1], 'brick', 16, (x, z) => streetEdge(l, x, z));
    }
    // the boxes, group by group along the axis
    for (const bx of BOXES) if (bx.l === l) boxShell(b, bx);
  }
}

/** the four rims of a street rect, as lines of cells */
function rims(r: Rect): [number, number][][] {
  const xs = Array.from({ length: r[2] - r[0] }, (_, i) => r[0] + i), zs = Array.from({ length: r[3] - r[1] - 2 }, (_, i) => r[1] + 1 + i);
  return [xs.map((x) => [x, r[1]]), xs.map((x) => [x, r[3] - 1]), zs.map((z) => [r[0], z]), zs.map((z) => [r[2] - 1, z])] as [number, number][][];
}
/** a street's open edge at level l: on the corridor's rim, not against a box or a core [assumed] */
export function streetEdge(l: number, x: number, z: number): boolean {
  if (!STREETS.some((r) => inRect(x, z, r))) return false;
  const inside = (xx: number, zz: number) => STREETS.some((r) => inRect(xx, zz, r));
  const rim = !inside(x + 1, z) || !inside(x - 1, z) || !inside(x, z + 1) || !inside(x, z - 1);
  if (!rim) return false;
  const solid = (xx: number, zz: number) => OCC[l].some((r) => !STREETS.includes(r) && inRect(xx, zz, r));
  return ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => !inside(x + dx, z + dz) && solid(x + dx, z + dz));
}
/** a core's door onto the street at each street level, on its street side [assumed] */
const coreDoor = (c: Rect, l: number, x: number, z: number, y: number) =>
  isStreetLevel(l) && z === c[1] && x >= c[0] + 6 && x < c[2] - 6 && y >= levelY(l) && y < levelY(l) + 24;
/** a column of slit windows up the core's outer face [assumed] */
export const coreSlit = (c: Rect, x: number, z: number, y: number) =>
  z === c[3] - 1 && x >= c[0] + 8 && x < c[0] + 10 && y >= BASE_TOP + 6 && y < CORE_TOP - 6 && ((y - BASE_TOP) % LEVEL) >= 6 && ((y - BASE_TOP) % LEVEL) < 18;

/** the windows, the doors, the guardrails and the streets' plexiglass (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  for (const bx of BOXES) {
    b.newGroup();
    const ss = sides(bx);
    for (const o of OPEN[bx.i]) {
      const cells = ss[o.side].cells.slice(o.u0, o.u1);
      if (o.kind === 'inner') continue;
      if (o.kind === 'door') {
        // a dark door, glazed above [assumed]
        lay(b, cells, o.y0, o.y1 - o.y0, 0x5b4636, 'brick', 8);
      } else if (o.kind === 'end') {
        // a window wall across the end, in dark frames [documented: the boxes' window walls; scaled: photographs]
        const m = Math.floor(cells.length / 2);
        lay(b, [cells[m]], o.y0 + 1, o.y1 - o.y0 - 1, FRAME, 'brick', 1);
        lay(b, cells.slice(0, m), o.y0 + 1, o.y1 - o.y0 - 1, GLASS, 'glass', 16);
        lay(b, cells.slice(m + 1), o.y0 + 1, o.y1 - o.y0 - 1, GLASS, 'glass', 16);
      } else lay(b, cells, o.y0, o.y1 - o.y0, GLASS, 'glass', 16);
    }
    // glass guardrails round the terrace on its roof [documented: glass guardrails], on the open edges
    const y = levelY(bx.l + 1);
    for (const s of ss) lay(b, s.cells, y, 8, PLEXI, 'glass', 19, (x, z) => !coveredAt(bx, x, z));
  }
  // the 6th- and 10th-floor streets closed in by plexiglass walls [documented], on their open edges
  for (const l of STREET_LEVELS) {
    if (l === 0) continue;
    b.newGroup();
    for (const r of STREETS) for (const line of rims(r)) lay(b, line, levelY(l) + 3, 12, PLEXI, 'glass', 16, (x, z) => streetEdge(l, x, z));
  }
  // the cores' slit windows [assumed]
  b.newGroup();
  for (const c of CORES) b.box(c[0], c[3] - 1, c[2], c[3], BASE_TOP, CORE_TOP, { kind: 'glass', unit: 12, color: GLASS, mask: (x, z, y) => coreSlit(c, x, z, y) });
}

/** the open roofs: the rest of each roof slab, its wooden decking; the streets' plexiglass covers; the cores' tops (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  for (const bx of BOXES) {
    const [x0, z0, x1, z1] = bx.r, y = levelY(bx.l + 1);
    b.newGroup();
    b.box(x0 + 1, z0 + 1, x1 - 1, z1 - 1, y - 1, y, { kind: 'plate', unit: flat(y - 1), sizes: SLAB, color: tone(bx), mask: (x, z) => !coveredAt(bx, x, z) });
    // [documented] wooden decking on the terrace, clear of whatever stands on the roof: one deck, the biggest that fits
    const d = DECKS[bx.i];
    if (d) b.add(d[0], d[1], y, d[2] - d[0], d[3] - d[1], 1, DECK[(bx.x + bx.z) & 1], 'tile');
  }
  // [documented] the streets' covers, in plexiglass
  for (const l of STREET_LEVELS) {
    if (l === 0) continue;
    b.newGroup();
    for (const r of STREETS) b.box(r[0], r[1], r[2], r[3], levelY(l) + 15, levelY(l) + 16, { kind: 'glass', sizes: BIG, color: PLEXI });
  }
  // the cores' roofs and parapets [assumed]
  b.newGroup();
  for (const c of CORES) {
    b.box(c[0], c[1], c[2], c[3], CORE_TOP, CORE_TOP + 1, { kind: 'plate', sizes: BIG, color: SLAB_C });
    b.box(c[0], c[1], c[2], c[3], CORE_TOP + 1, CORE_TOP + 4, { kind: 'brick', unit: 3, sizes: [[18, 1], [16, 1], [8, 1], [2, 1], [1, 1]], color: CONCRETE[0], mask: (x, z) => onRing(c, x, z) });
  }
}

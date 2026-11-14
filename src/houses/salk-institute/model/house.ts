/**
 * The Salk Institute's two laboratory wings (spec 079): the cut's retaining walls and the lowest slab; the lowest lab floor and
 * the light wells' red paving; the bare concrete walls rising storey by storey with their tie holes, the Vierendeel trusses of
 * the service floors, the slabs, the outer towers and the study towers with their bridges, and the plaza's travertine laid when
 * the walls reach it; the labs' glass, the slits, the teak window walls and the porches' railings; the flat roofs. Built from
 * large pieces: the walls in runs up to 16 studs long and a storey (or less) high, the slabs in big plates (spec 079, as Trellick
 * and the Bauhaus). Plan and sourcing: layout.ts, site.ts and plan.ts.
 */
import { Kind } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import {
  BENCHES, BLOCK, both, CHANNEL, FLAT_Z, fold, frontAt, GROVE_STEPS, GROVE_WALK, inAny, inRect, inTower, LINKS, LOWER, onDiagonal, onFlat,
  onWestFace, OUTER_TOWERS, PLANTERS, PLAZA, POINT_Z, SOURCE, STOREYS, STUDY_FLOORS, STUDY_TOWERS, studyOf, TOWER_BACK, TRUSS_POSTS, TRUSS_X, Y,
  BASIN1, BASIN2, Rect,
} from './layout';
import { BX0, BX1, BZ0, BZ1, C, code, face, idx, openAir, storeyOf, top } from './plan';
import { BASIN3, inWestSteps, LOWER_WALL_X, westStepTop } from './site';

/** the concrete [documented: pozzolanic, "a warm, pinkish tone", left as cast]: one warm grey */
export const CONCRETE = 0xb7aca3;
/** the form-tie holes [documented: filled with lead plugs]: one lead grey */
export const HOLE = 0x5f6265;
/** the teak [documented: unsealed and unstained; the window walls of the studies and the west offices]: one colour */
export const TEAK = 0x8e6a49;
/** the plaza's travertine [documented: Italian Roman travertine, unfilled]: one cream */
export const TRAVERTINE = 0xe3d8c2;
/** the labs' and the studies' glass, in steel and teak frames [documented] */
export const GLASS = 0x9db6bd;
/** the porches' and bridges' steel railings [documented: the west plaza photograph] */
export const STEEL = 0x45494d;
/** the light wells' paving [documented: brick, the light-well photographs]: red */
export const RED_PAVING = 0xa65a43;
/** the roofs' finish [assumed] */
export const ROOF_FINISH = 0x9f9890;
/** the lower level's and the grove walk's paving [assumed: travertine too on the landing, granite on the walk] */
export const WALK = 0xb9ae9a;

/** the cascades [documented: the channel falls over a lip into the basin, which spills again; their places assumed]: a sheet over
 * the small basin's east wall, and one down the lower level's wall */
export const FALLS1_X = BASIN2[0] - 1;
export const FALLS2_X = LOWER_WALL_X + 1;
export const FALLS_HALF = 6;

/** the tie holes' rows: two to a storey [assumed: a regular grid, spec 079 Q9], every 8 studs along each wall */
export const HOLE_ROWS: number[] = STOREYS.flatMap((s) => [s.y0 + 6, s.y0 + 18]);
export const HOLE_EVERY = 8;
export const HOLE_AT = 4;
const isHole = (a: number, y: number) => HOLE_ROWS.includes(y) && ((a % HOLE_EVERY) + HOLE_EVERY) % HOLE_EVERY === HOLE_AT;

/** the four directions of plan.ts's `face` */
const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const WALL_BASE = Y.FOOTING + Y.SLAB; // −81: on the lowest slab
const WALL_TOP = Y.ROOF - Y.SLAB; // 75: under the roof slab

type Seg = { phase: number; color: number; kind: Kind } | null;
const concrete = (phase: number): Seg => ({ phase, color: CONCRETE, kind: 'brick' });
const env = (color: number, kind: Kind = 'brick'): Seg => ({ phase: P.ENVELOPE, color, kind });

/** the cells next to (x, z) that face out of the building, open at height y */
function openFaces(x: number, y: number, z: number): [number, number][] {
  const out: [number, number][] = [];
  for (const [dx, dz] of DIRS) if (openAir(x + dx, y, z + dz)) out.push([dx, dz]);
  return out;
}
/** concrete, with a tie hole if it's on a hole row and faces the open along one axis [documented: a regular grid] */
function cast(x: number, y: number, z: number, phase: number): Seg {
  const o = openFaces(x, y, z);
  if (o.length === 0) return concrete(phase);
  const alongX = o.every(([, dz]) => dz !== 0), alongZ = o.every(([dx]) => dx !== 0);
  if (alongX && isHole(x, y)) return { phase, color: HOLE, kind: 'brick' };
  if (alongZ && isHole(fold(z), y)) return { phase, color: HOLE, kind: 'brick' }; // the wings mirror each other
  return concrete(phase);
}

/** a door from a study floor's bridge into the block or the tower [assumed: 16 plates high] */
const linkDoor = (x: number, y: number) => LINKS.some(([a, b]) => x >= a && x < b) && STUDY_FLOORS.some((t) => y >= t && y < t + 16);

/** one cell of the lab block's or an outer tower's walls */
function blockWall(x: number, y: number, z: number, k: number, c: number): Seg {
  if (y < WALL_BASE || y >= WALL_TOP) return null;
  const f = face[k], fz = fold(z);
  if (c === C.INNER_WALL || f === 0) return concrete(P.STRUCTURE);
  const dirs = f === 8 ? DIRS : [DIRS[f - 1]];
  const out = dirs.filter(([dx, dz]) => code[idx(x + dx, z + dz)] !== C.BLOCK_IN);
  const open = out.some(([dx, dz]) => openAir(x + dx, y, z + dz));
  if (!open) return concrete(P.FOUNDATION); // against the ground: the cut's retaining wall
  if (f === 8) return cast(x, y, z, P.STRUCTURE);
  const a = f <= 2 ? fz : x; // along the wall (the wings mirror each other)
  const s = storeyOf(y);
  if (s < 0) return cast(x, y, z, P.STRUCTURE);
  const { kind, y0, y1 } = STOREYS[s];
  if (c === C.TOWER_WALL) {
    // the outer towers' slit windows on their outer face [documented: the north facade photograph]
    const outer = (z >= 0 && f === 4) || (z < 0 && f === 3);
    const t = (((x - 51) % 60) + 60) % 60;
    if (outer && (t === 10 || t === 11) && y >= y0 + 5 && y < y1 - 5) return env(GLASS, 'glass');
    return cast(x, y, z, P.STRUCTURE);
  }
  // the bridges' doors into the block's plaza side
  if (fz === BLOCK[1] && linkDoor(x, y)) return null;
  if (x < 51) {
    // the east end's support towers [documented: solid concrete; slits assumed]
    if (a % 10 === 5 && y >= y0 + 5 && y < y0 + 20) return env(GLASS, 'glass');
    return cast(x, y, z, P.STRUCTURE);
  }
  if (x >= 321) {
    // the west offices' teak window walls [documented: teak, toward the sea; their rhythm assumed]
    const m = ((a % 6) + 6) % 6;
    if (m >= 1 && m <= 4 && y >= y0 + 4 && y < y1 - 4) return m === 1 || m === 4 || y < y0 + 6 || y >= y1 - 6 ? env(TEAK) : env(GLASS, 'glass');
    return cast(x, y, z, P.STRUCTURE);
  }
  if (kind === 'lab') {
    // the labs' glass along both long sides [documented], a concrete pier at each truss [assumed]
    const pm = (((a - TRUSS_X[0]) % 20) + 20) % 20;
    if (pm === 0 || pm === 1) return cast(x, y, z, P.STRUCTURE);
    return env(GLASS, 'glass');
  }
  // the service floors: a band of concrete with slit openings [documented: the north facade photograph]
  if (a % 10 === 5 && y >= y0 + 5 && y < y0 + 20) return env(GLASS, 'glass');
  return cast(x, y, z, P.STRUCTURE);
}

/** one cell of a study tower above the plaza */
function studyWall(x: number, y: number, z: number): Seg {
  const fz = fold(z), s = studyOf(x);
  if (!s || y < 0 || y >= WALL_TOP || !inTower(x, fz)) return null;
  const tower = STUDY_TOWERS[s.tower];
  const slab = STUDY_FLOORS.concat([Y.T_PORCH]).some((t) => y >= t - Y.SLAB && y < t);
  if (slab) return null; // the floors
  const base = [...STUDY_FLOORS, Y.T_PORCH, 0].filter((t) => t <= y).sort((p, q) => q - p)[0];
  const study = STUDY_FLOORS.includes(base);
  const fin = (s.u === 19 && fz >= FLAT_Z) || (x === tower[0] && fz >= FLAT_Z);
  const back = fz === TOWER_BACK - 1;
  if (back && study && linkDoor(x, y)) return null;
  if (fin || back) return cast(x, y, z, P.STRUCTURE);
  if (!study) return null; // the arcade and the porch: open to the plaza
  if (onFlat(x, fz)) return cast(x, y, z, P.STRUCTURE);
  if (onDiagonal(x, fz) || onWestFace(x, fz)) {
    // the teak window walls (spec 079 Q8): teak boards, with the glass of the sliding and fixed sashes between [documented]
    const glass = y >= base + 5 && y < base + 13 && !(s.u === 19 && fz === POINT_Z);
    return glass ? env(GLASS, 'glass') : env(TEAK);
  }
  return null;
}

/** one cell of a retaining wall (the pits', the lower level's) */
function retaining(x: number, y: number, z: number, k: number): Seg {
  if (y < Y.FOOTING) return null;
  if (y < top[k]) return cast(x, y, z, P.FOUNDATION);
  return studyWall(x, y, z);
}

function wallAt(x: number, y: number, z: number): Seg {
  const k = idx(x, z);
  if (k < 0) return null;
  const c = code[k];
  if (c === C.BLOCK_WALL || c === C.INNER_WALL || c === C.TOWER_WALL) return blockWall(x, y, z, k, c);
  if (c === C.RING || c === C.LOWER_WALL) return retaining(x, y, z, k);
  if (c === C.STUDY) return studyWall(x, y, z);
  return null;
}

/** where a wall piece must break even if nothing changes: each storey (each tower level in a study tower) [assumed: a storey's
 * height at most] */
const BREAKS = new Set([...STOREYS.map((s) => s.y0), 0, Y.LOWEST]);
const TOWER_BREAKS = new Set([0, Y.T_STUDY1, Y.T_PORCH, Y.T_STUDY2]);

/**
 * Lay every wall cell of one phase: each cell's column cut into runs of one material, and equal runs merged along the wall
 * into pieces up to 16 studs long.
 */
function layWalls(b: Builder, phase: number) {
  b.setPhase(phase);
  // runs keyed by their wall line: along x (a z-facing wall) or along z
  const runs = new Map<string, number[]>();
  const y0 = Y.FOOTING, y1 = WALL_TOP;
  for (let z = BZ0; z < BZ1; z++)
    for (let x = BX0; x < BX1; x++) {
      const k = idx(x, z), c = code[k];
      if (c !== C.BLOCK_WALL && c !== C.INNER_WALL && c !== C.TOWER_WALL && c !== C.RING && c !== C.LOWER_WALL && c !== C.STUDY) continue;
      // along which axis this wall runs: its neighbours along x are walls too
      const wallish = (cc: number) => cc === C.BLOCK_WALL || cc === C.INNER_WALL || cc === C.TOWER_WALL || cc === C.RING || cc === C.LOWER_WALL || cc === C.STUDY;
      const axis = wallish(code[idx(x + 1, z)]) || wallish(code[idx(x - 1, z)]) ? 'x' : 'z';
      const breaks = c === C.STUDY ? TOWER_BREAKS : BREAKS;
      let start = y0, cur: Seg = wallAt(x, y0, z);
      const flush = (end: number) => {
        if (cur && cur.phase === phase && end > start) {
          const key = axis === 'x' ? `x|${z}|${start}|${end}|${cur.color}|${cur.kind}` : `z|${x}|${start}|${end}|${cur.color}|${cur.kind}`;
          const list = runs.get(key) ?? [];
          list.push(axis === 'x' ? x : z);
          runs.set(key, list);
        }
      };
      for (let y = y0 + 1; y <= y1; y++) {
        const s = y < y1 ? wallAt(x, y, z) : null;
        const same = s && cur && !breaks.has(y) && s.phase === cur.phase && s.color === cur.color && s.kind === cur.kind;
        if (!same) { flush(y); start = y; cur = s; }
      }
    }
  for (const [key, list] of runs) {
    const [axis, fixed, ys, ye, color, kind] = key.split('|');
    const yA = +ys, h = +ye - yA;
    list.sort((p, q) => p - q);
    let i = 0;
    while (i < list.length) {
      let j = i;
      while (j + 1 < list.length && list[j + 1] === list[j] + 1 && j + 1 - i < 16) j++;
      const len = j - i + 1;
      // a piece's length: 16, 8, 4, 2 or 1 studs (and 12, 6, 3 are fine), so long runs split evenly
      b.newGroup();
      if (axis === 'x') b.add(list[i], +fixed, yA, len, 1, h, +color, kind as Kind);
      else b.add(+fixed, list[i], yA, 1, len, h, +color, kind as Kind);
      if (kind === 'glass') b.bricks[b.bricks.length - 1].thin = axis === 'x' ? 2 : 0;
      i = j + 1;
    }
  }
}

/** big plates for the slabs */
const BIG_PLATE = [[32, 32], [32, 16], [24, 16], [16, 16], [16, 8], [12, 8], [8, 8], [8, 4], [4, 4], [8, 2], [4, 2], [2, 2], [8, 1], [4, 1], [2, 1], [1, 1]];
const inBlockPlan = (x: number, z: number) => { const c = code[idx(x, z)]; return c === C.BLOCK_IN || c === C.TOWER_IN; };
const inBlockOrWalls = (x: number, z: number) => { const c = code[idx(x, z)]; return c >= C.BLOCK_WALL && c <= C.TOWER_IN; };
const inPitPlan = (x: number, z: number) => code[idx(x, z)] === C.PIT;
const inLab = (x: number, z: number) => code[idx(x, z)] === C.BLOCK_IN;

/** the cut: the lowest slab under the wings and the pits, and the retaining walls (foundation) */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  b.box(BX0, BZ0, BX1, BZ1, Y.FOOTING, WALL_BASE, {
    kind: 'plate', unit: Y.SLAB, sizes: BIG_PLATE, color: CONCRETE, mask: (x, z) => inBlockOrWalls(x, z) || inPitPlan(x, z),
  });
  layWalls(b, P.FOUNDATION);
}

/** the lowest lab floor and the light wells' red paving (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  b.box(BX0, BZ0, BX1, BZ1, WALL_BASE, Y.LOWEST, { kind: 'plate', unit: Y.SLAB, sizes: BIG_PLATE, color: 0x9a948c, mask: inBlockPlan });
  b.newGroup();
  b.box(BX0, BZ0, BX1, BZ1, WALL_BASE, Y.LOWEST, { kind: 'plate', unit: Y.SLAB, sizes: BIG_PLATE, color: RED_PAVING, mask: inPitPlan });
}

/** the trusses of one service storey [documented: Vierendeel trusses 9 ft deep, openings 6 ft at the centre and 5 ft at the ends] */
function trusses(b: Builder, y0: number) {
  const z0 = BLOCK[1] + 1, z1 = BLOCK[3] - 1; // between the walls
  const first = TRUSS_POSTS[1], last = TRUSS_POSTS[TRUSS_POSTS.length - 2];
  const endOpening = (fz: number) => fz < first || fz >= last;
  const post = (fz: number) => TRUSS_POSTS.includes(fz);
  // the bottom chord's lower part is the service floor's slab, laid first across the whole floor
  const bands: [number, number, (fz: number) => boolean][] = [
    [y0 + Y.SLAB, y0 + Y.CHORD, () => true],
    [y0 + Y.CHORD, y0 + Y.END_CHORD, (fz) => post(fz) || endOpening(fz)],
    [y0 + Y.END_CHORD, y0 + Y.TRUSS - Y.END_CHORD, post],
    [y0 + Y.TRUSS - Y.END_CHORD, y0 + Y.TRUSS - Y.CHORD, (fz) => post(fz) || endOpening(fz)],
    [y0 + Y.TRUSS - Y.CHORD, y0 + Y.TRUSS, () => true],
  ];
  for (const s of [1, -1])
    for (const tx of TRUSS_X) {
      b.newGroup();
      for (const [ya, yb, on] of bands)
        b.box(tx, s > 0 ? z0 : -z1, tx + 1, s > 0 ? z1 : -z0, ya, yb, {
          kind: 'brick', unit: yb - ya, sizes: [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]], color: CONCRETE, mask: (_x, z) => on(fold(z)),
        });
    }
}

/** walls, trusses, slabs, the study towers and their bridges, the plaza (structure) */
export function buildStructure(b: Builder) {
  layWalls(b, P.STRUCTURE);
  b.setPhase(P.STRUCTURE);
  for (const s of STOREYS) {
    if (s.kind === 'service') {
      // the service floor (the lab's ceiling, and the trusses' bottom flange), and in the ends; then the trusses on it
      b.newGroup();
      b.box(BX0, BZ0, BX1, BZ1, s.y0, s.y0 + Y.SLAB, { kind: 'plate', unit: Y.SLAB, sizes: BIG_PLATE, color: CONCRETE, mask: inLab });
      trusses(b, s.y0);
    }
    // each storey's floor slab, over the trusses below [documented: the lab floors have no internal columns]
    if (s.kind === 'lab' && s.y0 > Y.LOWEST) {
      b.newGroup();
      b.box(BX0, BZ0, BX1, BZ1, s.y0 - Y.SLAB, s.y0, { kind: 'plate', unit: Y.SLAB, sizes: BIG_PLATE, color: CONCRETE, mask: inLab });
    }
  }
  // the study towers' floors [scaled: four levels]
  for (const t of [Y.T_STUDY1, Y.T_PORCH, Y.T_STUDY2]) {
    b.newGroup();
    b.box(BX0, BZ0, BX1, BZ1, t - Y.SLAB, t, { kind: 'plate', unit: Y.SLAB, sizes: BIG_PLATE, color: CONCRETE, mask: (x, z) => inTower(x, fold(z)) });
    // the bridges across the light court at the study floors [documented: OSM traces the links; assumed: at the study floors]
    if (t !== Y.T_PORCH) {
      b.newGroup();
      for (const [a, c] of LINKS)
        for (const r of both([[a, TOWER_BACK, c, BLOCK[1]]]))
          b.box(r[0], r[1], r[2], r[3], t - Y.SLAB, t, { kind: 'plate', unit: Y.SLAB, sizes: BIG_PLATE, color: CONCRETE });
    }
  }
  buildPlaza(b);
}

/** the plaza's travertine and the benches, the lower level's paving, the grove's walk and steps (structure: laid when the
 * walls reach the plaza) */
function buildPlaza(b: Builder) {
  b.setPhase(P.STRUCTURE);
  const water = (x: number, z: number) => inRect(x, z, CHANNEL) || inRect(x, z, SOURCE) || inRect(x, z, BASIN1) || inRect(x, z, BASIN2) || inRect(x, z, BASIN3);
  // [documented: travertine, in large plates (unfilled, ungrouted)] the plaza, the towers' arcades and the lips round the water
  b.newGroup();
  b.box(PLAZA[0], PLAZA[1], LOWER_WALL_X, PLAZA[3], -1, 0, {
    kind: 'tile', unit: 1, sizes: BIG_PLATE, color: TRAVERTINE, mask: (x, z) => !water(x, z) && !inWestSteps(x, z) && (code[idx(x, z)] === C.NONE || code[idx(x, z)] === C.STUDY),
  });
  // the basins' walls: travertine down to the water [assumed]
  for (const [r, wy] of [[BASIN1, Y.BASIN1_WATER], [BASIN2, Y.BASIN2_WATER]] as [Rect, number][]) {
    b.newGroup();
    const ring = (x: number, z: number, y: number) => !inRect(x, z, r) && inRect(x, z, [r[0] - 1, r[1] - 1, r[2] + 1, r[3] + 1]) && !inRect(x, z, CHANNEL)
      && !(x === FALLS1_X && Math.abs(z + 0.5) < FALLS_HALF && y >= Y.BASIN2_WATER);
    b.box(r[0] - 1, r[1] - 1, r[2] + 1, r[3] + 1, wy - 4, -1, { kind: 'brick', unit: 1, sizes: [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]], color: TRAVERTINE, mask: ring });
  }
  // the west steps down to the lower level [documented: OSM; 2 plates a step, assumed]
  b.newGroup();
  for (let x = 309; x <= LOWER_WALL_X; x++)
    for (const r of both([[x, 10, x + 1, 16]])) b.box(r[0], r[1], r[2], r[3], westStepTop(x) - 1, westStepTop(x), { kind: 'tile', unit: 1, color: TRAVERTINE });
  // the lower level's paving [assumed: travertine]
  b.newGroup();
  b.box(LOWER_WALL_X + 1, LOWER[1], LOWER[2], LOWER[3], Y.LANDING - 1, Y.LANDING, {
    kind: 'tile', unit: 1, sizes: BIG_PLATE, color: TRAVERTINE, mask: (x, z) => !inAny(x, z, PLANTERS) && !inRect(x, z, BASIN3),
  });
  // the grove's walk on the axis and its steps up to the plaza [documented: OSM ways 1124010507-08]
  b.newGroup();
  b.box(GROVE_WALK[0], GROVE_WALK[1], GROVE_STEPS[0], GROVE_WALK[3], Y.GROVE - 1, Y.GROVE, { kind: 'tile', unit: 1, sizes: BIG_PLATE, color: WALK });
  for (let x = GROVE_STEPS[0]; x < GROVE_STEPS[2]; x++) {
    const t = Math.min(0, Y.GROVE + 2 * (x - GROVE_STEPS[0]));
    b.box(x, GROVE_STEPS[1], x + 1, GROVE_STEPS[3], t - 1, t, { kind: 'tile', unit: 1, color: TRAVERTINE });
  }
  // the low travertine benches [documented: the west plaza photograph; their places and size assumed: 12 × 2 ft, 1.6 ft high]
  b.newGroup();
  for (const r of BENCHES) b.box(r[0], r[1], r[2], r[3], 0, 4, { kind: 'brick', unit: 4, sizes: [[12, 2], [6, 2], [2, 2]], color: TRAVERTINE });
}

/** the glass, the slits, the teak and the railings (envelope) */
export function buildEnvelope(b: Builder) {
  layWalls(b, P.ENVELOPE);
  b.setPhase(P.ENVELOPE);
  // the porches' railings [documented: steel railings, the west plaza photograph]: a rail 3 ft up, a post every 4 studs
  const front = (x: number, fz: number) => onDiagonal(x, fz) || onWestFace(x, fz) || (onFlat(x, fz) && studyOf(x)!.u > 0);
  b.newGroup();
  b.box(BX0, -60, BX1, 60, Y.T_PORCH + 7, Y.T_PORCH + 8, { kind: 'tile', unit: 1, sizes: [[8, 1], [4, 1], [2, 1], [1, 1]], color: STEEL, mask: (x, z) => front(x, fold(z)) });
  b.box(BX0, -60, BX1, 60, Y.T_PORCH, Y.T_PORCH + 7, { kind: 'bar', unit: 7, sizes: [[1, 1]], color: STEEL, mask: (x, z) => front(x, fold(z)) && (x + fold(z)) % 4 === 0 });
  // the bridges' railings, both sides
  for (const t of STUDY_FLOORS)
    for (const [a, c] of LINKS)
      for (const r of both([[a, TOWER_BACK, c, BLOCK[1]]])) {
        b.newGroup();
        b.box(r[0], r[1], r[2], r[3], t + 7, t + 8, { kind: 'tile', unit: 1, sizes: [[8, 1], [4, 1], [2, 1], [1, 1]], color: STEEL, mask: (x) => x === a || x === c - 1 });
        b.box(r[0], r[1], r[2], r[3], t, t + 7, { kind: 'bar', unit: 7, sizes: [[1, 1]], color: STEEL, mask: (x, z) => (x === a || x === c - 1) && fold(z) % 5 === 0 });
      }
}

/** the flat roofs and their parapets: the wings, the outer towers and the study towers (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  const blockish = (x: number, z: number) => inBlockOrWalls(x, z) && code[idx(x, z)] !== C.RING;
  const towerish = (x: number, z: number) => inTower(x, fold(z));
  const roofed = (x: number, z: number) => blockish(x, z) || towerish(x, z);
  b.newGroup();
  b.box(BX0, BZ0, BX1, BZ1, WALL_TOP, Y.ROOF, { kind: 'plate', unit: Y.SLAB, sizes: BIG_PLATE, color: CONCRETE, mask: roofed });
  const edge = (x: number, z: number) => roofed(x, z) && DIRS.some(([dx, dz]) => !roofed(x + dx, z + dz));
  b.newGroup();
  b.box(BX0, BZ0, BX1, BZ1, Y.ROOF, Y.PARAPET, { kind: 'brick', unit: Y.PARAPET - Y.ROOF, sizes: [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]], color: CONCRETE, mask: edge });
  b.newGroup();
  b.box(BX0, BZ0, BX1, BZ1, Y.ROOF, Y.ROOF + 1, { kind: 'tile', unit: 1, sizes: BIG_PLATE, color: ROOF_FINISH, mask: (x, z) => roofed(x, z) && !edge(x, z) });
}

export { frontAt, OUTER_TOWERS };

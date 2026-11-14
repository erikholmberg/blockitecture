/**
 * The Centre Pompidou itself (spec 080): the substructure and the footings; the Forum's floor; the steel cage, level by level
 * (columns, gerberettes, trusses, floors), the tie rods and the St Andrew's crosses; the west front's glass, the east front's
 * panels and coloured services, and the Chenille; the roof. Laid in large pieces, as Trellick Tower and Habitat 67 are: the
 * glass a pane at a time, the slabs in big plates, the trusses' chords in 16-stud pieces with their diagonals stepped 2 studs at
 * a time (spec 080 Q5). Layout and sourcing: layout.ts.
 */
import type { Kind } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import {
  AREA_E, BANDS, BAY, COL, COL_E, COL_W, COL_Y0, COL_Y1, CROSS_TIERS, FLIGHTS, flightY, FLOOR_Z0, FLOOR_Z1, FOOTPRINT, FRAMES,
  frameX, GALLERY_LEVELS, gerbBottom, GLASS_Z, LENGTH, levelY, MEZZ_Y, PANEL_Z, ROOF_Y, RUNS, Service, SLAB, TIE_E, TIE_W,
  TRUSS_D, TRUSS_Y, TRUSS_Z, trussBottom, TUBE_H, TUBE_Z, WIDTH,
} from './layout';
import { DIG_TOP, groundPlates, isColumn } from './site';

/** the cage's steel, painted white [documented] */
export const WHITE = 0xf1f1ec;
/** the services' four colours [documented by use; the values assumed]: blue for air, green for water, yellow for electricity,
 *  red for moving people */
export const SERVICE: Record<Service, number> = { air: 0x2a62c4, water: 0x2f9a48, power: 0xf2c51c, lift: 0xd3241f };
/** the west front's clear glass [documented: transparent]; the Chenille's tube [documented: transparent] */
export const GLASS = 0xcfe3ea;
export const TUBE = 0xd8eaf0;
/** the east front's opaque panels [documented: opaque], pale grey [assumed] */
export const PANEL = 0xc9cac6;
/** the escalators' undersides, red [assumed] */
export const ESCALATOR = 0xc62a22;
export const CONCRETE = 0xb4ada2;
const CONCRETE_DARK = 0x8f897e;
export const FLOOR = 0x9d9a94;
const SETT = 0xa39582;

const BIG = [[32, 32], [32, 16], [16, 16], [32, 8], [16, 8], [8, 8], [32, 4], [16, 4], [8, 4], [4, 4], [32, 2], [16, 2], [8, 2], [4, 2], [2, 2], [16, 1], [8, 1], [4, 1], [2, 1], [1, 1]];

/** a piece, only where its whole space is free (for pieces that may meet another of their kind, like a cross's two arms) */
export function put(b: Builder, x: number, z: number, y: number, w: number, d: number, h: number, color: number, kind: Kind = 'brick') {
  for (let zz = z; zz < z + d; zz++) for (let xx = x; xx < x + w; xx++) if (!b.free(xx, zz, y, y + h)) return false;
  return b.add(x, z, y, w, d, h, color, kind);
}

/** a straight run of cells laid as long pieces of at most `max`, split wherever a cell is taken or unwanted */
export function lay(
  b: Builder, cells: [number, number][], y: number, h: number, color: number, kind: Kind, max: number,
  want: (x: number, z: number) => boolean = () => true,
) {
  const alongX = cells.length > 1 && cells[1][0] !== cells[0][0];
  let run: [number, number][] = [];
  const flush = () => {
    for (let k = 0; k < run.length; k += max) {
      const m = Math.min(max, run.length - k), [x, z] = run[k];
      if (b.add(x, z, y, alongX ? m : 1, alongX ? 1 : m, h, color, kind) && kind === 'glass') b.bricks[b.bricks.length - 1].thin = alongX ? 2 : 0;
    }
    run = [];
  };
  for (const [x, z] of cells) {
    if (want(x, z) && b.free(x, z, y, y + h)) run.push([x, z]);
    else flush();
  }
  flush();
}
const alongX = (x0: number, x1: number, z: number) => Array.from({ length: x1 - x0 }, (_, i) => [x0 + i, z] as [number, number]);
const alongZ = (z0: number, z1: number, x: number) => Array.from({ length: z1 - z0 }, (_, i) => [x, z0 + i] as [number, number]);

/** the columns' corners: 14 frames × the two column lines */
export const COLUMNS = Array.from({ length: FRAMES }, (_, i) => [[frameX(i) - 1, COL_W], [frameX(i) - 1, COL_E]] as [number, number][]).flat();

/** the substructure's top, the footings, the tie anchors and the retaining wall by rue Beaubourg (foundation) */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  // [documented: the columns stand on the concrete substructure; the footings' size assumed] a pad under each column
  b.newGroup();
  for (const [x, z] of COLUMNS) b.add(x - 1, z - 1, COL_Y0 - 6, COL + 2, COL + 2, 6, CONCRETE_DARK);
  // [documented: a concrete substructure 166 × 122 m, three levels deep] its top, under the whole building and the yard
  b.newGroup();
  const isCol = (x: number, z: number) => COLUMNS.some(([cx, cz]) => x >= cx && x < cx + COL && z >= cz && z < cz + COL);
  b.box(FOOTPRINT[0], FOOTPRINT[1], FOOTPRINT[2], AREA_E[3] - 1, DIG_TOP, -2, {
    kind: 'brick', unit: 3, sizes: BIG, color: CONCRETE, mask: (x, z) => !isCol(x, z),
  });
  b.box(AREA_E[0], AREA_E[1], AREA_E[2], AREA_E[3] - 1, -2, 0, { kind: 'plate', unit: 2, sizes: BIG, color: CONCRETE });
  // [assumed] the retaining wall between the yard and rue Beaubourg's pavement, up to the street
  b.newGroup();
  for (let x = AREA_E[0]; x < AREA_E[2]; x += 16) {
    const w = Math.min(16, AREA_E[2] - x);
    let top = -Infinity;
    for (let k = 0; k < w; k++) top = Math.max(top, groundPlates(x + k, AREA_E[3]));
    b.add(x, AREA_E[3] - 1, DIG_TOP, w, 1, Math.max(top, 0) + 3 - DIG_TOP, CONCRETE);
  }
  // [documented: the ties are anchored at the ground] a concrete block under each tie, on both fronts
  b.newGroup();
  for (let i = 0; i < FRAMES; i++) {
    b.add(frameX(i) - 1, TIE_W, -2, 3, 2, 4, CONCRETE_DARK);
    b.add(frameX(i) - 1, TIE_E - 1, -2, 3, 2, 4, CONCRETE_DARK);
  }
}

/** the Forum's floor, under the open sky; the piazza's setts run on under the overhang to the glass [documented: OSM] (floor) */
export function buildFloor(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  b.box(FOOTPRINT[0], FOOTPRINT[1], FOOTPRINT[2], FOOTPRINT[3], -2, 0, {
    kind: 'plate', unit: 2, sizes: BIG, mask: (x, z) => !isColumn(x, z),
    color: (_x, _y, z) => (z < GLASS_Z ? SETT : z < FLOOR_Z1 ? FLOOR : CONCRETE),
  });
}

/** the gerberette on column line `west` at frame i, carrying truss level t (5 pieces: 3 down its outer arm, its collar round
 *  the column, its short inner arm) [documented: 8 m, cast steel, pinned on the column; its taper scaled] */
export function gerberette(b: Builder, i: number, t: number, west: boolean) {
  const x = frameX(i), top = TRUSS_Y[t] - SLAB, y0 = gerbBottom(t);
  // the outer arm, deepest at the column [scaled]
  const arm = west ? [[TIE_W, 7, 4], [7, 13, 6], [13, COL_W, 8]] : [[COL_E + COL, COL_E + COL + 6, 8], [COL_E + COL + 6, COL_E + COL + 12, 6], [COL_E + COL + 12, TIE_E + 1, 4]];
  for (const [z0, z1, h] of arm) b.add(x, z0, top - h, 1, z1 - z0, h, WHITE);
  // the collar round the column, and the short inner arm under the floor's edge, where the truss bears
  b.add(x - 1, west ? COL_W : COL_E, y0, COL, COL, top - y0, WHITE);
  if (west) b.add(x, FLOOR_Z0, top - 6, 1, TRUSS_Z[0] - FLOOR_Z0, 6, WHITE);
  else b.add(x, TRUSS_Z[1], top - 6, 1, FLOOR_Z1 - TRUSS_Z[1], 6, WHITE);
}

/** truss panel length: Warren diagonals over 8 studs, stepped 2 at a time [assumed: the panel count isn't published] */
export const PANEL_LEN = 8;
/** one Warren truss in frame i's plane at level t: two chords and the diagonals between, 20 plates deep [documented] */
export function truss(b: Builder, i: number, t: number) {
  const x = frameX(i), y = trussBottom(t);
  const [z0, z1] = TRUSS_Z;
  lay(b, alongZ(z0, z1, x), y, 2, WHITE, 'brick', 16);
  lay(b, alongZ(z0, z1, x), y + TRUSS_D - 2, 2, WHITE, 'brick', 16);
  const inner = TRUSS_D - 4;
  // an end post at each gerberette, then the diagonals panel by panel, alternately rising and falling
  b.add(x, z0, y + 2, 1, 1, inner, WHITE);
  b.add(x, z1 - 1, y + 2, 1, 1, inner, WHITE);
  const steps = PANEL_LEN / 2, dh = inner / steps;
  for (let k = 0, z = z0 + 1; z + PANEL_LEN <= z1 - 1; k++, z += PANEL_LEN)
    for (let s = 0; s < steps; s++) {
      const u = k % 2 === 0 ? s : steps - 1 - s;
      put(b, x, z + 2 * s, y + 2 + u * dh, 1, 2, dh, WHITE);
    }
}

/** a stepped diagonal in the plane z, from (xa, ya) to (xb, yb) inclusive, 2 studs a step; where it meets another, it gives way */
export function diagonal(b: Builder, z: number, xa: number, ya: number, xb: number, yb: number, color = WHITE, step = 2) {
  const n = Math.ceil((Math.abs(xb - xa) + 1) / step), dir = xb > xa ? 1 : -1;
  for (let s = 0; s < n; s++) {
    const w = Math.min(step, Math.abs(xb - xa) + 1 - s * step);
    const x = dir > 0 ? xa + s * step : xa - s * step - w + 1;
    const y0 = ya + Math.round((s * (yb - ya)) / n), y1 = ya + Math.round(((s + 1) * (yb - ya)) / n);
    if (y1 > y0) put(b, x, z, y0, w, 1, y1 - y0, color, 'brick');
  }
}

/** the mezzanine (level 1) in the Forum's south half, on white posts [assumed: its extent and its posts] */
export const MEZZ = { x0: frameX(0) + 2, x1: frameX(4) - 1, z0: 96, z1: FLOOR_Z1 - 1 };
export const MEZZ_POSTS: [number, number][] = [];
for (let x = MEZZ.x0 + 19; x < MEZZ.x1 - 4; x += BAY) for (const z of [MEZZ.z0 + 2, 134, MEZZ.z1 - 4]) MEZZ_POSTS.push([x, z]);

/** the cage, level by level: the columns to the level, its gerberettes, its 14 trusses, its ties, its floor (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  for (let t = 0; t < TRUSS_Y.length; t++) {
    // the columns' next length, up to this level's gerberettes [documented: 28 columns, in sections]
    b.newGroup();
    const c0 = t === 0 ? COL_Y0 : TRUSS_Y[t - 1] - SLAB;
    for (const [x, z] of COLUMNS) b.add(x, z, c0, COL, COL, gerbBottom(t) - c0, WHITE);
    if (t === 0) buildMezzanine(b);
    // [documented] the gerberettes onto the columns, then the trusses dropped onto them
    b.newGroup();
    for (let i = 0; i < FRAMES; i++) { gerberette(b, i, t, true); gerberette(b, i, t, false); }
    b.newGroup();
    for (let i = 0; i < FRAMES; i++) truss(b, i, t);
    // [documented: tie rods, 22 cm, as counterweights at the gerberettes' tips] up to this level's tips, both fronts
    b.newGroup();
    const y0 = t === 0 ? 2 : TRUSS_Y[t - 1] - SLAB, y1 = TRUSS_Y[t] - SLAB - 4;
    for (let i = 0; i < FRAMES; i++) {
      b.add(frameX(i), TIE_W, y0, 1, 1, y1 - y0, WHITE, 'bar');
      b.add(frameX(i), TIE_E, y0, 1, 1, y1 - y0, WHITE, 'bar');
    }
    // the floor on the trusses (the roof's goes in with the roof) [documented: concrete floors on the trusses]
    if (t < TRUSS_Y.length - 1) {
      b.newGroup();
      b.box(1, FLOOR_Z0, LENGTH - 1, FLOOR_Z1, TRUSS_Y[t] - SLAB, TRUSS_Y[t], { kind: 'plate', unit: SLAB, sizes: BIG, color: CONCRETE });
    }
  }
  // the columns' tops over the roof
  b.newGroup();
  for (const [x, z] of COLUMNS) b.add(x, z, ROOF_Y - SLAB, COL, COL, COL_Y1 - ROOF_Y + SLAB, WHITE);
  // [documented: St Andrew's crosses on the gerberettes' tips, two levels high; their tiers scaled] both long fronts, every bay
  for (const [ta, tb] of CROSS_TIERS) {
    b.newGroup();
    const ya = TRUSS_Y[ta] - SLAB - 4, yb = TRUSS_Y[tb] - SLAB - 4;
    for (let i = 0; i + 1 < FRAMES; i++) {
      const xa = frameX(i) + 1, xb = frameX(i + 1) - 1;
      for (const z of [TIE_W, TIE_E]) {
        diagonal(b, z, xa, ya, xb, yb);
        diagonal(b, z, xb, ya, xa, yb);
      }
    }
    // [assumed] the ends braced the same way, two crosses side by side across each end, outside its glass
    const half = Math.floor((FLOOR_Z0 + FLOOR_Z1) / 2);
    for (const x of [0, LENGTH - 1])
      for (const [za, zb] of [[FLOOR_Z0, half - 1], [half, FLOOR_Z1 - 1]]) {
        diagonalZ(b, x, za, ya, zb, yb);
        diagonalZ(b, x, zb, ya, za, yb);
      }
  }
}

/** a stepped diagonal in the plane x, across z, 3 studs a step (the ends' crosses) */
export function diagonalZ(b: Builder, x: number, za: number, ya: number, zb: number, yb: number, step = 3) {
  const n = Math.ceil((Math.abs(zb - za) + 1) / step), dir = zb > za ? 1 : -1;
  for (let s = 0; s < n; s++) {
    const d = Math.min(step, Math.abs(zb - za) + 1 - s * step);
    const z = dir > 0 ? za + s * step : za - s * step - d + 1;
    const y0 = ya + Math.round((s * (yb - ya)) / n), y1 = ya + Math.round(((s + 1) * (yb - ya)) / n);
    if (y1 > y0) put(b, x, z, y0, 1, d, y1 - y0, WHITE, 'brick');
  }
}

function buildMezzanine(b: Builder) {
  b.newGroup();
  for (const [x, z] of MEZZ_POSTS) b.add(x, z, 0, 2, 2, MEZZ_Y - SLAB, WHITE);
  b.box(MEZZ.x0, MEZZ.z0, MEZZ.x1, MEZZ.z1, MEZZ_Y - SLAB, MEZZ_Y, { kind: 'plate', unit: SLAB, sizes: BIG, color: CONCRETE });
  // its open edge: a white parapet [assumed]
  lay(b, alongX(MEZZ.x0, MEZZ.x1, MEZZ.z0), MEZZ_Y, 3, WHITE, 'brick', 16);
  lay(b, alongZ(MEZZ.z0 + 1, MEZZ.z1, MEZZ.x1 - 1), MEZZ_Y, 3, WHITE, 'brick', 16);
}

/** a storey's height on the fronts: from its floor to the slab over it */
export const STOREYS: [number, number][] = [[0, TRUSS_Y[0] - SLAB], ...TRUSS_Y.slice(0, 5).map((y, t) => [y, TRUSS_Y[t + 1] - SLAB] as [number, number])];
/** the Forum's doors onto the piazza: two openings in the glass [assumed: where] */
export const DOORS: [number, number][] = [[frameX(7) + 15, frameX(7) + 28], [frameX(3) + 15, frameX(3) + 28]];
export const DOOR_H = 22;

/** one front's infill along a line of cells: panes of 13 between mullions every 14 studs, in two bands with a transom */
function front(b: Builder, cells: [number, number][], color: number, kind: Kind, isMullion: (u: number) => boolean, want = (_x: number, _z: number, _y: number) => true) {
  for (const [y0, y1] of STOREYS) {
    const ym = y0 + Math.floor((y1 - y0) / 2);
    b.newGroup();
    cells.forEach(([x, z], u) => {
      if (!isMullion(u)) return;
      // a mullion, up to whatever is over it (a gerberette's inner arm)
      let h = 0;
      while (y0 + h < y1 && b.free(x, z, y0 + h, y0 + h + 1)) h++;
      if (h) b.add(x, z, y0, 1, 1, h, WHITE, 'bar');
    });
    const panes = (y: number) => (x: number, z: number) => want(x, z, y);
    lay(b, cells, y0, ym - y0, color, kind, 13, panes(y0));
    lay(b, cells, ym, 1, WHITE, 'tile', 13);
    lay(b, cells, ym + 1, y1 - ym - 1, color, kind, 13, panes(ym + 1));
  }
}

/** the west front's glass and the east front's panels, and glass at both ends (envelope) */
export function buildFronts(b: Builder) {
  const mullion = (x: number) => (x - 1) % 14 === 0;
  const notDoor = (x: number, _z: number, y: number) => y >= DOOR_H || !DOORS.some(([a, c]) => x >= a && x < c);
  front(b, alongX(1, LENGTH - 1, GLASS_Z), GLASS, 'glass', (u) => mullion(u + 1), notDoor);
  front(b, alongX(1, LENGTH - 1, PANEL_Z), PANEL, 'brick', (u) => mullion(u + 1));
  // the ends: glass between the column lines [assumed]
  for (const x of [2, LENGTH - 3]) front(b, alongZ(FLOOR_Z0 + 1, PANEL_Z, x), GLASS, 'glass', (u) => (u + 1) % 14 === 0);
}

/** the services up the east front, storey by storey, and the air ducts' branches into each floor (envelope) */
export function buildServices(b: Builder) {
  for (const kind of ['air', 'water', 'power', 'lift'] as Service[]) {
    b.newGroup();
    for (const r of RUNS.filter((q) => q.kind === kind)) {
      const ys = [...BANDS.slice(0, -1), ROOF_Y - SLAB, r.top];
      for (let k = 0; k + 1 < ys.length; k++) b.add(r.x, r.z, ys[k], r.w, r.d, ys[k + 1] - ys[k], SERVICE[kind]);
      // [assumed] the big air ducts branch into each floor through the east front
      if (kind === 'air' && r.w >= 6)
        for (const y of TRUSS_Y.slice(0, 5)) b.add(r.x + 1, PANEL_Z + 1, y + 40, 4, r.z - PANEL_Z - 1, 6, SERVICE.air);
    }
  }
}

/** the Chenille: flight by flight, then the galleries along the front (envelope) [scaled from photographs] */
export function buildChenille(b: Builder) {
  const [za, zb] = TUBE_Z;
  for (const f of FLIGHTS) {
    b.newGroup();
    for (let x = f.xHigh; x <= f.xLow; x += 2) {
      const w = Math.min(2, f.xLow + 1 - x), y = flightY(f, x);
      if (y > 0) b.add(x, za + 1, Math.max(0, y - 3), w, zb - za - 2, y - Math.max(0, y - 3), ESCALATOR);
      const y0 = Math.max(0, y - 3);
      b.add(x, za, y0, w, 1, y + TUBE_H - y0, TUBE, 'glass');
      b.add(x, zb - 1, y0, w, 1, y + TUBE_H - y0, TUBE, 'glass');
      // the roof: its two edges white (the tube's frame), glass between [scaled]
      b.add(x, za, y + TUBE_H, w, 1, 1, WHITE, 'tile');
      b.add(x, za + 1, y + TUBE_H, w, zb - za - 2, 1, TUBE, 'glass');
      b.add(x, zb - 1, y + TUBE_H, w, 1, 1, WHITE, 'tile');
    }
  }
  for (const n of GALLERY_LEVELS) {
    b.newGroup();
    const y = levelY(n), x0 = 1, x1 = LENGTH - 1;
    // its deck on the gerberettes' outer arms, its glass sides and its glass roof [scaled]
    b.box(x0, za, x1, zb, y - SLAB, y, { kind: 'plate', unit: SLAB, sizes: DECK, color: FLOOR });
    lay(b, alongX(x0, x1, za), y, TUBE_H, TUBE, 'glass', 16);
    lay(b, alongX(x0, x1, zb - 1), y, TUBE_H, TUBE, 'glass', 16);
    lay(b, alongX(x0, x1, za), y + TUBE_H, 1, WHITE, 'tile', 16);
    lay(b, alongX(x0, x1, zb - 1), y + TUBE_H, 1, WHITE, 'tile', 16);
    b.box(x0, za + 1, x1, zb - 1, y + TUBE_H, y + TUBE_H + 1, { kind: 'glass', unit: 1, sizes: DECK, color: TUBE });
  }
}
const DECK = [[16, 14], [8, 14], [4, 14], [2, 14], [16, 12], [8, 12], [4, 12], [2, 12], [1, 12], [16, 7], [8, 7], [4, 7], [2, 7], [16, 1], [8, 1], [4, 1], [2, 1], [1, 1]];

export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  buildFronts(b);
  buildServices(b);
  buildChenille(b);
}

/** the plant rooms on the roof, over the east half [assumed: their size and places] */
export const PLANT: [number, number, number, number][] = [[frameX(1) + 4, 128, frameX(4) - 4, 170], [frameX(5) + 4, 128, frameX(8) - 4, 170], [frameX(9) + 4, 128, frameX(12) - 4, 170]];
export const PLANT_H = 16;
/** level 7's terrace: the roof's north end, paved [assumed] */
export const TERRACE: [number, number, number, number] = [frameX(10) + 2, 40, frameX(13) - 2, 120];

/** the roof slab, the plant rooms, the air ducts' tops and the roof terrace (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.newGroup();
  b.box(0, FLOOR_Z0, LENGTH, FLOOR_Z1, ROOF_Y - SLAB, ROOF_Y, { kind: 'plate', unit: SLAB, sizes: BIG, color: CONCRETE });
  // a low parapet round the roof [assumed]
  lay(b, alongX(0, LENGTH, FLOOR_Z0), ROOF_Y, 3, WHITE, 'brick', 16);
  lay(b, alongX(0, LENGTH, FLOOR_Z1 - 1), ROOF_Y, 3, WHITE, 'brick', 16);
  lay(b, alongZ(FLOOR_Z0 + 1, FLOOR_Z1 - 1, 0), ROOF_Y, 3, WHITE, 'brick', 16);
  lay(b, alongZ(FLOOR_Z0 + 1, FLOOR_Z1 - 1, LENGTH - 1), ROOF_Y, 3, WHITE, 'brick', 16);
  // the plant rooms: white boxes, walls and a lid [assumed]
  b.newGroup();
  for (const [x0, z0, x1, z1] of PLANT) {
    const edge = (x: number, z: number) => x === x0 || z === z0 || x === x1 - 1 || z === z1 - 1;
    b.box(x0, z0, x1, z1, ROOF_Y, ROOF_Y + PLANT_H - 1, { kind: 'brick', unit: PLANT_H - 1, sizes: [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]], color: 0xe4e4df, mask: edge });
    b.box(x0, z0, x1, z1, ROOF_Y + PLANT_H - 1, ROOF_Y + PLANT_H, { kind: 'plate', sizes: BIG, color: 0xd9d9d4 });
  }
  // the big air ducts turn over the roof into the plant rooms [documented: the ducts rise to the roof; their path assumed]
  b.newGroup();
  for (const r of RUNS.filter((q) => q.kind === 'air' && q.w >= 6)) {
    const p = PLANT.find((q) => r.x >= q[0] && r.x + r.w <= q[2]);
    const z1 = p ? p[3] : FLOOR_Z1;
    b.add(r.x, z1, r.top - 6, r.w, r.z - z1, 6, SERVICE.air);
  }
  // [assumed] level 7's terrace: pale paving at the roof's north end
  b.newGroup();
  b.box(TERRACE[0], TERRACE[1], TERRACE[2], TERRACE[3], ROOF_Y, ROOF_Y + 1, { kind: 'tile', sizes: BIG, color: 0xc8c1b4 });
}

export { WIDTH, TRUSS_Z };

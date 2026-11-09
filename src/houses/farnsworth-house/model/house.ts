/**
 * The Farnsworth House itself (spec 022), from HABS IL-1105: concrete footings, the lower terrace on its short columns,
 * the eight white steel columns with the floor slab hung between them, the floating travertine steps, the glass walls with
 * their thin white mullions, and the roof slab. Layout and sourcing: layout.ts.
 */
import { C } from '@/engine/catalog';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { COLUMN_X, COLUMN_Z, HOUSE, Rect, ROOM, STEPS_LOWER, STEPS_UPPER, TERRACE, TERRACE_COLUMNS, Y } from './layout';
import { groundPlates } from './site';

/** the steel is painted white [documented]; the floors and terraces are travertine [documented: sheets 5, 6] */
export const WHITE = 0xf3f3ef;
export const TRAVERTINE = [0xe8dfcb, 0xe2d7bf, 0xece4d2];
const GLASS = 0xdff1f5;
const CONCRETE = 0xb9b4a8;
export const travertine = (x: number, _y: number, z: number) => TRAVERTINE[Math.floor(hash2(Math.floor(x / 2), Math.floor(z / 2)) * 3)];

/** a slab over r: white steel fascia round the edge, concrete inside, travertine on top */
function slab(b: Builder, r: Rect, y0: number, top: number, finish: 'travertine' | 'roof') {
  const [x0, z0, x1, z1] = r;
  const edge = (x: number, z: number) => x === x0 || x === x1 - 1 || z === z0 || z === z1 - 1;
  for (let y = y0; y < top - 1; y += 3)
    b.box(x0, z0, x1, z1, y, Math.min(y + 3, top - 1), {
      kind: Math.min(y + 3, top - 1) - y === 3 ? 'brick' : 'plate', color: (x, _y, z) => (edge(x, z) ? WHITE : finish === 'roof' && y === y0 ? WHITE : CONCRETE),
    });
  b.box(x0, z0, x1, z1, top - 1, top, {
    kind: 'tile', color: (x, yy, z) => (edge(x, z) ? WHITE : finish === 'travertine' ? travertine(x, yy, z) : C.lightGray),
  });
}

/** the footings under every column, at the ground [documented: concrete footings; size assumed] */
export function buildFootings(b: Builder) {
  b.setPhase(P.FOUNDATION);
  const cols = [...COLUMN_X.flatMap((x) => COLUMN_Z.map((z) => [x, z] as [number, number])), ...TERRACE_COLUMNS];
  for (const [x, z] of cols) {
    const g = groundPlates(x, z);
    b.box(x - 1, z - 1, x + 2, z + 2, g - 3, g, { kind: 'brick', color: CONCRETE });
  }
}

/** the lower terrace: a travertine platform on short white columns, its steps down to the meadow (floor) */
export function buildTerrace(b: Builder) {
  b.setPhase(P.FLOOR);
  for (const [x, z] of TERRACE_COLUMNS) b.box(x, z, x + 1, z + 1, groundPlates(x, z), Y.TERRACE - 3, { kind: 'brick', color: WHITE });
  slab(b, TERRACE, Y.TERRACE - 3, Y.TERRACE, 'travertine');
  // the steps to the meadow: travertine slabs that seem to float [documented: sheet 7, stair section]
  b.newGroup();
  for (let i = 0; i < 5; i++) {
    const z = STEPS_LOWER[1] + i, top = Y.TERRACE - (i + 1);
    b.box(STEPS_LOWER[0], z, STEPS_LOWER[2], z + 1, top - 1, top, { kind: 'tile', color: travertine });
  }
}

/** the frame: the eight columns from the footings to the cornice, the floor slab hung between them, the porch steps */
export function buildFrame(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the columns, white steel H-sections on the outside of the slabs [documented]
  for (const x of COLUMN_X) for (const z of COLUMN_Z) b.box(x, z, x + 1, z + 1, groundPlates(x, z), Y.CORNICE, { kind: 'brick', color: WHITE });
  // the floor slab, welded to their inner faces [documented: sheet 8]
  slab(b, HOUSE, Y.FLOOR_UNDER, Y.FLOOR, 'travertine');
  // the steps from the porch down to the terrace [documented: sheet 3; five risers assumed]
  b.newGroup();
  for (let i = 0; i < 5; i++) {
    const z = STEPS_UPPER[1] + i, top = Y.FLOOR - 1 - i;
    b.box(STEPS_UPPER[0], z, STEPS_UPPER[2], z + 1, i === 0 ? top - 1 : Y.TERRACE, top, { kind: i === 0 ? 'tile' : 'brick', color: travertine, unit: 3 });
  }
}

/** a glass wall along a 1-stud line, floor to ceiling, white mullions every `bay` studs [documented: sheet 8] */
function glassWall(b: Builder, r: Rect, bay: number) {
  b.newGroup();
  const alongX = r[2] - r[0] > 1, n = alongX ? r[2] - r[0] : r[3] - r[1];
  for (let i = 0; i < n; i++) {
    const c: Rect = alongX ? [r[0] + i, r[1], r[0] + i + 1, r[3]] : [r[0], r[1] + i, r[2], r[1] + i + 1];
    if (i === 0 || i === n - 1 || i % bay === 0) b.box(c[0], c[1], c[2], c[3], Y.FLOOR, Y.CEILING, { kind: 'brick', color: WHITE });
    else b.box(c[0], c[1], c[2], c[3], Y.FLOOR, Y.CEILING, { kind: 'glass', color: GLASS });
  }
}

/** the glass: the room's four walls, the entrance doors in the west wall (envelope) */
export function buildGlass(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const [x0, z0, x1, z1] = ROOM;
  glassWall(b, [x0, z0, x1, z0 + 1], 11); // north
  glassWall(b, [x0, z1 - 1, x1, z1], 11); // south
  glassWall(b, [x1 - 1, z0 + 1, x1, z1 - 1], 9); // east
  glassWall(b, [x0, z0 + 1, x0 + 1, z1 - 1], 9); // west, onto the porch, with the double doors [documented]
}

/** the roof slab, its white fascia, a pale ceiling under it (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  slab(b, HOUSE, Y.CEILING, Y.CORNICE, 'roof');
}

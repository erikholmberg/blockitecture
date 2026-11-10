/**
 * The Koshino House itself (spec 039): two boxes of bare concrete and the fan-shaped studio, their footings and floors, the
 * courtyard's steps over the underground corridor, the walls with their slots of light, the glass, and the roofs with skylight
 * strips along their edges. Layout and sourcing: layout.ts.
 *
 * The concrete is laid out in Ando's formwork panels, 1.8 × 0.9 m (about 6 × 3 ft), each a slightly different grey
 * [documented: the panel; the shades assumed]. The panels' six bolt holes aren't drawn: studs only sit on top faces.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BED, BEDROOMS, BED_CORRIDOR, COURT, DINING, inRect, inStudio, LAWN_WALL, LIVING, LOW_END, onEdge, Rect, STEPS_X0,
  STEPS_X1, STUDIO, TUNNEL, inTunnel, Y,
} from './layout';
import { groundPlates } from './site';

/** bare concrete in Ando's panels [documented: the material; shades assumed] */
export const CONCRETE = [0xbdbab3, 0xc3c0b9, 0xb7b4ad, 0xc8c5be];
export const GLASS = 0xdcebee;
export const FRAME = 0x4a4c4e;
export const SLAB = 0xb0ada6;
const panel = (x: number, y: number, z: number) => CONCRETE[Math.floor(hash2(Math.floor((x + z) / 6), Math.floor(y / 7.5)) * CONCRETE.length)];

/** the studio's arc wall: studio cells next to a cell outside it (not the living wing it leans on) */
export const onArc = (x: number, z: number) =>
  inStudio(x, z) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => !inStudio(x + dx, z + dz) && !inRect(x + dx, z + dz, LIVING));

/** the retaining wall closing the courtyard's uphill side beyond the living wing [documented: aerial photograph] */
export const RETAIN: Rect = [0, 28, 31, 29];
export const LIVING_WINDOW = { z: LIVING[1], x0: 36, x1: 52, y0: 0, y1: 45 };
export const LIVING_DOOR = { z: LIVING[1], x0: 52, x1: 55, y0: 0, y1: 18 };
/** the slots: tall slits along the bedroom corridor [documented: aerial photograph]; high slits over the studio's roof */
const bedSlit = (x: number) => x % 12 === 6;
const highSlit = (x: number) => x >= 57 && x < 66 && x % 2 === 1;
const stepTop = (x: number) => (x < STEPS_X0 ? 0 : 3 * (Math.floor((x - STEPS_X0) / 2) + 1));

/** openings in the outer walls */
function opening(x: number, y: number, z: number): 'glass' | 'door' | null {
  const w = LIVING_WINDOW, dr = LIVING_DOOR;
  if (z === w.z && x >= w.x0 && x < w.x1 && y >= w.y0 && y < w.y1) return 'glass';
  if (z === dr.z && x >= dr.x0 && x < dr.x1 && y < dr.y1) return 'door';
  // the bedroom wing: a slit per room along the corridor, and each room's window to the slope below [assumed: sizes]
  if (z === BED[3] - 1 && bedSlit(x) && y >= 3 && y < 24) return 'glass';
  // (toward the west end the slope outside rises past the sill, so the windows sit higher there)
  if (z === BED[1] && x % 12 >= 4 && x % 12 < 10 && y >= (x < 48 ? 6 : 15) && y < 24) return 'glass';
  // the high slits on the living wing's uphill wall, above the studio's roof
  if (z === LIVING[3] - 1 && highSlit(x) && y >= Y.STUDIO_ROOF + 3 && y < Y.LIV_ROOF - 3) return 'glass';
  // the bedroom wing's door at its east end, and the corridor's ends at the tunnel [assumed]
  if (x === BED[0] && z >= 13 && z < 16 && y < 18) return 'door';
  return null;
}

/** footings under every wall (foundation) */
export function buildFoundations(b: Builder) {
  b.setPhase(P.FOUNDATION);
  const wallAt = (x: number, z: number) =>
    onEdge(x, z, BED) || onEdge(x, z, LIVING) || onEdge(x, z, TUNNEL) || inRect(x, z, RETAIN) || onArc(x, z);
  b.box(-1, -1, 90, 80, -6, -3, { kind: 'brick', color: SLAB, mask: wallAt });
}

/** the floors: concrete slabs in both wings, the studio and the corridor, and the courtyard's paving and steps (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  const inside = (x: number, z: number) => inRect(x, z, BED) || inRect(x, z, LIVING) || inRect(x, z, TUNNEL) || inStudio(x, z);
  b.box(-1, -1, 90, 80, -3, -1, { kind: 'plate', color: SLAB, mask: (x, z) => inside(x, z) || inRect(x, z, COURT) });
  // floors: pale timber in the living wing and studio, tatami in the bedrooms [assumed], the courtyard in concrete
  b.box(-1, -1, 90, 80, -1, 0, {
    kind: 'tile',
    color: (x, _y, z) => (inRect(x, z, COURT) && !inRect(x, z, TUNNEL) ? panel(x, 0, z) : BEDROOMS.some((r) => inRect(x, z, r)) ? 0xc9b98a : 0xb79a72),
    mask: (x, z) => inside(x, z) || inRect(x, z, COURT),
  });
  // the steps: ten wide concrete steps from the courtyard floor up to the lawn, over the corridor [documented: aerial photograph]
  b.newGroup();
  const [, z0, , z1] = COURT;
  for (let x = STEPS_X0; x < STEPS_X1; x += 2) {
    const t = stepTop(x);
    b.box(x, z0, x + 2, z1, 0, t, {
      kind: 'brick', color: panel,
      // the corridor under them keeps its headroom
      mask: (xx, zz, y) => !(inRect(xx, zz, TUNNEL) && y < 21),
    });
  }
}

function concreteWalls(b: Builder, r: Rect, y0: number, y1: number, keep: (x: number, z: number, y: number) => boolean) {
  b.newGroup();
  b.box(r[0], r[1], r[2], r[3], y0, y1, { kind: 'brick', color: panel, mask: (x, z, y) => onEdge(x, z, r) && keep(x, z, y) });
}
const open3 = (x: number, y: number, z: number) => [0, 1, 2].some((k) => opening(x, y + k, z));

/** the concrete walls (structure): both wings, their rooms, the studio's arc, the corridor, the courtyard's and lawn's walls */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the bedroom wing: outer walls and the six rooms off the corridor, each with its door [documented: six rooms; doors assumed]
  concreteWalls(b, BED, 0, Y.BED_ROOF, (x, z, y) => !open3(x, y, z) && !(inTunnel(x, z + 1) && z === BED[3] - 1 && y < 18));
  b.newGroup();
  b.box(BED[0], BED[1], BED[2], BED[3], 0, Y.BED_ROOF, {
    kind: 'brick', color: panel,
    mask: (x, z, y) => {
      if (x <= 0 || x >= 77 || z <= 0 || z >= 17) return false;
      const partition = x % 12 === 1 && z < BED_CORRIDOR[1] && x > 1 && x < 73;
      const corridorWall = z === BED_CORRIDOR[1] - 1 && !(x % 12 >= 8 && x % 12 < 11 && y < 18);
      return partition || corridorWall;
    },
  });
  // the living wing: full height all round; the wall between the dining room and the low end with its roof terrace
  concreteWalls(b, LIVING, 0, Y.LIV_ROOF, (x, z, y) => {
    if (open3(x, y, z)) return false;
    if (inTunnel(x, z - 1) && z === LIVING[1] && y < 18) return false; // the corridor comes in under the terrace
    if (z === LIVING[3] - 1 && x >= 74 && x < 77 && y < 18) return false; // into the studio [assumed: place]
    return true;
  });
  b.newGroup();
  b.box(LOW_END[0] - 1, LIVING[1] + 1, LOW_END[0], LIVING[3] - 1, 0, Y.LIV_ROOF, {
    kind: 'brick', color: panel, mask: (_x, z, y) => !(z >= 36 && z < 39 && y < 18),
  });
  // the upper floor over the kitchen and dining room, its main bedroom [documented: section]
  b.newGroup();
  b.box(DINING[0], DINING[1], DINING[2], DINING[3], Y.UPPER, Y.UPPER + 2, { kind: 'plate', color: SLAB });
  // the studio: its arc wall, sunk into the slope [documented]; its straight side wall up the slope
  b.newGroup();
  b.box(STUDIO.cx - STUDIO.r - 1, LIVING[3], STUDIO.cx + STUDIO.r + 1, STUDIO.cz + STUDIO.r + 1, 0, Y.STUDIO_ROOF, { kind: 'brick', color: panel, mask: (x, z) => onArc(x, z) });
  // the corridor between the wings, under the courtyard's steps [documented: "joined underground"]
  concreteWalls(b, TUNNEL, 0, 18, (x, z) => x === TUNNEL[0] || x === TUNNEL[2] - 1);
  b.newGroup();
  b.box(TUNNEL[0], TUNNEL[1], TUNNEL[2], TUNNEL[3], 18, 21, { kind: 'plate', color: SLAB });
  // the courtyard's uphill wall beyond the living wing, and the lawn's long L-shaped wall [documented: aerial photograph]
  concreteWalls(b, RETAIN, 0, 15, () => true);
  for (const r of LAWN_WALL) {
    b.newGroup();
    let lo = Infinity;
    for (let z = r[1]; z < r[3]; z++) for (let x = r[0]; x < r[2]; x++) lo = Math.min(lo, groundPlates(x, z));
    b.box(r[0], r[1], r[2], r[3], lo, Y.LAWN + 3, { kind: 'brick', color: panel });
  }
}

/** the glass (envelope): the living room's tall window and door, the slits, the bedrooms' windows */
export function buildWindows(b: Builder) {
  b.setPhase(P.ENVELOPE);
  // the living room's window: steel mullions and transoms first [assumed: photographs], then the glass between them
  b.newGroup();
  const w = LIVING_WINDOW;
  b.box(w.x0, w.z, w.x1, w.z + 1, w.y0, w.y1, { kind: 'plate', color: FRAME, mask: (x, _z, y) => (x - w.x0) % 4 === 0 || y % 15 === 14 });
  b.newGroup();
  for (const r of [BED, LIVING])
    b.box(r[0], r[1], r[2], r[3], 0, Y.LIV_ROOF, {
      kind: 'glass', color: GLASS, unit: 3,
      mask: (x, z, y) => onEdge(x, z, r) && opening(x, y, z) === 'glass',
    });
}

/** the roofs (roof): slabs with skylight strips along an edge [documented: aerial photograph], the low end's terrace, the
 * studio's fan with a slit of skylight along its arc [documented], and the bedroom wing's roof rail */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.newGroup();
  b.box(BED[0], BED[1], BED[2], BED[3], Y.BED_ROOF, Y.BED_ROOF + Y.SLAB, {
    kind: 'plate', color: (x, y, z) => panel(x, y, z),
    mask: (x, z) => !(z === BED[3] - 2 && x > 1 && x < 76),
  });
  b.box(2, BED[3] - 2, 76, BED[3] - 1, Y.BED_ROOF, Y.BED_ROOF + Y.SLAB, { kind: 'glass', color: GLASS, unit: 2 });
  b.newGroup();
  b.box(LIVING[0], LIVING[1], LOW_END[0], LIVING[3], Y.LIV_ROOF, Y.LIV_ROOF + Y.SLAB, {
    kind: 'plate', color: panel, mask: (x, z) => !(z === LIVING[1] + 1 && x > LIVING[0] + 1 && x < LOW_END[0] - 2),
  });
  b.box(LIVING[0] + 2, LIVING[1] + 1, LOW_END[0] - 2, LIVING[1] + 2, Y.LIV_ROOF, Y.LIV_ROOF + Y.SLAB, { kind: 'glass', color: GLASS, unit: 2 });
  // the low end: its roof terrace, open to the sky inside the wing's full-height walls; the walls' tops capped
  b.newGroup();
  b.box(LOW_END[0], LIVING[1] + 1, LIVING[2] - 1, LIVING[3] - 1, Y.TERRACE, Y.TERRACE + Y.SLAB, { kind: 'plate', color: panel });
  b.box(LOW_END[0] - 1, LIVING[1], LIVING[2], LIVING[3], Y.LIV_ROOF, Y.LIV_ROOF + 1, {
    kind: 'tile', color: panel, mask: (x, z) => x === LOW_END[0] - 1 || x === LIVING[2] - 1 || z === LIVING[1] || z === LIVING[3] - 1,
  });
  // the studio's roof: the fan, a ring of glass just inside its arc
  b.newGroup();
  const nearArc = (x: number, z: number) => !onArc(x, z) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => onArc(x + dx, z + dz));
  b.box(STUDIO.cx - STUDIO.r - 1, LIVING[3], STUDIO.cx + STUDIO.r + 1, STUDIO.cz + STUDIO.r + 1, Y.STUDIO_ROOF, Y.STUDIO_ROOF + Y.SLAB, {
    kind: 'plate', color: panel, mask: (x, z) => inStudio(x, z) && !nearArc(x, z),
  });
  b.box(STUDIO.cx - STUDIO.r - 1, LIVING[3], STUDIO.cx + STUDIO.r + 1, STUDIO.cz + STUDIO.r + 1, Y.STUDIO_ROOF, Y.STUDIO_ROOF + Y.SLAB, {
    kind: 'glass', color: GLASS, unit: 2, mask: (x, z) => nearArc(x, z),
  });
  // the bedroom wing's roof: a steel rail round the part you can walk on from the lawn [documented: aerial photograph]
  b.newGroup();
  const [rx0, rz0, rx1, rz1] = [20, 2, 76, 13];
  const top = Y.BED_ROOF + Y.SLAB;
  for (let x = rx0; x < rx1; x++) for (const z of [rz0, rz1]) if ((x - rx0) % 6 === 0 || x === rx1 - 1) b.add(x, z, top, 1, 1, 6, FRAME, 'bar');
  for (let z = rz0 + 6; z < rz1; z += 6) b.add(rx0, z, top, 1, 1, 6, FRAME, 'bar');
  for (const z of [rz0, rz1]) b.box(rx0, z, rx1, z + 1, top + 6, top + 7, { kind: 'tile', color: FRAME });
  b.box(rx0, rz0, rx0 + 1, rz1 + 1, top + 6, top + 7, { kind: 'tile', color: FRAME });
}


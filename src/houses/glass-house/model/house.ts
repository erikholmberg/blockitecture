/**
 * The Glass House and the Brick House themselves (spec 073): the two brick platforms; the herringbone brick floors; the black
 * steel piers and fascia, the brick cylinder rising through the roof, the Brick House's walls; the glass, the four doors and the
 * rail; the flat roofs. Layout and sourcing: layout.ts.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BATH_DOOR, BRICK, BRICK_DOOR, cylinderWall, CYL, DOOR_LONG, DOOR_SHORT, FIREPLACE, HOUSE, inCylinder, inRect, onRing, PIERS_LONG,
  PIERS_SHORT, Rect, ROUND_WINDOWS, Y,
} from './layout';

/** the steel, painted one charcoal black [documented: "black-painted steel piers"] */
export const BLACK = 0x26272a;
/** the brick: "deep reds and browns with lighter-colored flecks" [documented], the same in both houses and the cylinder */
export const BRICKS = [0x8a3b2a, 0x7a3426, 0x94452f, 0x6e3324, 0xa8604a];
export const GLASS = 0xd8ecef;
/** the doors' glass, in their black frames (a shade darker, so they read) [assumed] */
export const DOOR_GLASS = 0xc4dade;
const CEILING_WHITE = 0xe8e6df;
const ROOFING = 0x5b5d5e;

/** a brick colour: mostly the deep red, flecked [documented]; by runs of about 4 studs along each course, so pieces stay whole */
export const brick = (x: number, y: number, z: number) => {
  const c = Math.floor(y / 3), s = c & 1 ? 2 : 0;
  const h = hash2(Math.floor((x + s) / 4) * 7 + c * 13, Math.floor((z + s) / 4) * 11 - c * 5);
  return h < 0.42 ? BRICKS[0] : h < 0.7 ? BRICKS[1] : h < 0.86 ? BRICKS[2] : h < 0.96 ? BRICKS[3] : BRICKS[4];
};

/**
 * the herringbone floor [documented]: 2 × 1 brick tiles, laid as (x − z) mod 4 = 0 → along x, = 3 → along z; clipped at the
 * edges of r
 */
export function herringbone(b: Builder, r: Rect, y: number) {
  const m = (v: number) => ((v % 4) + 4) % 4;
  for (let z = r[1] - 1; z < r[3]; z++)
    for (let x = r[0] - 1; x < r[2]; x++) {
      const k = m(x - z);
      if (k !== 0 && k !== 3) continue;
      const cells: [number, number][] = k === 0 ? [[x, z], [x + 1, z]] : [[x, z], [x, z + 1]];
      const inside = cells.filter(([cx, cz]) => inRect(cx, cz, r));
      if (!inside.length) continue;
      const c = brick(x, y, z);
      if (inside.length === 2) b.add(x, z, y, k === 0 ? 2 : 1, k === 0 ? 1 : 2, 1, c, 'tile');
      else b.add(inside[0][0], inside[0][1], y, 1, 1, 1, c, 'tile');
    }
}

/** which steel pier, door or pane a perimeter cell of the glass box is */
export function frontCell(x: number, z: number): 'pier' | 'door' | 'glass' | null {
  if (!onRing(x, z, HOUSE)) return null;
  const long = x === HOUSE[0] || x === HOUSE[2] - 1;
  const u = long ? z - HOUSE[1] : x - HOUSE[0];
  // the corners belong to both fronts: piers
  if ((x === HOUSE[0] || x === HOUSE[2] - 1) && (z === HOUSE[1] || z === HOUSE[3] - 1)) return 'pier';
  const piers = long ? PIERS_LONG : PIERS_SHORT, door = long ? DOOR_LONG : DOOR_SHORT;
  if (piers.includes(u)) return 'pier';
  if (u >= door[0] && u < door[1]) return 'door';
  return 'glass';
}

/** the two platforms: brick, the Glass House's 10 in above the lawn [documented] (foundation) */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.LAWN - 3, -1, { kind: 'brick', color: BRICKS[0] });
  b.newGroup();
  b.box(BRICK[0], BRICK[1], BRICK[2], BRICK[3], Y.LAWN - 3, -1, { kind: 'brick', color: BRICKS[0] });
}

/** the floors: brick in herringbone in the Glass House [documented]; the Brick House's the same [assumed] (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  herringbone(b, HOUSE, -1);
  b.newGroup();
  herringbone(b, BRICK, -1);
}

/** a cell of the Brick House's walls that's left open: the door on the west front, the round windows on the east */
export function brickOpening(x: number, y: number, z: number): 'door' | 'window' | null {
  if (x === BRICK[0] && z >= BRICK_DOOR[0] && z < BRICK_DOOR[1] && y < Y.BRICK_DOOR) return 'door';
  if (x === BRICK[2] - 1)
    for (const w of ROUND_WINDOWS) if (Math.hypot(z + 0.5 - w.z, (y + 0.5 - w.y) * 0.4) < w.r) return 'window';
  return null;
}
/** Flemish bond: headers and stretchers alternate along each course [documented]; read as a darker header every other brick */
const flemish = (x: number, y: number, z: number) => {
  const u = x === BRICK[0] || x === BRICK[2] - 1 ? z : x;
  return ((u + (Math.floor(y / 3) & 1) * 2) % 4 === 0 ? BRICKS[3] : brick(x, y, z));
};

/** the black steel, the cylinder, the Brick House's walls (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the piers: one at each corner and at every joint of the glass, floor to roof [documented]
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], 0, Y.CEILING, { kind: 'brick', unit: 6, color: BLACK, mask: (x, z) => frontCell(x, z) === 'pier' });
  // the fascia: a plain black steel band round the roof's edge, flush with the piers [documented]
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.CEILING, Y.ROOF, { kind: 'brick', color: BLACK, mask: (x, z) => onRing(x, z, HOUSE) });
  // the brick cylinder: the bathroom inside, the fireplace on its outer face, through the roof [documented]; capped above the
  // bathroom's ceiling [assumed]
  b.newGroup();
  const [cx0, cz0, cx1, cz1] = [Math.floor(CYL.x - CYL.r), Math.floor(CYL.z - CYL.r), Math.ceil(CYL.x + CYL.r), Math.ceil(CYL.z + CYL.r)];
  const open = (x: number, z: number, y: number) =>
    (inRect(x, z, FIREPLACE) && y < 6) || (inRect(x, z, BATH_DOOR) && y < 17);
  b.box(cx0, cz0, cx1, cz1, 0, Y.CEILING, { kind: 'brick', color: brick, mask: (x, z, y) => cylinderWall(x, z) && !open(x, z, y) });
  b.box(cx0, cz0, cx1, cz1, Y.CEILING, Y.CYLINDER, { kind: 'brick', color: brick, mask: (x, z) => inCylinder(x, z) });
  // the Brick House's walls, load-bearing brick in Flemish bond [documented], the door and the round windows left open
  b.newGroup();
  b.box(BRICK[0], BRICK[1], BRICK[2], BRICK[3], 0, Y.BRICK_CEILING + 1, { kind: 'brick', color: flemish, mask: (x, z, y) => onRing(x, z, BRICK) && brickOpening(x, y, z) === null });
}

/** the glass, the doors and the rail; the Brick House's black door and round windows (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  // the rail: a black steel angle round all four sides, about 2½–3 ft up [scaled]
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.RAIL, Y.RAIL + 1, { kind: 'plate', color: BLACK, mask: (x, z) => frontCell(x, z) === 'glass' });
  // the plate glass, floor to ceiling [documented]
  b.newGroup();
  for (const [y0, y1] of [[0, Y.RAIL], [Y.RAIL + 1, Y.CEILING]])
    b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], y0, y1, { kind: 'glass', unit: y1 - y0, color: GLASS, mask: (x, z) => frontCell(x, z) === 'glass' });
  // the four doors: full-height glass, centred in each wall [documented], a black frame across their head [assumed]
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], 0, Y.CEILING - 1, { kind: 'glass', color: DOOR_GLASS, mask: (x, z) => frontCell(x, z) === 'door' });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.CEILING - 1, Y.CEILING, { kind: 'plate', color: BLACK, mask: (x, z) => frontCell(x, z) === 'door' });
  // the Brick House's single black door [documented]
  b.newGroup();
  b.box(BRICK[0], BRICK[1], BRICK[0] + 1, BRICK[3], 0, Y.BRICK_DOOR, { kind: 'brick', color: BLACK, mask: (x, z, y) => brickOpening(x, y, z) === 'door' });
  // its three round windows [documented]
  b.newGroup();
  b.box(BRICK[2] - 1, BRICK[1], BRICK[2], BRICK[3], 0, Y.BRICK_CEILING, { kind: 'glass', unit: 1, color: GLASS, mask: (x, z, y) => brickOpening(x, y, z) === 'window' });
}

/** the flat roofs: the Glass House's ends flush at the corner piers [documented]; the Brick House's under a black sheet-metal
 * frieze [documented] (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.CEILING, Y.ROOF - 1, { kind: 'brick', color: CEILING_WHITE, mask: (x, z) => !inCylinder(x, z) });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.ROOF - 1, Y.ROOF, { kind: 'plate', color: ROOFING, mask: (x, z) => !inCylinder(x, z) });
  b.newGroup();
  b.box(BRICK[0], BRICK[1], BRICK[2], BRICK[3], Y.BRICK_CEILING, Y.BRICK_ROOF - 1, { kind: 'brick', color: CEILING_WHITE, mask: (x, z) => !onRing(x, z, BRICK) });
  b.box(BRICK[0], BRICK[1], BRICK[2], BRICK[3], Y.BRICK_ROOF - 1, Y.BRICK_ROOF, { kind: 'plate', color: ROOFING, mask: (x, z) => !onRing(x, z, BRICK) });
  b.box(BRICK[0], BRICK[1], BRICK[2], BRICK[3], Y.BRICK_CEILING + 1, Y.BRICK_ROOF, { kind: 'plate', color: 0x2e3032, mask: (x, z) => onRing(x, z, BRICK) });
}

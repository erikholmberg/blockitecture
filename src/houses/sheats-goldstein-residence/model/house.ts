/**
 * The Sheats-Goldstein Residence itself (spec 040), on OSM's outline (layout.ts): the concrete skirt and footings down the
 * falling ridge, the pool's basin, the floors, the bedroom wing's walls with its glass to the south, the living room's north wall
 * with glass above it and nothing at all on its side to the pool, level −1 under the terrace with its glass corner, and the
 * roof: the coffered, rising triangle over the living room with six glass skylights in every coffer, and the wing's flat roof.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  COLUMNS, CORNERS, inEast, inHouse, inLiving, inLower, inPool, inRoof, inWest, isRib, isSkylight, LOWER_SPLIT, LOWER_Z0,
  onOutline, POOL, roofUnder, Y,
} from './layout';
import { HeightMap } from './site';

/** board-formed concrete, warm grey [documented: photographs; shades assumed] */
export const CONCRETE = [0xb3ada3, 0xbab4aa, 0xaca69c];
export const GLASS = 0xdcebee;
export const TERRAZZO = 0xd8d2c6;
export const DECK = 0xbdb8ae;
export const WOOD = 0x8a5a3a;
export const POOL_TILE = 0x3c7f9a;
const concrete = (x: number, y: number, z: number) => CONCRETE[Math.floor(hash2(Math.floor((x + z) / 4), Math.floor(y / 6)) * CONCRETE.length)];
const BB: [number, number, number, number] = [-102, -73, 96, 79]; // the outline's bounds

const near = (x: number, z: number, p: [number, number], q: [number, number]) => {
  const [ax, az] = p, [bx, bz] = q, L2 = (bx - ax) ** 2 + (bz - az) ** 2;
  const t = Math.max(0, Math.min(1, ((x + 0.5 - ax) * (bx - ax) + (z + 0.5 - az) * (bz - az)) / L2));
  return Math.hypot(x + 0.5 - ax - (bx - ax) * t, z + 0.5 - az - (bz - az) * t) < 1.2;
};
const { A, C, D, G } = CORNERS;
/** the bedroom wing's south side, A–G: glass between concrete piers [documented: photographs] */
const onWingSouth = (x: number, z: number) => inWest(x, z) && onOutline(x, z) && near(x, z, A, G);
/** the join between the wing and the living room, along C–G */
const onJoin = (x: number, z: number) => inWest(x, z) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => inEast(x + dx, z + dz));
/** the entrance: glass along part of C–D [assumed] */
const onEntry = (x: number, z: number) => inLiving(x, z) && onOutline(x, z) && near(x, z, C, D) && x >= -2 && x < 14;
/** the living room's outer wall: its outline north of the pool line */
const onLivingWall = (x: number, z: number) => inLiving(x, z) && onOutline(x, z) && !onEntry(x, z);
const pier = (x: number) => ((x % 8) + 8) % 8 === 0;
const PARTITIONS = [-78, -56, -34];

/** the concrete skirt round the outline, down to the falling ground; the pool's basin (foundation) */
export function buildFoundations(b: Builder, hm: HeightMap) {
  b.setPhase(P.FOUNDATION);
  let lo = 0;
  for (let z = BB[1]; z < BB[3]; z++) for (let x = BB[0]; x < BB[2]; x++) if (onOutline(x, z)) lo = Math.min(lo, hm.at(x, z));
  b.box(BB[0], BB[1], BB[2], BB[3], lo, -3, {
    kind: 'brick', color: concrete,
    mask: (x, z, y) => onOutline(x, z) && y >= hm.at(x, z) && y < (inLower(x, z) ? Y.LOWER - 3 : -3),
  });
  b.newGroup();
  const [px0, pz0, px1, pz1] = POOL;
  b.box(px0, pz0, px1, pz1, -12, 0, {
    kind: 'brick', color: POOL_TILE,
    mask: (x, z, y) => inPool(x, z) && (y < -9 || !inPool(x - 1, z) || !inPool(x + 1, z) || !inPool(x, z - 1) || !inPool(x, z + 1)),
  });
}

/** the main floor's slab: terrazzo in the living room, timber in the wing, concrete on the terrace; level −1's slab (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  const main = (x: number, z: number) => inHouse(x, z) && !inLower(x, z) && !inPool(x, z);
  b.box(BB[0], BB[1], BB[2], BB[3], -3, -1, { kind: 'plate', color: 0xa9a49a, mask: main });
  b.box(BB[0], BB[1], BB[2], BB[3], -1, 0, {
    kind: 'tile', mask: main,
    color: (x, _y, z) => (inWest(x, z) ? WOOD : inLiving(x, z) ? TERRAZZO : DECK),
  });
  b.newGroup();
  b.box(BB[0], BB[1], BB[2], BB[3], Y.LOWER - 3, Y.LOWER, { kind: 'plate', color: (x, y, z) => (y === Y.LOWER - 1 ? TERRAZZO : 0xa9a49a), mask: (x, z) => inLower(x, z) });
}

function wallBox(b: Builder, y0: number, y1: number, mask: (x: number, z: number, y: number) => boolean) {
  b.newGroup();
  b.box(BB[0], BB[1], BB[2], BB[3], y0, y1, { kind: 'brick', color: concrete, mask });
}

/** the concrete walls (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the bedroom wing: concrete to the north, piers between the glass to the south, the join with a wide opening [documented:
  // plan, level 0]; its rooms' partitions, each with a door at the north end [assumed]
  wallBox(b, 0, Y.WING_ROOF, (x, z, y) => {
    if (!inWest(x, z)) return false;
    if (onWingSouth(x, z)) return pier(x);
    if (onOutline(x, z)) return true;
    if (onJoin(x, z)) return !(z >= -6 && z < 2 && y < 18);
    if (PARTITIONS.includes(x)) return !((!inWest(x, z - 2) || !inWest(x, z - 3) || !inWest(x, z - 4)) && y < 18);
    return false;
  });
  // the living room's outer wall, up to the clerestory; full height at the kitchen's east corner [documented: photographs]
  wallBox(b, 0, 60, (x, z, y) => onLivingWall(x, z) && y < (x >= 84 ? roofUnder(z) : Y.CLERESTORY));
  // the roof's two columns on the open side [assumed]
  b.newGroup();
  for (const [x, z] of COLUMNS) b.column(x, z, 0, roofUnder(z), 0x9c968c, 'round');
  // level −1: its back wall against the hill, the wall between the den and the bedroom, then the terrace over them
  wallBox(b, Y.LOWER, -3, (x, z, y) =>
    inLower(x, z) && !onOutline(x, z) && (z === LOWER_Z0 || (z === LOWER_SPLIT && !(x >= 40 && x < 44 && y < Y.LOWER + 18))));
  b.newGroup();
  b.box(BB[0], BB[1], BB[2], BB[3], -3, -1, { kind: 'plate', color: 0xa9a49a, mask: (x, z) => inLower(x, z) });
  b.box(BB[0], BB[1], BB[2], BB[3], -1, 0, { kind: 'tile', color: DECK, mask: (x, z) => inLower(x, z) });
}

/** the glass (envelope): the wing's south wall, the living room's clerestory and entrance, level −1's frameless glass */
export function buildWindows(b: Builder) {
  b.setPhase(P.ENVELOPE);
  b.newGroup();
  b.box(BB[0], BB[1], BB[2], BB[3], 0, Y.WING_ROOF, { kind: 'glass', color: GLASS, unit: 3, mask: (x, z) => onWingSouth(x, z) && !pier(x) });
  b.newGroup();
  b.box(BB[0], BB[1], BB[2], BB[3], 0, 60, {
    kind: 'glass', color: GLASS, unit: 3,
    mask: (x, z, y) => (onLivingWall(x, z) && x < 84 && y >= Y.CLERESTORY && y < roofUnder(z)) || (onEntry(x, z) && y < roofUnder(z)),
  });
  // level −1: glass all round its outside, no frames [documented: the main bedroom's glass corner]
  b.newGroup();
  b.box(BB[0], BB[1], BB[2], BB[3], Y.LOWER, -3, { kind: 'glass', color: GLASS, unit: 3, mask: (x, z) => inLower(x, z) && onOutline(x, z) });
}

/** the roofs (roof): the wing's flat roof, and the coffered triangle rising over the living room toward the view */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.newGroup();
  b.box(BB[0], BB[1], BB[2], BB[3], Y.WING_ROOF, Y.WING_ROOF + Y.SLAB, { kind: 'plate', color: concrete, mask: (x, z) => inWest(x, z) });
  // the ribs of the coffers hang below the slab; the slab between them is pierced by six skylights per coffer
  b.newGroup();
  b.box(BB[0], BB[1], BB[2], BB[3], 18, 60, {
    kind: 'plate', color: concrete, unit: 1,
    mask: (x, z, y) => {
      if (!inRoof(x, z)) return false;
      const u = roofUnder(z);
      if (y >= u && y < u + Y.SLAB) return !isSkylight(x, z) || onOutline(x, z);
      return isRib(x, z) && y >= u - 3 && y < u;
    },
  });
  b.newGroup();
  b.box(BB[0], BB[1], BB[2], BB[3], 18, 60, {
    kind: 'glass', color: 0xf2f6f4, unit: 1,
    mask: (x, z, y) => inRoof(x, z) && !onOutline(x, z) && isSkylight(x, z) && y >= roofUnder(z) && y < roofUnder(z) + Y.SLAB,
  });
}


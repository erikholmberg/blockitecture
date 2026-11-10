/**
 * The Rose Seidler House itself (spec 043): the sandstone base with the garage, the entry and the posts that hold the house
 * over the slope; the floors and the open deck; the frame, the partitions and the ramp; the white walls, the glass and Seidler's
 * mural; the flat roof with its skylight. Layout and sourcing: layout.ts.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BATH, BED2, BED3, DECK, DINING, FLAT, HALL, HOUSE, inRect, KITCHEN, LANDING, LAUNDRY, LIVING, LOWER, MAIN_BED, MURAL,
  onEdge, PLAYROOM, RAMP, rampTop, Rect, STAIR, Y,
} from './layout';
import { groundPlates } from './site';

/** white render outside and in [documented]; rough bush sandstone [documented]; the frames and glass [assumed: photographs] */
export const WHITE = 0xf1efe8;
export const SANDSTONE = [0xc9a66c, 0xb9955e, 0xd2b27c, 0xbf9b63];
export const FRAME = 0x2e3032;
export const GLASS = 0xdcebee;
export const SLAB = 0xb4b0a6;
/** the accents [documented: the Historic Houses Trust's restored scheme] */
export const RED = 0xc4352b;
export const YELLOW = 0xf0bf2e;
export const BLUE = 0x2d5ea6;
export const BLACK = 0x1e1f21;
const stone = (x: number, y: number, z: number) => SANDSTONE[Math.floor(hash2(Math.floor((x + 2 * z) / 2), Math.floor(y / 3)) * SANDSTONE.length)];

/** the main floor's posts: the frame's corners, and where the wings meet the deck [assumed: places] */
export const POSTS: [number, number][] = [[0, 0], [48, 0], [0, 40], [48, 40], [19, 40], [33, 40], [19, 19], [33, 19], [19, 0], [33, 0]];
const isPost = (x: number, z: number) => POSTS.some(([px, pz]) => px === x && pz === z);

/** the posts under the main floor's downhill corners, in the recreation area and under the landing [documented: "raised on
 * the north and east"; places assumed] */
export const LOWER_POSTS: [number, number][] = [[0, 40], [7, 40], [14, 40], [21, 40], [0, 18], [0, 29], [27, 41], [34, 41], [27, 48], [34, 48]];

/** the stone walls below: the garage's three [documented], the entry foyer and a store, and the long retaining wall under the
 * sleeping wing's edge [assumed: places] */
export const STONE_WALLS: Rect[] = [
  [0, 0, 19, 1], // the garage's back wall
  [19, 0, 20, 20], // the garage's side wall, the foyer's
  [0, 17, 19, 18], // the garage's wall to the recreation area
  [20, 0, 32, 1], // the foyer's and the store's front
  [27, 1, 28, 12], // the foyer's back
  [20, 11, 27, 12], // the foyer's side
  [32, 0, 33, 41], // the retaining wall under the sleeping wing's edge
  [20, 19, 32, 20], // the store's wall to the flat
];
/** doors below: the front door (red) and the garage's door to the foyer and the foyer's to the store [assumed: places] */
const lowerDoor = (x: number, z: number) =>
  (z === 0 && x >= 23 && x < 26) || (x === 19 && z >= 5 && z < 8) || (x === 27 && z >= 4 && z < 7);
export const inStoneWall = (x: number, z: number) => STONE_WALLS.some((r) => inRect(x, z, r));
/** the sleeping wing's stone base, down the slope to the ground [documented: bush stone] */
const SLEEP_BASE: Rect = [33, 0, 49, 41];

/** the partitions of the main floor [documented: plan; doors assumed], and their door openings */
export const PARTITIONS: Rect[] = [
  [12, 1, 13, 10], // kitchen | laundry
  [1, 10, 19, 11], // kitchen and laundry | dining (the servery hatch in it)
  [19, 1, 20, 19], // laundry and dining | playroom
  [33, 1, 34, 19], // playroom | main bedroom and hall
  [34, 13, 48, 14], // main bedroom | hall and ensuite
  [41, 14, 42, 20], // hall | ensuite
  [34, 20, 48, 21], // hall and ensuite | second bedroom
  [34, 30, 48, 31], // second | third bedroom
];
const PART_DOORS: Rect[] = [[12, 4, 13, 7], [14, 10, 17, 11], [19, 13, 20, 16], [33, 15, 34, 18], [36, 13, 39, 14], [44, 13, 47, 14], [35, 20, 38, 21], [35, 30, 38, 31]];
/** the kitchen's servery hatch to the dining room [documented] */
const HATCH: Rect = [4, 10, 9, 11];
export const inPartition = (x: number, z: number) => PARTITIONS.some((r) => inRect(x, z, r));

/** the walls round the deck: glass from the living room and the playroom; the sleeping wing's wall with the mural on it */
export const DECK_WALLS: Rect[] = [[19, 20, 20, 40], [20, 19, 33, 20], [33, 20, 34, 40]];
const onWall = (x: number, z: number) =>
  ((onEdge(x, z, HOUSE) && !inRect(x, z, DECK)) || DECK_WALLS.some((r) => inRect(x, z, r))) && !isPost(x, z);

/**
 * What each wall cell of the main floor is: full-height glass in the living room, the dining room, the playroom and the two
 * north bedrooms; windows from waist height in the kitchen, the laundry and the main bedroom; the ensuite's from shoulder
 * height [documented: the listing]; the red kitchen door [documented]; the doors onto the deck [assumed: places].
 */
export function opening(x: number, y: number, z: number): 'glass' | 'door' | 'red' | null {
  const full = y < Y.ROOF - 1;
  const sill = y >= Y.SILL && y < Y.ROOF - 2;
  const between = (v: number, a: number, b: number) => v >= a && v < b;
  if (x === 0) return inRect(x, z, LIVING) || inRect(x, z, DINING) ? (full ? 'glass' : null) : sill ? 'glass' : null;
  if (z === HOUSE[3] - 1) return x < 20 || x >= 33 ? (full ? 'glass' : null) : null;
  if (x === HOUSE[2] - 1) {
    if (inRect(x, z, BED2) || inRect(x, z, BED3)) return full ? 'glass' : null;
    if (inRect(x, z, BATH)) return y >= Y.HIGH_SILL && y < Y.ROOF - 2 && z >= 15 && z < 18 ? 'glass' : null;
    return sill && z >= 3 && z < 10 ? 'glass' : null;
  }
  if (z === 0) {
    if (between(x, 9, 11) && y < 18) return 'red';
    if (inRect(x, z, PLAYROOM)) return full && x > 20 && x < 32 ? 'glass' : null;
    if (inRect(x, z, MAIN_BED)) return sill && x >= 36 && x < 46 ? 'glass' : null;
    return sill && (between(x, 2, 8) || between(x, 13, 18)) ? 'glass' : null;
  }
  // round the deck: the living room's wall all glass with a door, the playroom's glass with a door, the sleeping wing's blank
  if (x === 19) return between(z, 30, 33) && y < 18 ? 'door' : full ? 'glass' : null;
  if (z === 19) return between(x, 25, 28) && y < 18 ? 'door' : full ? 'glass' : null;
  return null;
}

/** the sandstone base below (foundation): the garage, the foyer and the store; the retaining wall; the sleeping wing's base;
 * the steel posts holding the downhill corners and the landing up */
export function buildFoundations(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  b.box(0, 0, 33, 41, Y.LOWER, Y.SLAB, {
    kind: 'brick', color: stone,
    mask: (x, z, y) => inStoneWall(x, z) && !(lowerDoor(x, z) && y < Y.LOWER_FLOOR + 18),
  });
  // the sleeping wing's base: stone walls round it from the slope up to the floor
  b.newGroup();
  for (let z = SLEEP_BASE[1]; z < SLEEP_BASE[3]; z++)
    for (let x = SLEEP_BASE[0]; x < SLEEP_BASE[2]; x++) {
      if (!onEdge(x, z, SLEEP_BASE) || x === SLEEP_BASE[0]) continue;
      const g = groundPlates(x, z);
      if (g < Y.SLAB) b.box(x, z, x + 1, z + 1, g, Y.SLAB, { kind: 'brick', color: stone });
    }
  b.newGroup();
  for (const [x, z] of LOWER_POSTS) b.column(x, z, groundPlates(x, z), Y.SLAB, 0x55585b, 'bar');
}

/** the floors (floor): the lower level's, the main floor's slab over the whole square and the landing, with its finishes */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  const lowerPost = (x: number, z: number) => LOWER_POSTS.some(([px, pz]) => px === x && pz === z);
  b.box(LOWER[0], LOWER[1], LOWER[2], LOWER[3], Y.LOWER, Y.LOWER_FLOOR, {
    kind: 'tile', color: (x, _y, z) => (inRect(x, z, FLAT) ? 0xa88a62 : 0xa9a69e),
    mask: (x, z) => !inStoneWall(x, z) && !lowerPost(x, z),
  });
  b.newGroup();
  const main = (x: number, z: number) => (inRect(x, z, HOUSE) || inRect(x, z, LANDING)) && !inRect(x, z, STAIR);
  b.box(-1, -1, 50, 50, Y.SLAB, Y.SLAB + 1, { kind: 'plate', color: SLAB, mask: main });
  // finishes [assumed]: pale timber in the living rooms, tiles in the kitchen, laundry and ensuite, the deck and landing in
  // concrete pavers, cork in the playroom and bedrooms
  b.box(-1, -1, 50, 50, Y.SLAB + 1, Y.FLOOR, {
    kind: 'tile', mask: main,
    color: (x, _y, z) =>
      inRect(x, z, DECK) || inRect(x, z, LANDING) ? 0xc9c2b2
        : inRect(x, z, KITCHEN) || inRect(x, z, LAUNDRY) || inRect(x, z, BATH) ? 0xe6e3dc
          : inRect(x, z, LIVING) || inRect(x, z, DINING) ? 0xb7915f
            : 0xa27a52,
  });
}

/** the frame (structure): white posts, the partitions, and the ramp down to the garden on its own posts */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  b.newGroup();
  for (const [x, z] of POSTS) b.box(x, z, x + 1, z + 1, Y.FLOOR, Y.ROOF, { kind: 'brick', color: WHITE });
  b.newGroup();
  b.box(0, 0, 49, 41, Y.FLOOR, Y.ROOF, {
    kind: 'brick', color: WHITE,
    mask: (x, z, y) => inPartition(x, z) && !(PART_DOORS.some((r) => inRect(x, z, r)) && y < 18) && !(inRect(x, z, HATCH) && y >= 9 && y < 15),
  });
  // the ramp: a white slab stepping down a plate at a time from the landing to the garden, on thin posts [documented: the
  // ramp; its build assumed]
  b.newGroup();
  for (let x = RAMP.x0; x < RAMP.x1; x++) {
    const t = rampTop(x);
    b.box(x, RAMP.z0, x + 1, RAMP.z1, t - 2, t, { kind: 'plate', color: WHITE, mask: (xx, zz, y) => y >= groundPlates(xx, zz) });
  }
  b.newGroup();
  for (let x = RAMP.x0 + 6; x < RAMP.x1; x += 8)
    for (const z of [RAMP.z0, RAMP.z1 - 1]) {
      const g = groundPlates(x, z), t = rampTop(x) - 2;
      if (t > g) b.column(x, z, g, t, 0x55585b, 'bar');
    }
}

/** the walls, the glass and the mural (envelope) */
export function buildWalls(b: Builder) {
  b.setPhase(P.ENVELOPE);
  b.newGroup();
  b.box(0, 0, 49, 41, Y.FLOOR, Y.ROOF, {
    kind: 'brick', color: (x, y, z) => (opening(x, y, z) === 'red' ? RED : WHITE),
    mask: (x, z, y) => onWall(x, z) && (opening(x, y, z) === null || opening(x, y, z) === 'red'),
  });
  // the frames: a mullion every 4 ft and a head along the glass [assumed: photographs]
  b.newGroup();
  const along = (x: number, z: number) => (x === 0 || x === HOUSE[2] - 1 || x === 19 || x === 33 ? z : x);
  b.box(0, 0, 49, 41, Y.FLOOR, Y.ROOF, {
    kind: 'plate', color: FRAME,
    mask: (x, z, y) => onWall(x, z) && opening(x, y, z) === 'glass' && (along(x, z) % 4 === 0 || y === Y.ROOF - 2),
  });
  b.newGroup();
  b.box(0, 0, 49, 41, Y.FLOOR, Y.ROOF, {
    kind: 'glass', color: GLASS, unit: 3,
    mask: (x, z, y) => onWall(x, z) && opening(x, y, z) === 'glass' && !(along(x, z) % 4 === 0 || y === Y.ROOF - 2),
  });
  // the mural on the deck's west wall: Seidler's free shapes in the house's colours [documented: the mural and its colours as
  // a code to the house's; the shapes assumed from photographs]
  b.newGroup();
  b.box(MURAL.x, MURAL.z0, MURAL.x + 1, MURAL.z1, MURAL.y0, MURAL.y1, { kind: 'tile', color: (_x, y, z) => muralColor(y, z) });
  // the caretaker's flat below: white walls with windows to the garden [documented: the flat; its windows assumed]
  b.newGroup();
  b.box(FLAT[0], FLAT[1], FLAT[2], FLAT[3], Y.LOWER_FLOOR, Y.SLAB, {
    kind: 'brick', color: WHITE,
    mask: (x, z, y) => (x === FLAT[0] || z === FLAT[3] - 1) && !inStoneWall(x, z) && !(z === FLAT[3] - 1 && x > 23 && x < 31 && y >= -14 && y < -5) && !(x === FLAT[0] && z >= 24 && z < 27 && y < -2) && !LOWER_POSTS.some(([px, pz]) => px === x && pz === z),
  });
  b.box(FLAT[0], FLAT[3] - 1, FLAT[2], FLAT[3], Y.LOWER_FLOOR, Y.SLAB, {
    kind: 'glass', color: GLASS, unit: 3, mask: (x, _z, y) => x > 23 && x < 31 && y >= -14 && y < -5,
  });
}

/** the mural's free shapes: a red sweep, a yellow disc, a blue band and black strokes on white [assumed: from photographs] */
export function muralColor(y: number, z: number): number {
  const dz = z - 30, dy = y - 11;
  if (Math.hypot(dz + 4, dy - 4) < 3.2) return YELLOW;
  if (y >= 3 && y < 7 && z >= 23 && z < 36) return BLUE;
  if (Math.abs(dy - 0.6 * dz) < 1.6 && z >= 27 && z < 39) return RED;
  if ((z === 25 || z === 36) && y >= 9 && y < 19) return BLACK;
  if (y >= 16 && y < 18 && z >= 30 && z < 37) return BLACK;
  return WHITE;
}

/** the flat roof (roof): over the square but the deck, a skylight over the playroom [documented], a thin white fascia */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  const SKY: Rect = [24, 6, 30, 12];
  b.newGroup();
  b.box(0, 0, 49, 41, Y.ROOF, Y.ROOF_TOP, { kind: 'plate', color: 0xd9d6ce, mask: (x, z) => !inRect(x, z, DECK) && !inRect(x, z, SKY) });
  b.box(SKY[0], SKY[1], SKY[2], SKY[3], Y.ROOF, Y.ROOF_TOP, { kind: 'glass', color: GLASS, unit: 2 });
  b.newGroup();
  b.box(0, 0, 49, 41, Y.ROOF_TOP, Y.ROOF_TOP + 1, {
    kind: 'tile', color: WHITE,
    mask: (x, z) => !inRect(x, z, DECK) && (onEdge(x, z, HOUSE) || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => inRect(x + dx, z + dz, DECK))),
  });
}

export { BED2, BED3, MAIN_BED, PLAYROOM };

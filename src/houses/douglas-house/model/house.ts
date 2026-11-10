/**
 * The Douglas House itself (spec 045): the piles and the white skirt; the four floors; the frame's partitions, the chimney and
 * the bridge; the white walls, the three-storey glass wall to the lake, the cantilevered stair down the outside to the 2nd
 * floor's semicircular landing; the 4th floor's roof with its small deck, and the two smokestacks. Layout and sourcing: layout.ts.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BRIDGE, CHIMNEY, DECK, ENTRY_DEPTH, HOUSE, inHouse, inRect, LANDING, onOutline, OUT_STAIR, PILES, Rect,
  ROAD_DEPTH, STACKS, underTopStep, Y,
} from './layout';
import { groundPlates, PAD_TOP } from './site';

/** white-painted redwood boards [documented], in shades so the planes read; white steel; weathered redwood decks [documented];
 * steel stacks [documented: silver]; the frames [documented: steel; the road side's black] */
export const WHITE = [0xf4f3ee, 0xeeede7, 0xf7f6f2];
export const WHITE_STEEL = 0xfafaf7;
export const REDWOOD = 0x8f735c;
export const STEEL = 0xb9bdc1;
export const BLACK = 0x26282a;
export const GLASS = 0xd6e6ea;
export const SLAB = 0xe2e0d9;
const boards = (x: number, y: number, z: number) => WHITE[Math.floor(hash2(x * 3 + z, Math.floor(y / 6)) * WHITE.length)];

/** the lake face, the north and south ends, the road face, and the rounded corner */
type Face = 'lake' | 'north' | 'south' | 'road' | 'corner';
export function face(x: number, z: number): Face | null {
  if (!onOutline(x, z)) return null;
  if (!inHouse(x, z + 1)) return 'lake';
  if (z === HOUSE[1] && x >= 8) return 'road';
  if (x === HOUSE[2] - 1) return 'south';
  if (x === HOUSE[0] && z >= 8) return 'north';
  return 'corner';
}
const band = (y: number, a: number, b: number) => y >= a && y < b;

/** the slabs: each floor's, at the plates under it */
export function slabAt(x: number, y: number, z: number): boolean {
  if (!inHouse(x, z)) return false;
  if (band(y, Y.F1 - Y.SLAB, Y.F1)) return true;
  if (band(y, Y.F2 - Y.SLAB, Y.F2)) return !underTopStep(x, z);
  if (band(y, Y.F3 - Y.SLAB, Y.F3)) return z < ROAD_DEPTH && !underTopStep(x, z);
  if (band(y, Y.F4 - Y.SLAB, Y.F4)) return !underTopStep(x, z) && !inRect(x, z, CHIMNEY);
  return false;
}

/**
 * The outer walls' openings. The lake face is a grid of glass three storeys high [documented], with a frame every 4 ft and at
 * the floors; the ends have windows to the rooms and the living room's tall glass; the road side is mostly blank with a few
 * black-framed windows and the bridge's door [documented: the descriptions; the windows' places assumed].
 */
export function opening(x: number, y: number, z: number): 'glass' | 'frame' | 'door' | null {
  const f = face(x, z);
  if (f === 'lake') {
    if (y >= Y.F4 - Y.SLAB) return null;
    const glassRow = y < 21 || band(y, 27, 72);
    if (!glassRow) return 'frame';
    return x % 4 === 0 ? 'frame' : 'glass';
  }
  const lakeEnd = z >= ROAD_DEPTH + 2 && z < HOUSE[3] - 2, roadEnd = z >= 3 && z < 12;
  if (f === 'north') return lakeEnd && (band(y, 6, 21) || band(y, 30, 45) || band(y, 54, 69)) ? 'glass' : null;
  if (f === 'south') {
    if (lakeEnd) return band(y, 6, 21) || band(y, 27, 72) ? 'glass' : null;
    return roadEnd && (band(y, 30, 45) || band(y, 54, 69) || band(y, 81, 93)) ? 'glass' : null;
  }
  if (f === 'road') {
    if (x >= BRIDGE.x0 && x < BRIDGE.x1 && band(y, Y.F4, Y.F4 + 18)) return 'door';
    if ((band(x, 20, 23) || band(x, 36, 39)) && band(y, 54, 66)) return 'glass';
    if (band(x, 30, 33) && band(y, 36, 45)) return 'glass';
    if (band(x, 24, 31) && band(y, 81, 93)) return 'glass';
    return null;
  }
  return null;
}
/** the 4th floor's wall onto the deck: glass, with a door [assumed: photographs] */
const DECK_WALL_Z = ENTRY_DEPTH - 1;
function deckWallOpening(x: number, y: number): 'glass' | 'door' | null {
  if (band(x, 20, 23) && y < Y.F4 + 18) return 'door';
  return band(x, 16, 42) && band(y, Y.F4, Y.F4 + 21) ? 'glass' : null;
}

/** the walls' extent: floors 1–3 all round; the 4th floor's enclosed entry only; the wall onto the deck */
export function wallCell(x: number, y: number, z: number): boolean {
  if (slabAt(x, y, z)) return false;
  if (onOutline(x, z)) return y < Y.F4 - Y.SLAB || (z < ENTRY_DEPTH && band(y, Y.F4, Y.TOP - Y.SLAB));
  return z === DECK_WALL_Z && inHouse(x, z) && !onOutline(x, z) && band(y, Y.F4, Y.TOP - Y.SLAB);
}

/** the partitions [documented: the rooms of each floor; their places assumed] and their doors */
export const PARTITIONS: { r: Rect; y0: number; doors: Rect[] }[] = [
  { r: [16, 1, 17, 15], y0: Y.F1, doors: [[16, 10, 17, 13]] }, // kitchen | laundry
  { r: [8, 15, 23, 16], y0: Y.F1, doors: [[10, 15, 13, 16]] }, // kitchen and laundry | dining room
  { r: [23, 1, 24, 30], y0: Y.F1, doors: [[23, 20, 24, 23], [23, 6, 24, 9]] }, // dining | bedroom and bath
  { r: [24, 13, 45, 14], y0: Y.F1, doors: [[27, 13, 30, 14]] }, // bath | bedroom
  { r: [23, 1, 24, 15], y0: Y.F2, doors: [[23, 8, 24, 11]] }, // hall and wet bar | main bedroom
  { r: [24, 14, 45, 15], y0: Y.F2, doors: [[27, 14, 30, 15]] }, // main bedroom | living room
  { r: [9, 12, 45, 13], y0: Y.F3, doors: [[11, 12, 14, 13], [18, 12, 21, 13], [26, 12, 29, 13], [38, 12, 41, 13]] }, // rooms | gallery
  { r: [16, 1, 17, 12], y0: Y.F3, doors: [] },
  { r: [22, 1, 23, 12], y0: Y.F3, doors: [] },
  { r: [34, 1, 35, 12], y0: Y.F3, doors: [] },
];
export const inPartition = (x: number, y: number, z: number) =>
  PARTITIONS.some((p) => inRect(x, z, p.r) && band(y, p.y0, p.y0 + 25 - Y.SLAB) && !(p.doors.some((d) => inRect(x, z, d)) && y < p.y0 + 18));

/** the piles and the skirt (foundation): 28 timber poles, hidden by white boards round the outline [documented] */
export function buildFoundations(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  for (const [x, z] of PILES) b.column(x, z, groundPlates(x, z), Y.F1 - Y.SLAB, 0x6d5a45, 'round');
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], PAD_TOP, Y.F1 - Y.SLAB, {
    kind: 'brick', color: boards, mask: (x, z, y) => onOutline(x, z) && y >= groundPlates(x, z),
  });
}

/** the four floors (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  for (const f of [Y.F1, Y.F2, Y.F3, Y.F4]) {
    b.newGroup();
    b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], f - Y.SLAB, f, {
      kind: 'plate',
      // the 4th floor's deck in weathered redwood [documented]; the floors inside pale [assumed]
      color: (x, _y, z) => (f === Y.F4 && inRect(x, z, DECK) && !onOutline(x, z) ? REDWOOD : SLAB),
      mask: (x, z, y) => slabAt(x, y, z),
    });
  }
}

/** the frame (structure): the partitions, the chimney's white brick base [documented], the bridge from the road [documented] */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.F1, Y.TOP, { kind: 'brick', color: WHITE[1], mask: (x, z, y) => inPartition(x, y, z) && !onOutline(x, z) });
  b.newGroup();
  b.box(CHIMNEY[0], CHIMNEY[1], CHIMNEY[2], CHIMNEY[3], Y.F2, Y.F4, {
    kind: 'brick', color: WHITE[0],
    // the fireplace opens toward the living room's south [assumed]
    mask: (x, z, y) => !(x === CHIMNEY[2] - 1 && z >= 25 && z < 28 && y < Y.F2 + 6),
  });
  // the bridge: a white deck on steel, 43 ft from the bluff to the 4th floor's door [documented; its build assumed]
  b.newGroup();
  b.box(BRIDGE.x0, BRIDGE.z0, BRIDGE.x1, BRIDGE.z1, Y.F4 - Y.SLAB, Y.F4, { kind: 'plate', color: WHITE_STEEL, mask: (x, z, y) => y >= groundPlates(x, z) });
  b.box(BRIDGE.x0, BRIDGE.z0, BRIDGE.x1, BRIDGE.z0 + 2, Math.min(groundPlates(BRIDGE.x0, BRIDGE.z0), Y.F4 - Y.SLAB), Y.F4 - Y.SLAB, {
    kind: 'brick', color: WHITE[2], mask: (x, z, y) => y >= groundPlates(x, z),
  });
}

/** the walls, the glass and the outside stair (envelope) */
export function buildWalls(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const op = (x: number, y: number, z: number) => (z === DECK_WALL_Z && !onOutline(x, z) ? deckWallOpening(x, y) : opening(x, y, z));
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.F1, Y.TOP, {
    kind: 'brick', color: boards, mask: (x, z, y) => wallCell(x, y, z) && op(x, y, z) === null,
  });
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.F1, Y.TOP, {
    kind: 'plate', color: (x, _y, z) => (face(x, z) === 'lake' ? WHITE_STEEL : BLACK), mask: (x, z, y) => wallCell(x, y, z) && op(x, y, z) === 'frame',
  });
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3], Y.F1, Y.TOP, {
    kind: 'glass', color: GLASS, unit: 3, mask: (x, z, y) => wallCell(x, y, z) && op(x, y, z) === 'glass',
  });
  // the cantilevered stair down the outside of the glass: redwood treads stepping down from the deck to the landing
  // [documented: the stair, its redwood beams; its line assumed]
  b.newGroup();
  for (let i = 0; i < OUT_STAIR.steps; i++) {
    const x = OUT_STAIR.x0 + i, top = Y.F4 - Y.SLAB - 2 * i;
    b.box(x, OUT_STAIR.z0, x + 1, OUT_STAIR.z1, top - 2, top, { kind: 'plate', color: REDWOOD });
  }
  // the semicircular landing at the 2nd floor, at the south-west corner [documented]
  b.newGroup();
  b.box(LANDING.cx - LANDING.r, LANDING.cz - LANDING.r, LANDING.cx + LANDING.r + 1, LANDING.cz + LANDING.r + 1, Y.F2 - Y.SLAB, Y.F2, {
    kind: 'plate', color: REDWOOD,
    mask: (x, z) => !inHouse(x, z) && x >= OUT_STAIR.x0 + OUT_STAIR.steps && Math.hypot(x + 0.5 - LANDING.cx, z + 0.5 - LANDING.cz) <= LANDING.r,
  });
}

/** the 4th floor's roof with the small open deck on it [documented], and the two smokestacks [documented; Q3] (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.newGroup();
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], ENTRY_DEPTH, Y.TOP - Y.SLAB, Y.TOP, { kind: 'plate', color: SLAB, mask: (x, z) => inHouse(x, z) });
  b.box(HOUSE[0], HOUSE[1], HOUSE[2], ENTRY_DEPTH, Y.TOP, Y.TOP + 1, { kind: 'tile', color: REDWOOD, mask: (x, z) => inHouse(x, z) && !onOutline(x, z) && x > 10 && x < 36 });
  b.newGroup();
  for (const [x, z] of STACKS) b.column(x, z, Y.F4, Y.TOP + 15, STEEL, 'round');
}

export { WHITE_STEEL as RAIL };

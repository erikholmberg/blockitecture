/**
 * Plan of the Schindler House, in studs (1 stud ≈ 1 ft). Spec 081.
 *
 * Model frame = HABS CA-1939's plans (north straight up): x = real east from the garage's west face, z = real south from its
 * north face. OSM's two ways (391380962, 391380944) fit this frame unturned (scripts/houses/schindler-house.mjs). Kings Road
 * runs north–south about 160 ft east of the garage; Kings West stands just north of the lot and Habitat 825 just south.
 *
 * The state is the house as completed on 6 June 1922 (spec 081 Q1): canvas in every sliding panel, the sleeping baskets open,
 * no 1952 bedroom, no carport.
 *
 * [documented] = HABS CA-1939 (its data pages and dimension chains), the NRHP nomination, Wikipedia, OSM;
 * [scaled] = read off the HABS sheets (±0.3 ft as scanned; ±1 ft as placed here); [assumed] = what none of them settles.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));

/** heights in plates (0.4 ft); y = 0 is the top of the floor slab */
export const Y = {
  /** the ground round the house: "about 8″ of the slab footing is exposed at the perimeter" [documented: HABS] → 2 plates */
  GROUND: -2,
  /** the double beams through the major rooms, and the head of the openings: 6′-1″ [documented: HABS] → 6.0 ft */
  BEAM: 15,
  /** the entrance halls' ceilings under the sleeping porches: 6′-4″ [documented: HABS section B] → 6.4 ft */
  ENTRY_CEILING: 16,
  /** the porches' floors: 7′-0″ [documented: HABS section B] → 7.2 ft */
  BASKET_FLOOR: 18,
  /** the roof's underside: about 8.0 ft [scaled: section B]; every tilt-up slab runs up to it */
  SLAB_TOP: 20,
  /** the main roof's top: 8.5 ft [scaled: section B] → 8.8 ft (the redwood roof boards and the green roofing, a plate each) */
  ROOF: 22,
  /** the lower roofs over the patio sides, under the clerestories [scaled: "some lower levels which permitted the use of
   * clerestory windows"; their height assumed: a plate above the beam line] */
  LOWER_ROOF: 17,
  /** the porches' ceilings at 13′-4″ [documented] → the baskets' mitred beams' top, 13.2 ft */
  BASKET_TOP: 33,
  /** the chimneys rise clear of the roof [scaled: section B; their height assumed] */
  CHIMNEY: 26,
  CHIMNEY_45: 28,
  /** the hearths' openings [assumed: about 2½ ft] */
  FIREPLACE: 6,
};

/**
 * The arms. HABS's chains [documented]: 79′-4″ east–west (19′-4″ + 18′-8″ + 8′-0″ + 33′-4″) and 77′-8″ north–south (16′-6″ +
 * 18′-0″ + 2′-6″ + 26′-0″ + 14′-8″), the south wing 34′-8″ + 10′-0″ = 44′-8″ wide. Here 79 × 78 studs, the south wing 45.
 * The north-east wing's north face is in line with the garage's, as OSM's two ways show (spec 081's scaled "3.8 ft north of the
 * garage's face" would make the plan 81½ ft deep, against the chain's 77′-8″) [documented: OSM].
 */
export const GARAGE: Rect = [0, 0, 20, 18]; // [scaled: x 0–19.3, z 0–16.5] and the wall to the guest room
export const GUEST: Rect = [0, 17, 31, 37]; // the guest room south of the garage, to z ≈ 37 [scaled], east to the long arm
export const NE_WING: Rect = [31, 0, 79, 20]; // [scaled: x ≈ 34.6–79.3; its depth 20.6 ft]; the north entrance at its west end
export const LONG_ARM: Rect = [31, 20, 48, 78]; // [scaled: x ≈ 30.7–47.8, z ≈ 16–77.7]
export const SOUTH_WING: Rect = [3, 63, 48, 78]; // [scaled: x ≈ 2.8–47.8, z ≈ 63–77.7]
export const ARMS: Rect[] = [GARAGE, GUEST, NE_WING, LONG_ARM, SOUTH_WING];
export const inHouse = (x: number, z: number) => inAny(x, z, ARMS);
/** over all [documented: 79′-4″ × 77′-8″] */
export const PLAN: Rect = [0, 0, 79, 78];

/** the west patio: enclosed by the house on three sides, open to the west [documented: HABS data pages] */
export const WEST_PATIO: Rect = [3, 37, 31, 63];
/** the east patio: the house on its north and west, tall hedges on its east and south [documented: HABS] */
export const EAST_PATIO: Rect = [48, 20, 80, 56];
/** the guest apartment's small concrete patio [documented: HABS], between the garage and the north entrance [scaled] */
export const GUEST_PATIO: Rect = [20, 1, 31, 17];

/**
 * The rooms, as their floors inside the walls. Which studio was whose isn't settled by what was read [assumed: the Chaces' two
 * in the north-east wing, round the east patio; Pauline's in the long arm and Rudolph's in the south wing, round the west patio,
 * as the two households' Ls are described]; the kitchen between the two halves [documented: "joined by a utility room"].
 */
export const ROOMS = {
  garage: [1, 1, 19, 17] as Rect,
  guest: [1, 18, 31, 36] as Rect,
  northHall: [32, 1, 44, 19] as Rect,
  chaceA: [45, 1, 61, 19] as Rect,
  chaceB: [62, 1, 78, 19] as Rect,
  kitchen: [32, 20, 47, 36] as Rect,
  pauline: [32, 37, 47, 63] as Rect,
  rudolph: [4, 64, 26, 77] as Rect,
  southHall: [27, 64, 47, 77] as Rect,
};
/** the four studios [documented: one for each of the four adults] */
export const STUDIOS: Rect[] = [ROOMS.chaceA, ROOMS.chaceB, ROOMS.pauline, ROOMS.rudolph];

/**
 * The sleeping baskets: footprints from the 1969 porches on HABS sheet 4 [scaled], each overhanging its entrance by 2 ft
 * [assumed: how far]. The north one 14′-10″ × 12′-0″ → 15 × 12; the south one an L, 20′-4″ × 16′-3″ → 20 × 16.
 */
export const NORTH_BASKET: Rect[] = [[29, 5, 44, 17]];
export const SOUTH_BASKET: Rect[] = [[27, 61, 47, 69], [37, 69, 47, 77]];
export const BASKETS = [NORTH_BASKET, SOUTH_BASKET];
export const inBasket = (x: number, z: number) => inAny(x, z, NORTH_BASKET) || inAny(x, z, SOUTH_BASKET);
export const bbox = (rs: Rect[]): Rect => [
  Math.min(...rs.map((r) => r[0])), Math.min(...rs.map((r) => r[1])), Math.max(...rs.map((r) => r[2])), Math.max(...rs.map((r) => r[3])),
];

/** the north stair, 18″ wide, inside the north door [documented]; 11 treads up to the basket [assumed: its run] */
export const NORTH_STAIR = { x: 34, z0: 16, dz: -1, w: 1 };
/** the north stair's hole in the basket's floor [assumed] */
export const STAIRWELL: Rect = [34, 6, 35, 13];
/** the south stair, 22″ wide, outside the south entrance [documented]: 11 risers [documented: 10 of 8″ and one of 2¾″], here
 * along the south wing's patio wall up to the basket's overhang [assumed: its line] */
export const SOUTH_STAIR = { x0: 16, z: 61, d: 2 };
/** the stairs' tread tops: 11 risers to the basket's floor */
export const treadTop = (i: number) => Math.round(((i + 1) * Y.BASKET_FLOOR) / 11);

/**
 * The walls, as runs of cells. `axis: 'x'` runs along x at z = at; `'z'` along z at x = at; cells from…to (exclusive).
 * Concrete runs are the solid back walls [documented: NRHP, HABS: "the street and neighbour sides"]; screens are the patio
 * walls of redwood, glass and canvas [documented]; frames are the redwood walls at the north entrance and inside [documented:
 * "the rest of the walls are wood and glass"].
 */
export interface Run { id: string; axis: 'x' | 'z'; at: number; from: number; to: number; doors?: [number, number][] }
export const cellOf = (r: Run, c: number): [number, number] => (r.axis === 'x' ? [c, r.at] : [r.at, c]);

export const SLAB_RUNS: Run[] = [
  // the garage's north wall, with its doors to the driveway [documented: the garage in the north-west corner; doors assumed]
  { id: 'garage-north', axis: 'x', at: 0, from: 1, to: 20, doors: [[5, 16]] },
  { id: 'west', axis: 'z', at: 0, from: 0, to: 37 },
  { id: 'garage-east', axis: 'z', at: 19, from: 1, to: 17 },
  // the garage's south wall and the guest room's north wall, with the guest room's door to its patio [assumed: its place]
  { id: 'guest-north', axis: 'x', at: 17, from: 1, to: 31, doors: [[25, 28]] },
  { id: 'ne-north', axis: 'x', at: 0, from: 31, to: 79 },
  { id: 'ne-east', axis: 'z', at: 78, from: 1, to: 20 },
  // the long arm's east wall, toward the street and the east patio [documented: spec 081's back walls]
  { id: 'long-east', axis: 'z', at: 47, from: 19, to: 77 },
  { id: 'south-south', axis: 'x', at: 77, from: 3, to: 48 },
  { id: 'south-west', axis: 'z', at: 3, from: 63, to: 77 },
];

/** the patio walls [documented]: the north-east wing's south, the long arm's west, the guest wing's south, the south wing's north */
export const SCREEN_RUNS: Run[] = [
  { id: 'ne-south', axis: 'x', at: 19, from: 48, to: 78 },
  { id: 'long-west', axis: 'z', at: 31, from: 36, to: 63, doors: [[57, 60]] },
  { id: 'guest-south', axis: 'x', at: 36, from: 1, to: 31, doors: [[10, 13]] },
  // the south entrance's door under the basket's overhang [documented: the south entrance; its door's place assumed]
  { id: 'south-north', axis: 'x', at: 63, from: 4, to: 32, doors: [[29, 31]] },
];

/** the redwood walls: the north entrance's front [documented: "the wood construction at the two entrances"] and partitions */
export const FRAME_RUNS: Run[] = [
  { id: 'north-entrance', axis: 'z', at: 31, from: 1, to: 17, doors: [[10, 13]] },
  { id: 'guest-east', axis: 'z', at: 31, from: 17, to: 36, doors: [[26, 29]] },
  { id: 'hall-kitchen', axis: 'x', at: 19, from: 32, to: 47, doors: [[37, 40]] },
  { id: 'hall-chace', axis: 'z', at: 44, from: 1, to: 19, doors: [[10, 13]] },
  { id: 'chace', axis: 'z', at: 61, from: 1, to: 19, doors: [[6, 9]] },
  { id: 'kitchen-pauline', axis: 'x', at: 36, from: 32, to: 47, doors: [[33, 36]] },
  { id: 'pauline-hall', axis: 'x', at: 63, from: 32, to: 47, doors: [[41, 44]] },
  { id: 'rudolph-hall', axis: 'z', at: 26, from: 64, to: 77, doors: [[65, 68]] },
  // the south entrance's bath, out of the hall's L [assumed]
  { id: 'bath-north', axis: 'x', at: 69, from: 27, to: 37, doors: [[32, 35]] },
  { id: 'bath-east', axis: 'z', at: 36, from: 70, to: 77 },
  // the north entrance's bath [assumed: "the small bathrooms by each entrance"]
  { id: 'nbath', axis: 'x', at: 4, from: 37, to: 44, doors: [[38, 41]] },
  { id: 'nbath-west', axis: 'z', at: 36, from: 1, to: 4 },
];

export const inDoor = (r: Run, c: number) => (r.doors ?? []).some(([a, b]) => c >= a && c < b);

/**
 * The chimneys: four masses of plain reinforced concrete [documented]. Three on outside walls: the north-east wing's south-east
 * corner, the guest (north-west) wing's south-west corner, the south wing's south-west corner [documented]; their sizes, 4 × 4 or
 * 4 × 5 ft [assumed]. The fourth on the wall between the two halves, square, set at 45° [documented], here a stepped diamond.
 */
export interface Chimney { id: string; rect: Rect; top: number; inside: 'n' | 's' | 'e' | 'w'; patio?: 'n' | 's' | 'e' | 'w' }
export const CHIMNEYS: Chimney[] = [
  { id: 'ne', rect: [75, 16, 79, 21], top: Y.CHIMNEY, inside: 'n', patio: 's' },
  { id: 'guest', rect: [0, 33, 4, 37], top: Y.CHIMNEY, inside: 'n', patio: 's' },
  { id: 'south', rect: [3, 73, 7, 78], top: Y.CHIMNEY, inside: 'n' },
];
/** the 45° chimney on the partition wall [documented], centred on it [scaled: between the kitchen and the studio] */
export const DIAMOND = { x: 40, z: 37, r: 3 };
export const inDiamond = (x: number, z: number) => Math.abs(x + 0.5 - DIAMOND.x) + Math.abs(z + 0.5 - DIAMOND.z) <= DIAMOND.r;
export const inChimney = (x: number, z: number) => CHIMNEYS.some((c) => inRect(x, z, c.rect)) || inDiamond(x, z);

/**
 * A slab wall cell's part: the tilt-up slabs are 3 studs wide with a 1-stud slit between each pair (spec 081 Q2: 45″ slabs and 3″
 * joints on the 4 ft module, made 3 + 1), counted from the run's start; a doorway takes the cells it covers; a chimney its own.
 * A slit never ends a run: the last slab takes it.
 */
export type SlabPart = 'slab' | 'slit' | 'door' | 'chimney';
export function slabPart(r: Run, c: number): SlabPart {
  const [x, z] = cellOf(r, c);
  if (inChimney(x, z)) return 'chimney';
  if (inDoor(r, c)) return 'door';
  const u = c - r.from;
  if (u % 4 === 3 && c !== r.to - 1) return 'slit';
  return 'slab';
}
/** the slabs of a run, as [from, to) cell ranges */
export function slabsOf(r: Run): [number, number][] {
  const out: [number, number][] = [];
  let s = -1;
  for (let c = r.from; c <= r.to; c++) {
    const p = c < r.to ? slabPart(r, c) : null;
    // a slab is at most one module (3 studs, or 4 at a run's end); a run of slab cells longer than that is split at its module
    if (p === 'slab' && s >= 0 && (c - r.from) % 4 === 0) { out.push([s, c]); s = c; continue; }
    if (p === 'slab') { if (s < 0) s = c; continue; }
    if (s >= 0) { out.push([s, c]); s = -1; }
  }
  return out;
}
/**
 * Each slit's fill: clear glass, frosted (white translucent) glass, or concrete [documented: the three fills]. Which slit holds
 * which wasn't read slab by slab (spec 081, not obtained) [assumed]: more glass on the long street wall and the north wing, the
 * garage's slits mostly concrete.
 */
export type SlitFill = 'clear' | 'frosted' | 'concrete';
export function slitFill(r: Run, c: number): SlitFill {
  const k = Math.floor((c - r.from) / 4);
  if (r.id.startsWith('garage')) return k % 3 === 1 ? 'frosted' : 'concrete';
  const m = (k + r.at) % 3;
  return m === 0 ? 'clear' : m === 1 ? 'frosted' : 'concrete';
}

/**
 * The screen walls' bays [documented: "a series of horizontal glass panels" on a 2 ft module, the sliding panels "originally
 * covered with canvas"]: redwood posts every 4 ft, and between them either a sliding canvas panel or glass in horizontal bands,
 * alternating from a canvas bay at each run's start [assumed: which bays].
 */
export type ScreenPart = 'post' | 'canvas' | 'glass' | 'door';
/** a frame's post: every 4 ft from the run's start, at its end, and beside each door (its jambs) */
export const isPost = (r: Run, c: number) =>
  (c - r.from) % 4 === 0 || c === r.to - 1 || (!inDoor(r, c) && (inDoor(r, c - 1) || inDoor(r, c + 1)));
export function screenPart(r: Run, c: number): ScreenPart {
  const u = c - r.from;
  if (isPost(r, c)) return 'post';
  if (inDoor(r, c)) return 'door';
  return Math.floor(u / 4) % 2 === 0 ? 'canvas' : 'glass';
}
/** the glazing bars across the patio walls, at about 1.3, 2.3, 3.3 and 4.4 ft [scaled: section B] */
export const GLAZING_BARS = [3, 6, 8, 11];

/** the lower roofs: along the patio walls, 3 ft out [assumed: their width], where the stairs don't climb */
export const LOWER_ROOFS: Rect[] = [[48, 20, 75, 23], [28, 37, 31, 48], [4, 37, 31, 40], [7, 60, 16, 63]];

/** a wall's top: the slabs and frames run up to the roof's underside, except under the baskets' floors */
export const wallTop = (x: number, z: number) => (inBasket(x, z) ? Y.ENTRY_CEILING : Y.SLAB_TOP);

/** the skylights in the roof [scaled: sheet 4 shows some; their places assumed] */
export const SKYLIGHTS: Rect[] = [[52, 8, 54, 11], [68, 8, 70, 11], [38, 46, 40, 49], [12, 69, 14, 72], [14, 25, 16, 28], [38, 26, 40, 29]];

/** the planting and the paving (landscape.ts and site.ts) */
/** the sunken gardens [assumed: their outline and depth follow the 3DEP points, spec 081 Q4], on the 4 ft module */
export const WEST_GARDEN: Rect = [-44, 28, -12, 72];
export const EAST_GARDEN: Rect = [80, 24, 100, 56];
/** the lawn level with the floor west of the west patio, down to the sunken garden's steps [assumed] */
export const WEST_LAWN: Rect = [-12, 28, 3, 72];
/** the hedges [documented: "tall hedges"; their lines assumed]: round the east patio and its garden, and along the lot's sides */
export const HEDGES: Rect[] = [
  [100, 18, 102, 60], // the east patio's east side, beyond its sunken garden
  [48, 56, 102, 58], // its south side
  [79, 18, 100, 20], // closing the corner beyond the north-east wing
  [-48, 80, 0, 82], // the west garden's south side
  [-48, 24, -46, 80], // the west garden's west side
];
/** the bamboo screening the house from Kings Road [documented: "behind bamboo shoots"; its line assumed] */
export const BAMBOO: Rect = [118, -14, 128, 88];
/** the driveway: "two parallel concrete strips" on the lot's north side to the garage [documented], 2 ft wide [assumed] */
export const DRIVE_STRIPS: Rect[] = [[5, -11, 144, -9], [5, -7, 144, -5]];
/** the sidewalk along the lot's south side [documented], 3 ft wide [assumed] */
export const SIDE_WALK: Rect = [-44, 84, 144, 87];
/** the stepping stones down the west patio's west edge and along the garage's west side [documented], 2 ft square [assumed] */
export const STEPPING_STONES: Rect[] = Array.from({ length: 21 }, (_, i) => [-3, 1 + i * 3, -1, 3 + i * 3] as Rect);

export const CENTER = { x: 40, y: 4, z: 39 };
export const SITE = { lat: 34.08639, lon: -118.37222, rotationDeg: 0 };

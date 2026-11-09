/**
 * Plan of the Lovell Health House, in studs (1 stud ≈ 1 ft). Spec 034.
 *
 * Model frame = the HABS CA-1936 plans (sheets 3–5, 1/8″ = 1′-0″, read at 50 px/ft off the Library of Congress scans): x = plan
 * right, z = plan down, in ft, shifted by (+15, −10) from where the sheets were read. The real world is turned −24° to fit OSM's
 * outline (way 426658941, IoU 0.862). The street, Dundee Drive, is up the slope to the east (+x); the canyon falls away west.
 *
 * [documented] = read off the HABS sheets (plans, sections, the levels on sheet 8, the 5′-1½″ unit grid); [assumed] = what the
 * sheets don't show (colours from photographs, the furniture, some heights).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

/**
 * Heights in plates (0.4 ft); y = 0 is the living room floor, elev. 781′-5″ (HABS sheet 8) [documented]:
 * the third floor 792′, the top of the parapet 804′, the pool's south walk 769′.
 */
export const Y = {
  POOL: -31, // the pool floor's walk, −12′-5″
  LIVING: 0,
  THIRD: 27, // +10′-7″
  ROOF: 54, // the roof's top, under the parapet [assumed: sections]
  PARAPET: 57, // +22′-7″
  CEILING_LIVING: 24, // under the third floor's slab [assumed: section 2]
  CEILING_THIRD: 51,
  CEILING_POOL: -3,
  WATER: -33, // the pool's water, a little under its walk
  POOL_BOTTOM: -45,
};

/** the unit grid: columns every 5′-1½″ both ways [documented: the note on sheets 3–5] */
export const UNIT = 5.125;

/** the third floor: the sleeping porches, the living rooms 2–4, the study, the entry [documented: sheet 5] */
export const THIRD: Rect = [20, 16, 76, 52];
export const THIRD_ENTRY: Rect = [61, 37, 81, 52];
/** the long sleeping porch & sunbath on the south side, hung from the roof frame [documented: sheet 5; the hangers, sheet 1] */
export const BALCONY: Rect = [35, 52, 81, 58];
/** the north sleeping porch, hung the same way [documented: sheet 5] */
export const BALCONY_N: Rect = [20, 13, 61, 16];

/** the living room floor: the porch, the dining and living rooms, the kitchen [documented: sheet 4] */
export const LIVING: Rect = [25, 16, 71, 52];
/** the living room's band of windows on the south, under the sleeping porch [documented: sheet 4] */
export const LIVING_SOUTH: Rect = [35, 52, 71, 58];
/** the guest wing, on the ground at the living floor's level, against the hill [documented: sheet 4] */
export const GUEST: Rect = [71, 16, 103, 39];
/** the library and the main stair [documented: sheet 4] */
export const LIBRARY: Rect = [71, 39, 87, 58];

/** the pool floor: the nursery porch, the laundry, and the open space over the pool [documented: sheet 3] */
export const NURSERY: Rect = [20, 16, 56, 31];
export const LAUNDRY: Rect = [56, 21, 71, 34];
/** the swimming pool, in its U-shaped concrete cradle, partly under the house [documented: sheet 3] */
export const POOL: Rect = [5, 38, 64, 52];
export const POOL_CRADLE: Rect = [1, 31, 67, 58];

/** the entrance terrace, at the third floor's level, out to the street on columns over the patio [documented: sheets 4–5] */
export const TERRACE: Rect = [81, 41, 126, 57];

/** everything with a roof over it (No roof, the fit) */
export const ROOFS: Rect[] = [THIRD, THIRD_ENTRY, GUEST, LIBRARY];

export const CENTER = { x: 62, y: 4, z: 37 };

/** Where the house is in the real world: Wikidata Q6692217's point, turned −24° to fit OSM's outline. */
export const SITE = { lat: 34.11814, lon: -118.28786, rotationDeg: -24 };

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));
/** the unit grid's lines: x0 + round(i × 5′-1½″) */
export const gridLines = (a: number, b: number) => {
  const out: number[] = [];
  for (let i = 0; a + Math.round(i * UNIT) < b; i++) out.push(a + Math.round(i * UNIT));
  out.push(b - 1);
  return [...new Set(out)];
};

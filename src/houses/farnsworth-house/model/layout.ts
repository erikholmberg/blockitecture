/**
 * Plan of the Farnsworth House, in studs (1 stud ≈ 1 ft). Spec 022.
 *
 * Model frame = HABS IL-1105 sheet 3 (Library of Congress il0323, 2009; scanned at 200 dpi, 1/4″ = 1′, so 50 px/ft):
 * x = plan right (east-ish), z = plan down (south-ish), ft from the crop origin used to measure it. The sheet's north
 * arrow points about 18° clockwise from up; the real world is turned to fit (scripts/houses/farnsworth-house.mjs).
 *
 * [documented] = read off the HABS sheets; [assumed] = my reading where they don't say.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

/** heights in plates (0.4 ft); y = 0 is the main floor */
export const Y = {
  FLOOR: 0, // main floor, EL. 2′-4″ above the lower terrace [documented: sheet 4]
  FLOOR_UNDER: -4, // the floor slab's fascia, about 1′-6″ deep [documented: sheet 8, the steel channel fascia]
  TERRACE: -6, // the lower terrace, EL. 0′-0″, 2′-4″ below the floor → 2.4 ft [documented]
  GRADE: -12, // the ground at the stair, about 2′-2″ below the terrace [documented: "approx."]
  CEILING: 24, // EL. 11′-9″ → 9′-5″ above the floor → 9.6 ft [documented]
  CORNICE: 28, // top of the cornice, EL. 13′-6″ → 11′-2″ above the floor → 11.2 ft [documented]
  CORE_TOP: 18, // the core stops short of the ceiling [assumed: sheet 6, about 7′-3″]
};

/** the house: 77′-3½″ × 28′-8″ [documented] */
export const HOUSE: Rect = [30, 8, 107, 37];
/** the glass room; west of it, the open porch under the roof ("upper terrace") [documented] */
export const ROOM: Rect = [51, 8, 107, 37];
export const PORCH: Rect = [30, 8, 51, 37];
/** the eight H-columns, outside the long faces: bays of 22′-0″, end cantilevers of 5′-7⅞″ [documented] */
export const COLUMN_X = [35, 57, 79, 101];
export const COLUMN_Z = [7, 37];

/** the lower terrace: 55′-3″ × 22′, off the porch's south side, on its own short columns [documented] */
export const TERRACE: Rect = [8, 38, 63, 60];
export const TERRACE_COLUMNS: [number, number][] = [[13, 60], [35, 60], [57, 60], [13, 37]];
/** the steps: porch → terrace and terrace → ground, both 12′ wide [documented: sheet 3, "down"] */
export const STEPS_UPPER: Rect = [40, 37, 53, 44];
export const STEPS_LOWER: Rect = [40, 60, 53, 67];

/** the core: guest bathroom, mechanical, master bathroom; the kitchen counter on its north side, the fireplace on its south [documented] */
export const CORE: Rect = [69, 13, 94, 22];
export const KITCHEN_COUNTER: Rect = [74, 12, 90, 13];
export const FIREPLACE: Rect = [79, 22, 86, 23];
/** the teak wardrobe, free-standing near the east end [documented] */
export const WARDROBE: Rect = [97, 21, 100, 34];

/** house centre: camera target and where the meadow wave starts */
export const CENTER = { x: 68, y: 4, z: 30 };

/** Where the house is in the real world: OSM's "Farnsworth House" (wikidata Q1397013). */
export const SITE = { lat: 41.63502, lon: -88.53572, rotationDeg: 10.5 };

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));

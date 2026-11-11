/**
 * Plan of the Neue Nationalgalerie, in studs (1 stud ≈ 1 ft). Spec 057.
 *
 * Model frame: x along the hall from its north-north-east edge (x = 0) toward the Landwehrkanal (+x = real about 198.3°); z from
 * the Potsdamer Straße side (z = 0) through the hall to the sculpture garden (+z = real about 288.3°, west-north-west). The real
 * world is turned about −108° to fit OSM's outline of the roof (way 25652320). Everything sits on Mies's 3.6 m grid, drawn as 12
 * studs (3.66 m): the roof is 18 bays square, the glass hall 14, set back two bays on every side, the eight columns at the roof's
 * quarter points, two to a side.
 *
 * [documented] = de/en Wikipedia, the TU Dresden lecture notes, the SPK magazine, stone-ideas, David Chipperfield Architects'
 * plans and sections (via ArchEyes, scaled), OSM's roof, hall, columns and podium; [assumed] = what those don't settle.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];

/** the grid: 3.6 m [documented], 12 studs */
export const BAY = 12;
/** the roof: 64.8 m square [documented], 18 bays */
export const ROOF: Rect = [0, 0, 18 * BAY, 18 * BAY];
/** the glass hall: 50.4 m square, set back 7.2 m (two bays) from the roof's edge on every side [documented] */
export const HALL: Rect = [2 * BAY, 2 * BAY, 16 * BAY, 16 * BAY];

/** heights in plates (0.4 ft); y = 0 is the granite terrace */
export const Y = {
  CEILING: 69, // the hall's clear height and the columns' top: 8.4 m [documented]
  ROOF: 84, // the roof's top: 1.8 m of steel girders over that [documented], about 10 m above the terrace [documented]
  UPPER_PANE: 27, // the glass: a lower pane, then the 5.40 m upper panes to the ceiling [documented: 56 upper panes]
  GARDEN: -57, // the sculpture garden, sunk to the lower floor, 6.8 m below the terrace [documented: scaled]
};

/** the eight cruciform columns, at the roof's quarter points, about 0.9 m in from its edge [documented: OSM, the plan] */
const Q = [4.5 * BAY, 13.5 * BAY];
const IN = 3;
export const COLUMNS: [number, number][] = [
  ...Q.map((x) => [x, IN] as [number, number]), ...Q.map((x) => [x, ROOF[3] - 1 - IN] as [number, number]),
  ...Q.map((z) => [IN, z] as [number, number]), ...Q.map((z) => [ROOF[2] - 1 - IN, z] as [number, number]),
];
/** a column's cross: its centre and its four arms [documented: cruciform] */
export const inColumn = (x: number, z: number) =>
  COLUMNS.some(([cx, cz]) => (x === cx && Math.abs(z - cz) <= 1) || (z === cz && Math.abs(x - cx) <= 1));

/** the two marble shafts in the hall's west half, room high [documented: 6.5 × 1.2 m, about ±12 m off the centre line] */
export const SHAFTS: Rect[] = [[61, 140, 82, 144], [134, 140, 155, 144]];
/** the two cloakrooms in its east half, with the stairs down to the lower floor [documented: timber; heights assumed] */
export const CLOAKS: Rect[] = [[60, 54, 84, 66], [132, 54, 156, 66]];
export const CLOAK_TOP = 30;
/** the entrances: doors in the middle bays of the street front [documented: facing Potsdamer Straße; their bays assumed] */
export const DOORS: [number, number][] = [[96, 102], [114, 120]];

/** the podium: about 109 × 105 m [documented: OSM; de.wikipedia 105 × 110 m], its granite terrace level with the hall's floor */
export const PODIUM: Rect = [-58, -66, 286, 228];
/** the sculpture garden west of the hall, walled and sunk to the lower floor [documented: about 21 × 95 m, scaled] */
export const GARDEN: Rect = [-44, 228, 268, 297];
/** the wide stair up from Potsdamer Straße along the terrace's street edge [documented: about 36 m] */
export const STREET_STAIR: Rect = [49, -74, 167, -66];

export const CENTER = { x: 108, y: 10, z: 108 };
export const SITE = { lat: 52.50698, lon: 13.36759, rotationDeg: -108.5 };

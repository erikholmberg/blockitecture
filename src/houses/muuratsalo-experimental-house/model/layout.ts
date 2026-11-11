/**
 * Plan of the Muuratsalo Experimental House, in studs (1 stud ≈ 1 ft). Spec 058.
 *
 * Model frame = Aalto's plan (1:50, 1952–53): x = the plan's right, toward the bedrooms and the guest wing (+x = real about
 * 120°, east-south-east); z = the plan's down, from the studio toward the courtyard's open south side (+z = real about 210°,
 * south-south-west). The real world is turned −30° to fit OSM's outline (way 1341918201). The house is an L, the studio wing
 * along the north and the bedroom wing along the east, closing two sides of a square courtyard; tall free-standing walls close
 * the other two, white outside, a patchwork of some fifty test panels of brick and tile inside.
 *
 * [documented] = Aalto's plan and section (via ArchEyes: 1427 × 1441 cm overall; the south side 265 + 435 + 727 cm; the guest
 * wing 720 × 360 cm; the levels), the Alvar Aalto Foundation, Wikidata, OSM's outline; [assumed] = what those don't settle
 * (the roofs' slopes, the panels' colours one by one, the furniture).
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];

/** the house and its courtyard: 1427 × 1441 cm [documented] */
export const MAIN: Rect = [0, 0, 47, 47];
/** the studio wing along the north: the studio (ATELJEE) and the kitchen [documented: the plan; its depth scaled, 4.5–5 m] */
export const NORTH_WING: Rect = [0, 0, 47, 16];
export const STUDIO: Rect = [0, 0, 30, 16];
/** the bedroom wing along the east, 727 cm across [documented: the south side's figures] */
export const EAST_WING: Rect = [23, 16, 47, 47];
/** the courtyard [documented] */
export const COURT: Rect = [0, 16, 23, 47];
/** the south wall: a 265 cm return, then the 435 cm opening [documented] */
export const SOUTH_OPENING: [number, number] = [9, 23];
/** the west wall's opening toward the lake, with its slats [documented: the slotted "window" in the free-standing wall] */
export const WEST_OPENING = { z0: 22, z1: 40, y0: 3, y1: 29 };
/** the fire pit in the middle of the courtyard [documented] */
export const FIRE_PIT: Rect = [9, 29, 14, 34];
/** the guest wing off the east corner, 720 × 360 cm, on posts over the bedrock and the boulders [documented] */
export const GUEST: Rect = [47, 0, 71, 12];

/** heights in plates (0.4 ft); y = 0 is the floor [documented: ±0.00] */
export const Y = {
  WINDOW_HEAD: 24, // +2.445 m [documented]
  STUDIO_HIGH: 39, // the studio's roof on the courtyard side, about 4.8 m [documented: scaled]
  LOW: 30, // the lower roof line, about 3.6 m [documented: scaled]
  COURT_WALL: 34, // the free-standing walls' top, about 4.1 m [documented: scaled]
  GUEST_ROOF: 24, // the guest wing [assumed]
  ROOF: 2, // roofing felt on boards
};
/** the studio wing's roof falls from the courtyard toward the woods [assumed: the slope's direction isn't documented] */
export const northRoof = (z: number) => Y.LOW + Math.round(((Y.STUDIO_HIGH - Y.LOW) * Math.min(z, 15)) / 15);

export const CENTER = { x: 30, y: 10, z: 24 };
export const SITE = { lat: 62.1147594, lon: 25.7449559, rotationDeg: -30 };

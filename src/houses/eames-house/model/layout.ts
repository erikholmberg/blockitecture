/**
 * Plan of the Eames House (Case Study House #8), in studs (1 stud ≈ 1 ft). Spec 010b.
 *
 * Model frame: x runs across the house (the west column row at x = 0, against the retaining wall and the hill; the
 * east, meadow-side row at x = 19); z runs along the line of the two pavilions: the studio at low z (real north-ish),
 * the courtyard, then the residence, ending in the open south patio bay (real south-ish, toward the ocean).
 * The real world is turned −14° to fit (scripts/houses/eames-house.mjs).
 *
 * Sources (spec 010 research): bays of 7′4″ on centre, 20 ft between the two column rows, 17 ft high, residence 8 bays
 * (7 enclosed + 1 open patio bay), courtyard 4 bays, studio 5 bays; mezzanine joists at 8 ft; retaining wall on the
 * west, 8 ft high, 9 in thick, ~175–200 ft long, angled past each pavilion.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

/** The 7′4″ module in feet, and the bay lines along z rounded to whole studs (bays alternate 7 / 8 ft). */
export const BAY = 22 / 3;
export const BAYS = 17;
export const Z = Array.from({ length: BAYS + 1 }, (_, i) => Math.round(i * BAY));
// → [0, 7, 15, 22, 29, 37, 44, 51, 59, 66, 73, 81, 88, 95, 103, 110, 117, 125]

/** bay index ranges (start, end) */
export const STUDIO_BAYS = [0, 5] as const; // 5 bays
export const COURT_BAYS = [5, 9] as const; // 4 bays
export const RESIDENCE_BAYS = [9, 17] as const; // 8 bays: 7 enclosed + the open south patio bay
export const PATIO_BAY = 16;

/** the two column rows (4″ H-columns at 1 stud) and the house depth */
export const X_WEST = 0;
export const X_EAST = 19;
export const DEPTH = 20;

export const STUDIO: Rect = [0, Z[0], DEPTH, Z[5]];
export const COURT: Rect = [0, Z[5], DEPTH, Z[9]];
export const RESIDENCE: Rect = [0, Z[9], DEPTH, Z[16]]; // enclosed part
export const PATIO: Rect = [0, Z[16], DEPTH, Z[17]];

/** heights in plates (0.4 ft) */
export const Y = {
  GROUND: 0,
  FLOOR: 1, // top of the concrete slab
  MEZZ: 20, // underside of the mezzanine deck, 8 ft
  MEZZ_FLOOR: 21,
  RAIL: 20, // the horizontal rail that splits the facade into two courses (8′1″)
  ROOF_UNDER: 41, // underside of the roof deck
  ROOF_TOP: 43, // 17 ft
  WALL_TOP: 20, // retaining wall, 8 ft
};

/** living room (double height) and the one-storey alcove under the mezzanine, in the residence */
export const LIVING: Rect = [0, Z[13], DEPTH, Z[16]]; // 3 bays ≈ 22 ft (sources: 23 × 20 ft)
export const MEZZANINE: Rect = [0, Z[9], DEPTH, Z[13]]; // bedrooms above kitchen / dining / alcove
export const STUDIO_LOFT: Rect = [0, Math.round((Z[0] + Z[5]) / 2), DEPTH, Z[5]]; // loft over the studio's southern half

/** openings in the decks: the spiral stair just inside the front door (sources), the studio loft's hoisting hole (sources) */
export const STAIR: Rect = [13, 81, 18, 87];
export const HOIST: Rect = [12, 19, 16, 23];

/** the retaining wall: a straight run behind the house, angled at each end */
export const WALL_X = -4;
export const WALL_Z: [number, number] = [-28, 152];
export const WALL_WINGS: { from: [number, number]; to: [number, number] }[] = [
  { from: [WALL_X, WALL_Z[0]], to: [WALL_X - 14, WALL_Z[0] - 18] },
  { from: [WALL_X, WALL_Z[1]], to: [WALL_X - 14, WALL_Z[1] + 18] },
];

/** walkway along the east facade, the meadow, the berm at its east edge, the drive to the carport */
export const WALK: Rect = [21, -14, 27, 128];
export const MEADOW: Rect = [27, -40, 118, 165];
export const BERM_X = 120;
export const CARPORT: Rect = [0, -14, 20, 0];
export const DRIVE: Rect = [6, -70, 18, -14];

/** the eucalyptus row east of the walkway (sources: planted in the 1880s by Abbot Kinney) */
export const EUCALYPTUS_X = 36;

/** house centre: camera target and where the hillside wave starts */
export const CENTER = { x: 10, y: 8, z: 62 };

/** Where the house is in the real world: centroid of OSM's "Casa" + "Oficina" (wikidata Q980011), turned −14°. */
export const SITE = { lat: 34.0298834, lon: -118.519406, rotationDeg: -14 };

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));

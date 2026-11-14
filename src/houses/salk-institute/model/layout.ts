/**
 * Plan and section of the Salk Institute's laboratory wings, in studs (1 stud ≈ 1 ft). Spec 079.
 *
 * Model frame: x along the plaza's axis, from the wings' east end (x = 0) toward the sea (+x = real about 270°); z across it, from
 * the channel's line (z = 0) toward the north wing (+z = real north). The real world is turned to fit OSM's two lab wings (ways
 * 31844744 and 31839360). y in plates (0.4 ft); y = 0 is the plaza's travertine.
 *
 * The two wings mirror each other about z = 0 [documented: mirror-image wings]: the north wing is laid out here, and the south
 * wing is its reflection (a cell z ↔ −1 − z).
 *
 * Sources (spec 079, Research): [documented] = salk.edu, Wikipedia, Docomomo and the Cultural Landscape Foundation; OSM = the
 * SanGIS footprints and the plaza's ways, which are [documented] as traced; [scaled] = read off the photographs on Wikimedia
 * Commons; [assumed] = everything else. No section or height was found beyond the 9 ft trusses and "six stories, three below
 * ground" (spec 079 Q3): every other height here is [assumed] or [scaled].
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];
export type Pt = [number, number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const inAny = (x: number, z: number, rs: Rect[]) => rs.some((r) => inRect(x, z, r));
/** the mirror image of a north-wing cell row in the south wing */
export const mirrorZ = (z: number) => -1 - z;
/** a north-wing rect and its mirror image */
export const mirrorRect = (r: Rect): Rect => [r[0], -r[3], r[2], -r[1]];
export const both = (rs: Rect[]): Rect[] => [...rs, ...rs.map(mirrorRect)];
/** fold a cell onto the north wing: the south wing is the north's mirror image */
export const fold = (z: number) => (z < 0 ? mirrorZ(z) : z);

// ---------------------------------------------------------------------------------------------------------------------------
// The section [documented: six storeys, three below the plaza; every other floor a full-height service floor; Vierendeel
// trusses 9 ft deep. Every height [assumed], spec 079 Q3: lab storeys 27 plates (10.8 ft), service storeys 25 (10.0 ft)]
// ---------------------------------------------------------------------------------------------------------------------------

export type StoreyKind = 'lab' | 'service';
/** the six storeys from the bottom, each from its floor's top to the next one's [documented: lab, service, lab, service, lab,
 * service; three below the plaza] */
export const STOREYS: { kind: StoreyKind; y0: number; y1: number }[] = [
  { kind: 'lab', y0: -79, y1: -52 },
  { kind: 'service', y0: -52, y1: -27 },
  { kind: 'lab', y0: -27, y1: 0 },
  { kind: 'service', y0: 0, y1: 25 },
  { kind: 'lab', y0: 25, y1: 52 },
  { kind: 'service', y0: 52, y1: 77 },
];
/** heights in plates */
export const Y = {
  PLAZA: 0, // the plaza's travertine [assumed: at the third storey's top, spec 079 Q3]
  LOWEST: -79, // the lowest lab floor, 31.6 ft below the plaza [assumed]
  FOOTING: -83, // the lowest slab's underside, on the cut [assumed]
  SLAB: 2, // every floor slab, 0.8 ft [assumed]
  TRUSS: 23, // the Vierendeel trusses, 9.2 ft deep [documented: 9 ft]
  CHORD: 4, // their chords, 1.6 ft, so the openings are 15 plates (6 ft) at the centre [documented: 6 ft]…
  END_CHORD: 5, // … and 13 (5.2 ft) at the ends [documented: 5 ft]
  ROOF: 77, // the roof slab's top, 30.8 ft above the plaza [assumed: "about 32 ft" with the parapet]
  PARAPET: 80, // 32 ft [assumed]
  // the study towers' four levels above the plaza: an arcade, a study floor, a porch and a study floor, each floor's slab 2 plates
  T_STUDY1: 20, // 8 ft [scaled: the west plaza photograph, four levels to the roof]
  T_PORCH: 39, // 15.6 ft [scaled]
  T_STUDY2: 58, // 23.2 ft [scaled]
  // the west end: the channel falls into the basin, which spills again to the lower landing
  BASIN1_WATER: -2, // the big basin's water, a plate under the plaza's lip [assumed]
  BASIN2_WATER: -9, // the smaller basin's, 2.8 ft lower [assumed: about 3 ft, spec 079]
  LANDING: -24, // the lower landing, 9.6 ft below the plaza [assumed: the terrain tiles read about 12 ft there, spec 079 two 3 ft drops]
  GROVE: -6, // the citrus grove, 2.4 ft below the plaza [assumed: "steps lead up … to the plaza", the east photograph]
  CHANNEL_WATER: -1, // the channel's water: one plate under the travertine [assumed]
};

// ---------------------------------------------------------------------------------------------------------------------------
// The lab block [documented: OSM; 362 × 85 ft (north) and 363 × 81 ft (south): the mirror model takes 83]
// ---------------------------------------------------------------------------------------------------------------------------

/** the north wing's lab block: from the east end to the west end, from its plaza-side face to its outer face */
export const BLOCK: Rect = [0, 87, 362, 171];
/** the east end's support towers [documented: "heating, ventilation and other support services"; OSM: x 0…50] */
export const EAST_END: Rect = [0, 87, 51, 171];
/** the west end's offices [documented: "six floors of offices" overlooking the ocean; OSM: past the last study tower] */
export const WEST_END: Rect = [321, 87, 362, 171];
/** the lab floors between them [documented: about 65 × 245 ft, column-free]: 270 × 82 ft clear inside the walls */
export const LAB: Rect = [51, 88, 321, 170];
/** the trusses span the lab across (z), one every 20 ft along it [assumed: their spacing], under every service floor */
export const TRUSS_X: number[] = Array.from({ length: 13 }, (_, k) => 65 + 20 * k);
/** the Vierendeel trusses' posts: openings 9 ft wide between them across the span [assumed] */
export const TRUSS_POSTS: number[] = [88, 98, 108, 118, 128, 139, 149, 159, 169];
/** the lab storeys' glass is broken by a 2-stud concrete pier at each truss [assumed] */
export const PIER_W = 2;

/** the five outer towers on the wing's outer face [documented: OSM, 22 × 16 ft, about 60 ft apart] */
export const OUTER_TOWERS: Rect[] = [51, 111, 171, 231, 291].map((x) => [x, 171, x + 22, 187] as Rect);
/** the light wells between them [documented: "40 feet long and 25 feet wide"; their places in the gaps (38 ft) assumed] */
export const LIGHT_WELLS: Rect[] = [[73, 171, 111, 196], [133, 171, 171, 196], [193, 171, 231, 196], [253, 171, 291, 196]];
/** a bridge across each light well at the plaza's level, to the lab block's outer door [scaled: "stairs and bridges cross
 * them", the light-well photographs; its place assumed] */
export const WELL_BRIDGE_W = 4;

// ---------------------------------------------------------------------------------------------------------------------------
// The study towers [documented: OSM; five to a wing, four 40 ft wide and one 20 ft, 60 ft apart, 21 ft clear of the block]
// ---------------------------------------------------------------------------------------------------------------------------

/** each tower's west edge [documented: OSM, 60 ft apart] */
export const TOWER_WEST = [81, 142, 202, 262, 322];
/** the towers: the east one is one study (20 ft) across, the others two (40 ft) [documented] */
export const STUDY_TOWERS: Rect[] = TOWER_WEST.map((w, i) => [i === 0 ? w - 20 : w - 40, 39, w, 67] as Rect);
/** the light court between the towers and the lab block, sunk to the lowest lab floor [documented: light wells "on both sides
 * of each building"; the court's depth assumed], from the plaza's edge between the towers (OSM: z ≈ 62) */
export const COURT: Rect = [61, 62, 322, 87];
export const TOWER_BACK = 67;
/** the studies' fronts [documented: OSM's sawtooth]: a flat face 12 ft along at z = 47, a 45° wall one stud in for each stud
 * along for 8 ft, and the point's short face looking west, to z = 39 */
export const FLAT_Z = 47;
export const POINT_Z = 39;
export const STUDY_W = 20;
/** the study each cell of a tower lies in, and where along it (u = 0 at its east edge) */
export function studyOf(x: number): { tower: number; e: number; u: number } | null {
  for (let i = 0; i < STUDY_TOWERS.length; i++) {
    const [x0, , x1] = STUDY_TOWERS[i];
    if (x >= x0 && x < x1) {
      const e = x0 + Math.floor((x - x0) / STUDY_W) * STUDY_W;
      return { tower: i, e, u: x - e };
    }
  }
  return null;
}
/** a study's front at u: the first cell row (toward the plaza) inside the tower */
export const frontAt = (u: number) => (u <= 11 ? FLAT_Z : FLAT_Z - (u - 11));
/** inside a study tower's plan (north wing) */
export function inTower(x: number, z: number): boolean {
  const s = studyOf(x);
  return !!s && z >= frontAt(s.u) && z < TOWER_BACK;
}
/** the 45° walls' cells and the points' (teak, spec 079 Q8) */
export const onDiagonal = (x: number, z: number) => { const s = studyOf(x); return !!s && s.u >= 12 && z === frontAt(s.u); };
/** the point's west face: the study's last column, from the point back to the flat face's line [documented: looks west] */
export const onWestFace = (x: number, z: number) => { const s = studyOf(x); return !!s && s.u === STUDY_W - 1 && z > POINT_Z && z < FLAT_Z; };
/** the flat face's cells (concrete) */
export const onFlat = (x: number, z: number) => { const s = studyOf(x); return !!s && s.u <= 11 && z === FLAT_Z; };
/** the links to the lab block at the study floors [documented: OSM traces them, 11 ft wide, mid-tower; the east tower's at
 * its east end] */
export const LINKS: [number, number][] = TOWER_WEST.map((w, i) => (i === 0 ? [61, 71] : [w - 26, w - 15]));
/** the studies: two floors of each tower [scaled], one or two across [documented: 36 in all] */
export const STUDY_FLOORS = [Y.T_STUDY1, Y.T_STUDY2];
export function studies(): { x0: number; tower: number; y: number }[] {
  const out: { x0: number; tower: number; y: number }[] = [];
  STUDY_TOWERS.forEach(([x0, , x1], tower) => {
    for (const y of STUDY_FLOORS) for (let e = x0; e < x1; e += STUDY_W) out.push({ x0: e, tower, y });
  });
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------
// The plaza and the water [documented: OSM ways 1124026283 (the plaza), 60739892 (the channel), 60739889 and 60739891 (the
// basins), 1124026279 (the lower landing), 1124026280-81 (the steps)]
// ---------------------------------------------------------------------------------------------------------------------------

/** the plaza's travertine: from the grove's steps to the basin and the west steps, between the study towers [documented] */
export const PLAZA: Rect = [50, -87, 322, 87];
/** the channel: 2 ft wide [documented: 0.5 m (OSM), "a foot-wide" (a secondary source); 2 studs, mirrored about z = 0] */
export const CHANNEL: Rect = [79, -1, 285, 1];
/** the source at its east end [documented: OSM's 0.9 × 1.1 m square] */
export const SOURCE: Rect = [76, -2, 79, 2];
/** the big basin across the axis [documented: OSM way 60739889, 20 × 65 ft] */
export const BASIN1: Rect = [285, -33, 305, 33];
/** the smaller basin beyond it [documented: OSM way 60739891, 12 × 16 ft] */
export const BASIN2: Rect = [308, -8, 320, 8];
/** the lips the water falls over [documented: the fountain photograph], a travertine strip each */
export const LIP1 = 305;
/** the steps down either side of the small basin [documented: OSM ways 1124026280-81] */
export const WEST_STEPS: Rect[] = both([[310, 13, 322, 33]]);
/** the west end's lower level: the landing and its planters, between the wings' west ends [documented: OSM's outdoor seating
 * (way 1124026279) and gardens; its level assumed] */
export const LOWER: Rect = [322, -87, 362, 87];
export const LANDING: Rect = [336, -38, 359, 35];
/** the planters on the lower level [documented: OSM's gardens 1124026263-78, 9 × 9 ft and 8 × 37 ft] */
export const PLANTERS: Rect[] = both([[329, 49, 337, 85], [343, 44, 351, 53], [355, 44, 363, 53], [343, 56, 351, 65], [355, 56, 363, 65], [343, 69, 351, 78], [355, 69, 363, 78]]);
/** the low travertine benches [documented: the west plaza photograph], one in each gap between the towers [assumed] */
export const BENCHES: Rect[] = both([[86, 52, 98, 54], [146, 52, 158, 54], [206, 52, 218, 54], [266, 52, 278, 54]]);

/** the citrus grove east of the plaza [documented: OSM's gardens 1124010512-13, 50 × 80 ft either side of the axis] */
export const GROVE: Rect[] = both([[0, 8, 50, 87]]);
export const GROVE_WALK: Rect = [0, -8, 50, 8];
/** steps up from the grove to the plaza on the axis [documented: OSM way 1124010508] */
export const GROVE_STEPS: Rect = [46, -8, 50, 8];

export const CENTER = { x: 190, y: 10, z: 0 };
export const SITE = { lat: 32.8873, lon: -117.2459, rotationDeg: -180.25 };

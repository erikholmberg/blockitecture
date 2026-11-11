/**
 * Plan of Unity Temple, in studs (1 stud ≈ 1 ft). Spec 062.
 *
 * Model frame = the HABS IL-1093 plans (1967): x from the temple's north front on Lake Street (x = 0) to Unity House's south end
 * (+x = real south); z from the east side (z = 0) to the west, Kenilworth Avenue (+z = real west). The building is symmetrical
 * about z = 46. Three parts in a row: the temple, a cube with a stair tower at each corner and a band of clerestory windows
 * under a cross of roof slabs; the low entrance foyer between its two raised terraces; Unity House, the congregation's hall.
 *
 * [documented] = HABS IL-1093's written dimensions (sheet 4: 142′-0″ by 91′-6″; the temple 64′-0″ across its towers, each
 * 11′-8″ square, the alcove walls 38′-0″; the foyer 24′-10″ by 27′-4″; Unity House's bays) and data pages;
 * [scaled] = read off the HABS elevations and section (±0.5 ft); [assumed] = what those don't settle.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const onRing = (x: number, z: number, r: Rect) => inRect(x, z, r) && (x === r[0] || z === r[1] || x === r[2] - 1 || z === r[3] - 1);

/** the axis of symmetry */
export const AXIS = 46;
export const mirror = (r: Rect): Rect => [r[0], 2 * AXIS - r[3], r[2], 2 * AXIS - r[1]];

/** heights in plates (0.4 ft) above the Lake Street side's ground [scaled: the elevations and the section] */
export const Y = {
  PLINTH: 9, // the water table, about 3–4 ft
  FOYER: 9, // the foyer's and Unity House's floor, +3.3 ft
  AUDITORIUM: 18, // the auditorium's floor, +7 ft
  GALLERY1: 27, // the lower galleries, +10.5 ft
  GALLERY2: 51, // the upper galleries, +20.5 ft
  SILL: 54, // the top of the solid walls, the clerestory's sill, +21.5 ft
  CEILING: 87, // the roof slabs' underside, +34.6 ft
  ROOF: 93, // their top, +36.8 ft
  ATTIC: 111, // the attic round the skylight, +44.8 ft
  TOWER: 72, // the stair towers, +29.3 ft
  LINK: 57, // the foyer's roof and Unity House's corner blocks, +22.3 ft
  WING_SILL: 24, // Unity House's wing ends: solid to +9 ft, columns to +21.3 ft
  WING_SLAB: 54,
  HALL: 69, // the parapet round Unity House's skylight, +28 ft
  HALL_BALCONY: 31, // +12.5 ft
  CHIMNEY: 93, // +37 ft
  BULKHEAD: 21, // the terraces' walls, +8.7 ft
};

/** the temple: 64 ft across its towers [documented] */
export const TEMPLE: Rect = [1, 14, 65, 78];
/** its four stair towers, 11′-8″ square [documented] */
export const TOWERS: Rect[] = [[1, 14, 13, 26], [1, 66, 13, 78], [53, 14, 65, 26], [53, 66, 65, 78]];
/** the alcove walls between them, 38 ft long, standing 1′-4″ proud of the towers [documented]: north, east, west; the south
 * one, behind the pulpit and the organ, meets the foyer */
export const ALCOVE_N = { x: 0, z0: 27, z1: 65 };
export const ALCOVE_E = { z: 13, x0: 14, x1: 52 };
export const ALCOVE_W = { z: 78, x0: 14, x1: 52 };
/** the room: a Greek cross round a central square of 33 ft, a hollow pier at each of its corners [documented] */
export const SQUARE: Rect = [17, 30, 49, 62];
export const PIERS: Rect[] = [[13, 26, 17, 30], [13, 62, 17, 66], [49, 26, 53, 30], [49, 62, 53, 66]];
/** the roof: a cross of slabs about 75 ft from tip to tip, 5 ft out past the columns [scaled] */
export const ROOF_NS: Rect = [-5, 22, 71, 70];
export const ROOF_EW: Rect = [9, 8, 57, 84];
export const inRoof = (x: number, z: number) => inRect(x, z, ROOF_NS) || inRect(x, z, ROOF_EW);
/** the attic block round the skylight, about 40.5 ft square [scaled] */
export const ATTIC: Rect = [13, 26, 53, 66];

/** the foyer between the two blocks: 24′-10″ by 27′-4″ [documented] */
export const FOYER: Rect = [65, 32, 90, 60];
/** the terraces either side of it, raised about 3 ft behind bulkhead walls, 97.5 ft across in all [scaled] */
export const TERRACE_W: Rect = [65, 60, 90, 95];
export const TERRACE_E: Rect = mirror(TERRACE_W);
/** the doors: a bank of six on each side of the foyer, about 20 ft [documented] */
export const DOORS = { x0: 68, x1: 88 };

/** Unity House: 91′-6″ wide [documented]: the hall, its two wings with their columned ends, a corner block either side of each
 * wing end, and the kitchen's bay on the south [documented: sheet 4's bays] */
export const HALL: Rect = [90, 18, 142, 74];
export const WING_E: Rect = [100, 0, 123, 18];
export const WING_W: Rect = mirror(WING_E);
export const CORNERS: Rect[] = [[90, 0, 100, 11], [123, 0, 133, 11], [90, 81, 100, 92], [123, 81, 133, 92]];
export const inUnityHouse = (x: number, z: number) => inRect(x, z, HALL) || inRect(x, z, WING_E) || inRect(x, z, WING_W) || CORNERS.some((r) => inRect(x, z, r));
/** the hall's skylit middle, and the chimney on its south wall [scaled] */
export const HALL_ROOF: Rect = [100, 26, 128, 66];
export const CHIMNEY: Rect = [128, 44, 133, 48];

export const inBuilding = (x: number, z: number) => inRect(x, z, TEMPLE) || inRect(x, z, FOYER) || inUnityHouse(x, z);

export const CENTER = { x: 70, y: 14, z: 46 };
export const SITE = { lat: 41.88835, lon: -87.79684, rotationDeg: -89.5 };

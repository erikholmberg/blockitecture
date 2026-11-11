/**
 * Plan of Trellick Tower, in studs (1 stud ≈ 1 ft). Spec 061.
 *
 * Model frame: x along the slab from its west-north-west end, by the service tower (x = 0), to its east-south-east end (+x =
 * real about 113°); z across it from the corridor side (z = 0) to the balcony side (+z = real about 203°, south-south-west).
 * The real world is turned −23°. A slab of 31 storeys over its entrance level on concrete crosswalls; a separate service tower
 * with the lifts, joined to the slab by a bridge at every third floor, the boiler house cantilevered from its top; the
 * seven-storey Block B running south along Golborne Road.
 *
 * [documented] = the listing (Historic England 1246688), James Dunnett's published dimensions (the south front 143′-9½″ ×
 * 283′-9″, crosswalls at 22′-11″), OSM's three outlines; [scaled] = read off the published plans, elevation and photographs;
 * [assumed] = what those don't settle.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];

/** the slab: 143′-9½″ long [documented], about 13 m deep with its corridors and balconies [scaled] */
export const SLAB: Rect = [0, 0, 144, 43];
/** a storey: 8′-10⅜″ [documented: eight storeys in 70′-11¼″], drawn as 22 plates (8.8 ft) */
export const STOREY = 22;
/** the entrance level and 31 floors over it [documented: 31 storeys; the front 283′-9″ high] */
export const LEVELS = 32;
export const TOP = LEVELS * STOREY; // 704 plates, 281.6 ft
export const levelY = (l: number) => l * STOREY;
/** every third floor is a corridor floor, with a bridge to the service tower [documented]: floors 3, 6 … 30 [scaled] */
export const isCorridor = (l: number) => l >= 3 && l % 3 === 0;
export const CORRIDORS = Array.from({ length: LEVELS }, (_, l) => l).filter(isCorridor);
/** the corridor along the north side [scaled] */
export const CORRIDOR: Rect = [1, 1, 143, 7];

/** the crosswalls at 22′-11″ centres [documented]: five bays, and a wider, more solid bay at the east end [scaled] */
export const BAY = 23;
export const CROSSWALLS = [0, 23, 46, 69, 92, 115, 143];
/** the thinner fin halving each bay on the balcony front [documented: "each halved by a thinner fin"] */
export const FINS = [11, 34, 57, 80, 103];
/** the balcony front's planes: the balconies' edge, and the window wall set back behind them [scaled] */
export const BALCONY_Z = 42;
export const WINDOW_Z = 40;
/** floors 23–24: five two-storey maisonettes [documented], shown on the front by projecting pebble-panel boxes [scaled] */
export const MAISONETTE = 24;

/** the service tower: about 10 × 10 m [scaled], 7.3 m off the slab's end [documented: OSM], 35 storeys [documented] */
export const TOWER: Rect = [-60, -14, -27, 19];
export const TOWER_TOP = 35 * STOREY; // 770 plates, 308 ft
/** the bridges: enclosed concrete boxes a storey high, about 2 m wide [scaled] */
export const BRIDGE: Rect = [-27, 1, 0, 8];
/** the boiler house on the 32nd and 33rd floors, fully glazed, cantilevered from the tower [documented], about 3 m out to the
 * west over a sloped haunch three storeys deep [scaled] */
export const BOILER = { x0: -70, x1: -60, z0: -9, z1: 14, y0: 32 * STOREY, y1: 34 * STOREY, haunch: 3 * STOREY };

/** Block B: seven storeys [documented], 58 × 12.3 m along Golborne Road [documented: OSM] */
export const BLOCK_B: Rect = [-92, 40, -52, 218];
export const BLOCK_B_LEVELS = 7;

/** the raised terrace round the slab's foot [documented: "broad raised terrace"; OSM's outline of the slab takes it in] */
export const PODIUM: Rect = [-3, -5, 147, 64];

export const CENTER = { x: 50, y: 130, z: 25 };
export const SITE = { lat: 51.52365, lon: -0.20548, rotationDeg: -23 };

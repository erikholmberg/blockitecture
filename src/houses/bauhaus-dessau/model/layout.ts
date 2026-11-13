/**
 * Plan of the Bauhaus Dessau, in studs (1 stud ≈ 1 ft) and plates (0.4 ft). Spec 076.
 *
 * Model frame: x along the workshop wing, from the north wing's north front (x = 0, real about 337.6°) toward the workshop
 * wing's south end (+x = real about 157.6°); z from the Prellerhaus's east front (z = 0, real about 67.8°) toward Gropiusallee
 * (+z = real about 247.8°). The real world is turned about −68°. Five parts in a pinwheel [documented: OSM relation 14318571 and
 * its five part relations]: the workshop wing behind its curtain wall, the bridge over Bauhausstraße, the north wing, the low
 * link with the Aula, the stage and the canteen, and the Prellerhaus of student studios.
 *
 * [documented] = de./en.wikipedia, bauhaus-dessau.de, denkmalschutz.de, OSM's outlines (every plan size here); [scaled] = read
 * off the Commons photographs (spec 076's research; ±10%); [assumed] = what those don't settle. No source gives a height in
 * metres (spec 076 Q4): every height is [scaled] or [assumed].
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];

// ---------- the plan [documented: OSM, measured in the building's frame] ----------
/** the north wing (relation 14318566): 37.9 × 19.4 m */
export const NORTH: Rect = [0, 118, 63, 242];
/** the bridge (relation 14318567): 9.3 m wide, from the north wing to the workshop wing, its two upper floors only */
export const BRIDGE: Rect = [63, 117, 147, 148];
/** the workshop wing's main block (relation 14318568): 16.4 × 48.2 m */
export const WORKSHOP: Rect = [144, 166, 302, 220];
/** the entrance and stair block between the workshop wing and the link (relation 14318568, an L): its two rectangles */
export const ENT_A: Rect = [147, 117, 213, 146];
export const ENT_B: Rect = [147, 146, 198, 166];
/** the stub off the workshop wing's south end (relation 14318568), 6.8 × 13 m: unexplained, built to the plinth [assumed: Q10] */
export const STUB: Rect = [302, 166, 346, 188];
/** the link (relation 14318569, "Bauhaus Aula und Mensa"): 24.3 × 15.8 m */
export const LINK: Rect = [161, 37, 213, 117];
/** the Prellerhaus (relation 14318570): 11.3 × 19.1 m, long along the axis */
export const PRELLER: Rect = [150, 0, 213, 37];
/** the stage (way 239651895, 3 levels), rising above the link */
export const STAGE: Rect = [176, 70, 198, 95];
/** the Prellerhaus's stair up to the roof terrace (way 239651900, 6 levels): its main rectangle */
export const PRELLER_STAIR: Rect = [166, 17, 197, 31];
/** the bridge's four piers (ways 473496075–473496078), 1.8 m square, in two pairs either side of Bauhausstraße */
export const PIERS: Rect[] = [[82, 140, 88, 146], [82, 125, 88, 131], [124, 139, 130, 145], [123, 126, 129, 132]];
/** the entrance's stair tower: the corner of the entrance block by the bridge, rendered grey [documented: photographs] */
export const TOWER: Rect = [147, 117, 161, 131];

/** the building's parts, for the plan's union */
export const PARTS: Record<string, Rect[]> = {
  north: [NORTH], bridge: [BRIDGE], workshop: [WORKSHOP, ENT_A, ENT_B], stub: [STUB], link: [LINK], preller: [PRELLER],
};
/** everything standing on the ground (the bridge stands on its piers) */
export const GROUND_RECTS: Rect[] = [NORTH, WORKSHOP, ENT_A, ENT_B, STUB, LINK, PRELLER];
export const onGround = (x: number, z: number) => GROUND_RECTS.some((r) => inRect(x, z, r));
export const FOOTPRINT: Rect[] = [...GROUND_RECTS, BRIDGE];
export const inFootprint = (x: number, z: number) => FOOTPRINT.some((r) => inRect(x, z, r));

/** Bauhausstraße: 26 ft wide [documented: OSM way 239651885, width=26], along z under the bridge, centred on OSM's line */
export const STREET = { x0: 89, x1: 115 };

// ---------- heights, in plates ----------
/**
 * The ground floor stands on the half-sunk basement: its floor 12 plates (4.8 ft) up [scaled: the plinth's top about 5 ft]. The
 * workshop wing, the entrance block, the north wing and the bridge have storeys of 36 plates (14.4 ft, 4.4 m) [scaled ±0.4 m
 * from the workshop photograph's 4.1 m clear height]; the roof slab at 120, its parapet to 125 (50 ft) [scaled].
 */
export const GROUND_FLOOR = 12;
export const PLINTH_TOP = 10;
export const STOREY = 36;
export const FL = (l: number) => GROUND_FLOOR + STOREY * l;
export const ROOF = FL(3); // 120
export const PARAPET = ROOF + 5; // 125 plates, 50 ft
/** a storey's ceiling: the underside of the slab over it (the roof's over the top storey) [scaled: as the storeys] */
export const CEIL = (l: number) => (l < 2 ? FL(l + 1) - 1 : ROOF);
/** the bridge: the workshop wing's first and second upper floors [documented: OSM min_level=2]; its underside 47 plates (18.8 ft) [assumed: 19 ft] */
export const BRIDGE_UNDER = FL(1) - 1;
/** the Prellerhaus: a ground floor and four studio floors of 25 plates (10 ft, 3.05 m) [assumed] */
export const P_STOREY = 25;
export const PFL = (l: number) => GROUND_FLOOR + P_STOREY * l;
export const P_ROOF = PFL(5); // 137
/** [assumed: as the Prellerhaus's storeys] its ceilings */
export const P_CEIL = (l: number) => (l < 4 ? PFL(l + 1) - 1 : P_ROOF);
export const P_PARAPET = P_ROOF + 5; // 142 plates, 56.8 ft
/** its roof terrace's railing [assumed: its height; the terrace for exercise documented] */
export const P_RAIL = P_PARAPET + 4; // 146 plates, 58.4 ft
/** the stair head over the roof terrace, a level higher [assumed: 22 plates; the level documented: OSM, 6 levels] */
export const P_STAIR_TOP = P_ROOF + 2 + 22; // 161
/** the link: one tall storey [documented], its roof slab's top 50 plates (20 ft) up [scaled: it meets the Prellerhaus below its first-floor balconies] */
export const LINK_ROOF = 48;
export const LINK_TOP = 50;
/** the stage rises above the link to 70 plates (28 ft) [assumed] */
export const STAGE_TOP = 70;
export const STAGE_FLOOR = GROUND_FLOOR + 8; // [assumed] a platform 3 ft up

// ---------- the workshop wing's frame and curtain wall ----------
/** the glass's band: from the white band over the plinth to the roof's band [documented: "from the ground floor to the third storey"] */
export const GLASS_Y0 = GROUND_FLOOR + 2;
export const GLASS_Y1 = ROOF;
/** the curtain wall hangs in front of the slabs on three fronts [documented]: west (to Gropiusallee), south and east */
export const WEST_Z = WORKSHOP[3] - 1; // 219
export const SOUTH_X = WORKSHOP[2] - 1; // 301
export const EAST_Z = WORKSHOP[1]; // 166, east of the entrance block
export const EAST_X0 = ENT_B[2]; // 198
export const curtain = (x: number, z: number) =>
  inRect(x, z, WORKSHOP) && (z === WEST_Z || x === SOUTH_X || (z === EAST_Z && x >= EAST_X0));
/** the panes: about eight a storey [scaled: the workshop photograph]; a mullion every 4 studs, a transom every 9 plates */
export const MULLION = 4;
export const TRANSOM = 9;
/**
 * The concrete columns with flared heads, set back from the slabs' edge [documented: denkmalschutz.de; the photograph shows
 * the column about 1 m in from the glass]: 2 studs square, their faces 3 ft behind the glass [scaled], on a 16-stud grid along
 * the wing [assumed], in three rows across it [assumed].
 */
export const COLUMN_X = Array.from({ length: 10 }, (_, k) => 152 + 16 * k); // … 296: the south row, 3 ft behind x = 301
export const COLUMN_Z = [170, 192, 214]; // 170: 3 ft behind the east glass; 214: 3 ft behind the west glass
export const COLUMNS: [number, number][] = COLUMN_X.flatMap((x) => COLUMN_Z.map((z) => [x, z] as [number, number]));

// ---------- the Prellerhaus ----------
/** four window bays on the east front [documented], 16 studs each [documented: OSM's 19.1 m] */
export const P_BAYS = [150, 166, 182, 198];
/** each bay's window, and its right third: the balcony door [documented]. From the lawn, facing +z, right is −x. */
export const pWindow = (b0: number) => [b0 + 2, b0 + 14] as const;
export const pDoor = (b0: number) => [b0 + 2, b0 + 6] as const;
/** the small balconies: 6 × 3 studs [scaled], a slab, a dark solid front, a tube rail above */
export const pBalcony = (b0: number): Rect => [b0 + 1, -3, b0 + 7, 0];
export const P_SILL = 7;
export const P_HEAD = 21;
/** the ground floor's two round windows on the east front [documented: photographs], 2 ft across [scaled] */
export const ROUND_WINDOWS: [number, number][] = [[171, 0], [193, 0]];
export const ROUND_Y = GROUND_FLOOR + 14;
/** the course band the round windows sit in: the ground floor's window band */
export const ROUND_BAND = [PFL(0) + 7, PFL(0) + 21] as const;
/** the wide south balconies, one on each upper floor [documented: reached from the kitchen] */
export const SOUTH_BALCONY: Rect = [213, 5, 219, 32];
/** the tall stair window up the north front [documented: photographs] */
export const STAIR_WINDOW = { x: PRELLER[0], z0: 16, z1: 20, y0: PFL(0) + 7, y1: PFL(4) + 21 };
/** the studios off a central corridor [documented: seven a floor, 28 in all] */
export const P_CORRIDOR = { z0: 16, z1: 21 };

// ---------- the link ----------
/** the north side's ten window bays, four glazing bars high [documented] */
export const LINK_BAY = 8;
export const LINK_WIN = { y0: GROUND_FLOOR + 4, y1: LINK_ROOF - 3 };
export const LINK_BARS = [22, 28, 34, 40];
/** inside: the Aula toward the entrance block, the stage in the middle, the canteen toward the Prellerhaus [documented] */
export const AULA: Rect = [162, 95, 212, 117];
export const CANTEEN: Rect = [162, 38, 212, 70];

// ---------- the entrance ----------
/** the red double door under its flat canopy [documented: ArchEyes, photographs], on the tower's east face */
export const DOOR = { x0: 151, x1: 157, z: TOWER[1], y0: GROUND_FLOOR, y1: GROUND_FLOOR + 20 };
export const CANOPY: Rect = [149, 112, 159, 117];
export const CANOPY_Y = GROUND_FLOOR + 22;
/** BAUHAUS set vertically in white on the grey tower [documented: photographs]: 4 × 5 pixels a letter, 2 plates a row */
export const LETTER_X0 = 152;
export const LETTER_Z = TOWER[1] - 1;
export const LETTER_TOP = ROOF - 1;
export const LETTER_ROW = 2;
export const LETTER_GAP = 2;
export const FONT: Record<string, string[]> = {
  B: ['###.', '#..#', '###.', '#..#', '###.'],
  A: ['.##.', '#..#', '####', '#..#', '#..#'],
  U: ['#..#', '#..#', '#..#', '#..#', '.##.'],
  H: ['#..#', '#..#', '####', '#..#', '#..#'],
  S: ['.###', '#...', '.##.', '...#', '###.'],
};
export const WORD = 'BAUHAUS';
/** the top of letter i's glyph (plates) */
export const letterTop = (i: number) => LETTER_TOP - i * (5 * LETTER_ROW + LETTER_GAP);
/** a glyph's column c (left to right as read from the east) at x: reading faces +z, so left is +x */
export const letterX = (c: number) => LETTER_X0 + 3 - c;

/** the stage's centre and the building's, for the camera */
export const CENTER = { x: 175, y: 40, z: 125 };
export const SITE = { lat: 51.839362, lon: 12.227364, rotationDeg: -68 };

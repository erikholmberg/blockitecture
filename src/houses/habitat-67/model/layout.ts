/**
 * Plan of Habitat 67, in studs (1 stud ≈ 1 ft) and plates (0.4 ft). Spec 072.
 *
 * Model frame: x along the complex's axis from its south end (x = 0) to its north end (+x = real about 4°, a little east of
 * north); z across it from the avenue Pierre-Dupuy side (z = 0, real west) to the St. Lawrence side (+z = real east). The
 * real world is turned 86°. OSM's outline (way 440195613) runs x 0…930, z 0…295 in this frame.
 *
 * [documented] = the sources in specs/072-habitat-67.md (354 boxes of 38½ × 17½ × 10 ft; up to 12 storeys; three lift cores;
 * pedestrian streets on every fourth floor, the 6th and 10th behind plexiglass; three hills on the avenue's side and two lower
 * groups on the river's; OSM's outline); [scaled] = read off OSM's outline and photographs; [assumed] = what those don't settle.
 */
export type Rect = [x0: number, z0: number, x1: number, z1: number];

export const inRect = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
export const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));

/** a box: 38½ × 17½ × 10 ft [documented], drawn 38 × 18 studs (18 keeps half-box offsets on whole studs) × 25 plates */
export const BOX_L = 38;
export const BOX_W = 18;
export const LEVEL = 25;
/** the parking and services level under the boxes: its top, in plates (8 ft) [assumed: its height isn't published] */
export const BASE_TOP = 20;
/** twelve box levels at most [documented: up to 12 residential storeys] */
export const LEVELS = 12;
export const levelY = (l: number) => BASE_TOP + l * LEVEL;
/** the top of the highest box: 12 × 25 plates over the base [documented storeys] */
export const TOP = levelY(LEVELS);
/**
 * Floors are counted with the parking level as the 1st, so box level l is floor l + 2 [assumed]. The streets run on every fourth
 * floor [documented], the 6th and 10th among them [documented], so on the 2nd, 6th and 10th: box levels 0, 4 and 8.
 */
export const floorOf = (l: number) => l + 2;
export const STREET_LEVELS = [0, 4, 8];

/** a box: its corner, its level, and whether its long side runs along the axis ('x') or across it ('z') */
export interface Box { i: number; x: number; z: number; l: number; o: 'x' | 'z'; r: Rect; cluster: number }

/**
 * The 354 boxes [documented count], level by level: "x,z" is the box's corner, then its direction. Laid by hand over OSM's
 * outline, three hills toward the avenue (round x 155, 545 and 800) and two lower groups toward the river (round x 350 and
 * 650) [scaled: OSM's outline bulges three times on the avenue's side and twice on the river's], each box over the one below
 * at a half-box step, turned along or across the axis, with a terrace on the roof below [documented]. Which box goes where
 * is [assumed]: no placement drawing was obtained (spec 072, Q3).
 */
const TABLE = [
  // level 0: 50 boxes
  '18,135z 63,153z 81,153z 90,45z 108,54z 135,45x 144,27x 144,63z 171,63z 216,63z 243,153x 252,180x 297,216x 297,234x 324,252x 351,234x 369,216x 405,243z 423,135x 441,90x 477,72x 495,27z 513,18x 513,36x 522,54x 558,90x 567,63x 567,126x 567,180z 603,144z 612,198z 621,126z 639,189z 648,135z 666,144x 693,72x 693,126x 693,180x 711,207x 720,90x 738,18z 756,36z 774,63z 792,18z 792,63z 810,45z 819,126x 837,144x 864,126x 891,162x',
  // level 1: 46 boxes
  '0,153x 18,108x 18,135x 63,108x 72,54x 108,108x 117,72x 126,27x 162,54z 171,99x 207,54z 225,99x 261,135z 288,216z 297,171z 315,189z 342,180x 369,234x 378,108x 387,135z 432,90z 450,108z 468,63x 468,90z 486,18x 495,99x 540,54z 558,108x 567,180x 585,144x 585,162x 621,216x 630,108x 630,189x 675,108x 693,171z 720,108z 729,189z 738,99z 756,99x 765,36x 774,18x 810,108x 855,144z 882,117z 900,153z',
  // level 2: 52 boxes
  '9,126z 27,153z 36,99z 72,54z 72,99z 108,90z 126,63z 135,9z 171,81z 189,72x 189,90z 198,54x 225,99z 243,90z 261,117z 270,216x 270,234x 297,153z 315,180x 315,207x 360,180x 369,234z 378,135x 387,153x 387,234z 414,99x 414,117x 459,117x 477,45z 477,90x 495,0z 522,54x 540,72x 576,108x 576,144z 603,162z 621,198z 630,90z 639,171z 648,99z 675,99x 675,180x 702,198x 756,81z 765,9z 774,90z 792,0z 810,90z 846,162x 873,126x 882,144x 891,171x',
  // level 3: 38 boxes
  '18,117z 36,117x 45,99x 63,54z 99,90z 117,9x 126,81z 189,108z 207,108x 243,126x 252,108x 306,180z 324,171z 342,189z 360,171z 378,153z 396,117z 396,162x 414,117z 432,81z 459,108z 477,108z 495,0x 495,90z 540,72z 558,72z 576,108z 594,108x 612,171x 648,99x 648,117x 693,81z 747,81z 774,99x 819,90z 864,162z 873,117z 900,117z',
  // level 4: 33 boxes
  '36,126x 54,63z 72,63z 117,0z 126,63z 135,9x 180,126x 243,126z 261,126x 297,198x 342,207x 351,162x 405,126x 405,144x 414,162x 423,81x 459,135x 477,90x 495,0z 513,0x 522,81x 540,63x 558,126x 621,153z 639,126x 666,90x 747,63z 774,90x 819,90x 855,126x 855,180x 864,162x 873,144x',
  // level 5: 32 boxes
  '45,135x 72,81x 90,99x 108,63x 117,18z 126,81x 135,99x 189,108x 198,126x 252,108x 270,135x 351,207z 387,90z 405,99z 423,90z 441,63z 459,117z 477,108z 504,90z 522,72z 549,45z 558,117z 576,99z 603,99x 603,153x 639,117x 684,99z 738,72z 756,81x 810,81x 846,99z 864,108z',
  // level 6: 29 boxes
  '90,99z 108,36z 108,99z 126,27z 126,90z 144,63z 171,108x 198,126z 216,126z 261,99z 279,108z 378,117x 432,63x 450,108x 495,90z 504,72x 513,99x 549,54x 567,126x 576,90x 576,108x 639,99z 684,108x 738,54z 756,72z 774,72z 819,72z 828,117x 837,72z',
  // level 7: 26 boxes
  '72,99x 99,117z 117,117z 126,99x 171,99x 180,117x 225,117z 243,117x 252,99x 387,99z 459,90z 486,90z 513,90z 531,72z 558,45z 567,90z 585,72z 594,117z 630,99x 639,117x 684,99z 702,90z 747,99x 810,99x 810,117x 819,63x',
  // level 8: 15 boxes
  '72,90x 81,135x 153,90x 171,126x 477,90x 531,63x 531,81x 540,45x 576,63z 576,126x 594,63z 738,90x 810,126x 819,63z 837,54z',
  // level 9: 16 boxes
  '117,99x 144,81x 171,117x 180,99x 504,81z 513,54x 522,72z 540,72z 558,81z 576,117z 747,108x 756,90x 801,72x 801,99x 810,117x 828,54x',
  // level 10: 11 boxes
  '126,90z 144,63z 162,63z 495,72x 531,54x 549,99x 558,81x 756,72z 774,72z 792,72z 810,63z',
  // level 11: 6 boxes
  '126,72x 135,90x 522,63z 549,72z 765,99x 801,72x',
];

/** the build's groups along the axis: the south hill, the river group and saddle, the middle hill, the north hill [scaled] */
const CLUSTER_X = [300, 470, 690];
const clusterOf = (x: number) => CLUSTER_X.filter((c) => x >= c).length;

/** every box, in build order: level by level, and within a level group by group along the axis */
export const BOXES: Box[] = TABLE.flatMap((row, l) =>
  row.split(' ').map((t) => {
    const o = t.endsWith('z') ? 'z' : 'x';
    const [x, z] = t.slice(0, -1).split(',').map(Number);
    const r: Rect = o === 'x' ? [x, z, x + BOX_L, z + BOX_W] : [x, z, x + BOX_W, z + BOX_L];
    return { i: 0, x, z, l, o, r, cluster: clusterOf(x + 9) } as Box;
  }).sort((a, b) => a.cluster - b.cluster || a.x - b.x || a.z - b.z),
).map((b, i) => ({ ...b, i }));

/**
 * The pedestrian streets [documented: continuous through the project, the dwellings entered directly off them], 10 ft wide
 * [assumed], on the same line at each street level [assumed]: along the spine from the south end, round the river group's
 * back, and on to the north end [scaled: the outline's zigzag].
 */
export const STREET_W = 10;
export const STREETS: Rect[] = [[18, 108, 312, 118], [302, 118, 312, 198], [302, 188, 400, 198], [390, 118, 400, 188], [390, 108, 910, 118]];

/** the three lift cores [documented], one in each hill [scaled], beside the street; the lifts stop at every street [documented] */
export const CORES: Rect[] = [[146, 118, 164, 136], [536, 118, 554, 136], [792, 118, 810, 136]];
/** the cores rise to the top of the highest street's level [documented: to the top street; assumed: how far] */
export const CORE_TOP = levelY(STREET_LEVELS[STREET_LEVELS.length - 1] + 1);

/** the box above or beside: everything that takes space at level l (boxes, streets at a street level, the cores) */
export const boxesAt = (l: number) => BOXES.filter((b) => b.l === l);
export const isStreetLevel = (l: number) => STREET_LEVELS.includes(l);

/**
 * The sample dwelling: two boxes side by side on the 10th floor [documented: a dwelling is one to eight linked boxes; Safdie's
 * own, 1011–1012, was on the 10th floor], in the middle hill [assumed], joined by a doorway [assumed].
 */
const find = (x: number, z: number, l: number) => BOXES.find((b) => b.x === x && b.z === z && b.l === l)!;
export const DWELLING = [find(531, 63, 8), find(531, 81, 8)];
export const DWELLING_DOOR = [
  { box: DWELLING[0].i, r: [545, 80, 551, 81] as Rect },
  { box: DWELLING[1].i, r: [545, 81, 551, 82] as Rect },
];

export const CENTER = { x: 465, y: 60, z: 150 };
export const SITE = { lat: 45.49987, lon: -73.54365, rotationDeg: 86 };

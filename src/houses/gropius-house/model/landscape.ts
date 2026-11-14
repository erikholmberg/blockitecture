/**
 * The Gropius House's landscape (spec 078): the plinth's fieldstone retaining walls topped with flagstones and the bench at the
 * end of the east return [documented]; the gravel drive on OSM's way and its turning circle [documented]; the flagstones in the
 * lawns, the frame of two lally columns and a beam south of the porch, the Japanese garden of 1957 with its azaleas and red
 * maple [documented]; the daylilies and yucca by the glass block and Filipowski's sculpture [documented, as a thin stand-in];
 * the oak on the chimney's axis [documented]; the orchard on a grid on the north slope [documented: "a 1960s grid"; its spacing
 * assumed, spec 078 Q6]; the two old pines in the south field [documented]; the woods round about [assumed]; the fieldstone wall
 * along Baker Bridge Road [documented].
 */
import { segDist } from '@/engine/lot';
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { fieldstone, GREY } from './house';
import {
  BENCH, CIRCLE, FRAME_COLS, gbZ, GB_N, GB_X0, HOUSE, inCanopy, inRect, JAPANESE, OAK, PLINTH, PORCH, Rect, Y,
} from './layout';
import { LOT_ROADS } from './lotTerrain';
import { driveDist, HeightMap, inOrchardGround, nearGarage, onDrive, onRetainingWall, streetAt, TERRAIN } from './site';

const GRAVEL = [0xcfc8b8, 0xc4bdac];
const FLAGSTONE = [0xa59d8f, 0x978f82, 0xb0a898];
const LEAVES = [0x3d6a34, 0x2f5c2c, 0x4a7a3a, 0x557f3f];
const OAK_LEAVES = [0x3a6230, 0x46703a];
const APPLE = [0x56803e, 0x4f7a39];
const PINE = [0x2c4a2e, 0x33533a];
const RED_MAPLE = [0x8e2a24, 0xa3372b];
const AZALEA = [0xd8577e, 0xc94a70, 0x6b8f45];
const DAYLILY = 0xe0802a;
const YUCCA = 0x6f8c5a;

/** a broad tree: a trunk and a layered crown */
function tree(b: Builder, x: number, z: number, y: number, trunk: number, rs: number[], colors: number[], t = 1) {
  b.newGroup();
  b.box(x, z, x + t, z + t, y, y + trunk, { kind: 'round', color: 0x4a3b2e });
  const c = x + (t - 1) / 2, d = z + (t - 1) / 2;
  rs.forEach((r, i) =>
    b.box(Math.floor(c - r), Math.floor(d - r), Math.ceil(c + r) + 1, Math.ceil(d + r) + 1, y + trunk + i * 3, y + trunk + 3 + i * 3, {
      kind: 'brick', color: colors[i % colors.length], mask: (xx, zz) => Math.hypot(xx - c, zz - d) <= r + 0.3,
    }));
}

/** the orchard: Baldwin apples [documented] on a 30 ft grid [assumed, spec 078 Q6] over the north slope between the meadow's
 * west edge and the drive, with a few gaps [documented: "gaps in grid do not necessarily need to be filled"] */
export const ORCHARD_STEP = 30;
export const ORCHARD: [number, number][] = [];
for (let z = -60; z >= -190; z -= ORCHARD_STEP)
  for (let x = -100; x <= 170; x += ORCHARD_STEP) {
    if (driveDist(x, z) < 16 || nearGarage(x, z) || Math.hypot(x - CIRCLE.x, z - CIRCLE.z) < CIRCLE.r + 14) continue;
    if (streetAt(x, z) || roadGap(x, z) < 20) continue;
    if (hash2(x * 5 + 11, z * 3 - 7) < 0.1) continue;
    ORCHARD.push([x, z]);
  }
/** distance to Baker Bridge Road's centre line */
function roadGap(x: number, z: number) {
  let d = Infinity;
  for (const r of LOT_ROADS) if (r.name === 'Baker Bridge Road') for (let i = 1; i < r.pts.length; i++) d = Math.min(d, segDist(x, z, r.pts[i - 1], r.pts[i]));
  return d;
}
/** Baker Bridge Road's centre line at x (it runs across the lot's north-east corner) */
function roadZ(x: number) {
  const r = LOT_ROADS.find((rr) => rr.name === 'Baker Bridge Road')!;
  for (let i = 1; i < r.pts.length; i++) {
    const [a, c] = [r.pts[i - 1], r.pts[i]];
    if ((x - a[0]) * (x - c[0]) <= 0 && a[0] !== c[0]) return a[1] + ((x - a[0]) * (c[1] - a[1])) / (c[0] - a[0]);
  }
  return -Infinity;
}
/** the fieldstone wall along the road, 12 ft in from its centre, broken where the drive comes in [documented; its line assumed] */
export const onRoadWall = (x: number, z: number) => {
  const g = roadGap(x + 0.5, z + 0.5);
  return g >= 12 && g < 13.5 && z + 0.5 > roadZ(x + 0.5) && driveDist(x, z) > 9;
};
/** the flagstone sitting places set into the two lawns [documented; where, assumed] */
export const FLAGSTONES: Rect[] = [[4, 32, 12, 38], [58, 30, 66, 36]];

/** the plinth's retaining walls, fieldstone topped with flat flagstones [documented], and the bench (foundation) */
export function buildWalls(b: Builder, hm: HeightMap) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  b.box(PLINTH[0], PLINTH[1], PLINTH[2], PLINTH[3], -24, Y.LAWN, {
    kind: 'brick', color: fieldstone, mask: (x, z, y) => onRetainingWall(x, z) && y >= hm.at(x, z),
  });
  b.box(PLINTH[0], PLINTH[1], PLINTH[2], PLINTH[3], Y.LAWN, Y.LAWN + 1, { kind: 'tile', color: (x, _y, z) => FLAGSTONE[Math.floor(hash2(x >> 1, z >> 1) * 3)], mask: onRetainingWall });
  // the raised seating bench where the east return ends [documented]
  b.newGroup();
  b.box(BENCH[0], BENCH[1], BENCH[2], BENCH[3], Y.LAWN + 1, Y.LAWN + 3, { kind: 'brick', color: fieldstone });
  b.box(BENCH[0], BENCH[1], BENCH[2], BENCH[3], Y.LAWN + 3, Y.LAWN + 4, { kind: 'tile', color: FLAGSTONE[0] });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  const onTop = (x: number, z: number, y: number) => y === hm.at(x, z);
  // the gravel drive and its turning circle [documented]
  b.newGroup();
  b.box(60, -170, 215, 5, -60, 10, { kind: 'tile', color: (x, _y, z) => GRAVEL[Math.floor(hash2(x, z) * 2)], mask: (x, z, y) => onDrive(x, z) && onTop(x, z, y) && !nearGarage(x, z) });
  // the walk from the circle to the canopy, and the paving under it [assumed: flagstone, as by the kitchen steps]
  b.newGroup();
  b.box(28, -26, 80, 0, Y.LAWN, Y.LAWN + 1, {
    kind: 'tile', color: (x, _y, z) => FLAGSTONE[Math.floor(hash2(x >> 1, z >> 1) * 3)],
    mask: (x, z) => inCanopy(x, z) || segDist(x + 0.5, z + 0.5, [60, -18], [76, -12]) < 2.5,
  });
  // the flagstone sitting places in the lawns [documented]
  b.newGroup();
  for (const f of FLAGSTONES) b.box(f[0], f[1], f[2], f[3], Y.LAWN, Y.LAWN + 1, { kind: 'tile', color: (x, _y, z) => FLAGSTONE[Math.floor(hash2(x >> 1, z) * 3)], mask: (x, z) => (x + z) % 5 !== 0 });
  // the frame: two lally columns carrying a wooden beam, 20 ft south of the porch [documented], bittersweet on them [documented]
  b.newGroup();
  for (const [x, z] of FRAME_COLS) b.column(x, z, Y.LAWN, 22, GREY, 'bar');
  b.box(FRAME_COLS[0][0], FRAME_COLS[0][1], FRAME_COLS[1][0] + 1, FRAME_COLS[0][1] + 1, 22, 24, { kind: 'brick', color: 0x7c6248 });
  for (const [x, z] of FRAME_COLS) b.add(x + 1, z, Y.LAWN, 1, 1, 6, 0x5f7a3a, 'brick');
  // the Japanese garden (1957): a gravel bed, the azaleas, and the red-leafed Japanese maple at its end [documented]
  b.newGroup();
  b.box(JAPANESE[0], JAPANESE[1], JAPANESE[2], JAPANESE[3], Y.LAWN, Y.LAWN + 1, { kind: 'tile', color: (x, _y, z) => (hash2(x, z) < 0.5 ? 0xd9d6cf : 0xcac6bd) });
  for (const [x, z] of [[31, 48], [36, 52], [44, 49], [48, 54], [32, 57], [46, 59], [39, 47]]) {
    b.newGroup();
    b.box(x, z, x + 2, z + 2, Y.LAWN + 1, Y.LAWN + 3, { kind: 'brick', color: (xx, _y, zz) => AZALEA[Math.floor(hash2(xx, zz) * 3)] });
  }
  tree(b, 40, 59, Y.LAWN + 1, 9, [3, 4, 3], RED_MAPLE);
  // the daylilies and the yucca in the bed by the glass block [documented], between it and the front [assumed]
  b.newGroup();
  for (let x = GB_X0 + 1; x < GB_X0 + GB_N; x++)
    for (let z = gbZ(x) + 1; z < HOUSE[1]; z++) b.add(x, z, Y.LAWN, 1, 1, 2, (x + z) % 3 ? DAYLILY : YUCCA, 'brick');
  // R. E. Filipowski's aluminium sculpture by the entrance [documented], as a thin grey stand-in [assumed: its form and place]
  b.newGroup();
  b.column(64, -6, Y.LAWN, Y.LAWN + 15, 0xb9bec2, 'bar');
  b.add(63, -6, Y.LAWN + 15, 3, 1, 1, 0xb9bec2, 'tile');
  // pink roses on the trellises [documented]
  b.newGroup();
  for (const [x, z] of [[-9, 1], [-5, 1], [53, 31], [53, 35]]) b.add(x, z, Y.LAWN, 1, 1, 4, 0xd77a8f, 'brick');

  // the oak west of the house, on the chimney's axis [documented]
  tree(b, OAK[0], OAK[1], hm.at(OAK[0], OAK[1]), 39, [8, 12, 15, 17, 17, 16, 14, 11, 7, 3], OAK_LEAVES, 2);
  // the orchard [documented]
  for (const [x, z] of ORCHARD) tree(b, x, z, hm.at(x, z), 9, [3, 5, 5, 4, 2], APPLE);
  // the two old pines in the south field [documented; where, assumed]
  for (const [x, z] of [[-30, 150], [75, 165]]) {
    b.newGroup();
    const y = hm.at(x, z);
    b.box(x, z, x + 1, z + 1, y, y + 24, { kind: 'round', color: 0x5a4434 });
    for (let i = 0; i < 9; i++) {
      const r = 6 - i * 0.6;
      b.box(x - 6, z - 6, x + 7, z + 7, y + 24 + i * 4, y + 28 + i * 4, { kind: 'brick', color: PINE[i % 2], mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r });
    }
  }
  // the fieldstone wall along Baker Bridge Road [documented], about 3 ft high [assumed]
  b.newGroup();
  b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, -120, -80, 20, {
    kind: 'brick', color: fieldstone, mask: (x, z, y) => onRoadWall(x, z) && y >= hm.at(x, z) && y < hm.at(x, z) + 6,
  });
  // the woods round the plinth, thinning toward the lot's edges [assumed]; none in the orchard or on the drive
  const r = rng(1938);
  for (let gz = TERRAIN.z0 + 8; gz < TERRAIN.z1 - 6; gz += 20)
    for (let gx = TERRAIN.x0 + 8; gx < TERRAIN.x1 - 6; gx += 20) {
      const x = gx + Math.floor(hash2(gx, gz) * 11) - 5, z = gz + Math.floor(hash2(gz, gx) * 11) - 5;
      const pd = Math.hypot(Math.max(PLINTH[0] - x, 0, x - PLINTH[2]), Math.max(PLINTH[1] - z, 0, z - PLINTH[3]));
      if (pd < 14 || inOrchardGround(x, z) || driveDist(x, z) < 12 || nearGarage(x, z) || streetAt(x, z) || roadGap(x, z) < 16) continue;
      if (Math.hypot(x - OAK[0], z - OAK[1]) < 24 || inRect(x, z, [PORCH[0] - 10, PORCH[3], PORCH[2] + 10, PLINTH[3] + 30])) continue;
      const p = pd < 60 ? 0.8 : 0.55;
      if (hash2(x * 3, z * 7) > p) continue;
      const big = r() < 0.4;
      tree(b, x, z, hm.at(x, z), (big ? 30 : 21) + 3 * Math.floor(r() * 4), big ? [4, 6, 7, 6, 4] : [3, 5, 4, 2], [LEAVES[Math.floor(r() * 4)], LEAVES[Math.floor(r() * 4)]]);
    }
}

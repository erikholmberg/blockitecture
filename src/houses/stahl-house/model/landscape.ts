import { C } from '@/engine/catalog';
import { P } from '@/houses/stahl-house/phases';
import { Builder, hash2, rng } from '@/engine/voxel';
import { HeightMap, TERRAIN } from '@/houses/stahl-house/model/site';
import { DRIVE, inAny, inRect, PLATEAU, ROOF, Y } from '@/houses/stahl-house/model/layout';
import { buildPoolWater } from '@/houses/stahl-house/model/pool';

export function palm(b: Builder, x: number, z: number, y: number, height: number) {
  b.newGroup();
  for (let i = 0; i < height; i += 3) {
    // last segment is shortened so the trunk ends exactly where the crown starts
    const h = Math.min(3, height - i);
    b.add(x, z, y + i, 1, 1, h, i % 6 === 0 ? C.darkTan : C.dirt, 'round', { studs: false });
  }
  const t = y + height;
  b.add(x, z, t, 1, 1, 2, C.darkGreen, 'round', { studs: false });
  const fr = C.green, fr2 = C.limeGreen;
  b.add(x - 3, z, t + 2, 3, 1, 1, fr, 'plate');
  b.add(x + 1, z, t + 2, 3, 1, 1, fr, 'plate');
  b.add(x, z - 3, t + 2, 1, 3, 1, fr, 'plate');
  b.add(x, z + 1, t + 2, 1, 3, 1, fr, 'plate');
  b.add(x - 5, z, t + 1, 2, 1, 1, fr2, 'plate');
  b.add(x + 4, z, t + 1, 2, 1, 1, fr2, 'plate');
  b.add(x, z - 5, t + 1, 1, 2, 1, fr2, 'plate');
  b.add(x, z + 4, t + 1, 1, 2, 1, fr2, 'plate');
  for (const [dx, dz] of [[-2, -2], [1, -2], [-2, 1], [1, 1]]) b.add(x + dx, z + dz, t + 1, 2, 2, 1, fr, 'plate');
  b.add(x, z, t + 2, 1, 1, 1, C.reddishBrown, 'plate');
}

function shrub(b: Builder, x: number, z: number, y: number, r: () => number) {
  b.newGroup();
  const col = r() < 0.5 ? C.darkGreen : r() < 0.5 ? C.green : C.olive;
  const s = 2 + Math.floor(r() * 2);
  b.add(x, z, y, s, s, 3, col, 'brick');
  if (r() < 0.6) b.add(x, z, y + 3, Math.max(1, s - 1), Math.max(1, s - 1), 3, col, 'brick');
  if (r() < 0.3) b.add(x + s - 1, z, y + 3, 1, 1, 1, C.pink, 'plate');
}

function cypress(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.add(x, z, y, 2, 2, h, C.darkGreen, 'brick');
  b.add(x, z, y + h, 2, 2, 6, C.darkGreen, 'brick');
  b.add(x, z, y + h + 6, 1, 1, 3, C.darkGreen, 'round');
}

function chaise(b: Builder, x: number, z: number) {
  b.newGroup();
  b.add(x, z, Y.FLOOR, 1, 1, 2, C.white, 'bar');
  b.add(x + 1, z, Y.FLOOR, 1, 1, 2, C.white, 'bar');
  b.add(x, z + 5, Y.FLOOR, 1, 1, 2, C.white, 'bar');
  b.add(x + 1, z + 5, Y.FLOOR, 1, 1, 2, C.white, 'bar');
  b.box(x, z, x + 2, z + 6, Y.FLOOR + 2, Y.FLOOR + 3, { kind: 'plate', color: C.white });
  b.box(x, z + 1, x + 2, z + 6, Y.FLOOR + 3, Y.FLOOR + 4, { kind: 'tile', color: C.turquoise });
  b.add(x, z, Y.FLOOR + 3, 2, 1, 4, C.turquoise, 'tile');
}

/** A late-50s sedan, two-tone. */
function car(b: Builder, x: number, z: number) {
  const y = Y.FLOOR;
  b.newGroup();
  for (const wz of [z + 2, z + 11]) {
    b.add(x - 1, wz, y, 1, 3, 4, C.black, 'brick', { studs: false });
    b.add(x + 7, wz, y, 1, 3, 4, C.black, 'brick', { studs: false });
    b.add(x - 1, wz + 1, y + 1, 1, 1, 2, C.lightGray, 'tile');
    b.add(x + 7, wz + 1, y + 1, 1, 1, 2, C.lightGray, 'tile');
  }
  b.newGroup();
  b.box(x, z, x + 7, z + 16, y + 1, y + 3, { kind: 'plate', unit: 2, color: C.lightGray });
  b.box(x, z, x + 7, z + 16, y + 3, y + 6, { kind: 'brick', color: C.turquoise });
  b.box(x, z, x + 7, z + 16, y + 6, y + 7, {
    kind: 'tile',
    color: (_x, _y, zz) => (zz === z || zz === z + 15 ? C.lightGray : C.turquoise),
  });
  b.add(x + 1, z, y + 4, 2, 1, 1, C.warmLight, 'light');
  b.add(x + 4, z, y + 4, 2, 1, 1, C.warmLight, 'light');
  b.add(x + 1, z + 15, y + 4, 2, 1, 1, C.red, 'light');
  b.add(x + 4, z + 15, y + 4, 2, 1, 1, C.red, 'light');
  b.newGroup();
  // cabin: glass all round, white roof
  b.box(x, z + 4, x + 7, z + 11, y + 7, y + 11, {
    kind: 'glass', unit: 4, color: C.glass,
    mask: (xx, zz) => xx === x || xx === x + 6 || zz === z + 4 || zz === z + 10,
  });
  b.box(x + 1, z + 5, x + 6, z + 10, y + 7, y + 8, { kind: 'tile', color: C.white });
  b.box(x, z + 4, x + 7, z + 11, y + 11, y + 12, { kind: 'tile', color: C.white });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  buildPoolWater(b);

  // terrace furniture
  for (const x of [32, 36, 40, 44]) chaise(b, x, -11);
  b.newGroup();
  b.add(48, -10, Y.FLOOR, 4, 4, 2, C.white, 'round');
  b.box(48, -10, 52, -6, Y.FLOOR, Y.FLOOR + 1, { kind: 'tile', color: C.white });
  b.add(49, -9, Y.FLOOR + 2, 1, 1, 14, C.white, 'bar'); // the pole stands on the table (spec 012: it used to overlap it and was dropped)
  b.box(46, -12, 54, -4, Y.FLOOR + 16, Y.FLOOR + 17, {
    kind: 'tile',
    color: (x, _y, z) => ((x + z) % 2 ? C.orange : C.white),
  });
  // potted plants at the entry
  for (const [x, z] of [[24, 26], [37, 28], [54, 26], [24, -12]]) {
    b.newGroup();
    b.add(x, z, Y.FLOOR, 2, 2, 3, C.white, 'brick', { studs: false });
    b.add(x, z, Y.FLOOR + 3, 2, 2, 3, C.green, 'brick');
    b.add(x, z, Y.FLOOR + 6, 1, 1, 3, C.brightGreen, 'round');
  }

  // the car in the carport
  car(b, 5, -32);

  // hedge along the street
  b.newGroup();
  b.box(-30, -62, -26, 48, 0, 6, {
    kind: 'brick',
    mask: (_x, z) => z < DRIVE[1] - 2 || z >= DRIVE[3] + 2, // gap for the driveway (spec 004)
    color: (x, y, z) => (hash2(x * 3 + y, z >> 2) < 0.3 ? C.green : C.darkGreen),
  });
  b.box(-26, -64, 0, -60, 0, 6, { kind: 'brick', color: C.darkGreen, mask: (x) => x < -4 });
  // lawn bordering the house: a few flower beds
  b.newGroup();
  for (const [x, z] of [[-12, 4], [-18, 30], [-8, -40], [36, -30], [48, -24]]) {
    b.box(x, z, x + 4, z + 4, 0, 1, { kind: 'plate', color: C.dirt });
    b.add(x, z, 1, 1, 1, 1, C.yellow, 'plate');
    b.add(x + 2, z + 1, 1, 1, 1, 1, C.red, 'plate');
    b.add(x + 1, z + 3, 1, 1, 1, 1, C.white, 'plate');
    b.add(x + 3, z + 2, 1, 1, 1, 1, C.pink, 'plate');
  }

  // palms & cypresses on the lot
  const palms: [number, number, number][] = [
    [-14, 14, 42], [-20, -44, 48], [36, -40, 36], [-10, 44, 36], [50, -50, 44], [-16, -50, 30],
  ];
  for (const [x, z, h] of palms) palm(b, x, z, 0, h);
  for (const [x, z] of [[-24, -10], [-24, 0], [-24, 10], [-24, 20], [30, -56], [40, -56]]) cypress(b, x, z, 0, 9);

  // hillside scrub, palms on the slopes
  const r = rng(22);
  for (let i = 0; i < 520; i++) {
    const x = Math.floor(TERRAIN.x0 + 4 + r() * (TERRAIN.x1 - TERRAIN.x0 - 8));
    const z = Math.floor(TERRAIN.z0 + 4 + r() * (TERRAIN.z1 - TERRAIN.z0 - 8));
    if (inRect(x, z, [PLATEAU[0] - 2, PLATEAU[1] - 2, PLATEAU[2] + 2, PLATEAU[3] + 2])) continue;
    if (inRect(x, z, [DRIVE[0], DRIVE[1] - 3, DRIVE[2], DRIVE[3] + 3])) continue;
    if (inAny(x, z, ROOF)) continue;
    const y = hm.at(x, z);
    if (y < -390) continue;
    // stay on flat-ish terraces
    if (hm.at(x + 3, z) !== y || hm.at(x, z + 3) !== y) continue;
    if (r() < 0.06) palm(b, x, z, y, 30 + Math.floor(r() * 4) * 3);
    else shrub(b, x, z, y, r);
  }
}

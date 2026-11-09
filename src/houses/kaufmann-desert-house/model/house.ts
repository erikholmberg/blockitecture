/**
 * The Kaufmann Desert House itself (spec 033): footings and the pool's shell, the floors and terraces, the stone walls and
 * white steel posts, the gloriette's deck and its outside stair, the sliding glass walls and the louvres, and the thin flat
 * roofs with their deep overhangs. Layout and sourcing: layout.ts.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  ENTRY, GARAGE, GLORIETTE, GUEST, inRect, LIVING, LOUVRE_PITCH, MASTER, OVERHANG, POOL, POOL_TERRACE, Rect, ROOFS, SERVICE, STAIR,
  WALK, Y,
} from './layout';
import { groundPlates } from './site';

/** buff desert stone in rough horizontal courses [documented: local stone; colours assumed: photographs] */
export const STONE = [0xc9b48f, 0xbfa57c, 0xd4c09b, 0xb39a72];
export const stone = (x: number, y: number, z: number) => STONE[Math.floor(hash2(Math.floor((x + z * 3) / 5), Math.floor(y / 3)) * STONE.length)];
/** the steel posts and the fascias, painted white [documented: photographs] */
export const WHITE = 0xf1efe9;
/** the roofs' undersides [assumed] */
export const SOFFIT = 0xe8e4da;
/** the roof's top, pale gravel [assumed] */
export const ROOF_TOP = 0xd6d1c6;
/** the floors and terraces: pale concrete, the same inside and out [assumed: photographs] */
export const FLOOR = [0xdcd6c9, 0xd5cfc1, 0xe0dbcf];
export const SLAB = 0xb9b4a8;
export const GLASS = 0xdff1f5;
/** the gloriette's louvres: aluminium [documented] */
export const ALUMINIUM = 0xc6cacd;
export const PLASTER = 0xeeeae2;
export const POOL_BLUE = 0x8fcfdd;
export const GARAGE_DOOR = 0xd9d2c3;

/** the enclosed wings (the walk and the entry are open, roofed on posts) */
const ENCLOSED: Rect[] = [LIVING, MASTER, GUEST, ...SERVICE, GARAGE];
const BOX: Rect = [0, 15, 133, 134];
const BW = BOX[2] - BOX[0];
const wingOf = (x: number, z: number) => ENCLOSED.findIndex((r) => inRect(x, z, r));
/** the rooms' extent: the enclosed wings, in from the roofs' edges by the overhang */
const enclosed = (() => {
  const m = new Uint8Array(BW * (BOX[3] - BOX[1]));
  for (let z = BOX[1]; z < BOX[3]; z++)
    for (let x = BOX[0]; x < BOX[2]; x++) {
      let ok = true;
      for (let dz = -OVERHANG; dz <= OVERHANG && ok; dz++) for (let dx = -OVERHANG; dx <= OVERHANG && ok; dx++) ok = wingOf(x + dx, z + dz) >= 0;
      m[(z - BOX[1]) * BW + (x - BOX[0])] = ok ? 1 : 0;
    }
  return m;
})();
export const inRooms = (x: number, z: number) => inRect(x, z, BOX) && enclosed[(z - BOX[1]) * BW + (x - BOX[0])] === 1;

type WallKind = 'stone' | 'glass' | 'partition' | null;
const SOLID = new Set([3, 4, 5]); // the service wing and the garage: stone all round [assumed]
/**
 * What stands on a cell: the rooms' outer walls are stone where they face west or north (the wind and the afternoon sun)
 * and glass where they face south or east, to the garden and the pool [documented: glass walls; which sides assumed];
 * partitions where two wings meet, with doorways.
 */
export function wallAt(x: number, z: number): WallKind {
  if (!inRooms(x, z)) return null;
  const w = !inRooms(x - 1, z), n = !inRooms(x, z - 1), e = !inRooms(x + 1, z), s = !inRooms(x, z + 1);
  if (w || n || e || s) return SOLID.has(wingOf(x, z)) || w || n ? 'stone' : 'glass';
  const id = wingOf(x, z);
  for (const [dx, dz] of [[1, 0], [0, 1]]) {
    const o = wingOf(x + dx, z + dz);
    if (o >= 0 && o !== id && inRooms(x + dx, z + dz)) return (x + z) % 12 < 4 ? null : 'partition';
  }
  return null;
}
/** the white steel posts in the glass walls: at their ends and every 8 ft [assumed] */
const isPost = (x: number, z: number) => {
  if (wallAt(x, z) !== 'glass') return false;
  const along = !inRooms(x, z - 1) || !inRooms(x, z + 1) ? x : z;
  return along % 8 === 0 || [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dz]) => wallAt(x + dx, z + dz) === 'glass').length < 2;
};

/** windows in the stone walls of the service wing and the garage: a band, every 10 ft [assumed] */
const isWindow = (x: number, y: number, z: number) => SOLID.has(wingOf(x, z)) && y >= 9 && y < 18 && (x + z) % 10 < 4 && !inRect(x, z, [GARAGE[0], GARAGE[3] - OVERHANG - 1, GARAGE[2], GARAGE[3]]);
/** the garage doors, in its south wall onto the drive [assumed] */
const isGarageDoor = (x: number, y: number, z: number) => z === GARAGE[3] - OVERHANG - 1 && x >= 30 && x < 50 && y < 18;

/** the footings: a concrete course under every roof (foundation), and the pool's shell */
export function buildFoundations(b: Builder) {
  b.setPhase(P.FOUNDATION);
  for (const r of ROOFS) b.box(r[0], r[1], r[2], r[3], -6, -3, { kind: 'brick', color: SLAB });
  // the pool: plastered walls and floor [documented: the pool; depth assumed]
  b.newGroup();
  const [x0, z0, x1, z1] = POOL;
  b.box(x0 - 1, z0 - 1, x1 + 1, z1 + 1, Y.POOL_FLOOR - 3, -3, {
    kind: 'brick', color: POOL_BLUE,
    mask: (x, z, y) => y < Y.POOL_FLOOR || x < x0 || x >= x1 || z < z0 || z >= z1,
  });
}

/** the floors under every roof, and the terraces round the pool, all one pale concrete (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  const floored = (x: number, z: number) => (ROOFS.some((r) => inRect(x, z, r)) || inRect(x, z, POOL_TERRACE)) && !inRect(x, z, POOL);
  const [x0, z0, x1, z1] = [0, 15, 166, 134];
  b.box(x0, z0, x1, z1, -3, -1, { kind: 'plate', color: SLAB, mask: (x, z) => floored(x, z) });
  b.box(x0, z0, x1, z1, -1, 0, {
    kind: 'tile', mask: (x, z) => floored(x, z),
    color: (x, _y, z) => (inRect(x, z, [POOL[0] - 1, POOL[1] - 1, POOL[2] + 1, POOL[3] + 1]) ? WHITE : FLOOR[Math.floor(hash2(x >> 2, z >> 2) * 3)]),
  });
}

/** the stone walls, the steel posts, the partitions; the gloriette's deck, its posts, fireplace and stair (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  b.box(BOX[0], BOX[1], BOX[2], BOX[3], Y.FLOOR, Y.CEILING, {
    kind: 'brick',
    mask: (x, z, y) => {
      const w = wallAt(x, z);
      if (w === 'stone') return ![0, 1, 2].some((k) => isWindow(x, y + k, z) || isGarageDoor(x, y + k, z));
      return w === 'partition' || isPost(x, z);
    },
    color: (x, y, z) => (wallAt(x, z) === 'stone' ? stone(x, y, z) : wallAt(x, z) === 'partition' ? PLASTER : WHITE),
  });
  // the open walk and the entry: white steel posts holding their roofs [assumed: spacing]
  b.newGroup();
  for (const [x0, z0, x1, z1] of [WALK, ENTRY]) {
    for (const x of [x0 + 1, x1 - 2])
      for (let z = z0 + 2; z < z1 - 3; z += 8) if (!inRooms(x, z)) b.box(x, z, x + 1, z + 1, Y.FLOOR, Y.CEILING, { kind: 'brick', color: WHITE });
  }
  // the gloriette's deck: the roof over the living room where the gloriette stands [documented]
  b.newGroup();
  roofSlab(b, GLORIETTE, () => true);
  const [gx0, gz0, gx1, gz1] = GLORIETTE;
  // its posts at the open corners, and its stone fireplace in the north-west corner [documented: fireplace; place assumed]
  for (const [x, z] of [[gx1 - 1, gz0], [gx1 - 1, gz1 - 1], [gx0, gz1 - 1]]) b.box(x, z, x + 1, z + 1, Y.ROOF, Y.GLORIETTE, { kind: 'brick', color: WHITE });
  b.box(gx0 + 1, gz0 + 1, gx0 + 5, gz0 + 4, Y.ROOF, Y.GLORIETTE + 6, { kind: 'brick', color: stone });
  // the stair up to it from the court, stone steps [assumed]
  b.newGroup();
  const [sx0, sz0, sx1, sz1] = STAIR;
  for (let z = sz0; z < sz1; z++) {
    const top = Math.min(Y.ROOF, 3 * (z - sz0 + 1));
    b.box(sx0, z, sx1, z + 1, groundPlates(sx0, z), top - 1, { kind: 'brick', color: stone });
    b.box(sx0, z, sx1, z + 1, top - 1, top, { kind: 'tile', color: (x, _y, zz) => FLOOR[Math.floor(hash2(x, zz) * 3)] });
  }
}

/** the glass walls, the windows, the garage doors; the gloriette's louvres (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  b.box(BOX[0], BOX[1], BOX[2], BOX[3], Y.FLOOR, Y.CEILING, {
    kind: 'glass', color: GLASS,
    mask: (x, z, y) => (wallAt(x, z) === 'glass' && !isPost(x, z)) || (wallAt(x, z) === 'stone' && isWindow(x, y, z)),
  });
  b.box(GARAGE[0], GARAGE[1], GARAGE[2], GARAGE[3], Y.FLOOR, 18, { kind: 'brick', color: GARAGE_DOOR, mask: (x, z, y) => wallAt(x, z) === 'stone' && isGarageDoor(x, y, z) });
  // the louvres: tall vertical aluminium blades along the gloriette's west and north sides [documented]
  b.newGroup();
  const [gx0, gz0, gx1, gz1] = GLORIETTE;
  for (let z = gz0 + 1; z < gz1 - 1; z += LOUVRE_PITCH) b.box(gx0, z, gx0 + 1, z + 1, Y.ROOF, Y.GLORIETTE, { kind: 'brick', color: ALUMINIUM });
  for (let x = gx0 + 6; x < gx1 - 1; x += LOUVRE_PITCH) b.box(x, gz0, x + 1, gz0 + 1, Y.ROOF, Y.GLORIETTE, { kind: 'brick', color: ALUMINIUM });
}

/** a thin flat roof over the cells of r that pass: a white fascia round its edge, a soffit under it, gravel on top */
function roofSlab(b: Builder, r: Rect, keep: (x: number, z: number) => boolean, y0 = Y.CEILING, top = Y.ROOF) {
  const covered = (x: number, z: number) => ROOFS.some((q) => inRect(x, z, q));
  const edge = (x: number, z: number) => !covered(x - 1, z) || !covered(x + 1, z) || !covered(x, z - 1) || !covered(x, z + 1);
  b.box(r[0], r[1], r[2], r[3], y0, top - 1, { kind: 'plate', mask: (x, z) => keep(x, z), color: (x, _y, z) => (edge(x, z) ? WHITE : SOFFIT) });
  b.box(r[0], r[1], r[2], r[3], top - 1, top, { kind: 'tile', mask: (x, z) => keep(x, z), color: (x, _y, z) => (edge(x, z) ? WHITE : ROOF_TOP) });
}

/** the thin flat roofs over every wing, the walk and the entry, and the gloriette's canopy (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  for (const r of ROOFS) {
    b.newGroup();
    roofSlab(b, r, (x, z) => !inRect(x, z, GLORIETTE));
  }
  b.newGroup();
  const [gx0, gz0, gx1, gz1] = GLORIETTE;
  b.box(gx0, gz0, gx1, gz1, Y.GLORIETTE, Y.GLORIETTE + 2, { kind: 'plate', color: WHITE });
}

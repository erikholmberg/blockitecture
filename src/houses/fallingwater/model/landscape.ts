/**
 * Fallingwater's landscape (spec 017 Q3–Q5): last of all the water arrives (Bear Run fills its bed, the falls start, foam
 * at their foot), then the forest: rhododendron thickets along the banks, hemlocks and hardwoods (oak, maple, tulip
 * poplar) on the slopes, in summer green, kept clear of the house and of the classic view from downstream.
 */
import { C } from '@/engine/catalog';
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import {
  BRIDGE, CANOPY, DRIVE, GUEST_WINGS, inAny, Rect, ROOF, TRAY1, TRAY2, TRAY3, TRELLIS_TREES, WALK_HALF, Y,
} from './layout';
import { halfWidth, HeightMap, streamAt, TERRAIN, waterAt, waterLevel, walkwayAt } from './site';

const WATER_UP = 0x8fc4c9; // Bear Run above the falls: clear, a little green
const WATER_POOL = 0x6aa3b3; // the deeper pool below them
const FOAM = 0xeaf4f4;

/**
 * Bear Run: one water piece per rectangle of cells with the same bed and surface (greedy merge), so the surface is a
 * single sheet with no stacked transparent layers.
 */
function buildWater(b: Builder, hm: HeightMap) {
  b.newGroup();
  const { x0, z0, x1, z1 } = TERRAIN;
  const W = x1 - x0, D = z1 - z0;
  const key = new Int32Array(W * D).fill(-1);
  const info: { bed: number; top: number; color: number }[] = [];
  const ids = new Map<string, number>();
  for (let z = z0; z < z1; z++)
    for (let x = x0; x < x1; x++) {
      const bed = hm.at(x, z), top = waterAt(x, z, bed);
      if (top === null || !b.free(x, z, bed, top)) continue;
      const { along } = streamAt(x, z);
      const color = along > 1.5 && along < 6 ? FOAM : along > 0 ? WATER_POOL : WATER_UP;
      const k = `${bed},${top},${color}`;
      let id = ids.get(k);
      if (id === undefined) { id = info.length; ids.set(k, id); info.push({ bed, top, color }); }
      key[(z - z0) * W + (x - x0)] = id;
    }
  const used = new Uint8Array(W * D);
  for (let iz = 0; iz < D; iz++)
    for (let ix = 0; ix < W; ix++) {
      const k = iz * W + ix, id = key[k];
      if (id < 0 || used[k]) continue;
      let w = 1;
      while (ix + w < W && key[k + w] === id && !used[k + w] && w < 32) w++;
      let d = 1;
      grow: while (iz + d < D && d < 32) {
        for (let i = 0; i < w; i++) { const kk = (iz + d) * W + ix + i; if (key[kk] !== id || used[kk]) break grow; }
        d++;
      }
      for (let j = 0; j < d; j++) for (let i = 0; i < w; i++) used[(iz + j) * W + ix + i] = 1;
      const { bed, top, color } = info[id];
      b.add(x0 + ix, z0 + iz, bed, w, d, top - bed, color, 'water');
    }
}

/** the upper falls: a sheet of falling water over the ledge, from Bear Run down to the pool [documented: sheet 7] */
function buildFalls(b: Builder, hm: HeightMap) {
  b.newGroup();
  const { x0, z0, x1, z1 } = TERRAIN;
  for (let z = z0; z < z1; z++)
    for (let x = x0; x < x1; x++) {
      const { d, along } = streamAt(x, z);
      if (along < 0 || along >= 1.6 || d > halfWidth(-1)) continue;
      const lo = waterLevel(along), hi = Y.STREAM;
      if (hm.at(x, z) > lo || !b.free(x, z, lo, hi)) continue;
      b.add(x, z, lo, 1, 1, hi - lo, FOAM, 'falls');
    }
}

// ---------- the forest ----------
const HEMLOCK = [0x1f3d2b, 0x24452f, 0x1b3626];
const HARDWOOD = [0x3d6b35, 0x4f7a3a, 0x5c8a3f, 0x46733a];
const RHODO = [0x2c4a2a, 0x335433];
const BLOOM = [0xf2c4d2, 0xf7e1e6, 0xe9a8bd];

/** a hemlock: a dark cone of shrinking layers on a short trunk */
function hemlock(b: Builder, x: number, z: number, y: number, r: () => number) {
  b.newGroup();
  const h = 45 + 3 * Math.floor(r() * 12), trunk = 9;
  b.column(x, z, y, y + trunk, C.reddishBrown, 'round');
  const layers = Math.floor((h - trunk) / 3);
  for (let i = 0; i < layers; i++) {
    const s = Math.max(1, Math.round(7 * (1 - i / layers))) | 1;
    const cy = y + trunk + i * 3, o = (s - 1) / 2;
    b.box(x - o, z - o, x - o + s, z - o + s, cy, cy + 3, { kind: 'brick', color: HEMLOCK[i % HEMLOCK.length] });
  }
}

/** a hardwood: a tall trunk and a broad, layered crown */
function hardwood(b: Builder, x: number, z: number, y: number, r: () => number) {
  b.newGroup();
  const trunk = 24 + 3 * Math.floor(r() * 8), w = 7 + 2 * Math.floor(r() * 3);
  b.column(x, z, y, y + trunk, C.darkWood, 'round');
  const col = HARDWOOD[Math.floor(r() * HARDWOOD.length)];
  const sizes = [w - 2, w, w, w - 2, w - 4];
  sizes.forEach((s, i) => {
    if (s < 3) return;
    const o = (s - 1) >> 1, cy = y + trunk + i * 3;
    b.box(x - o, z - o, x - o + s, z - o + s, cy, cy + 3, { kind: 'brick', color: i % 2 ? HARDWOOD[(i + 1) % HARDWOOD.length] : col });
  });
}

/** a rhododendron: a low, dense, dark mound with a few pale blooms (they flower in early summer) */
function rhododendron(b: Builder, x: number, z: number, y: number, r: () => number) {
  b.newGroup();
  const w = 3 + Math.floor(r() * 4), o = w >> 1;
  b.box(x - o, z - o, x - o + w, z - o + w, y, y + 3, { kind: 'brick', color: RHODO[0] });
  b.box(x - o + 1, z - o + 1, x - o + w - 1, z - o + w - 1, y + 3, y + 6, { kind: 'brick', color: RHODO[1] });
  for (let i = 0; i < 2; i++) {
    const bx = x - o + 1 + Math.floor(r() * Math.max(1, w - 2)), bz = z - o + 1 + Math.floor(r() * Math.max(1, w - 2));
    if (b.free(bx, bz, y + 6, y + 7)) b.add(bx, bz, y + 6, 1, 1, 1, BLOOM[Math.floor(r() * BLOOM.length)], 'plate');
  }
}

const grow = (r: Rect, m: number): Rect => [r[0] - m, r[1] - m, r[2] + m, r[3] + m];
/** where no tree may stand: the house and its roofs, the drive, the bridge, the guest wing, the walkway */
const KEEP_CLEAR: Rect[] = [
  ...[...TRAY1, ...TRAY2, ...TRAY3, ...CANOPY, ROOF].map((r) => grow(r, 4)),
  grow(DRIVE, 2), grow(BRIDGE, 3), ...GUEST_WINGS.map((r) => grow(r, 5)),
  // the classic view from downstream, below the falls, looking up at the terraces [Overview and "the classic view"]
  [-40, 70, 40, 150],
];

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the water arrives first
  buildWater(b, hm);
  buildFalls(b, hm);

  // the two trees the drive's trellis was bent around [documented: sheet 4]
  const r = rng(1937);
  for (const [x, z] of TRELLIS_TREES) hardwood(b, x, z, hm.at(x, z), r);

  // the forest: a jittered grid, the kind of tree by where it stands
  const STEP = 13;
  for (let gz = TERRAIN.z0 + 4; gz < TERRAIN.z1 - 2; gz += STEP)
    for (let gx = TERRAIN.x0 + 4; gx < TERRAIN.x1 - 2; gx += STEP) {
      const x = gx + Math.floor(hash2(gx, gz) * 9) - 4, z = gz + Math.floor(hash2(gz, gx) * 9) - 4;
      if (inAny(x, z, KEEP_CLEAR) || walkwayAt(x, z).d < WALK_HALF + 4) continue;
      const y = hm.at(x, z);
      const { d, along } = streamAt(x, z);
      if (waterAt(x, z, y) !== null || d < halfWidth(along) + 2) continue;
      const t = hash2(x * 7, z * 13);
      if (d < halfWidth(along) + 16) {
        // the banks: rhododendron thickets, and hemlocks that like the cool ravine
        if (t < 0.65) rhododendron(b, x, z, y, r); else hemlock(b, x, z, y, r);
      } else if (t < 0.12) continue; // a few gaps
      else if (t < 0.45) hemlock(b, x, z, y, r);
      else if (t < 0.85) hardwood(b, x, z, y, r);
      else rhododendron(b, x, z, y, r);
    }
}

/**
 * The Salk Institute's landscape (spec 079): the "River of Life" [documented: OSM way 60739892; its water one plate under the
 * travertine assumed], the basins and the cascades at the west end [documented: OSM; the falls assumed]; the citrus grove's clipped
 * orange trees on OSM's 50 tree nodes [documented]; the light wells' trees in planters [documented: the light-well photographs];
 * the lower level's planters [documented: OSM's gardens]; the lawns either side of the wings [documented: OSM's grass and
 * gardens]; the eucalyptus round the lot [documented: the site was a eucalyptus grove; OSM's tree nodes east of the grove;
 * the rest of their places assumed]; the coastal scrub on the mesa's edge [documented: TCLF; its places assumed]; and the lot's
 * one other OSM building as plain massing [documented: its outline].
 */
import { plainNeighbour } from '@/engine/lot';
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { BASIN1, BASIN2, both as bothRects, CHANNEL, GROVE, inAny, inRect, LIGHT_WELLS, PLANTERS, Rect, SOURCE, Y } from './layout';
import { FALLS1_X, FALLS2_X, FALLS_HALF } from './house';
import { LOT_BUILDINGS } from './lotTerrain';
import { BASIN3, HeightMap, isScrubGround, solid, streetAt, TERRAIN } from './site';
import { codeAt } from './plan';

export const WATER = 0x5f9fb4;
const BIG = [[16, 16], [16, 8], [8, 8], [8, 4], [4, 4], [8, 2], [4, 2], [2, 2], [8, 1], [4, 1], [2, 1], [1, 1]];
const LAWN = [0x6f9a4a, 0x77a352, 0x67904a];
const ORANGE_LEAF = [0x2e5b2b, 0x356632], ORANGE = 0xe9822a, TRUNK = 0x5b4636;
const EUC_BARK = 0xcfc4b2, EUC_LEAF = [0x7f9473, 0x71876a, 0x8c9d7c];
const SCRUB = [0x6b7548, 0x7a8152, 0x8d8a5e, 0x5e6a44];

/** OSM's tree nodes in the lot [documented: OpenStreetMap; the 50 in the gardens are the grove's Valencia oranges] */
export const OSM_TREES: [number, number][] = [[44, 13.2], [32.1, 13], [21.6, 13], [10.7, 12.9], [10.4, 23.8], [21.3, 23.9], [31.8, 24], [43.7, 24.1],
  [43.4, 35.3], [11.1, 35], [10.8, 45.9], [21.4, 57.2], [21.7, 46], [22, 35.1], [32.5, 35.2], [32.2, 46.1], [31.9, 57.3], [43.8, 57.4], [44.1, 46.2],
  [21.1, 78.6], [21.4, 67.5], [31.9, 67.6], [31.5, 78.7], [43.5, 78.8], [43.8, 67.7], [11.2, -37.7], [10.9, -26.8], [10.6, -15.6], [21.5, -15.5],
  [21.8, -26.7], [22.1, -37.6], [32.6, -37.5], [32.3, -26.6], [32, -15.4], [43.9, -15.3], [44.2, -26.5], [44.5, -37.4], [10.7, -47.5], [21.6, -47.4],
  [22, -58.6], [22.3, -69.5], [32.7, -69.4], [32.4, -58.5], [32.1, -47.3], [44, -47.2], [44.4, -58.4], [44.6, -69.3], [22.2, -80.2], [44.5, -80],
  [32.6, -80.1], [-34.4, 29], [-26.1, 47.6], [-36.1, 60.5], [-28.7, -45], [-37.3, -89.5], [-30.4, -113.7]];
export const inGrove = (x: number, z: number) => inAny(x, z, GROVE);

/** a clipped orange tree [documented: semi-dwarf Valencia oranges, clipped]: a short trunk and a round, dark crown with fruit */
function orange(b: Builder, x: number, z: number, y: number) {
  b.newGroup();
  b.add(x, z, y, 1, 1, 4, TRUNK, 'round');
  const layers: [number, number][] = [[2, 3], [3, 3], [2, 3]];
  let yy = y + 4;
  for (const [r, h] of layers) {
    b.box(x - r, z - r, x + r + 1, z + r + 1, yy, yy + h, {
      kind: 'brick', unit: h, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.4,
      color: (xx, y3, zz) => (hash2(xx * 5 + y3, zz * 3) < 0.12 ? ORANGE : ORANGE_LEAF[(y3 >> 1) & 1]),
    });
    yy += h;
  }
}

/** a eucalyptus [documented: the grove planted for lumber; assumed: its form]: a tall pale trunk and a high, open crown */
function eucalyptus(b: Builder, x: number, z: number, y: number, seed: number) {
  const r = rng(seed);
  const h = 70 + Math.floor(r() * 40); // 28-44 ft
  b.newGroup();
  for (let yy = y; yy < y + h; yy += 30) b.add(x, z, yy, 1, 1, Math.min(30, y + h - yy), EUC_BARK, 'round');
  // three or four clumps of leaves round the top, open between them
  const n = 3 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r(), d = 2 + r() * 3;
    const cx = Math.round(x + Math.cos(a) * d), cz = Math.round(z + Math.sin(a) * d), cy = y + h - 12 + Math.floor(r() * 12), rr = 2 + Math.floor(r() * 2);
    b.box(cx - rr, cz - rr, cx + rr + 1, cz + rr + 1, cy, cy + 6, {
      kind: 'brick', unit: 3, mask: (xx, zz) => Math.hypot(xx - cx, zz - cz) <= rr + 0.3, color: EUC_LEAF[i % 3],
    });
  }
  b.box(x - 1, z - 1, x + 2, z + 2, y + h, y + h + 3, { kind: 'brick', unit: 3, color: EUC_LEAF[0] });
}

/** a planter's small tree [assumed: the light wells' and the lower level's] */
function smallTree(b: Builder, x: number, z: number, y: number) {
  b.newGroup();
  b.add(x, z, y, 1, 1, 12, TRUNK, 'round');
  b.box(x - 2, z - 2, x + 3, z + 3, y + 12, y + 18, { kind: 'brick', unit: 3, mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= 2.4, color: 0x4f7a3f });
  b.box(x - 1, z - 1, x + 2, z + 2, y + 18, y + 21, { kind: 'brick', unit: 3, color: 0x5b8746 });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the channel's water, from the source at its east end [documented]
  b.newGroup();
  b.box(SOURCE[0], SOURCE[1], CHANNEL[2], SOURCE[3], Y.CHANNEL_WATER - 2, Y.CHANNEL_WATER, {
    kind: 'water', unit: 2, color: WATER, mask: (x, z) => inRect(x, z, SOURCE) || inRect(x, z, CHANNEL),
  });
  // the basins [documented] and the falls between them [documented: falls over a lip, spills again]
  for (const [r, wy] of [[BASIN1, Y.BASIN1_WATER], [BASIN2, Y.BASIN2_WATER], [BASIN3, Y.LANDING - 1]] as [Rect, number][]) {
    b.newGroup();
    b.box(r[0], r[1], r[2], r[3], wy - (r === BASIN3 ? 2 : 4), wy, { kind: 'water', unit: r === BASIN3 ? 2 : 4, color: WATER });
  }
  b.newGroup();
  b.box(FALLS1_X, -FALLS_HALF, FALLS1_X + 1, FALLS_HALF, Y.BASIN2_WATER, Y.BASIN1_WATER, { kind: 'falls', unit: Y.BASIN1_WATER - Y.BASIN2_WATER, color: WATER });
  b.box(FALLS2_X, -4, FALLS2_X + 1, 4, Y.LANDING, Y.BASIN2_WATER + 7, { kind: 'falls', unit: Y.BASIN2_WATER + 7 - Y.LANDING, color: WATER });

  // the lawns either side of the wings [documented: OSM's grass and gardens north and south], in patches of three greens
  b.newGroup();
  for (const r of bothRects([[-30, 198, 314, 228]]))
    b.box(r[0], r[1], r[2], r[3], -1, 0, {
      kind: 'plate', unit: 1, sizes: BIG, color: (x, _y, z) => LAWN[Math.floor(hash2(x >> 3, z >> 3) * 3)],
      mask: (x, z) => hm.at(x, z) === -1 && !streetAt(x, z),
    });

  // the citrus grove [documented: OSM's 50 tree nodes in the two gardens], the eucalyptus [documented: OSM's other nodes]
  for (const [tx, tz] of OSM_TREES) {
    const x = Math.round(tx), z = Math.round(tz);
    if (inGrove(x, z)) orange(b, x, z, Y.GROVE);
    else if (!solid(x, z)) eucalyptus(b, x, z, hm.at(x, z), x * 31 + z);
  }
  // the grove's hedge-like ground cover under the trees [assumed]: the gardens' beds
  b.newGroup();
  for (const r of GROVE)
    b.box(r[0], r[1], r[2], r[3], Y.GROVE - 1, Y.GROVE, { kind: 'plate', unit: 1, sizes: BIG, color: (x, _y, z) => LAWN[Math.floor(hash2(x >> 3, z >> 3) * 3)] });

  // the light wells' trees in planters [documented: the light-well photographs; one to a well, assumed]
  for (const w of bothRects(LIGHT_WELLS)) {
    const cx = Math.floor((w[0] + w[2]) / 2) + 6, cz = w[1] > 0 ? w[1] + 16 : w[3] - 17;
    b.newGroup();
    b.box(cx - 2, cz - 2, cx + 3, cz + 3, Y.LOWEST, Y.LOWEST + 5, { kind: 'brick', unit: 5, color: 0xb7aca3, mask: (x, z) => Math.abs(x - cx) === 2 || Math.abs(z - cz) === 2 });
    b.box(cx - 1, cz - 1, cx + 2, cz + 2, Y.LOWEST, Y.LOWEST + 4, { kind: 'brick', unit: 4, color: 0x6b5a45 });
    smallTree(b, cx, cz, Y.LOWEST + 4);
  }
  // the lower level's planters [documented: OSM's gardens]: shrubs, a small tree in the square ones [assumed]
  for (const p of PLANTERS) {
    b.newGroup();
    b.box(p[0], p[1], p[2], p[3], Y.LANDING - 1, Y.LANDING + 2, { kind: 'brick', unit: 3, color: (x, _y, z) => SCRUB[Math.floor(hash2(x, z) * 4)], mask: (x, z) => x < 362 && codeAt(x, z) === 0 });
    if (p[2] - p[0] < 10 && p[3] - p[1] < 10) smallTree(b, Math.floor((p[0] + p[2]) / 2), Math.floor((p[1] + p[3]) / 2), Y.LANDING + 2);
  }

  // the eucalyptus round the lot [documented: a grove that hid the site; assumed: these places], in rows along the lawns' outer
  // edges and the lot's east side, clear of the buildings
  const ok = (x: number, z: number) => !solid(x, z) && !streetAt(x, z) && x > TERRAIN.x0 + 3 && x < TERRAIN.x1 - 3 && z > TERRAIN.z0 + 3 && z < TERRAIN.z1 - 3
    && codeAt(x, z) === 0 && b.free(x, z, hm.at(x, z), hm.at(x, z) + 60);
  for (let x = -20; x < 360; x += 26)
    for (const z0 of [221, -222]) {
      const x1 = x + Math.floor(hash2(x, z0) * 9), z1 = z0 + Math.floor(hash2(z0, x) * 7) - 3;
      if (ok(x1, z1)) eucalyptus(b, x1, z1, hm.at(x1, z1), x1 * 7 + z1);
    }
  for (let z = -200; z < 200; z += 30) {
    const x1 = -30 + Math.floor(hash2(z, 3) * 12), z1 = z + Math.floor(hash2(3, z) * 10);
    if (Math.abs(z1) > 95 && ok(x1, z1)) eucalyptus(b, x1, z1, hm.at(x1, z1), x1 * 11 + z1);
  }

  // coastal sage scrub and chaparral on the mesa's edge, west of the wings [documented: TCLF; assumed: its places]
  const r = rng(1965);
  for (let gz = TERRAIN.z0 + 4; gz < TERRAIN.z1 - 4; gz += 7)
    for (let gx = TERRAIN.x0 + 4; gx < TERRAIN.x1 - 4; gx += 7) {
      const x = gx + Math.floor(hash2(gx, gz) * 5) - 2, z = gz + Math.floor(hash2(gz, gx) * 5) - 2;
      if (!isScrubGround(x, z) || hash2(x * 3, z * 7) > 0.55 || !ok(x, z)) continue;
      const y = hm.at(x, z), s = 2 + Math.floor(r() * 2);
      b.newGroup();
      b.box(x, z, x + s, z + s, y, y + 3, { kind: 'brick', unit: 3, color: SCRUB[Math.floor(r() * 4)] });
    }

  // the lot's other OSM building [documented: its outline]: plain massing [assumed: its height]
  for (const bl of LOT_BUILDINGS) {
    const xs = bl.ring.map((p) => p[0]), zs = bl.ring.map((p) => p[1]);
    const g = hm.at((Math.min(...xs) + Math.max(...xs)) / 2, Math.min((Math.min(...zs) + Math.max(...zs)) / 2, TERRAIN.z1 - 1));
    plainNeighbour(b, bl.ring, g, g + 30, {
      wall: [0xd9d4ca, 0xcfc9bd], window: 0x3d464c, roof: 0x8f8a83,
      keep: (x, z) => inRect(x, z, [TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1]),
    });
  }
}

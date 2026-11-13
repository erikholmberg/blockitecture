/**
 * Taliesin West's landscape (spec 077): the Prow Pool's water and the Kiva Fountain's [documented: OSM]; the petroglyph boulder on
 * Indian Rock Terrace [documented; as a plain stone, spec 077 Out of scope]; OSM's trees [documented: their places], the citrus
 * grove north of the spine [documented: Wikipedia; its trees from OSM]; the desert round about [assumed: saguaro, palo verde,
 * creosote, barrel cactus and boulders, as the Kaufmann Desert House's]; and the lot's two other OSM buildings (Wright's office
 * and the court north-east of the Kiva) as plain massing [documented: their outlines; spec 077 Out of scope].
 */
import { plainNeighbour } from '@/engine/lot';
import { Builder, hash2, rng } from '@/engine/voxel';
import { P } from '../phases';
import { CORE, inAny, inPool, inRect, INDIAN_ROCK, PERGOLA, PATIO, Rect, RILL, ROCK_TIERS, Y } from './layout';
import { CONCRETE, masonry } from './house';
import { LOT_BUILDINGS } from './lotTerrain';
import { HeightMap, LAWN, OSM_TREES, onTerraceGround, onWalk, SPINE, streetAt, TERRAIN, inTerracePoly } from './site';

export const WATER = 0x6fb8c8;
const ROCK = [0x9a7f66, 0x8a705a, 0xa88d70];
/** the core's own OSM ways (modelled as buildings); every other OSM building in the lot is plain massing */
export const CORE_WAYS = [1498897834, 1498902778, 1498902779, 1498902780, 1498902781, 1498906503, 1498906504, 1498906505, 1498910891];

/** a desert tree: a short trunk, a wide flat crown [assumed: palo verde and mesquite]; citrus: a round, dark crown with fruit */
function tree(b: Builder, x: number, z: number, y: number, citrus: boolean) {
  b.newGroup();
  const h = citrus ? 6 : 9;
  b.column(x, z, y, y + h, citrus ? 0x5a4636 : 0x8a9a5a, 'round');
  const rs = citrus ? [3, 4, 3] : [3, 5, 5, 3];
  const greens = citrus ? [0x2f5a2c, 0x376433] : [0x9fae5a, 0x8fa052];
  rs.forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + h + i * 3, y + h + 3 + i * 3, {
      kind: 'brick', mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3,
      color: (xx, yy, zz) => (citrus && hash2(xx * 3 + yy, zz) < 0.08 ? 0xe08a1e : greens[i % 2]),
    }));
}

/** a saguaro: a tall ribbed column and one or two arms [assumed] */
function saguaro(b: Builder, x: number, z: number, y: number, h: number, arms: number) {
  b.newGroup();
  const G = 0x5f7d48;
  b.column(x, z, y, y + h, G, 'round');
  const a = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(hash2(x, z) * 4)];
  for (let i = 0; i < arms; i++) {
    const s = i === 0 ? 1 : -1, ax = x + a[0] * s, az = z + a[1] * s, ay = y + 9 + 6 * i;
    b.add(ax, az, ay, 1, 1, 3, G, 'round');
    b.column(x + 2 * a[0] * s, z + 2 * a[1] * s, ay, ay + 12, G, 'round');
  }
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // Sunset Terrace's lawn [documented: the rest of the terrace is lawn], in patches of three greens [assumed]
  b.newGroup();
  b.box(-10, 30, 210, 175, Y.TERRACE, Y.TERRACE + 1, {
    kind: 'plate', color: (x, _y, z) => LAWN[Math.floor(hash2(x >> 2, z >> 2) * LAWN.length)], mask: (x, z) => onTerraceGround(x, z) && !onWalk(x, z),
  });
  // the Prow Pool's water [documented], at one level
  b.newGroup();
  b.box(48, 64, 96, 112, Y.POOL_FLOOR + 1, Y.POOL_WATER, { kind: 'water', unit: Y.POOL_WATER - Y.POOL_FLOOR - 1, color: WATER, mask: (x, z) => inPool(x, z) });
  // the Kiva Fountain's rill [documented]
  b.newGroup();
  b.box(RILL[0] + 1, RILL[1] + 1, RILL[2] - 1, RILL[3] - 1, -2, -1, { kind: 'water', unit: 1, color: WATER });
  // the petroglyph boulder on Indian Rock Terrace [documented], a plain stone [assumed: its size]
  b.newGroup();
  const top = Y.TERRACE + 3 * ROCK_TIERS;
  const [ix0, iz0, ix1, iz1] = INDIAN_ROCK, c = 2 * (ROCK_TIERS - 1);
  b.box(ix0 + c + 1, iz0 + c + 1, ix1 - c - 1, iz1 - c - 1, top, top + 3, { kind: 'brick', color: ROCK[0] });
  b.box(ix0 + c + 2, iz0 + c + 2, ix1 - c - 2, iz1 - c - 3, top + 3, top + 6, { kind: 'brick', color: ROCK[1] });
  b.box(ix0 + c + 3, iz0 + c + 3, ix1 - c - 4, iz1 - c - 4, top + 6, top + 8, { kind: 'brick', color: 0x5d4a3c });

  // the lot's other OSM buildings: plain, low desert masonry [assumed: their look and height]
  for (const bl of LOT_BUILDINGS) {
    if (CORE_WAYS.includes(bl.id)) continue;
    const xs = bl.ring.map((p) => p[0]), zs = bl.ring.map((p) => p[1]);
    const g = hm.at((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2);
    plainNeighbour(b, bl.ring, g, g + 30, {
      wall: [CONCRETE, masonry(0, 3, 0), masonry(7, 3, 1)], window: 0xbcd2d8, roof: 0xe9e1d0, storey: 30,
      keep: (x, z) => !CORE.some((k) => inAny(x, z, k.rects)) && inRect(x, z, [TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1]),
    });
  }

  const nearCore = (x: number, z: number, m: number) => CORE.some((k) => k.rects.some((r) => inRect(x, z, [r[0] - m, r[1] - m, r[2] + m, r[3] + m] as Rect)));
  const inBuildingOSM = (x: number, z: number) => LOT_BUILDINGS.some((bl) => !CORE_WAYS.includes(bl.id) && inPolyRing(x, z, bl.ring));
  const clear = (x: number, z: number, r: number) => {
    for (const [dx, dz] of [[0, 0], [-r, -r], [r, -r], [-r, r], [r, r]]) {
      const px = x + dx, pz = z + dz;
      if (px < TERRAIN.x0 + 3 || pz < TERRAIN.z0 + 3 || px >= TERRAIN.x1 - 3 || pz >= TERRAIN.z1 - 3) return false;
      if (nearCore(px, pz, 3) || streetAt(px, pz) || onWalk(px, pz) || inRect(px, pz, PERGOLA) || inRect(px, pz, PATIO) || inBuildingOSM(px, pz)) return false;
      if (inTerracePoly(px, pz) || inPool(px, pz) || inRect(px, pz, RILL)) return false;
    }
    return b.free(x, z, hm.at(x, z), hm.at(x, z) + 30);
  };

  // OSM's trees [documented]: citrus in the grove north of the spine [documented: north-east of the main building], desert
  // trees elsewhere [assumed]; the ones on the lawn too
  for (const [tx, tz] of OSM_TREES) {
    const x = Math.round(tx), z = Math.round(tz);
    const lawn = onTerraceGround(x, z) && !onWalk(x, z);
    if (!lawn && !clear(x, z, 3)) continue;
    const y = lawn ? Y.TERRACE + 1 : hm.at(x, z);
    if (lawn && !b.free(x, z, y, y + 30)) continue;
    tree(b, x, z, y, z < -100);
  }

  // the desert round about [assumed]: saguaro, palo verde, creosote, barrel cactus and boulders on the sand, clear of the spine,
  // the terrace and the walks
  const r = rng(1937);
  for (let gz = TERRAIN.z0 + 4; gz < TERRAIN.z1 - 4; gz += 10)
    for (let gx = TERRAIN.x0 + 4; gx < TERRAIN.x1 - 4; gx += 10) {
      const x = gx + Math.floor(hash2(gx, gz) * 9) - 4, z = gz + Math.floor(hash2(gz, gx) * 9) - 4;
      if (!clear(x, z, 3)) continue;
      const y = hm.at(x, z), t = hash2(x * 7, z * 3);
      const platform = inRect(x, z, SPINE);
      if (t < 0.08 && !platform) {
        saguaro(b, x, z, y, 24 + Math.floor(r() * 12), 1 + Math.floor(r() * 2));
      } else if (t < 0.18) {
        const s = 3 + Math.floor(r() * 4), col = ROCK[Math.floor(r() * 3)];
        b.newGroup();
        b.box(x, z, x + s, z + s - 1, y, y + 3, { kind: 'brick', color: col });
        if (s > 4) b.box(x + 1, z, x + s - 1, z + s - 2, y + 3, y + 6, { kind: 'brick', color: col });
      } else if (t < 0.26) {
        b.newGroup();
        b.add(x, z, y, 2, 2, 3, 0x6a8a4a, 'round'); // a barrel cactus
      } else if (t < 0.32 && !platform) {
        tree(b, x, z, y, false); // a palo verde
      } else if (t < 0.5) {
        const s = 2 + Math.floor(r() * 2);
        b.newGroup();
        b.box(x, z, x + s, z + s, y, y + 3, { kind: 'brick', color: t < 0.4 ? 0x6b7550 : 0x7d8556 }); // creosote
      }
    }
}

function inPolyRing(x: number, z: number, ring: [number, number][]) {
  let inside = false;
  const px = x + 0.5, pz = z + 0.5;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > pz !== zj > pz && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

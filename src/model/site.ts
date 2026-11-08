import { C, P, TERRAIN_SIZES } from '../bricks/catalog';
import { Builder, hash2, noise2 } from './voxel';
import {
  CARPORT, CITY_Y, DRIVEWAY, inPool, inRect, PLATEAU, ROAD, sdRoundRect, Y,
} from './layout';

export const TERRAIN = { x0: -112, z0: -120, x1: 144, z1: 132 };
const BOTTOM = Math.round(CITY_Y / 0.4); // plates

/** Heightmap of terrain top in plates, at stud resolution (for walking fallback). */
export class HeightMap {
  w = TERRAIN.x1 - TERRAIN.x0;
  d = TERRAIN.z1 - TERRAIN.z0;
  top = new Int16Array(this.w * this.d);
  at(x: number, z: number): number {
    const ix = Math.floor(x) - TERRAIN.x0, iz = Math.floor(z) - TERRAIN.z0;
    if (ix < 0 || iz < 0 || ix >= this.w || iz >= this.d) return BOTTOM;
    return this.top[iz * this.w + ix];
  }
}

function rawHeight(x: number, z: number): number {
  // distance outside the lot plateau or the street ridge
  const dLot = sdRoundRect(x, z, PLATEAU, 10);
  const dRoad = sdRoundRect(x, z, ROAD, 4);
  const d = Math.min(dLot, dRoad + 2);
  if (d <= 0) return 0;
  const n = noise2(x * 0.06, z * 0.06) * 0.6 + noise2(x * 0.17, z * 0.17) * 0.4;
  // the east side (under the cantilever) is a steep cliff
  const steep = x > 40 && z > -40 ? 1.6 : 1.0;
  const fall = d * (0.55 + 0.5 * n) * steep + d * d * 0.012;
  return Math.max(-fall / 0.4, BOTTOM); // plates
}

export function buildSite(b: Builder): HeightMap {
  b.setPhase(P.SITE);
  const hm = new HeightMap();
  const { w, d } = hm;
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      let h = rawHeight(x, z);
      h = Math.floor(h / 3) * 3; // brick-height terraces
      if (h < BOTTOM) h = BOTTOM;
      if (inPool(x, z)) h = Y.POOL_BOTTOM;
      hm.top[iz * w + ix] = h;
    }

  // bottom of each column: down to lowest neighbour (minus a brick), so there are no holes
  const bottom = new Int16Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const k = iz * w + ix;
      let m = hm.top[k];
      const edge = ix === 0 || iz === 0 || ix === w - 1 || iz === d - 1;
      if (edge) m = BOTTOM;
      else {
        m = Math.min(m, hm.top[k - 1], hm.top[k + 1], hm.top[k - w], hm.top[k + w]);
      }
      bottom[k] = Math.max(BOTTOM, Math.min(m, hm.top[k] - 3) - (edge ? 0 : 0));
    }

  const topColor = (x: number, z: number, top: number) => {
    // big patches so pieces stay large
    const px = Math.floor(x / 6), pz = Math.floor(z / 6);
    const n = noise2(x * 0.08, z * 0.08);
    if (top >= 0) {
      if (inRect(x, z, PLATEAU)) return n > 0.62 ? C.brightGreen : C.green;
      return C.green;
    }
    const r = hash2(px, pz);
    if (top < -75) return r < 0.5 ? C.olive : C.darkTan;
    if (n < 0.3) return C.darkGreen;
    if (n < 0.55) return C.green;
    if (r < 0.25) return C.olive;
    if (r < 0.32) return C.darkTan;
    return C.sandGreen;
  };
  const sideColor = (x: number, y: number, z: number) => {
    const r = hash2(Math.floor(x / 4) + y * 7, Math.floor(z / 4));
    return r < 0.12 ? C.rock : r < 0.45 ? C.darkTan : C.dirt;
  };

  let minY = 0, maxY = BOTTOM;
  for (let k = 0; k < w * d; k++) {
    minY = Math.min(minY, bottom[k]);
    maxY = Math.max(maxY, hm.top[k]);
  }
  for (let y = minY; y < maxY; y += 3) {
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick',
      sizes: TERRAIN_SIZES,
      mask: (x, z) => {
        const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0);
        return y >= bottom[k] && y < hm.top[k];
      },
      color: (x, yy, z) => {
        const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0);
        const top = hm.top[k];
        return yy + 3 >= top ? topColor(x, z, top) : sideColor(x, yy, z);
      },
    });
  }
  return hm;
}

/** Street, driveway and carport slab (floor phase). */
export function buildPaving(b: Builder) {
  b.setPhase(P.FLOOR);
  // Woods Drive
  b.box(ROAD[0], ROAD[1], ROAD[2], ROAD[3], 0, 1, {
    kind: 'tile',
    color: (x, _y, z) => (z === -71 && (x & 7) < 4 ? C.yellow : C.asphalt),
  });
  // driveway & carport: concrete
  b.box(DRIVEWAY[0], DRIVEWAY[1], DRIVEWAY[2], DRIVEWAY[3], 0, 1, { kind: 'plate', color: C.concreteDark });
  b.box(DRIVEWAY[0], DRIVEWAY[1], DRIVEWAY[2], DRIVEWAY[3], 1, 2, { kind: 'tile', color: C.concrete });
  b.box(CARPORT[0], CARPORT[1], CARPORT[2], CARPORT[3], 0, 1, { kind: 'plate', color: C.concreteDark });
  b.box(CARPORT[0], CARPORT[1], CARPORT[2], CARPORT[3], 1, 2, {
    kind: 'tile',
    color: (x, _y, z) => ((x + z) % 10 === 0 ? C.lightGray : C.concrete),
  });
}

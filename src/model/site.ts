import { C, P, TERRAIN_SIZES } from '../bricks/catalog';
import { Builder, hash2, noise2 } from './voxel';
import {
  CARPORT, DRIVE, inAny, inPool, inRect, PLATEAU, ROOF, sdRoundRect, Y,
} from './layout';
import { LOT_GROUND } from './lotTerrain';

export const TERRAIN = { x0: -112, z0: -120, x1: 144, z1: 132 };

/** Real ground in ft (bilinear over the baked samples; clamps beyond them). Spec 004. */
export function lotGround(x: number, z: number): number {
  const g = LOT_GROUND;
  const fx = Math.min(Math.max((x - g.x0) / g.step, 0), g.nx - 1.0001);
  const fz = Math.min(Math.max((z - g.z0) / g.step, 0), g.nz - 1.0001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const H = (ii: number, jj: number) => g.h[jj * g.nx + ii] / 4;
  return H(i, j) * (1 - u) * (1 - v) + H(i + 1, j) * u * (1 - v) + H(i, j + 1) * (1 - u) * v + H(i + 1, j + 1) * u * v;
}

const PAD_BLEND = 20; // ft: the pad's edges fall to the real ground over this distance
const DRIVE_BLEND = 12; // ft: cut/fill either side of the driveway
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const UNDER_HOUSE = ROOF.map(([x0, z0, x1, z1]) => [x0 - 3, z0 - 3, x1 + 3, z1 + 3] as [number, number, number, number]);
const DRIVE_Z = (DRIVE[1] + DRIVE[3]) / 2;
const DRIVE_END = lotGround(TERRAIN.x0, DRIVE_Z);

/** Driveway surface in ft: level on the pad, then a straight ramp down to the real ground at the lot edge. */
function driveHeight(x: number) {
  if (x >= PLATEAU[0]) return 0;
  return DRIVE_END * Math.min(1, (PLATEAU[0] - x) / (PLATEAU[0] - TERRAIN.x0));
}

/** Designed ground in ft: the level house pad and driveway, the real hillside everywhere else. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  const dPad = sdRoundRect(x, z, PLATEAU, 10);
  let h = dPad <= 0 ? 0 : real * smooth(dPad / PAD_BLEND);
  // never rise into the house: under the roof outline (the cantilevered living wing) stay ≥ 3 ft below the floor
  if (dPad > 0 && inAny(x, z, UNDER_HOUSE)) h = Math.min(h, -3);
  const dx = Math.max(DRIVE[0] - x, 0, x - (DRIVE[2] - 1)), dz = Math.max(DRIVE[1] - z, 0, z - (DRIVE[3] - 1));
  const dDrive = Math.hypot(dx, dz);
  if (dDrive < DRIVE_BLEND) {
    let w = 1 - smooth(dDrive / DRIVE_BLEND);
    // beside the driveway, fade the cut/fill out toward the lot edge so the boundary stays on the real ground
    if (dDrive > 0) w *= smooth((x - TERRAIN.x0) / DRIVE_BLEND);
    const dh = driveHeight(Math.min(Math.max(x, DRIVE[0]), DRIVE[2] - 1));
    h = dh * w + h * (1 - w);
  }
  return h;
}

/** Top of the bricks in ft, including the pool basin floor (for the terrain mesh hidden beneath them). */
export function surfaceFt(x: number, z: number): number {
  return inPool(Math.floor(x), Math.floor(z)) ? (Y.POOL_BOTTOM - 1) * 0.4 : groundFt(x, z);
}

/** Ground in plates, in whole bricks (3 plates). */
const groundPlates = (x: number, z: number) => Math.round(groundFt(x, z) / 0.4 / 3) * 3;

/** Heightmap of terrain top in plates, at stud resolution (for walking fallback). */
export class HeightMap {
  w = TERRAIN.x1 - TERRAIN.x0;
  d = TERRAIN.z1 - TERRAIN.z0;
  top = new Int16Array(this.w * this.d);
  at(x: number, z: number): number {
    const ix = Math.floor(x) - TERRAIN.x0, iz = Math.floor(z) - TERRAIN.z0;
    if (ix < 0 || iz < 0 || ix >= this.w || iz >= this.d) return groundPlates(Math.floor(x), Math.floor(z));
    return this.top[iz * this.w + ix];
  }
}

export function buildSite(b: Builder): HeightMap {
  b.setPhase(P.SITE);
  const hm = new HeightMap();
  const { w, d } = hm;
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      hm.top[iz * w + ix] = inPool(x, z) ? Y.POOL_BOTTOM : groundPlates(x, z);
    }

  // bottom of each column: down to its lowest neighbour (at least one brick), so there are no holes.
  // Neighbours beyond the lot edge are the real ground, so the edge columns are no deeper than they need to be.
  const bottom = new Int16Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const k = iz * w + ix, x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      let m = hm.top[k];
      for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) m = Math.min(m, hm.at(x + dx, z + dz));
      bottom[k] = Math.min(m, hm.top[k] - 3);
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
    if (top < -75) return n < 0.35 ? C.darkGreen : n < 0.55 ? C.olive : r < 0.5 ? C.darkTan : C.sandGreen;
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

  let minY = 0, maxY = -Infinity;
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

/** Driveway and carport slab (floor phase). The driveway steps down with the ground to the lot edge (spec 004). */
export function buildPaving(b: Builder, hm: HeightMap) {
  b.setPhase(P.FLOOR);
  // driveway: concrete, in runs of equal height
  const z = DRIVE[1];
  for (let x0 = DRIVE[0]; x0 < DRIVE[2]; ) {
    const y = hm.at(x0, z);
    let x1 = x0 + 1;
    while (x1 < DRIVE[2] && hm.at(x1, z) === y) x1++;
    b.box(x0, DRIVE[1], x1, DRIVE[3], y, y + 1, { kind: 'plate', color: C.concreteDark });
    b.box(x0, DRIVE[1], x1, DRIVE[3], y + 1, y + 2, { kind: 'tile', color: C.concrete });
    x0 = x1;
  }
  b.box(CARPORT[0], CARPORT[1], CARPORT[2], CARPORT[3], 0, 1, { kind: 'plate', color: C.concreteDark });
  b.box(CARPORT[0], CARPORT[1], CARPORT[2], CARPORT[3], 1, 2, {
    kind: 'tile',
    color: (x, _y, z) => ((x + z) % 10 === 0 ? C.lightGray : C.concrete),
  });
}

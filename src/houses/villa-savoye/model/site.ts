/**
 * The Villa Savoye's lot (spec 074): the park of about one hectare [documented: OSM way 155851392, 1.03 ha] on the plateau above
 * the Seine, its lawn level [documented]; the woods round its edge [documented: OSM way 985370239]; the fine-gravel drive from
 * the gate on Rue de Villiers to the villa, with its loop at the south-east end [documented: OSM way 410026670], and the drive
 * under the box, round the curve of the ground floor [documented: a car could drive round the house without reversing; its
 * line assumed]; Rue de Villiers beyond the wall [documented: OSM].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, inPoly, segDist, smoothstep, streets, type Pt } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { HOUSE, inRect, LODGE, Rect } from './layout';
import { LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -160, z0: -230, x1: 315, z1: 195 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS, { tertiary: 11, residential: 9 }, 6);

/** the park [documented: OSM way 155851392], model ft */
export const PARK: Pt[] = [[-131.1, 118.1], [21.9, -136.3], [228.8, -197.2], [262.4, -207.1], [277.2, -175.8], [283.9, -161.9], [285.3, -150],
  [286.9, -136.3], [288.7, -121], [246.9, 171.2], [110.6, 170.1], [-37.8, 168.9]];
/** the woods round the park's edge [documented: OSM way 985370239], a band between the park's edge and the lawn */
export const WOODS: Pt[] = [[286.9, -136.3], [248, -127.5], [239, -102.9], [247.5, -46.7], [232.9, -10.5], [206.8, 4.4], [163.5, 7.5], [158.9, 55.6],
  [129, 57.4], [123.4, 70.1], [121, 96.5], [124.9, 128.7], [119.6, 138.4], [96.3, 138.3], [66, 144.7], [46.9, 151.3], [37.6, 137.1], [16.2, 145],
  [-9.9, 142.5], [-26.4, 130.9], [-60.2, 124], [-75.8, 97.5], [-71.7, 91], [-48.2, 83.8], [-47.8, 62.5], [-46.4, 46.3], [-48.4, 27.6], [-25.5, 1.9],
  [-10.7, -21.2], [12.5, -36.7], [32.9, -40.6], [36.5, -59.8], [45.2, -67.8], [62.2, -76.4], [89.3, -75.1], [113, -77.6], [132.4, -80.8],
  [146.8, -65.7], [139, -46.2], [140.5, -17.1], [146.8, -7.1], [200.9, -6.5], [223.7, -16.8], [237.4, -48.9], [229.7, -98.9], [239.3, -132.8],
  [235.9, -164.4], [228.8, -197.2], [21.9, -136.3], [-131.1, 118.1], [-37.8, 168.9], [246.9, 171.2], [288.7, -121]];
/** the drive from the gate to the villa and its loop [documented: OSM way 410026670]; drawn 9 ft wide for a car [assumed] */
export const DRIVE: Pt[] = [[286.5, -140], [261.8, -134.1], [243.4, -131], [234.8, -102.2], [243.9, -45.5], [230.9, -11.8], [206.8, 0.3],
  [188.8, 1.5], [160.2, 2.1], [88.8, 3.8], [88.5, 53.9], [156.8, 54.9], [160.2, 2.1]];
export const DRIVE_HALF = 4.5;
/** the park's wall along Rue de Villiers, with the gate between its two runs [documented: OSM ways 804691304, 804691305] */
export const WALLS: Pt[][] = [
  [[246.9, 171.2], [288.7, -121], [286.9, -136.3]],
  [[262.4, -207.1], [277.2, -175.8], [283.9, -161.9], [285.3, -150], [285.5, -148.3]],
];
/**
 * The drive under the box [documented: the car drove under the house, round the curve, without reversing; spec 074 A4]: down
 * the north-east side between the outer and inner rows of pilotis, across the north-west end between the end row and the
 * curve of glass, and back along the south-west side, 9 studs (2.7 m) wide [assumed: 2.5 m], joining OSM's loop.
 */
export const CAR_PATH: Rect[] = [[6, 3, 90, 12], [6, 3, 15, 62], [6, 53, 90, 62]];
export const onCarPath = (x: number, z: number) => CAR_PATH.some((r) => inRect(x, z, r));

const polyDist = (x: number, z: number, ring: Pt[]) => {
  let d = Infinity;
  for (let i = 0; i < ring.length; i++) d = Math.min(d, segDist(x, z, ring[i], ring[(i + 1) % ring.length]));
  return d;
};
const lineDist = (x: number, z: number, pts: Pt[]) => {
  let d = Infinity;
  for (let i = 1; i < pts.length; i++) d = Math.min(d, segDist(x, z, pts[i - 1], pts[i]));
  return d;
};
export const inPark = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, PARK);
export const inWoods = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, WOODS);
export const onDrive = (x: number, z: number) => onCarPath(x, z) || lineDist(x + 0.5, z + 0.5, DRIVE) < DRIVE_HALF;
export const onWall = (x: number, z: number) => WALLS.some((w) => lineDist(x + 0.5, z + 0.5, w) < 0.8);
const EDGE = 20;

/** Designed ground in ft: the park level with the villa [documented: the lawn is level], easing into the real ground outside it. */
export function groundFt(x: number, z: number): number {
  if (inRect(x, z, HOUSE) || inRect(x, z, LODGE)) return -3 * PL;
  const real = lotGround(x, z);
  let y = inPark(x, z) ? 0 : real * smoothstep(polyDist(x + 0.5, z + 0.5, PARK) / 18);
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  y = real + (y - real) * smoothstep(e / EDGE);
  return y;
}
export const surfaceFt = groundFt;
export const groundPlates = (x: number, z: number) => Math.round(groundFt(x, z) / PL / 3) * 3;

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

/** the lawn mown in stripes [assumed: photographs], the woods' floor darker, the fine gravel pale [documented: OSM] */
export const GRASS = [0x6e9b4c, 0x79a556, 0x66914a];
export const GRAVEL = [0xcfc6b2, 0xc6bca7];
const WOODS_FLOOR = [0x4f7038, 0x5b7a3e];

export function buildSite(b: Builder): HeightMap {
  b.setPhase(P.SITE);
  const hm = new HeightMap();
  const { w, d } = hm;
  for (let iz = 0; iz < d; iz++) for (let ix = 0; ix < w; ix++) hm.top[iz * w + ix] = groundPlates(ix + TERRAIN.x0, iz + TERRAIN.z0);
  const bottom = new Int16Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const k = iz * w + ix, x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      let m = hm.top[k];
      for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) m = Math.min(m, hm.at(x + dx, z + dz));
      bottom[k] = Math.min(m, hm.top[k] - 3);
    }
  const topColor = new Int32Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      const s = streetAt(x, z);
      let c: number;
      if (s === 'road') c = 0x55575a;
      else if (s === 'pavement') c = 0xa5a29b;
      else if (onDrive(x, z)) c = GRAVEL[hash2(x >> 2, z >> 2) < 0.5 ? 0 : 1];
      else if (inWoods(x, z)) c = WOODS_FLOOR[hash2(x >> 3, z >> 3) < 0.5 ? 0 : 1];
      else if (!inPark(x, z)) c = hash2((x >> 3) + 99, z >> 3) < 0.5 ? 0x7a9a55 : 0x86a35e;
      else c = GRASS[(z >> 3) & 1];
      topColor[iz * w + ix] = c;
    }
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, hm.top[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < hm.top[k]; },
      color: (x, yy, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return yy + 3 >= hm.top[k] ? topColor[k] : 0x7d6a52; },
    });
  return hm;
}

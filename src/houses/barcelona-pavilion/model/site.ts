/**
 * The Barcelona Pavilion's lot (spec 075): the foot of Montjuïc by the Plaça de Carles Buïgas [documented: OSM]. The real
 * ground rises toward the SSE and up the slope behind [documented: the terrain tiles], but the tiles (about 3.6 m a pixel) smear
 * the plinth into it, so round the pavilion the ground is levelled: paved at the foot of the stair along the front and both
 * ends, 1.34 m under the plinth's top, rising behind to just under it, where a footway comes down the slope by steps
 * [documented: OSM; the levels scaled from photographs]. It eases into the real ground at the lot's edges. The paved forecourt
 * toward the plaça and the paths are OSM's [documented]; grass behind and beside the plinth [documented: OSM].
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { groundSampler, smoothstep, streets } from '@/engine/lot';
import { Builder, hash2, noise2 } from '@/engine/voxel';
import { P } from '../phases';
import { ANNEX, inRect, NOTCH, PLINTH, Rect, STAIR, Y } from './layout';
import { LOT_GROUND, LOT_ROADS } from './lotTerrain';

export const TERRAIN = { x0: -70, z0: -160, x1: 260, z1: 150 };
const PL = 0.4;

export const lotGround = groundSampler(LOT_GROUND);
export const streetAt = streets(LOT_ROADS);

/** the paved forecourt in front of the plinth, out toward the plaça [documented: OSM's footway areas 1104411451/53] */
export const FORECOURT: Rect = [-12, TERRAIN.z0, PLINTH[2] + 1, 0];
/** the footway down the slope behind, to the plinth's back [documented: OSM's way 1104411439 and its steps] */
export const BACK_PATH: Rect = [65, PLINTH[3], 91, TERRAIN.z1];
/** the ground behind the plinth: 3 plates under its top [assumed: photographs show only a low edge there] */
const BACK = -3;
const EDGE = 50;

/** the plinth's own cells (its body is the foundation's), less the notch before the stair and the stair itself */
export const onPlinth = (x: number, z: number) => inRect(x, z, PLINTH) && !inRect(x, z, NOTCH) && !inRect(x, z, STAIR);
/** cells paved at the stair's foot level (a plate of paving over the terrain) */
export const paved = (x: number, z: number) => inRect(x, z, FORECOURT) || inRect(x, z, NOTCH);

/** the levelled ground round the pavilion, in plates: the stair's foot along the front, rising behind */
function levelled(x: number, z: number): number {
  if (inRect(x, z, PLINTH)) return Y.GROUND - 1;
  if (inRect(x, z, ANNEX)) return BACK;
  const t = smoothstep(Math.min(Math.max(z / PLINTH[3], 0), 1));
  return Y.GROUND - 1 + (BACK - (Y.GROUND - 1)) * t;
}

/** Designed ground in ft (the terrain's top, before any paving): levelled round the pavilion, the real slope at the edges. */
export function groundFt(x: number, z: number): number {
  const real = lotGround(x, z);
  const e = Math.min(x - TERRAIN.x0, TERRAIN.x1 - 1 - x, z - TERRAIN.z0, TERRAIN.z1 - 1 - z);
  return real + (levelled(x, z) * PL - real) * smoothstep(e / EDGE);
}
export const groundPlates = (x: number, z: number) => Math.round(groundFt(x, z) / PL / 3) * 3;
/** the top of the bricks in ft, for the terrain mesh hidden beneath them */
export const surfaceFt = (x: number, z: number) => (onPlinth(x, z) || inRect(x, z, ANNEX) ? 0 : (groundPlates(x, z) + (paved(x, z) ? 1 : 0)) * PL);

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

const GRASS = [0x7a9a4e, 0x86a556, 0x6d8d45];
/** the forecourt's paving, a pale stone like the plaza's [assumed] */
const PAVING = [0xd8d0c0, 0xd1c8b6];
const SOIL = 0x8a7458;

export function buildSite(b: Builder): HeightMap {
  b.setPhase(P.SITE);
  const hm = new HeightMap();
  const { w, d } = hm;
  const ground = new Int16Array(w * d);
  for (let iz = 0; iz < d; iz++) for (let ix = 0; ix < w; ix++) ground[iz * w + ix] = groundPlates(ix + TERRAIN.x0, iz + TERRAIN.z0);
  const g = (x: number, z: number) => {
    const ix = x - TERRAIN.x0, iz = z - TERRAIN.z0;
    return ix < 0 || iz < 0 || ix >= w || iz >= d ? groundPlates(x, z) : ground[iz * w + ix];
  };
  const bottom = new Int16Array(w * d);
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const k = iz * w + ix, x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      let m = ground[k];
      for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) m = Math.min(m, g(x + dx, z + dz));
      bottom[k] = Math.min(m, ground[k] - 3);
    }
  const top = (x: number, z: number) => {
    const r = hash2(Math.floor(x / 3), Math.floor(z / 3));
    if (streetAt(x, z) === 'road') return r < 0.5 ? 0x4a4c4e : 0x525456;
    if (inRect(x, z, BACK_PATH) || streetAt(x, z) === 'pavement') return PAVING[Math.floor(r * 2)];
    return noise2(x * 0.05, z * 0.05) < 0.3 ? GRASS[2] : GRASS[Math.floor(r * 2)];
  };
  let minY = 0, maxY = -Infinity;
  for (let k = 0; k < w * d; k++) { minY = Math.min(minY, bottom[k]); maxY = Math.max(maxY, ground[k]); }
  for (let y = minY; y < maxY; y += 3)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y, y + 3, {
      kind: 'brick', sizes: TERRAIN_SIZES,
      mask: (x, z) => { const k = (z - TERRAIN.z0) * w + (x - TERRAIN.x0); return y >= bottom[k] && y < ground[k]; },
      color: (x, yy, z) => (yy + 3 >= ground[(z - TERRAIN.z0) * w + (x - TERRAIN.x0)] && !paved(x, z) ? top(x, z) : SOIL),
    });
  // the forecourt's paving: a plate of pale stone in 1.09 m squares [assumed]
  b.newGroup();
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      hm.top[iz * w + ix] = ground[iz * w + ix] + (paved(x, z) ? 1 : 0);
    }
  const levels = new Set<number>();
  for (let iz = 0; iz < d; iz++) for (let ix = 0; ix < w; ix++) if (paved(ix + TERRAIN.x0, iz + TERRAIN.z0)) levels.add(ground[iz * w + ix]);
  for (const y of levels)
    b.box(FORECOURT[0], FORECOURT[1], PLINTH[2] + 1, NOTCH[3], y, y + 1, {
      kind: 'tile', color: (x, _y, z) => PAVING[(Math.floor(x / 7) + Math.floor(z / 7)) & 1],
      mask: (x, z) => paved(x, z) && g(x, z) === y,
    });
  // under the plinth and the annex the terrain stops at their foot (the foundation fills them); the walking ground is their top
  for (let iz = 0; iz < d; iz++)
    for (let ix = 0; ix < w; ix++) {
      const x = ix + TERRAIN.x0, z = iz + TERRAIN.z0;
      if (onPlinth(x, z) || inRect(x, z, ANNEX)) hm.top[iz * w + ix] = 0;
    }
  return hm;
}

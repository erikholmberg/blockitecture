import { Builder, Grid } from '@/engine/voxel';
import { buildFoundations, buildLowerFloor, buildRoof, buildWalls, buildWindows } from './house';
import { buildInterior, buildLamps } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −90…290, z −150…150), from just under the waterline to the pines on the headland */
export const GRID: Grid = { x0: -95, nx: 390, z0: -155, nz: 310, y0: -280, ny: 400 };

/** Generation order sets priority for space; build order in time comes from each brick's phase. */
export function buildMalaparteHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundations(b);
  buildLowerFloor(b);
  buildWalls(b);
  buildWindows(b);
  buildInterior(b);
  buildRoof(b);
  buildLamps(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

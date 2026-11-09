import { Builder, Grid } from '@/engine/voxel';
import { buildFloors, buildGlass, buildPodium, buildRoofs, buildWalls } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −50…290, z −70…130) and the neighbours that cross its edges, from the slope's foot to the palms */
export const GRID: Grid = { x0: -110, nx: 460, z0: -130, nz: 320, y0: -200, ny: 360 };

/** Generation order sets priority for space; build order in time comes from each brick's phase. */
export function buildEnnisHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildPodium(b);
  buildFloors(b);
  buildWalls(b);
  buildGlass(b);
  buildInterior(b);
  buildRoofs(b);
  buildLights(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

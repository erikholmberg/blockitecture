import { Builder, Grid } from '@/engine/voxel';
import { buildFloors, buildFoundations, buildFrame, buildRoof, buildWalls } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −60…200, z −60…140), from under the canyon to the oaks on the ridge */
export const GRID: Grid = { x0: -65, nx: 270, z0: -65, nz: 210, y0: -125, ny: 280 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildLovellHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundations(b);
  buildFloors(b);
  buildFrame(b);
  buildWalls(b);
  buildInterior(b);
  buildRoof(b);
  buildLights(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

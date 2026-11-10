import { Builder, Grid } from '@/engine/voxel';
import { buildFloors, buildFoundations, buildRoof, buildStructure, buildWalls } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −70…120, z −60…120), from under the downhill slope to the gum trees' tops */
export const GRID: Grid = { x0: -75, nx: 200, z0: -65, nz: 190, y0: -110, ny: 230 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildRoseSeidlerHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundations(b);
  buildFloors(b);
  buildStructure(b);
  buildWalls(b);
  buildInterior(b);
  buildRoof(b);
  buildLights(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

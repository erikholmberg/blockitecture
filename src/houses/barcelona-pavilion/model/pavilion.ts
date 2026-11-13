import { Builder, Grid } from '@/engine/voxel';
import { buildColumns, buildFloor, buildPlinth, buildRoofs, buildWalls } from './house';
import { buildInterior } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −70…260, z −160…150), from the forecourt's low corner to the treetops up the slope */
export const GRID: Grid = { x0: -75, nx: 340, z0: -165, nz: 320, y0: -70, ny: 230 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildPavilion(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildPlinth(b);
  buildFloor(b);
  buildColumns(b);
  buildInterior(b);
  buildWalls(b);
  buildRoofs(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

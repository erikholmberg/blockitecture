import { Builder, Grid } from '@/engine/voxel';
import { buildColumns, buildFloor, buildGlass, buildPodium, buildRoof } from './house';
import { buildInterior } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −110…330, z −130…330), from the sunken garden to the trees' tops */
export const GRID: Grid = { x0: -115, nx: 450, z0: -135, nz: 470, y0: -80, ny: 200 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildGallery(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildPodium(b);
  buildFloor(b);
  buildColumns(b);
  buildInterior(b);
  buildGlass(b);
  buildRoof(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

import { Builder, Grid } from '@/engine/voxel';
import { buildFloors, buildFoundations, buildRoof, buildStructure, buildWalls } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −40…130, z −80…135), from the beach's top to the trees above the road */
export const GRID: Grid = { x0: -45, nx: 180, z0: -85, nz: 225, y0: -230, ny: 500 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildDouglasHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundations(b);
  buildFloors(b);
  buildStructure(b);
  buildInterior(b);
  buildWalls(b);
  buildRoof(b);
  buildLights(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

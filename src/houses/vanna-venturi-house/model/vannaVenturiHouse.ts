import { Builder, Grid } from '@/engine/voxel';
import { buildFloors, buildFoundations, buildRoof, buildStructure, buildWalls } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −70…130, z −230…100), from under the lawn to the trees' tops */
export const GRID: Grid = { x0: -75, nx: 210, z0: -235, nz: 340, y0: -40, ny: 170 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildVannaVenturiHouse(): { builder: Builder; heightmap: HeightMap } {
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

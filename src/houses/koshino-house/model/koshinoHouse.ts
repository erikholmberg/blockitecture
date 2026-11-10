import { Builder, Grid } from '@/engine/voxel';
import { buildFloors, buildFoundations, buildRoof, buildStructure, buildWindows } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −60…160, z −60…140), from under the downhill slope to the pines' tops above the uphill side */
export const GRID: Grid = { x0: -65, nx: 230, z0: -65, nz: 210, y0: -60, ny: 200 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildKoshinoHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundations(b);
  buildFloors(b);
  buildStructure(b);
  buildWindows(b);
  buildInterior(b);
  buildRoof(b);
  buildLights(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

import { Builder, Grid } from '@/engine/voxel';
import { buildFloors, buildFoundations, buildRoof, buildStructure, buildWindows } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −160…200, z −130…160), from the foot of the slope below the court to the palms on the ridge */
export const GRID: Grid = { x0: -165, nx: 370, z0: -135, nz: 300, y0: -380, ny: 540 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildSheatsGoldstein(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundations(b, heightmap);
  buildFloors(b);
  buildStructure(b);
  buildWindows(b);
  buildInterior(b);
  buildRoof(b);
  buildLights(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

import { Builder, Grid } from '@/engine/voxel';
import { garageEnvelope, garageFoundation, garageRoof, garageStructure } from './garage';
import { buildEnvelope, buildFloors, buildFoundation, buildRoof, buildRoofLights, buildStructure } from './house';
import { buildInterior } from './interior';
import { buildLandscape, buildWalls } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −180…250, z −215…200), from the foot of the slopes to the oak's crown */
export const GRID: Grid = { x0: -186, nx: 444, z0: -221, nz: 428, y0: -140, ny: 260 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildGropiusHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundation(b);
  buildWalls(b, heightmap);
  garageFoundation(b);
  buildFloors(b);
  buildStructure(b);
  garageStructure(b);
  buildInterior(b);
  buildEnvelope(b);
  garageEnvelope(b);
  buildRoof(b);
  garageRoof(b);
  buildRoofLights(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

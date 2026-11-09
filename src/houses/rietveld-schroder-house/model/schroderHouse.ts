import { Builder, Grid } from '@/engine/voxel';
import { buildEnvelope, buildFoundations, buildGroundFloor, buildRoof, buildStructure } from './house';
import { buildInterior, buildLamp } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x, z −100…100), from the foundations to the row's roofs and the treetops */
export const GRID: Grid = { x0: -105, nx: 215, z0: -105, nz: 215, y0: -20, ny: 140 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildSchroderHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundations(b);
  buildGroundFloor(b);
  buildStructure(b);
  buildEnvelope(b);
  buildInterior(b);
  buildRoof(b);
  buildLamp(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

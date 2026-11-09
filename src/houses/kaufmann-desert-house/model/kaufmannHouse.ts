import { Builder, Grid } from '@/engine/voxel';
import { buildEnvelope, buildFloors, buildFoundations, buildRoof, buildStructure } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −40…230, z −80…180), from under the pool to the palms' crowns */
export const GRID: Grid = { x0: -45, nx: 280, z0: -85, nz: 270, y0: -50, ny: 170 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildKaufmannHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundations(b);
  buildFloors(b);
  buildStructure(b);
  buildEnvelope(b);
  buildInterior(b);
  buildRoof(b);
  buildLights(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

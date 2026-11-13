import { Builder, Grid } from '@/engine/voxel';
import { buildEnvelope, buildFloor, buildFoundation, buildRoof, buildStructure } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/**
 * occupancy grid: the lot (x −20…950, z −50…330), from just under the levelled ground to the trees on the top terraces.
 * Half a byte a cell: 974 × 384 × 362 / 2 ≈ 68 MB, the largest yet (spec 072, A10: at most 80 MB).
 */
export const GRID: Grid = { x0: -22, nx: 974, z0: -52, nz: 384, y0: -16, ny: 362 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildHabitat(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundation(b);
  buildFloor(b);
  buildStructure(b);
  buildInterior(b);
  buildEnvelope(b);
  buildRoof(b);
  buildLights(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

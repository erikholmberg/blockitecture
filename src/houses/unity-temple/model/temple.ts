import { Builder, Grid } from '@/engine/voxel';
import { buildEnvelope, buildFloors, buildFoundation, buildRoof, buildStructure } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −75…215, z −75…170), from below the footings to the trees' tops */
export const GRID: Grid = { x0: -80, nx: 300, z0: -80, nz: 255, y0: -40, ny: 220 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildTemple(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundation(b);
  buildFloors(b);
  buildStructure(b);
  buildInterior(b);
  buildEnvelope(b);
  buildRoof(b);
  buildLights(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

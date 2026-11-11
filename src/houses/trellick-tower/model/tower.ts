import { Builder, Grid } from '@/engine/voxel';
import { buildEnvelope, buildFloor, buildFoundation, buildRoof, buildStructure } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −150…190, z −60…240), from the railway's side, where the ground dips, to the top of the mast */
export const GRID: Grid = { x0: -155, nx: 350, z0: -65, nz: 310, y0: -70, ny: 910 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildTower(): { builder: Builder; heightmap: HeightMap } {
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

import { Builder, Grid } from '@/engine/voxel';
import { buildEnvelope, buildFloors, buildFoundation, buildRoof, buildStructure } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −90…400, z −120…330), from under the lot's lowest edge to the stair head and the trees' tops */
export const GRID: Grid = { x0: -95, nx: 500, z0: -125, nz: 460, y0: -24, ny: 194 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each piece's phase
 * (see the sequencer).
 */
export function buildBauhaus(): { builder: Builder; heightmap: HeightMap } {
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

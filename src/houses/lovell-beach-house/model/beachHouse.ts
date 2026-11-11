import { Builder, Grid } from '@/engine/voxel';
import { buildEnvelope, buildFloor, buildFoundation, buildRoof, buildStructure } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −45…230, z −40…95), from below the footings to the palms' tops */
export const GRID: Grid = { x0: -50, nx: 285, z0: -45, nz: 145, y0: -40, ny: 180 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildBeachHouse(): { builder: Builder; heightmap: HeightMap } {
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

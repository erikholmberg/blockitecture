import { Builder, Grid } from '@/engine/voxel';
import { buildFootings, buildFrame, buildGlass, buildRoof, buildTerrace } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −60…180, z −60…150), from below the meadow to the maple's crown */
export const GRID: Grid = { x0: -65, nx: 250, z0: -65, nz: 220, y0: -80, ny: 200 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildFarnsworthHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFootings(b);
  buildTerrace(b);
  buildFrame(b);
  buildGlass(b);
  buildInterior(b);
  buildRoof(b);
  buildLights(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

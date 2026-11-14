import { Builder, Grid } from '@/engine/voxel';
import { buildEnvelope, buildFloors, buildFoundation, buildRoof, buildStructure } from './house';
import { buildInterior } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −60…190, z −16…90), from below the sunken gardens to the street trees' crowns */
export const GRID: Grid = { x0: -66, nx: 262, z0: -22, nz: 118, y0: -30, ny: 90 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildSchindlerHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundation(b);
  buildFloors(b);
  buildStructure(b);
  buildInterior(b);
  buildEnvelope(b);
  buildRoof(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

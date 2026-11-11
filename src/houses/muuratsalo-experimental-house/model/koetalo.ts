import { Builder, Grid } from '@/engine/voxel';
import { buildEnvelope, buildFloors, buildFoundation, buildRoofs, buildWalls } from './house';
import { buildInterior } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −85…110, z −150…90), from the rock's foot to the pines' tops */
export const GRID: Grid = { x0: -90, nx: 205, z0: -155, nz: 250, y0: -80, ny: 200 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildKoetalo(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildFoundation(b);
  buildFloors(b);
  buildWalls(b);
  buildInterior(b);
  buildEnvelope(b);
  buildRoofs(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

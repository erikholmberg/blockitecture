import { Builder, Grid } from '@/engine/voxel';
import { buildDrive, buildSite, HeightMap } from './site';
import { buildDecks, buildFrame, buildRetainingWall, buildSlabs } from './structure';
import { buildEnvelope } from './envelope';
import { buildInterior } from './interior';
import { buildLandscape } from './landscape';

/** occupancy grid: the lot (x −70…170, z −70…190) with room for the bluff below and the eucalyptus above */
export const GRID: Grid = { x0: -80, nx: 260, z0: -80, nz: 280, y0: -200, ny: 420 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildEamesHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildRetainingWall(b);
  buildSlabs(b);
  buildDrive(b, heightmap);
  buildFrame(b);
  buildDecks(b);
  buildEnvelope(b);
  buildInterior(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

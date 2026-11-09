import { Builder, Grid } from '@/engine/voxel';
import { buildEnvelope } from './envelope';
import { buildBoulder, buildInterior } from './interior';
import { buildLandscape } from './landscape';
import { buildRoofs } from './roof';
import { buildDriveSouth, buildSite, HeightMap } from './site';
import { buildFoundation, buildStructure, buildTray1 } from './structure';

/** occupancy grid: the lot (x −70…190, z −160…150), from the pool's bed below to the treetops on the hill */
export const GRID: Grid = { x0: -80, nx: 280, z0: -170, nz: 330, y0: -130, ny: 430 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildFallingwater(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  buildBoulder(b);
  buildFoundation(b);
  buildTray1(b);
  buildStructure(b);
  buildEnvelope(b);
  buildInterior(b);
  buildRoofs(b);
  buildDriveSouth(b, heightmap);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

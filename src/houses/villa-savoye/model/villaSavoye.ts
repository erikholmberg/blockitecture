import { Builder, Grid } from '@/engine/voxel';
import { buildEnvelope, buildFloors, buildFoundation, buildRoof, buildStructure } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { buildSite, HeightMap } from './site';

/** occupancy grid: the lot (x −160…315, z −230…195), from the plateau's lowest edge to the tops of the park's trees */
export const GRID: Grid = { x0: -165, nx: 485, z0: -235, nz: 435, y0: -90, ny: 200 };

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildVillaSavoye(): { builder: Builder; heightmap: HeightMap } {
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

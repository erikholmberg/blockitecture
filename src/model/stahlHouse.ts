import { Builder } from './voxel';
import { buildPaving, buildSite, HeightMap } from './site';
import { buildPoolBasin } from './pool';
import { buildCantileverBeams, buildSlabs, buildSteel } from './structure';
import { buildEnvelope } from './envelope';
import { buildInterior } from './interior';
import { buildLandscape } from './landscape';

/**
 * Generation order sets priority for space (first come, first served);
 * build order in time comes from each brick's phase (see sequencer).
 */
export function buildStahlHouse(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder();
  buildPoolBasin(b);
  buildCantileverBeams(b);
  const heightmap = buildSite(b);
  buildSlabs(b);
  buildPaving(b);
  buildSteel(b);
  buildEnvelope(b);
  buildInterior(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

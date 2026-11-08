import { Builder } from '@/engine/voxel';
import { buildPaving, buildSite, HeightMap } from '@/houses/stahl-house/model/site';
import { buildPoolBasin } from '@/houses/stahl-house/model/pool';
import { buildCantileverBeams, buildSlabs, buildSteel } from '@/houses/stahl-house/model/structure';
import { buildEnvelope } from '@/houses/stahl-house/model/envelope';
import { buildInterior } from '@/houses/stahl-house/model/interior';
import { buildLandscape } from '@/houses/stahl-house/model/landscape';

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
  buildPaving(b, heightmap);
  buildSteel(b);
  buildEnvelope(b);
  buildInterior(b);
  buildLandscape(b, heightmap);
  return { builder: b, heightmap };
}

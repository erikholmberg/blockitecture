import { plainNeighbour, Pt } from '@/engine/lot';
import { Builder, Grid } from '@/engine/voxel';
import { P } from '../phases';
import { buildBrancusiFloor, buildBrancusiRoof, buildBrancusiWalls } from './brancusi';
import { buildEnvelope, buildFloor, buildFoundation, buildRoof, buildStructure } from './house';
import { buildInterior, buildLights } from './interior';
import { buildLandscape } from './landscape';
import { LOT_BUILDINGS } from './lotTerrain';
import { buildSite, groundPlates, HeightMap, STACK_IDS, TERRAIN } from './site';

/**
 * occupancy grid: the lot (x −35…610, z −200…255) and a margin, from the footings to the lift shafts' tops over the roof.
 * Half a byte a cell: 655 × 465 × 432 / 2 ≈ 65.8 MB (spec 080, A12: at most 80 MB).
 */
export const GRID: Grid = { x0: -40, nx: 655, z0: -205, nz: 465, y0: -32, ny: 432 };

/** the Atelier Brancusi is drawn in its own module; the lot's other OSM buildings as plain massing at their levels [OSM] */
export const BRANCUSI_ID = 55503399;
const area = (r: [number, number][]) => Math.abs(r.reduce((a, p, i) => { const q = r[(i + 1) % r.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
/**
 * The piazza's stacks are drawn by the landscape; the small round ways with no levels by rue Beaubourg (about 8 ft across, the
 * car park's vents) are left out [assumed: their height isn't mapped]; the rest is massing.
 */
export const NEIGHBOURS = LOT_BUILDINGS.filter((n) => n.id !== BRANCUSI_ID && !STACK_IDS.includes(n.id) && !(n.levels === 0 && area(n.ring) < 150));

/**
 * Generation order sets priority for space (first come, first served); build order in time comes from each brick's
 * phase (see the sequencer).
 */
export function buildCentrePompidou(): { builder: Builder; heightmap: HeightMap } {
  const b = new Builder(GRID);
  const heightmap = buildSite(b);
  // [documented: OSM's buildings and their levels] the lot's other buildings, as plain massing
  for (const n of NEIGHBOURS) {
    const ring = n.ring as Pt[];
    let base = Infinity;
    for (const [x, z] of ring) base = Math.min(base, groundPlates(Math.floor(x), Math.floor(z)));
    // as tall as the neighbourhood draws them: 3.2 m a level and 1 m more (scripts/fetch-neighborhood.mjs)
    const top = base + Math.round(((n.levels || 1) * 3.2 + 1) / 0.3048 / 0.4);
    plainNeighbour(b, ring, base, top, { wall: [0xd8cdb8, 0xcfc4ae], window: 0x4a5258, roof: 0x7d8186, storey: 26,
      keep: (x, z) => x >= TERRAIN.x0 && x < TERRAIN.x1 && z >= TERRAIN.z0 && z < TERRAIN.z1 });
  }
  buildFoundation(b);
  buildFloor(b);
  buildBrancusiFloor(b);
  buildStructure(b);
  buildInterior(b);
  buildEnvelope(b);
  buildBrancusiWalls(b);
  buildRoof(b);
  buildBrancusiRoof(b);
  buildLights(b);
  buildLandscape(b);
  b.setPhase(P.LANDSCAPE);
  return { builder: b, heightmap };
}

/** The Gropius House as a house definition for the engine (spec 078). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildGropiusHouse } from './model/gropiusHouse';
import { CENTER, CHIMNEY, HOUSE, SITE, UPPER_EXT, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const GROPIUS_HOUSE: HouseDefinition = {
  slug: 'gropius-house',
  text: {
    name: 'Gropius House',
    address: '68 Baker Bridge Road, Lincoln, Massachusetts',
    eyebrow: 'The Gropius House · Walter Gropius · 1938',
    headline: ['The Gropius House,', 'block by block'],
    intro: [
      "Walter Gropius's own house, his first building in America: a white box of vertical wood siding on a hilltop above an apple orchard, with a canopy angled off its front, a wall of glass block, an outdoor spiral stair and a screened porch. Watch all",
      'pieces snap into place, from the hilltop to the orchard. Fly around it, or walk in.',
    ],
    complete: 'Complete. Welcome to the Gropius House',
    disclaimer: 'Fan tribute. Not affiliated with Historic New England.',
  },
  site: SITE,
  phases: PHASES,
  build: buildGropiusHouse,
  center: CENTER,
  // model frame (layout.ts): +x ≈ east, +z ≈ south; the north front (the entrance) faces −z, the drive comes up from the
  // north-east through the orchard
  views: {
    overview: { label: 'Overview', view: { pos: v3(190, 95, -170), target: v3(30, -4, 10) } },
    // from the drive by the turning circle, looking south-west at the canopy, the glass block and the spiral stair (the thumbnail's camera)
    entrance: { label: 'The entrance', view: { pos: v3(70, 5, -52), target: v3(28, 9, -4) } },
    // from the plinth's south-west corner: the porch, the big windows, the brise-soleil, the deck and the chimney
    garden: { label: 'The garden', view: { pos: v3(-16, 4.5, 68), target: v3(32, 9, 18) } },
    // on the deck, past the pink wall and the chimney, west over the treetops
    deck: { label: 'The deck', view: { pos: v3(12, 16, 20), target: v3(-40, 12, -10) } },
    // from the dining room toward the west window and the fireplace
    living: { label: 'The living room', view: { pos: v3(24, 5, 13), target: v3(0, 2.5, 7) } },
    above: { label: 'From above', view: { pos: v3(60.5, 430, -40.6), target: v3(60, 0, -40) } },
  },
  // at the turning circle, facing the entrance (south-west)
  walkStart: [80, -14, 1.75],
  lights: { interior: [[8, 7, 11], [22, 7, 15], [33, 7, 10], [50, 7, 14], [22, 17, 10], [40, 17, 21], [40, 6, 36], [36, 10, -4]] },
  // "No roof": the roof, its parapet and railing, the deck's joists, the chimney's top (the garage, far down the hill, keeps its
  // roof)
  roofCut: {
    y0: (Y.ROOF - 1) * PL - 0.05,
    y1: (Y.CHIMNEY + 4) * PL,
    rects: [[CHIMNEY[0] - 1, HOUSE[1] - 1, HOUSE[2] + 1, UPPER_EXT[3] + 1]],
  },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'gropius-house/neighborhood.bin',
  // Boston lies about 15 miles to the east-south-east (no procedural city)
  downtownDir: realToModelDir(105, SITE.rotationDeg),
  // the wooded hills of Lincoln: hardwood forest on the real terrain, no city (spec 078 A12)
  scenery: { forest: true, city: false },
  stats: STATS['gropius-house'],
};

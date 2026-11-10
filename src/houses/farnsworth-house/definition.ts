/** The Farnsworth House as a house definition for the engine (spec 022). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildFarnsworthHouse } from './model/farnsworthHouse';
import { CENTER, HOUSE, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { WATER_AREAS } from './model/water';
import { PHASES } from './phases';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const FARNSWORTH: HouseDefinition = {
  slug: 'farnsworth-house',
  text: {
    name: 'Farnsworth House',
    address: '14520 River Road, Plano, Illinois',
    eyebrow: 'Edith Farnsworth House · Mies van der Rohe · 1951',
    headline: ['The Farnsworth House,', 'block by block'],
    intro: [
      'A white steel frame and walls of glass, floating above the meadow by the Fox River. Watch all',
      'pieces snap into place, from the footings to the sugar maple. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Farnsworth House',
    disclaimer:
      'Fan tribute in a generic toy-block style. Not affiliated with the National Trust for Historic Preservation or the Farnsworth House.',
  },
  site: SITE,
  phases: PHASES,
  build: buildFarnsworthHouse,
  center: CENTER,
  // model frame = HABS sheet 3: +x ≈ east along the house, +z ≈ south toward the river; the porch and terrace at the west end
  views: {
    overview: { label: 'Overview', view: { pos: v3(-30, 60, 150), target: v3(60, 0, 30) } },
    // the famous three-quarter view from the south-west: the terrace, the porch, the two floating planes
    meadow: { label: 'From the meadow', view: { pos: v3(-15, 4, 110), target: v3(60, 2, 30) } },
    inside: { label: 'Inside', view: { pos: v3(54, 6, 33), target: v3(100, 4, 14) } },
    river: { label: 'From the river', view: { pos: v3(40, 14, 300), target: v3(68, 4, 30) } },
    maple: { label: 'Under the maple', view: { pos: v3(104, 3, 66), target: v3(66, 6, 26) } },
  },
  // on the meadow below the lower steps, facing the terrace
  walkStart: [46, 78, 0],
  lights: { interior: [[60, 6, 14], [84, 6, 30], [100, 6, 14]] },
  // "No roof": the roof slab
  roofCut: { y0: Y.CEILING * PL - 0.05, y1: (Y.CORNICE + 1) * PL, rects: [[HOUSE[0] - 1, HOUSE[1] - 1, HOUSE[2] + 1, HOUSE[3] + 1]] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'farnsworth-house/neighborhood.bin',
  // Chicago is about 55 miles away, bearing ~70° (beyond the far grid; no procedural city)
  downtownDir: realToModelDir(70, SITE.rotationDeg),
  scenery: { city: false, lowlands: true, waterAreas: WATER_AREAS },
};

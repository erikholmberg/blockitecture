/** The Schindler House as a house definition for the engine (spec 081). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildSchindlerHouse } from './model/schindlerHouse';
import { CENTER, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const SCHINDLER: HouseDefinition = {
  slug: 'schindler-house',
  text: {
    name: 'Schindler House',
    address: '833 North Kings Road, West Hollywood',
    eyebrow: 'Schindler House · Rudolph Schindler · 1922',
    headline: ['The Schindler House,', 'block by block'],
    intro: [
      'Tilt-up concrete slabs with slits of light between them, redwood and canvas walls opening onto lawns, and two sleeping baskets on the roof: Schindler’s own house on Kings Road, as finished in 1922. Watch all',
      'pieces snap into place. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Schindler House',
    disclaimer: 'Fan tribute. Not affiliated with the Friends of the Schindler House or the MAK Center for Art and Architecture.',
  },
  site: SITE,
  phases: PHASES,
  build: buildSchindlerHouse,
  center: CENTER,
  // model frame (layout.ts): +x east toward Kings Road, +z south; the Hollywood Hills rise to the north (−z)
  views: {
    overview: { label: 'Overview', view: { pos: v3(165, 80, 150), target: v3(40, 0, 38) } },
    // on the west patio's lawn, looking east into the canvas wall, past the outdoor fireplace (the thumbnail's camera)
    patio: { label: 'The west patio', view: { pos: v3(-16, 5.5, 42), target: v3(30, 7, 54) } },
    // Schindler's own studio in the south wing: the slab wall and its slits on the left, the patio wall and its clerestory right
    studio: { label: 'A studio', view: { pos: v3(25, 5.2, 73.5), target: v3(4, 6.2, 69.5) } },
    basket: { label: 'The sleeping basket', view: { pos: v3(35, 10.3, 12), target: v3(62, 6, 60) } },
    street: { label: 'From Kings Road', view: { pos: v3(140, 5.5, 2), target: v3(78, 5, 9) } },
    above: { label: 'From above', view: { pos: v3(40, 260, 39.4), target: v3(40, 0, 39) } },
  },
  // on the west patio's lawn, facing the studios (east)
  walkStart: [10, 50, -Math.PI / 2],
  lights: { interior: [[53, 6.5, 10], [70, 6.5, 10], [40, 6.5, 50], [15, 6.5, 70], [15, 6.5, 27], [40, 6.5, 28], [37, 6, 70]] },
  // "No roof": the roof, its cornice, the skylights, the chimneys' tops above it and the baskets above the roof's underside
  roofCut: { y0: Y.SLAB_TOP * PL - 0.05, y1: (Y.BASKET_TOP + 2) * PL, rects: [[-1, -1, 80, 79]] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'schindler-house/neighborhood.bin',
  // downtown Los Angeles is about 12 km away, at a bearing of about 110° [documented: spec 081]
  downtownDir: realToModelDir(110, SITE.rotationDeg),
  // the LA flats (spec 081): built-up flat ground and the city at about the house's level, the Hollywood Hills as chaparral
  scenery: { chaparral: true, flatsBelow: 30, city: { maxY: 30 } },
  stats: STATS['schindler-house'],
};

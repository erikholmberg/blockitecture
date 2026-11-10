/** The Lovell Health House as a house definition for the engine (spec 034). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildLovellHouse } from './model/lovellHouse';
import { BALCONY, BALCONY_N, CENTER, SITE, THIRD, THIRD_ENTRY, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const LOVELL: HouseDefinition = {
  slug: 'lovell-health-house',
  text: {
    name: 'Lovell Health House',
    address: '4616 Dundee Drive, Los Angeles',
    eyebrow: 'Lovell Health House · Richard Neutra · 1929',
    headline: ['The Lovell Health House,', 'block by block'],
    intro: [
      'America\'s first steel-framed house: white bands and ribbon windows stepping down a canyon, the balconies hung from the roof. Watch all',
      'pieces snap into place, from the pool under the house to the roof. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Lovell Health House',
    disclaimer: 'Fan tribute. Not affiliated with the owners of the Lovell House or the Neutra estate.',
  },
  site: SITE,
  phases: PHASES,
  build: buildLovellHouse,
  center: CENTER,
  // model frame = the HABS plans: +x toward the street (up the slope), +z toward the canyon's south side; the pool at the west end
  views: {
    overview: { label: 'Overview', view: { pos: v3(-70, 80, 170), target: v3(62, 0, 37) } },
    // the famous view up from the canyon at the stacked white bands
    below: { label: 'From below', view: { pos: v3(-30, 4, 120), target: v3(55, 2, 40) } },
    pool: { label: 'The pool', view: { pos: v3(-2, -8, 58), target: v3(45, -9, 42) } },
    street: { label: 'The street', view: { pos: v3(150, 24, 62), target: v3(70, 12, 45) } },
    city: { label: 'Over the city', view: { pos: v3(35, 62, -25), target: v3(110, -25, 170) } },
  },
  // on the patio under the entrance terrace, facing the house
  walkStart: [96, 49, Math.PI / 2],
  lights: { interior: [[40, 4, 44], [85, 4, 28], [40, 15, 40], [65, 15, 45]] },
  // "No roof": the main roof over the third floor and its balconies
  roofCut: { y0: Y.CEILING_THIRD * PL - 0.05, y1: (Y.PARAPET + 1) * PL, rects: [THIRD, THIRD_ENTRY, BALCONY, BALCONY_N] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'lovell-health-house/neighborhood.bin',
  // downtown Los Angeles is about 8 km away, bearing ~150°
  downtownDir: realToModelDir(150, SITE.rotationDeg),
  scenery: { chaparral: true },
};

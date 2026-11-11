/** The Haus am Horn as a house definition for the engine (spec 063). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildHausAmHorn } from './model/hausAmHorn';
import { CENTER, HOUSE, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const HAUS_AM_HORN: HouseDefinition = {
  slug: 'haus-am-horn',
  text: {
    name: 'Haus am Horn',
    address: 'Am Horn 61, Weimar',
    eyebrow: 'Haus am Horn · Georg Muche & the Bauhaus · 1923',
    headline: ['The Haus am Horn,', 'block by block'],
    intro: [
      "The Bauhaus's model house for its 1923 exhibition: a square of small rooms round a tall living room lit from above,",
      'furnished by the school\'s workshops. Watch all pieces snap into place, from the footings to the flat roofs. Fly around it, or walk in.',
    ],
    complete: 'Complete. Welcome to the Haus am Horn',
    disclaimer: 'Fan tribute. Not affiliated with the Klassik Stiftung Weimar.',
  },
  site: SITE,
  phases: PHASES,
  build: buildHausAmHorn,
  center: CENTER,
  // model frame (layout.ts): +x from the entrance front to the far front, +z toward the street Am Horn and the park
  views: {
    overview: { label: 'Overview', view: { pos: v3(-42, 32, 98), target: v3(21, 5, 21) } },
    entrance: { label: 'The entrance', view: { pos: v3(-32, 7, 40), target: v3(10, 5, 20) } },
    living: { label: 'The living room', view: { pos: v3(13, 5, 13.5), target: v3(31, 9, 30) } },
    garden: { label: 'From the kitchen garden', view: { pos: v3(20, 22, -70), target: v3(21, 5, 21) } },
    above: { label: 'From above', view: { pos: v3(21.5, 120, 21.6), target: v3(21, 0, 21) } },
  },
  // on the path before the front door, facing it
  walkStart: [-10, 21, -Math.PI / 2],
  lights: { interior: [[21, 11, 21], [6, 6, 5], [17, 6, 5], [36, 6, 20], [28, 6, 36], [5, 6, 20]] },
  // "No roof": both flat roofs and the chimney, down to the ring's ceiling
  roofCut: { y0: Y.RING_CEILING * PL - 0.05, y1: (Y.CHIMNEY + 2) * PL, rects: [HOUSE] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'haus-am-horn/neighborhood.bin',
  // Weimar's old town lies to the north-west, across the park
  downtownDir: realToModelDir(315, SITE.rotationDeg),
  // Thuringian hills: green on every slope, the town built up below (spec 019's lowland colours)
  scenery: { lowlands: true },
  stats: STATS['haus-am-horn'],
};

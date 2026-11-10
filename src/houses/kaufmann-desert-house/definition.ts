/** The Kaufmann Desert House as a house definition for the engine (spec 033). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildKaufmannHouse } from './model/kaufmannHouse';
import { CENTER, GLORIETTE, ROOFS, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const KAUFMANN: HouseDefinition = {
  slug: 'kaufmann-desert-house',
  text: {
    name: 'Kaufmann Desert House',
    address: '470 West Vista Chino, Palm Springs',
    eyebrow: 'Kaufmann Desert House · Richard Neutra · 1946',
    headline: ['The Kaufmann Desert House,', 'block by block'],
    intro: [
      'Low wings of stone and glass under thin flat roofs, pinwheeling out on the desert floor below the mountains. Watch all',
      'pieces snap into place, from the footings to the palms. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Kaufmann Desert House',
    disclaimer: 'Fan tribute. Not affiliated with the owners of the Kaufmann House or the Neutra estate.',
  },
  site: SITE,
  phases: PHASES,
  build: buildKaufmannHouse,
  center: CENTER,
  // model frame: +x east, +z south; the San Jacinto Mountains rise to the west (−x), the pool lies south-east of the living room
  views: {
    overview: { label: 'Overview', view: { pos: v3(230, 90, 220), target: v3(75, 0, 75) } },
    // the famous view across the pool to the house, the mountains behind
    pool: { label: 'Across the pool', view: { pos: v3(190, 5, 128), target: v3(70, 10, 80) } },
    gloriette: { label: 'The gloriette', view: { pos: v3(95, (Y.ROOF + 12) * PL, 84), target: v3(30, 14, 76) } },
    mountains: { label: 'The mountains', view: { pos: v3(250, 14, 175), target: v3(60, 40, 70) } },
    entry: { label: 'The entry walk', view: { pos: v3(-6, 5, 128), target: v3(40, 5, 90) } },
  },
  // on the lawn beyond the pool, facing the house across it (west)
  walkStart: [166, 102, Math.PI / 2],
  lights: { interior: [[62, 7, 82], [114, 7, 72], [70, 7, 32], [30, 7, 76]] },
  // "No roof": the roofs, and the gloriette with its louvres and canopy
  roofCut: { y0: Y.CEILING * PL - 0.05, y1: (Y.GLORIETTE + 7) * PL, rects: [...ROOFS, GLORIETTE] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'kaufmann-desert-house/neighborhood.bin',
  // downtown Palm Springs is about 2 km south
  downtownDir: realToModelDir(180, SITE.rotationDeg),
  scenery: { city: false, desert: true },
  // spec 050: the model by the numbers and its palette
  stats: STATS['kaufmann-desert-house'],
};

/** The Rose Seidler House as a house definition for the engine (spec 043). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildRoseSeidlerHouse } from './model/roseSeidlerHouse';
import { CENTER, HOUSE, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const ROSE_SEIDLER: HouseDefinition = {
  slug: 'rose-seidler-house',
  text: {
    name: 'Rose Seidler House',
    address: '71 Clissold Road, Wahroonga, Sydney',
    eyebrow: 'Rose Seidler House · Harry Seidler · 1950',
    headline: ['The Rose Seidler House,', 'block by block'],
    intro: [
      'A white square raised over a bush slope at the edge of Sydney, an open deck cut into its middle, a ramp down to the garden and Seidler’s own mural. Watch all',
      'pieces snap into place, from the sandstone base to the gum trees. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Rose Seidler House',
    disclaimer: 'Fan tribute. Not affiliated with Museums of History NSW or Harry Seidler & Associates.',
  },
  site: SITE,
  phases: PHASES,
  build: buildRoseSeidlerHouse,
  center: CENTER,
  // model frame (layout.ts): +x = real west, +z = real north, down the slope to Ku-ring-gai Chase; the garden terrace is 8.4 ft
  // below the main floor
  views: {
    overview: { label: 'Overview', view: { pos: v3(-70, 48, 110), target: v3(24, 0, 22) } },
    garden: { label: 'From the garden', view: { pos: v3(-12, 0, 69), target: v3(20, 1, 28) } },
    mural: { label: 'The deck and the mural', view: { pos: v3(15, 5.5, 31.5), target: v3(32, 4.5, 30.5) } },
    living: { label: 'The living room', view: { pos: v3(-8, 22, 46), target: v3(10, 1, 26) } },
    bush: { label: 'Over the bush', view: { pos: v3(24, 62, -10), target: v3(20, -30, 140) } },
  },
  // on the deck, by the mural; the mural view looks out through the living room's door to the deck
  walkStart: [26, 30, 0],
  lights: { interior: [[9, 6, 32], [9, 6, 14], [26, 6, 10], [41, 6, 25], [27, -4, 32]] },
  // "No roof": the flat roof and its fascia
  roofCut: { y0: Y.ROOF * PL - 0.05, y1: (Y.ROOF_TOP + 4) * PL, rects: [HOUSE] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'rose-seidler-house/neighborhood.bin',
  // the city of Sydney is about 18 km south-south-east
  downtownDir: realToModelDir(159, SITE.rotationDeg),
  // the bush of the Ku-ring-gai plateau, no city in sight
  scenery: { forest: true, city: false },
};

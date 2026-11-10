/** The Koshino House as a house definition for the engine (spec 039). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildKoshinoHouse } from './model/koshinoHouse';
import { BED, CENTER, LIVING, SITE, STUDIO_BOX, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const KOSHINO: HouseDefinition = {
  slug: 'koshino-house',
  text: {
    name: 'Koshino House',
    address: 'Okuike, Ashiya, Hyōgo',
    eyebrow: 'Koshino House · Tadao Ando · 1981',
    headline: ['The Koshino House,', 'block by block'],
    intro: [
      'Two boxes of bare concrete sunk into a wooded slope above Osaka Bay, a courtyard of steps between them, and a curved studio added three years later. Watch all',
      'pieces snap into place, from the cut in the hill to the pines. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Koshino House',
    disclaimer: 'Fan tribute. Not affiliated with Hiroko Koshino, KH Gallery or Tadao Ando Architect & Associates.',
  },
  site: SITE,
  phases: PHASES,
  build: buildKoshinoHouse,
  center: CENTER,
  // model frame (layout.ts): +x along the boxes toward real WSW, +z up the slope (real NNW); the bay lies down the slope (−z)
  views: {
    overview: { label: 'Overview', view: { pos: v3(150, 80, -60), target: v3(46, 4, 32) } },
    courtyard: { label: 'The courtyard', view: { pos: v3(92, 24, 23), target: v3(20, 4, 23) } },
    studio: { label: 'The studio', view: { pos: v3(70, 42, 100), target: v3(58, 10, 50) } },
    living: { label: 'The living room', view: { pos: v3(34, 14, 44), target: v3(48, 8, 30) } },
    // the bay itself hides behind the ridge south of Okuike's plateau: only a sliver shows, from high up
    slope: { label: 'Down the slope', view: { pos: v3(70, 70, 140), target: v3(44, 0, 14) } },
  },
  // on the courtyard floor, facing the steps up to the lawn
  walkStart: [24, 23, -Math.PI / 2],
  lights: { interior: [[42, 6, 38], [30, 6, 10], [60, 6, 54]] },
  // "No roof": every roof, and the walls above the bedroom wing's ceiling
  roofCut: { y0: Y.BED_ROOF * PL - 0.05, y1: (Y.LIV_ROOF + 4) * PL, rects: [BED, LIVING, STUDIO_BOX] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'koshino-house/neighborhood.bin',
  // Osaka is about 20 km east, across the bay's head
  downtownDir: realToModelDir(100, SITE.rotationDeg),
  // the Rokko mountains in forest, Osaka Bay at true sea level, the city on the coastal plain below
  scenery: { forest: true, sea: true, city: { maxY: -1300 } },
};

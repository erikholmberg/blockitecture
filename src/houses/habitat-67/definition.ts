/** Habitat 67 as a house definition for the engine (spec 072). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildHabitat } from './model/habitat';
import { CENTER, DWELLING, levelY, SITE, TOP } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { WATER_AREAS } from './model/water';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const HABITAT_67: HouseDefinition = {
  slug: 'habitat-67',
  text: {
    name: 'Habitat 67',
    address: '2600 avenue Pierre-Dupuy, Montreal',
    eyebrow: 'Habitat 67 · Moshe Safdie · 1967',
    headline: ['Habitat 67,', 'block by block'],
    intro: [
      'Three stepped hills of 354 identical concrete boxes beside the St. Lawrence, each set across the one below and every roof a ' +
        'garden for the home above. Watch all',
      'pieces snap into place, box by box, as the cranes set them. Fly around it, or walk its streets.',
    ],
    complete: 'Complete. Welcome to Habitat 67',
    disclaimer: 'Fan tribute. Not affiliated with Habitat 67 or Safdie Architects.',
    noun: 'complex',
  },
  site: SITE,
  phases: PHASES,
  build: buildHabitat,
  center: CENTER,
  // model frame (layout.ts): +x along the axis toward the north end, +z across it toward the river (real east)
  views: {
    overview: { label: 'Overview', view: { pos: v3(600, 190, 800), target: v3(470, 80, 140) } },
    oldport: { label: 'From the Old Port side', view: { pos: v3(1150, 210, -400), target: v3(500, 70, 130) } },
    street: { label: 'A pedestrian street', view: { pos: v3(410, (levelY(4) + 14) * PL, 109.5), target: v3(560, (levelY(4) + 12) * PL, 109.5) } },
    garden: { label: 'A roof garden', view: { pos: v3(640, 175, 250), target: v3(545, 95, 95) } },
    under: { label: 'Under the boxes', view: { pos: v3(560, 6, -45), target: v3(545, 75, 70) } },
  },
  // at the foot of the steps up to the ground-level street, at its south end, facing along it
  walkStart: [-10, 113, -Math.PI / 2],
  lights: {
    interior: [
      [DWELLING[0].x + 19, (levelY(8) + 18) * PL, DWELLING[0].z + 9], [DWELLING[1].x + 10, (levelY(8) + 18) * PL, DWELLING[1].z + 9],
      [155, (levelY(4) + 10) * PL, 113], [545, (levelY(4) + 10) * PL, 113], [800, (levelY(8) + 10) * PL, 113],
    ],
  },
  // "No roof": everything over the sample dwelling, down to its ceiling
  roofCut: { y0: (levelY(9) - 1.5) * PL, y1: (TOP + 60) * PL, rects: DWELLING.map((d) => d.r) },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'habitat-67/neighborhood.bin',
  // downtown Montreal and the Old Port lie to the north-west, across the Bassin Bickerdike
  downtownDir: realToModelDir(315, SITE.rotationDeg),
  // the St. Lawrence and the harbour basins as water (spec 022); the island green and built-up (spec 019's lowland colours)
  scenery: { lowlands: true, waterAreas: WATER_AREAS },
  // spec 072: 930 ft of complex needs a wide shadow box
  shadowReach: 480,
  stats: STATS['habitat-67'],
};

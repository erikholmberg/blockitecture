/** The Ennis House as a house definition for the engine (spec 025). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildEnnisHouse } from './model/ennisHouse';
import { CENTER, MASSES, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const ENNIS: HouseDefinition = {
  slug: 'ennis-house',
  text: {
    name: 'Ennis House',
    address: '2607 Glendower Avenue, Los Feliz',
    eyebrow: 'Ennis House · Frank Lloyd Wright · 1924',
    headline: ['The Ennis House,', 'block by block'],
    intro: [
      'A temple of patterned concrete blocks on a ridge above Los Angeles. Watch all',
      'pieces snap into place, from the podium to the last art-glass window. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Ennis House',
    disclaimer:
      'Fan tribute. Not affiliated with the Ennis House Foundation or the Frank Lloyd Wright Foundation.',
  },
  site: SITE,
  phases: PHASES,
  build: buildEnnisHouse,
  center: CENTER,
  // model frame: +x ≈ east-south-east along the ridge, +z ≈ south-south-west, down toward the city
  views: {
    overview: { label: 'Overview', view: { pos: v3(-60, 90, 260), target: v3(120, 10, 36) } },
    // the famous view up at the ridge-top mass from below, to the south
    below: { label: 'From below', view: { pos: v3(70, -30, 190), target: v3(110, 18, 40) } },
    loggia: { label: 'The loggia', view: { pos: v3(110, 6, 6), target: v3(40, 6, 6) } },
    court: { label: 'The motor court & gates', view: { pos: v3(204, 8, 110), target: v3(204, 6, 50) } },
    city: { label: 'Over the city', view: { pos: v3(130, 70, -140), target: v3(110, -60, 400) } },
  },
  // in the motor court, inside the gates, facing the house (west)
  walkStart: [212, 52, Math.PI / 2],
  lights: { interior: [[90, 6, 38], [130, 6, 34], [70, 6, 12], [200, 6, 20]] },
  // "No roof": the roof slabs of every mass
  roofCut: { y0: (Y.T1 - 5) * PL, y1: (Y.TOWER + 1) * PL, rects: MASSES.map((m) => [m.rect[0] + 1, m.rect[1] + 1, m.rect[2] - 1, m.rect[3] - 1]) },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'ennis-house/neighborhood.bin',
  // downtown Los Angeles, about 5 miles south-east (bearing ~140°)
  downtownDir: realToModelDir(140, SITE.rotationDeg),
  scenery: { chaparral: true },
  // spec 050: the model by the numbers and its palette
  stats: STATS['ennis-house'],
};

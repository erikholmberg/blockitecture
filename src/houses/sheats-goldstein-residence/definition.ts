/** The Sheats-Goldstein Residence as a house definition for the engine (spec 040). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildSheatsGoldstein } from './model/sheatsGoldstein';
import { CENTER, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const SHEATS_GOLDSTEIN: HouseDefinition = {
  slug: 'sheats-goldstein-residence',
  text: {
    name: 'Sheats-Goldstein Residence',
    address: 'Angelo View Drive, Beverly Crest, Los Angeles',
    eyebrow: 'Sheats-Goldstein Residence · John Lautner · 1963',
    headline: ['The Sheats-Goldstein Residence,', 'block by block'],
    intro: [
      'A triangular concrete roof pierced by hundreds of glass skylights, rising over a living room open to the pool and the whole of Los Angeles. Watch all',
      'pieces snap into place, from the ridge to the garden. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Sheats-Goldstein Residence',
    disclaimer: 'Fan tribute. Not affiliated with James Goldstein, LACMA or the John Lautner Foundation.',
  },
  site: SITE,
  phases: PHASES,
  build: buildSheatsGoldstein,
  center: CENTER,
  // model frame (layout.ts): x = real east, z = real south; the city spreads below to the south (+z)
  views: {
    overview: { label: 'Overview', view: { pos: v3(170, 70, 170), target: v3(20, -10, 0) } },
    living: { label: 'The living room', view: { pos: v3(46, 6, -14), target: v3(50, 9, 40) } },
    terrace: { label: 'The terrace & pool', view: { pos: v3(48, 5, 64), target: v3(44, 12, 0) } },
    bedroom: { label: 'The main bedroom', view: { pos: v3(110, 10, 140), target: v3(50, -12, 58) } },
    city: { label: 'Over the city', view: { pos: v3(30, 75, -120), target: v3(60, -260, 900) } },
  },
  // on the living room's floor, facing the pool and the city
  walkStart: [40, -6, Math.PI],
  lights: { interior: [[46, 6, -6], [-60, 6, -36], [52, -6, 50]] },
  // "No roof": the coffered roof and the wing's roof
  roofCut: { y0: Y.WING_ROOF * PL - 0.05, y1: 52 * PL, rects: [[-102, -73, 96, 25]] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'sheats-goldstein-residence/neighborhood.bin',
  // downtown Los Angeles is about 17 km away, bearing ~100°
  downtownDir: realToModelDir(100, SITE.rotationDeg),
  scenery: { chaparral: true },
  // spec 050: the model by the numbers and its palette
  stats: STATS['sheats-goldstein-residence'],
};

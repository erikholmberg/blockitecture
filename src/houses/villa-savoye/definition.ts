/**
 * The Villa Savoye as a house definition for the engine (spec 074). Built, but kept off the site (spec 074 Q1): it isn't in the
 * registry or in PAGES until the Fondation Le Corbusier and ADAGP agree, as spec 045 did with the Vanna Venturi House.
 */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildVillaSavoye } from './model/villaSavoye';
import { CENTER, HOUSE, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const VILLA_SAVOYE: HouseDefinition = {
  slug: 'villa-savoye',
  text: {
    name: 'Villa Savoye',
    address: '82 rue de Villiers, Poissy',
    eyebrow: 'Villa Savoye · Le Corbusier & Pierre Jeanneret · 1931',
    headline: ['The Villa Savoye,', 'block by block'],
    intro: [
      'A white box on thin columns above a lawn by the Seine, with one window running round all four sides, a ramp up to a roof garden,',
      'and a dark green ground floor curved to the turning circle of a car. Watch all pieces snap into place. Fly around it, or walk in.',
    ],
    complete: 'Complete. Welcome to the Villa Savoye',
    disclaimer: 'Fan tribute. Not affiliated with the Centre des monuments nationaux or the Fondation Le Corbusier.',
  },
  site: SITE,
  phases: PHASES,
  build: buildVillaSavoye,
  center: CENTER,
  // model frame (layout.ts): +x from the north-west entrance front to the south-east end, +z from the north-east side to the
  // south-west side (the terrace's)
  views: {
    overview: { label: 'Overview', view: { pos: v3(-58, 34, 104), target: v3(36, 9, 32) } },
    drive: { label: 'Up the drive', view: { pos: v3(196, 7, 2), target: v3(36, 13, 32) } },
    entrance: { label: 'The entrance', view: { pos: v3(-34, 6, 44), target: v3(24, 5, 32) } },
    ramp: { label: 'The ramp', view: { pos: v3(18.5, 7, 34.8), target: v3(46, 9, 34.5) } },
    // over the bedrooms' roof: the outer ramp climbing out of its well, the roof garden, the solarium and its opening
    garden: { label: 'The roof garden', view: { pos: v3(58, 36, 12), target: v3(14, 22, 32) } },
    above: { label: 'From above', view: { pos: v3(36.6, 170, 32.7), target: v3(36.5, 0, 32.5) } },
  },
  // under the box on the drive, facing the entrance in the curve of glass
  walkStart: [9, 32, -Math.PI / 2],
  lights: { interior: [[18, 16, 50], [27, 5, 32], [8, 16, 10], [55, 16, 10], [40, 16, 23], [63, 16, 28]] },
  // "No roof": the roof slab, the roof garden, the outer ramp and the solarium, down to the first floor's ceiling
  roofCut: { y0: Y.CEILING * PL - 0.05, y1: (Y.SOLARIUM + 2) * PL, rects: [HOUSE] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'villa-savoye/neighborhood.bin',
  // Poissy's centre lies to the north-east, toward the collegiate church
  downtownDir: realToModelDir(45, SITE.rotationDeg),
  // the plateau above the Seine: green on every slope, the town built up below (spec 019's lowland colours)
  scenery: { lowlands: true },
  stats: STATS['villa-savoye'],
};

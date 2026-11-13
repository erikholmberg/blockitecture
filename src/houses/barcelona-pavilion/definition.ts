/** The Barcelona Pavilion as a house definition for the engine (spec 075). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildPavilion } from './model/pavilion';
import { ANNEX_ROOF, CENTER, ROOF, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const BARCELONA_PAVILION: HouseDefinition = {
  slug: 'barcelona-pavilion',
  text: {
    name: 'Barcelona Pavilion',
    address: 'Avinguda de Francesc Ferrer i Guàrdia 7, Barcelona',
    eyebrow: 'Barcelona Pavilion · Mies van der Rohe & Lilly Reich · 1929',
    headline: ['The Barcelona Pavilion,', 'block by block'],
    intro: [
      "Germany's pavilion for the 1929 Exposition, as rebuilt on its site in 1986: a travertine plinth with two pools, a thin roof on eight chrome columns, and free walls of marble, onyx and glass. Watch all",
      'pieces snap into place, from the plinth to the floating roofs. Fly around it, or walk through it.',
    ],
    complete: 'Complete. Welcome to the Barcelona Pavilion',
    disclaimer: 'Fan tribute. Not affiliated with the Fundació Mies van der Rohe or the Ajuntament de Barcelona.',
    noun: 'pavilion',
  },
  site: SITE,
  phases: PHASES,
  build: buildPavilion,
  center: CENTER,
  // model frame (layout.ts): +x along the plinth toward the large pool and the annex (real SSE), +z from the front up the slope
  views: {
    overview: { label: 'Overview', view: { pos: v3(45, 40, -90), target: v3(95, 3, 30) } },
    entrance: { label: 'The entrance', view: { pos: v3(150, 7, 8), target: v3(60, 9, 34) } },
    onyx: { label: 'The onyx wall', view: { pos: v3(56, 5.5, 24), target: v3(56, 4, 40) } },
    smallPool: { label: 'The small pool', view: { pos: v3(28, 5.5, 40), target: v3(4, 4, 52) } },
    above: { label: 'From above', view: { pos: v3(91, 190, 29.6), target: v3(91, 0, 30) } },
  },
  // at the foot of the stair, facing up it
  walkStart: [30, 7, -Math.PI / 2],
  lights: { interior: [[30, 8, 34], [56, 8, 32], [80, 8, 40], [56, 8, 48]] },
  // "No roof": the two slabs
  roofCut: { y0: Y.CEILING * PL - 0.05, y1: (Y.ROOF + 1) * PL, rects: [ROOF, ANNEX_ROOF] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'barcelona-pavilion/neighborhood.bin',
  // the city centre (Plaça de Catalunya) lies to the north-east, down from Montjuïc
  downtownDir: realToModelDir(50, SITE.rotationDeg),
  // Montjuïc's green slopes, the city on the flats below, the sea beyond (y = 0 is 44 m above it)
  scenery: { chaparral: true, sea: true, city: { maxY: -40 } },
  stats: STATS['barcelona-pavilion'],
};

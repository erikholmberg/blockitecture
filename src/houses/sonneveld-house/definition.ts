/** The Sonneveld House as a house definition for the engine (spec 060). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildSonneveld } from './model/sonneveld';
import { BLOCK, CENTER, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const SONNEVELD: HouseDefinition = {
  slug: 'sonneveld-house',
  text: {
    name: 'Sonneveld House',
    address: 'Jongkindstraat 12, Rotterdam',
    eyebrow: 'Sonneveld House · Brinkman & Van der Vlugt · 1933',
    headline: ['The Sonneveld House,', 'block by block'],
    intro: [
      'A white villa of the Dutch Nieuwe Bouwen on a steel frame: ribbon windows, balconies, a roof terrace, and rooms in red, blue',
      'and yellow. Watch all pieces snap into place, from the foundation to the roof terrace. Fly around it, or walk in.',
    ],
    complete: 'Complete. Welcome to the Sonneveld House',
    disclaimer: 'Fan tribute. Not affiliated with the Nieuwe Instituut or Stichting Volkskracht Historische Monumenten.',
  },
  site: SITE,
  phases: PHASES,
  build: buildSonneveld,
  center: CENTER,
  // model frame (layout.ts): +x from the garden end to the north end, +z from the street front (Jongkindstraat) to the east
  views: {
    overview: { label: 'Overview', view: { pos: v3(-55, 45, -70), target: v3(26, 12, 20) } },
    street: { label: 'From Jongkindstraat', view: { pos: v3(22, 7, -62), target: v3(26, 15, 10) } },
    garden: { label: 'From the garden', view: { pos: v3(-58, 8, 50), target: v3(15, 13, 22) } },
    living: { label: 'The living room', view: { pos: v3(33, 16.5, 4), target: v3(5, 13, 12) } },
    terrace: { label: 'The roof terrace', view: { pos: v3(3, 37, 3), target: v3(40, 35, 16) } },
  },
  // in the first floor's living room… walk mode starts at the ground: under the overhang by the street front, facing north
  walkStart: [6, 2, -Math.PI / 2],
  lights: { interior: [[9, 18, 8], [28, 18, 8], [27, 18, 24], [10, 29, 8], [30, 29, 24], [10, 7, 20]] },
  // "No roof": the roof terrace, its tower and the second floor's ceiling
  roofCut: { y0: (Y.ROOF - Y.SLAB) * PL - 0.05, y1: (Y.CHIMNEY + 2) * PL, rects: [BLOCK] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'sonneveld-house/neighborhood.bin',
  // Rotterdam's centre lies to the east
  downtownDir: realToModelDir(80, SITE.rotationDeg),
  // Dutch lowland: green and built-up, no rock (spec 019)
  scenery: { lowlands: true },
  stats: STATS['sonneveld-house'],
};

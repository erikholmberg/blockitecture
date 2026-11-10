/** Casa Luis Barragán as a house definition for the engine (spec 035). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildBarraganHouse } from './model/barraganHouse';
import { CENTER, HOUSE, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const BARRAGAN: HouseDefinition = {
  slug: 'casa-luis-barragan',
  text: {
    name: 'Casa Luis Barragán',
    address: 'General Francisco Ramírez 12–14, Mexico City',
    eyebrow: 'Casa Luis Barragán · Luis Barragán · 1948',
    headline: ['Casa Luis Barragán,', 'block by block'],
    intro: [
      'Behind a plain grey wall: tall quiet rooms, a great window onto a wild garden, and on the roof a terrace walled in pink, orange and white. Watch all',
      'pieces snap into place, from the stone floors to the garden. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to Casa Luis Barragán',
    disclaimer:
      'Fan tribute. Not affiliated with the Casa Luis Barragán, the Fundación de Arquitectura Tapatía Luis Barragán or the Barragan Foundation.',
  },
  site: SITE,
  phases: PHASES,
  build: buildBarraganHouse,
  center: CENTER,
  // model frame = the nomination's plans: +z toward the street (real east), −z into the garden (real west)
  views: {
    overview: { label: 'Overview', view: { pos: v3(170, 95, 220), target: v3(56, 0, 80) } },
    street: { label: 'The street', view: { pos: v3(25, 6, 196), target: v3(58, 14, 130) } },
    terrace: { label: 'The roof terrace', view: { pos: v3(55, (Y.ROOF + 13) * PL, 134), target: v3(64, 26, 90) } },
    garden: { label: 'The garden', view: { pos: v3(36, 5, 70), target: v3(60, 12, 90) } },
    library: { label: 'The library stair', view: { pos: v3(66, 12, 136), target: v3(48, 7, 126) } },
  },
  // on the garden's paved terrace, facing the great window
  walkStart: [58, 76, Math.PI],
  lights: { interior: [[58, 6, 100], [58, 6, 128], [88, 6, 100], [20, 13, 110]] },
  // "No roof": the roof slab and everything on it
  roofCut: { y0: (Y.ROOF - 5) * PL - 0.05, y1: (Y.TOWER + 3) * PL, rects: [[HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3]]] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'casa-luis-barragan/neighborhood.bin',
  // the historic centre is about 6 km away, bearing ~75°
  downtownDir: realToModelDir(75, SITE.rotationDeg),
  // the valley is city on every side: flat ground reads built-up, not grass (spec 010b's flatsBelow); no procedural city
  scenery: { city: false, flatsBelow: 2000 },
};

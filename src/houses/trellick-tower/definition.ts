/** Trellick Tower as a house definition for the engine (spec 061). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildTower } from './model/tower';
import { CENTER, SITE, SLAB, TOP, TOWER, TOWER_TOP } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const TRELLICK: HouseDefinition = {
  slug: 'trellick-tower',
  text: {
    name: 'Trellick Tower',
    address: '5 Golborne Road, London W10',
    eyebrow: 'Trellick Tower · Ernő Goldfinger · 1972',
    headline: ['Trellick Tower,', 'block by block'],
    intro: [
      'Thirty-one storeys of flats in rough concrete over west London, and a separate lift tower joined to them by a bridge at',
      'every third floor. Watch all pieces snap into place, from the rafts to the boiler house. Fly around it, or walk in.',
    ],
    complete: 'Complete. Welcome to Trellick Tower',
    disclaimer: 'Fan tribute. Not affiliated with the Royal Borough of Kensington and Chelsea.',
    noun: 'tower',
  },
  site: SITE,
  phases: PHASES,
  build: buildTower,
  center: CENTER,
  // model frame (layout.ts): +x along the slab away from the service tower (real east-south-east), +z toward the balcony
  // side (real south-south-west)
  views: {
    overview: { label: 'Overview', view: { pos: v3(-190, 190, 420), target: v3(40, 130, 20) } },
    balconies: { label: 'The balcony front', view: { pos: v3(60, 60, 330), target: v3(50, 150, 30) } },
    bridges: { label: 'The bridges', view: { pos: v3(-110, 230, 150), target: v3(-15, 190, 5) } },
    boiler: { label: 'The boiler house', view: { pos: v3(-150, 330, 90), target: v3(-55, 290, 2) } },
    corridors: { label: 'The corridor front', view: { pos: v3(110, 90, -300), target: v3(50, 140, 0) } },
  },
  // on the terrace before the entrance, facing the balcony front
  walkStart: [70, 58, 0],
  lights: { interior: [[20, 6, 20], [60, 6, 20], [100, 6, 20], [-43, 6, 2], [-65, 290, 2]] },
  // "No roof": the slab's roof and the tower's top
  roofCut: { y0: (TOP - 0.5) * PL, y1: (TOWER_TOP + 70) * PL, rects: [SLAB, TOWER] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'trellick-tower/neighborhood.bin',
  // the City and the West End lie to the east-south-east
  downtownDir: realToModelDir(110, SITE.rotationDeg),
  // London: green and built-up, no rock (spec 019's lowland colours)
  scenery: { lowlands: true },
  // spec 061: 320 ft of tower needs a wider shadow box
  shadowReach: 300,
  stats: STATS['trellick-tower'],
};

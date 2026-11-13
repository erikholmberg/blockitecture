/** The Bauhaus Dessau as a house definition for the engine (spec 076). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildBauhaus } from './model/bauhaus';
import { BRIDGE, CENTER, LINK, NORTH, PRELLER, ROOF, SITE, STUB, WORKSHOP, ENT_A, ENT_B, P_STAIR_TOP } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const BAUHAUS_DESSAU: HouseDefinition = {
  slug: 'bauhaus-dessau',
  text: {
    name: 'Bauhaus Dessau',
    address: 'Gropiusallee 38, Dessau-Roßlau',
    eyebrow: 'Bauhaus Dessau · Walter Gropius · 1926',
    headline: ['The Bauhaus Dessau,', 'block by block'],
    intro: [
      'The school Walter Gropius built for the Bauhaus: a pinwheel of white wings, the workshops behind three storeys of glass, a ' +
        'bridge over the street and a block of studios with small balconies. Watch all',
      'pieces snap into place. Fly around it, or walk in.',
    ],
    complete: 'Complete. Welcome to the Bauhaus Dessau',
    disclaimer: 'Fan tribute. Not affiliated with the Stiftung Bauhaus Dessau.',
    noun: 'school',
  },
  site: SITE,
  phases: PHASES,
  build: buildBauhaus,
  center: CENTER,
  // model frame (layout.ts): +x along the workshop wing toward its south end (real south-south-east), +z toward Gropiusallee
  // (real west-south-west)
  views: {
    overview: { label: 'Overview', view: { pos: v3(250, 80, 450), target: v3(175, 35, 130) } },
    corner: { label: 'The glass corner', view: { pos: v3(334, 18, 246), target: v3(292, 36, 206) } },
    bridge: { label: 'The bridge', view: { pos: v3(102, 7, -40), target: v3(102, 18, 140) } },
    balconies: { label: 'The balconies', view: { pos: v3(181, 28, -95), target: v3(181, 36, 0) } },
    workshop: { label: 'Inside a workshop', view: { pos: v3(236, 25.5, 184), target: v3(302, 22, 222) } },
    above: { label: 'From above', view: { pos: v3(175.6, 430, 120.7), target: v3(175, 0, 120) } },
  },
  // on the forecourt by Bauhausstraße, facing along it toward the bridge
  walkStart: [102, 40, Math.PI],
  lights: { interior: [[230, 10, 195], [230, 25, 195], [230, 39, 195], [187, 15, 106], [187, 10, 54], [174, 19, 8], [100, 24, 132]] },
  // "No roof": the tall wings' roofs and the Prellerhaus's top floor, its terrace and stair head, down to the top storeys' ceiling
  roofCut: { y0: (ROOF - 0.5) * PL, y1: (P_STAIR_TOP + 4) * PL, rects: [NORTH, BRIDGE, WORKSHOP, ENT_A, ENT_B, STUB, PRELLER, LINK] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'bauhaus-dessau/neighborhood.bin',
  // Dessau's centre and the station lie to the east
  downtownDir: realToModelDir(95, SITE.rotationDeg),
  // the plain of the Mulde and the Elbe: green and built up (spec 019's lowland colours)
  scenery: { lowlands: true },
  // spec 076 Q9: the school spans about 245 × 345 ft
  shadowReach: 200,
  stats: STATS['bauhaus-dessau'],
};

/** Taliesin West as a house definition for the engine (spec 077). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildTaliesinWest } from './model/taliesinWest';
import { CENTER, GARDEN_ROOM, KIVA, PERGOLA, QUARTERS, SITE, STUDIO, Y, KITCHEN, DINING, BREEZEWAY, ENTRANCE, DINING_COVE, PASSAGE, OFFICE_BAY } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const TALIESIN_WEST: HouseDefinition = {
  slug: 'taliesin-west',
  text: {
    name: 'Taliesin West',
    address: '12345 N Taliesin Drive, Scottsdale',
    eyebrow: 'Taliesin West · Frank Lloyd Wright · 1937',
    headline: ['Taliesin West,', 'block by block'],
    intro: [
      'Walls of desert stone set in concrete under red beams and white canvas roofs: a long spine of drafting studio, dining rooms and Garden Room at the foot of the McDowell Mountains, with a prow-shaped terrace and its triangular pool. Watch all',
      'pieces snap into place. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to Taliesin West',
    disclaimer: 'Fan tribute. Not affiliated with the Frank Lloyd Wright Foundation.',
    noun: 'complex',
  },
  site: SITE,
  phases: PHASES,
  build: buildTaliesinWest,
  center: CENTER,
  // model frame (layout.ts): +x along the spine toward the south-east, +z across it toward the valley and the prow (south-west);
  // the McDowell Mountains rise to the north-east (−z)
  views: {
    overview: { label: 'Overview', view: { pos: v3(10, 95, 290), target: v3(120, 4, 30) } },
    // from the prow's point, over the pool to the studio's red beams and the mountains (the thumbnail's camera)
    prow: { label: 'The prow', view: { pos: v3(110, 6, 136), target: v3(48, 10, 12) } },
    studio: { label: 'The drafting studio', view: { pos: v3(1, 5.5, 14), target: v3(90, 6, 16) } },
    garden: { label: 'The Garden Room', view: { pos: v3(222, 5.5, 42), target: v3(221, 4, 90) } },
    pergola: { label: 'The pergola', view: { pos: v3(-6, 5.5, -13), target: v3(90, 4.5, -13) } },
    above: { label: 'From above', view: { pos: v3(130.5, 430, 30.5), target: v3(130, 0, 30) } },
  },
  // on Sunset Terrace beside the pool, facing the studio (north-east, −z)
  walkStart: [104, 118, 0],
  lights: { interior: [[20, 8, 15], [60, 8, 15], [221, 7, 65], [208, 6, 31], [215, 2, -30], [150, 7, 35]] },
  // "No roof": the canvas roofs, the beams and the fins, the flat roofs, the pergola; from under the studio's low eave up
  roofCut: {
    y0: (Y.BASE_1 + 8) * PL - 0.05, y1: (Y.CHIMNEY + 4) * PL,
    rects: [[STUDIO[0], -3, STUDIO[2], 31], PERGOLA, GARDEN_ROOM, ...KIVA, ...QUARTERS, ...KITCHEN, ...DINING, ...BREEZEWAY, ...ENTRANCE, DINING_COVE, ...PASSAGE, OFFICE_BAY],
  },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'taliesin-west/neighborhood.bin',
  // Scottsdale's centre lies to the south-west, down the valley
  downtownDir: realToModelDir(215, SITE.rotationDeg),
  // the desert (spec 033): the McDowell Mountains come from the real terrain; no city on the slope
  scenery: { city: false, desert: true },
  stats: STATS['taliesin-west'],
};

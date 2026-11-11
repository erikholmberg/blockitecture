/** Unity Temple as a house definition for the engine (spec 062). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildTemple } from './model/temple';
import { CENTER, HALL, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const UNITY_TEMPLE: HouseDefinition = {
  slug: 'unity-temple',
  text: {
    name: 'Unity Temple',
    address: '875 Lake Street, Oak Park, Illinois',
    eyebrow: 'Unity Temple · Frank Lloyd Wright · 1908',
    headline: ['Unity Temple,', 'block by block'],
    intro: [
      'A cube of poured concrete on a street corner in Oak Park, closed to the street and lit from above through amber glass, with',
      "the congregation's hall behind it. Watch all pieces snap into place, from the footings to the skylights. Fly around it, or walk in.",
    ],
    complete: 'Complete. Welcome to Unity Temple',
    disclaimer: 'Fan tribute. Not affiliated with the Unity Temple Unitarian Universalist Congregation, the Frank Lloyd Wright Trust or the Frank Lloyd Wright Foundation.',
    noun: 'temple',
  },
  site: SITE,
  phases: PHASES,
  build: buildTemple,
  center: CENTER,
  // model frame (layout.ts): +x from Lake Street south to Unity House, +z from the east side west to Kenilworth Avenue
  views: {
    overview: { label: 'Overview', view: { pos: v3(-72, 62, 118), target: v3(60, 12, 46) } },
    lake: { label: 'From Lake Street', view: { pos: v3(-62, 8, 100), target: v3(30, 18, 46) } },
    entrance: { label: 'The entrance', view: { pos: v3(50, 8, 118), target: v3(78, 10, 60) } },
    auditorium: { label: 'The auditorium', view: { pos: v3(20, 12.5, 40), target: v3(52, 24, 50) } },
    hall: { label: 'Unity House', view: { pos: v3(96, 9, 46), target: v3(130, 10, 46) } },
  },
  // on the west terrace before the doors, facing them
  walkStart: [78, 75, Math.PI],
  lights: { interior: [[33, 26, 46], [20, 14, 46], [33, 14, 22], [33, 14, 70], [112, 14, 46], [78, 8, 46]] },
  // "No roof": the roof slabs, the skylights and the attic; Unity House's roof
  roofCut: { y0: (Y.LINK - 2) * PL - 0.05, y1: (Y.ATTIC + 6) * PL, rects: [[-6, 7, 72, 85], HALL, [64, 30, 91, 62], [98, -3, 125, 95]] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'unity-temple/neighborhood.bin',
  // Chicago's Loop is about 9 miles east
  downtownDir: realToModelDir(90, SITE.rotationDeg),
  // the flat prairie suburbs: green and built-up (spec 019's lowland colours)
  scenery: { lowlands: true },
  stats: STATS['unity-temple'],
};

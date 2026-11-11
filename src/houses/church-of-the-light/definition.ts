/** The Church of the Light as a house definition for the engine (spec 055). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildChapel } from './model/chapel';
import { BOX, CENTER, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const CHURCH_OF_THE_LIGHT: HouseDefinition = {
  slug: 'church-of-the-light',
  text: {
    name: 'Church of the Light',
    address: '4-3-50 Kitakasugaoka, Ibaraki, Osaka',
    eyebrow: 'Church of the Light · Tadao Ando · 1989',
    headline: ['The Church of the Light,', 'block by block'],
    intro: [
      'A concrete box in a quiet street in Ibaraki, cut through by a wall at 15°, with a cross of light cut into the wall behind the',
      'altar. Watch all pieces snap into place, from the foundation to the roof. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Church of the Light',
    disclaimer: 'Fan tribute. Not affiliated with the Ibaraki Kasugaoka Church or Tadao Ando Architect & Associates.',
    noun: 'chapel',
  },
  site: SITE,
  phases: PHASES,
  build: buildChapel,
  center: CENTER,
  // model frame (layout.ts): +x from the entrance to the altar (real south-south-east), +z toward the Sunday School
  views: {
    overview: { label: 'Overview', view: { pos: v3(-45, 60, -70), target: v3(30, 6, 10) } },
    cross: { label: 'The cross', view: { pos: v3(6, 6, 6.5), target: v3(59, 9, 11.5) } },
    wall: { label: 'The 15° wall', view: { pos: v3(95, 14, 55), target: v3(45, 8, 20) } },
    street: { label: 'From the street', view: { pos: v3(70, 6, -45), target: v3(25, 10, 10) } },
    above: { label: 'From above', view: { pos: v3(30.5, 150, 10.5), target: v3(30, 0, 10) } },
  },
  // inside the entrance, facing the cross
  walkStart: [5, 5, -Math.PI / 2],
  lights: { interior: [[10, 12, 6], [30, 10, 6], [50, 8, 14]] },
  // "No roof": the roof slab
  roofCut: { y0: (Y.CEILING - 1) * PL - 0.05, y1: (Y.TOP + 2) * PL, rects: [BOX] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'church-of-the-light/neighborhood.bin',
  // Ibaraki's centre and Osaka beyond it lie to the south
  downtownDir: realToModelDir(190, SITE.rotationDeg),
  stats: STATS['church-of-the-light'],
};

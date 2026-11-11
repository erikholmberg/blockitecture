/** The Muuratsalo Experimental House as a house definition for the engine (spec 058). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildKoetalo } from './model/koetalo';
import { CENTER, EAST_WING, GUEST, NORTH_WING, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const MUURATSALO: HouseDefinition = {
  slug: 'muuratsalo-experimental-house',
  text: {
    name: 'Muuratsalo Experimental House',
    address: 'Melalammentie 2, Muuratsalo, Jyväskylä, Finland',
    eyebrow: 'Muuratsalo Experimental House · Alvar Aalto · 1953',
    headline: ['The Muuratsalo Experimental House,', 'block by block'],
    intro: [
      "Alvar and Elissa Aalto's summer house on a granite shore of Lake Päijänne: white walls outside, a courtyard of fifty test",
      'panels of red clay and glazed tile inside. Watch all pieces snap into place, from the rock to the roofs. Fly around it, or walk in.',
    ],
    complete: 'Complete. Welcome to the Muuratsalo Experimental House',
    disclaimer: 'Fan tribute. Not affiliated with the Alvar Aalto Foundation.',
  },
  site: SITE,
  phases: PHASES,
  build: buildKoetalo,
  center: CENTER,
  // model frame (layout.ts): +x toward the bedrooms and the guest wing (real east-south-east), +z toward the courtyard's open
  // south side (real south-south-west); the lake lies to the west, beyond the lot
  views: {
    overview: { label: 'Overview', view: { pos: v3(-120, 75, 120), target: v3(30, 6, 24) } },
    courtyard: { label: 'The courtyard', view: { pos: v3(4, 6, 44), target: v3(22, 9, 14) } },
    lake: { label: 'From the lake', view: { pos: v3(-260, 4, 170), target: v3(15, 4, 30) } },
    studio: { label: 'The studio', view: { pos: v3(4, 7, 4), target: v3(25, 6, 12) } },
    above: { label: 'From above', view: { pos: v3(35.5, 220, 23.6), target: v3(35, 0, 23) } },
  },
  // in the courtyard by the fire pit, facing the patchwork walls
  walkStart: [8, 40, Math.PI * 0.75],
  lights: { interior: [[15, 8, 8], [38, 8, 8], [35, 8, 30], [58, 8, 6], [11, 4, 31]] },
  // "No roof": the roofs and the walls' tops above the guest wing's eaves
  roofCut: { y0: (Y.GUEST_ROOF - 0.5) * PL, y1: (Y.STUDIO_HIGH + 8) * PL, rects: [NORTH_WING, EAST_WING, GUEST] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'muuratsalo-experimental-house/neighborhood.bin',
  // Jyväskylä's centre is about 12 km north-north-west
  downtownDir: realToModelDir(340, SITE.rotationDeg),
  // the island's pine forest, Lake Päijänne at its own level (spec 058), no city
  scenery: { forest: true, city: false, sea: { levelM: 96.6 } },
  stats: STATS['muuratsalo-experimental-house'],
};

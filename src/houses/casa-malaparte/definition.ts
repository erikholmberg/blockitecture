/** Casa Malaparte as a house definition for the engine (spec 031). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildMalaparteHouse } from './model/malaparteHouse';
import { CENTER, HOUSE, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;
/** the Faraglioni, about 1.3 km away at a bearing of about 210° [assumed: map], as a model-space direction */
const FAR = realToModelDir(210, SITE.rotationDeg);

export const MALAPARTE: HouseDefinition = {
  slug: 'casa-malaparte',
  text: {
    name: 'Casa Malaparte',
    address: 'Punta Massullo, Capri',
    eyebrow: 'Casa Malaparte · Adalberto Libera & Curzio Malaparte · 1938',
    headline: ['Casa Malaparte,', 'block by block'],
    intro: [
      'A long red house on a cliff above the sea, with a wedge of steps up to its roof. Watch all',
      'pieces snap into place, from the rock to the white wall on the roof. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to Casa Malaparte',
    disclaimer: 'Fan tribute in a generic toy-block style. Not affiliated with the Fondazione Giorgio Ronchi or the LEGO Group.',
  },
  site: SITE,
  phases: PHASES,
  build: buildMalaparteHouse,
  center: CENTER,
  // model frame: +x ≈ ESE along the house, out to the tip of the headland; +z ≈ SSW
  views: {
    overview: { label: 'Overview', view: { pos: v3(-40, 90, 230), target: v3(120, 0, 0) } },
    // the famous view from a boat below the cliffs
    sea: { label: 'From the sea', view: { pos: v3(190, -50, 320), target: v3(110, 0, 0) } },
    stair: { label: 'The stair', view: { pos: v3(-50, 16, 22), target: v3(60, 16, 0) } },
    roof: { label: 'On the roof', view: { pos: v3(126, 32, -6), target: v3(300, -10, 120) } },
    faraglioni: { label: 'The Faraglioni', view: { pos: v3(120 - FAR[0] * 160, 70, -FAR[1] * 160), target: v3(120 + FAR[0] * 900, -60, FAR[1] * 900) } },
  },
  // at the foot of the stair, facing up it
  walkStart: [-6, 0, -Math.PI / 2],
  lights: { interior: [[150, 15, 0], [110, 4, 0], [140, 4, -8]] },
  // "No roof": the terrace slab, and the white wall on it
  roofCut: { y0: (Y.ROOF - 3) * PL - 0.05, y1: (Y.ROOF + Y.WALL + 1) * PL, rects: [[HOUSE[0], HOUSE[1], HOUSE[2], HOUSE[3]]] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'casa-malaparte/neighborhood.bin',
  // Naples is about 30 km north (no procedural city)
  downtownDir: realToModelDir(0, SITE.rotationDeg),
  scenery: { sea: true, chaparral: true, city: false },
};

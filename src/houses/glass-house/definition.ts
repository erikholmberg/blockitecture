/** The Glass House as a house definition for the engine (spec 073). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildGlassHouse } from './model/glassHouse';
import { BRICK, CENTER, HOUSE, SITE, Y } from './model/layout';
import { POND, surfaceFt, TERRAIN } from './model/site';
import { WATER_AREAS } from './model/water';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const GLASS_HOUSE: HouseDefinition = {
  slug: 'glass-house',
  text: {
    name: 'Glass House',
    address: 'Ponus Ridge Road, New Canaan, Connecticut',
    eyebrow: 'The Glass House · Philip Johnson · 1949',
    headline: ['The Glass House,', 'block by block'],
    intro: [
      "Philip Johnson's own weekend house: a glass box with a black steel frame on a bluff above a pond, and the windowless guest house facing it across the lawn. Watch all",
      'pieces snap into place, from the platform to the big oak. Fly around it, or walk in.',
    ],
    complete: 'Complete. Welcome to the Glass House',
    disclaimer: 'Fan tribute. Not affiliated with the National Trust for Historic Preservation or the Glass House.',
  },
  site: SITE,
  phases: PHASES,
  build: buildGlassHouse,
  center: CENTER,
  // model frame (layout.ts): +x ≈ east, +z ≈ south; the bluff and the pond to the west (−x)
  views: {
    overview: { label: 'Overview', view: { pos: v3(150, 90, 210), target: v3(-10, -12, 50) } },
    // the classic photograph: the east and south fronts from the gravel path to the south-east
    path: { label: 'The path', view: { pos: v3(70, 9, 76), target: v3(15, 5, 25) } },
    // the lawn court between the two houses, from its north end: the Brick House's blank west front opposite the glass
    court: { label: 'The court', view: { pos: v3(64, 7, -40), target: v3(70, 3, 75) } },
    // from the living area, past the Barcelona chairs and the Poussin, out west over the bluff
    inside: { label: 'Inside', view: { pos: v3(24, 6, 44), target: v3(-80, -22, 36) } },
    pond: { label: 'From the pond', view: { pos: v3(-300, -52, 118), target: v3(10, -2, 30) } },
    above: { label: 'From above', view: { pos: v3(60.5, 280, 40.6), target: v3(60, 0, 40) } },
  },
  // on the path before the east door, facing it
  walkStart: [46, 29, Math.PI / 2],
  lights: { interior: [[8, 8, 8], [24, 8, 10], [8, 8, 40], [24, 8, 46], [14, 8, 24]] },
  // "No roof": the Glass House's roof and the cylinder's top, and the Brick House's roof
  roofCut: {
    y0: Y.CEILING * PL - 0.05,
    y1: (Y.CYLINDER + 1) * PL,
    rects: [[HOUSE[0] - 1, HOUSE[1] - 1, HOUSE[2] + 1, HOUSE[3] + 1], [BRICK[0] - 1, BRICK[1] - 1, BRICK[2] + 1, BRICK[3] + 1]],
  },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'glass-house/neighborhood.bin',
  // New York City is about 40 miles to the south-west, beyond the far grid (no procedural city)
  downtownDir: realToModelDir(225, SITE.rotationDeg),
  // wooded Connecticut ridges; the water areas round about, but not the pond on the lot (it's in blocks)
  scenery: { forest: true, city: false, waterAreas: WATER_AREAS.filter((a) => a !== POND) },
  stats: STATS['glass-house'],
};

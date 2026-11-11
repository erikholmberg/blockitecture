/** The Lovell Beach House as a house definition for the engine (spec 056). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildBeachHouse } from './model/beachHouse';
import { BAND, CENTER, SITE, TOWER, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const LOVELL_BEACH: HouseDefinition = {
  slug: 'lovell-beach-house',
  text: {
    name: 'Lovell Beach House',
    address: '1242 West Ocean Front, Newport Beach, California',
    eyebrow: 'Lovell Beach House · Rudolph Schindler · 1926',
    headline: ['The Lovell Beach House,', 'block by block'],
    intro: [
      'Five concrete frames lift the house off the sand at Balboa, a row of bedrooms hung between them over 13th Street. Watch all',
      'pieces snap into place, from the footings to the roof. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Lovell Beach House',
    disclaimer: "Fan tribute. Not affiliated with the house's owners.",
  },
  site: SITE,
  phases: PHASES,
  build: buildBeachHouse,
  center: CENTER,
  // model frame (layout.ts): +x from the alley toward the ocean (real south-south-west), +z toward 13th Street (real west)
  views: {
    overview: { label: 'Overview', view: { pos: v3(-30, 50, 95), target: v3(60, 4, 20) } },
    street: { label: 'From 13th Street', view: { pos: v3(30, 8, 82), target: v3(29, 14, 16) } },
    frames: { label: 'The frames', view: { pos: v3(118, 12, 12), target: v3(30, 14, 14) } },
    living: { label: 'The living room', view: { pos: v3(50, 17, 3), target: v3(18, 12, 13) } },
    beach: { label: 'From the beach', view: { pos: v3(200, 10, 20), target: v3(40, 12, 16) } },
  },
  // in the living room, facing the glass wall and the ocean
  walkStart: [36, 8, -Math.PI / 2],
  lights: { interior: [[30, 16, 8], [45, 16, 8], [22, 22, 25], [40, 22, 25], [8, 16, 8]] },
  // "No roof": the roof, its parapet and the tower
  roofCut: { y0: (Y.CEILING - 1) * PL - 0.05, y1: (Y.TOWER + 2) * PL, rects: [[0, 0, BAND[2], 33], TOWER] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'lovell-beach-house/neighborhood.bin',
  // Newport Beach's centre is up the peninsula, to the east-south-east
  downtownDir: realToModelDir(110, SITE.rotationDeg),
  // the Pacific at sea level past the beach; the peninsula's sand and the town's watered greens read as the desert's (spec 033)
  scenery: { sea: true, desert: true },
  stats: STATS['lovell-beach-house'],
};

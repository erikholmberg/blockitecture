/** The Douglas House as a house definition for the engine (spec 045). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildDouglasHouse } from './model/douglasHouse';
import { CENTER, HOUSE, OUT_STAIR, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const DOUGLAS: HouseDefinition = {
  slug: 'douglas-house',
  text: {
    name: 'Douglas House',
    address: '3490 South Lake Shore Drive, Harbor Springs, Michigan',
    eyebrow: 'Douglas House · Richard Meier · 1973',
    headline: ['The Douglas House,', 'block by block'],
    intro: [
      'A white tower of decks and glass set into a wooded bluff above Lake Michigan, entered by a bridge at its roof. Watch all',
      'pieces snap into place, from the piles in the slope to the smokestacks. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Douglas House',
    disclaimer: "Fan tribute. Not affiliated with the house's owners or Meier Partners (formerly Richard Meier & Partners Architects).",
  },
  site: SITE,
  phases: PHASES,
  build: buildDouglasHouse,
  center: CENTER,
  // model frame (layout.ts): +x along the shore (real south-south-east), +z down the bluff to the lake (real west-south-west)
  views: {
    overview: { label: 'Overview', view: { pos: v3(110, 70, 150), target: v3(23, 14, 15) } },
    beach: { label: 'From the beach', view: { pos: v3(40, -66, 158), target: v3(23, 12, 15) } },
    bridge: { label: 'The bridge', view: { pos: v3(11.5, 36, -62), target: v3(11.5, 32, 12) } },
    living: { label: 'The living room', view: { pos: v3(50, 34, 52), target: v3(20, 10, 20) } },
    lake: { label: 'Over the lake', view: { pos: v3(22, 46, 8), target: v3(22, -30, 300) } },
  },
  // in the dining room on the 1st floor, facing the glass wall and the lake (walk mode starts near y = 0: the parking, 29 ft up,
  // is too high)
  walkStart: [20, 22, Math.PI],
  lights: { interior: [[20, 4, 22], [36, 4, 7], [20, 14, 22], [36, 24, 7], [20, 34, 6]] },
  // "No roof": the 4th floor and its roof, and the 3rd floor, down to the 2nd floor's living room; the outside stair above it too
  roofCut: { y0: (Y.F3 - Y.SLAB) * PL - 0.05, y1: (Y.TOP + 20) * PL, rects: [HOUSE, [OUT_STAIR.x0, HOUSE[3], HOUSE[2] + 6, OUT_STAIR.z1 + 1]] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'douglas-house/neighborhood.bin',
  // Petoskey, the nearest town, is about 15 km south-south-east
  downtownDir: realToModelDir(160, SITE.rotationDeg),
  // the wooded bluffs of Lake Michigan's shore, the lake at its own level (spec 045, Q4), no city
  scenery: { forest: true, city: false, sea: { levelM: 177.2 } },
  // spec 050: the model by the numbers and its palette
  stats: STATS['douglas-house'],
};

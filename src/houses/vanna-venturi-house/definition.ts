/** The Vanna Venturi House as a house definition for the engine (spec 044). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildVannaVenturiHouse } from './model/vannaVenturiHouse';
import { CENTER, HOUSE, MID, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const VANNA_VENTURI: HouseDefinition = {
  slug: 'vanna-venturi-house',
  text: {
    name: 'Vanna Venturi House',
    address: '8330 Millman Street, Chestnut Hill, Philadelphia',
    eyebrow: 'Vanna Venturi House · Robert Venturi · 1964',
    headline: ['The Vanna Venturi House,', 'block by block'],
    intro: [
      'A house like a child’s drawing of a house: a big gable split down the middle, a thin arch over the door, and a chimney the stair has to squeeze round. Watch all',
      'pieces snap into place, from the lawn to the stepped roof. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Vanna Venturi House',
    disclaimer: "Fan tribute in a generic toy-block style. Not affiliated with the house's owners or VSBA Architects & Planners (Venturi Scott Brown).",
  },
  site: SITE,
  phases: PHASES,
  build: buildVannaVenturiHouse,
  center: CENTER,
  // model frame (layout.ts): +x along the house (real south-east), −z out of the front (real north-east) toward the drive
  views: {
    overview: { label: 'Overview', view: { pos: v3(-22, 58, -58), target: v3(29, 6, 13) } },
    front: { label: 'The front', view: { pos: v3(MID, 6, -62), target: v3(MID, 10, 13) } },
    stair: { label: 'The stair', view: { pos: v3(10, 34, 30), target: v3(26, 6, 12) } },
    back: { label: 'The back', view: { pos: v3(44, 12, 56), target: v3(29, 14, 13) } },
    drive: { label: 'Up the drive', view: { pos: v3(43, 7, -205), target: v3(MID, 8, 0) } },
  },
  // on the path, in front of the door
  walkStart: [MID, -16, Math.PI],
  lights: { interior: [[29, 6, 16], [40, 6, 6], [9, 6, 5], [51, 6, 19], [28, 14, 16]] },
  // "No roof": the hipped roof and the upstairs block's, down to the eaves (the chimney stands, as does the front's parapet
  // wall, which is no roof)
  roofCut: { y0: Y.EAVE * PL - 0.05, y1: (Y.UPPER_WALL + 10) * PL, rects: [[HOUSE[0], 1, HOUSE[2], HOUSE[3]]] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'vanna-venturi-house/neighborhood.bin',
  // Center City Philadelphia is about 14 km south-south-east
  downtownDir: realToModelDir(160, SITE.rotationDeg),
  // the wooded streets of Chestnut Hill, no city in sight
  scenery: { forest: true, city: false },
};

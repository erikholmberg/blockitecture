/** The Eames House (Case Study House #8) as a house definition for the engine (spec 010b). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildEamesHouse } from './model/eamesHouse';
import { CENTER, DRIVE, SITE } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
/** sea level relative to the house: the lot is 46.4 m above the Pacific (neighborhood.bin anchor) */
const SEA_Y = -46.43 / 0.3048;

export const EAMES: HouseDefinition = {
  slug: 'eames-house',
  text: {
    name: 'Eames House',
    address: '203 Chautauqua Blvd, Pacific Palisades',
    eyebrow: 'Case Study House #8 · Charles & Ray Eames · 1949',
    headline: ['The Eames House,', 'brick by brick'],
    intro: [
      'Off-the-shelf steel, colored panels and a meadow of eucalyptus high above the Pacific. Watch all',
      'pieces snap into place, from the retaining wall to the last cushion. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to Case Study House #8',
    disclaimer:
      'Fan tribute in a generic toy-brick style. Not affiliated with the Eames Office, the Eames Foundation, Herman Miller, Vitra or the LEGO Group.',
  },
  site: SITE,
  phases: PHASES,
  build: buildEamesHouse,
  center: CENTER,
  // model frame: +x = east over the meadow, +z ≈ south toward the ocean (the real world is turned −14°)
  views: {
    overview: { label: 'Overview', view: { pos: v3(95, 55, 150), target: v3(10, 6, 62) } },
    // the classic view of the east facade from the meadow, through the eucalyptus trunks
    meadow: { label: 'From the meadow', view: { pos: v3(78, 14, 30), target: v3(6, 12, 74) } },
    courtyard: { label: 'Courtyard', view: { pos: v3(12, 6, 42), target: v3(8, 10, 70) } },
    living: { label: 'Living room', view: { pos: v3(4, 8, 98), target: v3(16, 6, 117) } },
    // high behind the studio, looking south over the roofs and the bluff to Santa Monica Bay
    bay: { label: 'Bluff & bay', view: { pos: v3(40, 140, -160), target: v3(0, -120, 600) } },
  },
  // on the meadow, facing the living room's east glass
  walkStart: [30, 100, Math.PI / 2],
  lights: { interior: [[10, 10, 106], [10, 7, 77], [10, 10, 10]] },
  // "No roof": the roof deck, gravel and curb of both pavilions (plates 41–44)
  roofCut: { y0: 16.3, y1: 18.5, rects: [[-1, -1, 21, 38], [-1, 65, 21, 126]] },
  lot: { rect: TERRAIN, surfaceFt, driveEnd: [(DRIVE[0] + DRIVE[2]) / 2, TERRAIN.z0] },
  data: 'eames-house/neighborhood.bin',
  // downtown Santa Monica, about 1.6 miles away at a bearing of ~125.6° from the house
  downtownDir: realToModelDir(125.6, SITE.rotationDeg),
  scenery: {
    sea: true,
    chaparral: true, // the Santa Monica Mountains behind the Palisades
    flatsBelow: -60, // the Santa Monica flats below the bluff
    city: { maxY: -40, minY: SEA_Y + 4 },
  },
};

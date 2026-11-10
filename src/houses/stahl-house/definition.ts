/**
 * The Stahl House (Case Study House #22) as a house definition for the engine (spec 010a).
 * Values are exactly those the viewer had hard-coded before the engine became multi-house.
 */
import type { HouseDefinition } from '@/engine/house';
import { buildStahlHouse } from './model/stahlHouse';
import { CENTER, DRIVE, SITE } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });

export const STAHL: HouseDefinition = {
  slug: 'stahl-house',
  text: {
    name: 'Stahl House',
    address: '1635 Woods Drive, Los Angeles',
    eyebrow: 'Case Study House #22 · Pierre Koenig · 1959–60',
    headline: ['The Stahl House,', 'block by block'],
    intro: [
      'Steel, glass and a view over the whole of Los Angeles. Watch all',
      'pieces snap into place on the Hollywood Hills. Fly around it, or walk in and look around while it goes up.',
    ],
    complete: 'Complete. Welcome to Case Study House #22',
  },
  site: SITE,
  phases: PHASES,
  build: buildStahlHouse,
  center: CENTER,
  // spec 006: the real world is rotated 180° to fit the model, so the LA basin lies toward −z / +x
  views: {
    overview: { label: 'Overview', view: { pos: v3(-95, 70, -120), target: v3(32, 6, 12) } },
    // eye level just outside the living room's view-side glass, looking through it toward the city (like Shulman's 1960 photo)
    famous: { label: 'The famous view', view: { pos: v3(44, 9, 62), target: v3(86, 1, 22) } }, // y 7 → 9: 3 ft above the ground (spec 028)
    pool: { label: 'Pool', view: { pos: v3(60, 9, -6), target: v3(36, 1, 16) } },
    // from above the hills behind the house, out over the Sunset Strip and the basin
    basin: { label: 'Hills & basin', view: { pos: v3(-520, 620, 1150), target: v3(32, -150, -250) } },
  },
  // on the walkway by the carport, looking down the pool toward the living room
  walkStart: [23.5, -16, -2.6],
  lights: { interior: [[58, 7, 40], [30, 8, 40], [10, 8, 15]], pool: [42, -3, 12] },
  roofCut: { y0: 11.65, y1: 14, rects: [[-3, 22.5, 78, 58], [-3, -37, 28, 23]] },
  lot: { rect: TERRAIN, surfaceFt, driveEnd: [TERRAIN.x0, (DRIVE[1] + DRIVE[3]) / 2] },
  data: 'stahl-house/neighborhood.bin',
  // downtown LA lies ESE of the house; rotated 180° like the rest of the real world
  downtownDir: [-36400, -18400],
  // spec 050: the model by the numbers and its palette
  stats: STATS['stahl-house'],
};

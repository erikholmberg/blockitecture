import type { Phase } from '@/engine/house';

/**
 * Casa Malaparte's build story (spec 031): the promontory rising out of the sea, the rock foundations, the lower floor, the red
 * walls and the upper floor, furnished inside them, the great windows, then the roof terrace with the wedge of steps reaching it
 * and the white wall, and last the pines and the scrub. About 3 minutes at 1×.
 */
export const PHASES: Phase[] = [
  { name: 'The promontory', dur: 22, order: 'wave', role: 'site' },
  { name: 'Rock foundations', dur: 8, order: 'layer', role: 'foundation' },
  { name: 'The lower floor', dur: 10, order: 'layer', role: 'floor' },
  { name: 'The red walls & the upper floor', dur: 26, order: 'layer', role: 'structure' },
  { name: 'The living room, the fireplace & furniture', dur: 28, order: 'group', role: 'interior' },
  { name: 'The great windows', dur: 20, order: 'layer', role: 'envelope' },
  { name: 'The roof terrace, the stair & the white wall', dur: 30, order: 'layer', role: 'roof' },
  { name: 'Pines & scrub', dur: 24, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

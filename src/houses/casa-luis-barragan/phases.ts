import type { Phase } from '@/engine/house';

/**
 * Casa Luis Barragán's build story (spec 035): the ground, the footings, the volcanic-stone floors, the thick walls and the
 * first floor, furnished inside the open shell (the library's floating stair among it), the windows and the yellow doors, the
 * roof with the walled terrace in pink, orange and white, and last the wild garden and the patio's clay pots. About 3 minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The ground at Tacubaya', dur: 16, order: 'wave', role: 'site' },
  { name: 'The footings', dur: 8, order: 'layer', role: 'foundation' },
  { name: 'The volcanic-stone floors', dur: 10, order: 'layer', role: 'floor' },
  { name: 'The walls & the first floor', dur: 30, order: 'layer', role: 'structure' },
  { name: 'The rooms & the library stair', dur: 28, order: 'group', role: 'interior' },
  { name: 'The windows & the yellow doors', dur: 16, order: 'layer', role: 'envelope' },
  { name: 'The roof & its coloured walls', dur: 32, order: 'layer', role: 'roof' },
  { name: 'The garden & the clay pots', dur: 28, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

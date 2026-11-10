import type { Phase } from '@/engine/house';

/**
 * The Koshino House's build story (spec 039): the wooded slope, the cut and the footings, the floors and the courtyard's steps,
 * the concrete walls of the two wings and the studio, furnished inside the open boxes, the light slots and glass, the roofs with
 * their skylight strips and the studio's curved roof, and last the pines. About 3 minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The slope above Ashiya', dur: 18, order: 'wave', role: 'site' },
  { name: 'The cut & the footings', dur: 10, order: 'layer', role: 'foundation' },
  { name: 'The floors & the courtyard steps', dur: 14, order: 'layer', role: 'floor' },
  { name: 'The concrete walls', dur: 36, order: 'layer', role: 'structure' },
  { name: 'The rooms', dur: 24, order: 'group', role: 'interior' },
  { name: 'The slots of light', dur: 16, order: 'layer', role: 'envelope' },
  { name: 'The roofs & the studio\'s curve', dur: 30, order: 'layer', role: 'roof' },
  { name: 'The pines', dur: 26, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

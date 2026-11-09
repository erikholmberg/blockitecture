import type { Phase } from '@/engine/house';

/**
 * The Lovell Health House's build story (spec 034): the canyon slope, the pool's cradle and the footings, the floors, then the
 * light steel frame standing bare (it went up in about 40 hours), furnished inside the open frame, the white gunite bands and
 * the ribbon windows, the roofs with the balconies hung from them, and last the pool's water, the oaks and the chaparral.
 * About 4 minutes at 1×.
 */
export const PHASES: Phase[] = [
  { name: 'The canyon slope', dur: 20, order: 'wave', role: 'site' },
  { name: "The pool's cradle & the footings", dur: 14, order: 'layer', role: 'foundation' },
  { name: 'The floors', dur: 14, order: 'layer', role: 'floor' },
  { name: 'The steel frame: 40 hours', dur: 36, order: 'layer', role: 'structure' },
  { name: "The rooms & Neutra's built-ins", dur: 30, order: 'group', role: 'interior' },
  { name: 'Gunite walls & ribbon windows', dur: 40, order: 'layer', role: 'envelope' },
  { name: 'The roofs & the hung balconies', dur: 32, order: 'layer', role: 'roof' },
  { name: 'The pool, the oaks & the chaparral', dur: 42, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

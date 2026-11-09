import type { Phase } from '@/engine/house';

/**
 * The Ennis House's build story (spec 025): the ridge, the podium of textile blocks, the floors and the motor court, the
 * walls rising course by course in their patterned bands, furnished inside them, the art glass, the roofs, and last the
 * pool, the chaparral and the gardens. About 4 minutes at 1×.
 */
export const PHASES: Phase[] = [
  { name: 'The ridge', dur: 18, order: 'wave', role: 'site' },
  { name: 'The podium & retaining walls', dur: 30, order: 'layer', role: 'foundation' },
  { name: 'The floors & the motor court', dur: 14, order: 'layer', role: 'floor' },
  { name: 'The textile-block walls', dur: 50, order: 'layer', role: 'structure' },
  { name: 'Teak, mosaic & furniture', dur: 36, order: 'group', role: 'interior' },
  { name: 'Art glass & the loggia', dur: 28, order: 'layer', role: 'envelope' },
  { name: 'The roofs', dur: 22, order: 'layer', role: 'roof' },
  { name: 'The pool, the chaparral & the gardens', dur: 30, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

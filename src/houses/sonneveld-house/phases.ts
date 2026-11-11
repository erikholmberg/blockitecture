import type { Phase } from '@/engine/house';

/**
 * The Sonneveld House's build story (spec 060): the garden by the Museumpark, the foundation, the ground floor, the steel
 * frame with its floors and the stair, the rooms in Van der Leck's colours, the white walls and the ribbon windows, the roof
 * terrace and its stair tower, and last the hedges and the trees. About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The garden by the Museumpark', dur: 14, order: 'wave', role: 'site' },
  { name: 'The foundation', dur: 6, order: 'layer', role: 'foundation' },
  { name: 'The ground floor', dur: 6, order: 'layer', role: 'floor' },
  { name: 'The steel frame, the floors & the stair', dur: 26, order: 'layer', role: 'structure' },
  { name: 'The rooms, in red, blue & yellow', dur: 24, order: 'group', role: 'interior' },
  { name: 'The white walls & the ribbon windows', dur: 34, order: 'layer', role: 'envelope' },
  { name: 'The roof terrace', dur: 16, order: 'layer', role: 'roof' },
  { name: 'The hedges & the trees', dur: 14, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

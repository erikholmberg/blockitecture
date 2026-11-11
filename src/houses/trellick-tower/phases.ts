import type { Phase } from '@/engine/house';

/**
 * Trellick Tower's build story (spec 061): the Cheltenham Estate by the canal, the rafts, the entrance level, the concrete
 * crosswalls and floors rising storey by storey with the service tower and its bridges, the corridors' coloured tiles and a
 * flat, the balcony front and the corridor front, the roofs and the boiler house, and last the trees. About 3 minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The Cheltenham Estate', dur: 14, order: 'wave', role: 'site' },
  { name: 'The rafts', dur: 6, order: 'layer', role: 'foundation' },
  { name: 'The entrance level', dur: 6, order: 'layer', role: 'floor' },
  { name: 'The crosswalls, the floors & the service tower', dur: 50, order: 'layer', role: 'structure' },
  { name: "The corridors' coloured tiles & a flat", dur: 14, order: 'group', role: 'interior' },
  { name: 'The balconies & the windows', dur: 50, order: 'layer', role: 'envelope' },
  { name: 'The roofs & the boiler house', dur: 14, order: 'layer', role: 'roof' },
  { name: 'The trees', dur: 12, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

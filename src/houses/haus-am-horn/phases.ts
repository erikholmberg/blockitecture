import type { Phase } from '@/engine/house';

/**
 * The Haus am Horn's build story (spec 063): the garden above the park on the Ilm, the footings, the floors in their colours,
 * the walls of slag-concrete blocks with the tall living room in the middle, the rooms and their Bauhaus furniture, the render,
 * the windows and the clerestory, the flat roofs, and last the garden. About 2 minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The garden above the Ilm', dur: 14, order: 'wave', role: 'site' },
  { name: 'The footings', dur: 6, order: 'layer', role: 'foundation' },
  { name: 'The floors', dur: 8, order: 'layer', role: 'floor' },
  { name: 'The walls, the living room in the middle', dur: 24, order: 'layer', role: 'structure' },
  { name: 'The rooms & the Bauhaus furniture', dur: 26, order: 'group', role: 'interior' },
  { name: 'The windows & the clerestory', dur: 14, order: 'layer', role: 'envelope' },
  { name: 'The flat roofs', dur: 12, order: 'layer', role: 'roof' },
  { name: 'The garden & its trees', dur: 16, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

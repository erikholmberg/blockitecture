import type { Phase } from '@/engine/house';

/**
 * The Lovell Beach House's build story (spec 056): the lot on the sand by the boardwalk, the footings and the ground slab, the
 * living floor, the five concrete frames with the bedroom floor and the stairs, the rooms furnished inside the open frames, the
 * walls and the windows, the roof and its tower, and last the palms and the sun deck's rail. About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The lot on the sand', dur: 14, order: 'wave', role: 'site' },
  { name: 'The footings & the ground slab', dur: 8, order: 'layer', role: 'foundation' },
  { name: 'The living floor', dur: 8, order: 'layer', role: 'floor' },
  { name: 'The five concrete frames & the stairs', dur: 32, order: 'layer', role: 'structure' },
  { name: 'The rooms', dur: 22, order: 'group', role: 'interior' },
  { name: 'The walls & the windows', dur: 30, order: 'layer', role: 'envelope' },
  { name: 'The roof & the tower', dur: 14, order: 'layer', role: 'roof' },
  { name: 'The palms & the sun deck', dur: 12, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

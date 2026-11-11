import type { Phase } from '@/engine/house';

/**
 * The Muuratsalo Experimental House's build story (spec 058): the granite rock above Lake Päijänne, the footings and the guest
 * wing's posts on the boulders, the floors and the courtyard's paving round the fire pit, the walls (white outside,
 * the patchwork of test panels toward the courtyard), the rooms, the windows and the guest wing's timber, the roofs, and last
 * the pines and the birches. About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The rock above Lake Päijänne', dur: 14, order: 'wave', role: 'site' },
  { name: "The footings & the guest wing's posts", dur: 8, order: 'layer', role: 'foundation' },
  { name: 'The floors & the courtyard', dur: 12, order: 'layer', role: 'floor' },
  { name: 'The walls & the patchwork', dur: 40, order: 'layer', role: 'structure' },
  { name: 'The rooms', dur: 16, order: 'group', role: 'interior' },
  { name: 'The windows & the guest wing', dur: 18, order: 'layer', role: 'envelope' },
  { name: 'The roofs', dur: 12, order: 'layer', role: 'roof' },
  { name: 'The pines & the birches', dur: 22, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

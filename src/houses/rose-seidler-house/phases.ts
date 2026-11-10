import type { Phase } from '@/engine/house';

/**
 * The Rose Seidler House's build story (spec 043): the bush slope, the sandstone base with the posts that hold the house up
 * over the slope, the floors and the deck, the frame and the ramp, furnished inside the open frame, the white walls, the glass
 * and Seidler's mural, the flat roof with its skylight, and last the ramp's rails, the rockeries and the gum trees.
 * About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The bush slope above Ku-ring-gai', dur: 16, order: 'wave', role: 'site' },
  { name: 'The sandstone base & the posts', dur: 16, order: 'layer', role: 'foundation' },
  { name: 'The floors & the deck', dur: 12, order: 'layer', role: 'floor' },
  { name: 'The frame & the ramp', dur: 18, order: 'layer', role: 'structure' },
  { name: 'The rooms', dur: 24, order: 'group', role: 'interior' },
  { name: 'The walls, the glass & the mural', dur: 26, order: 'layer', role: 'envelope' },
  { name: 'The flat roof', dur: 16, order: 'layer', role: 'roof' },
  { name: 'The rails, the rockeries & the gum trees', dur: 22, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

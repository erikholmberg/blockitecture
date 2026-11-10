import type { Phase } from '@/engine/house';

/**
 * The Douglas House's build story (spec 045): the bluff above Lake Michigan, the piles and the white skirt, the four floors, the
 * frame with the chimney and the bridge, furnished inside the open frame with the pink stair, the white walls, the glass wall
 * and the outside stair, the roof deck and the smokestacks, and last the railings and the cedars. About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The bluff above Lake Michigan', dur: 16, order: 'wave', role: 'site' },
  { name: 'The piles & the skirt', dur: 10, order: 'layer', role: 'foundation' },
  { name: 'The four floors', dur: 12, order: 'layer', role: 'floor' },
  { name: 'The frame & the bridge', dur: 18, order: 'layer', role: 'structure' },
  { name: 'The rooms & the pink stair', dur: 22, order: 'group', role: 'interior' },
  { name: 'The white walls & the glass wall', dur: 28, order: 'layer', role: 'envelope' },
  { name: 'The roof deck & the smokestacks', dur: 14, order: 'layer', role: 'roof' },
  { name: 'The railings & the cedars', dur: 24, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

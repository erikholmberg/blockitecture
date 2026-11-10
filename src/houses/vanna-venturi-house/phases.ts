import type { Phase } from '@/engine/house';

/**
 * The Vanna Venturi House's build story (spec 044): the lawn and the drive, the footings, the floor, the chimney rising through
 * the middle with the partitions and the upstairs floor, furnished inside the open frame with the stair round the chimney, then
 * the walls with the split-gable front, its arch and its windows, the stepped hipped roof and the upstairs block's roof with the
 * chimney's cap, and last the trees. About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The lawn & the drive', dur: 14, order: 'wave', role: 'site' },
  { name: 'The footings', dur: 8, order: 'layer', role: 'foundation' },
  { name: 'The floor', dur: 8, order: 'layer', role: 'floor' },
  { name: 'The chimney & the frame', dur: 22, order: 'layer', role: 'structure' },
  { name: 'The rooms & the stair', dur: 22, order: 'group', role: 'interior' },
  { name: 'The walls & the split gable', dur: 32, order: 'layer', role: 'envelope' },
  { name: 'The hipped roof', dur: 26, order: 'layer', role: 'roof' },
  { name: 'The trees', dur: 18, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

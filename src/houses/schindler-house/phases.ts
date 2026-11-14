import type { Phase } from '@/engine/house';

/**
 * The Schindler House's build story (spec 081): the lot on Kings Road and the cut for the sunken gardens, the floor slab, the
 * floors, the tilt-up slabs going up one by one with the gaps left open and the redwood frame, the studios inside the open frame,
 * the slits' glass, the canvas and the clerestories, the roof and its cornice, and last the lawns, the hedges and the bamboo.
 * About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The lot on Kings Road', dur: 14, order: 'wave', role: 'site' },
  { name: 'The floor slab', dur: 8, order: 'layer', role: 'foundation' },
  { name: 'The floors & the hearths', dur: 8, order: 'layer', role: 'floor' },
  { name: 'Tilt-up slabs & the redwood frame', dur: 30, order: 'group', role: 'structure' },
  { name: 'The studios', dur: 20, order: 'group', role: 'interior' },
  { name: 'Glass, canvas & the clerestories', dur: 24, order: 'layer', role: 'envelope' },
  { name: 'The roof & the cornice', dur: 16, order: 'layer', role: 'roof' },
  { name: 'Lawns, hedges & bamboo', dur: 22, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

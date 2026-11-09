import type { Phase } from '@/engine/house';

/**
 * The Farnsworth House's build story (spec 022): the meadow, the footings, the lower terrace, then the eight white columns
 * and the floor slab (the house floats before any glass), furnished inside the open frame, the glass, the roof slab, and
 * last the sugar maple and the trees. About 3 minutes at 1×.
 */
export const PHASES: Phase[] = [
  { name: 'The meadow & the river bank', dur: 18, order: 'wave', role: 'site' },
  { name: 'Concrete footings', dur: 8, order: 'layer', role: 'foundation' },
  { name: 'The lower terrace', dur: 14, order: 'layer', role: 'floor' },
  { name: 'The white steel frame & the floor slab', dur: 24, order: 'layer', role: 'structure' },
  { name: 'The core, the wardrobe & the furniture', dur: 32, order: 'group', role: 'interior' },
  { name: 'The glass', dur: 26, order: 'layer', role: 'envelope' },
  { name: 'The roof slab', dur: 16, order: 'layer', role: 'roof' },
  { name: 'The sugar maple & the trees', dur: 30, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

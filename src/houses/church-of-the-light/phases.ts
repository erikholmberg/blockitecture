import type { Phase } from '@/engine/house';

/**
 * The Church of the Light's build story (spec 055): the church's grounds in Ibaraki, the foundation, the floor stepping down to
 * the altar, the concrete box with the cross cut through it and the wall at 15°, the pews, the glass in the cross and the slot,
 * the roof, and last the cypresses. About 2 minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The church grounds in Ibaraki', dur: 14, order: 'wave', role: 'site' },
  { name: 'The foundation', dur: 6, order: 'layer', role: 'foundation' },
  { name: 'The floor, stepping down to the altar', dur: 10, order: 'layer', role: 'floor' },
  { name: 'The concrete box, the cross & the 15° wall', dur: 36, order: 'layer', role: 'structure' },
  { name: 'The pews', dur: 16, order: 'group', role: 'interior' },
  { name: 'The glass in the cross & the doors', dur: 8, order: 'layer', role: 'envelope' },
  { name: 'The roof', dur: 10, order: 'layer', role: 'roof' },
  { name: 'The cypresses', dur: 12, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

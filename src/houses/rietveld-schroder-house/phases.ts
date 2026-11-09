import type { Phase } from '@/engine/house';

/**
 * The Rietveld Schröder House's build story (spec 019): the street and the end of the row, the foundations, the ground
 * floor, the steel and the upper floor with its concrete balconies, furnished inside the open frame, then the planes, the
 * lines and the glass, the roof, and the garden. About 3 minutes at 1× (Q6: it's a small house).
 */
export const PHASES: Phase[] = [
  // the street, the row of houses it ends and the garden plot, spreading out from the house (as spec 005)
  { name: 'The street, the row & the garden plot', dur: 22, order: 'wave', role: 'site' },
  { name: 'Concrete foundations', dur: 10, order: 'layer', role: 'foundation' },
  { name: 'The ground floor', dur: 10, order: 'layer', role: 'floor' },
  { name: 'Steel, the upper floor & the balconies', dur: 22, order: 'layer', role: 'structure' },
  { name: 'Sliding partitions & Rietveld furniture', dur: 30, order: 'group', role: 'interior' },
  { name: 'Planes, lines & glass', dur: 36, order: 'layer', role: 'envelope' },
  { name: 'The roof & the roof light', dur: 14, order: 'layer', role: 'roof' },
  { name: 'The garden & the hedge', dur: 26, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

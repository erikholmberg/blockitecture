import type { Phase } from '@/engine/house';

/**
 * The Villa Savoye's build story (spec 074): the meadow above the Seine, the footings, the ground floor's slab and the drive's
 * bed, the pilotis with the first floor and the ramp, the rooms, the green ground floor with its curve of glass and the white
 * box with its ribbon window, the roof garden and the solarium, and last the park. About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The meadow above the Seine', dur: 14, order: 'wave', role: 'site' },
  { name: 'The footings', dur: 6, order: 'layer', role: 'foundation' },
  { name: 'The ground-floor slab & the drive\'s bed', dur: 8, order: 'layer', role: 'floor' },
  { name: 'The pilotis, the first floor & the ramp', dur: 26, order: 'layer', role: 'structure' },
  { name: 'The rooms', dur: 24, order: 'group', role: 'interior' },
  { name: 'The green ground floor, the curved glass & the ribbon window', dur: 24, order: 'layer', role: 'envelope' },
  { name: 'The roof garden & the solarium', dur: 20, order: 'layer', role: 'roof' },
  { name: 'The park, the drive & the trees', dur: 16, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

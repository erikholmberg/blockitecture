import type { Phase } from '@/engine/house';

/**
 * Unity Temple's build story (spec 062): the corner of Lake Street and Kenilworth Avenue, the footings, the floors, the poured
 * concrete walls with the stair towers and the galleries, the pews and the pulpit, the clerestory's columns and glass and the
 * doors, the cross of roof slabs with the amber skylights, and last the lawn's trees. About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The corner of Lake Street', dur: 14, order: 'wave', role: 'site' },
  { name: 'The footings', dur: 6, order: 'layer', role: 'foundation' },
  { name: 'The floors', dur: 8, order: 'layer', role: 'floor' },
  { name: 'The concrete walls, the towers & the galleries', dur: 40, order: 'layer', role: 'structure' },
  { name: 'The pews, the pulpit & the hall', dur: 20, order: 'group', role: 'interior' },
  { name: 'The columns, the clerestory & the doors', dur: 24, order: 'layer', role: 'envelope' },
  { name: 'The roof slabs & the skylights', dur: 22, order: 'layer', role: 'roof' },
  { name: "The lawn's trees", dur: 12, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

import type { Phase } from '@/engine/house';

/**
 * Habitat 67's build story (spec 072): the pier by the river, the footings and the parking level, the ground-level street, the
 * boxes lifted in level by level and group by group with the lift cores and the streets rising among them, a dwelling and the
 * lifts, the windows and the plexiglass, the open roofs and the streets' covers, and last the roof gardens and the pier's trees.
 * About 3 minutes; the stacking is the longest part.
 */
export const PHASES: Phase[] = [
  { name: 'The Cité du Havre pier & the river bank', dur: 14, order: 'wave', role: 'site' },
  { name: 'The footings & the parking level', dur: 10, order: 'layer', role: 'foundation' },
  { name: 'The ground-level street & the forecourts', dur: 6, order: 'layer', role: 'floor' },
  { name: 'The boxes, crane-lift by crane-lift, with the lift cores & the streets', dur: 56, order: 'group', role: 'structure' },
  { name: 'A dwelling & the lifts', dur: 12, order: 'group', role: 'interior' },
  { name: 'The windows, the guardrails & the streets’ plexiglass', dur: 36, order: 'layer', role: 'envelope' },
  { name: 'The open roofs: terraces & the streets’ covers', dur: 20, order: 'layer', role: 'roof' },
  { name: 'The roof gardens & the pier’s trees', dur: 16, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

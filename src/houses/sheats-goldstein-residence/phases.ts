import type { Phase } from '@/engine/house';

/**
 * The Sheats-Goldstein Residence's build story (spec 040): the ridge, the footings and the pool's basin, the floors and the
 * terrace, the concrete walls of the bedroom wing and the living room and level −1 below, the rooms, the glass, the coffered roof
 * with its hundreds of skylights, and last the garden, the pool's water and the tennis court. About 4 minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The ridge above Beverly Hills', dur: 22, order: 'wave', role: 'site' },
  { name: 'Footings & the pool\'s basin', dur: 14, order: 'layer', role: 'foundation' },
  { name: 'The floors & the terrace', dur: 16, order: 'layer', role: 'floor' },
  { name: 'The concrete walls', dur: 38, order: 'layer', role: 'structure' },
  { name: 'The built-in rooms', dur: 26, order: 'group', role: 'interior' },
  { name: 'The glass', dur: 20, order: 'layer', role: 'envelope' },
  { name: 'The coffered roof & its skylights', dur: 52, order: 'layer', role: 'roof' },
  { name: 'The garden, the pool & the court', dur: 52, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

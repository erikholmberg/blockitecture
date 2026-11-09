import type { Phase } from '@/engine/house';

/**
 * The Kaufmann Desert House's build story (spec 033): the desert floor, the footings and the pool's shell, the floors and
 * terraces, the stone walls and steel posts with the gloriette's deck, furnished inside the open frame, the glass and the
 * louvres, the thin flat roofs, and last the pool's water and the garden. About 3 minutes at 1×.
 */
export const PHASES: Phase[] = [
  { name: 'The desert floor', dur: 18, order: 'wave', role: 'site' },
  { name: 'Footings & the pool', dur: 10, order: 'layer', role: 'foundation' },
  { name: 'The floors & terraces', dur: 14, order: 'layer', role: 'floor' },
  { name: 'Stone walls, steel posts & the gloriette', dur: 28, order: 'layer', role: 'structure' },
  { name: 'The living room & the bedrooms', dur: 28, order: 'group', role: 'interior' },
  { name: 'Sliding glass & the louvres', dur: 24, order: 'layer', role: 'envelope' },
  { name: 'The thin flat roofs', dur: 22, order: 'layer', role: 'roof' },
  { name: 'The pool, palms & the desert garden', dur: 28, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

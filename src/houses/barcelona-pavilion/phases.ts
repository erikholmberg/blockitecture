import type { Phase } from '@/engine/house';

/**
 * The Barcelona Pavilion's build story (spec 075): the slope of Montjuïc, the travertine plinth with the pools' basins, its
 * paving and the stair, the eight chrome columns standing alone, the onyx wall and the Barcelona chairs inside the open frame,
 * the free-standing walls of marble, travertine and tinted glass, the two thin roofs (the red curtain hangs from the main one),
 * and last the water, Kolbe's statue and the trees. About 1½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The slope of Montjuïc', dur: 10, order: 'wave', role: 'site' },
  { name: "The travertine plinth & the pools' basins", dur: 12, order: 'layer', role: 'foundation' },
  { name: 'The travertine paving & the stair', dur: 8, order: 'layer', role: 'floor' },
  { name: 'The eight chrome columns', dur: 8, order: 'layer', role: 'structure' },
  { name: 'The onyx wall & the Barcelona chairs', dur: 10, order: 'group', role: 'interior' },
  { name: 'The marble, travertine & tinted glass walls', dur: 14, order: 'group', role: 'envelope' },
  { name: 'The floating roofs', dur: 12, order: 'layer', role: 'roof' },
  { name: 'The water, the statue & the trees', dur: 9, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

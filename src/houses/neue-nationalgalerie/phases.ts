import type { Phase } from '@/engine/house';

/**
 * The Neue Nationalgalerie's build story (spec 057): the Kulturforum, the granite podium and the sunken sculpture garden, the
 * hall's floor, the eight steel columns, the marble shafts and the cloakrooms inside, the glass walls, and last the great black
 * roof set on the columns (the real one was jacked up in one piece in 1967), then the garden's trees. About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The Kulturforum', dur: 14, order: 'wave', role: 'site' },
  { name: 'The granite podium & the sculpture garden', dur: 18, order: 'layer', role: 'foundation' },
  { name: "The hall's floor", dur: 8, order: 'layer', role: 'floor' },
  { name: 'The eight columns', dur: 10, order: 'layer', role: 'structure' },
  { name: 'The marble shafts & the cloakrooms', dur: 16, order: 'group', role: 'interior' },
  { name: 'The glass walls', dur: 26, order: 'layer', role: 'envelope' },
  { name: 'The steel roof', dur: 40, order: 'layer', role: 'roof' },
  { name: "The garden's trees & sculptures", dur: 14, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

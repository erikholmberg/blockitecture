import type { Phase } from '@/engine/house';

/**
 * The Bauhaus Dessau's build story (spec 076): the flat town site between Gropiusallee and Bauhausstraße, the basements' dark
 * plinth, the ground floors, the concrete frame with the wings and the bridge on its piers, the workshops, the Aula, the
 * canteen and a studio, then the curtain wall, the windows, the balconies, the red door and the lettering, the flat roofs and
 * the roof terrace, and last the lawns and the lime trees. About 3 minutes.
 */
export const PHASES: Phase[] = [
  { name: 'Gropiusallee & Bauhausstraße', dur: 14, order: 'wave', role: 'site' },
  { name: 'The basements & the dark plinth', dur: 8, order: 'layer', role: 'foundation' },
  { name: 'The ground floors', dur: 8, order: 'layer', role: 'floor' },
  { name: 'The concrete frame, the wings & the bridge on its piers', dur: 48, order: 'layer', role: 'structure' },
  { name: 'The workshops, the Aula, the canteen & a studio', dur: 22, order: 'group', role: 'interior' },
  { name: 'The curtain wall, the windows, the balconies, the red doors & the lettering', dur: 44, order: 'layer', role: 'envelope' },
  { name: 'The flat roofs & the roof terrace', dur: 16, order: 'layer', role: 'roof' },
  { name: 'The lawns & the lime trees', dur: 12, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };

/** The Centre Pompidou as a house definition for the engine (spec 080). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildCentrePompidou } from './model/centrePompidou';
import { CENTER, COL_Y1, FLIGHTS, flightY, FLOOR_Z0, FLOOR_Z1, LENGTH, levelY, SITE, trussBottom } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { WATER_AREAS } from './model/water';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;
/** inside the top flight of the Chenille, a passenger's eye over its floor */
const TOP = FLIGHTS[FLIGHTS.length - 1];
const CHENILLE_X = 100;

export const CENTRE_POMPIDOU: HouseDefinition = {
  slug: 'centre-pompidou',
  text: {
    name: 'Centre Pompidou',
    address: 'Place Georges-Pompidou, Paris',
    eyebrow: 'Centre Pompidou · Renzo Piano & Richard Rogers · 1977',
    headline: ['The Centre Pompidou,', 'block by block'],
    intro: [
      'A white steel cage 166 m long in the heart of Paris, with its structure, its pipes and its escalators all on the outside: ' +
        'blue for air, green for water, yellow for electricity and red for moving people. Watch all',
      'pieces snap into place, level by level. Fly around it, or walk down the piazza to its doors.',
    ],
    complete: 'Complete. Welcome to the Centre Pompidou',
    disclaimer: 'Fan tribute. Not affiliated with the Centre Pompidou.',
    noun: 'centre',
  },
  site: SITE,
  phases: PHASES,
  build: buildCentrePompidou,
  center: CENTER,
  // model frame (layout.ts): +x along the building toward its north end (rue Rambuteau), +z across it toward rue Beaubourg
  // (east); the piazza lies to the west (−z)
  views: {
    overview: { label: 'Overview', view: { pos: v3(700, 260, -380), target: v3(270, 60, 100) } },
    // from the top of the piazza by rue Saint-Martin, down the slope to the west front (the thumbnail's camera)
    piazza: { label: 'The piazza', view: { pos: v3(470, 40, -196), target: v3(230, 72, 80) } },
    chenille: {
      label: 'The Chenille',
      view: { pos: v3(CHENILLE_X, (flightY(TOP, CHENILLE_X) + 14) * PL, 10), target: v3(CHENILLE_X + 140, (flightY(TOP, CHENILLE_X) - 40) * PL, -400) },
    },
    beaubourg: { label: 'Rue Beaubourg', view: { pos: v3(360, 14, 248), target: v3(250, 70, 190) } },
    forum: { label: 'The Forum', view: { pos: v3(30, 6, 132), target: v3(200, 7, 114) } },
    above: { label: 'From above', view: { pos: v3(290.5, 1150, 30.5), target: v3(290, 0, 30) } },
  },
  // halfway down the piazza, facing the west front (east, +z); the walker starts on ground under 4 ft, and the piazza's top
  // by rue Saint-Martin is 10 ft up
  walkStart: [300, -95, Math.PI],
  lights: {
    interior: [
      [100, 14, 100], [300, 14, 100], [470, 14, 100], [150, (levelY(2) + 20) * PL, 100], [400, (levelY(2) + 20) * PL, 100],
      [200, (levelY(5) + 20) * PL, 90], [480, (levelY(6) + 20) * PL, 60], [300, (levelY(6) + 12) * PL, 10],
    ],
  },
  // "No roof": the roof, its truss and everything on it, down to the restaurant's ceiling
  roofCut: { y0: (trussBottom(5) - 0.5) * PL, y1: (COL_Y1 + 40) * PL, rects: [[0, FLOOR_Z0, LENGTH, FLOOR_Z1]] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'centre-pompidou/neighborhood.bin',
  // La Défense lies to the west-north-west
  downtownDir: realToModelDir(290, SITE.rotationDeg),
  // Paris: built-up and flat, no rock (spec 019's lowland colours); the Stravinsky Fountain's basin and the Seine as water (spec 022)
  scenery: { lowlands: true, waterAreas: WATER_AREAS },
  // spec 080: 549 ft of cage and 150 ft of height need a wide shadow box
  shadowReach: 350,
  stats: STATS['centre-pompidou'],
};

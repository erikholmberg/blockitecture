/** The Rietveld Schröder House as a house definition for the engine (spec 019). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildSchroderHouse } from './model/schroderHouse';
import { CENTER, D, SITE, W, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const SCHRODER: HouseDefinition = {
  slug: 'rietveld-schroder-house',
  text: {
    name: 'Rietveld Schröder House',
    address: 'Prins Hendriklaan 50, Utrecht',
    eyebrow: 'Schröder House · Gerrit Rietveld · 1924',
    headline: ['The Rietveld Schröder House,', 'block by block'],
    intro: [
      'White and grey planes, black frames and lines in red, blue and yellow, at the end of an ordinary row of houses. Watch all',
      'pieces snap into place, from the foundations to the hanging lamp. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Schröder House',
    disclaimer:
      'Fan tribute in a generic toy-block style. Not affiliated with the Centraal Museum, the Rietveld Schröderhuis, Cassina or the LEGO Group.',
  },
  site: SITE,
  phases: PHASES,
  build: buildSchroderHouse,
  center: CENTER,
  // model frame: +x = east along the front (away from the row), +z = toward the front and Prins Hendriklaan
  views: {
    overview: { label: 'Overview', view: { pos: v3(75, 45, 95), target: v3(10, 6, 16) } },
    // the famous photographs: the front and the east side from the corner of the street
    corner: { label: 'The corner', view: { pos: v3(52, 6, 68), target: v3(12, 10, 26) } },
    upstairs: { label: 'Upper floor', view: { pos: v3(22, 13, 29), target: v3(6, 9, 14) } },
    row: { label: 'Along the row', view: { pos: v3(-40, 8, 70), target: v3(10, 10, 30) } },
    motorway: { label: 'From the motorway side', view: { pos: v3(85, 14, 10), target: v3(15, 8, 16) } },
  },
  // on the pavement of Prins Hendriklaan, facing the front
  walkStart: [16, 70, 0],
  lights: { interior: [[12, 13, 24], [6, 4, 10], [18, 4, 26]] },
  // "No roof": the roof slabs and the roof light
  roofCut: { y0: (Y.ROOF - 3) * PL - 0.05, y1: (Y.LIGHT + 1) * PL, rects: [[-1, -1, W + 3, D + 3]] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'rietveld-schroder-house/neighborhood.bin',
  // Utrecht's centre is about 2 km west-north-west (bearing ~290°); there's no procedural city here
  downtownDir: realToModelDir(290, SITE.rotationDeg),
  scenery: { lowlands: true, city: false },
};


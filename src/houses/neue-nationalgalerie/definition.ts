/** The Neue Nationalgalerie as a house definition for the engine (spec 057). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildGallery } from './model/gallery';
import { CENTER, ROOF, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const NEUE_NATIONALGALERIE: HouseDefinition = {
  slug: 'neue-nationalgalerie',
  text: {
    name: 'Neue Nationalgalerie',
    address: 'Potsdamer Straße 50, Berlin',
    eyebrow: 'Neue Nationalgalerie · Mies van der Rohe · 1968',
    headline: ['The Neue Nationalgalerie,', 'block by block'],
    intro: [
      'A square black steel roof on eight columns over a hall of glass, on a granite terrace in Berlin\'s Kulturforum. Watch all',
      'pieces snap into place, from the podium to the roof. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to the Neue Nationalgalerie',
    disclaimer: 'Fan tribute. Not affiliated with the Staatliche Museen zu Berlin or David Chipperfield Architects.',
    noun: 'gallery',
  },
  site: SITE,
  phases: PHASES,
  build: buildGallery,
  center: CENTER,
  // model frame (layout.ts): +x along the hall toward the Landwehrkanal (real south-south-west), +z from Potsdamer Straße west
  views: {
    overview: { label: 'Overview', view: { pos: v3(-150, 110, -190), target: v3(108, 8, 108) } },
    street: { label: 'From Potsdamer Straße', view: { pos: v3(108, 7, -150), target: v3(108, 16, 108) } },
    under: { label: 'Under the roof', view: { pos: v3(10, 8, 12), target: v3(110, 26, 108) } },
    hall: { label: 'The hall', view: { pos: v3(40, 7, 40), target: v3(160, 10, 160) } },
    above: { label: 'From above', view: { pos: v3(108.5, 420, 108.6), target: v3(108, 0, 108) } },
  },
  // inside the doors from Potsdamer Straße, facing into the hall
  walkStart: [108, 34, Math.PI],
  lights: { interior: [[60, 24, 60], [156, 24, 60], [60, 24, 156], [156, 24, 156], [108, 24, 108]] },
  // "No roof": the roof's girders and top
  roofCut: { y0: (Y.CEILING - 0.5) * PL, y1: (Y.ROOF + 2) * PL, rects: [ROOF] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'neue-nationalgalerie/neighborhood.bin',
  // Berlin's Mitte lies to the east-north-east, past Potsdamer Platz
  downtownDir: realToModelDir(70, SITE.rotationDeg),
  stats: STATS['neue-nationalgalerie'],
};

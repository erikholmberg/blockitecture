/**
 * Spec 007: the renderings shown on the home page. Pure data (no React, no Three.js).
 * Adding a house: an entry here, a `<slug>/index.html` page (listed in vite.config.ts PAGES),
 * and its static files in `public/<slug>/` (thumbnail.jpg, data).
 */
export interface House {
  slug: string;
  title: string;
  subtitle?: string;
  architect: string;
  year: number;
  location: string;
  status: 'live' | 'coming-soon';
  /** pieces in the finished model (live houses) */
  pieces?: number;
  /** 16:9 image under public/ (live houses) */
  thumbnail?: string;
  blurb: string;
  /** spec 021: organisations this tribute isn't affiliated with, as named on the house's intro card (live houses) */
  affiliations?: string[];
  /** spec 021: what the model was built from, for the credits page (live houses) */
  sources?: string[];
}

export const HOUSES: House[] = [
  {
    slug: 'stahl-house',
    title: 'Stahl House',
    subtitle: 'Case Study House #22',
    architect: 'Pierre Koenig',
    year: 1960,
    location: 'Hollywood Hills, Los Angeles',
    status: 'live',
    pieces: 27_233,
    thumbnail: '/stahl-house/thumbnail.jpg',
    blurb: 'Steel, glass and a view over the whole of Los Angeles, on the real hillside above the Sunset Strip.',
    sources: [
      'Published photographs and descriptions of the house',
      'Its outline and neighbourhood: OpenStreetMap',
    ],
  },
  {
    slug: 'eames-house',
    title: 'Eames House',
    subtitle: 'Case Study House #8',
    architect: 'Charles & Ray Eames',
    year: 1949,
    location: 'Pacific Palisades, Los Angeles',
    status: 'live',
    pieces: 21_657,
    thumbnail: '/eames-house/thumbnail.jpg',
    blurb: 'Off-the-shelf steel and colored panels in a eucalyptus meadow above the Pacific.',
    affiliations: ['the Eames Office', 'the Eames Foundation', 'Herman Miller', 'Vitra'],
    sources: [
      'Published dimensions, descriptions and photographs of the house and its furniture',
      'Its outline and neighbourhood: OpenStreetMap',
    ],
  },
  {
    slug: 'fallingwater',
    title: 'Fallingwater',
    architect: 'Frank Lloyd Wright',
    year: 1939,
    location: 'Mill Run, Pennsylvania',
    status: 'live',
    pieces: 58_425,
    thumbnail: '/fallingwater/thumbnail.jpg',
    blurb: 'Ochre concrete terraces cantilevered over the falls of Bear Run, in a ravine of rhododendron and hemlock.',
    affiliations: ['the Western Pennsylvania Conservancy', 'the Frank Lloyd Wright Foundation'],
    sources: [
      'Measured drawings: Historic American Buildings Survey, HABS PA-5346 (2010), Library of Congress',
      'The National Historic Landmark nomination (National Park Service)',
      'Its outline, Bear Run and the neighbourhood: OpenStreetMap',
    ],
  },
  // spec 016: the next houses, picked from a shortlist of 20
  {
    slug: 'rietveld-schroder-house',
    title: 'Rietveld Schröder House',
    architect: 'Gerrit Rietveld',
    year: 1924,
    location: 'Utrecht, Netherlands',
    status: 'live',
    pieces: 10_668,
    thumbnail: '/rietveld-schroder-house/thumbnail.jpg',
    blurb: 'De Stijl planes in red, blue, yellow, black and white, at the end of an ordinary row of houses.',
    affiliations: ['the Centraal Museum', 'the Rietveld Schröderhuis', 'Cassina'],
    sources: [
      'Photographs by Sailko, Wikimedia Commons, CC BY 3.0',
      'Photographs by A. J. van der Wal (Rijksdienst voor het Cultureel Erfgoed), Wikimedia Commons, CC BY-SA 4.0',
      'Its outline, the row of houses and the streets: OpenStreetMap',
    ],
  },
  {
    slug: 'farnsworth-house',
    title: 'Farnsworth House',
    architect: 'Ludwig Mies van der Rohe',
    year: 1951,
    location: 'Plano, Illinois',
    status: 'live',
    pieces: 13_052,
    thumbnail: '/farnsworth-house/thumbnail.jpg',
    blurb: 'A white steel and glass box floating on stilts above the Fox River floodplain.',
    affiliations: ['the National Trust for Historic Preservation', 'the Farnsworth House'],
    sources: [
      'Measured drawings: Historic American Buildings Survey, HABS IL-1105 (2009), Library of Congress',
      'Its outline, the Fox River and the neighbourhood: OpenStreetMap',
    ],
  },
  {
    slug: 'ennis-house',
    title: 'Ennis House',
    architect: 'Frank Lloyd Wright',
    year: 1924,
    location: 'Los Feliz, Los Angeles',
    status: 'live',
    pieces: 31_820,
    thumbnail: '/ennis-house/thumbnail.jpg',
    blurb: 'Thousands of patterned concrete textile blocks on a ridge above Los Angeles.',
    affiliations: ['the Ennis House Foundation', 'the Frank Lloyd Wright Foundation'],
    sources: [
      'Measured drawing: Historic American Buildings Survey, HABS CA-1942 (1969), Library of Congress',
      'Its outline and the neighbourhood: OpenStreetMap (Los Angeles County building outlines)',
      'Published photographs of the house',
    ],
  },
  {
    slug: 'casa-malaparte',
    title: 'Casa Malaparte',
    architect: 'Adalberto Libera / Curzio Malaparte',
    year: 1938,
    location: 'Capri, Italy',
    status: 'live',
    pieces: 59_758,
    thumbnail: '/casa-malaparte/thumbnail.jpg',
    blurb: 'A red box on a cliff above the sea, with a wedge-shaped stair rising to the roof.',
    affiliations: ['the Fondazione Giorgio Ronchi'],
    sources: [
      'Its outline, the coastline and the neighbourhood: OpenStreetMap',
      'Photographs on Wikimedia Commons by Eoghanacht (CC0), Jerzy Strzelecki and Wolfgang Moroder (CC BY-SA 3.0), FriedrichFrisch (CC BY-SA 4.0) and Ernest Delaville (CC BY 2.0)',
    ],
  },
  // spec 020: an eighth card, so the grid ends on a full row
  {
    slug: 'kaufmann-desert-house',
    title: 'Kaufmann Desert House',
    architect: 'Richard Neutra',
    year: 1946,
    location: 'Palm Springs, California',
    status: 'live',
    pieces: 20_326,
    thumbnail: '/kaufmann-desert-house/thumbnail.jpg',
    blurb: 'A pinwheel of glass and steel around a pool, with the San Jacinto Mountains rising behind.',
    affiliations: ['the owners of the Kaufmann House', 'the Neutra estate'],
    sources: [
      'Its outline, its pool and the neighbourhood: OpenStreetMap',
      'Photograph: The Kaufmann House, Palm Springs, California, Library of Congress (LCCN 2013631255), public domain',
      'Published plans and photographs of the house',
    ],
  },
  {
    slug: 'lovell-health-house',
    title: 'Lovell Health House',
    architect: 'Richard Neutra',
    year: 1929,
    location: 'Los Feliz, Los Angeles',
    status: 'live',
    pieces: 23_428,
    thumbnail: '/lovell-health-house/thumbnail.jpg',
    blurb: 'America\'s first steel-framed house: white bands and ribbon windows stepping down a canyon, the pool beneath.',
    affiliations: ['the owners of the Lovell House', 'the Neutra estate'],
    sources: [
      'Measured drawings: Historic American Buildings Survey, HABS CA-1936 (1969), Library of Congress',
      'Its outline and the neighbourhood: OpenStreetMap (Los Angeles County building outlines)',
      'Published photographs of the house',
    ],
  },
  {
    slug: 'casa-luis-barragan',
    title: 'Casa Luis Barragán',
    architect: 'Luis Barragán',
    year: 1948,
    location: 'Tacubaya, Mexico City',
    status: 'live',
    pieces: 24_482,
    thumbnail: '/casa-luis-barragan/thumbnail.jpg',
    blurb: 'A plain grey wall to the street; inside, tall quiet rooms, a wild garden and a roof terrace walled in pink and orange.',
    affiliations: ['the Casa Luis Barragán', 'the Fundación de Arquitectura Tapatía Luis Barragán', 'the Barragan Foundation'],
    sources: [
      'Plans, sections and facades at 1:200: the UNESCO World Heritage nomination, "Casa Estudio Luis Barragán" (WHC 1136, 2003)',
      'Its outline, its street and the neighbourhood: OpenStreetMap',
      'Published photographs of the house',
    ],
  },
];

export const houseUrl = (h: House) => `/${h.slug}/`;

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
  /** spec 053: the building's Wikidata entry (Q…), so search engines and AI models can tie the page to it; none for a house
   *  that has no entry (the Koshino House, 2026-11-10) */
  wikidata?: string;
}

export const HOUSES: House[] = [
  {
    slug: 'stahl-house',
    wikidata: 'Q2328939',
    title: 'Stahl House',
    subtitle: 'Case Study House #22',
    architect: 'Pierre Koenig',
    year: 1960,
    location: 'Hollywood Hills, Los Angeles',
    status: 'live',
    pieces: 27_233,
    thumbnail: '/stahl-house/thumbnail.jpg',
    blurb: 'Steel, glass and a view over the whole of Los Angeles, from a hillside above the Sunset Strip.',
    sources: [
      'Published photographs and descriptions of the house',
      'Its outline and neighbourhood: OpenStreetMap',
    ],
  },
  {
    slug: 'eames-house',
    wikidata: 'Q980011',
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
    wikidata: 'Q463179',
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
    wikidata: 'Q914231',
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
    wikidata: 'Q1397013',
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
    wikidata: 'Q578184',
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
    wikidata: 'Q2165447',
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
    wikidata: 'Q6378695',
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
    wikidata: 'Q6692217',
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
    wikidata: 'Q1046414',
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
  {
    slug: 'koshino-house',
    title: 'Koshino House',
    architect: 'Tadao Ando',
    year: 1981,
    location: 'Ashiya, Japan',
    status: 'live',
    pieces: 32_677,
    thumbnail: '/koshino-house/thumbnail.jpg',
    blurb: 'Two boxes of bare concrete sunk into a wooded slope, a courtyard of steps between them, and a curved studio.',
    affiliations: ['Hiroko Koshino', 'KH Gallery', 'Tadao Ando Architect & Associates'],
    sources: [
      'Plans, section and aerial photograph as published (ArchDaily, "AD Classics: Koshino House"; Arquitectura Viva), without dimensions',
      'Its outline and the neighbourhood: OpenStreetMap',
      'Published photographs of the house',
    ],
  },
  {
    slug: 'sheats-goldstein-residence',
    wikidata: 'Q2178401',
    title: 'Sheats-Goldstein Residence',
    architect: 'John Lautner',
    year: 1963,
    location: 'Beverly Crest, Los Angeles',
    status: 'live',
    pieces: 56_669,
    thumbnail: '/sheats-goldstein-residence/thumbnail.jpg',
    blurb: 'A coffered concrete roof pierced by hundreds of skylights, over a living room open to the pool and the whole city.',
    affiliations: ['James Goldstein', 'LACMA', 'the John Lautner Foundation'],
    sources: [
      'Plans of levels 0 and −1 as published (designboom, courtesy of James Goldstein), without dimensions',
      'Its outline and the neighbourhood: OpenStreetMap (Los Angeles County building outlines)',
      'Published photographs and descriptions of the house',
    ],
  },
  {
    slug: 'rose-seidler-house',
    wikidata: 'Q7367931',
    title: 'Rose Seidler House',
    architect: 'Harry Seidler',
    year: 1950,
    location: 'Sydney, Australia',
    status: 'live',
    pieces: 19_226,
    thumbnail: '/rose-seidler-house/thumbnail.jpg',
    blurb: 'A white square raised over the bush, an open deck in its middle, a ramp to the garden and a mural in primary colours.',
    affiliations: ['Museums of History NSW', 'Harry Seidler & Associates'],
    sources: [
      "Harry Seidler's published floor plan (seidler.net.au), without dimensions",
      'The State Heritage Register listing (SHR 00261) and Museums of History NSW',
      'Its outline and the neighbourhood: OpenStreetMap',
      'Published photographs of the house',
    ],
  },
  {
    slug: 'douglas-house',
    wikidata: 'Q3661091',
    title: 'Douglas House',
    architect: 'Richard Meier',
    year: 1973,
    location: 'Harbor Springs, Michigan',
    status: 'live',
    pieces: 33_445,
    thumbnail: '/douglas-house/thumbnail.jpg',
    blurb: 'A white tower of decks and glass set into a wooded bluff above Lake Michigan, entered by a bridge at its roof.',
    affiliations: ["the house's owners", 'Meier Partners (formerly Richard Meier & Partners Architects)'],
    sources: [
      'The National Register of Historic Places nomination (2016), floor by floor, without plans or dimensions',
      'The roof plan and aerial photograph published by the house (douglashouse.org)',
      'Its outline and the neighbourhood: OpenStreetMap',
      'Published photographs of the house',
    ],
  },
  {
    slug: 'church-of-the-light',
    wikidata: 'Q1655766',
    title: 'Church of the Light',
    architect: 'Tadao Ando',
    year: 1989,
    location: 'Ibaraki, Osaka',
    status: 'live',
    pieces: 13_870,
    thumbnail: '/church-of-the-light/thumbnail.jpg',
    blurb: 'A concrete box cut through by a wall at 15°, with a cross of light cut into the wall behind the altar.',
    affiliations: ['the Ibaraki Kasugaoka Church', 'Tadao Ando Architect & Associates'],
    sources: [
      "Tadao Ando Architect & Associates' 1:50 floor plan, with its dimensions",
      'Published sections and photographs of the chapel',
      'Its outline and the neighbourhood: OpenStreetMap',
    ],
  },
  {
    slug: 'lovell-beach-house',
    wikidata: 'Q746490',
    title: 'Lovell Beach House',
    architect: 'Rudolph Schindler',
    year: 1926,
    location: 'Newport Beach, California',
    status: 'live',
    pieces: 16_923,
    thumbnail: '/lovell-beach-house/thumbnail.jpg',
    blurb: 'Five concrete frames lift the house off the sand at Balboa, a row of bedrooms hung between them over 13th Street.',
    affiliations: ["the house's owners"],
    sources: [
      'The Historic American Buildings Survey (HABS CA-1986, 1968): measured plans, elevations and sections',
      'The National Register of Historic Places nomination (1974)',
      'Its outline and the neighbourhood: OpenStreetMap',
      'Published photographs of the house',
    ],
  },
];

export const houseUrl = (h: House) => `/${h.slug}/`;

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
  },
  // spec 016: the next houses, picked from a shortlist of 20
  {
    slug: 'rietveld-schroder-house',
    title: 'Rietveld Schröder House',
    architect: 'Gerrit Rietveld',
    year: 1924,
    location: 'Utrecht, Netherlands',
    status: 'coming-soon',
    blurb: 'De Stijl planes in red, blue, yellow, black and white, at the end of an ordinary row of houses.',
  },
  {
    slug: 'farnsworth-house',
    title: 'Farnsworth House',
    architect: 'Ludwig Mies van der Rohe',
    year: 1951,
    location: 'Plano, Illinois',
    status: 'coming-soon',
    blurb: 'A white steel and glass box floating on stilts above the Fox River floodplain.',
  },
  {
    slug: 'ennis-house',
    title: 'Ennis House',
    architect: 'Frank Lloyd Wright',
    year: 1924,
    location: 'Los Feliz, Los Angeles',
    status: 'coming-soon',
    blurb: 'Thousands of patterned concrete textile blocks on a ridge above Los Angeles.',
  },
  {
    slug: 'casa-malaparte',
    title: 'Casa Malaparte',
    architect: 'Adalberto Libera / Curzio Malaparte',
    year: 1938,
    location: 'Capri, Italy',
    status: 'coming-soon',
    blurb: 'A red box on a cliff above the sea, with a wedge-shaped stair rising to the roof.',
  },
];

export const houseUrl = (h: House) => `/${h.slug}/`;

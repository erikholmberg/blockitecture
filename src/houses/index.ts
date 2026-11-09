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
    status: 'coming-soon',
    blurb: 'Concrete terraces cantilevered over a waterfall on Bear Run.',
  },
];

export const houseUrl = (h: House) => `/${h.slug}/`;

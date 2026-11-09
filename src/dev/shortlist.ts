/**
 * Dev-only: the shortlist of houses to build next (spec 016), for the photo page at /dev/shortlist/.
 * `wiki` is the English Wikipedia article (its lead photo); `commons` the Wikimedia Commons search for more photos.
 */
export interface Candidate {
  slug: string;
  title: string;
  architect: string;
  year: number;
  place: string;
  why: string;
  fit: 1 | 2 | 3;
  wiki?: string;
  commons: string;
}

export const SHORTLIST: Candidate[] = [
  { slug: 'fallingwater', title: 'Fallingwater', architect: 'Frank Lloyd Wright', year: 1939, place: 'Mill Run, Pennsylvania', fit: 2,
    why: 'Concrete terraces cantilevered over a waterfall. Needs flowing water and a forest.', wiki: 'Fallingwater', commons: 'Fallingwater' },
  { slug: 'rietveld-schroder-house', title: 'Rietveld Schröder House', architect: 'Gerrit Rietveld', year: 1924, place: 'Utrecht', fit: 3,
    why: 'De Stijl planes in red, blue, yellow, black and white: it already looks like a toy.', wiki: 'Rietveld Schröder House', commons: 'Rietveld Schröder House' },
  { slug: 'farnsworth-house', title: 'Farnsworth House', architect: 'Mies van der Rohe', year: 1951, place: 'Plano, Illinois', fit: 3,
    why: 'A white steel and glass box floating on stilts over the Fox River floodplain.', wiki: 'Farnsworth House', commons: 'Farnsworth House' },
  { slug: 'glass-house', title: 'Glass House', architect: 'Philip Johnson', year: 1949, place: 'New Canaan, Connecticut', fit: 3,
    why: 'A glass box in a meadow, with the windowless Brick House facing it.', wiki: 'Glass House (New Canaan, Connecticut)', commons: 'Philip Johnson Glass House' },
  { slug: 'ennis-house', title: 'Ennis House', architect: 'Frank Lloyd Wright', year: 1924, place: 'Los Angeles', fit: 2,
    why: 'Built from thousands of patterned concrete textile blocks, on a Hollywood Hills ridge.', wiki: 'Ennis House', commons: 'Ennis House' },
  { slug: 'casa-malaparte', title: 'Casa Malaparte', architect: 'Adalberto Libera / Curzio Malaparte', year: 1938, place: 'Capri', fit: 2,
    why: 'A red box on a sea cliff with a wedge-shaped stair up to the roof.', wiki: 'Casa Malaparte', commons: 'Casa Malaparte' },
  { slug: 'villa-savoye', title: 'Villa Savoye', architect: 'Le Corbusier', year: 1931, place: 'Poissy, France', fit: 2,
    why: 'A white box on thin columns: ribbon windows, a ramp, a roof garden, a curved glass ground floor.', wiki: 'Villa Savoye', commons: 'Villa Savoye' },
  { slug: 'kaufmann-desert-house', title: 'Kaufmann Desert House', architect: 'Richard Neutra', year: 1946, place: 'Palm Springs', fit: 3,
    why: 'A pinwheel plan, a pool and the San Jacinto Mountains behind. New desert scenery.', wiki: 'Kaufmann Desert House', commons: 'Kaufmann Desert House' },
  { slug: 'villa-tugendhat', title: 'Villa Tugendhat', architect: 'Mies van der Rohe', year: 1930, place: 'Brno', fit: 3,
    why: 'On a slope over the city: an onyx wall, chrome columns and glass walls that sink into the floor.', wiki: 'Villa Tugendhat', commons: 'Villa Tugendhat' },
  { slug: 'robie-house', title: 'Robie House', architect: 'Frank Lloyd Wright', year: 1910, place: 'Chicago', fit: 2,
    why: 'Prairie style: long, low, hipped roofs and Roman brick. Needs sloped pieces.', wiki: 'Robie House', commons: 'Robie House' },
  { slug: 'gropius-house', title: 'Gropius House', architect: 'Walter Gropius', year: 1938, place: 'Lincoln, Massachusetts', fit: 3,
    why: 'A white Bauhaus box in New England, with glass block and an outdoor spiral stair.', wiki: 'Gropius House', commons: 'Gropius House' },
  { slug: 'e-1027', title: 'E-1027', architect: 'Eileen Gray', year: 1929, place: 'Roquebrune-Cap-Martin', fit: 2,
    why: 'A white villa on the rocks above the Mediterranean.', wiki: 'E-1027', commons: 'E-1027 Eileen Gray' },
  { slug: 'lovell-health-house', title: 'Lovell Health House', architect: 'Richard Neutra', year: 1929, place: 'Los Angeles', fit: 2,
    why: 'A steel frame hung into a canyon. Another LA hillside, so everything carries over.', wiki: 'Lovell House', commons: 'Lovell Health House' },
  { slug: 'miller-house', title: 'Miller House', architect: 'Eero Saarinen', year: 1957, place: 'Columbus, Indiana', fit: 3,
    why: "A grid of skylights, the original conversation pit, and Dan Kiley's garden.", wiki: 'Miller House (Columbus, Indiana)', commons: 'Miller House Columbus Indiana' },
  { slug: 'casa-luis-barragan', title: 'Casa Luis Barragán', architect: 'Luis Barragán', year: 1948, place: 'Mexico City', fit: 3,
    why: 'Pink, yellow and orange walls and a roof terrace, inside a dense city block.', wiki: 'Luis Barragán House and Studio', commons: 'Casa Luis Barragán' },
  { slug: 'koshino-house', title: 'Koshino House', architect: 'Tadao Ando', year: 1981, place: 'Ashiya, Japan', fit: 3,
    why: 'Concrete boxes sunk into a wooded hillside; the formwork panels map straight onto blocks.', commons: 'Koshino House Ando' },
  { slug: 'frey-house-ii', title: 'Frey House II', architect: 'Albert Frey', year: 1964, place: 'Palm Springs', fit: 2,
    why: 'A huge boulder runs through the living room. Desert again.', wiki: 'Frey House II', commons: 'Frey House II' },
  { slug: 'vanna-venturi-house', title: 'Vanna Venturi House', architect: 'Robert Venturi', year: 1964, place: 'Philadelphia', fit: 2,
    why: 'The split gable that started postmodernism. Small, with a sloped roof.', wiki: 'Vanna Venturi House', commons: 'Vanna Venturi House' },
  { slug: 'rose-seidler-house', title: 'Rose Seidler House', architect: 'Harry Seidler', year: 1950, place: 'Sydney', fit: 3,
    why: 'Bauhaus in the Australian bush, with a ramp and a colorful mural wall.', wiki: 'Rose Seidler House', commons: 'Rose Seidler House' },
  { slug: 'chemosphere', title: 'Chemosphere', architect: 'John Lautner', year: 1960, place: 'Los Angeles', fit: 1,
    why: 'An octagonal "flying saucer" on a 30 ft concrete column. Curves in blocks are the fun challenge.', wiki: 'Chemosphere', commons: 'Chemosphere Lautner' },
  { slug: 'sheats-goldstein-residence', title: 'Sheats-Goldstein Residence', architect: 'John Lautner', year: 1963, place: 'Los Angeles', fit: 1,
    why: 'A triangular coffered concrete roof over a jungle garden.', wiki: 'Sheats–Goldstein Residence', commons: 'Sheats-Goldstein Residence' },
];

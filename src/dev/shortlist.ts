/**
 * Dev-only: the shortlist of houses to build next (spec 016; 20 more buildings in spec 041), for the photo page at /dev/shortlist/.
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
  // Spec 041: twenty more, houses first, then landmarks.
  { slug: 'villa-muller', title: 'Villa Müller', architect: 'Adolf Loos', year: 1930, place: 'Prague', fit: 3,
    why: 'A plain white cube outside; inside, rooms at a dozen different levels (the Raumplan).', wiki: 'Villa Müller', commons: 'Villa Müller Prague' },
  { slug: 'maison-de-verre', title: 'Maison de Verre', architect: 'Pierre Chareau', year: 1932, place: 'Paris', fit: 3,
    why: 'A wall of glass blocks, tucked into a Paris courtyard under an older flat.', wiki: 'Maison de Verre', commons: 'Maison de Verre Chareau' },
  { slug: 'schindler-house', title: 'Schindler House', architect: 'Rudolph Schindler', year: 1922, place: 'West Hollywood', fit: 3,
    why: 'Tilt-up concrete slabs with glass slits between them, around open-air courtyards.', wiki: 'Schindler House', commons: 'Schindler House Kings Road' },
  { slug: 'esherick-house', title: 'Margaret Esherick House', architect: 'Louis Kahn', year: 1961, place: 'Philadelphia', fit: 3,
    why: 'A tall box with a deep window slot and a fireplace stack, set in trees.', wiki: 'Margaret Esherick House', commons: 'Esherick House Kahn' },
  { slug: 'douglas-house', title: 'Douglas House', architect: 'Richard Meier', year: 1973, place: 'Harbor Springs, Michigan', fit: 3,
    why: 'A white house dropped down a wooded bluff above Lake Michigan, entered by a bridge at the roof.', wiki: 'Douglas House (Harbor Springs, Michigan)', commons: 'Douglas House incategory:Harbor_Springs,_Michigan' },
  { slug: 'hollyhock-house', title: 'Hollyhock House', architect: 'Frank Lloyd Wright', year: 1921, place: 'Los Angeles', fit: 2,
    why: 'A Mayan Revival house of courtyards and roof terraces on a hill in East Hollywood.', wiki: 'Hollyhock House', commons: 'Hollyhock House' },
  { slug: 'gamble-house', title: 'Gamble House', architect: 'Greene & Greene', year: 1909, place: 'Pasadena', fit: 2,
    why: 'Arts and Crafts timber with deep eaves and sleeping porches. Needs sloped pieces.', wiki: 'Gamble House (Pasadena, California)', commons: 'Gamble House Pasadena' },
  { slug: 'villa-mairea', title: 'Villa Mairea', architect: 'Alvar Aalto', year: 1939, place: 'Noormarkku, Finland', fit: 2,
    why: 'An L of white walls and timber around a pool in a pine forest, with a sod-roofed sauna.', wiki: 'Villa Mairea', commons: 'Villa Mairea' },
  { slug: 'taliesin-west', title: 'Taliesin West', architect: 'Frank Lloyd Wright', year: 1937, place: 'Scottsdale, Arizona', fit: 2,
    why: 'Desert stone walls under angled timber and canvas roofs. Desert again.', wiki: 'Taliesin West', commons: 'Taliesin West' },
  { slug: 'can-lis', title: 'Can Lis', architect: 'Jørn Utzon', year: 1972, place: 'Mallorca', fit: 2,
    why: 'Sandstone pavilions on a cliff, with deep window boxes framing the sea.', wiki: 'Can Lis', commons: 'Can Lis Utzon' },
  { slug: 'hill-house', title: 'Hill House', architect: 'Charles Rennie Mackintosh', year: 1904, place: 'Helensburgh, Scotland', fit: 2,
    why: 'Harled walls, steep slate roofs and a round stair tower above the Clyde.', wiki: 'Hill House, Helensburgh', commons: 'Hill House Helensburgh' },
  { slug: 'barcelona-pavilion', title: 'Barcelona Pavilion', architect: 'Mies van der Rohe', year: 1929, place: 'Barcelona', fit: 3,
    why: 'Free-standing marble and glass walls under a floating roof, with two pools. Small, and pure planes.', wiki: 'Barcelona Pavilion', commons: 'Barcelona Pavilion' },
  { slug: 'habitat-67', title: 'Habitat 67', architect: 'Moshe Safdie', year: 1967, place: 'Montreal', fit: 3,
    why: '354 concrete boxes stacked like toy blocks on the St. Lawrence.', wiki: 'Habitat 67', commons: 'Habitat 67' },
  { slug: 'bauhaus-dessau', title: 'Bauhaus Dessau', architect: 'Walter Gropius', year: 1926, place: 'Dessau, Germany', fit: 3,
    why: 'The school itself: a pinwheel of white wings and the glass curtain wall of the workshops.', wiki: 'Bauhaus Dessau', commons: 'Bauhaus Dessau building' },
  { slug: 'salk-institute', title: 'Salk Institute', architect: 'Louis Kahn', year: 1965, place: 'La Jolla, California', fit: 3,
    why: 'Two concrete wings around a travertine plaza and its water channel, pointing at the Pacific.', wiki: 'Salk Institute for Biological Studies', commons: 'Salk Institute' },
  { slug: 'unite-d-habitation', title: "Unité d'Habitation", architect: 'Le Corbusier', year: 1952, place: 'Marseille', fit: 3,
    why: 'A concrete apartment block on pilotis, with coloured balconies and a roof playground.', wiki: "Unité d'habitation", commons: "Cité radieuse Marseille" },
  { slug: 'seagram-building', title: 'Seagram Building', architect: 'Mies van der Rohe', year: 1958, place: 'New York', fit: 3,
    why: 'A bronze and glass tower behind a granite plaza. The first tall one; tests the piece count.', wiki: 'Seagram Building', commons: 'Seagram Building' },
  { slug: 'nakagin-capsule-tower', title: 'Nakagin Capsule Tower', architect: 'Kisho Kurokawa', year: 1972, place: 'Tokyo', fit: 2,
    why: '140 capsules with round windows plugged into two cores. Demolished in 2022.', wiki: 'Nakagin Capsule Tower', commons: 'Nakagin Capsule Tower' },
  { slug: 'guggenheim-museum', title: 'Guggenheim Museum', architect: 'Frank Lloyd Wright', year: 1959, place: 'New York', fit: 1,
    why: 'A white concrete spiral on Fifth Avenue, wider at the top.', wiki: 'Solomon R. Guggenheim Museum', commons: 'Solomon R. Guggenheim Museum exterior' },
  { slug: 'sydney-opera-house', title: 'Sydney Opera House', architect: 'Jørn Utzon', year: 1973, place: 'Sydney', fit: 1,
    why: 'The sail shells over the harbour. Shells in blocks are the showpiece.', wiki: 'Sydney Opera House', commons: 'Sydney Opera House' },
];

/** Spec 042: the shortlist slugs whose house is already live in the registry. */
export function builtOnShortlist(list: Candidate[], houses: { slug: string; status: string }[]): Set<string> {
  const live = new Set(houses.filter((h) => h.status === 'live').map((h) => h.slug));
  return new Set(list.filter((c) => live.has(c.slug)).map((c) => c.slug));
}

/** Spec 042: saved picks without the houses built since. */
export const livePicks = (picks: string[], built: Set<string>): string[] => picks.filter((s) => !built.has(s));

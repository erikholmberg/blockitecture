/** Real-world data settings for the Sonneveld House (spec 060). */
export default {
  slug: 'sonneveld-house',
  // Jongkindstraat 12, Rotterdam: the centre of OSM's way 255337548 (wikidata Q2193739)
  lat: 51.915636,
  lon: 4.472372,
  // model frame (layout.ts): x along the house from its south (garden) end to its north end (real about 339°), z from the street
  // front on Jongkindstraat to the east (real about 69°); the long sides run at 339°/159° in OSM. Refined by the search.
  rotationDeg: 111,
  radiusM: 1200,
  center: [28, 22],
  fit: {
    wikidata: 'Q2193739',
    // the main block, 15.9 × 9.85 m, and the garage and kitchen wing off its north-east corner (16.30 m along the north side)
    roof: [[0, 0, 52, 32], [38, 32, 58, 53]],
    searchCenter: [28, 22],
    rotationSearch: [101, 121, 0.5],
  },
  lotFeatures: true,
  // the garden to the south and east, Jongkindstraat on the west, the neighbouring villas
  lot: { x0: -110, z0: -95, x1: 115, z1: 120 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/sonneveld-house/neighborhood.bin', lot: 'src/houses/sonneveld-house/model/lotTerrain.ts' },
};

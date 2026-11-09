/** Real-world data settings for the Eames House, Case Study House #8 (spec 010b). */
export default {
  slug: 'eames-house',
  // centroid of OSM's two Eames buildings, "Casa" and "Oficina" (both wikidata=Q980011; Microsoft Building Footprints)
  lat: 34.0298834,
  lon: -118.519406,
  // the model is axis-aligned: x = across the house (west wall row at 0, meadow side +x), z = along the line (studio at
  // low z, residence at high z). The real line runs about NNE, so the world turns by about −10°; refined by the search.
  rotationDeg: -14, // result of the rotation search below (IoU 0.817)
  radiusM: 1200,
  center: [10, 62],
  fit: {
    wikidata: 'Q980011',
    // residence incl. the open south patio bay, and studio: 20 ft deep, bays of 7′4″ (spec 010 research)
    roof: [[0, 66, 20, 125], [0, 0, 20, 37]],
    searchCenter: [10, 62],
    rotationSearch: [-18, -4, 0.5],
  },
  lot: { x0: -70, z0: -70, x1: 170, z1: 190 },
  // the terrain tiles have corrupt spikes over the ocean here: median-filter them (spec 010b)
  despike: { near: 150, far: 500 },
  // and corrupt deep blobs just offshore: the sea floor is clamped to 60 ft below sea level (hidden under the water)
  seaFloorFt: 60,
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/eames-house/neighborhood.bin', lot: 'src/houses/eames-house/model/lotTerrain.ts' },
};

/** Real-world data settings for the Church of the Light (spec 055). */
export default {
  slug: 'church-of-the-light',
  // 4-3-50 Kitakasugaoka, Ibaraki: the centre of OSM's way 597276853 (the chapel, wikidata Q1655766)
  lat: 34.81854,
  lon: 135.537195,
  // model frame (layout.ts): +x along the chapel from the entrance to the altar (real about 154°, SSE), +z across it toward the
  // Sunday School (real about 244°, WSW); the long walls run at 154°/334° in OSM. Refined by the search.
  rotationDeg: -60.5, // the search's best (−74…−54): IoU 0.785
  radiusM: 1200,
  center: [30, 11],
  fit: {
    wikidata: 'Q1655766',
    // the concrete box: 18.3 × 6.66 m outside on Ando's 1:50 plan; OSM traces it at 17.87 × 5.76 m
    roof: [[0, 0, 61, 23]],
    searchCenter: [30, 11],
    rotationSearch: [-74, -54, 0.5],
  },
  lotFeatures: true,
  // the church's grounds, the Sunday School and the minister's house, the street on the east and the road to the south
  lot: { x0: -50, z0: -60, x1: 120, z1: 80 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/church-of-the-light/neighborhood.bin', lot: 'src/houses/church-of-the-light/model/lotTerrain.ts' },
};

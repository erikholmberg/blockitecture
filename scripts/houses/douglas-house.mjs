/** Real-world data settings for the Douglas House (spec 045). */
export default {
  slug: 'douglas-house',
  // 3490 South Lake Shore Drive (M-119), near Harbor Springs: the centre of OSM's way 1101848958
  lat: 45.500862,
  lon: -85.097823,
  // model frame (layout.ts): +x along the house toward real south-south-east, +z toward the lake (real west-south-west, down the
  // bluff), −z up the bluff to the road; the long walls run at about 150°/330° in OSM. Refined by the search.
  rotationDeg: -60, // the search's best (−80…−50): IoU 0.967
  radiusM: 1200,
  center: [23, 15],
  fit: {
    wikidata: 'Q3661091',
    // the floors' outline, about 46 × 31 ft
    roof: [[0, 0, 46, 31]],
    searchCenter: [23, 15],
    rotationSearch: [-80, -50, 1],
  },
  exportSelf: true,
  lotFeatures: true,
  // Lake Michigan: the tiles read its surface as flat ground at about 177.0 m with no bed beneath; its surface at 177.2 m, a
  // bed 20 ft under it, so the engine draws it as water (spec 045, Q4) [documented: the lake at about 176–177 m]
  lake: { levelM: 177.2, floorFt: 20 },
  // y = 0 is the 1st floor, so the bridge's road end (43 ft up the bluff [documented: the bridge's length]) is level with the
  // 4th floor, 30 ft up [assumed: 10 ft floors]: the terrain reads about 210.8 m there, 206.0 m at the house's centre
  lotElevationM: 201.9,
  // the lot runs from the parking by the bridge (M-119 lies just beyond it, about 108 ft up) down the bluff to the beach's top
  lot: { x0: -40, z0: -80, x1: 130, z1: 135 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/douglas-house/neighborhood.bin', lot: 'src/houses/douglas-house/model/lotTerrain.ts' },
};

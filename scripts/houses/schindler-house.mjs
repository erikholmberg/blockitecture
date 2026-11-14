/** Real-world data settings for the Schindler House (spec 081). */
export default {
  slug: 'schindler-house',
  // 833 North Kings Road, West Hollywood: Wikipedia's coordinates (spec 081, Research: OSM's positions are measured from here)
  lat: 34.08639,
  lon: -118.37222,
  // model frame = HABS CA-1939's plans (north straight up): x = real east from the garage's west face, z = real south from its
  // north face, in ft. OSM's edges run at 89.0°/179.1°, within 1° of true north; refined by the search.
  rotationDeg: 0,
  radiusM: 1200,
  center: [40, 39],
  fit: {
    // spec 025's opt-in: the house (way 391380962, about half of it) and the unnamed way 391380944 beside it (spec 081 Q3)
    osmIds: [391380962, 391380944],
    // only the parts of the plan those two ways trace: the garage and guest wing, the band east of it to the long arm, the
    // long arm's middle, and the north-east wing's east end
    roof: [[0, 0, 20, 37], [20, 17, 48, 37], [31, 37, 48, 61], [52, 0, 79, 20]],
    searchCenter: [19, 43],
    rotationSearch: [-4, 2, 0.25],
  },
  exportSelf: true,
  // the street and anything centred on the lot come back as LOT_ROADS and LOT_BUILDINGS, for the model and the tests
  lotFeatures: true,
  // Habitat 825 (relation 6385162) is a multipolygon of untagged ways, so `way["building"]` can't see it: bring building
  // relations in as neighbours too (spec 081, opt-in)
  buildingRelations: true,
  // from the next street's back gardens to across Kings Road, from Kings West's south face to Habitat 825's north face
  lot: { x0: -60, z0: -16, x1: 190, z1: 90 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/schindler-house/neighborhood.bin', lot: 'src/houses/schindler-house/model/lotTerrain.ts' },
};

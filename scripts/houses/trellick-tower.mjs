/** Real-world data settings for Trellick Tower (spec 061). */
export default {
  slug: 'trellick-tower',
  // 5 Golborne Road, London W10: the centre of OSM's way 57721739 (the slab, wikidata Q1571416)
  lat: 51.52365,
  lon: -0.20548,
  // model frame (layout.ts): x along the slab from its west-north-west end, by the service tower, to its east-south-east end
  // (real about 113°); z across it from the corridor side to the balcony side (real about 203°, south-south-west)
  rotationDeg: -23, // the slab's long axis at 113°/293° (OSM); not searched, see fit.roof
  radiusM: 1200,
  center: [72, 21],
  fit: {
    // the slab, the service tower and Block B (only the slab carries the wikidata tag)
    osmIds: [57721739, 85866116, 85866118],
    // OSM's outlines at the documented bearing (113°): the slab with its podium (OSM draws it 21 m deep, the slab itself is
    // 13 m), the service tower 7.3 m off its end, Block B running south-south-west along Golborne Road. The rotation is pinned:
    // a search over these rough rectangles drifts 7° off.
    roof: [[-3, -5, 147, 64], [-58, -14, -25, 19], [-92, 29, -52, 218]],
    searchCenter: [72, 21],
  },
  exportSelf: true,
  lotFeatures: true,
  // from across Golborne Road to past the slab's east end, from the gardens by the canal to Block B's far end
  lot: { x0: -150, z0: -60, x1: 190, z1: 240 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/trellick-tower/neighborhood.bin', lot: 'src/houses/trellick-tower/model/lotTerrain.ts' },
};

/** Real-world data settings for the Rose Seidler House (spec 043). */
export default {
  slug: 'rose-seidler-house',
  // 71 Clissold Road, Wahroonga: the centre of OSM's way 570787191
  lat: -33.70974,
  lon: 151.14189,
  // model frame (layout.ts): +x = real west, +z = real north (down the slope, to Ku-ring-gai Chase); the box's walls run at
  // about 83°/173° in OSM. Refined by the search.
  rotationDeg: 186, // the search's best (165…195): IoU 0.865
  radiusM: 1200,
  center: [24, 20],
  fit: {
    osmIds: [570787191],
    // the main floor's square
    roof: [[0, 0, 49, 41]],
    searchCenter: [24, 20],
    rotationSearch: [165, 195, 1],
  },
  exportSelf: true,
  lotFeatures: true,
  // y = 0 is the main floor, level with the ground at the uphill south-west corner [assumed: the heights aren't documented], so
  // the floor stands about 9–14 ft above the slope on the downhill north and east sides [documented: raised on the north and
  // east]; the terrain reads 166.0 m at the house's centre
  lotElevationM: 168.3,
  lot: { x0: -70, z0: -60, x1: 120, z1: 120 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/rose-seidler-house/neighborhood.bin', lot: 'src/houses/rose-seidler-house/model/lotTerrain.ts' },
};

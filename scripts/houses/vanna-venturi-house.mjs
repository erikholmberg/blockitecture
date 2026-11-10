/** Real-world data settings for the Vanna Venturi House (spec 044). */
export default {
  slug: 'vanna-venturi-house',
  // 8330 Millman Street, Chestnut Hill: the centre of OSM's way 769755185
  lat: 40.0706588,
  lon: -75.2081297,
  // model frame (layout.ts): +x along the house toward real south-east, −z out of the front toward real north-east (and the
  // drive to Millman Street); the long walls run at about 127°/307° in OSM. Refined by the search.
  rotationDeg: -37, // the search's best (−50…−24): IoU 0.969
  radiusM: 1200,
  center: [29, 13],
  fit: {
    osmIds: [769755185],
    // the ground floor's outline, 58.3 × 26.9 ft (the 2021 survey)
    roof: [[0, 0, 58, 27]],
    searchCenter: [29, 13],
    rotationSearch: [-50, -24, 1],
  },
  exportSelf: true,
  lotFeatures: true,
  // y = 0 is the ground floor: the survey's spot elevation of 382.9 ft (116.7 m) [documented: the Historical Commission's 2021
  // site plan]; the terrain reads 116.4 m at the house's centre, so the floor stands about a foot above the lawn
  lotElevationM: 116.7,
  lot: { x0: -70, z0: -230, x1: 130, z1: 100 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/vanna-venturi-house/neighborhood.bin', lot: 'src/houses/vanna-venturi-house/model/lotTerrain.ts' },
};

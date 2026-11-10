/** Real-world data settings for the Koshino House (spec 039). */
export default {
  slug: 'koshino-house',
  // KH Gallery Ashiya, 17-5 Okuike-chō (GSI's geocoder), between OSM's two outlines
  lat: 34.77418,
  lon: 135.28497,
  // model frame (layout.ts): +x along the boxes toward real WSW, +z toward real NNW (up the slope); the boxes run at a bearing of
  // about 70°/250° in OSM. Refined by the search.
  rotationDeg: -164, // the search's best (−175…−145): IoU 0.856
  radiusM: 1200,
  center: [46, 32],
  fit: {
    // no Wikidata item: OSM's "KHギャラリー芦屋" (the living wing and the studio) and the untagged bedroom wing beside it
    osmIds: [259408268, 259408269],
    // the bedroom wing, the living wing, and the studio's quarter circle as its inner square
    roof: [[0, 0, 78, 18], [31, 29, 84, 46], [44, 46, 80, 58]],
    searchCenter: [46, 32],
    rotationSearch: [-175, -145, 1],
  },
  exportSelf: true,
  // y = 0 is the floor of both wings: the ground at the middle of the bedroom wing's downhill face, so the wing stands at grade there
  // and the living wing and the studio sink into the slope above, as the section shows [documented: section]; the terrain reads
  // 521.9 m at the house's centre and about 7 ft less there
  lotElevationM: 519.6,
  lotFeatures: true,
  // Osaka Bay, about 4 km below: the coastal terrain tiles need the usual clean-up (spec 010b)
  despike: { near: 150, far: 500 },
  seaFloorFt: 60,
  lot: { x0: -60, z0: -60, x1: 160, z1: 140 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/koshino-house/neighborhood.bin', lot: 'src/houses/koshino-house/model/lotTerrain.ts' },
};

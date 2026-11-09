/** Real-world data settings for the Farnsworth House (spec 022). */
export default {
  slug: 'farnsworth-house',
  // centroid of OSM's "Farnsworth House" (way 184780920, wikidata Q1397013)
  lat: 41.63502,
  lon: -88.53572,
  // model frame = the HABS IL-1105 plan (sheet 3): x = plan right, z = plan down, in ft. The sheet's north arrow points
  // about 18° clockwise from up, so the world turns by about 18°; refined by the search.
  rotationDeg: 10.5, // result of the rotation search below (IoU 0.884); the north arrow reads about 18°
  radiusM: 1200,
  center: [68, 22],
  fit: {
    wikidata: 'Q1397013',
    // the house's slabs (77′-3″ × 28′-8″, sheet 3)
    roof: [[30, 8, 107, 36]],
    searchCenter: [68, 22],
    rotationSearch: [0, 36, 0.5],
  },
  // the lot ends at the Fox River's north bank (z ≈ 160), which runs beyond it as a water area
  lot: { x0: -60, z0: -60, x1: 180, z1: 150 },
  // y = 0 is the main floor: 4′-6″ above the ground at the stair (HABS sheet 4: grade about 2′-2″ below the terrace, the
  // floor 2′-4″ above it). The terrain there is 171.7 m (the data's own reading at the house), so the floor is 173.07 m.
  lotElevationM: 171.7 + 4.5 * 0.3048,
  waterAreas: { radiusM: 3000, out: 'src/houses/farnsworth-house/model/water.ts' },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/farnsworth-house/neighborhood.bin', lot: 'src/houses/farnsworth-house/model/lotTerrain.ts' },
};

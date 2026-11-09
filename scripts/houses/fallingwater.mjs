/** Real-world data settings for Fallingwater (spec 017). */
export default {
  slug: 'fallingwater',
  // centroid of OSM's "Fallingwater" (way 354728127, wikidata Q463179)
  lat: 39.90623,
  lon: -79.46797,
  // model frame = the HABS PA-5346 plans (x = plan right, z = plan down, in ft); the plans' "up" is roughly north-northwest.
  // Wright turned the house 30° counterclockwise from due south (spec 017); refined by the search.
  rotationDeg: 49, // result of the rotation search below (IoU 0.769); the HABS north arrow gives 45°
  radiusM: 1200,
  center: [55, 40],
  fit: {
    wikidata: 'Q463179',
    // the house seen from above (HABS first, second and third floor plans): living tray, kitchen and west terrace; the
    // second floor's east terrace and its south terrace overhang; the servants' wing
    roof: [[14, 10, 78, 68], [78, 33, 100, 47], [29, 68, 54, 74], [2, 10, 15, 30]],
    searchCenter: [55, 40],
    rotationSearch: [-90, 90, 1],
  },
  lot: { x0: -70, z0: -160, x1: 190, z1: 150 },
  // y = 0 is the main floor: Bear Run is at 1,298 ft at the house (NHL nomination), and the HABS south elevation puts the
  // stream above the falls 10.5 ft below the main level
  lotElevationM: (1298 + 10.5) * 0.3048,
  waterways: { radiusM: 400 },
  // the terrain tiles smooth the ravine away (Bear Run reads ~25 ft too high): carve it along OSM's line, with the water
  // 10.5 ft below the main floor above the falls and 28.5 ft below it beneath them (HABS south elevation), falling 2%. OSM draws Bear Run in the direction it flows.
  carveStream: {
    name: 'Bear Run', fallsAt: [34.2, 79.6], flowsAlongLine: true, upFt: -10.5, downFt: -28.5, slope: 0.02, bedFt: 2,
    halfWidth: 12, bank: 1, bankWidth: 60, reach: 2500,
  },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/fallingwater/neighborhood.bin', lot: 'src/houses/fallingwater/model/lotTerrain.ts' },
};

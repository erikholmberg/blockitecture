/** Real-world data settings for the Salk Institute (spec 079). */
export default {
  slug: 'salk-institute',
  // 10010 N Torrey Pines Road, La Jolla: the point spec 079's OSM measurements are taken from (32.8873 N, 117.2459 W)
  lat: 32.8873,
  lon: -117.2459,
  // model frame (layout.ts): x along the plaza's axis from the wings' east end (x = 0) toward the sea (+x = real about 270°);
  // z across it, from the channel's line (z = 0) toward the north wing (+z = real about 0°). OSM's two lab wings (ways 31844744
  // and 31839360) run at 90.5°/270.5°. Refined by the search.
  rotationDeg: -180.25, // the search's best over −184…−177° (step 0.25): IoU 0.673 against the two bounding rectangles
  radiusM: 1200,
  // y = 0: the plaza, at the terrain's reading there
  center: [190, 0],
  fit: {
    // spec 079: the two lab wings, by way id (their wikidata is the building's, Q128635401, shared with the East Buildings)
    osmIds: [31844744, 31839360],
    // each wing's bounding rectangle, from the study towers' points to the outer towers' faces (spec 079, Research)
    roof: [[0, 37, 362, 187], [0, -187, 362, -37]],
    searchCenter: [102, 75],
    // first run over −184…−177°; narrowed to its neighbourhood since (the search takes about 15 minutes over the full range)
    rotationSearch: [-180.5, -180, 0.25],
  },
  exportSelf: true,
  lotFeatures: true,
  // the channel (way 60739892) and the west end's basins (natural=water), for the model to follow and A4 to check; not drawn
  // as scenery (the water is bricks)
  waterAreas: { radiusM: 400, out: 'src/houses/salk-institute/model/water.ts' },
  // from the citrus grove's east end to the mesa's edge past the lower landing, from beyond the south wing's light wells to
  // beyond the north wing's
  lot: { x0: -40, z0: -230, x1: 440, z1: 230 },
  // the tiles read the Pacific as flat ground a little above sea level with no bed beneath (spec 079, Research), so the engine
  // wouldn't draw it as water (spec 011): lower every sample under 0.75 m to a bed 20 ft down (spec 045's option, as the Lovell
  // Beach House; here the sea reads up to about 2.5 ft, so 0.3 m left thousands of offshore samples as flats)
  lake: { levelM: 0.75, floorFt: 20 },
  // a guard: the far tiles over the sea weren't checked for corrupt samples, as off the Eames House (spec 010b)
  despike: { near: 150, far: 500 },
  seaFloorFt: 60,
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/salk-institute/neighborhood.bin', lot: 'src/houses/salk-institute/model/lotTerrain.ts' },
};

/** Real-world data settings for the Gropius House (spec 078). */
export default {
  slug: 'gropius-house',
  // 68 Baker Bridge Road, Lincoln: the centroid of OSM's "Gropius House" (way 215140093, wikidata Q4179781)
  lat: 42.42704,
  lon: -71.32638,
  // model frame (layout.ts): +x along the house's long sides toward the east (OSM: 80.9°), +z toward the south (170.9°), so the
  // north front faces −z
  rotationDeg: 9.1,
  radiusM: 1200,
  center: [27, 16],
  fit: {
    wikidata: 'Q4179781',
    // the roof outline OSM traced (spec 078): the upper floor with its overhang and the brise-soleil, 55 × 29 ft, and the porch's
    // roof beyond it
    roof: [[0, 0, 55, 29], [34, 29, 46, 45]],
    searchCenter: [27, 16],
    rotationSearch: [5, 13, 0.25],
  },
  // the garage (way 1490862339) comes back as LOT_BUILDINGS, the drive and Baker Bridge Road as LOT_ROADS
  lotFeatures: true,
  // the hilltop down to Baker Bridge Road, the orchard, the drive and the garage (spec 078 Q5)
  lot: { x0: -180, z0: -215, x1: 250, z1: 200 },
  // y = 0 is the ground floor, 1.2 ft (three plates) above the plinth [scaled: HABS MA-1228-8, about 1½ ft]. The plinth is at
  // USGS 3DEP's reading at the house, 249.1 ft (75.93 m): the terrain tiles read 73.7 m there, since they smooth the hill's crest
  // by about 2 m (they agree with 3DEP within about 1 m at the garage, the road and 200 ft south), so the lot's ground rises from
  // the tiles to the plinth (site.ts)
  lotElevationM: 75.93 + 1.2 * 0.3048,
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/gropius-house/neighborhood.bin', lot: 'src/houses/gropius-house/model/lotTerrain.ts' },
};

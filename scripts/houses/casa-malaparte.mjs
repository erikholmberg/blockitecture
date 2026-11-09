/** Real-world data settings for Casa Malaparte (spec 031). */
export default {
  slug: 'casa-malaparte',
  // centroid of OSM's "Casa Malaparte" (way 752097981, wikidata Q2165447)
  lat: 40.547007,
  lon: 14.259007,
  // model frame: x along the house's axis, from the foot of the stair (x = 0, the landward end, WNW) to the sea end (x ≈ 177,
  // ESE); z across it (north at −z). The axis runs at a bearing of about 120°, so the world turns by about −30°.
  rotationDeg: -28, // result of the rotation search below (IoU 0.878)
  radiusM: 1200,
  center: [110, 0],
  fit: {
    wikidata: 'Q2165447',
    // the house (34 × 9 m) and the wedge of the stair (20 m long, 2.8 m at its foot widening to 9 m), from OSM
    roof: [[66, -15, 177, 15], [33, -10, 66, 10], [0, -5, 33, 5]],
    searchCenter: [110, 0],
    rotationSearch: [-40, -20, 0.5],
  },
  lot: { x0: -90, z0: -150, x1: 290, z1: 150 },
  // the terrain tiles have no heights for the headland (they read 0 m, sea, at every zoom), so: y = 0 is the house's lower floor,
  // about 32 m above the sea (spec 031 research), and the promontory is shaped from OSM's coastline
  lotElevationM: 32,
  coastline: { radiusM: 600 },
  exportSelf: true,
  // the terrain tiles over the sea round Capri may hold corrupt samples, as off the Eames House (spec 010b)
  despike: { near: 150, far: 500 },
  seaFloorFt: 60,
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/casa-malaparte/neighborhood.bin', lot: 'src/houses/casa-malaparte/model/lotTerrain.ts' },
};

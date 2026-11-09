/** Real-world data settings for the Stahl House (specs 003, 004; per-house since spec 010a). */
export default {
  slug: 'stahl-house',
  // OSM centroid of "Case Study House No. 22" (way with wikidata=Q2328939)
  lat: 34.1004395,
  lon: -118.3702198,
  // the brick model is the real house turned 180° (model +z = real north, model −x = real east)
  rotationDeg: 180,
  radiusM: 1200, // real buildings within this radius (spec 003, Q2)
  // model point (ft) whose real ground is y = 0, and the centre of the terrain grids
  center: [32, 12],
  // fit the house's own OSM outline onto the model's roof outline to find the offset
  fit: { wikidata: 'Q2328939', roof: [[-2, 23, 77, 57], [-2, -36, 27, 23]], window: [-5, -40, 80, 60] },
  // the brick lot (src/houses/stahl-house/model/site.ts TERRAIN)
  lot: { x0: -112, z0: -120, x1: 144, z1: 132 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/stahl-house/neighborhood.bin', lot: 'src/houses/stahl-house/model/lotTerrain.ts' },
};

/** Real-world data settings for Taliesin West (spec 077). */
export default {
  slug: 'taliesin-west',
  // 12345 N Taliesin Drive, Scottsdale: the spine of the main building (spec 077, Research: OSM's extents are measured from here)
  lat: 33.6064,
  lon: -111.8453,
  // model frame (layout.ts): x along the spine from the studio's north-west end toward the south-east (+x = real about 124.5°);
  // z across it from the mountain side (−z, real about 34.5°) toward the valley and the prow (+z = real about 214.5°). OSM's
  // Drafting Studio (way 1498897839) runs at 124.2°/304.2°.
  rotationDeg: -34.5, // the search's best (−40…−28): IoU 0.826
  radiusM: 1200,
  center: [54, 15],
  fit: {
    // the Drafting Studio's footprint (its way carries no wikidata; the site's is on the attraction, way 38097275). OSM's trace
    // leaves out the Vault's bay at the north-west end (spec 077), so the fit uses the studio without it: 98 × 30 studs.
    osmIds: [1498897839],
    roof: [[0, 0, 98, 30]],
    searchCenter: [54, 15],
    rotationSearch: [-40, -28, 0.25],
  },
  exportSelf: true,
  // the core's other buildings come back as LOT_BUILDINGS, for the model to follow and the tests to check (spec 077 A6)
  lotFeatures: true,
  // the Prow Pool (way 1498886748, natural=water) and the Kiva Fountain, for the model to follow; not drawn as scenery
  waterAreas: { radiusM: 400, out: 'src/houses/taliesin-west/model/water.ts' },
  // from the studio's north-west patio to the end of Wright's quarters (spec 077 Q6), from beyond the Kiva to the prow's tip
  lot: { x0: -70, z0: -150, x1: 330, z1: 210 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/taliesin-west/neighborhood.bin', lot: 'src/houses/taliesin-west/model/lotTerrain.ts' },
};

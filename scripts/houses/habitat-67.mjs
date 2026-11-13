/** Real-world data settings for Habitat 67 (spec 072). */
export default {
  slug: 'habitat-67',
  // 2600 avenue Pierre-Dupuy, Montreal: the centre of OSM's way 440195613 ("Habitat '67", wikidata Q1032248)
  lat: 45.49987,
  lon: -73.54365,
  // model frame (layout.ts): x along the complex's axis from its south end (x = 0) to its north end (real about 4°); z across
  // it from the avenue Pierre-Dupuy side (z = 0, real west) to the river side (real east). The outline's edges run almost all
  // at 4° and 94° (OSM), so the rotation is pinned there, as Trellick's was (spec 061): not searched.
  rotationDeg: 86,
  radiusM: 1500,
  center: [465, 150],
  fit: {
    osmIds: [440195613],
    // the outline's bounding box in the model frame (930 × 295 ft): it pins the offset. The boxes' own fit to the outline is
    // measured in tests/habitat67.test.ts (A1), against LOT_SELF.
    roof: [[0, 0, 931, 295]],
    searchCenter: [455, 145],
  },
  exportSelf: true,
  lotFeatures: true,
  lot: { x0: -20, z0: -50, x1: 950, z1: 330 },
  waterAreas: { radiusM: 2500, out: 'src/houses/habitat-67/model/water.ts' },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/habitat-67/neighborhood.bin', lot: 'src/houses/habitat-67/model/lotTerrain.ts' },
};

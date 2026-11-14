/** Real-world data settings for the Centre Pompidou (spec 080). */
export default {
  slug: 'centre-pompidou',
  // Place Georges-Pompidou, Paris 4e: the building's middle (OSM's way 55503397, "Centre Georges Pompidou", wikidata Q178065)
  lat: 48.8606,
  lon: 2.3522,
  // model frame (layout.ts): x along the building from its south end (rue Saint-Merri) to its north end (rue Rambuteau), real
  // 19.8°; z across it from the piazza (west) to rue Beaubourg (east), real 109.8°. The west front is one straight edge at
  // 199.8° (OSM), so the rotation is pinned there, as Trellick's was (spec 061): not searched.
  rotationDeg: 70.2,
  radiusM: 800,
  center: [274, 98],
  fit: {
    wikidata: 'Q178065',
    // the cage, tie line to tie line (layout.ts): 549 × 198 studs
    roof: [[0, 0, 549, 198]],
    searchCenter: [278, 38],
  },
  // y = 0 is the Forum's floor, at the foot of the west front: IGN RGE ALTI reads 32.8 m there (spec 080, Research)
  lotElevationM: 32.8,
  // spec 080 Q6: the AWS tiles carry Paris's roofs (+7 to +25 m), so the ground comes from IGN's bare-earth RGE ALTI instead,
  // both grids (the far grid too, so the two meet without a step). Opt-in: other houses' data stays byte-identical.
  ign: { resource: 'ign_rge_alti_wld', grids: ['near', 'far'] },
  exportSelf: true,
  // the piazza (outer way of relation 556816), its seven ventilation stacks, the Atelier Brancusi and the Stravinsky Fountain's
  // basin, for the model to follow and the tests to check (A8, A9, A11)
  exportParts: {
    ways: [55507605, 55503398, 55503400, 55507598, 55507602, 55507603, 55507610, 55507612, 55503399, 88301107],
  },
  lotFeatures: true,
  // the Stravinsky Fountain's basin and the Seine (spec 022)
  waterAreas: { radiusM: 1200, out: 'src/houses/centre-pompidou/model/water.ts' },
  // from rue Saint-Merri to past the Atelier Brancusi, from rue Saint-Martin to the far kerb of rue Beaubourg
  lot: { x0: -35, z0: -200, x1: 610, z1: 255 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/centre-pompidou/neighborhood.bin', lot: 'src/houses/centre-pompidou/model/lotTerrain.ts' },
};

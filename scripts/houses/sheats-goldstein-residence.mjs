/** Real-world data settings for the Sheats-Goldstein Residence (spec 040). */
export default {
  slug: 'sheats-goldstein-residence',
  // OSM way 388762653's centre (LA County outline, Wikidata Q2178401)
  lat: 34.0934725,
  lon: -118.4345323,
  // model frame: unturned (x = real east, z = real south), so the city view is +z. The house is modelled on OSM's own outline
  // (exported as LOT_SELF, like the Ennis House); the fit's rectangles are that outline in rows of 12 ft (IoU 0.877).
  rotationDeg: 0,
  radiusM: 1200,
  center: [0, 0],
  fit: {
    wikidata: 'Q2178401',
    roof: [
      [-56, -72, -45, -60], [-70, -60, -36, -48], [-84, -48, -26, -36], [-95, -36, -17, -24], [-75, -24, -8, -12], [8, -24, 41, -12],
      [-41, -12, 65, 0], [-7, 0, 90, 12], [9, 12, 89, 24], [18, 24, 81, 36], [27, 36, 74, 48], [35, 48, 67, 60], [44, 60, 60, 72],
    ],
    searchCenter: [0, 0],
  },
  exportSelf: true,
  // y = 0 is the main floor: OSM's own elevation tag for the outline (ele = 261.5 m), level with the driveway on the north; the
  // ridge falls away about 45 ft to the house's south point [documented: OSM; the floor's level assumed]
  lotElevationM: 261.5,
  lotFeatures: true,
  // one corrupt sample in the far terrain, about 2,000 ft off its neighbours: the usual clean-up (spec 010b)
  despike: { near: 150, far: 500 },
  lot: { x0: -160, z0: -130, x1: 200, z1: 160 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/sheats-goldstein-residence/neighborhood.bin', lot: 'src/houses/sheats-goldstein-residence/model/lotTerrain.ts' },
};

/** Real-world data settings for the Haus am Horn (spec 063). */
export default {
  slug: 'haus-am-horn',
  // Am Horn 61, Weimar: the centre of OSM's way 35984274 (wikidata Q525226)
  lat: 50.973833,
  lon: 11.33942,
  // model frame = the 1923 ground plan (layout.ts): x from the entrance front (the plan's "north", real about 339°) to the
  // opposite front (real about 159°); z from the dining room's side (real about 69°) to the street's side, toward Am Horn and
  // the park on the Ilm (real about 249°). OSM's sides run at 339.1° and 69.1°.
  rotationDeg: -69,
  radiusM: 1200,
  center: [21, 21],
  fit: {
    wikidata: 'Q525226',
    // the square house, 12.70 × 12.70 m
    roof: [[0, 0, 42, 42]],
    searchCenter: [21, 21],
    rotationSearch: [-75, -63, 0.5],
  },
  lotFeatures: true,
  // the garden from the street Am Horn up the slope behind the house
  lot: { x0: -75, z0: -75, x1: 115, z1: 140 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/haus-am-horn/neighborhood.bin', lot: 'src/houses/haus-am-horn/model/lotTerrain.ts' },
};

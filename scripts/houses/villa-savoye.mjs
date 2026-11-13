/** Real-world data settings for the Villa Savoye (spec 074). */
export default {
  slug: 'villa-savoye',
  // 82 rue de Villiers, Poissy: the centre of OSM's way 38327851 (wikidata Q940746)
  lat: 48.924445,
  lon: 2.028229,
  // model frame (layout.ts): x from the north-west entrance front (x = 0, real about 324.7°) to the south-east end (+x = real
  // about 144.7°, toward the gate); z from the north-east long side (z = 0, real about 54.7°) to the south-west long side (+z =
  // real about 234.7°). OSM's sides run at 144.7°/324.7° and 54.6°/234.6°. Refined by the search.
  rotationDeg: -55,
  radiusM: 1200,
  center: [36, 32],
  fit: {
    wikidata: 'Q940746',
    // the white box, 73 × 65 studs on the 16-stud grid (spec 074 Q2)
    roof: [[0, 0, 73, 65]],
    searchCenter: [36, 32],
    rotationSearch: [-61, -49, 0.5],
  },
  lotFeatures: true,
  // the park (OSM way 155851392) and the gardener's lodge by the gate on Rue de Villiers
  lot: { x0: -160, z0: -230, x1: 315, z1: 195 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/villa-savoye/neighborhood.bin', lot: 'src/houses/villa-savoye/model/lotTerrain.ts' },
};

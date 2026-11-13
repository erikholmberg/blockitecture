/** Real-world data settings for the Barcelona Pavilion (spec 075). */
export default {
  slug: 'barcelona-pavilion',
  // Avinguda de Francesc Ferrer i Guàrdia 7, Barcelona: the centre of OSM's way 67917935 (the main roof, wikidata Q807915)
  lat: 41.370532,
  lon: 2.149948,
  // model frame (layout.ts): x along the plinth from the small pool's end (real about 332.8°, NNW) to the annex's (+x = real
  // about 152.8°, SSE); z from the front on the Plaça de Carles Buïgas (real about 62.5°, ENE) to the back (+z = real about
  // 242.5°, WSW). OSM's roof sides run at 152.8°/62.5°.
  rotationDeg: -63, // the search's best (−69…−56): IoU 1.000
  radiusM: 1200,
  center: [91, 30],
  fit: {
    wikidata: 'Q807915',
    // the main roof: 23 × 13 modules of 1.09 m, drawn as 3.5 studs a module
    roof: [[14, 14, 95, 60]],
    searchCenter: [54, 37],
    rotationSearch: [-69, -56, 0.5],
  },
  lotFeatures: true,
  // y = 0 is the plinth's top, 1.30 m [documented, weak: a guide; 8 steps of about 16 cm agree] above the ground at the foot
  // of the stair, which the tiles read at about 43.12 m
  lotElevationM: 44.42,
  // the plinth, the forecourt down toward the Plaça de Carles Buïgas, the slope behind up to the avenue
  lot: { x0: -70, z0: -160, x1: 260, z1: 150 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/barcelona-pavilion/neighborhood.bin', lot: 'src/houses/barcelona-pavilion/model/lotTerrain.ts' },
};

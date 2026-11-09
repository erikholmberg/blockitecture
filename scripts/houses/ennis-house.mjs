/** Real-world data settings for the Ennis House (spec 025). */
export default {
  slug: 'ennis-house',
  // the Ennis House, at Wikidata Q578184's point; its OSM footprint is way 426658114 (LA County building outline, 1924)
  lat: 34.11611,
  lon: -118.29278,
  // model frame: x along the house's long axis, west (x = 0) to east; z across it, north (z = 0) to south. The axis runs
  // at a bearing of about 111°, so the world turns by about −21°; refined by the search.
  rotationDeg: -23, // result of the rotation search below (IoU 0.834)
  radiusM: 1200,
  center: [118, 36],
  fit: {
    osmIds: [426658114],
    // the house on its podium, roughly: about 236 × 72 ft (the footprint itself is exported below and modelled exactly)
    roof: [[0, 0, 236, 72]],
    searchCenter: [118, 36],
    rotationSearch: [-30, -12, 0.5],
  },
  exportSelf: true,
  // the chauffeur's quarters and the neighbours inside the lot, as blocks (spec 025 Q4)
  lotFeatures: true,
  // y = 0 is the main floor: about 6 ft above the terrain's reading at the house's centre (253.5 m), level with the north
  // side's ground where the entrance is; the podium makes up the fall to the south [assumed: HABS west elevation]
  lotElevationM: 253.5 + 6 * 0.3048,
  lot: { x0: -50, z0: -70, x1: 290, z1: 130 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/ennis-house/neighborhood.bin', lot: 'src/houses/ennis-house/model/lotTerrain.ts' },
};

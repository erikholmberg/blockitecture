/** Real-world data settings for the Muuratsalo Experimental House (spec 058). */
export default {
  slug: 'muuratsalo-experimental-house',
  // Melalammentie 2, Muuratsalo: Wikidata's point for the house (Q5755595), on OSM's way 1341918201
  lat: 62.1147594,
  lon: 25.7449559,
  // model frame = Aalto's plan (layout.ts): x = the plan's right, toward the bedrooms and the guest wing (real about 121.5°, ESE);
  // z = the plan's down, from the studio toward the courtyard's open side (real about 211.5°, SSW). Refined by the search.
  rotationDeg: -30, // the search's best (−42…−21): IoU 0.802
  radiusM: 1200,
  center: [30, 23],
  fit: {
    wikidata: 'Q5755595',
    // the house and its courtyard: 1427 × 1441 cm on the plan [documented]; the guest wing off its east corner, 720 × 360 cm
    roof: [[0, 0, 47, 47], [47, 0, 71, 12]],
    searchCenter: [30, 23],
    rotationSearch: [-42, -21, 0.5],
  },
  lotFeatures: true,
  // Lake Päijänne: round Muuratsalo the terrain tiles read lake and land alike as one flat level, about 96.5 m (OSM gives the
  // lake 78.3 m: the tiles' datum is off here), so the lake is found from OSM's shore lines instead: flooded from a point on
  // the water 150 m west-south-west of the house and lowered to a bed (spec 058). Its surface is the tiles' own level.
  // Land is kept 10 ft above the water, so the island reads as forest, not beach [assumed: the island's own relief is lost].
  lakeShore: { name: 'Päijänne', radiusM: 9000, levelM: 96.6, floorFt: 20, landFt: 10, seed: [-280, 411] },
  // y = 0 is the house's floor, about 8 m above the lake [documented: 5–10 m, the lake's shore 36 m away down the rock]
  lotElevationM: 104.6,
  // the rock round the house, from the woods behind down toward the shore of Lake Päijänne: the water and its bays lie beyond
  // the lot on the west and north-west, as does the sauna in its cove to the north (drawn from OSM, spec 058)
  lot: { x0: -85, z0: -150, x1: 110, z1: 90 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/muuratsalo-experimental-house/neighborhood.bin', lot: 'src/houses/muuratsalo-experimental-house/model/lotTerrain.ts' },
};

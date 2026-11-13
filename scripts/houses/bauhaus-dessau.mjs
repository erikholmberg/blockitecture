/** Real-world data settings for the Bauhaus Dessau (spec 076). */
export default {
  slug: 'bauhaus-dessau',
  // Gropiusallee 38, Dessau-Roßlau: the centre of OSM's relation 14318571 ("Bauhaus", wikidata Q28738517)
  lat: 51.839362,
  lon: 12.227364,
  // model frame (layout.ts): x along the workshop wing from the north wing's north front (x = 0, real about 337.6°) toward the
  // workshop wing's south end (+x = real about 157.6°); z from the Prellerhaus's east front (z = 0, real about 67.8°) toward
  // Gropiusallee (+z = real about 247.8°). Every wing is square to these within half a degree (OSM). Refined by the search.
  rotationDeg: -68,
  radiusM: 1200,
  center: [175, 120],
  fit: {
    // spec 076 Q3: the building is a multipolygon relation of untagged ways, which `way["building"]` can't see
    osmRelations: [14318571],
    // the five parts' rectangles (layout.ts): the north wing, the bridge, the entrance block, the workshop wing and its stub,
    // the link and the Prellerhaus
    roof: [[0, 118, 63, 242], [63, 117, 147, 148], [147, 117, 213, 166], [144, 166, 302, 220], [302, 166, 346, 188], [161, 37, 213, 117], [150, 0, 213, 37]],
    searchCenter: [166, 142],
    rotationSearch: [-74, -62, 0.5],
  },
  exportSelf: true,
  // spec 076 A2, A4: the five parts, the bridge's piers, the stage, the stairs, and Bauhausstraße's passage under the bridge
  exportParts: {
    relations: [14318568, 14318567, 14318566, 14318569, 14318570],
    ways: [473496075, 473496076, 473496077, 473496078, 239651895, 239651900, 239651892, 239651885],
  },
  lotFeatures: true,
  // from the lawn east of the Prellerhaus to Gropiusallee's far kerb, from beyond the north wing to the workshop wing's south
  lot: { x0: -90, z0: -120, x1: 400, z1: 330 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/bauhaus-dessau/neighborhood.bin', lot: 'src/houses/bauhaus-dessau/model/lotTerrain.ts' },
};

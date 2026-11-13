/** Real-world data settings for the Glass House (spec 073). */
export default {
  slug: 'glass-house',
  // Ponus Ridge Road, New Canaan: the centroid of OSM's "The Glass House" (way 364907964, wikidata Q1506237)
  lat: 41.142397,
  lon: -73.529253,
  // model frame (layout.ts): x = east, z = south, turned so the house's long sides (OSM: 357.2°) run along z
  rotationDeg: 2.8,
  radiusM: 1200,
  center: [16, 28],
  fit: {
    wikidata: 'Q1506237',
    // the glass box, 56 × 32 ft (the NHL nomination)
    roof: [[0, 0, 32, 56]],
    searchCenter: [16, 28],
    rotationSearch: [-3, 9, 0.25],
  },
  lotFeatures: true,
  // the lawn, the Brick House and the pool, and the bluff down to the pond and the Pavilion (spec 073 Q4)
  lot: { x0: -380, z0: -130, x1: 180, z1: 220 },
  // y = 0 is the brick floor, 10 in above the lawn [documented: Wikipedia]; the terrain reads 98.62 m at the house (the data's
  // own reading; OSM's ele=98.74 agrees)
  lotElevationM: 98.62 + (10 / 12) * 0.3048,
  waterAreas: { radiusM: 2000, out: 'src/houses/glass-house/model/water.ts' },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/glass-house/neighborhood.bin', lot: 'src/houses/glass-house/model/lotTerrain.ts' },
};

/** Real-world data settings for the Lovell Beach House (spec 056). */
export default {
  slug: 'lovell-beach-house',
  // 1242 West Ocean Front, Newport Beach: the centre of OSM's way 1070767462 (wikidata Q746490)
  lat: 33.60593,
  lon: -117.91768,
  // model frame = the HABS CA-1986 plans: x along the house from its north (alley) end to its south (ocean) end, real about
  // 196.5°; z across it from the east side to the west (13th Street), real about 286.5°. Refined by the search.
  rotationDeg: -107, // the search's best (−115…−98): IoU 0.918
  radiusM: 1200,
  center: [29, 16],
  fit: {
    wikidata: 'Q746490',
    // the second floor's outline, 58′-8″ × 33′-2″ (HABS sheet 4), which OSM traces at 60.0 × 33.8 ft
    roof: [[0, 0, 59, 33]],
    searchCenter: [29, 16],
    rotationSearch: [-115, -98, 0.5],
  },
  lotFeatures: true,
  // the tiles read the Pacific (and Newport Harbor behind the peninsula) as flat ground at sea level with no bed beneath, so
  // the engine wouldn't draw it as water (spec 011): lower every sample under 0.3 m to a bed 20 ft down (spec 045's option)
  lake: { levelM: 0.3, floorFt: 20 },
  // from across the alley to the beach past the boardwalk, from the neighbour on the east to across 13th Street
  lot: { x0: -45, z0: -40, x1: 230, z1: 95 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/lovell-beach-house/neighborhood.bin', lot: 'src/houses/lovell-beach-house/model/lotTerrain.ts' },
};

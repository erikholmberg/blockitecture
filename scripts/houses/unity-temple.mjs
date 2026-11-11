/** Real-world data settings for Unity Temple (spec 062). */
export default {
  slug: 'unity-temple',
  // 875 Lake Street, Oak Park: the centre of OSM's way 25885395 (wikidata Q1680814)
  lat: 41.88835,
  lon: -87.79684,
  // model frame = the HABS IL-1093 plans: x from the temple's north front on Lake Street to Unity House's south end (real 180°),
  // z from the east side to the west, on Kenilworth Avenue (real 270°). OSM's outline runs true north–south (359.6°).
  rotationDeg: -89.5, // the search's best (−94…−86): IoU 0.784
  radiusM: 1200,
  center: [70, 46],
  fit: {
    wikidata: 'Q1680814',
    // the temple (64 ft across its towers, its alcoves 1′-4″ proud), the foyer and its terraces, Unity House (91′-6″ wide)
    roof: [[0, 13, 66, 79], [65, 0, 90, 92], [90, 18, 142, 74], [90, 0, 133, 18], [90, 74, 133, 92]],
    searchCenter: [70, 46],
    rotationSearch: [-94, -86, 0.5],
  },
  lotFeatures: true,
  // the corner lot, Lake Street on the north and Kenilworth Avenue on the west, the neighbours to the south and east
  lot: { x0: -75, z0: -75, x1: 215, z1: 170 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/unity-temple/neighborhood.bin', lot: 'src/houses/unity-temple/model/lotTerrain.ts' },
};

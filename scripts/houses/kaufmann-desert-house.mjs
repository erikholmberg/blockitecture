/** Real-world data settings for the Kaufmann Desert House (spec 033). */
export default {
  slug: 'kaufmann-desert-house',
  // centroid of OSM's "Kaufmann Desert House" (way 566015553, wikidata Q6378695), 470 West Vista Chino, Palm Springs
  lat: 33.845152,
  lon: -116.552984,
  // model frame: x east, z south, in ft, the outline's centroid at (60, 75). Its walls run within a degree of north–south.
  rotationDeg: 0,
  radiusM: 1200,
  center: [60, 75],
  fit: {
    wikidata: 'Q6378695',
    // the pinwheel, read off OSM's outline: the living room, the east (master) wing, the covered walk and the guest wing to the
    // north, the service wing to the west, and the south wing
    roof: [[43, 67, 99, 100], [99, 57, 130, 84], [51, 24, 64, 67], [58, 17, 84, 43], [2, 64, 51, 84], [2, 84, 31, 95], [31, 84, 43, 100], [22, 95, 57, 132]],
    searchCenter: [60, 75],
    rotationSearch: [-6, 6, 0.25],
  },
  exportSelf: true,
  // the lot's other buildings (the shed, the old pool house to the north) as blocks
  lotFeatures: true,
  lot: { x0: -40, z0: -80, x1: 230, z1: 180 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/kaufmann-desert-house/neighborhood.bin', lot: 'src/houses/kaufmann-desert-house/model/lotTerrain.ts' },
};

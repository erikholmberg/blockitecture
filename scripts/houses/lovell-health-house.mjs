/** Real-world data settings for the Lovell Health House (spec 034). */
export default {
  slug: 'lovell-health-house',
  // Wikidata Q6692217's point, on OSM's way 426658941 (LA County outline, 1929)
  lat: 34.11814,
  lon: -118.28786,
  // model frame = the HABS CA-1936 plans (sheets 3–5): x = plan right, z = plan down, in ft, shifted (+15, −10); refined by the search
  rotationDeg: 0,
  radiusM: 1200,
  center: [62, 37],
  fit: {
    wikidata: 'Q6692217',
    // the third floor, its south porches, the entry, the guest wing and the library (HABS sheets 4–5)
    roof: [[20, 16, 76, 52], [35, 52, 81, 58], [61, 37, 81, 52], [71, 16, 103, 39], [71, 39, 87, 58]],
    searchCenter: [62, 37],
    rotationSearch: [-90, 90, 1],
  },
  exportSelf: true,
  lotFeatures: true,
  // y = 0 is the living room floor: HABS sheet 8 gives it as elev. 781′-5″, which reads as feet above sea level (the terrain
  // reads 235 m at the house's centre, on the slope below it)
  lotElevationM: 781.42 * 0.3048,
  lot: { x0: -60, z0: -60, x1: 200, z1: 140 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/lovell-health-house/neighborhood.bin', lot: 'src/houses/lovell-health-house/model/lotTerrain.ts' },
};

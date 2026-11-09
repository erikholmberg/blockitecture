/** Real-world data settings for the Rietveld Schröder House (spec 019). */
export default {
  slug: 'rietveld-schroder-house',
  // centroid of OSM's "Rietveld-Schröderhuis" (way 191005050, wikidata Q914231)
  lat: 52.085332,
  lon: 5.147576,
  // model frame: x from the party wall (x = 0) east along the front, z from the back (z = 0) to the front; the front faces
  // about 209.5° (SSW), so the world turns by about −29.5°. The footprint is nearly symmetric under 180°, so the search
  // stays near that.
  rotationDeg: -28, // result of the rotation search below (IoU 0.964)
  radiusM: 1200,
  center: [12, 16],
  fit: {
    wikidata: 'Q914231',
    // the house from above: 7.6 × 10 m (OSM), ground and upper floor together
    roof: [[0, 0, 25, 33]],
    searchCenter: [12, 16],
    rotationSearch: [-40, -20, 0.5],
  },
  lot: { x0: -100, z0: -100, x1: 100, z1: 100 },
  lotFeatures: true,
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/rietveld-schroder-house/neighborhood.bin', lot: 'src/houses/rietveld-schroder-house/model/lotTerrain.ts' },
};

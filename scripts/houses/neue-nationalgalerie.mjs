/** Real-world data settings for the Neue Nationalgalerie (spec 057). */
export default {
  slug: 'neue-nationalgalerie',
  // Potsdamer Straße 50, Berlin: the centre of OSM's way 25652320 (the roof, wikidata Q130608380)
  lat: 52.50698,
  lon: 13.36759,
  // model frame (layout.ts): x along the hall toward the Landwehrkanal (real about 198.3°, SSW), z from Potsdamer Straße into
  // the hall and on to the sculpture garden (real about 288.3°, WNW); the hall's edges run at 18.3°/108.3° in OSM
  rotationDeg: -108.5, // the search's best (−116…−100): IoU 0.971
  radiusM: 1200,
  center: [108, 108],
  fit: {
    wikidata: 'Q130608380',
    // the roof: 64.8 m square [documented], 18 bays of the 3.6 m grid, drawn as 18 × 12 studs
    roof: [[0, 0, 216, 216]],
    searchCenter: [108, 108],
    rotationSearch: [-116, -100, 0.5],
  },
  lotFeatures: true,
  // y = 0 is the granite terrace, about 1 m above Potsdamer Straße [documented: scaled from the section]; the tiles read the
  // street there at about 33.7 m
  lotElevationM: 34.74,
  // the podium and the sculpture garden, Potsdamer Straße on the east, Sigismundstraße's corner, the trees by the canal
  lot: { x0: -110, z0: -130, x1: 330, z1: 330 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/neue-nationalgalerie/neighborhood.bin', lot: 'src/houses/neue-nationalgalerie/model/lotTerrain.ts' },
};

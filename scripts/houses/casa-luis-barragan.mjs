/** Real-world data settings for Casa Luis Barragán (spec 035). */
export default {
  slug: 'casa-luis-barragan',
  // Wikidata Q1046414's point; OSM's "Casa Luis Barragán" is way 199693850
  lat: 19.41111,
  lon: -99.1925,
  // model frame = the UNESCO nomination's 1:200 plans (pp. 63–71): x = plan right, z = plan down, in ft; the street is at the
  // bottom (+z), the garden at the top. Refined by the search.
  rotationDeg: 82.5, // the street (plan bottom) faces east, onto General Francisco Ramírez (the nomination's cadastral plan, p. 15); IoU 0.915
  radiusM: 1200,
  center: [56, 114],
  fit: {
    wikidata: 'Q1046414',
    // the house across the plot's street end, and the patio of the clay pots beside the garden (ground floor plan)
    roof: [[7, 88, 106, 141]],
    searchCenter: [56, 114],
    rotationSearch: [78, 88, 0.5],
  },
  exportSelf: true,
  lotFeatures: true,
  // y = 0 is the ground floor, level with the street at the garage door [documented: the street facade, p. 69]: the terrain
  // reads 2,281.3 m at the house's centre and about 1.7 m less along the street in front
  lotElevationM: 2279.6,
  lot: { x0: -50, z0: -40, x1: 170, z1: 200 },
  near: { half: 4200, step: 20, zoom: 15 },
  far: { half: 30000, step: 250, zoom: 11 },
  out: { bin: 'public/casa-luis-barragan/neighborhood.bin', lot: 'src/houses/casa-luis-barragan/model/lotTerrain.ts' },
};

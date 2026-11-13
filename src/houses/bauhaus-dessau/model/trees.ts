/**
 * The trees on the Bauhaus Dessau's lot (spec 076), in model ft. Taken once from OSM (2026-11-13, the API's map call over the
 * lot, `natural=tree` nodes) and converted with the fitted rotation (−68°) and offset (166, 142): the street trees along
 * Gropiusallee [documented: OSM, no species; drawn as limes, assumed]. OSM maps none on the lawn east of the Prellerhaus, where
 * the photographs show large limes: a few are added there [assumed: their places]. © OpenStreetMap contributors (ODbL).
 */
export const OSM_TREES: [number, number][] = [
  [316, 325], [349, 325], [376, 324], [4, 275], [27, 275], [49, 274], [159, 271], [188, 271], [219, 270], [245, 269], [279, 268],
  [313, 267], [346, 267], [373, 266],
];
/** [assumed] the limes on the lawn east of the Prellerhaus and the link, and by the north wing */
export const LAWN_TREES: [number, number][] = [
  [118, -40], [244, -28], [250, 10], [128, -78], [235, -95], [270, 60], [300, 110], [-30, 150], [-40, 200], [30, 20],
];
export const TREES: [number, number][] = [...OSM_TREES, ...LAWN_TREES];

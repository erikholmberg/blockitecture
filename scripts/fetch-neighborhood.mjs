#!/usr/bin/env node
/**
 * Spec 003 (per-house since 010a): fetch the real neighborhood around a house and write public/<slug>/neighborhood.bin
 * and the baked lot ground. Settings per house in scripts/houses/<slug>.mjs.
 *
 *   node scripts/fetch-neighborhood.mjs <house-slug>      e.g. stahl-house
 *
 * Sources (downloaded once, cached in scripts/.cache):
 *   - Buildings and roads: OpenStreetMap via the Overpass API. © OpenStreetMap contributors, ODbL.
 *   - Terrain: AWS Terrain Tiles (Mapzen terrarium encoding). Public dataset; attribution in the HUD.
 *
 * Model coordinates: x, z horizontal, y up, 1 unit = 1 ft; y = 0 is the brick lot.
 * The brick model is the real house rotated 180° (its street side faces model west, the real
 * street is east), so real data is rotated 180° to fit: real north = model +z, real east = model −x.
 * The OSM footprint of the house is then fitted onto the model's roof outline to find the offset.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const SLUG = process.argv[2];
if (!SLUG) { console.error('usage: node scripts/fetch-neighborhood.mjs <house-slug>   (settings in scripts/houses/<slug>.mjs)'); process.exit(1); }
const H = (await import(`./houses/${SLUG}.mjs`)).default;

const CACHE = 'scripts/.cache';
const OUT = H.out.bin;
const UA = 'blockitecture-data-script/1.0';
const FT = 0.3048;

const LAT0 = H.lat, LON0 = H.lon;
const RADIUS_M = H.radiusM;
const KX = (111320 * Math.cos((LAT0 * Math.PI) / 180)) / FT; // ft per degree of longitude
const KZ = 110574 / FT; // ft per degree of latitude

// model geometry this must agree with (src/model/layout.ts, src/model/site.ts)
const ROOF = H.fit.roof;
const TERRAIN = H.lot;

const NEAR = H.near; // ft
const FAR = H.far;
const [CX, CZ] = H.center;

fs.mkdirSync(CACHE, { recursive: true });

async function cached(name, fetcher) {
  const p = path.join(CACHE, name);
  if (fs.existsSync(p)) return fs.readFileSync(p);
  const buf = await fetcher();
  fs.writeFileSync(p, buf);
  return buf;
}

async function overpass(name, query) {
  const buf = await cached(name, async () => {
    console.log(`overpass: ${name}`);
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query),
    });
    if (!res.ok) throw new Error(`overpass ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  });
  return JSON.parse(buf.toString()).elements;
}

// ---------- terrain tiles ----------
const tiles = new Map();
async function tile(z, x, y) {
  const key = `${z}/${x}/${y}`;
  if (tiles.has(key)) return tiles.get(key);
  const buf = await cached(`terrarium-${z}-${x}-${y}.png`, async () => {
    console.log(`terrain tile ${key}`);
    const res = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${key}.png`, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`tile ${key}: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  });
  const png = PNG.sync.read(buf);
  const elev = new Float32Array(256 * 256);
  for (let i = 0; i < elev.length; i++) {
    const r = png.data[i * 4], g = png.data[i * 4 + 1], b = png.data[i * 4 + 2];
    elev[i] = r * 256 + g + b / 256 - 32768;
  }
  tiles.set(key, elev);
  return elev;
}
const lonToPx = (lon, z) => ((lon + 180) / 360) * 256 * 2 ** z;
const latToPx = (lat, z) => {
  const s = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 256 * 2 ** z;
};
async function px(z, X, Y) {
  const elev = await tile(z, Math.floor(X / 256), Math.floor(Y / 256));
  return elev[(Y % 256) * 256 + (X % 256)];
}
/** Bilinear elevation in metres. */
async function elevation(lat, lon, z) {
  const fx = lonToPx(lon, z) - 0.5, fy = latToPx(lat, z) - 0.5;
  const x = Math.floor(fx), y = Math.floor(fy), u = fx - x, v = fy - y;
  const a = await px(z, x, y), b = await px(z, x + 1, y), c = await px(z, x, y + 1), d = await px(z, x + 1, y + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

// ---------- coordinates ----------
let OX = 0, OZ = 0; // fitted below
/** real lat/lon → model ft, rotated 180° about the house */
// rotation of the real world into the model; cos/sin snapped so multiples of 90° are exact
let ROT = H.rotationDeg, RC = 0, RS = 0;
const setRotation = (deg) => {
  ROT = deg;
  RC = Math.round(Math.cos((deg * Math.PI) / 180) * 1e9) / 1e9 + 0;
  RS = Math.round(Math.sin((deg * Math.PI) / 180) * 1e9) / 1e9 + 0;
};
setRotation(H.rotationDeg);
/** real (east, north) ft → unrotated model (x = east, z = south) → rotated by rotationDeg */
const local = (lat, lon) => {
  const x = (lon - LON0) * KX, z = -(lat - LAT0) * KZ;
  return [x * RC - z * RS, x * RS + z * RC];
};
const toModel = (lat, lon) => { const [x, z] = local(lat, lon); return [x + OX, z + OZ]; };
const toLatLon = (mx, mz) => {
  const a = mx - OX, b = mz - OZ;
  const x = a * RC + b * RS, z = -a * RS + b * RC; // undo the rotation
  return [LAT0 - z / KZ, LON0 + x / KX];
};

function pointInPoly(x, z, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
const inRoof = (x, z) => ROOF.some((r) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3]);

/** Find the offset that best overlays the OSM house outline on the model's roof outline. */
/** Fit the house's OSM outline(s) (several buildings may share its wikidata, e.g. house + studio). */
function fitHouse(ringsLatLon) {
  const cells = [];
  for (const ringLatLon of ringsLatLon) {
    const ring0 = ringLatLon.map(([lat, lon]) => local(lat, lon));
    const xs = ring0.map((p) => p[0]), zs = ring0.map((p) => p[1]);
    const bx0 = Math.floor(Math.min(...xs)), bx1 = Math.ceil(Math.max(...xs));
    const bz0 = Math.floor(Math.min(...zs)), bz1 = Math.ceil(Math.max(...zs));
    for (let z = bz0; z < bz1; z++) for (let x = bx0; x < bx1; x++) if (pointInPoly(x + 0.5, z + 0.5, ring0)) cells.push([x, z]);
  }
  // roof cells: scan the roof rects' bounding box (+ margin); the Stahl House keeps its original window
  const W = H.fit.window ?? [
    Math.min(...ROOF.map((r) => r[0])) - 3, Math.min(...ROOF.map((r) => r[1])) - 4,
    Math.max(...ROOF.map((r) => r[2])) + 3, Math.max(...ROOF.map((r) => r[3])) + 3,
  ];
  let roofArea = 0;
  for (let z = W[1]; z < W[3]; z++) for (let x = W[0]; x < W[2]; x++) if (inRoof(x, z)) roofArea++;
  const [sx, sz] = H.fit.searchCenter ?? [0, 0];
  let best = { score: -1, ox: 0, oz: 0 };
  for (let oz = sz - 80; oz <= sz + 80; oz++)
    for (let ox = sx - 80; ox <= sx + 80; ox++) {
      let hit = 0;
      for (const [x, z] of cells) if (inRoof(x + ox, z + oz)) hit++;
      const iou = hit / (cells.length + roofArea - hit);
      if (iou > best.score) best = { score: iou, ox, oz, hit, osmArea: cells.length, roofArea };
    }
  return best;
}

// ---------- main ----------
const R = RADIUS_M;
const buildingsRaw = await overpass(
  `${SLUG}-buildings-${R}.json`,
  `[out:json][timeout:180];way["building"](around:${R},${LAT0},${LON0});out tags geom;`,
);
const roadsRaw = await overpass(
  `${SLUG}-roads-${R}.json`,
  `[out:json][timeout:180];way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service)$"](around:${R + 200},${LAT0},${LON0});out tags geom;`,
);

// the house's own outline(s): by wikidata, or (spec 025, opt-in) by OSM way id when the footprint carries no tags
const selves = H.fit.osmIds
  ? buildingsRaw.filter((e) => H.fit.osmIds.includes(e.id))
  : buildingsRaw.filter((e) => e.tags?.wikidata === H.fit.wikidata);
if (!selves.length) throw new Error(`${SLUG}: the house (${H.fit.osmIds ? `ways ${H.fit.osmIds}` : `wikidata ${H.fit.wikidata}`}) was not found in the OSM data`);
const rings = selves.map((e) => e.geometry.map((g) => [g.lat, g.lon]));
let fit = fitHouse(rings);
if (H.fit.rotationSearch) {
  // try a range of rotations too; keep the best overlap (spec 010)
  const [r0, r1, step] = H.fit.rotationSearch;
  let bestRot = ROT;
  for (let r = r0; r <= r1 + 1e-9; r += step) {
    setRotation(+r.toFixed(3));
    const f = fitHouse(rings);
    if (f.score > fit.score) { fit = f; bestRot = ROT; }
  }
  setRotation(bestRot);
  console.log(`rotation search ${r0}…${r1}: best ${bestRot}°`);
}
OX = fit.ox; OZ = fit.oz;
console.log(`house fit: offset (${OX}, ${OZ}) ft, IoU ${fit.score.toFixed(3)}, OSM ${fit.osmArea} ft², roof ${fit.roofArea} ft²`);

// y = 0 is the brick lot: the terrain elevation at the house
const [hLat, hLon] = toLatLon(CX, CZ);
// spec 017: a house can pin y = 0 to a known elevation (Fallingwater: its main floor, from the documented stream level),
// where the terrain tiles are too coarse to resolve the site (a ravine). Opt-in, so other houses stay byte-identical.
const E0 = H.lotElevationM ?? (await elevation(hLat, hLon, NEAR.zoom));
console.log(`lot elevation ${E0.toFixed(1)} m`);
const toY = (m) => (m - E0) / FT;

async function grid({ half, step, zoom }, despikeFt) {
  const n = Math.round((2 * half) / step) + 1;
  const x0 = Math.round(CX - half), z0 = Math.round(CZ - half);
  const h = new Int16Array(n * n);
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const [lat, lon] = toLatLon(x0 + i * step, z0 + j * step);
      h[j * n + i] = Math.round(toY(await elevation(lat, lon, zoom)) * 4);
    }
  if (despikeFt) despike(h, n, despikeFt, `${step} ft grid`);
  if (H.seaFloorFt !== undefined) {
    // spec 010b: under the (opaque) sea the exact depth doesn't show, but the tiles have corrupt blobs hundreds of
    // feet deep near the shore; clamp the sea floor to a plausible depth below sea level
    const floor = Math.round((toY(0) - H.seaFloorFt) * 4);
    let clamped = 0;
    for (let k = 0; k < h.length; k++) if (h[k] < floor) { h[k] = floor; clamped++; }
    console.log(`sea floor ${step} ft grid: ${clamped} samples clamped to ${H.seaFloorFt} ft below sea level`);
  }
  return { x0, z0, step, nx: n, nz: n, h };
}

/**
 * Spec 010b: the terrain tiles have occasional corrupt samples over the ocean (spikes hundreds of feet up or down).
 * Replace any sample that differs from the median of its 8 neighbours by more than `limitFt` with that median.
 * Opt-in per house (H.despike), so other houses' data stays byte-identical.
 */
function despike(h, n, limitFt, label) {
  // repeated passes, first over the 8 neighbours (3×3), then over 24 (5×5) for clusters of bad samples
  let total = 0, worst = 0;
  for (const r of [1, 2]) {
    for (let pass = 0; pass < 12; pass++) {
      const src = Int16Array.from(h);
      let fixed = 0;
      for (let j = r; j < n - r; j++)
        for (let i = r; i < n - r; i++) {
          const nb = [];
          for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) if (di || dj) nb.push(src[(j + dj) * n + i + di]);
          nb.sort((a, b) => a - b);
          const m = nb.length >> 1, med = Math.round((nb[m - 1] + nb[m]) / 2), k = j * n + i;
          const dev = Math.abs(src[k] - med) / 4;
          if (dev > limitFt) { h[k] = med; fixed++; worst = Math.max(worst, dev); }
        }
      total += fixed;
      if (!fixed) break;
    }
  }
  console.log(`despike ${label}: ${total} samples fixed (worst ${worst.toFixed(0)} ft off its neighbours)`);
}
const near = await grid(NEAR, H.despike?.near);
if (H.carveStream) await carveStream(near, H.carveStream);
const far = await grid(FAR, H.despike?.far);

/**
 * Spec 017: carve a stream into the near grid along its OSM line. The terrain tiles (10–30 m) smooth a narrow ravine away,
 * leaving the stream bed 20–30 ft too high. The water level is pinned at the waterfall (above and below it) and falls off
 * along the stream with `slope`; the bed sits `bedFt` below it, and the banks rise at `bank` ft per ft. Opt-in.
 */
async function carveStream(g, c) {
  const ww = await overpass(
    `${SLUG}-waterways-${R}.json`,
    `[out:json][timeout:120];(way["waterway"](around:${H.waterways.radiusM},${LAT0},${LON0});node["waterway"="waterfall"](around:${H.waterways.radiusM},${LAT0},${LON0}););out tags geom;`,
  );
  const way = ww.filter((e) => e.type === 'way' && e.tags?.name === c.name).sort((a, b) => b.geometry.length - a.geometry.length)[0];
  const pts = way.geometry.map((q) => toModel(q.lat, q.lon));
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  /** nearest point on the line: [distance, arc length] */
  const nearest = (x, z) => {
    let best = [Infinity, 0];
    for (let i = 1; i < pts.length; i++) {
      const [ax, az] = pts[i - 1], [bx, bz] = pts[i], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
      const d = Math.hypot(x - ax - t * dx, z - az - t * dz);
      if (d < best[0]) best = [d, acc[i - 1] + t * Math.sqrt(L2)];
    }
    return best;
  };
  const sFalls = nearest(c.fallsAt[0], c.fallsAt[1])[1];
  const up = c.flowsAlongLine ? 1 : -1; // sign of (s − sFalls) that is downstream
  let carved = 0;
  for (let j = 0; j < g.nz; j++)
    for (let i = 0; i < g.nx; i++) {
      const x = g.x0 + i * g.step, z = g.z0 + j * g.step;
      if (Math.hypot(x - c.fallsAt[0], z - c.fallsAt[1]) > c.reach) continue;
      const [d, sArc] = nearest(x, z);
      if (d > c.halfWidth + c.bankWidth) continue;
      const along = (sArc - sFalls) * up; // > 0 downstream
      const level = along > 0 ? c.downFt - along * c.slope : c.upFt - along * c.slope;
      const bed = level - c.bedFt + Math.max(0, d - c.halfWidth) * c.bank;
      const k = j * g.nx + i, cur = g.h[k] / 4;
      if (bed < cur) { g.h[k] = Math.round(bed * 4); carved++; }
    }
  console.log(`carved ${c.name}: ${carved} near-grid samples lowered`);
}
const nearAt = (x, z) => {
  const fx = (x - near.x0) / near.step, fz = (z - near.z0) / near.step;
  const i = Math.max(0, Math.min(near.nx - 2, Math.floor(fx))), j = Math.max(0, Math.min(near.nz - 2, Math.floor(fz)));
  const u = fx - i, v = fz - j, H = (ii, jj) => near.h[jj * near.nx + ii] / 4;
  return H(i, j) * (1 - u) * (1 - v) + H(i + 1, j) * u * (1 - v) + H(i, j + 1) * (1 - u) * v + H(i + 1, j + 1) * u * v;
};

// real ground under the brick lot, baked into a tiny module so brick generation stays synchronous (spec 004)
{
  const M = 60; // ft of margin around the lot
  const i0 = Math.floor((TERRAIN.x0 - M - near.x0) / near.step), i1 = Math.ceil((TERRAIN.x1 + M - near.x0) / near.step);
  const j0 = Math.floor((TERRAIN.z0 - M - near.z0) / near.step), j1 = Math.ceil((TERRAIN.z1 + M - near.z0) / near.step);
  const rows = [];
  for (let j = j0; j <= j1; j++) {
    const row = [];
    for (let i = i0; i <= i1; i++) row.push(near.h[j * near.nx + i]);
    rows.push('  ' + row.join(', ') + ',');
  }
  const src = `// GENERATED by scripts/fetch-neighborhood.mjs: do not edit. Spec 004.
// Real ground under the brick lot (AWS Terrain Tiles), in model coordinates: x/z in ft, heights in ft × 4, y = 0 at the house.
// Same samples as the near grid in public/neighborhood.bin, so bricks and terrain mesh agree exactly.
export const LOT_GROUND = {
  x0: ${near.x0 + i0 * near.step}, z0: ${near.z0 + j0 * near.step}, step: ${near.step}, nx: ${i1 - i0 + 1}, nz: ${j1 - j0 + 1},
  // prettier-ignore
  h: [
${rows.join('\n')}
  ],
};
`;
  let extra = '';
  if (H.waterways) {
    // spec 017: the OSM stream line(s) and waterfalls near the lot, in model ft, so the block stream meets the real one
    const ww = await overpass(
      `${SLUG}-waterways-${R}.json`,
      `[out:json][timeout:120];(way["waterway"](around:${H.waterways.radiusM},${LAT0},${LON0});node["waterway"="waterfall"](around:${H.waterways.radiusM},${LAT0},${LON0}););out tags geom;`,
    );
    const r1 = (v) => Math.round(v * 10) / 10;
    const lines = ww.filter((e) => e.type === 'way' && e.geometry).map((e) =>
      `  { name: ${JSON.stringify(e.tags?.name ?? '')}, kind: ${JSON.stringify(e.tags.waterway)}, pts: [${e.geometry.map((g) => toModel(g.lat, g.lon).map(r1).join(', ')).map((p) => `[${p}]`).join(', ')}] },`);
    const falls = ww.filter((e) => e.type === 'node').map((e) => `[${toModel(e.lat, e.lon).map(r1).join(', ')}]`);
    extra = `
// OSM waterways near the lot (model ft) and waterfall points. © OpenStreetMap contributors (ODbL). Spec 017.
export const LOT_WATERWAYS: { name: string; kind: string; pts: [number, number][] }[] = [
${lines.join('\n')}
];
export const LOT_WATERFALLS: [number, number][] = [${falls.join(', ')}];
`;
  }
  if (H.coastline) {
    // spec 031: OSM's coastline near the lot (natural=coastline: land on the left of each way), in model ft, for headlands the
    // terrain tiles mistake for sea
    const cl = await overpass(
      `${SLUG}-coastline-${H.coastline.radiusM}.json`,
      `[out:json][timeout:120];way["natural"="coastline"](around:${H.coastline.radiusM},${LAT0},${LON0});out geom;`,
    );
    const r1 = (v) => Math.round(v * 10) / 10;
    const lines = cl.filter((e) => e.geometry).map((e) => `  [${e.geometry.map((g) => `[${toModel(g.lat, g.lon).map(r1).join(', ')}]`).join(', ')}],`);
    extra += `
// OSM's coastline near the house (natural=coastline; land on the left of each line), in model ft. © OpenStreetMap contributors (ODbL). Spec 031.
export const LOT_COAST: [number, number][][] = [
${lines.join('\n')}
];
`;
  }
  if (H.exportSelf) {
    // spec 025: the house's own OSM outline(s) in model ft, so the model can follow them exactly
    const r1 = (v) => Math.round(v * 10) / 10;
    const rings = selves.map((e) => `[${e.geometry.slice(0, -1).map((g) => `[${toModel(g.lat, g.lon).map(r1).join(', ')}]`).join(', ')}]`);
    extra += `
// The house's own OSM outline(s), in model ft. © OpenStreetMap contributors (ODbL). Spec 025.
export const LOT_SELF: [number, number][][] = [
  ${rings.join(',\n  ')},
];
`;
  }
  if (H.lotFeatures) {
    // spec 019: the real buildings and streets that overlap the lot (the neighbourhood renderer leaves them out), in model ft
    const inLot = (pts) => pts.some(([x, z]) => x > TERRAIN.x0 - 5 && x < TERRAIN.x1 + 5 && z > TERRAIN.z0 - 5 && z < TERRAIN.z1 + 5);
    const r1 = (v) => Math.round(v * 10) / 10;
    const bl = [];
    for (const e of buildingsRaw) {
      if (selves.includes(e) || !e.geometry) continue;
      const ring = e.geometry.slice(0, -1).map((g) => toModel(g.lat, g.lon));
      const cx = ring.reduce((a, p) => a + p[0], 0) / ring.length, cz = ring.reduce((a, p) => a + p[1], 0) / ring.length;
      if (!(cx > TERRAIN.x0 && cx < TERRAIN.x1 && cz > TERRAIN.z0 && cz < TERRAIN.z1)) continue; // its centre in the lot
      const t = e.tags ?? {};
      bl.push(`  { id: ${e.id}, levels: ${parseFloat(t['building:levels']) || 0}, kind: ${JSON.stringify(t.building ?? 'yes')}, ring: [${ring.map((p) => `[${p.map(r1).join(', ')}]`).join(', ')}] },`);
    }
    const rl = [];
    for (const e of roadsRaw) {
      if (!e.geometry) continue;
      const pts = e.geometry.map((g) => toModel(g.lat, g.lon));
      if (!inLot(pts)) continue;
      rl.push(`  { name: ${JSON.stringify(e.tags.name ?? '')}, highway: ${JSON.stringify(e.tags.highway)}, bridge: ${!!e.tags.bridge}, pts: [${pts.map((p) => `[${p.map(r1).join(', ')}]`).join(', ')}] },`);
    }
    extra += `
// OSM buildings and streets overlapping the lot (model ft); the neighbourhood renderer leaves these out. © OpenStreetMap contributors (ODbL). Spec 019.
export const LOT_BUILDINGS: { id: number; levels: number; kind: string; ring: [number, number][] }[] = [
${bl.join('\n')}
];
export const LOT_ROADS: { name: string; highway: string; bridge: boolean; pts: [number, number][] }[] = [
${rl.join('\n')}
];
`;
  }
  fs.writeFileSync(H.out.lot, src + extra);
  console.log(`wrote ${H.out.lot}: ${(i1 - i0 + 1) * (j1 - j0 + 1)} samples`);
}

// buildings
if (H.waterAreas) await writeWaterAreas(H.waterAreas);

/**
 * Spec 022: OSM's water areas (rivers, lakes, ponds: natural=water ways and multipolygons) near the house, in model ft,
 * each with its surface level read from the terrain (the median of the near-grid samples inside it). Written to
 * H.waterAreas.out for the house's scenery; opt-in, so other houses' data is untouched.
 */
async function writeWaterAreas(c) {
  const els = await overpass(
    `${SLUG}-water-${c.radiusM}.json`,
    `[out:json][timeout:180];(way["natural"="water"](around:${c.radiusM},${LAT0},${LON0});relation["natural"="water"](around:${c.radiusM},${LAT0},${LON0}););out geom;`,
  );
  const key = (p) => `${p.lat.toFixed(7)},${p.lon.toFixed(7)}`;
  /** join open ways end to end into closed rings */
  const assemble = (ways) => {
    const left = ways.map((w) => w.slice()), rings = [];
    while (left.length) {
      let ring = left.shift();
      let grew = true;
      while (key(ring[0]) !== key(ring[ring.length - 1]) && grew) {
        grew = false;
        for (let i = 0; i < left.length; i++) {
          const w = left[i], end = key(ring[ring.length - 1]);
          if (key(w[0]) === end) ring = ring.concat(w.slice(1));
          else if (key(w[w.length - 1]) === end) ring = ring.concat(w.slice(0, -1).reverse());
          else continue;
          left.splice(i, 1); grew = true; break;
        }
      }
      if (ring.length >= 4) rings.push(ring);
    }
    return rings;
  };
  const toRing = (geom) => geom.map((g) => toModel(g.lat, g.lon)).map(([x, z]) => [Math.round(x), Math.round(z)]);
  const areas = [];
  for (const e of els) {
    let outers = [], inners = [];
    if (e.type === 'way' && e.geometry) outers = [e.geometry];
    else if (e.type === 'relation') {
      outers = assemble(e.members.filter((m) => m.type === 'way' && m.role !== 'inner' && m.geometry).map((m) => m.geometry));
      inners = assemble(e.members.filter((m) => m.type === 'way' && m.role === 'inner' && m.geometry).map((m) => m.geometry));
    }
    for (const o of outers) {
      const outer = toRing(o);
      const holes = inners.map(toRing).filter((h) => h.some(([x, z]) => pointInPoly(x, z, outer)));
      // the surface: the median of the near-grid samples inside (or the terrain at its first point if it's smaller than a cell)
      const inside = [];
      for (let j = 0; j < near.nz; j++)
        for (let i = 0; i < near.nx; i++) {
          const x = near.x0 + i * near.step, z = near.z0 + j * near.step;
          if (pointInPoly(x, z, outer) && !holes.some((h) => pointInPoly(x, z, h))) inside.push(near.h[j * near.nx + i] / 4);
        }
      // areas with no sample inside lie beyond the near grid (or are smaller than a cell): left out
      if (!inside.length) continue;
      inside.sort((a, b) => a - b);
      const level = inside[inside.length >> 1];
      areas.push({ name: e.tags?.name ?? '', kind: e.tags?.water ?? 'water', level: Math.round(level * 10) / 10, rings: [outer, ...holes] });
    }
  }
  const src = `// GENERATED by scripts/fetch-neighborhood.mjs: do not edit. Spec 022.
// OSM water areas near the house (natural=water), in model ft, with surface levels from the terrain. © OpenStreetMap contributors (ODbL).
import type { WaterArea } from '@/engine/house';

export const WATER_AREAS: WaterArea[] = ${JSON.stringify(areas)};
`;
  fs.writeFileSync(c.out, src);
  console.log(`water areas: ${areas.length} (${areas.reduce((a, w) => a + w.rings.reduce((b, r) => b + r.length, 0), 0)} points) → ${c.out}`);
}

const KIND = { house: 0, apartments: 1, commercial: 2, retail: 2, hotel: 2, office: 2 };
const bCoords = [], bStart = [], bBase = [], bTop = [], bKind = [];
let skipped = { self: 0, lot: 0, far: 0, tiny: 0 };
for (const e of buildingsRaw) {
  if (selves.includes(e)) { skipped.self++; continue; }
  if (!e.geometry || e.geometry.length < 4) continue;
  let ring = e.geometry.slice(0, -1).map((g) => toModel(g.lat, g.lon));
  // drop near-duplicate vertices
  ring = ring.filter((p, i) => i === 0 || Math.hypot(p[0] - ring[i - 1][0], p[1] - ring[i - 1][1]) > 1);
  if (ring.length < 3) { skipped.tiny++; continue; }
  const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]);
  const cx = xs.reduce((a, b) => a + b) / xs.length, cz = zs.reduce((a, b) => a + b) / zs.length;
  if (Math.hypot(cx - OX, cz - OZ) > RADIUS_M / FT) { skipped.far++; continue; }
  // the brick model owns its lot (spec 003, A4)
  // the lot's own buildings are bricks; with lotFeatures (spec 019) only those whose centre is in the lot
  const overlaps = Math.max(...xs) > TERRAIN.x0 && Math.min(...xs) < TERRAIN.x1 && Math.max(...zs) > TERRAIN.z0 && Math.min(...zs) < TERRAIN.z1;
  const centred = cx > TERRAIN.x0 && cx < TERRAIN.x1 && cz > TERRAIN.z0 && cz < TERRAIN.z1;
  if (H.lotFeatures ? centred : overlaps) {
    skipped.lot++; continue;
  }
  const t = e.tags;
  let hM = parseFloat(t.height);
  if (!(hM > 0)) hM = t['building:levels'] ? parseFloat(t['building:levels']) * 3.2 + 1 : t.building === 'apartments' ? 10 : 6;
  const ground = ring.map((p) => nearAt(p[0], p[1]));
  const base = Math.min(...ground) - 2;
  const top = Math.max(Math.max(...ground) + 3, nearAt(cx, cz) + hM / FT);
  bStart.push(bCoords.length / 2);
  for (const [x, z] of ring) bCoords.push(Math.round(x * 2), Math.round(z * 2));
  bBase.push(Math.round(base * 4));
  bTop.push(Math.round(top * 4));
  bKind.push(KIND[t.building] ?? 0);
}
bStart.push(bCoords.length / 2);
console.log(`buildings: ${bBase.length} kept`, skipped);

// roads
const RCLASS = { motorway: 3, trunk: 3, primary: 3, secondary: 2, tertiary: 2, unclassified: 1, residential: 1, living_street: 1, service: 0 };
const rCoords = [], rStart = [], rClass = [];
for (const e of roadsRaw) {
  if (!e.geometry) continue;
  rStart.push(rCoords.length / 2);
  for (const g of e.geometry) {
    const [x, z] = toModel(g.lat, g.lon);
    rCoords.push(Math.round(x * 2), Math.round(z * 2));
  }
  rClass.push(RCLASS[e.tags.highway] ?? 1);
}
rStart.push(rCoords.length / 2);
console.log(`roads: ${rClass.length}`);

// ---------- write ----------
/** Row-wise delta encoding: terrain is smooth, so deltas are small and compress well. */
const delta = (h, nx) => {
  const d = new Int16Array(h.length);
  for (let i = 0; i < h.length; i++) d[i] = i % nx === 0 ? h[i] : h[i] - h[i - 1];
  return d;
};
/** Per-path delta encoding of interleaved x,z: first point absolute, the rest relative to the previous point. */
const deltaPath = (xy, start) => {
  const d = new Int16Array(xy.length);
  for (let p = 0; p < start.length - 1; p++)
    for (let i = start[p]; i < start[p + 1]; i++)
      for (const c of [0, 1]) d[i * 2 + c] = i === start[p] ? xy[i * 2 + c] : xy[i * 2 + c] - xy[(i - 1) * 2 + c];
  return d;
};
const arrays = {
  nearH: delta(near.h, near.nx), farH: delta(far.h, far.nx),
  bCoords: deltaPath(bCoords, bStart), bStart: Uint32Array.from(bStart),
  bBase: Int16Array.from(bBase), bTop: Int16Array.from(bTop), bKind: Uint8Array.from(bKind),
  rCoords: deltaPath(rCoords, rStart), rStart: Uint32Array.from(rStart), rClass: Uint8Array.from(rClass),
};
const header = {
  version: 1,
  attribution: ['© OpenStreetMap contributors (ODbL)', 'Terrain: Mapzen / AWS Terrain Tiles'],
  anchor: { lat: LAT0, lon: LON0, rotationDeg: ROT, lotElevationM: +E0.toFixed(2), offsetX: OX, offsetZ: OZ, houseIoU: +fit.score.toFixed(3) },
  scale: { coords: 2, heights: 4 },
  encoding: { nearH: 'row-delta', farH: 'row-delta', bCoords: 'path-delta', rCoords: 'path-delta' },
  near: { x0: near.x0, z0: near.z0, step: near.step, nx: near.nx, nz: near.nz },
  far: { x0: far.x0, z0: far.z0, step: far.step, nx: far.nx, nz: far.nz },
  arrays: {},
};
let offset = 0;
const parts = [];
for (const [k, a] of Object.entries(arrays)) {
  const pad = (8 - (offset % 8)) % 8;
  if (pad) { parts.push(Buffer.alloc(pad)); offset += pad; }
  header.arrays[k] = { type: a.constructor.name, offset, length: a.length };
  parts.push(Buffer.from(a.buffer, a.byteOffset, a.byteLength));
  offset += a.byteLength;
}
let json = Buffer.from(JSON.stringify(header));
const pre = 4 + json.length, prePad = (8 - (pre % 8)) % 8;
json = Buffer.concat([json, Buffer.alloc(prePad, 0x20)]);
const len = Buffer.alloc(4);
len.writeUInt32LE(json.length);
fs.writeFileSync(OUT, Buffer.concat([len, json, ...parts]));
console.log(`wrote ${OUT}: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);

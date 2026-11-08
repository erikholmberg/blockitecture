#!/usr/bin/env node
/**
 * Spec 003: fetch the real neighborhood around the Stahl House and write public/neighborhood.bin.
 *
 *   node scripts/fetch-neighborhood.mjs
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

const CACHE = 'scripts/.cache';
const OUT = 'public/stahl-house/neighborhood.bin';
const UA = 'blockitecture-data-script/1.0';
const FT = 0.3048;

// OSM centroid of "Case Study House No. 22" (way with wikidata=Q2328939)
const LAT0 = 34.1004395, LON0 = -118.3702198;
const RADIUS_M = 1200; // real buildings within this radius (spec 003, Q2)
const KX = (111320 * Math.cos((LAT0 * Math.PI) / 180)) / FT; // ft per degree of longitude
const KZ = 110574 / FT; // ft per degree of latitude

// model geometry this must agree with (src/model/layout.ts, src/model/site.ts)
const ROOF = [[-2, 23, 77, 57], [-2, -36, 27, 23]];
const TERRAIN = { x0: -112, z0: -120, x1: 144, z1: 132 };

const NEAR = { half: 4200, step: 20, zoom: 15 }; // ft
const FAR = { half: 30000, step: 250, zoom: 11 };

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
const local = (lat, lon) => [-(lon - LON0) * KX, (lat - LAT0) * KZ];
const toModel = (lat, lon) => { const [x, z] = local(lat, lon); return [x + OX, z + OZ]; };
const toLatLon = (x, z) => [LAT0 + (z - OZ) / KZ, LON0 - (x - OX) / KX];

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
function fitHouse(ringLatLon) {
  const ring0 = ringLatLon.map(([lat, lon]) => local(lat, lon));
  const xs = ring0.map((p) => p[0]), zs = ring0.map((p) => p[1]);
  const bx0 = Math.floor(Math.min(...xs)), bx1 = Math.ceil(Math.max(...xs));
  const bz0 = Math.floor(Math.min(...zs)), bz1 = Math.ceil(Math.max(...zs));
  const cells = [];
  for (let z = bz0; z < bz1; z++) for (let x = bx0; x < bx1; x++) if (pointInPoly(x + 0.5, z + 0.5, ring0)) cells.push([x, z]);
  let roofArea = 0;
  for (let z = -40; z < 60; z++) for (let x = -5; x < 80; x++) if (inRoof(x, z)) roofArea++;
  let best = { score: -1, ox: 0, oz: 0 };
  for (let oz = -80; oz <= 80; oz++)
    for (let ox = -80; ox <= 80; ox++) {
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
  `buildings-${R}.json`,
  `[out:json][timeout:180];way["building"](around:${R},${LAT0},${LON0});out tags geom;`,
);
const roadsRaw = await overpass(
  `roads-${R}.json`,
  `[out:json][timeout:180];way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service)$"](around:${R + 200},${LAT0},${LON0});out tags geom;`,
);

const stahl = buildingsRaw.find((e) => e.tags?.wikidata === 'Q2328939');
if (!stahl) throw new Error('Stahl House not found in OSM data');
const fit = fitHouse(stahl.geometry.map((g) => [g.lat, g.lon]));
OX = fit.ox; OZ = fit.oz;
console.log(`house fit: offset (${OX}, ${OZ}) ft, IoU ${fit.score.toFixed(3)}, OSM ${fit.osmArea} ft², roof ${fit.roofArea} ft²`);

// y = 0 is the brick lot: the terrain elevation at the house
const [hLat, hLon] = toLatLon(32, 12);
const E0 = await elevation(hLat, hLon, NEAR.zoom);
console.log(`lot elevation ${E0.toFixed(1)} m`);
const toY = (m) => (m - E0) / FT;

async function grid({ half, step, zoom }) {
  const n = Math.round((2 * half) / step) + 1;
  const x0 = Math.round(32 - half), z0 = Math.round(12 - half);
  const h = new Int16Array(n * n);
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const [lat, lon] = toLatLon(x0 + i * step, z0 + j * step);
      h[j * n + i] = Math.round(toY(await elevation(lat, lon, zoom)) * 4);
    }
  return { x0, z0, step, nx: n, nz: n, h };
}
const near = await grid(NEAR);
const far = await grid(FAR);
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
  fs.writeFileSync('src/model/lotTerrain.ts', src);
  console.log(`wrote src/model/lotTerrain.ts: ${(i1 - i0 + 1) * (j1 - j0 + 1)} samples`);
}

// buildings
const KIND = { house: 0, apartments: 1, commercial: 2, retail: 2, hotel: 2, office: 2 };
const bCoords = [], bStart = [], bBase = [], bTop = [], bKind = [];
let skipped = { stahl: 0, lot: 0, far: 0, tiny: 0 };
for (const e of buildingsRaw) {
  if (e === stahl) { skipped.stahl++; continue; }
  if (!e.geometry || e.geometry.length < 4) continue;
  let ring = e.geometry.slice(0, -1).map((g) => toModel(g.lat, g.lon));
  // drop near-duplicate vertices
  ring = ring.filter((p, i) => i === 0 || Math.hypot(p[0] - ring[i - 1][0], p[1] - ring[i - 1][1]) > 1);
  if (ring.length < 3) { skipped.tiny++; continue; }
  const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]);
  const cx = xs.reduce((a, b) => a + b) / xs.length, cz = zs.reduce((a, b) => a + b) / zs.length;
  if (Math.hypot(cx - OX, cz - OZ) > RADIUS_M / FT) { skipped.far++; continue; }
  // the brick model owns its lot (spec 003, A4)
  if (Math.max(...xs) > TERRAIN.x0 && Math.min(...xs) < TERRAIN.x1 && Math.max(...zs) > TERRAIN.z0 && Math.min(...zs) < TERRAIN.z1) {
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
  anchor: { lat: LAT0, lon: LON0, rotationDeg: 180, lotElevationM: +E0.toFixed(2), offsetX: OX, offsetZ: OZ, houseIoU: +fit.score.toFixed(3) },
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

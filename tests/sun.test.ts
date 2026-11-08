// Spec: specs/009-compass-correct-sun.md (A1–A4, A6)
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { bearingToTheta, dateParam, solarNoon, solarPosition, sunFor } from '../src/scene/sun';
import { SITE } from '../src/model/layout';
import { parseNeighborhood } from '../src/scene/neighborhoodData';
import { buildStahlHouse } from '../src/model/stahlHouse';
import { sequence } from '../src/build/sequencer';
import { houseFingerprint, modelFingerprint } from './fingerprint';

const rad = Math.PI / 180;
const expectedSunset = (declDeg: number, latDeg: number) => 360 - Math.acos(Math.sin(declDeg * rad) / Math.cos(latDeg * rad)) / rad;

/** time of geometric sunset (elevation 0) after solar noon, by bisection */
function sunsetAzimuth(day: string) {
  let a = solarNoon(day, SITE.lon).getTime(), b = a + 9 * 3600e3;
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    if (solarPosition(new Date(m), SITE.lat, SITE.lon).elevation > 0) a = m; else b = m;
  }
  return solarPosition(new Date(a), SITE.lat, SITE.lon).azimuth;
}

describe('009: compass-correct sun', () => {
  it('A1: sunset azimuths match the textbook geometry at the house', () => {
    expect(Math.abs(sunsetAzimuth('2026-06-21') - expectedSunset(23.44, SITE.lat))).toBeLessThan(1.5); // ≈ 299°
    expect(Math.abs(sunsetAzimuth('2026-12-21') - expectedSunset(-23.44, SITE.lat))).toBeLessThan(1.5); // ≈ 241°
    expect(Math.abs(sunsetAzimuth('2026-09-23') - 270)).toBeLessThan(1.5);
  });

  it('A1: at solar noon the sun is due south, at the right height', () => {
    const p = solarPosition(solarNoon('2026-06-21', SITE.lon), SITE.lat, SITE.lon);
    expect(Math.abs(p.azimuth - 180)).toBeLessThan(1);
    expect(Math.abs(p.elevation - (90 - SITE.lat + 23.44))).toBeLessThan(0.5);
  });

  it('A2: compass mapping matches the 180° orientation of the real-world data', () => {
    const f = readFileSync('public/stahl-house/neighborhood.bin');
    const n = parseNeighborhood(f.buffer.slice(f.byteOffset, f.byteOffset + f.byteLength));
    expect(SITE.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(SITE.lat).toBeCloseTo(n.anchor.lat, 6);
    expect(SITE.lon).toBeCloseTo(n.anchor.lon, 6);
    const dir = (bearing: number) => {
      const t = bearingToTheta(bearing, SITE.rotationDeg) * rad;
      return [Math.round(Math.sin(t) * 1e6) / 1e6 + 0, Math.round(Math.cos(t) * 1e6) / 1e6 + 0]; // (x, z) as three.js spherical; +0 normalizes −0
    };
    expect(dir(270)).toEqual([1, 0]); // real west → model +x
    expect(dir(0)).toEqual([0, 1]); // real north → model +z
    expect(dir(90)).toEqual([-1, 0]); // real east → model −x
  });

  it('A3: dusk sets in the real west at 2.2°, day is mid-afternoon in the south-west, all year', () => {
    for (let m = 1; m <= 12; m++) {
      const day = `2026-${String(m).padStart(2, '0')}-15`;
      const dusk = sunFor(day, SITE, 'dusk'), d = sunFor(day, SITE, 'day');
      expect(dusk.bearing).toBeGreaterThanOrEqual(230);
      expect(dusk.bearing).toBeLessThanOrEqual(310);
      expect(dusk.elevation).toBeCloseTo(2.2, 1);
      expect(d.bearing).toBeGreaterThanOrEqual(180);
      expect(d.bearing).toBeLessThanOrEqual(280);
      expect(d.elevation).toBeGreaterThan(15); // mid-December at 3 pm the sun is ~18° up (amended, see spec)
    }
  });

  it('A4: ?date= pins the day, anything invalid falls back to today', () => {
    const now = new Date(2026, 10, 8, 14, 0);
    expect(dateParam('2026-06-21', now)).toBe('2026-06-21');
    expect(dateParam(null, now)).toBe('2026-11-08');
    expect(dateParam('2026-13-40', now)).toBe('2026-11-08');
    expect(dateParam('yesterday', now)).toBe('2026-11-08');
  });

  it('A6: the model and the timeline are unchanged', () => {
    const bricks = buildStahlHouse().builder.bricks;
    expect(modelFingerprint(bricks)).toEqual({ count: 27222, hash: 'ebe0f28f' });
    expect(houseFingerprint(bricks)).toEqual({ count: 3603, hash: 'e781fb43' });
    expect(sequence(bricks).total).toBeCloseTo(228.7, 5);
  });
});

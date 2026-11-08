/**
 * Spec 009: where the sun really is. NOAA solar-position algorithm (accurate to well under a degree for our use),
 * plus the mapping from real compass bearings into model space. Pure: no Three.js, no DOM.
 */
const rad = Math.PI / 180, deg = 180 / Math.PI;

export interface Site {
  lat: number;
  lon: number;
  /** how the model is turned relative to the real world: 180 means model +z = real north, model −x = real east (spec 003) */
  rotationDeg: number;
}

/** Equation of time (minutes) and solar declination (degrees) for an instant. */
function sunParams(date: Date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545) / 36525;
  const L0 = (((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360) + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C =
    Math.sin(M * rad) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * M * rad) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * M * rad) * 0.000289;
  const omega = 125.04 - 1934.136 * T;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * rad);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * rad);
  const decl = Math.asin(Math.sin(eps * rad) * Math.sin(lambda * rad)) * deg;
  const y = Math.tan((eps / 2) * rad) ** 2;
  const eot =
    4 * deg *
    (y * Math.sin(2 * L0 * rad) - 2 * e * Math.sin(M * rad) + 4 * e * y * Math.sin(M * rad) * Math.cos(2 * L0 * rad) -
      0.5 * y * y * Math.sin(4 * L0 * rad) - 1.25 * e * e * Math.sin(2 * M * rad));
  return { decl, eot };
}

/** Sun azimuth (degrees clockwise from true north) and geometric elevation (degrees above the horizon). */
export function solarPosition(date: Date, lat: number, lon: number) {
  const { decl, eot } = sunParams(date);
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60 + date.getUTCMilliseconds() / 60000;
  const tst = (((minutes + eot + 4 * lon) % 1440) + 1440) % 1440;
  let ha = tst / 4 - 180;
  if (ha < -180) ha += 360;
  const cz = Math.sin(lat * rad) * Math.sin(decl * rad) + Math.cos(lat * rad) * Math.cos(decl * rad) * Math.cos(ha * rad);
  const zen = Math.acos(Math.max(-1, Math.min(1, cz))) * deg;
  const ca = (Math.sin(lat * rad) * Math.cos(zen * rad) - Math.sin(decl * rad)) / (Math.cos(lat * rad) * Math.sin(zen * rad));
  const a = Math.acos(Math.max(-1, Math.min(1, ca))) * deg;
  const azimuth = ha > 0 ? (a + 180) % 360 : (540 - a) % 360;
  return { azimuth, elevation: 90 - zen, declination: decl };
}

/** Solar noon (UTC instant) on a calendar day `YYYY-MM-DD` at longitude `lon`. */
export function solarNoon(day: string, lon: number): Date {
  const [y, m, d] = day.split('-').map(Number);
  const midnight = Date.UTC(y, m - 1, d);
  let noon = midnight + (720 - 4 * lon) * 60e3;
  noon = midnight + (720 - 4 * lon - sunParams(new Date(noon)).eot) * 60e3; // refine with that day's equation of time
  return new Date(noon);
}

/** Three.js spherical azimuth θ (degrees, direction (x, z) = (sin θ, cos θ)) for a real compass bearing. */
export const bearingToTheta = (bearing: number, rotationDeg: number) => (((180 - bearing + rotationDeg) % 360) + 360) % 360;

export const DUSK_ELEVATION = 2.2; // degrees: the dusk look of the original preset
export const DAY_AFTER_NOON_H = 3; // mid-afternoon

/** The sun for a preset on a day: real bearing/elevation, and the θ to give the sky. */
export function sunFor(day: string, site: Site, kind: 'day' | 'dusk') {
  const noon = solarNoon(day, site.lon).getTime();
  let t = noon + DAY_AFTER_NOON_H * 3600e3;
  if (kind === 'dusk') {
    // the afternoon moment the sun is DUSK_ELEVATION above the horizon
    let a = noon, b = noon + 9 * 3600e3;
    for (let i = 0; i < 50; i++) {
      const m = (a + b) / 2;
      if (solarPosition(new Date(m), site.lat, site.lon).elevation > DUSK_ELEVATION) a = m; else b = m;
    }
    t = (a + b) / 2;
  }
  const p = solarPosition(new Date(t), site.lat, site.lon);
  return { bearing: p.azimuth, elevation: p.elevation, theta: bearingToTheta(p.azimuth, site.rotationDeg), time: new Date(t) };
}

/** `?date=YYYY-MM-DD` if valid, otherwise the visitor's local today. */
export function dateParam(param: string | null, now = new Date()): string {
  if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) {
    const [y, m, d] = param.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d) return param;
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

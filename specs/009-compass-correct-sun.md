# 009 — Compass-correct sun

- **Status:** Done (approved by Erik 2026-11-08: "make sure the stahl house is positioned the right way compass wise, for sunrise and
  sunset in the accurate place"; sun follows the visitor's today; keep Day / Dusk, no Dawn)
- **Owner:** Erik
- **House:** stahl-house
- **Created:** 2026-11-08
- **Commits:** cb55516

## Goal
The sun should rise and set where it really does at the Stahl House, on the day you're looking at it.

## Research (2026-11-08, at 09d1548)
- **The house and its surroundings are already consistent with each other.** The brick house is the real house rotated 180°,
  and spec 003 rotated the real-world data to match: model **+z = real north**, model **−x = real east**, and model +x = real west.
  Only the sky ignores this.
- The sky is set by fixed presets in `src/scene/environment.ts`, as three.js spherical angles: `azimuth` θ, with direction
  (x, z) = (sin θ, cos θ). Translated into real compass bearings:
  - **Day:** θ = 215° → bearing ≈ **145° (SSE)**, elevation 38°. Plausible for late morning.
  - **Dusk:** θ = 250° → bearing ≈ **110° (ESE)**, elevation 2.2°. **The sun sets in the east-southeast**, nearly opposite to reality.
    At 34.1° N the sunset bearing runs from ≈ 241° (December solstice) through 270° (equinoxes) to ≈ 299° (June solstice).

## Behavior
- The sun's direction comes from a solar-position calculation for the house's latitude/longitude on the **visitor's
  current date**, mapped into model space through the house's compass orientation.
  - **Dusk:** the sun 2.2° above the western horizon just before sunset (the same elevation the dusk preset uses today, so the look is
    unchanged), at its real bearing for that date.
  - **Day:** the sun 3 hours after solar noon (mid-afternoon), at its real bearing and elevation for that date.
- `?date=YYYY-MM-DD` pins the date (for screenshots and tests).
- Everything else in the presets (colors, fog, exposure, lights) stays the same. Day and Dusk remain the only options.

## Acceptance criteria
- **A1** [unit] `solarPosition()` agrees with the textbook geometry: at 34.1° N the azimuth at geometric sunset matches
  360° − arccos(sin δ / cos φ) within 1.5° on the solstices and an equinox (≈ 299°, ≈ 241°, ≈ 270°). Solar noon is due south.
- **A2** [unit] Compass mapping: with the Stahl House's 180° orientation, real west → model +x, real north → model +z, real east → model −x.
  It agrees with the rotation that spec 003's data script applied.
- **A3** [unit] For any date, the computed Dusk sun points to the real west half (bearing 230°–310°) at 2.2° elevation, and the Day sun is
  south-west of the zenith (bearing 180°–280°) and above 15°. *(Amended from 20°: in mid-December the 3 pm sun really is only
  ≈ 18° up at 34° N. The low winter sun is the accurate result, so the criterion was wrong, not the sun.)*
- **A4** [unit] `?date=` overrides today. An invalid value falls back to today.
- **A5** [manual] In Chrome, from the famous view at dusk, the glow and the low sun sit over the city to the real west, behind the
  living-room corner, not over the hills behind. Day shadows fall to the north-east. Checked at `?date=2026-06-21` and `?date=2026-12-21`.
- **A6** [unit] The model, the build sequence and the other presets are unchanged (fingerprints `ebe0f28f` / `e781fb43`, total 228.7 s).

## Out of scope
A Dawn option, a time-of-day slider, the moon and stars.

## Implementation notes
- `src/scene/sun.ts` (pure, tested):
  - `solarPosition()` is the NOAA algorithm (equation of time and declination, then hour angle → azimuth and elevation).
  - `solarNoon()`; `sunFor(day, site, 'day' | 'dusk')`: Day = solar noon + 3 h, Dusk = bisection for the afternoon moment at 2.2° elevation.
  - `bearingToTheta(bearing, rotationDeg) = 180 − bearing + rotation`, i.e. a compass bearing → three.js spherical θ.
  - `dateParam()` handles `?date=`.
- `SITE` in `src/model/layout.ts`: the same lat/lon as the data script's anchor and `rotationDeg: 180` (the A2 test checks it against `neighborhood.bin`).
  When spec 010 makes the engine multi-house, this moves into the house definition.
- `Environment` takes the computed `{ theta, elevation }` for Day and Dusk and keeps every other preset value. `main.ts` computes them for
  the visitor's local date (or `?date=`) and logs them under `?debug`. The sky and the shadow-casting light both follow, because both come from the preset.
- **Before → after**, for example on 2026-12-21: Dusk 110° (ESE, wrong) → **240° (WSW)**; Day 145° (SSE, fixed) → **223° / 18°** (mid-afternoon).
  On 2026-06-21: Dusk **297°**, Day **267° / 49°**.
- The home-page thumbnail is recaptured with the correct sun at `?view=famous&light=dusk&clean&date=2026-12-21`, so it's
  reproducible. The winter sunset glows behind the living room.
- **Results:**
  - A1–A4, A6: `tests/sun.test.ts` (6 tests). A3 is amended (Day > 15°, not 20°; see the criterion). 77 tests total.
  - A5 pass in Chrome:
    - From the famous view (facing ≈ 225°), the 2026-12-21 sunset glow is straight ahead behind the living-room corner,
      and on 2026-06-21 it's off to the right (297°), as it should be.
    - The directional light's real bearing reads 223° by day (shadows fall toward 43°, north-east) and 240° at dusk,
      matching the calculation.

// Spec: specs/028-camera-above-ground.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { CAMERA_MARGIN, clampAboveGround, groundLookup } from '../src/engine/controls/ground';
import type { HouseDefinition } from '../src/engine/house';
import { parseNeighborhood } from '../src/engine/scene/neighborhoodData';
import { EAMES } from '../src/houses/eames-house/definition';
import { ENNIS } from '../src/houses/ennis-house/definition';
import { MALAPARTE } from '../src/houses/casa-malaparte/definition';
import { KAUFMANN } from '../src/houses/kaufmann-desert-house/definition';
import { LOVELL } from '../src/houses/lovell-health-house/definition';
import { BARRAGAN } from '../src/houses/casa-luis-barragan/definition';
import { KOSHINO } from '../src/houses/koshino-house/definition';
import { SHEATS_GOLDSTEIN } from '../src/houses/sheats-goldstein-residence/definition';
import { ROSE_SEIDLER } from '../src/houses/rose-seidler-house/definition';
import { DOUGLAS } from '../src/houses/douglas-house/definition';
import { CHURCH_OF_THE_LIGHT } from '../src/houses/church-of-the-light/definition';
import { LOVELL_BEACH } from '../src/houses/lovell-beach-house/definition';
import { NEUE_NATIONALGALERIE } from '../src/houses/neue-nationalgalerie/definition';
import { MUURATSALO } from '../src/houses/muuratsalo-experimental-house/definition';
import { SONNEVELD } from '../src/houses/sonneveld-house/definition';
import { TRELLICK } from '../src/houses/trellick-tower/definition';
import { UNITY_TEMPLE } from '../src/houses/unity-temple/definition';
import { HAUS_AM_HORN } from '../src/houses/haus-am-horn/definition';
import { GLASS_HOUSE } from '../src/houses/glass-house/definition';
import { VILLA_SAVOYE } from '../src/houses/villa-savoye/definition';
import { VANNA_VENTURI } from '../src/houses/vanna-venturi-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { FARNSWORTH } from '../src/houses/farnsworth-house/definition';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { STAHL } from '../src/houses/stahl-house/definition';

const load = (h: HouseDefinition) => {
  const f = readFileSync(`public/${h.data}`);
  const n = parseNeighborhood(f.buffer.slice(f.byteOffset, f.byteOffset + f.byteLength));
  const { heightmap } = h.build();
  return { n, heightmap, ground: groundLookup({ heightmap, lot: h.lot, n, scenery: h.scenery }) };
};

describe('028: the camera stays above the ground', () => {
  it('A1: a camera below ground + margin is raised to exactly that; one above is left alone', () => {
    const flat = () => 10;
    expect(CAMERA_MARGIN).toBe(3);
    expect(clampAboveGround({ x: 0, y: 5, z: 0 }, flat)).toEqual({ x: 0, y: 13, z: 0 });
    const high = { x: 1, y: 40, z: 2 };
    expect(clampAboveGround(high, flat)).toBe(high);
  });

  it('A2: the block terrain inside the lot, the real terrain outside, never below the water', () => {
    const fw = load(FALLINGWATER);
    const r = FALLINGWATER.lot.rect;
    const ix = (r.x0 + r.x1) >> 1, iz = (r.z0 + r.z1) >> 1;
    expect(fw.ground(ix, iz)).toBeCloseTo(fw.heightmap.at(ix, iz) * PLATE, 6);
    // outside the lot: the real terrain (the neighbourhood's ground there)
    expect(Number.isFinite(fw.ground(r.x1 + 400, iz))).toBe(true);
    // the sea off the Eames House: never below sea level
    const ea = load(EAMES);
    const seaY = -ea.n.anchor.lotElevationM / 0.3048;
    expect(ea.ground(10, 3000)).toBeGreaterThanOrEqual(seaY - 1e-6);
    // the Fox River by the Farnsworth House: never below its surface, just past the lot's south edge
    const fa = load(FARNSWORTH);
    const river = FARNSWORTH.scenery!.waterAreas!.find((a) => a.kind === 'river' && a.rings[0].some(([x, z]) => Math.hypot(x - 68, z - 22) < 300))!;
    expect(fa.ground(68, 175)).toBeGreaterThanOrEqual(river.level - 1e-6);
  });

  it('A3: every house\'s named views start above the ground (the clamp leaves them alone)', () => {
    for (const h of [STAHL, EAMES, FALLINGWATER, SCHRODER, FARNSWORTH, ENNIS, MALAPARTE, KAUFMANN, LOVELL, BARRAGAN, KOSHINO, SHEATS_GOLDSTEIN, ROSE_SEIDLER, VANNA_VENTURI, DOUGLAS, CHURCH_OF_THE_LIGHT, LOVELL_BEACH, NEUE_NATIONALGALERIE, MUURATSALO, SONNEVELD, TRELLICK, UNITY_TEMPLE, HAUS_AM_HORN, GLASS_HOUSE, VILLA_SAVOYE]) {
      const { ground } = load(h);
      for (const [name, v] of Object.entries(h.views)) {
        const p = v.view.pos;
        expect(p.y, `${h.slug} ${name}: ground ${ground(p.x, p.z).toFixed(1)}`).toBeGreaterThanOrEqual(ground(p.x, p.z) + CAMERA_MARGIN);
      }
    }
  }, 60_000);
});

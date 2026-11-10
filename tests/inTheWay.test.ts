// Spec: specs/038-neighbours-out-of-the-way.md
import { describe, expect, it } from 'vitest';
import { inTheWay, neighbourFootprints } from '../src/engine/inTheWay';
import { LOVELL } from '../src/houses/lovell-health-house/definition';
import { LOT_BUILDINGS } from '../src/houses/lovell-health-house/model/lotTerrain';
import { KAUFMANN } from '../src/houses/kaufmann-desert-house/definition';
import { BARRAGAN } from '../src/houses/casa-luis-barragan/definition';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';

const cam = { x: 0, y: 30, z: 0 }, target = { x: 0, y: 0, z: 200 };

describe('038: in the way', () => {
  it('A1: straddling the line of sight, within the clearance, beside it, behind the target, below it', () => {
    expect(inTheWay({ x0: -20, z0: 80, x1: 20, z1: 120, top: 40 }, cam, target)).toBe(true); // straddles
    expect(inTheWay({ x0: 15, z0: 60, x1: 40, z1: 90, top: 40 }, cam, target, 25)).toBe(true); // 15 ft beside: within
    expect(inTheWay({ x0: 60, z0: 60, x1: 90, z1: 90, top: 40 }, cam, target, 25)).toBe(false); // 60 ft beside
    expect(inTheWay({ x0: -20, z0: 220, x1: 20, z1: 260, top: 80 }, cam, target)).toBe(false); // behind the target
    expect(inTheWay({ x0: 30, z0: 185, x1: 60, z1: 215, top: 40 }, cam, target)).toBe(false); // 30 ft beside the target
    expect(inTheWay({ x0: -20, z0: 80, x1: 20, z1: 120, top: 5 }, cam, target)).toBe(false); // the line passes above it
  });
});

describe('038: Lovell', () => {
  const bricks = LOVELL.build().builder.bricks;
  const fps = neighbourFootprints(bricks);
  const uphill = LOT_BUILDINGS.findIndex((b) => b.id === 422130801);
  const t = { x: 62, y: 0, z: 37 };
  const inWay = (pos: { x: number; y: number; z: number }) => fps.map((f) => inTheWay(f, pos, t));

  it('A2: from the street side, the uphill neighbour is in the way and the others are not; from the overview, none', () => {
    expect(fps.length).toBe(LOT_BUILDINGS.length);
    const street = inWay({ x: 160, y: 40, z: -120 });
    expect(street[uphill]).toBe(true);
    expect(street.filter(Boolean).length).toBe(1);
    const o = LOVELL.views.overview.view;
    expect(inWay(o.pos).some(Boolean)).toBe(false);
  });

  it('A3: only the neighbours\' pieces carry a building index', () => {
    const tagged = bricks.filter((b) => b.nb !== undefined);
    expect(tagged.length).toBeGreaterThan(0);
    // every tagged piece stands inside its neighbour's outline (to the stud), none inside the house's
    for (const b of tagged) {
      const ring = LOT_BUILDINGS[b.nb!].ring;
      const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]);
      expect(b.x).toBeGreaterThanOrEqual(Math.floor(Math.min(...xs)));
      expect(b.x + b.w).toBeLessThanOrEqual(Math.ceil(Math.max(...xs)));
      expect(b.z).toBeGreaterThanOrEqual(Math.floor(Math.min(...zs)));
      expect(b.z + b.d).toBeLessThanOrEqual(Math.ceil(Math.max(...zs)));
    }
  }, 60_000);

  it('A3: every house with lot neighbours tags them', () => {
    for (const d of [KAUFMANN, BARRAGAN, SCHRODER]) { // Ennis's lot has none today
      const n = new Set(d.build().builder.bricks.filter((b) => b.nb !== undefined).map((b) => b.nb)).size;
      expect(n, d.slug).toBeGreaterThan(0);
      expect(n, d.slug).toBeLessThanOrEqual(64); // the shader's limit (BrickSet)
    }
  }, 120_000);
});

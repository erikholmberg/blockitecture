// Spec: specs/047-loading-on-iphone.md
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildPayload, GROUND_MARGIN, unpackPayload } from '../src/engine/buildPayload';
import { sequence } from '../src/engine/sequencer';
import type { HouseDefinition } from '../src/engine/house';
import { modelFingerprint } from './fingerprint';

const slugs = readdirSync('src/houses', { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const defs: Record<string, HouseDefinition> = {};
for (const s of slugs) {
  const mod = await import(`../src/houses/${s}/definition.ts`);
  defs[s] = Object.values(mod).find((v): v is HouseDefinition => typeof v === 'object' && v !== null && 'build' in v && 'slug' in v)!;
}

describe('047: the model, generated off the main thread', () => {
  it('A1 and A2: for every house, the payload unpacks to the same model, schedule and ground', () => {
    expect(slugs.length).toBeGreaterThanOrEqual(15);
    for (const s of slugs) {
      const h = defs[s];
      const direct = h.build();
      const sched = sequence(direct.builder.bricks, h.phases, h.center);
      // through structuredClone, as a worker's message would be
      const got = unpackPayload(structuredClone(buildPayload(h)));
      expect(modelFingerprint(got.bricks), s).toEqual(modelFingerprint(direct.builder.bricks));
      expect(got.schedule.order, s).toEqual(sched.order);
      expect(Array.from(got.schedule.start), s).toEqual(Array.from(sched.start));
      expect(got.schedule.phaseStart, s).toEqual(sched.phaseStart);
      expect(got.schedule.total, s).toBe(sched.total);
      expect(got.studs, s).toEqual([]);
      // A2: the ground over the whole lot and its margin
      const r = h.lot.rect;
      for (let z = r.z0 - GROUND_MARGIN; z < r.z1 + GROUND_MARGIN; z += 3)
        for (let x = r.x0 - GROUND_MARGIN; x < r.x1 + GROUND_MARGIN; x += 3)
          if (got.heightmap.at(x, z) !== direct.heightmap.at(x, z)) throw new Error(`${s}: ground differs at ${x},${z}`);
    }
  }, 300_000);

  it('A3: every house page starts the viewer with its own worker, which serves that house', () => {
    for (const s of slugs) {
      const main = readFileSync(`src/houses/${s}/main.ts`, 'utf8');
      expect(main, s).toMatch(/startViewer\((\w+), \(\) => new Worker\(new URL\('\.\/worker\.ts', import\.meta\.url\), \{ type: 'module' \}\)\)/);
      const name = main.match(/startViewer\((\w+),/)![1];
      expect(existsSync(`src/houses/${s}/worker.ts`), s).toBe(true);
      const worker = readFileSync(`src/houses/${s}/worker.ts`, 'utf8');
      expect(worker, s).toContain(`import { ${name} } from './definition';`);
      expect(worker, s).toContain(`serveBuild(${name});`);
    }
  });
});

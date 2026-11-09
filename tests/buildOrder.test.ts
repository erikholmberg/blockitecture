// Spec: specs/012-roof-last.md: the default build order for every house
import { describe, expect, it } from 'vitest';
import type { HouseDefinition } from '../src/engine/house';
import { sequence } from '../src/engine/sequencer';
import { HOUSES } from '../src/houses';
import { STAHL } from '../src/houses/stahl-house/definition';
import { EAMES } from '../src/houses/eames-house/definition';

/** every house definition; adding a live house without adding it here fails A2 */
const DEFINITIONS: HouseDefinition[] = [STAHL, EAMES];

describe('012: roof last, on every house', () => {
  it('A2: every live house is covered', () => {
    const covered = DEFINITIONS.map((d) => d.slug).sort();
    expect(covered).toEqual(HOUSES.filter((h) => h.status === 'live').map((h) => h.slug).sort());
  });

  for (const house of DEFINITIONS) {
    describe(house.slug, () => {
      const roles = house.phases.map((p) => p.role);
      it('A1: every phase has a role; interior → envelope → roof; only landscape after the roof', () => {
        expect(roles.every((r) => !!r)).toBe(true);
        const at = (r: string) => roles.indexOf(r as never);
        for (const r of ['interior', 'envelope', 'roof']) expect(at(r)).toBeGreaterThanOrEqual(0);
        expect(at('interior')).toBeLessThan(at('envelope'));
        expect(at('envelope')).toBeLessThan(at('roof'));
        for (const r of roles.slice(at('roof') + 1)) expect(r).toBe('landscape');
      });

      it('A3: no piece of the house is silently dropped (only terrain and landscaping may skip taken space)', () => {
        const { builder } = house.build();
        const dropped = builder.dropped
          .filter((d) => !['site', 'landscape'].includes(house.phases[d.phase].role))
          .map((d) => `${house.phases[d.phase].role} ${d.kind} at ${d.x},${d.y},${d.z}`);
        expect(dropped).toEqual([]);
      });

      it('A3: nothing in the interior lands in mid-air', () => {
        const { builder } = house.build();
        const bricks = builder.bricks;
        const s = sequence(bricks, house.phases, house.center);
        // the start time of whatever occupies each cell
        const startAt = new Map<string, number>();
        bricks.forEach((b, i) => {
          for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++)
            startAt.set(`${x},${y},${z}`, s.start[i]);
        });
        const interior = roles.indexOf('interior');
        const floating: string[] = [];
        bricks.forEach((b, i) => {
          if (b.phase !== interior) return;
          const t = s.start[i] + 1e-6;
          const touches = (x: number, y: number, z: number) => (startAt.get(`${x},${y},${z}`) ?? Infinity) <= t;
          let ok = false;
          for (let z = b.z; z < b.z + b.d && !ok; z++) for (let x = b.x; x < b.x + b.w && !ok; x++)
            ok = touches(x, b.y - 1, z) || touches(x, b.y + b.h, z);
          for (let y = b.y; y < b.y + b.h && !ok; y++) {
            for (let z = b.z; z < b.z + b.d && !ok; z++) ok = touches(b.x - 1, y, z) || touches(b.x + b.w, y, z);
            for (let x = b.x; x < b.x + b.w && !ok; x++) ok = touches(x, y, b.z - 1) || touches(x, y, b.z + b.d);
          }
          if (!ok) floating.push(`${b.kind} at ${b.x},${b.y},${b.z} (${b.w}×${b.d}×${b.h})`);
        });
        expect(floating).toEqual([]);
      });
    });
  }
});

// Spec: specs/050-palette-and-numbers.md
// Also the generator: `npm run stats` (STATS_WRITE=1) rewrites src/houses/stats.ts from the models.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { houseStats, renderStatsModule, type HouseStats } from '../src/engine/stats';
import type { HouseDefinition } from '../src/engine/house';
import { HOUSES } from '../src/houses';

const slugs = readdirSync('src/houses', { withFileTypes: true }).filter((e) => e.isDirectory() && existsSync(`src/houses/${e.name}/definition.ts`)).map((e) => e.name).sort();
const defs: Record<string, HouseDefinition> = {};
for (const s of slugs) {
  const mod = await import(`../src/houses/${s}/definition.ts`);
  defs[s] = Object.values(mod).find((v): v is HouseDefinition => typeof v === 'object' && v !== null && 'build' in v && 'slug' in v)!;
}
const fresh: Record<string, HouseStats> = Object.fromEntries(slugs.map((s) => [s, houseStats(defs[s])]));
const FILE = 'src/houses/stats.ts';
if (process.env.STATS_WRITE) writeFileSync(FILE, renderStatsModule(fresh));

describe('050: palette and numbers', () => {
  it('A1: src/houses/stats.ts matches the models, for every house (regenerating changes nothing)', () => {
    expect(readFileSync(FILE, 'utf8')).toBe(renderStatsModule(fresh));
    for (const h of HOUSES.filter((x) => x.status === 'live')) expect(fresh[h.slug], h.slug).toBeDefined();
  }, 300_000);

  it('A2: each palette has 1–5 colours adding to 100%, all the house\'s own outside colours', () => {
    for (const s of slugs) {
      const { palette } = fresh[s];
      expect(palette.length, s).toBeGreaterThanOrEqual(1); // the Sheats-Goldstein Residence: concrete and glass only
      expect(palette.length, s).toBeLessThanOrEqual(5);
      expect(palette.reduce((a, p) => a + p.share, 0), s).toBeCloseTo(1, 6);
      const outside = new Set(defs[s].build().builder.bricks
        .filter((b) => ['structure', 'envelope', 'roof'].includes(defs[s].phases[b.phase].role) && !['glass', 'light', 'lamp', 'water', 'falls'].includes(b.kind))
        .map((b) => b.color));
      for (const p of palette) expect(outside.has(p.color), `${s} ${p.color.toString(16)}`).toBe(true);
    }
  }, 300_000);

  it('A2: the figures are consistent: house pieces within all pieces, steps adding up, glass a share', () => {
    for (const s of slugs) {
      const st = fresh[s];
      expect(st.housePieces, s).toBeLessThanOrEqual(st.pieces);
      expect(st.steps.reduce((a, x) => a + x.pieces, 0), s).toBe(st.pieces);
      expect(st.steps.length, s).toBe(defs[s].phases.length);
      expect(st.glassShare, s).toBeGreaterThanOrEqual(0);
      expect(st.glassShare, s).toBeLessThan(1);
      expect(st.heightFt, s).toBeGreaterThan(8);
      expect(st.footprintFt2, s).toBeGreaterThan(300);
    }
  });
});

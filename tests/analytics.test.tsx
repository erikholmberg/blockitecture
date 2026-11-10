// @vitest-environment jsdom
// Spec: specs/052-vercel-analytics.md
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const inject = vi.fn();
vi.mock('@vercel/analytics', () => ({ inject }));
const read = (p: string) => readFileSync(p, 'utf8');

describe('052: Vercel Web Analytics', () => {
  it('A1: startAnalytics() injects once, however often it\'s called, in the build\'s mode', async () => {
    const { startAnalytics } = await import('../src/analytics');
    startAnalytics();
    startAnalytics();
    expect(inject).toHaveBeenCalledTimes(1);
    // vitest runs in development mode; a production build passes 'production'
    expect(inject.mock.calls[0][0]).toEqual({ mode: 'development' });
    expect(read('src/analytics.ts')).toMatch(/import\.meta\.env\.PROD \? 'production' : 'development'/);
  });

  it('A2: the home page, the credits page and the viewer start it; the dev-only page doesn\'t', () => {
    for (const f of ['src/home/main.tsx', 'src/credits/main.tsx', 'src/engine/viewer.ts']) expect(read(f), f).toMatch(/startAnalytics\(\)/);
    expect(read('src/dev/main.tsx')).not.toMatch(/analytics/i);
  });

  it('Q3: the credits page says how visits are counted', async () => {
    const { CreditsPage } = await import('../src/credits/CreditsPage');
    const { HOUSES } = await import('../src/houses');
    expect(renderToString(<CreditsPage houses={HOUSES} />)).toContain('Visits are counted with Vercel Web Analytics: no cookies, and nothing that identifies you.');
  });
});

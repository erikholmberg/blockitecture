// Spec: specs/010-eames-house.md (010a: multi-house engine)
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { PAGES } from '../vite.config';
import { HOUSES } from '../src/houses';

const files = (dir: string) =>
  readdirSync(dir, { recursive: true }).map(String).filter((f) => /\.(ts|tsx)$/.test(f)).map((f) => `${dir}/${f}`);

describe('010a: the engine is house-agnostic', () => {
  it('no file in src/engine imports from a house', () => {
    const offenders = files('src/engine').filter((f) => /from ['"](@\/houses\/|\.\.\/.*houses\/)[a-z]/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('every live house has a page whose entry starts the viewer with its definition', () => {
    for (const h of HOUSES.filter((x) => x.status === 'live')) {
      expect(Object.keys(PAGES)).toContain(h.slug);
      const html = readFileSync(`${h.slug}/index.html`, 'utf8');
      expect(html).toContain(`src="/src/houses/${h.slug}/main.ts"`);
      const main = readFileSync(`src/houses/${h.slug}/main.ts`, 'utf8');
      expect(main).toMatch(/startViewer\(/);
    }
  });
});

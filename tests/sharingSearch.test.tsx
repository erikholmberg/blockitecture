// @vitest-environment jsdom
// Spec: specs/053-sharing-and-search.md
import { describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { PAGES } from '../vite.config';
import { pageOfPath } from '../seo.plugin';
import { HomePage } from '../src/home/HomePage';
import { HOUSES, type House } from '../src/houses';
import * as seo from '../src/seo/seo';
import { creditsTree, homeTree, houseText, renderCredits, renderHome } from '../src/seo/render';

const pages = Object.keys(PAGES) as (keyof typeof PAGES)[];
const live = HOUSES.filter((h) => h.status === 'live');
const housePages = pages.filter((p) => p !== 'home' && p !== 'credits');

/** a page as the build emits it: its HTML file through the seo plugin's transform */
async function built(page: keyof typeof PAGES) {
  const html = readFileSync(PAGES[page], 'utf8');
  const rootHtml = page === 'home' ? renderHome() : page === 'credits' ? renderCredits() : undefined;
  const text = rootHtml === undefined ? await houseText(page) : undefined;
  return seo.transformPage(html, page, { rootHtml, text });
}
/** parsed without running any script, as a crawler that doesn't run JavaScript reads it */
const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const meta = (d: Document, key: string) =>
  d.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.getAttribute('content') ?? null;
const readable = (d: Document) => {
  const c = d.body.cloneNode(true) as HTMLElement;
  c.querySelectorAll('script, style').forEach((s) => s.remove());
  return c.textContent!.replace(/\s+/g, ' ');
};
const ld = (d: Document) => JSON.parse(d.querySelector('script[type="application/ld+json"]')!.textContent!);
const graph = (d: Document, type: string) => ld(d)['@graph'].find((n: { '@type': string }) => n['@type'] === type);

describe('spec 053: link previews, search engines and AI answers', () => {
  it('A1: every published page has a title, description, canonical URL, Open Graph tags and a large Twitter card', async () => {
    for (const page of pages) {
      const d = parse(await built(page));
      const url = seo.SITE_URL + seo.pagePath(page);
      expect(d.title, page).not.toBe('');
      expect(meta(d, 'description'), page).toBeTruthy();
      expect(d.querySelector('link[rel="canonical"]')?.getAttribute('href'), page).toBe(url);
      expect(meta(d, 'og:url'), page).toBe(url);
      expect(meta(d, 'og:title'), page).toBeTruthy();
      expect(meta(d, 'og:description'), page).toBeTruthy();
      expect(meta(d, 'og:type'), page).toBe('website');
      expect(meta(d, 'og:site_name'), page).toBe('Blockitecture');
      expect(meta(d, 'twitter:card'), page).toBe('summary_large_image');
      const img = meta(d, 'og:image')!;
      expect(img.startsWith(`${seo.SITE_URL}/`), page).toBe(true);
      expect(existsSync(`public${img.slice(seo.SITE_URL.length)}`), `${page}: ${img}`).toBe(true);
      expect(d.querySelectorAll('link[rel="canonical"]').length, page).toBe(1);
    }
  });

  it('A2: a house page previews with its thumbnail, title and description; home and credits with the home image', async () => {
    for (const page of pages) {
      const d = parse(await built(page));
      expect(meta(d, 'og:title'), page).toBe(d.title);
      expect(meta(d, 'og:description'), page).toBe(meta(d, 'description'));
      const house = HOUSES.find((h) => h.slug === page);
      expect(meta(d, 'og:image'), page).toBe(seo.SITE_URL + (house ? house.thumbnail : seo.OG_IMAGE.path));
    }
  });

  it('A3: the home page HTML lists every live house, linked, without running scripts', async () => {
    const d = parse(await built('home'));
    const text = readable(d);
    for (const h of HOUSES) {
      for (const s of [h.title, h.architect, String(h.year), h.location, h.blurb]) expect(text, `${h.slug}: ${s}`).toContain(s);
      const link = d.querySelector(`a[href="/${h.slug}/"]`);
      if (h.status === 'live') expect(link, h.slug).not.toBeNull();
      else expect(link, h.slug).toBeNull();
    }
  });

  it('A4: each house page HTML holds its name, architect, year, place, blurb and intro, without running scripts', async () => {
    for (const page of housePages) {
      const h = HOUSES.find((x) => x.slug === page)!;
      const text = (await houseText(page))!;
      const body = readable(parse(await built(page)));
      for (const s of [h.title, h.architect, String(h.year), h.location, h.blurb, text.intro[0], text.intro[1]]) {
        expect(body, `${page}: ${s}`).toContain(s);
      }
      expect(body, page).toContain(h.pieces!.toLocaleString('en-US'));
    }
  });

  it('A5: the credits page HTML holds its full text, without running scripts', async () => {
    const body = readable(parse(await built('credits')));
    expect(body).toContain('not affiliated with');
    for (const h of live) {
      expect(body).toContain(h.title);
      for (const s of h.sources ?? []) expect(body, h.slug).toContain(s);
      for (const a of h.affiliations ?? []) expect(body, h.slug).toContain(a);
    }
  });

  it('A6: the sitemap lists exactly the published pages; robots.txt lets every crawler in and names the sitemap', () => {
    const locs = [...seo.sitemap(pages).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.sort()).toEqual(pages.map((p) => seo.SITE_URL + seo.pagePath(p)).sort());
    const robots = seo.robots();
    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).not.toMatch(/Disallow/);
    expect(robots).toContain(`Sitemap: ${seo.SITE_URL}/sitemap.xml`);
  });

  it('A7: the structured data names the website and its houses, and each house page the real building', async () => {
    const home = parse(await built('home'));
    expect(graph(home, 'WebSite').url).toBe(`${seo.SITE_URL}/`);
    expect(graph(home, 'ItemList').itemListElement.map((i: { name: string }) => i.name)).toEqual(live.map((h) => h.title));
    for (const page of housePages) {
      const h = HOUSES.find((x) => x.slug === page)!;
      const about = graph(parse(await built(page)), 'WebPage').about;
      expect(about.name, page).toBe(h.title);
      expect(about.address, page).toBe(h.location);
      expect(about.description, page).toContain(h.architect);
      expect(about.description, page).toContain(String(h.year));
      if (h.wikidata) expect(about.sameAs, page).toBe(`https://www.wikidata.org/wiki/${h.wikidata}`);
    }
    // every live house has its Wikidata entry, except the Koshino House, which has none (2026-11-10)
    expect(live.filter((h) => !h.wikidata).map((h) => h.slug)).toEqual(['koshino-house']);
    expect(graph(parse(await built('credits')), 'WebPage').url).toBe(`${seo.SITE_URL}/credits/`);
  });

  it('A8: llms.txt describes the site and lists every live house with its architect, year and link', () => {
    const t = seo.llmsTxt();
    expect(t).toMatch(/^# Blockitecture\n\n> /);
    for (const h of live) expect(t).toContain(`- [${h.title}](${seo.SITE_URL}/${h.slug}/): ${h.architect}, ${h.year}`);
  });

  it('A9: a house added to the registry shows up everywhere with nothing else to edit', () => {
    const extra: House = { slug: 'test-house', title: 'Test House', architect: 'A. Architect', year: 1999, location: 'Somewhere',
      status: 'live', pieces: 10, thumbnail: '/test-house/thumbnail.jpg', blurb: 'A house for the test.' };
    const houses = [...HOUSES, extra];
    expect(seo.llmsTxt(houses)).toContain('[Test House](https://blockitecture.vercel.app/test-house/)');
    const list = (seo.jsonLd('home', 't', 'd', houses) as { '@graph': { itemListElement?: { name: string }[] }[] })['@graph'][1];
    expect(list.itemListElement!.map((i) => i.name)).toContain('Test House');
    expect(renderToString(<HomePage houses={houses} />)).toContain('A house for the test.');
    expect(seo.sitemap([...pages, 'test-house'])).toContain('<loc>https://blockitecture.vercel.app/test-house/</loc>');
    // and the sitemap's pages are the registry's live houses: PAGES has exactly them, with home and credits
    expect([...housePages].sort()).toEqual(live.map((h) => h.slug).sort());
  });

  it('A10: the home and credits pages hydrate from their HTML unchanged; a house page still starts the viewer', async () => {
    for (const [html, tree] of [[renderHome(), homeTree()], [renderCredits(), creditsTree()]] as const) {
      document.body.innerHTML = `<div id="root">${html}</div>`;
      const root = document.getElementById('root')!;
      const before = root.innerHTML;
      const errors: unknown[] = [];
      const consoleError = vi.spyOn(console, 'error').mockImplementation((...a) => { errors.push(a); });
      let r: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => { r = hydrateRoot(root, tree, { onRecoverableError: (e) => errors.push(e) }); });
      consoleError.mockRestore();
      expect(errors).toEqual([]);
      expect(root.innerHTML).toBe(before);
      act(() => r!.unmount());
    }
    for (const page of housePages) {
      const html = await built(page);
      expect(html, page).toContain('<div id="app"></div>');
      expect(html, page).toContain(`<script type="module" src="/src/houses/${page}/main.ts"></script>`);
      expect(html.indexOf('id="about-house"'), page).toBeLessThan(html.indexOf('<div id="app">'));
    }
  });

  it('A1: dev-only pages get noindex and nothing else; the plugin knows the published pages by their HTML path', () => {
    expect(pageOfPath('/index.html', pages)).toBe('home');
    expect(pageOfPath('/fallingwater/index.html', pages)).toBe('fallingwater');
    expect(pageOfPath('/credits/index.html', pages)).toBe('credits');
    expect(pageOfPath('/dev/shortlist/index.html', pages)).toBeNull();
    const out = seo.transformPage('<html><head><title>x</title></head><body></body></html>', null, {});
    expect(out).toContain('<meta name="robots" content="noindex" />');
    expect(out).not.toContain('og:');
  });
});

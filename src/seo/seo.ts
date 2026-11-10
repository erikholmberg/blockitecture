/**
 * Spec 053: link previews, search engines and AI answers. Pure (no DOM, no Node): every tag, the readable text, the sitemap,
 * robots.txt and llms.txt come from the house registry and each house's definition, so a new house gets them all.
 *
 * Relative imports only: vite.config.ts (the `seo` plugin) imports this, and the config can't resolve `@/`.
 */
import type { HouseDefinition } from '../engine/house';
import { HOUSES, type House } from '../houses/index';

/** the canonical origin (Q2: no custom domain; one place to change if there is one) */
export const SITE_URL = 'https://blockitecture.vercel.app';
export const SITE_NAME = 'Blockitecture';
export const AUTHOR = 'Erik Holmberg';
/** the home page's preview image, made by `npm run og-image` (Q6) */
export const OG_IMAGE = { path: '/og-image.jpg', width: 2400, height: 1260 };
/** house thumbnails (16:9) */
export const THUMB_SIZE = { width: 1200, height: 675 };

/** what the readable text of a house page needs from its definition */
export type HouseText = Pick<HouseDefinition['text'], 'name' | 'address' | 'eyebrow' | 'intro' | 'disclaimer'>;

/** a page's key in PAGES ('home', 'credits' or a house's slug) → its path */
export const pagePath = (page: string) => (page === 'home' ? '/' : `/${page}/`);
export const absolute = (path: string) => SITE_URL + path;
export const liveHouses = (houses: House[] = HOUSES) => houses.filter((h) => h.status === 'live');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wikidataUrl = (q: string) => `https://www.wikidata.org/wiki/${q}`;

export function readTitle(html: string) {
  return html.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim() ?? SITE_NAME;
}
export function readDescription(html: string) {
  return html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
}
const unesc = (s: string) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** the house a page shows, if it's a house page */
export const houseOf = (page: string, houses: House[] = HOUSES) => houses.find((h) => h.slug === page);

/** the structured data (schema.org) of a page */
export function jsonLd(page: string, title: string, description: string, houses: House[] = HOUSES): object {
  const website = { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: absolute('/'), name: SITE_NAME,
    description: HOME_DESCRIPTION(houses), author: { '@type': 'Person', name: AUTHOR } };
  const house = houseOf(page, houses);
  if (page === 'home') {
    return { '@context': 'https://schema.org', '@graph': [
      website,
      { '@type': 'ItemList', name: `Houses on ${SITE_NAME}`, itemListElement: liveHouses(houses).map((h, i) => (
        { '@type': 'ListItem', position: i + 1, url: absolute(pagePath(h.slug)), name: h.title })) },
    ] };
  }
  const webPage: Record<string, unknown> = { '@type': 'WebPage', '@id': absolute(pagePath(page)), url: absolute(pagePath(page)),
    name: title, description, isPartOf: { '@id': `${SITE_URL}/#website` } };
  if (house) {
    webPage.primaryImageOfPage = absolute(house.thumbnail!);
    webPage.about = {
      '@type': 'LandmarksOrHistoricalBuildings',
      name: house.title,
      ...(house.subtitle ? { alternateName: house.subtitle } : {}),
      description: `${house.title}, a house designed by ${house.architect} in ${house.year}, in ${house.location}.`,
      address: house.location,
      ...(house.wikidata ? { sameAs: wikidataUrl(house.wikidata) } : {}),
    };
  }
  return { '@context': 'https://schema.org', '@graph': [website, webPage] };
}

/** the tags each page's <head> gets: canonical, Open Graph, Twitter card and the structured data */
export function headTags(page: string, html: string, houses: House[] = HOUSES): string {
  const title = unesc(readTitle(html));
  const description = unesc(readDescription(html));
  const house = houseOf(page, houses);
  const url = absolute(pagePath(page));
  const img = house?.thumbnail
    ? { url: absolute(house.thumbnail), ...THUMB_SIZE, alt: `${house.title}, built from blocks` }
    : { url: absolute(OG_IMAGE.path), width: OG_IMAGE.width, height: OG_IMAGE.height, alt: `${SITE_NAME}: famous buildings, block by block` };
  const ld = JSON.stringify(jsonLd(page, title, description, houses)).replace(/</g, '\\u003c');
  return [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${img.url}" />`,
    `<meta property="og:image:width" content="${img.width}" />`,
    `<meta property="og:image:height" content="${img.height}" />`,
    `<meta property="og:image:alt" content="${esc(img.alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${ld}</script>`,
  ].join('\n    ');
}

/** a house page's text for crawlers and screen readers: the intro card's own words (Q1: visually hidden, not display:none) */
export function houseArticle(house: House, text: HouseText): string {
  const intro = `${text.intro[0]} ${(house.pieces ?? 0).toLocaleString('en-US')} ${text.intro[1]}`;
  const p = (s: string) => `<p>${esc(s)}</p>`;
  return [
    `<article id="about-house" style="position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">`,
    `<h1>${esc(house.title)}, block by block</h1>`,
    p(`${text.eyebrow}. ${house.location} (${text.address}).`),
    p(`Designed by ${house.architect}, ${house.year}.`),
    p(house.blurb),
    p(intro),
    p(`A 3D model built from blocks in your browser: watch it go up piece by piece, then fly around it or walk inside.`),
    ...(text.disclaimer ? [p(text.disclaimer)] : []),
    `<p><a href="/">All houses on ${SITE_NAME}</a> · <a href="/credits/">Credits</a></p>`,
    `</article>`,
  ].join('');
}

export const HOME_DESCRIPTION = (houses: House[] = HOUSES) =>
  `${liveHouses(houses).length} famous houses rebuilt from blocks in your browser, from Frank Lloyd Wright to Tadao Ando, each on ` +
  `its real site under the real sun. Watch one go up piece by piece, then walk around it in 3D.`;

/** every published page (the keys of PAGES) → sitemap.xml */
export function sitemap(pages: string[]): string {
  const urls = pages.map((p) => `  <url><loc>${absolute(pagePath(p))}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** robots.txt: every crawler in, AI crawlers included (Q3) */
export function robots(): string {
  return `# Every crawler is welcome, AI crawlers included (spec 053).\nUser-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`;
}

/** llms.txt (llmstxt.org): a short guide to the site for AI tools (Q4) */
export function llmsTxt(houses: House[] = HOUSES): string {
  const list = liveHouses(houses)
    .map((h) => `- [${h.title}](${absolute(pagePath(h.slug))}): ${h.architect}, ${h.year}, ${h.location}. ${h.blurb}`)
    .join('\n');
  return `# ${SITE_NAME}

> ${HOME_DESCRIPTION(houses)}

Each house is a 3D model made of blocks (1 block = 1 ft), placed on its real site from OpenStreetMap and terrain data and lit by the
real sun for its location. The model builds in order (foundation, frame, interior, walls, roof, landscape); visitors can pause
it, switch between famous views, and walk inside in first person. A fan tribute by ${AUTHOR}, not affiliated with the houses,
their owners or the architects' foundations.

## Houses

${list}

## About

- [All houses](${absolute('/')}): the home page, with every house.
- [Credits](${absolute('/credits/')}): what each model was built from, and the organisations it isn't affiliated with.
`;
}

/** dev-only pages: kept out of search engines */
export const NOINDEX = `<meta name="robots" content="noindex" />`;

/**
 * A page's HTML with everything spec 053 adds: the head tags, and the readable content (the home and credits pages rendered
 * to HTML, which React then hydrates; a house page's hidden article). `page` is its key in PAGES, or null for a dev page.
 */
export function transformPage(html: string, page: string | null, add: { rootHtml?: string; text?: HouseText; houses?: House[] }): string {
  const houses = add.houses ?? HOUSES;
  if (page === null) return html.includes('name="robots"') ? html : html.replace('</head>', `  ${NOINDEX}\n  </head>`);
  let out = html.replace('</head>', `  ${headTags(page, html, houses)}\n  </head>`);
  if (add.rootHtml !== undefined) out = out.replace('<div id="root"></div>', `<div id="root">${add.rootHtml}</div>`);
  const house = houseOf(page, houses);
  if (house && add.text) out = out.replace('<div id="app"></div>', `${houseArticle(house, add.text)}\n    <div id="app"></div>`);
  return out;
}

#!/usr/bin/env node
/**
 * Spec 053 (Q6): renders the home page's link-preview image, public/og-image.jpg (1200 × 630 at 2×), from the running dev server:
 * the logo, the headline, a line about the site and six of the houses' thumbnails with their palette strips.
 * Dev tooling. Needs `npm run dev` running. Remake it when houses are added (the count comes from the registry).
 *
 *   npm run og-image -- [--base http://localhost:5173] [--out public/og-image.jpg]
 */
import path from 'node:path';
import { chromium } from 'playwright';

const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : def; };
const BASE = arg('base', 'http://localhost:5173');
const OUT = path.resolve(arg('out', 'public/og-image.jpg'));
const HOUSES = ['fallingwater', 'stahl-house', 'rietveld-schroder-house', 'casa-luis-barragan', 'farnsworth-house', 'douglas-house'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await page.goto(`${BASE}/`);
await page.waitForLoadState('networkidle');
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async (houses) => {
  const { STATS } = await import('/src/houses/stats.ts');
  const { HOUSES: ALL } = await import('/src/houses/index.ts');
  const count = ALL.filter((h) => h.status === 'live').length;
  const hex = (c) => `#${c.toString(16).padStart(6, '0')}`;
  const strip = (slug) => `<div class="p">${STATS[slug].palette.map((c) => `<span style="flex:${c.share};background:${hex(c.color)}"></span>`).join('')}</div>`;
  const tiles = houses.map((h) => `<div class="t"><img src="/${h}/thumbnail.jpg">${strip(h)}</div>`).join('');
  document.head.insertAdjacentHTML('beforeend', `<style>
    body { margin: 0 !important; overflow: hidden; }
    #og { position: fixed; inset: 0; z-index: 99999; background: #f5f2ea; display: flex; font-family: 'Inter Variable', sans-serif; color: #1d1f22; }
    #og .l { width: 470px; padding: 0 44px 0 56px; display: flex; flex-direction: column; justify-content: center; }
    #og .logo { font-family: 'Quantico', sans-serif; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; font-size: 26px; }
    #og .big { margin-top: 22px; font-size: 42px; font-weight: 700; line-height: 1.05; letter-spacing: -.035em; }
    #og .sub { margin-top: 20px; font-size: 19px; line-height: 1.4; color: #5b5d60; }
    #og .url { margin-top: 30px; font-size: 24px; font-weight: 700; color: #e07a1f; }
    #og .g { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, 1fr); gap: 6px; padding: 6px 6px 6px 0; }
    #og .t { overflow: hidden; border-radius: 6px; display: flex; flex-direction: column; background: #ddd; }
    #og .t img { flex: 1; min-height: 0; width: 100%; object-fit: cover; }
    #og .p { display: flex; height: 8px; }
  </style>`);
  document.body.insertAdjacentHTML('beforeend', `<div id="og"><div class="l"><div class="logo">Blockitecture</div>
    <div class="big">Famous buildings, block by block</div>
    <div class="sub">${count} houses, from Frank Lloyd Wright to Tadao Ando, each on its real site under the real sun. Watch it build, then walk inside.</div>
    <div class="url">blockitecture.vercel.app</div></div><div class="g">${tiles}</div></div>`);
  await Promise.all([...document.querySelectorAll('#og img')].map((i) => i.decode()));
}, HOUSES);
await page.screenshot({ path: OUT, type: 'jpeg', quality: 88 });
await browser.close();
console.log(`→ ${OUT}`);

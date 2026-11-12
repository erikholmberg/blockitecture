// Spec 066: the pictures on /dev/design/, one per scene and finish, from the running dev server (npm run dev).
// usage: node scripts/design-shots.mjs [finish…]   (no arguments: every finish)
// Needs a real GPU window, so Chromium opens visibly.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');
const scenes = [...src('dev/design/scenes.ts').matchAll(/key: '([^']+)', slug: '([^']+)'[\s\S]*?cam: '([^']*)'/g)]
  .map(([, key, slug, cam]) => ({ key, slug, cam }));
const all = [...src('engine/finish.ts').matchAll(/^  '?([a-z-]+)'?: (?:GLOSS|\{)/gm)].map((m) => m[1]);
const finishes = process.argv.length > 2 ? process.argv.slice(2) : all;

const browser = await chromium.launch({ headless: false, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] });
for (const s of scenes) for (const f of finishes) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:5173/${s.slug}/?${s.cam ? `cam=${s.cam}&` : ''}clean&dpr=1&finish=${f}`);
  await page.waitForFunction(() => document.querySelector('canvas') && !document.getElementById('loading'), null, { timeout: 180_000 });
  await page.waitForTimeout(7000);
  const out = new URL(`../src/dev/design/${s.key}-${f}.jpg`, import.meta.url).pathname;
  await page.screenshot({ path: out, type: 'jpeg', quality: 86 });
  await page.close();
  console.log(out);
}
await browser.close();

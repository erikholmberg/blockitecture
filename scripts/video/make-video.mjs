#!/usr/bin/env node
/**
 * Renders the LinkedIn video (scripts/video/storyboard.mjs) from the running site, frame by frame, and encodes it with ffmpeg.
 * Dev tooling: the site itself is unchanged. Needs `npm run dev` running and ffmpeg on the PATH.
 *
 *   npm run video -- [--base http://localhost:5173] [--out video/blockitecture-linkedin.mp4] [--frames <dir>]
 *
 * Each frame sets the build's time and the camera through the viewer's debug API (?debug: window.__viewer), with the HUD
 * hidden, so every frame is exact however slow it is to render.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { FPS, SHOTS, SITE, SIZE } from './storyboard.mjs';

const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : def; };
const BASE = arg('base', 'http://localhost:5173');
const OUT = path.resolve(arg('out', 'video/blockitecture-linkedin.mp4')); // video/ is git-ignored
mkdirSync(path.dirname(OUT), { recursive: true });
const FRAMES = arg('frames') ? path.resolve(arg('frames')) : mkdtempSync(path.join(tmpdir(), 'blockitecture-frames-'));
mkdirSync(FRAMES, { recursive: true });

const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

/** the overlay: captions, lower thirds and the cards, drawn in the page's own fonts so they're in the screenshot */
const OVERLAY_CSS = `
  .hud-root, .fps { display: none !important; }
  #vid { position: fixed; inset: 0; pointer-events: none; z-index: 1000; font-family: 'Inter Variable', ui-sans-serif, system-ui, sans-serif; color: #1d1f22; }
  #vid .cap { position: absolute; left: 60px; right: 60px; top: 70px; font-size: 54px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em;
    color: #fff; text-shadow: 0 2px 18px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.6); }
  #vid .lt { position: absolute; left: 48px; bottom: 64px; background: rgba(250,248,243,.94); border-radius: 18px; padding: 22px 30px; box-shadow: 0 6px 30px rgba(0,0,0,.18); }
  #vid .lt b { display: block; font-size: 44px; letter-spacing: -0.02em; }
  #vid .lt span { display: block; margin-top: 6px; font-size: 28px; color: #5b5d60; }
  #vid .card { position: absolute; inset: 0; background: #f5f2ea; display: flex; flex-direction: column; justify-content: center; padding: 0 90px; }
  #vid .logo { font-family: 'Quantico', sans-serif; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; font-size: 40px; }
  #vid .big { margin-top: 36px; font-size: 92px; font-weight: 700; line-height: 1.02; letter-spacing: -0.035em; white-space: pre-line; }
  #vid .sub { margin-top: 36px; font-size: 38px; color: #5b5d60; line-height: 1.3; }
  #vid .url { margin-top: 60px; font-size: 50px; font-weight: 700; color: #e07a1f; }
  #vid .band { position: absolute; left: 0; right: 0; top: 0; padding: 70px 70px 60px; background: linear-gradient(#f5f2eaf2 70%, #f5f2ea00); }
`;

async function prepare(page) {
  await page.addStyleTag({ content: OVERLAY_CSS });
  await page.evaluate(() => { const d = document.createElement('div'); d.id = 'vid'; document.body.appendChild(d); });
}
const setOverlay = (page, html) => page.evaluate((h) => { document.getElementById('vid').innerHTML = h; }, html);
const frame = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

/** open a house page with the debug API, start it (lifting the intro's dimming), pause, and stop the auto-rotate */
async function openHouse(page, slug, light) {
  await page.goto(`${BASE}/${slug}/?debug&dpr=1&date=2026-06-21${light ? `&light=${light}` : ''}`);
  await page.waitForFunction(() => window.__viewer, null, { timeout: 120_000 });
  await prepare(page);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Start building/.test(b.textContent)).click());
  await page.waitForTimeout(300);
  await page.keyboard.press('KeyP'); // pause: the script drives the time
  return page.evaluate(() => {
    const v = window.__viewer; v.orbit.autoRotate = false;
    return { total: v.schedule.total, name: v.house.text.name, eyebrow: v.house.text.eyebrow, views: v.house.views };
  });
}

/** the camera of a shot: a named view or the ?cam= values, pulled back from its target by `pull` */
function baseCamera(camera, views, pull = 1) {
  let p, t;
  if (Array.isArray(camera)) { p = camera.slice(0, 3); t = camera.slice(3); }
  else { const v = views[camera.view].view; p = [v.pos.x, v.pos.y, v.pos.z]; t = [v.target.x, v.target.y, v.target.z]; }
  return { pos: p.map((c, i) => t[i] + (c - t[i]) * pull), target: t };
}
const place = (page, pos, target, t) => page.evaluate(([pos, target, t]) => {
  const v = window.__viewer;
  if (t !== null) v.seek(t);
  v.camera.position.set(...pos); v.orbit.target.set(...target); v.camera.lookAt(...target); v.orbit.update();
}, [pos, target, t]);

let n = 0;
const snap = (page) => page.screenshot({ path: path.join(FRAMES, `${String(n++).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95 });

const browser = await chromium.launch({ headless: false, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] });
const page = await browser.newPage({ viewport: SIZE, deviceScaleFactor: 1 });
let poster = 0;

for (const shot of SHOTS) {
  const count = Math.round(shot.seconds * FPS);
  console.log(`${shot.kind} ${shot.slug ?? ''} ${count} frames`);
  if (shot.kind === 'home' || shot.kind === 'end') {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    await prepare(page);
    await page.evaluate(() => document.fonts.ready);
    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let f = 0; f < count; f++) {
      const x = f / Math.max(1, count - 1);
      if (shot.kind === 'home') {
        await page.evaluate((y) => window.scrollTo(0, y), 420 + ease(x) * Math.min(700, maxScroll - 420));
        await setOverlay(page, `<div class="band"><div class="logo">Blockitecture</div><div class="big" style="font-size:78px">${shot.title}</div></div>`);
      } else {
        await setOverlay(page, `<div class="card"><div class="logo">Blockitecture</div><div class="big">14 famous buildings,\nblock by block</div>
          <div class="sub">From Frank Lloyd Wright to Tadao Ando, each on its real site, under the real sun. Watch it build, then walk inside.</div>
          <div class="url">${SITE}</div><div class="sub" style="margin-top:18px;font-size:30px">Built by Erik Holmberg</div></div>`);
      }
      await frame(page);
      await snap(page);
    }
    continue;
  }

  const info = await openHouse(page, shot.slug, shot.light);
  // the eyebrow is 'Name · Architect · Year'; its first part can be a nickname (Case Study House #22), so the house's own name
  const [, architect, year] = info.eyebrow.split(' · ');
  const name = info.name;
  const overlay = shot.caption ? `<div class="cap">${shot.caption}</div>`
    : shot.lowerThird ? `<div class="lt"><b>${name}</b><span>${architect} · ${year}</span></div>` : '';
  await setOverlay(page, overlay);

  if (shot.kind === 'walk') {
    for (let f = 0; f < count; f++) {
      const x = ease(f / Math.max(1, count - 1));
      const pos = shot.from.map((a, i) => a + (shot.to[i] - a) * x);
      await place(page, pos, shot.look, info.total);
      await frame(page);
      await snap(page);
    }
    continue;
  }

  const { pos, target } = baseCamera(shot.camera, info.views, shot.pull);
  for (let f = 0; f < count; f++) {
    const x = f / Math.max(1, count - 1);
    let p = pos;
    if (shot.kind === 'build') {
      // the camera swings round the house as it goes up
      const a = ((shot.orbitDeg * Math.PI) / 180) * (ease(x) - 0.5);
      const dx = pos[0] - target[0], dz = pos[2] - target[2];
      p = [target[0] + dx * Math.cos(a) - dz * Math.sin(a), pos[1], target[2] + dx * Math.sin(a) + dz * Math.cos(a)];
    } else if (shot.push) {
      p = pos.map((c, i) => c + (target[i] - c) * shot.push * x);
    }
    const t = shot.kind === 'build' ? Math.min(info.total, x * info.total * 1.04) : info.total;
    await place(page, p, target, t);
    await frame(page);
    if (shot.kind === 'build' && f === Math.round(count * 0.98)) poster = n;
    await snap(page);
  }
}
await browser.close();

const total = n / FPS;
console.log(`${n} frames (${total.toFixed(1)} s) → ${OUT}`);
execFileSync('ffmpeg', [
  '-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(FRAMES, '%05d.jpg'),
  // the JPEG frames are full-range: converted to the standard (TV) range LinkedIn and most players expect
  '-vf', `fade=t=in:st=0:d=0.3:color=white,fade=t=out:st=${(total - 0.3).toFixed(2)}:d=0.3:color=white,scale=in_range=full:out_range=tv,format=yuv420p`,
  '-color_range', 'tv',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-r', String(FPS), '-movflags', '+faststart', OUT,
], { stdio: 'inherit' });
const posterOut = OUT.replace(/\.mp4$/, '-poster.jpg');
execFileSync('cp', [path.join(FRAMES, `${String(poster).padStart(5, '0')}.jpg`), posterOut]);
console.log(`poster → ${posterOut}`);
if (!arg('frames')) rmSync(FRAMES, { recursive: true, force: true });

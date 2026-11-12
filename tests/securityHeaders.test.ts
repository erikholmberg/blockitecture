// Spec: specs/071-security-headers-and-dpr-limit.md
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PAGES } from '../vite.config';
import { pinnedDpr } from '../src/engine/resolution';

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
  trailingSlash?: boolean;
  headers?: { source: string; headers: { key: string; value: string }[] }[];
};
const rule = vercel.headers?.[0];
const header = (key: string) => rule?.headers.find((h) => h.key === key)?.value;
const csp = () => Object.fromEntries(
  (header('Content-Security-Policy') ?? '').split(';').map((d) => d.trim()).filter(Boolean)
    .map((d) => { const [name, ...values] = d.split(/\s+/); return [name, values.join(' ')]; }),
);

describe('spec 071: security headers', () => {
  it('A1: vercel.json sends the five headers on every path, and keeps trailingSlash', () => {
    expect(vercel.trailingSlash).toBe(true);
    expect(vercel.headers).toHaveLength(1);
    expect(rule!.source).toBe('/(.*)');
    expect(rule!.headers.map((h) => h.key).sort()).toEqual(
      ['Content-Security-Policy', 'Permissions-Policy', 'Referrer-Policy', 'X-Content-Type-Options', 'X-Frame-Options']);
    expect(header('X-Content-Type-Options')).toBe('nosniff');
    expect(header('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    expect(header('X-Frame-Options')).toBe('DENY');
  });

  it("A2: the policy is exactly the spec's; scripts are the site's own files only, and no site may frame it", () => {
    expect(csp()).toEqual({
      'default-src': "'self'",
      'script-src': "'self'",
      'style-src': "'self' 'unsafe-inline'",
      'img-src': "'self' data: blob:",
      'font-src': "'self'",
      'connect-src': "'self'",
      'worker-src': "'self'",
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'",
      'frame-ancestors': "'none'",
    });
  });

  it('A3: no published page has an inline script that runs, or an inline event handler', () => {
    for (const [page, file] of Object.entries(PAGES)) {
      const html = readFileSync(file, 'utf8');
      for (const [tag] of html.matchAll(/<script\b[^>]*>/g)) {
        expect(/\ssrc=/.test(tag) || tag.includes('type="application/ld+json"'), `${page}: ${tag}`).toBe(true);
      }
      expect(html, page).not.toMatch(/<[^>]+\son[a-z]+\s*=/i);
    }
  });
});

describe('spec 071: ?dpr= is limited', () => {
  it('A4: pinnedDpr keeps a value from 0.5 to 3, pulls others to the nearest end, and ignores what is not a number', () => {
    expect(pinnedDpr('1.75')).toBe(1.75);
    expect(pinnedDpr('50')).toBe(3);
    expect(pinnedDpr('0.1')).toBe(0.5);
    expect(pinnedDpr('-2')).toBe(0.5);
    for (const v of [null, '', 'abc', '0', 'Infinity', 'NaN']) expect(pinnedDpr(v), String(v)).toBe(0);
  });
});

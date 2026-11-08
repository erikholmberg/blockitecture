# 008 — Quantico wordmark and "B" favicon

- **Status:** Done (approved by Erik 2026-11-08: "use quantico as the logo font, bold all caps and remove the orange brick,
  for the favicon use the quantico b black on an orange background"; fully specified, no open questions)
- **Owner:** Erik
- **Created:** 2026-11-08
- **Commits:** 1a2727c

## Goal
Give the site a typographic logo: the wordmark in **Quantico Bold, all caps**, without the orange brick icon. The favicon becomes
Quantico's **bold "B" in black on the brand orange** (`#e8892c`).

## Design
- Quantico is self-hosted via `@fontsource/quantico` (OFL-1.1), bold Latin subset only, exposed as Tailwind's `font-logo`.
  Body text stays Inter.
- Browsers don't load web fonts inside favicons, so the "B" is Quantico's actual glyph outline converted to an SVG path
  (opentype.js, one-off), not `<text>`. `public/favicon.svg` is a 32 × 32 orange rounded square with the black B, cap height 20 px, centered.
  Both pages link it. A PNG `apple-touch-icon` (180 × 180) covers iOS home screens.

## Acceptance criteria
- **A1** [unit] Home page: the wordmark reads "Blockitecture", uses `font-logo` (Quantico), bold and uppercase, and the brick SVG is gone.
- **A2** [unit] `public/favicon.svg` exists, is a path (no `<text>`), and has an `#e8892c` background with a `#000` glyph.
  Both `index.html` and `stahl-house/index.html` link `/favicon.svg` (no inline data-URL brick icons left), plus the apple-touch-icon.
- **A3** [unit] Still no font CDN (003-A6 / 007-A4).
- **A4** [manual] In Chrome, the home page wordmark renders in Quantico (the font is loaded, not a fallback), and the tab shows the orange "B" favicon on both pages.

## Out of scope
The viewer's title block (no wordmark there), headings, and body type.

## Implementation notes
- `@fontsource/quantico` (OFL-1.1); `globals.css` imports only `latin-700.css` and defines `--font-logo`. Tailwind's `font-logo`.
- Home wordmark: `<div data-logo class="font-logo text-xl font-bold tracking-wide uppercase">Blockitecture</div>`. The brick SVG is removed.
- Favicon: the "B" glyph outline was extracted from `quantico-latin-700-normal.woff` with opentype.js (one-off, in a scratch folder,
  not a project dependency), scaled to a 20 px cap height and centered in 32 × 32 → `public/favicon.svg` (orange rounded square, rx 6).
  `public/apple-touch-icon.png` (180 × 180) is a full-bleed square without rounding, because iOS masks icons itself and fills transparent corners
  with black. It was rendered from the same SVG with macOS `qlmanage`.
- Both pages: `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` and the apple-touch-icon, replacing the inline data-URL brick.
- **Results:**
  - A1–A3: `tests/brand.test.tsx` (4 tests) and the existing no-font-CDN test. 71 tests total.
  - A4 pass: in Chrome the wordmark's computed font is Quantico 700, uppercase, and `document.fonts` reports Quantico 700 loaded.
    `/favicon.svg` (`image/svg+xml`) and `/apple-touch-icon.png` (`image/png`) both return 200 from both pages, and the rendered PNG
    shows the black Quantico B on orange. (Chrome's tab strip itself can't be captured by the screenshot tool.)

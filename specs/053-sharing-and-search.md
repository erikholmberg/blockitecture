# 053 — Link previews, search engines and AI answers

- **Status:** In progress (approved by Erik 2026-11-10: "build it, no custom domain": all recommendations)
- **Owner:** Erik
- **Created:** 2026-11-10
- **Commits:** <!-- filled in when Done -->

## Goal
Erik asked (2026-11-10) for link previews when the site is shared, and for the site to be easy to find in search engines (SEO) and
in AI answer engines such as ChatGPT, Claude, Perplexity and Google's AI Overviews (AEO).

Today:
- **No link previews.** No page has Open Graph tags, so a link pasted into LinkedIn, Slack or iMessage shows no picture. LinkedIn
  couldn't load a preview of the site for Erik's Featured section.
- **Almost no readable text.** Every page is drawn by JavaScript. A crawler that doesn't run it sees only the title and the
  description: no list of houses on the home page, nothing about a house on its page. Google runs JavaScript, if slowly. Most AI
  crawlers (GPTBot, ClaudeBot, PerplexityBot) don't.
- **No sitemap or robots.txt,** no canonical addresses, and no structured data to say what a page is about.

## Behavior
**Shared links** (LinkedIn, Slack, iMessage, X, Facebook, WhatsApp…)
- **The home page** shows a card with the Featured image (the logo, "Famous buildings, block by block", six houses), the site's
  title and its description.
- **Each house page** shows its own card: the house's thumbnail, a title like "Fallingwater, block by block: Frank Lloyd Wright's
  house over Bear Run" (the page's current title), and its description.
- **The credits page** shows the home page's image with its own title and description.

**Search engines and AI crawlers** get, without running any JavaScript:
- **On the home page:** the list of houses, each with its name, architect, year, place and one-line blurb, linked to its page.
  This is the same text the cards show.
- **On a house page:** the house's name, architect, year and place, its blurb and its intro paragraph. A JavaScript-free reader
  also learns what the page is: a 3D model built from blocks, watched as it goes up and explored in the browser. The canvas can't
  be read, so this text is also what a screen reader gets (Q1).
- **On the credits page:** its full text.
- **A sitemap** listing every published page, and a **robots.txt** that points to it and lets all crawlers in, AI crawlers
  included (Q3).
- **Structured data** (schema.org, in JSON-LD) saying:
  - the home page is a website listing these buildings;
  - each house page is about a real building, with its architect, year and place, and a link to its Wikidata entry, so search
    engines and AI models can tie the page to the building they already know.
- **A canonical address** on every page (`https://blockitecture.vercel.app/<slug>/`, Q2), so `?debug`, `?view=` and shared links
  with settings all count as one page.
- **An `llms.txt`** at the site's root (Q4): a short plain-text guide to the site for AI tools, listing each house with its link.

**Visitors see nothing new.** The pages look and behave as they do today; the 3D viewer is unchanged. The dev-only pages stay out
of the sitemap and get `noindex`.

**Kept in step:** every tag, the sitemap, `llms.txt` and the readable text come from the house registry (`src/houses/index.ts`)
and each house's definition, so a new house gets them all without extra work, and none can drift from what the cards say.

## Acceptance criteria
- **A1** [unit] Every published page's HTML (from `npm run build`) has a title, a description, a canonical URL, `og:title`,
  `og:description`, `og:image` (an absolute URL to a file that exists in the build), `og:url`, `og:type`, `og:site_name` and
  `twitter:card` = `summary_large_image`.
- **A2** [unit] Each house page's `og:image` is its thumbnail, and its `og:title` and description match its page title and
  description. The home page and the credits page use the home page's image.
- **A3** [unit] The built home page's HTML, read without running any script, contains every live house's name, architect, year,
  place and blurb, each linked to its page. Coming-soon houses are listed as coming soon, without links.
- **A4** [unit] Each built house page's HTML, without scripts, contains the house's name, architect, year, place, blurb and
  intro.
- **A5** [unit] The built credits page's HTML, without scripts, contains its full text, each house's sources and its "not
  affiliated with" line.
- **A6** [unit] `sitemap.xml` lists exactly the published pages, with their canonical URLs. `robots.txt` allows all crawlers and
  names the sitemap.
- **A7** [unit] Each page's JSON-LD parses and names the right things: a `WebSite` with the live houses on the home page; on each
  house page, a page about a building with its name, architect, year, place, and `sameAs` its Wikidata entry. Every live house
  has a Wikidata ID, except the Koshino House, which has no entry on Wikidata (or English Wikipedia) as of 2026-11-10.
- **A8** [unit] `llms.txt` describes the site in a few lines and lists every live house with its architect, year and link.
- **A9** [unit] Adding a house to the registry adds it to the sitemap, `llms.txt`, the home page's readable list and the JSON-LD,
  with nothing else to edit (checked by comparing each to the registry).
- **A10** [unit] The home page and the credits page show the same thing to visitors as before (their React content renders
  unchanged, now from the page's HTML), and a house page still starts the viewer as before (existing tests still pass).
- **A11** [manual] After deploying: LinkedIn's Post Inspector shows the home page's card with the image, title and description,
  and a house page's card with its thumbnail. A link pasted into Slack or iMessage shows a card.
- **A12** [manual] After deploying: Google's Rich Results Test reads each page type's structured data without errors, and
  fetching a house page with JavaScript off shows its text.
- **A13** [manual] In `npm run dev` and the built site: no visible change to the home page, the credits page or a house page,
  on a wide screen and a phone.

## Out of scope
- **Registering the site** with Google Search Console and Bing Webmaster Tools (Bing feeds ChatGPT's and Copilot's search).
  Both need Erik's account and a proof of ownership. Steps are in Q5.
- **A custom domain.** Everything uses `blockitecture.vercel.app` until there is one (Q2).
- **New text** about each house beyond what the cards and intro cards already say. Longer write-ups (history, sources, facts)
  would help AI answers most, but each is a writing task per house: a later spec if wanted.
- **Changing page titles or descriptions.** They're already written per house and stay as they are.
- **Paid promotion,** backlinks, or posting anywhere.

## Open questions
- [x] **Q1: The house page's readable text: where it sits.** The viewer covers the whole screen, so the text can't be seen next
      to it. *Recommended:* put it in the page's HTML as a short "About this house" section that's visually hidden but read by
      screen readers. It's the same text as the intro card, so it's honest to search engines, and it gives screen readers what
      the canvas can't. The alternative is a `<noscript>` block, which search engines mostly ignore and screen readers never
      reach.
- [x] **Q2: Which address is canonical.** *Recommended: `https://blockitecture.vercel.app`* for now, set in one place, so a
      custom domain later is a one-line change plus a redirect. **Resolved: no custom domain** (Erik, 2026-11-10).
- [x] **Q3: Let AI crawlers in?** *Recommended: yes, all of them* (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…). Being
      found in AI answers is the point of AEO, and the site has nothing to protect. The alternative is to block crawlers that
      train models but allow the ones that only search, which is fiddly and changes often.
- [x] **Q4: `llms.txt`.** A proposed standard, not yet widely read by AI tools. *Recommended: yes,* since it's small and
      generated from the registry, so it costs nothing to keep.
- [x] **Q5: Search Console and Bing.** *Recommended: after this ships,* Erik signs in to Google Search Console and Bing Webmaster
      Tools, verifies the site (Google gives a meta tag or a file to add; Bing can import from Google), and submits the sitemap. I
      can add the verification tag in its own small commit when you have it, and walk through the rest in Chrome with your
      go-ahead.
- [x] **Q6: The home page's image.** *Recommended:* the Featured image, made at 1200 × 630 (LinkedIn's and Facebook's size) and
      saved as `public/og-image.png`. The script that makes it goes in `scripts/og-image/` as `npm run og-image`, like the video
      tool, so it can be remade when houses are added. House thumbnails are 1200 × 675, close enough: previews crop them slightly
      at the top and bottom.

## Implementation notes
- **Files:**
  - `src/seo/seo.ts` (pure): the head tags, JSON-LD, a house page's hidden article, the sitemap, robots.txt and llms.txt.
    `SITE_URL` is the one place the address lives (Q2).
  - `src/seo/render.tsx`: the home and credits pages rendered with `renderToString`, and each house's text from its definition
    (`import.meta.glob`, loaded only when asked).
  - `seo.plugin.ts` (in `vite.config.ts`'s plugins): `transformIndexHtml` adds all of it to each page, in dev and the build. It
    loads `render.tsx` through Vite's SSR loader (the dev server's own; a short-lived one in the build). The build emits
    `sitemap.xml`, `robots.txt` and `llms.txt`; in dev, a middleware serves them.
  - `src/home/main.tsx` and `src/credits/main.tsx` use `hydrateRoot` in place of `createRoot`.
  - `wikidata` on each house in `src/houses/index.ts`.
  - `public/og-image.jpg` (2400 × 1260, 1200 × 630 at 2×), made by `scripts/og-image/make-og-image.mjs` (`npm run og-image`).
- **Wikidata:**
  - IDs from each house's `scripts/houses/<slug>.mjs`, checked by label on Wikidata.
  - Looked up: the Ennis House (Q578184) and the Rose Seidler House (Q7367931).
  - The Koshino House has no entry on Wikidata or English Wikipedia, so its page has no `sameAs`. A7 says so.
- **The house page's text** (Q1): an `<article id="about-house">` before `#app`, visually hidden with the usual clip pattern (not
  `display: none`, which screen readers skip). Its `<h1>` is "<House>, block by block". The intro card's `<h2>` stays as it is.
- **Dev pages** get `noindex` unless they already have a robots tag (the shortlist does).
- **In dev,** the plugin's own code (`src/seo/seo.ts`) is loaded with the config, so an edit to it needs a dev-server restart.
  `render.tsx` and the pages reload as usual.
- **Mostly tests-first, not fully:** `src/seo/seo.ts` was written just before `tests/sharingSearch.test.tsx`, which was then
  run against it. Two failures were fixed: the preview image didn't exist yet, and A10's check compared strings where the DOM
  serializes `>` differently.
- **Tests:** `tests/sharingSearch.test.tsx` covers A1–A10. `npm run check`: 372 tests pass.
- **The build** (`vite build`) emits `sitemap.xml`, `robots.txt`, `llms.txt` and `og-image.jpg`. The home and credits pages'
  HTML holds their content; every page has its tags.
- **A13** (Chrome, `npm run dev`, wide screen):
  - Pass: the home page, the credits page and Fallingwater's page look as before.
  - Pass: React took over the home page (hydrated), and no hydration errors or other console errors appeared on the home and
    credits pages.
  - Phone size not checked in the browser: the window wouldn't resize. A10 shows the markup is the same before and after
    hydration, so the phone layout is the same as before.
- **A11, A12:** after deploying.

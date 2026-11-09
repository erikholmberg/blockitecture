# 021 — A credits page

- **Status:** Done (approved by Erik 2026-11-09: Q1 yes, Q2 yes)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
All the "not affiliated with…" information moves to its own page, `/credits/`, linked from the home page footer. The footer stays
short however many houses there are, and each house's disclaimers and sources sit in one place that stays right as houses are added.

## Today
The home page footer is hard-coded in `src/home/HomePage.tsx`:

> Fan tributes in a generic toy-block style, not affiliated with the LEGO Group, or with the Eames Office, the Eames Foundation,
> Herman Miller or Vitra. Neighborhoods © OpenStreetMap contributors; terrain from Mapzen / AWS Terrain Tiles.

Since specs 017 and 019 it leaves out the organisations of two live houses: Fallingwater's (the Western Pennsylvania Conservancy and
the Frank Lloyd Wright Foundation) and the Schröder House's (the Centraal Museum, the Rietveld Schröderhuis and Cassina).

## Behavior
**The home page footer** becomes:

> Fan tributes in a generic toy-block style. **Credits & disclaimers** · Neighborhoods © OpenStreetMap contributors; terrain from
> Mapzen / AWS Terrain Tiles.

"Credits & disclaimers" links to `/credits/`. The map credit stays (Q1).

**The credits page** (`/credits/`), in the site's style (header, Inter, shadcn), has:
- **The toy blocks:** fan tributes in a generic toy-block style, not affiliated with the LEGO Group.
- **The houses:** one section per live house, in registry order. Each has the house's name, architect and year, what it isn't
  affiliated with (e.g. "Not affiliated with the Western Pennsylvania Conservancy or the Frank Lloyd Wright Foundation"), and the sources
  it was built from (e.g. "HABS PA-5346, Library of Congress"; "OpenStreetMap"; "photographs on Wikimedia Commons, CC BY 3.0 and CC
  BY-SA 4.0"). A house with no organisation of its own (the Stahl House) shows only its sources.
- **The data:** OpenStreetMap contributors (ODbL), linked; terrain from Mapzen / AWS Terrain Tiles.
- A link back to all houses.

Coming-soon houses don't appear until they go live. Each house's own intro card keeps its disclaimer as it is.

## Approach
- **Registry:** each entry in `src/houses/index.ts` gets optional `affiliations` and `sources` lists. The registry stays pure data, so
  neither page loads a house's model.
- **The page:** a new Vite page, `credits/index.html` plus `src/credits/`, listed in `PAGES`.
- **Keeping it in step:** a test checks each house's `affiliations` against that house's intro-card disclaimer, so they can't drift apart.

## Acceptance criteria
- **A1** [unit] The home footer links to `/credits/`, says "not affiliated" nowhere, and names no organisation (only the
  OpenStreetMap / terrain credit).
- **A2** [unit] The credits page names the LEGO Group, and for every live house its name, each of its `affiliations` and each of its
  `sources`. It has no section for a coming-soon house.
- **A3** [unit] For every live house, each organisation in its `affiliations` appears in its definition's `text.disclaimer`, and every
  organisation that disclaimer names (other than the LEGO Group) is in `affiliations`.
- **A4** [unit] `/credits/` is in `PAGES` (it's built), and the spec 013 wording test covers it: no "brick".
- **A5** [unit] The existing home-page tests are updated. Spec 007-A2's "credits are on the page" now means the OpenStreetMap credit
  and the link to `/credits/`; the LEGO line moves to the credits page.
- **A6** [manual] In `npm run dev`, the footer link opens the credits page, which reads as in Behavior; the page works on a phone width.

## Out of scope
- Each house's intro card (already right).
- The README's disclaimer.
- Credits for the coming-soon houses.

## Open questions
- [x] **Q1: The map credit on the home page.** *Recommended: keep the one-line OpenStreetMap / terrain credit in the footer as well.*
      The thumbnails show neighbourhoods drawn from OSM data, and its licence (ODbL) asks for attribution where the data is shown.
      The alternative is to move it to the credits page too.
- [x] **Q2: Sources on the credits page.** *Recommended: yes*, list each house's sources (the HABS drawings, OSM, the photographs and
      their licences). It's where a curious visitor or a rights holder would look, and the CC BY photographs ask for credit if we lean on
      them. The alternative is disclaimers only.

## Implementation notes
- **Registry:** `House` gains `affiliations` and `sources`. Each live house has them (the Stahl House has sources only).
- **Page:** `credits/index.html` with `src/credits/CreditsPage.tsx` and `main.tsx`, listed in `PAGES`. It's built from the registry.
- **Footer:** "Fan tributes in a generic toy-block style. **Credits & disclaimers** · Neighborhoods © OpenStreetMap contributors;
  terrain…" (Q1: the map credit stays).
- **Sources (Q2):**
  - Fallingwater: HABS PA-5346, the NHL nomination, OSM.
  - The Schröder House: photographs by Sailko (CC BY 3.0) and by A. J. van der Wal for the RCE (CC BY-SA 4.0), all on Wikimedia
    Commons, plus OSM.
  - The Eames House: spec 010's sources.
  - The Stahl House was built before specs began, and there's no record of its sources. Its entry says only "published photographs and
    descriptions of the house" and OSM. Worth confirming.
- **Tests:**
  - `tests/credits.test.tsx` covers A1–A4. It failed first, then passed.
  - 007-A2's "credits are on the page" now checks for the OSM credit and the `/credits/` link (A5).
  - 155 tests in all.
- **A6 pass** (Chrome):
  - The footer link opens `/credits/`, and it reads as in Behavior.
  - At 390 px (in a frame; the window wouldn't resize) the text wraps with no sideways scroll.

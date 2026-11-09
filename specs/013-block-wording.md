# 013 — "Block", not "brick", in everything visitors read

- **Status:** Done (approved by Erik 2026-11-09: "should we change reference of brick to block to match the blockitecture name" → "yes")
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
Visitor-facing wording matches the name: "block by block", "toy blocks", "Sorting blocks…". This also keeps a little more distance from
the LEGO Group's own word for its pieces.

## Scope
- **Changes:** page titles, meta descriptions and loading text (all pages); home headline, tagline, image alt text and footer
  disclaimer; each house's intro headline and disclaimer; the README's visitor-facing lines.
- **Unchanged:** code (`Brick`, `BrickSet`, the piece kind `'brick'` next to `'plate'` and `'tile'` is the precise toy-building term,
  and renaming it would change every model fingerprint for no visible reason); developer docs that refer to the code; past specs.

## Acceptance criteria
- **A1** [unit] No "brick" (any case) in: every page's HTML (`PAGES` in `vite.config.ts`), the rendered home page text, and every house
  definition's `text`.
- **A2** [unit] The home headline and each house's intro headline say "block by block".
- **A3** [manual] Home, Stahl and Eames pages show the new wording (tab titles, headline, intro card, loading screen, footer).

## Implementation notes
- **Changed:**
  - all three pages' titles, meta descriptions and loading text ("Sorting blocks…");
  - the home headline ("Famous houses, built block by block"), tagline ("rebuilt from toy blocks") and footer
    ("generic toy-block style");
  - the card image alt text ("built from toy blocks");
  - both houses' intro headlines ("block by block") and the Eames disclaimer;
  - the README's opening line and disclaimer.
- **Kept, as scoped:** code identifiers (`Brick`, `BrickSet`, `BrickPlaceholder`, piece kind `'brick'`), the README's developer note
  "its brick model", and past specs. All model fingerprints are unchanged.
- **Also:** spec 010's commit line now lists both steps (901b188 for 010a, 491d035 for 010b).
- **Results:**
  - A1–A2: `tests/wording.test.tsx` (4 tests). 102 tests total. The built pages' titles were checked in `dist/`.
  - A3 pass in Chrome: the home headline and tagline, the Eames tab title and intro headline, and no "brick" anywhere in the page text.

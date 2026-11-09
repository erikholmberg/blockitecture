# 024 — "Built by Erik Holmberg" in the footer

- **Status:** Done (requested by Erik 2026-11-09, with the exact wording and link)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The home page footer credits the site's author, linked to his website.

## Behavior
The footer's opening "Fan tributes in a generic toy-block style." becomes "Built by **Erik Holmberg**.", with the name linked to
https://erikholmberg.com. The rest of the footer is unchanged: "Credits & disclaimers · Neighborhoods © OpenStreetMap contributors;
terrain from Mapzen / AWS Terrain Tiles."

The fan-tribute line isn't lost: the credits page (spec 021) opens with "Every house here is a fan tribute in a generic toy-block
style, not affiliated with the LEGO Group", and each house's intro card has its own.

## Acceptance criteria
- **A1** [unit] The home footer starts "Built by Erik Holmberg.", and "Erik Holmberg" links to `https://erikholmberg.com`.
- **A2** [unit] The footer no longer says "Fan tributes", and the credits page still says it's a fan tribute not affiliated with the
  LEGO Group.
- **A3** [manual] In `npm run dev`, the footer reads as in Behavior, and the link opens erikholmberg.com.

## Out of scope
- The credits page and the house pages.

## Open questions
None.

## Implementation notes
- **Change:** `src/home/HomePage.tsx`'s footer opens with "Built by [Erik Holmberg](https://erikholmberg.com)."
- **Tests:** `tests/builtBy.test.tsx` covers A1 and A2. They failed first, then passed. 174 tests in all.
- **A3:** in Chrome the footer reads "Built by Erik Holmberg. Credits & disclaimers · Neighborhoods © OpenStreetMap contributors;
  terrain from Mapzen / AWS Terrain Tiles.", and the name's link points to `https://erikholmberg.com/`. I checked its address but
  didn't follow it from the test browser.

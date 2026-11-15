# 082 — Finding your way among the buildings

- **Status:** In progress (approved by Erik 2026-11-14, "approve", with every recommended answer; built, every criterion checked, not yet committed)
- **Owner:** Erik
- **Created:** 2026-11-14
- **Commits:** ae3e25e

## Goal
With 32 buildings, there is only one way from one building to another: back to the home page, then down a two-column list of
big cards in the order they were added. The newest is about 16 screens down. The home page will show the newest first, in a
denser grid, with filters for houses or landmarks, era and region. Inside a building, a menu and previous/next buttons will go
straight to any other building, without the home page.

This changes:
- spec 007's card order (registry order, A2);
- spec 015's two-column limit;
- the "← All houses" wording of specs 007 and 014.

## Behavior

### Home page
- **Order:** newest first. The building added last is first. A small **New** badge marks the last four added (Q1). Today those
  are the Gropius House, the Salk Institute, the Centre Pompidou and the Schindler House.
- **Grid:** one column on phones, two from 640 px, **three from 1024 px**. The cards keep their 16:9 thumbnails and palette strip.
  The blurb is cut to two lines (the full text stays in the HTML for search engines; spec 053).
- **Filters:** a row of chips above the grid, in three groups. You can pick one chip per group, and picking the selected chip
  again turns it off.

  | Group | Chips (count today) |
  |---|---|
  | Type | Houses (22) · Landmarks (10) |
  | Era | Before 1930 (9) · 1930–1959 (13) · 1960 on (10) |
  | Region | Western US (10) · Eastern US (6) · Europe (11) · Elsewhere (5) |

  - **Groups combine:** Landmarks + 1960 on shows the Neue Nationalgalerie, Trellick Tower, Habitat 67, the Church of the Light,
    the Salk Institute and the Centre Pompidou.
  - **The count:** a line next to the chips says how many buildings match ("6 buildings").
  - **No matches:** the grid is replaced by "No buildings match" and a **Clear filters** button.
  - **Each chip shows its count** under the other active filters, and a chip that would match nothing is greyed out.
- **Shareable:** the chosen filters go into the page's address (`/?type=landmark&era=1960`). Opening that address shows the same
  filtered view, and Back and Forward step through filter changes.
- **Readable without JavaScript:** search engines and readers without scripts get all 32 cards, newest first, unfiltered.
- **Where the regions come from:**
  - **Western US:** the eight in California (Los Angeles, Palm Springs, Newport Beach, La Jolla), plus Taliesin West in Arizona.
  - **Eastern US:** the US buildings east of the Rockies (Illinois, Michigan, Pennsylvania, Connecticut, Massachusetts).
  - **Elsewhere:** Mexico City, Japan, Sydney and Montreal.
- **The credits page** keeps the order buildings were added.

### Inside a building
- **The chip at top left** reads `← All buildings · <name> ▾ · ‹ ›` on desktop:
  - **← All buildings** still goes to the home page.
  - **The name** opens the building menu.
  - **‹ and ›** go to the previous and next building, in the home page's order, and wrap around at the ends.
- **The building menu:**
  - It lists every building, newest first. Each row has a small thumbnail, the name and "architect · year".
  - The current building is marked, and the list opens scrolled to it.
  - Choosing a row opens that building's page.
- **Keys:** `[` goes to the previous building and `]` to the next. They're added to the controls listed on the intro card.
- **Phones:** the chip stays one line, `← <name> ▾`.
  - The arrow goes home.
  - Tapping the name opens the menu as a sheet from the bottom of the screen, with Previous and Next buttons at its top.
  - Every button is at least 40 px (spec 070).
- **Works before the build starts:** the menu and the arrows work above the intro card, as "← All houses" does today (spec 036's
  stacking).
- **Out of the way:** the menu is solid, with no backdrop blur (spec 007's −22% frame rate). When it's closed, it costs nothing.

### Wording
- **"All buildings" everywhere:** the HUD, the phone chip's screen-reader name, and the credits page's footer link say
  **"All buildings"** instead of "All houses" (Q3). This follows spec 030's "Famous buildings".

## Acceptance criteria
**Registry**
- **A1** [unit] Every building in the registry has a `type` ('house' or 'landmark') and a `region` ('us-west', 'us-east',
  'europe' or 'elsewhere'). A building is a landmark exactly when its definition sets `text.noun` (spec 059). Today that's 10
  landmarks and 22 houses.
- **A2** [unit] The regions match the table: Western US 10, Eastern US 6, Europe 11, Elsewhere 5. The eras derived from `year` are
  Before 1930 9, 1930–1959 13, 1960 on 10 (1930 and 1960 open their eras).

**Home page**
- **A3** [unit] The home page renders one card per building, newest first: the last registry entry is the first card. The **New**
  badge is on the last four registry entries only.
- **A4** [unit] The grid has `grid-cols-1`, `sm:grid-cols-2` and `lg:grid-cols-3`, and never more than three columns.
- **A5** [unit] Filtering (a pure function) combines the groups:
  - Landmarks + 1960 on gives exactly the six buildings named above.
  - Each group's chip counts reflect the other groups' choices.
  - Clearing the filters gives back all 32.
- **A6** [unit] Filters round-trip through the address:
  - parsing `?type=landmark&era=1960&region=europe` and formatting it again gives the same query;
  - unknown keys and values are ignored;
  - an empty filter formats as no query at all.
- **A7** [unit] Rendered on the server, the home page has all 32 cards with no filter applied. Hydrating it with no query in the
  address changes nothing (spec 053, A10 still passes).
- **A8** [unit] With a query in the address, after hydration the page shows only the matching cards and the count. With no match,
  it shows "No buildings match" and Clear filters.

**Inside a building**
- **A9** [unit] `navList` gives every live building in the home page's order. Prev and next from the first and last building
  wrap around. `src/engine` still imports nothing from `src/houses`: each house's `main.ts` passes the list in.
- **A10** [unit] The HUD shows "← All buildings" linking to `/`, above the intro overlay on desktop and phone. It also shows a menu
  button with the building's name, and on desktop ‹ › links to the previous and next buildings' pages.
- **A11** [unit] The building menu lists every building with its name and architect · year, and links each to `/<slug>/`. The
  current building is marked with `aria-current="page"`.
- **A12** [unit] The `[` and `]` keys go to the previous and next building's page. They're ignored while typing in a field.
- **A13** [unit] "All houses" no longer appears in the HUD or the credits page. "All buildings" does.

**Manual** (in `npm run dev`)
- **A14** [manual] Desktop home page: three columns at 1280 px, the newest four first with their New badges.
  - Pick Landmarks, then 1960 on: six cards, "6 buildings".
  - Copy the address, open it in a new tab: the same view.
  - Use Back: Landmarks only.
  - Clear filters: all 32.
- **A15** [manual] Phone home page (iPhone emulation): one column; the chips wrap to fit without scrolling sideways; every chip can
  be tapped.
- **A16** [manual] Desktop building page: open the menu, which is scrolled to the current building, and pick another building:
  its page opens. Then ‹ and ›, and `[` and `]`, step through in home-page order, also from the intro card before Start.
- **A17** [manual] Phone building page: tap the name, the sheet opens from the bottom, Previous and Next work, and the sheet
  closes on a tap outside it.
- **A18** [manual] With the menu closed, the frame rate is unchanged at `?dpr=1.75&debug`. There's no backdrop blur over the canvas.

## Out of scope
- **Search box:** 32 buildings fit on a few screens once filtered.
- **A map of the buildings.**
- **More filters:** by architect, or a sort control.
- **Remembering filters** between visits, beyond the address.
- **Changing the credits page's order.**
- **Thumbnail sizes:** smaller thumbnail files for the menu. It uses the existing 1200 px thumbnails, loaded only when the menu
  opens.

## Open questions
- [x] **Q1: The New badge.** *Recommended: on the last four buildings added*, since the registry has no dates. The alternative
  adds an `added` date to each building and badges those added within 30 days.
- [x] **Q2: Regions.** *Recommended: the four groups above.* Countries would mean about ten chips, most with one or two buildings.
  The alternative is to split Europe into north and south, or to add a separate Asia & Australia chip.
- [x] **Q3: Wording.** *Recommended: "All buildings"* in the HUD and the credits footer, per spec 030. The alternative keeps "All
  houses".
- [x] **Q4: Era boundaries.** *Recommended: before 1930 / 1930–1959 / 1960 on* (9 / 13 / 10). The alternative is by decade, which
  gives eight chips.

## Implementation notes
- **Files:**
  - **Registry:** `src/houses/index.ts`: `type` and `region` on all 32, the `Region` type, `navList()`.
  - **Home page:**
    - new: `src/home/filter.ts` (pure: eras, newest first, New badges, filtering, chip counts, the query) and
      `src/home/FilterChips.tsx`;
    - changed: `src/home/HomePage.tsx` and `src/home/HouseCard.tsx` (the New badge and the two-line blurb).
  - **Viewer:**
    - new: `src/engine/nav.ts` (pure: `NavBuilding`, `neighbours`, `keyTarget`, `isTyping`) and
      `src/engine/ui/BuildingMenu.tsx` (the popover, the phone sheet, ‹ ›);
    - changed: `src/engine/ui/Hud.tsx` (both chips) and `src/engine/ui/IntroCard.tsx` (a fourth hint on desktop, "[ ] Other
      buildings");
    - changed: `src/engine/viewer.ts` (`startViewer`'s third argument and the keys).
  - **House pages:** every `src/houses/*/main.ts` passes `navList()`.
  - **Wording:** `src/credits/CreditsPage.tsx`.
- **Tests:**
  - `tests/findingYourWay.test.tsx` covers A1–A13. A3, A4 and A7–A13 failed first; A1, A2, A5 and A6 test the pure modules, which
    were written just before the tests.
  - Updated for the changed behavior:
    - `home.test.tsx` (007 A2: newest first);
    - `homeGrid.test.tsx` (015 A1: three from lg);
    - `hud.test.tsx` and `phoneControls.test.tsx` ("All buildings");
    - `introCard.test.tsx` (026 A2: the fourth hint);
    - `buildPayload.test.ts` (047 A3: `main.ts` may pass `navList()` after the worker);
    - `sharingSearch.test.tsx` (the A9 fixture needs a type and region).
  - `npm run check`: 89 files, 732 tests pass.
- **Hydration (spec 053 A10):** the filters are read from the address in an effect. With no query the effect keeps the same state
  object, so hydrating renders nothing again; A10 caught the extra render (React's act warning) before this.
- **Added in the browser check:** Clear filters also sits beside the count. Below the grid it was off-screen whenever a filter was
  on. The empty grid keeps its own Clear filters button.
- **Desktop chip:** "← All buildings", then the name (a popover trigger) with ‹ › beside it. Phone chip: ← (a link home, named "All
  buildings" for screen readers), then the name, which opens the sheet. Without a building list (tests, `?clean`), the chips
  are as before.
- **Manual checks** (Chrome, dev server):
  - **A14 pass:** three columns, the four New badges first. Landmarks + 1960 on gives 6 and "6 buildings", with Eastern US greyed
    at 0. Opening `/?type=landmark&era=1960` directly gives the same view. Back goes to Landmarks (10), and Clear filters gives
    32 with no query.
  - **A15 pass:** at a 390 px width (the page in a 390 px iframe; Chrome wouldn't narrow the window), one column, the chips wrap
    with no sideways scroll, and every chip is in view.
  - **A16 pass:**
    - On Fallingwater, the menu opens with Fallingwater marked, and picking the Ennis House opens it.
    - `]` and `[` from the intro card go Ennis → Farnsworth → Ennis.
    - ‹ goes to Casa Malaparte and › back to the Ennis House.
  - **A17 pass, at 390 px in an iframe, with mouse clicks, not on a touch device:** the sheet opens from the bottom with the Ennis
    House marked and in view, a tap outside closes it, and Next (Farnsworth) and Previous (Ennis) work.
  - **A18 pass:** the Stahl House at `?dpr=1.75&debug`, finished: 60 fps, 1,885,078 triangles, 14 draw calls, as before
    (spec 078's figures). Nothing in the new UI uses a blur.

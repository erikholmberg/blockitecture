# Feature brainstorm, with an adversarial review (2026-11-09)

Twenty feature ideas for the site, each then attacked by a separate reviewer told to argue against it from the code and the specs.
Nothing here is approved: any of it still needs a spec (CLAUDE.md). Written when ten houses were live.

## Corrections the review made to the original list
- Neutra has **two** houses here (Kaufmann, Lovell), not three: the Stahl House is Koenig's. Wright has two (Fallingwater, Ennis).
- **Pieces carry no source data.** `Brick` in `src/engine/voxel.ts` holds position, size, colour, kind, phase and group. The
  [documented]/[assumed] markers are source comments on blocks of code, so per-piece "what is this, where's it from" needs new data.
- **The sun is computed for two moments only:** `sunFor(day, site, 'day' | 'dusk')` in `src/engine/scene/sun.ts`, with the date
  from `?date=`. There's no time of day.
- **URL parameters:** `?view=` takes a named view only; also `light=dusk`, `date`, `clean`, `dpr`. There's no free camera position
  or build time in the URL.
- **Keyboard control mostly exists** (P, F, Tab, H, R, +/−, arrows in `viewer.ts`, aria-labels in the HUD). What's missing is
  `prefers-reduced-motion` (auto-rotate ignores it) and screen-reader announcements.

## The 20, with verdicts

| # | Feature | Strongest attack | Verdict | Value | Effort |
|---|---|---|---|---|---|
| 1 | **Confidence lens:** tint pieces [documented] vs [assumed] | No per-piece data to tint by; some houses (Stahl) have no drawings at all, so it would read "all assumed" | Kill | 2 | L |
| 2 | **Section cut:** slice the house at any height | Survives: it extends the roof cut's Y-range shader discard (`BrickSet.ts`) into a slider | **Survives** (a free height slider, no per-floor data) | 4 | S–M |
| 3 | **Piece cards:** tap a piece to see what it is and its source | No per-piece data; picking among 60k instances needs a raycast layer; another DOM layer over the canvas (spec 036) | Rework: cards per room or group (`group` exists) | 2 | L |
| 4 | **Sun study:** time-of-day and date slider | Shadow-map recompute while scrubbing at dpr 1.75; lighting presets only for day/dusk; manual checks ×10 houses | Rework: presets (morning / noon / dusk) plus a date picker | 3 | M |
| 5 | **Measure tool** | Toy blocks quantized to studs and 0.4-ft plates give false precision about the real house; needs picking in walk and touch | Kill | 1 | M |
| 6 | **Instruction-booklet mode** with parts per step | That is the LEGO Group's best-known format: the biggest affiliation risk, against specs 013 and 021; pieces aren't standard parts anyway | Kill | 2 | M |
| 7 | **Parts list** (bill of materials) | Same trade-dress problem; arbitrary sizes imply a real set | Rework: a "by the numbers" panel (pieces, top colours, pieces per phase), no part sizes | 2 | S |
| 8 | **Timelapse export** (video or GIF) | MediaRecorder on 60k instances drops frames, weak on iOS, clashes with adaptive DPR | Rework: Erik records one MP4 per house offline, served static | 3 | M |
| 9 | **Narrated build** captions | Phase names already are captions ("The steel frame: 40 hours") | Merge into #19 | 2 | S |
| 10 | **Share button:** link to the current view, time, day/dusk | Survives: pure URL logic, unit-testable; add camera position and copy-to-clipboard | **Survives** | 4 | S |
| 11 | **Embed mode** for blogs | Autoplaying a 60k-piece WebGL scene on someone else's page melts phones | Rework: poster image plus click-to-start, on `?clean` | 2 | S–M |
| 12 | **Postcard snapshot** with name and credit | Survives: render once, draw the name and credit in 2D, `toBlob`; keeps attribution on every image | **Survives** (merge with #10) | 4 | S |
| 13 | **Map and timeline page** | 7 of 10 houses in California, so the map is a cluster around LA; tile licensing on a static site | Rework: a timeline sort on the home page | 2 | M |
| 14 | **Compare at scale:** two houses side by side | Two scenes and neighbourhoods blow the perf budget; each house sits on its own real terrain | Kill | 3 | L |
| 15 | **Filters** by architect, country, decade | With 10 cards most filters leave 1–2 results; no country/decade fields | Kill (revisit at ~25 houses) | 1 | S |
| 16 | **Architect pages** | 2 + 2 + singletons; biographies are where estates enforce (Barragan Foundation, spec 035 Q3) | Kill (link out from the card instead) | 1 | M |
| 17 | **Ambient sound** | Off by default means unheard; audio licensing and per-house curation | Kill | 1 | M |
| 18 | **Weather and seasons** | Particles and fog on 60k instances; variants ×5 scenery types; flicker risk (spec 011) | Kill | 2 | L |
| 19 | **Accessibility:** reduced motion, keyboard, screen readers | Survives: `prefers-reduced-motion` stops auto-rotate and offers the finished house; phase names in an aria-live region | **Survives** | 4 | S |
| 20 | **Offline / installable app** | Little use case; service workers add stale-cache bugs to every deploy for one maintainer | Kill | 1 | M |

## Shortlist after the review
1. **Accessibility** (#19, with #9): reduced motion and aria-live phase announcements. Once in `src/engine`, nothing per house.
2. **Share link** (#10): a link to the exact view and moment.
3. **Postcard snapshot** (#12): one tap saves an image with the house's name and credit.
4. **Section cut** (#2): a free height slider, on the roof cut's mechanism.
5. **Sun presets** (#4, reworked): morning, noon and dusk plus a date picker.

**Merges:** #10 + #12 into one Share menu ("Copy link", "Save image"); #9 into #19; #6/#7 only as a "by the numbers" panel;
#13 + #15 as a timeline sort on the home page; #8 + #11 as a static pre-recorded video or poster per house.

**The review's overall point:** the survivors are written once in the shared viewer and need no data per house. Nearly everything
killed needs per-piece or per-house data the models don't carry (#1, #3, #16, #17, #18), adds load to the render budget (#8, #14,
#18), or edges toward LEGO trade dress (#6, #7).

**Suggested next step:** one small spec for accessibility plus the Share menu.

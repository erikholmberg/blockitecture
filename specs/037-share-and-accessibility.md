# 037 — Share links, postcards and accessibility

- **Status:** Done (approved by Erik 2026-11-09: "approved", all recommendations. Closed by Erik 2026-11-09: "close the specs", accepting
  the checks that couldn't be run here: reduced motion (A10) and the iPhone share sheet (A13))
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** 674d855 (build)

## Goal
The top three ideas from the feature review (`docs/ideas/2026-11-09-feature-brainstorm.md`), all in the shared viewer, with no
per-house work:
1. **Accessibility:** the viewer respects *reduced motion*, and screen-reader users hear the build progress.
2. **Share link:** copy a link that opens the same house at the same view, light and moment of the build.
3. **Postcard:** save an image of the current view, captioned with the house's name, its architect and year, and the credits.

## Behavior
**Accessibility**
- **Reduced motion:** when the visitor's system asks for it (`prefers-reduced-motion: reduce`):
  - the scene doesn't auto-rotate, behind the intro or after;
  - camera moves (the view buttons, zoom and rotate) jump straight to the new view instead of gliding;
  - pieces appear in place instead of dropping in (Q4).
- **A "See it finished" link** on the intro card, next to Start building, for everyone (Q1). It skips straight to the finished house.
- **Screen readers:** a polite live region announces each new phase as the build reaches it ("Now building: The steel frame: 40
  hours"), and "Complete" at the end. It doesn't announce anything else, and nothing visible changes.
- **The keyboard** already drives the viewer (P, F, Tab, H, R, + / −, arrows); the new Share menu is reachable and usable by
  keyboard too.

**Share**
- **Desktop:** a Share button joins the camera buttons on the right, with a menu: **Copy link** and **Save image**.
- **Phones:** the same two items go in the Settings menu (spec 014 keeps the phone layout slim).
- **Copy link** copies the page's address with the current state:
  - the view: `view=<key>` when the camera is at a named view, otherwise `cam=x,y,z,tx,ty,tz` (feet, to one decimal);
  - `light=dusk` at dusk;
  - `t=<seconds>` of the build, unless it's finished.

  On phones with a share sheet (`navigator.share`) it opens that instead. Otherwise a small note says "Link copied".
- **Opening such a link** shows the intro card as usual, at that view and light. Start goes on from that moment of the build; a
  finished `t` shows the finished house. Walk mode isn't shared. Bad or out-of-range values are ignored, like today's
  `?view=` (spec 007).

**Postcard**
- **Save image** renders the current view at 1600 × 900, without the controls, with a caption band along the bottom (Q3):
  - the house's name, then its architect and year;
  - "Blockitecture" and the site's address;
  - "© OpenStreetMap contributors · Terrain: Mapzen / AWS Terrain Tiles".
- **The file** is `<house-slug>.png`. On phones with a share sheet that accepts files it opens the sheet (so the image can go
  to Photos); elsewhere it downloads.
- **Wording:** the caption follows spec 013: no "brick", no "LEGO".

## Acceptance criteria
**Accessibility**
- **A1** [unit] With reduced motion, the viewer's motion settings turn auto-rotate off, glides instant and the drop height 0;
  without it, they're as today. A pure function, from the media query's answer.
- **A2** [unit] The HUD has one `aria-live="polite"` region. It announces the phase's name when the phase changes and
  "Complete" when the build finishes, and stays the same between changes.
- **A3** [unit] The intro card has a "See it finished" control that starts the viewer finished (calls Start, then Finish).

**Share link**
- **A4** [unit] A pure `shareQuery(state)` / `readShare(params, house)` pair:
  - round-trips a named view, a free camera (to 0.1 ft), dusk and a build time;
  - leaves `t` out when finished;
  - ignores malformed or non-finite values and unknown view keys.
- **A5** [unit] The desktop HUD has a Share button whose menu offers Copy link and Save image. The phone HUD's Settings menu
  offers both. Each calls its handler.
- **A6** [unit] Copy link uses `navigator.share` when it exists and the device is touch, otherwise the clipboard. "Link copied"
  shows after a clipboard copy.

**Postcard**
- **A7** [unit] A pure `postcardCaption(house, host)` gives the caption's lines: the name; the architect and year; "Blockitecture ·
  <host>"; the credit line. None contains "brick" or "LEGO" (any case). The file name is `<slug>.png`.
- **A8** [unit] The postcard is 1600 × 900, with the caption band inside it.

**Manual** (in `npm run dev`)
- **A9** [manual] Chrome:
  - Copy link, then open it in a new tab: the same view, light and build moment.
  - Save image: a 1600 × 900 PNG with the caption, the scene as on screen, and no controls.
- **A10** [manual] Chrome with reduced motion emulated (DevTools, Rendering): no auto-rotate, views jump, pieces appear in place.
- **A11** [manual] VoiceOver or Chrome's accessibility tree: the live region announces the phases.
- **A12** [manual] No change to the frame rate (Stahl at `?dpr=1.75`); nothing new over the canvas while the scene renders (spec
  036).
- **A13** [manual, Erik's iPhone] Share opens the share sheet; Save image can go to Photos.

## Out of scope
- Sharing Walk mode, the roof's state or the timeline's speed.
- Video or GIF export, embeds (the review reworked those into static files; another spec).
- Short links or any server (the site stays static).

## Open questions
- [x] **Q1: "See it finished" for everyone?** *Recommended: yes*, a quiet text link next to Start building. It helps anyone short of
      time, not just reduced-motion users. The alternative is to show it only with reduced motion.
- [x] **Q2: Share the build's moment (`t`)?** *Recommended: yes*, so "look at the frame going up" can be shared; it's left out
      when the house is finished.
- [x] **Q3: The postcard.** *Recommended: 1600 × 900 with a caption band*, whatever the screen's shape, so every image looks the
      same and the credit always fits. The alternative is the screen's own size and shape, with the caption overlaid.
- [x] **Q4: Pieces appear in place with reduced motion?** *Recommended: yes*: the drop is short (9 plates), but it's the most
      constant motion on screen while building.

## Implementation notes
- **New modules:**
  - **`src/engine/motion.ts`** (pure): `motionSettings(reduced)` and `prefersReducedMotion()`.
  - **`src/engine/share.ts`** (pure): `shareQuery` / `readShare`, `shareLink` (the share sheet on touch devices, otherwise the
    clipboard; a cancelled sheet isn't an error), and `postcardCaption`, `postcardLayout`, `postcardFileName`, `POSTCARD`
    (1600 × 900, a 104-px band).
  - **`src/engine/postcard.ts`** (DOM): renders one frame at 1600 × 796 at pixel ratio 1 and copies it into a 2D canvas in the same
    task. The renderer is then put back and redrawn. The caption band is drawn in the pages' off-white with Inter. The image goes
    to the share sheet where files can be shared (phones), and downloads elsewhere.
- **The viewer:**
  - Reads reduced motion at start: auto-rotate off, `Glide` with duration 0, and `setDropHeight(0)` in `BrickSet`.
  - Reads `?view` / `?cam` / `?t` through `readShare`. Today's `?view` and `?light` behave as before; bad values are ignored.
  - Remembers the light for links.
  - Builds the link from the camera: a named view when within 0.5 ft of one, else `cam=`. In Walk it uses the orbit view saved
    when Walk began.
  - The `?debug` API gains `shareQuery()` and `postcard()`, to check both without the clipboard or a download.
- **The HUD:**
  - A visually hidden `aria-live="polite"` region.
  - "See it finished" beside Start building.
  - The Share menu at the bottom of the camera column on wide screens, and a Share section in the phone Settings menu.
  - A small "Link copied" note (`role=status`) that clears after 2.2 s. It isn't a full-screen layer (spec 036).
  - `onShare` is optional on `HudHandlers`, so existing callers and tests are unchanged.
- **Tests:** `tests/shareAccessibility.test.tsx` covers A1–A8.
  - They were written first. They failed on the missing modules, and then the six HUD tests failed on the missing UI.
  - 271 tests in all.
- **Manual checks** (Chrome, 2026-11-09):
  - **A9 pass:**
    - Copy link showed "Link copied"; the debug query gave `cam=100,80,220.5,62,4,37` (the scene was auto-rotating).
    - Opening `?cam=-30,4,120,55,2,40&t=90` shows that view 1:30 into the build, behind the intro.
    - `?view=city&light=dusk` opens the city view at dusk.
    - The postcard (Lovell, *From below*) is 1600 × 900: the scene, no controls, and the caption "Lovell Health House / Richard
      Neutra · 1929 / Blockitecture · localhost:5173 / © OpenStreetMap contributors · Terrain: Mapzen / AWS Terrain Tiles".
    - "See it finished" goes straight to the complete house.
  - **A10 not checked:** the browser extension can't emulate `prefers-reduced-motion`, and changing the system setting is
    Erik's to do. The settings are unit-tested (A1). To check: turn on Reduce motion (macOS: System Settings → Accessibility →
    Display), then open a house.
  - **A11 pass (accessibility tree):** after Start, the one live region read "Now building: Shaping the hillside", then
    "Foundations & pool basin", "Steel frame", and "Complete". Not tried with VoiceOver itself.
  - **A12 pass:** 60 fps at `?dpr=1.75` on the Stahl House (3.5M triangles). Nothing new covers the canvas.
  - **A13 not checked:** needs Erik's iPhone (the share sheet, and saving the image to Photos).

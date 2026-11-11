# 056 — The Lovell Beach House

- **Status:** In progress: built, waiting to be committed (approved by Erik 2026-11-11: "build 4 and don't stop until they're done", choosing to treat that message as approval
  of the specs written for it; the four are spec 054's top picks)
- **Owner:** Erik
- **House:** lovell-beach-house
- **Created:** 2026-11-11
- **Commits:** <!-- filled in when Done -->

## Goal
Rudolph Schindler's Lovell Beach House (1926) on the sand at Balboa, Newport Beach, built for the same client as Neutra's Lovell
Health House, which is already on the site. Five concrete frames lift the house off the beach: a double-height living room facing
the ocean, and a row of bedrooms in a band hung between the frames, cantilevered over 13th Street. It's the first house on a
beach, and it reuses the sea. It's built block by block on its real lot, with the same viewer, and takes a new live card on the
home page. On spec 054's list it's ★★★.

## Research (2026-11-11)
**Status today:** a private home, still the Lovell family's. Barbara Lovell lived there until 2025. It was listed for sale in
October 2026 (Galerie, Wallpaper, LA Magazine). It has been on the National Register since 5 February 1974 (#74000545).

**Sources:**
- **The Historic American Buildings Survey, HABS CA-1986 (1968):** ten measured sheets and data pages.
  - **The frames:** five, 12′-0″ on centre, with 4′-6″ and 6′-2″ overhangs: 58′-8″ long. Each has three posts across the house:
    1′, 15′-0″, 2′, 8′-8″ and 1′, so 27′-8″.
  - **The bedroom band** cantilevers 5′-6″ further west, to 33′-2″.
  - **Every level:** the living floor at +10′-0″, the bedrooms at +16′-6″, the joists' underside at +24′-0″, the bath at
    +18′-9″, and the tower to about 30′-6″.
  - **The rooms:** the garage and the open play area below, the kitchen bay, the living and dining room with its built-in
    divider, four bedrooms off a gallery, the two concrete stairs up from the platform on 13th Street.
- **The National Register nomination (1974):** the sleeping porches enclosed about 1928, "white plaster and redwood window frames".
- **OSM:** the house is way **1070767462** (`wikidata=Q746490`), 60.0 × 33.8 ft, its long side at **16.5°**. 13th Street runs
  along its west side, the alley along its north. The boardwalk (West Ocean Front) is about 130 ft from the alley.
- **Today's windows are green** (Galerie, 2026).

## Proposed approach
- **Data:** `scripts/houses/lovell-beach-house.mjs`, fitted by OSM way 1070767462; the lot's buildings and streets as lot features.
  - The terrain tiles read the Pacific as flat ground at sea level with no bed, so the engine wouldn't draw water (spec 011). The
    data script's `lake` option (spec 045) lowers every sample under 0.3 m to a bed 20 ft down, so the ocean and Newport Harbor
    show.
  - The scenery is `sea: true`, with `desert: true` so the peninsula's sand reads as sand down to the water (spec 033).
- **The house** at `/lovell-beach-house/`:
  - the footings and the ground slab;
  - the five frames, each with its beams under the living floor and under the roof;
  - the living floor; the bedrooms' floor and the gallery hung between the frames;
  - the chimney on the east wall;
  - the platform and the two concrete stairs on the 13th Street side, and the stair inside;
  - stucco walls with bands of Schindler's muntined windows: the two-storey glass wall to the ocean, the bedroom band's row of
    windows over a solid band where the porches' rail was;
  - the roof with its parapet, the tower over the north bay and the sun deck.
- **The lot:** sand, the alley, 13th Street, the boardwalk, the small garden toward the ocean, and the neighbours as plain stucco
  blocks.

**Build story** (roles per spec 012):
1. *The lot on the sand* (**site**).
2. *The footings & the ground slab* (**foundation**).
3. *The living floor* (**floor**).
4. *The five concrete frames & the stairs* (**structure**).
5. *The rooms* (**interior**).
6. *The walls & the windows* (**envelope**).
7. *The roof & the tower* (**roof**).
8. *The palms & the sun deck* (**landscape**).

About 2½ minutes.

## Behavior
- **Home page:** a new live card, with a thumbnail from the beach end of 13th Street and its piece count.
- **Viewer:** `/lovell-beach-house/` works like the other houses.
- **Views:**
  - *Overview*: over the house to the ocean;
  - *From 13th Street*: the posts' ends and the bedroom band;
  - *The frames*: from the beach, looking up the house's length;
  - *The living room*: inside the double-height room;
  - *From the beach*.

## Acceptance criteria
**House**
- **A1** [unit] The footprint fits OSM's way 1070767462 (IoU ≥ 0.75), 58′-8″ × 33′-2″ (within 2 ft).
- **A2** [unit] Five frames 12 ft apart, each with three posts from the ground to the roof, and a beam under the living floor.
- **A3** [unit] The living floor at +10 ft and the bedrooms at about +16′-6″ (within 0.5 ft). The bedroom band reaches 5 ft or more
  past the west posts.
- **A4** [unit] The living room's south wall is glass, from the living floor to the ceiling.
- **A5** [unit] Two outside stairs rise from the platform to the living floor, one north and one south, at different slopes.
- **A6** [unit] The model invariants hold: no overlaps, inside the grid, deterministic; every phase used; about 2½ minutes.
- **A7** [unit] `tests/buildOrder.test.ts` covers it: phases in role order, nothing floats, nothing dropped.
- **A8** [unit] Every element is marked **[documented]** or **[assumed]**, with at least 8 marks in the interior.

**Site**
- **A9** [unit] The lot terrain meets the real terrain at its edges.
- **A10** [unit] No terrain spikes (the spec 010b check).
- **A11** [unit] The ocean is water at sea level beyond the beach, and the beach and the lot are not.

**Home and credits**
- **A12** [unit] The home card is live, with the real piece count and its credits.

**Manual** (in `npm run dev`)
- **A13** [manual] The build plays in order: the frames go up before the rooms; the walls before the roof; the palms last.
- **A14** [manual] *From 13th Street* and the thumbnail read as the photographs: posts, the bedroom band with its row of windows
  hung over the street.
- **A15** [manual] The home page shows the new card live, with its thumbnail. The credits page lists the house.
- **A16** [manual] All views, No roof, Walk and the phone controls work.
- **A17** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.

## Out of scope
- The balcony on the east and south removed in the 1960s, and the outside kitchen stair removed about 1960: the house is shown as
  HABS drew it in 1968.
- The window muntins in exact detail: the pattern follows the drawings' rhythm, not each sash.

## Open questions
- [x] **Q1: Which state?** *As HABS drew it in 1968*, with today's green window frames.
- [x] **Q2: A private home for sale.** A fan model from HABS and the nomination, furnished generically.
- [x] **Q3: Disclaimer.** "Fan tribute. Not affiliated with the house's owners."

## Implementation notes
- **Files:** `scripts/houses/lovell-beach-house.mjs`; `src/houses/lovell-beach-house/` (`layout.ts`, `site.ts`, `house.ts`,
  `interior.ts`, `landscape.ts`, `beachHouse.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`,
  `worker.ts`); `lovell-beach-house/index.html`; `public/lovell-beach-house/`; the registry entry; `PAGES`; the shared test lists.
- **The fit:** OSM way 1070767462 at −107° (search −115…−98°), IoU 0.918.
- **The ocean:** the tiles read the Pacific as flat ground at sea level with no bed, so no water showed past the beach. Spec 045's
  `lake` option (`levelM: 0.3, floorFt: 20`) gives it a bed. The beach then read as green and blue patches; `desert: true`
  (spec 033) makes it sand down to the water.
- **The boardwalk** is a cycleway in OSM, which the data script doesn't fetch, so it's drawn at its documented distance (about
  130 ft from the alley).
- **The windows and walls are built a plate at a time,** so Schindler's bands start and stop where the drawings put them. The
  frames' beams under the living floor are laid in two-plate courses: in three-plate courses they were skipped wherever the floor
  slab took the top of a course. A2 caught it.
- **Tests:** `tests/lovellBeach.test.ts` covers A1–A6, A8–A12; A7 is in `tests/buildOrder.test.ts`.
- **16,923 pieces; 2:33 at 1×.**
- **Manual checks** (Chrome):
  - **A13 pass:** paused at 122.5 s the walls and windows are done, no roof, no palms.
  - **A14 pass:** the thumbnail and *From 13th Street* show the posts and the bedroom band with its row of green windows over the
    street.
  - **A15 pass:** the card is live with its thumbnail and 16,923 pieces; the credits page lists the house with HABS CA-1986.
  - **A16 partly checked:** *Overview* (the house with the ocean beyond) and the beach-side views open where they should. No roof,
    Walk and the phone controls weren't checked.
  - **A17 not measured.**
- **Thumbnail:** `/lovell-beach-house/?cam=92,14,72,30,15,18&clean&date=2026-06-21`.
- **Claude usage:** not recorded; nothing is committed yet.

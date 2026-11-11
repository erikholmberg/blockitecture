# 061 — Trellick Tower

- **Status:** In progress: built and committed, waiting for Erik to close it (approved by Erik 2026-11-11: "can you build 4 more buildings", choosing "the safe four" and to treat that message as
  approval of the specs written for it, as for specs 055–058)
- **Owner:** Erik
- **House:** trellick-tower
- **Created:** 2026-11-11
- **Commits:** 87a0587

## Goal
Ernő Goldfinger's Trellick Tower (1968–72) in Kensal Town, west London: 31 storeys of flats in rough concrete, with the lifts in
a separate tower joined to the slab by a bridge at every third floor, and the boiler house cantilevered from its top. It's the
first tower on the site, about five times as tall as anything built so far. It's built block by block on its real estate, with
the same viewer, and takes a new live card on the home page. On spec 054's list it's ★★★.

## Research (2026-11-11)
**Status today:** council housing owned by the Royal Borough of Kensington and Chelsea, with some leasehold flats. Listed
Grade II* in 1998 (Historic England 1246688), with Block B and the service tower.

**Sources:**
- **James Dunnett's published dimensions:** the south front is 143′-9½″ wide and 283′-9″ high; the crosswalls stand at 22′-11″
  centres; eight storeys measure 70′-11¼″, so a storey is 8′-10⅜″.
- **The listing:** bush-hammered in-situ concrete with pre-cast pebble-finished panels and timber-clad balconies; the service
  tower of 35 storeys, linked to the slab at every third floor; the "projecting boiler house on the 32nd and 33rd floors",
  "fully glazed"; corridor floors of one-bedroom flats with two-bedroom flats above and below; five two-storey maisonettes on
  floors 23–24; "brightly coloured tiles to corridors and lift walls"; Block B of seven storeys.
- **OSM:** the slab is way **57721739** (`wikidata=Q1571416`), its long axis at **113°/293°**; the service tower is way 85866116,
  7.3 m off the slab's west-north-west end; Block B is way 85866118, running south-south-west along Golborne Road.
- **Scaled from the published plans, the elevation and photographs:** the slab about 13 m deep; the service tower about 10 × 10 m;
  ten bridges, on floors 3 to 30; the balcony front's three-storey rhythm; the boiler house about 3 m out over a sloped haunch.
- **Not available:** dimensioned drawings (the RIBA holds them). Storey counts differ between sources (31 or 32).

## Proposed approach
- **Data:** `scripts/houses/trellick-tower.mjs`, fitted to all three OSM outlines by way ID. The rotation is pinned at −23° from
  the slab's documented bearing, because a search over rough rectangles drifts.
- **Height at the site's scale:** 32 levels of 22 plates (8.8 ft): 281.6 ft against the documented 283′-9″. The service tower
  rises to 308 ft, and its mast above that.
- **Large pieces:** the walls and fronts are built a storey (or half a storey) at a time from pieces up to 16 studs long, like the
  real tower's in-situ lifts and precast panels. Brick by brick it would take several hundred thousand pieces.
- **The tower** at `/trellick-tower/`:
  - the crosswalls and floors, with the fins halving each bay on the balcony front;
  - the balcony front's rhythm: cedar-fronted balconies all along on each corridor floor and the floor over it; on the floor
    under, a white window wall with a short balcony at the middle of each bay; the maisonettes' projecting boxes on floor 24;
  - the corridor front: bands of pebble panels at the corridor floors, two rows of paired windows between;
  - the more solid east end bay;
  - the service tower with its staggered slit windows, the ten bridges, the glazed boiler house on its haunch, the mast;
  - Block B along Golborne Road.
- **Inside:** the corridors' coloured tiles (a colour a floor), the entrance hall's coloured glass screen, the lifts, and one
  flat furnished as a sample. The other flats stay empty.
- **Engine:** an opt-in `shadowReach` on a house definition widens the sun's shadow box (default 120 ft, as before), so the upper
  floors cast and take shadows. Other houses don't set it.

**Build story** (roles per spec 012):
1. *The Cheltenham Estate* (**site**).
2. *The rafts* (**foundation**).
3. *The entrance level* (**floor**).
4. *The crosswalls, the floors & the service tower* (**structure**).
5. *The corridors' coloured tiles & a flat* (**interior**).
6. *The balconies & the windows* (**envelope**).
7. *The roofs & the boiler house* (**roof**).
8. *The trees* (**landscape**).

About 3 minutes.

## Behavior
- **Home page:** a new live card, with a thumbnail of the tower from the south-west and its piece count.
- **Viewer:** `/trellick-tower/` works like the houses. The numbers panel says "tower" (spec 059).
- **Views:** *Overview*; *The balcony front*; *The bridges*; *The boiler house*; *The corridor front*.

## Acceptance criteria
**The tower**
- **A1** [unit] The three outlines fit OSM's ways 57721739, 85866116 and 85866118 (IoU ≥ 0.75). The slab is 143′-9½″ long (within
  1 ft).
- **A2** [unit] 32 levels; the slab's top within 3 ft of 283′-9″; crosswalls at 23 ft (22′-11″) with a floor at every level.
- **A3** [unit] The service tower stands apart from the slab (a gap of 22–28 ft), rises above it, and is joined to it by ten
  bridges, one at every third floor, each a storey high.
- **A4** [unit] The boiler house is glazed and stands out beyond the service tower's face on the side away from the slab, above
  the slab's roof level.
- **A5** [unit] The balcony front's rhythm: on a corridor floor the cedar balcony front runs the whole of a bay; on the floor under
  it, only its middle.
- **A6** [unit] Block B has seven storeys and runs along the Golborne Road side.
- **A7** [unit] The model invariants hold: no overlaps, inside the grid, deterministic; every phase used; about 3 minutes.
- **A8** [unit] `tests/buildOrder.test.ts` covers it: phases in role order, nothing floats, nothing dropped.
- **A9** [unit] Every element is marked **[documented]**, **[scaled]** or **[assumed]**, with at least 5 marks in the interior.

**Engine**
- **A10** [unit] No other house sets `shadowReach`, so their shadows are as before.

**Site**
- **A11** [unit] The lot terrain meets the real terrain at its edges.
- **A12** [unit] No terrain spikes (the spec 010b check).

**Home and credits**
- **A13** [unit] The home card is live, with the real piece count and its credits. The numbers say "tower".

**Manual** (in `npm run dev`)
- **A14** [manual] The build plays in order: the frame rises storey by storey with the service tower; the fronts follow; the roofs
  and the boiler house's roof come before the trees.
- **A15** [manual] The thumbnail and *Overview* read as the photographs: the slab, the separate tower, the bridges, the boiler house.
- **A16** [manual] The upper floors are shaded like the lower ones (the wider shadow box works).
- **A17** [manual] The home page shows the new card live, with its thumbnail. The credits page lists the tower.
- **A18** [manual] All views, No roof, Walk and the phone controls work.
- **A19** [manual] Performance stays within Casa Malaparte's numbers at `?dpr=1.75`.

## Out of scope
- The 217 flats' interiors, beyond one sample flat.
- The podium's shops, the nursery and the garages; the Grand Union Canal (beyond the lot).
- The rest of the Cheltenham Estate.

## Open questions
- [x] **Q1: Large pieces** rather than bricks for the walls. *Decided:* yes, or the piece count would be out of reach.
- [x] **Q2: Storeys.** Sources say 31 or 32. *Decided:* the entrance level plus 31 floors, which matches the documented height.
- [x] **Q3: Disclaimer.** "Fan tribute. Not affiliated with the Royal Borough of Kensington and Chelsea."

## Implementation notes
- **Files:** `scripts/houses/trellick-tower.mjs`; `src/houses/trellick-tower/` (`layout.ts`, `site.ts`, `house.ts`, `interior.ts`,
  `landscape.ts`, `tower.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`, `worker.ts`);
  `trellick-tower/index.html`; `public/trellick-tower/`; the registry entry; `PAGES`; the shared test lists.
- **Engine:** `shadowReach` (optional) in `src/engine/house.ts`, read in `src/engine/scene/environment.ts`: the shadow box's half
  width, its depth and the sun's distance scale with it. Left out, they're exactly what they were (120, 600 and 300 ft). The
  tower sets 300.
- **The fit:** the three ways by ID at −23°, IoU 0.934. A rotation search over the first, rough rectangles settled 7° off
  (OSM draws the slab with its podium, 21 m deep), so the rotation is pinned from the slab's documented bearing and the
  rectangles were then set from OSM's outlines in that frame.
- **Large pieces:** the crosswalls, the tower's shaft and the fronts are laid in pieces up to 16 studs long and half a storey
  or a storey high. **41,179 pieces; 2:59 at 1×.**
- **The lot was tightened** to x −150…190, z −60…240: the occupancy grid is 910 plates tall, so its footprint decides the
  memory (about 49 MB in the build worker, the largest so far; not tried on a phone). The ground dips at the railway's side,
  so the grid starts 28 ft below the entrance level; A7 caught pieces below it.
- **The concrete** was first a light grey; photographs show a dark grey-brown, so it was darkened.
- **Tests:** `tests/trellick.test.ts` covers A1–A7, A9–A13; A8 is in `tests/buildOrder.test.ts`. A6 found Block B's top floor
  laid twice (as structure and as roof).
- **Manual checks** (a scripted Chrome window):
  - **A14 pass:** paused half a second before the roof phase, the frame, the service tower, the bridges and the fronts stand;
    no roofs, no mast, no trees.
  - **A15 pass:** the thumbnail and *Overview* show the slab, the separate tower with its slits, the ten bridges, the boiler
    house and Block B.
  - **A16 not properly checked:** the upper floors look shaded like the lower ones in the overview, but it wasn't compared
    with the default shadow box.
  - **A17 pass:** the card is live with its thumbnail and 41,179 pieces; the credits page lists it; the numbers panel says "tower".
  - **A18 partly checked:** *Overview* and *The bridges* open where they should. No roof, Walk and the phone controls weren't checked.
  - **A19 not measured.**
- **Thumbnail:** `/trellick-tower/?cam=-170,150,360,25,150,20&clean&date=2026-06-21`.
- **Claude usage** (spec 018): can't be split out for this building. The four commits for specs 060–063 landed within
  minutes of each other on 2026-11-11, after one stretch of uncommitted work, and the ledger splits usage by commit time.
  So nearly all of it went to the first of them (dae0fdb, spec 060). This building's own figure (0 replies) understates
  it badly.

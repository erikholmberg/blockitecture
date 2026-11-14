# 081 — The Schindler House

- **Status:** In progress (approved by Erik 2026-11-13, "Approved", with every recommended answer; built, the phone's touch controls not checked)
- **Owner:** Erik
- **House:** schindler-house
- **Created:** 2026-11-13
- **Commits:** none yet

## Goal
Rudolph Schindler's own house on Kings Road in West Hollywood (1922), also called the Kings Road House or the Schindler Chace
House. He built it for himself and his wife Pauline, and for their friends Clyde and Marian Chace, as one low building on a
100 × 200 ft lot. It has no living room and no bedrooms. Instead there's a studio for each of the four adults, a shared kitchen, a
guest apartment, and two "outdoor living rooms": lawns enclosed by the house and by tall hedges, each with an outdoor fireplace.
On the patio side, the walls are redwood frames with glass and sliding canvas panels. On the street and neighbour sides, the walls
are concrete slabs, cast flat on the floor slab and tilted up, with narrow slits of glass between them. On the roof, over the two
entrances, there are two "sleeping baskets": open redwood frames with canvas sides, where the households slept outdoors. It's
built block by block on its real lot, with the same viewer, and takes a new live card on the home page. On the dev shortlist
(`src/dev/shortlist.ts`) it's ★★★.

The site already has five Los Angeles houses and one other Schindler. This one differs from each in ways the blocks can show:
- **The Lovell Beach House** (spec 056) is Schindler's other building on the site: five poured concrete frames lift a stuccoed
  box above the sand. Here the concrete is **load-bearing wall slabs in a 4 ft rhythm**, with **light coming through the joints**,
  and the house sits **on the ground**: the floor slab is the foundation, and the rooms open level onto the lawns.
- **The Stahl House, the Sheats-Goldstein Residence and the Lovell Health House** (specs 000, 040 and 034) and **Ennis** (spec 025) sit
  on hillsides above the basin, with the city spread out below. **This is the site's first house on the LA flats**, on a city
  street with four-storey apartment blocks on either side. The city here is the street and the neighbours, not a view.
- **The Eames House** (spec 010) is the nearest in spirit: steel and glass in a meadow. Here, **the gardens are the rooms**. Over
  half the lot is lawn, hedge and bamboo, laid out as part of the plan.
- **It's a pinwheel**, not a box or a bar. Three L-shaped arms turn round a centre, and each arm wraps a garden.
- **It's the site's first house with canvas walls and sleeping places on the roof.**

## Research (2026-11-13)
**Status today:** the house is owned by the **Friends of the Schindler House** (FoSH), a non-profit. FoSH bought it in June 1980
from the California State Office of Historic Preservation, with a $160,000 state grant. Since 1994 the **MAK Center for Art and
Architecture** has run it as its headquarters, under an agreement with FoSH signed on 10 August 1994. The MAK Center is a satellite
of the MAK (the Museum of Applied Arts) in Vienna. It's open to visitors, with exhibitions, events and audio tours. Its protections:
- listed on the **National Register of Historic Places** on 14 July 1971 (NRIS **71000150**), nominated by Esther McCoy. An
  amendment changed the address to West Hollywood after the city was incorporated in 1984;
- on the **World Monuments Fund's Watch** in 2002, after which the MAK Center funded emergency work on the roof and a
  conservation plan.

FoSH's site calls the house a National Historic Landmark. No other source found says so, and Wikipedia doesn't list it as one, so
this spec doesn't claim it. The address is **833** North Kings Road in HABS, the NRHP and Wikipedia, and **835** on the MAK
Center's site. OSM has 833.

**Sources:**
- **Wikipedia** (*Schindler House*; wikidata **Q1932041**):
  - built from November 1921 to June 1922 for $12,550. Clyde Chace, an engineer and contractor, was the builder;
  - the house is just under 3,500 sq ft, on a lot of 20,000 sq ft;
  - "a flat concrete slab that serves as both foundation and final floor";
  - the walls are concrete tilt-up slabs, with 3-inch gaps between them filled with concrete, clear glass or frosted glass. The
    slabs form a solid back wall, and a more open screen at the front;
  - the plan is two interlocking L-shaped apartments, the Schindlers' and the Chaces', each of two studios joined by a utility
    room (the kitchen), plus a guest studio with its own kitchen and bath;
  - canvas panels slide across the openings;
  - the two rooftop sleeping baskets are "redwood four-post canopies with mitered beams", with canvas sides;
  - the Chaces left in 1924, and Richard and Dione Neutra lived in their half from 1925 to 1930. Schindler lived there until his
    death in 1953, and Pauline until hers in 1977;
  - a four-storey condominium by Lorcan O'Herlihy now stands next to it.
- **The Historic American Buildings Survey, HABS CA-1939** (Library of Congress `ca0254`, call number HABS CAL,19-LOSAN,68-; "no
  known restrictions"). It has 6 measured sheets and 6 data pages, measured in August 1969 by University of Southern California
  students. The drawings are "based on the architect's original drawings, corrected through field investigation and photographs".
  The sheets are: 1, the cover and a location map (from a Sanborn map, 1926 corrected to 1931); 2, an aerial isometric from the
  south-west; 3, the first-floor plan; 4, the second-floor and roof plan; 5, the four elevations; 6, sections A and B and a
  clerestory detail. All the plans have **north straight up**.
  - **Overall:** "about 80′ × 80′ (3,420 sq ft) × ca. 14′ high". The house follows a **four-foot module**. It's one storey, with
    "two single room masses projecting above the general roof line".
  - **The plan, sheet 3:**
    - **79′-4″ east–west**, made up of 19′-4″ (the garage) + 18′-8″ + 8′-0″ + 33′-4″ (the north-east wing);
    - **77′-8″ north–south**, made up of 16′-6″ + 18′-0″ + 2′-6″ + 26′-0″ + 14′-8″;
    - the south wing is 34′-8″ + 10′-0″ = **44′-8″** wide.
  - **The plan described:** "a superimposition of the letters J and T, the cross arm of the T on the north, the hook of the J
    facing west". The NRHP nomination calls it "a double L, with one L flipped". ArchDaily calls it "a three-bladed pinwheel". The
    rooms on the 1969 plan are:
    - the **north entrance**, the Chaces', with the stair to its sleeping porch inside the door;
    - the **south entrance**, Schindler's, with its stair outside;
    - the studios (Schindler's were architects' offices by 1969);
    - the kitchen; the guest room and its bath on the west;
    - the **garage** in the north-west corner;
    - a **"bedroom (new addition)"** in the guest apartment. The NRHP dates this to 1952, by Schindler.
  - **The two patios** (data pages): "The one on the east is enclosed on two sides by the house and the other two sides by tall
    hedges. The one on the west is enclosed on three sides by the house and the other side (west) is open." There's also a small
    concrete patio off the guest apartment. "All the terrace patios and the entry slabs are at the same level as the floor."
  - **The walls:** "reinforced concrete slabs which were poured atop the floor slab", "**8″ at the base** and taper to about
    **4″ at the top**; they are **45″ wide**. The **3″ space** between the slabs (4′ module followed) is filled either with narrow
    slits of glass or is filled with cement." Between the slabs are "3″ × …″ slits of frosted glass" (the length isn't legible in
    the scan). The rest of the walls are wood and glass. The upper rooms are frame, with vertical siding.
  - **The frame:** the bearing walls carry redwood beams, which carry 7″ tongue-and-groove roof boards. The boards are exposed as
    the ceilings, and the slabs are bare inside. Through the major rooms, double beams of 2¾″ × 5½″ run **6′-1″ above the floor**:
    the height of the openings and of the clerestory frame's foot.
  - **The windows:** on the patio sides, "a series of horizontal glass panels" on a 2 ft module, with clerestories above, and some
    skylights. "The sliding panels with glazed openings were originally covered with canvas."
  - **The roof:** flat, on one level, "with some lower levels which permitted the use of clerestory windows". It's covered in
    **green rolled roofing** in 3′-0″ widths, behind a redwood board cornice. Where there are clerestories, the cornice is three
    boards, one atop the next.
  - **The chimneys:** four masses of plain reinforced concrete. Three are on outside walls: at the south-east corner of the
    north-east wing, at the south-west corner of the north-west wing, and at the south-west corner of the south-west wing. Two of
    them have **a fireplace inside and one on the patio**. The fourth stands on the wall between the two halves. It's square, "**placed
    at a 45° angle** to the lines of the building", with copper panels over its fireplaces.
  - **The doors:** of laminated boards, 6′-1″ × 2′-10″, 2¼″ thick, with small glass lights. There are no built-in light fixtures.
  - **The foundation:** "About 8″ of the slab footing is exposed at the perimeter."
  - **The stairs:** the north stair is 18″ wide; the south stair, outside the entrance, is 22″ wide, with **10 risers of 8″ and one of
    2¾″** (6′-10¾″).
  - **The setting:** the house is "set back from Kings Road, which is on the east side of the lush green lot. Tall hedges serve as
    screening devices. The patios to the west and east are grassed, as are the **sunken gardens** adjacent to them. These areas are
    blocked from view by tall hedges." The driveway is "two parallel concrete strips" on the lot's north side, to the garage. A
    sidewalk runs along the lot's south side.
  - **The changes by 1969**, from the NRHP nomination:
    - glass instead of canvas in the north studios' sliding doors;
    - the sleeping porches closed in, with a small bathroom added to the north one;
    - plywood panelling in the two north studios;
    - the 1952 bedroom in the guest apartment, and a detached garage (carport) on the north side in 1965.

    "All changes in the house occur within the original shell", and the nomination says the house could be restored to the
    original.
- **Scaled from the HABS sheets** (the full-resolution TIFFs, 9,640 × 7,584 px at 400 dpi: 50 px to the foot at ⅛″ = 1′-0″.
  Checked against the 79′-4″ chain; ±0.3 ft):
  - **Section B** (north–south through the long east arm, sheet 6):
    - the main roof's top at **8.5 ft** above the top of the slab, and its ceiling at about **8.0 ft**;
    - under the sleeping porches, the entrance halls' ceiling at **6′-4″**, the porch floor at **7′-0″**, and the porch ceiling at
      **13′-4″** (all three dimensioned), with the porch roof's top at about **13.4 ft**;
    - glazing bars across the patio walls at about 1.3, 2.3, 3.3 and 4.4 ft;
    - the 45° chimney rises clear of the roof.
  - **The second-floor plan (sheet 4):**
    - the **north sleeping porch** is 2′-6″ + 8′-4″ + 4′-0″ = **14′-10″** wide and **12′-0″** deep, plus the later 7′-0″ bath to
      its north;
    - the **south sleeping porch** is L-shaped, 10′-0″ + 7′-0″ + 3′-4″ = **20′-4″** wide and 8′-6″ + 7′-9″ = **16′-3″** deep;
    - the roof outline overhangs the walls, with skylights and the 45° chimney on the roof.
  - **The plan's arms** (sheet 3; x east from the garage's west face, z south from its north face, in ft):
    - **the garage**, x 0–19.3, z 0–16.5, with the guest room south of it to z ≈ 37;
    - **the north-east wing**, x ≈ 34.6–79.3, z ≈ −3.8 to 16.8 (it stands about 3.8 ft north of the garage's face). It holds the
      north entrance, the north sleeping porch and the bedroom (the 1969 name), with its chimney mass at the south-east corner;
    - **the long east arm**, x ≈ 30.7–47.8, z ≈ 16 to 77.7, with the kitchens and the living rooms (the 1969 names);
    - **the south wing**, x ≈ 2.8–47.8, z ≈ 63 to 77.7, with the south entrance and the stair;
    - **the west patio**, about x 3–30 and z 37–63, open to the west. A row of square stepping stones runs down its west edge and
      along the garage's west side;
    - **the east patio**, east of the long arm and south of the north-east wing.
  - **The north and west elevations (sheet 5):** the main roof at about 9 ft and the upper rooms at about 14 ft, matching the
    section. The bands of clerestory glass run between the beam line and the roof. On the west elevation, the end slab is drawn
    leaning: the taper.
- **The NRHP nomination** (Esther McCoy, 1970; NPGallery):
  - "4-ft. lift-slab concrete panels, joined together with ribbons of glass or concrete";
  - the screen walls are "glass set in shoji-like frames of redwood, **sliding canvas doors** to outdoor living rooms, and a
    clerestory above";
  - "two redwood sleeping porches on the second level are vertical extensions of the wood construction at the two entrances …
    the sleeping porches overhang and protect the entrances";
  - "a 2-car garage is a buffer between the kitchen and separate 1-room apartment on the north-west";
  - "two private outdoor living rooms and several garden courts".
- **FoSH** (theschindlerhouse.org):
  - built February to June 1922, to a four-foot module and standardised "Slab-Tilt" walls;
  - the restoration's reference date is **6 June 1922**, the day it was completed. The first phase ended in 1987;
  - since then they have "stabilized the roof and **rebuilt the south sleeping porch**";
  - a Conservation Master Plan was due in 2025. It wasn't found online.
- **The MAK Center** (makcenter.org): it gives the address (835) and the "Slab-Tilt process", and shows a plan with the gardens
  (credited to FoSH, a gift of Mrs. Richard Neutra) and a 1924 street view, but gives no dimensions. A 2022 roof renovation closed
  the house from October to December (Beverly Press).
- **Secondary sources** (ArchDaily, Dwell, houseplans.com, EYRC):
  - the house "sits behind bamboo shoots", and privacy came "by means of bamboo and other plantings";
  - each courtyard has a fireplace and a garden next to it;
  - the 4 ft slabs are light enough for two men to tilt;
  - redwood beams rest on the concrete at one end and on wooden posts at the other.

  ArchDaily says FoSH restored the house "to its 1922 completion state".
- **OSM** (Overpass, 2026-11-13. overpass-api.de was over capacity, so the answers came from the private.coffee and kumi.systems
  mirrors, whose data dates from **2026-05-31**). Positions are in feet east (x) and north (y) of 34.08639 N, 118.37222 W, the
  Wikipedia coordinates:
  - **The house: way 391380962** (`building=house`, `name=Schindler House`, `wikidata=Q1932041`, `architect`, `historic=yes`,
    `start_date=1922`, `height=3.5`, `ele=69.4`). It's an LA County building-footprint import (`lacounty:bld_id`).
    - It covers only **165 m² (1,776 sq ft)**, about half of HABS's 3,420 sq ft. It's a stepped outline with 8 nodes, 48 × 61 ft
      (x −18.7 to 29.4, y −17.4 to 43.5).
    - Its edges run at **89.0° / 269.0°** and **179.1° / 359.1°**. That's within 1° of true north, and of HABS's "north up".
    - Its west block is 19.4 × 38.6 ft, which matches the garage and guest wing (19′-4″ × about 37 ft).
  - **way 391380944** (`building=yes`, unnamed), 26 × 20 ft (x 33.8 to 60.0, y 23.1 to 43.2), right next to the house. Its north
    edge lines up with the house way's. Together the two ways span **78.7 ft east–west**, against HABS's 79′-4″. So it's probably
    part of the north-east wing **[assumed]**.
  - Neither way covers the south wing. OSM's trace stops 17 ft south of the reference point, where HABS's plan runs about
    34 ft further.
  - **The museum: node 5182325745** ("Schindler House and Studio", `tourism=museum`, `alt_name=Kings Road House`, 833 North Kings
    Road, makcenter.org). There's also node 5182325746 (MAK Center, `amenity=arts_centre`) and the GNIS node 368167145.
  - **North Kings Road: way 13296725**, at **359.6°**, about 142 ft east of the reference point. The sidewalk on its west side
    (way 1418311375) is at about x 118.
  - **A private footway, way 534330929**, runs from the road to the house's north side along y ≈ 52, 128 ft long: the line of the
    driveway in HABS.
  - **The neighbours:**
    - to the north, **Kings West** (way 391380951, 851 N Kings Rd, 1981, 14.1 m), whose south face is at y ≈ 60;
    - to the south, **Habitat 825** (relation 6385162, ways 429102393/429102404, 825 N Kings Rd, 2007, 13.8 m), whose north face
      is at y ≈ −47. It's built round a courtyard, and is probably the O'Herlihy condominium Wikipedia mentions **[assumed]**;
    - across the road, **Kings Plaza** (ways 391380932 and 391380939, 1965) and Asteras Kings (way 1258098153);
    - to the west, small houses with OSM start dates of 1924–37, 4–10 m tall, on the next street.

    So the lot is about **107 ft between the neighbours' faces** and about **195 ft from x ≈ −77 to the sidewalk**: the 100 × 200 ft
    lot.
  - **Not in OSM:** the hedges, the bamboo, the lawns, the sunken gardens and any trees on the lot. Only two private pools turn up
    nearby, on other lots.
- **Terrain** (USGS 3DEP point queries, 1 m bare-earth DEM, 2026-11-13; the build will use the usual AWS tiles):
  - the house's reference point at **217.7 ft** (66.4 m). OSM's `ele` tag says 69.4 m;
  - **across the lot,** on a grid of 20 ft east–west by 15 ft north–south (99 points):
    - **the house's footprint and the ground north and east of it read 217–218.5 ft:** level within about 1 ft;
    - **a lower area west of the house** reads **213.9–215.1 ft**, about **3 ft below** the house. It runs from x ≈ −30 to the
      lot's west end, and from y +15 to −30. It meets the house's level in a sharp step between x −40 and −20, beside the west
      patio's open side. That fits a **sunken garden west of the west patio** **[assumed]**;
    - **a slight hollow east of the house**, south of the north-east wing (x 60–80, y 0 to −15), reads **216.0–216.5 ft**, about
      1–1.5 ft below the house. That's where the east patio and its garden are **[assumed]**;
    - **south of y ≈ −40, from x −80 to +20,** the ground reads **211.6–212.6 ft**, 5–6 ft below the house. That's on the line of
      Habitat 825's north face (y ≈ −47), so it's more likely that building's sunken courtyard or garage ramp than the lot
      **[assumed]**;
  - **round about:** the ground rises north into the Hollywood Hills (237.6 ft at 300 m, 389 ft at 1 km, 899 ft at 2 km) and
    falls gently south over the basin (202.6 ft at 300 m, 175.7 ft at 1 km, 134.5 ft at 3 km);
  - downtown Los Angeles is about 12 km away, at a bearing of about 110°.
- **Not obtained:**
  - **The 1922 state measured.** HABS drew the house in 1969, with the porches enclosed and the 1952 and 1965 changes. No measured
    drawing of the open sleeping baskets was found. Their form comes from the texts ("four-post canopies with mitered beams",
    canvas sides) and from the porches' 1969 footprints **[assumed]**.
  - **The sunken gardens' outline and depth.** HABS names them without drawing them. The MAK Center's plan with the gardens is shown
    only as a small picture. The terrain points suggest where they are, but at a 15–20 ft spacing they can't give their edges.
  - **The landscape's plants:** the hedges' species and height, and where the bamboo stands. "Bamboo and other plantings" and "tall
    hedges" are all that's documented.
  - **Each slit's fill,** glass (clear or frosted) or concrete, slab by slab. The elevations don't distinguish them at 1024 px, and
    the full scans weren't read slab by slab for this draft.
  - **The roof's lower levels and skylights** beyond what sheets 4 and 6 show. The clerestory detail (sheet 6) was looked at, but
    not scaled.
  - **The colours as numbers:** the concrete's grey, the redwood (unpainted in 1922; painted by 1970, per the NRHP), the canvas,
    the green roofing. They'll be sampled from photographs **[assumed]**.
  - **The original plan's names for the studios**, and which studio was whose. Only HABS's 1969 room names were read.
  - **Photographs** weren't examined in detail for this draft.

## Proposed approach
- **Data:** `scripts/houses/schindler-house.mjs`. The model's frame is HABS's plan: +x real east, +z real south, unturned like the
  Sheats-Goldstein Residence's (`rotationDeg` near 0; OSM's edges are 1° off true north). The fit is by way id (`fit.osmIds:
  [391380962, 391380944]`, spec 025's opt-in), because OSM's trace is partial (Q3). The fit's rectangles are the parts of HABS's
  plan that the two ways trace:
  - the garage and guest wing, 19 × 37 studs;
  - the band east of it to the north-east wing.

  There's a rotation search over −4…+2°. `exportSelf` exports the two ways for A2; `lotFeatures` brings in the neighbours and the
  footway. y = 0 is the top of the floor slab, at the tiles' reading in the house's footprint. The slab stands 2 plates (8″) proud
  of the ground round its edge.
- **The lot:** about **270 × 135 ft**. It runs from the next street's back gardens on the west, across Kings Road to the opposite
  sidewalk on the east, and from Kings West's south face to Habitat 825's north face. Kings West, Habitat 825 and Kings Plaza come
  from OSM as plain massing, with their OSM heights (about 14 m, against the house's 8.5 ft roof).
- **Scenery:** an urban flat, which no house has had yet. The defaults are the Stahl House's: the procedural city only below
  −300 ft, and the flats below −330. On a site only 80 ft above the basin floor, those would draw neither. So the proposal is
  `scenery: { chaparral: true, flatsBelow: 30, city: { maxY: 30 } }`. The city fills the flat ground beyond the 1,200 m of real
  data at about the house's own level, the flats read as built-up, and the Hollywood Hills to the north read as chaparral. The two
  figures will be tuned in the browser **[assumed]**. `downtownDir` is `realToModelDir(110, …)`.
- **The house** at `/schindler-house/` (in the state Q1 picks):
  - **the floor slab**, 79′-4″ × 77′-8″ over all, its 8″ edge exposed, with the entry pads and the guest apartment's small
    concrete patio at the same level;
  - **the tilt-up walls:** grey concrete slabs on the 4-stud module, with slits between them (Q2):
    - the solid back walls: the north-east wing's north and east walls, the long arm's east wall toward the street, the south
      wing's south wall, the garage, and the guest wing's north and west walls;
    - the more open "screen" walls of slabs, where HABS's plan shows them, round the patios;
    - each slab rises from the floor slab to the roof's underside, about 8 ft (20 plates) **[scaled]**;
  - **the four concrete chimney masses** at the documented corners, running unbroken from the ground to above the roof. The one
    on the partition wall is set at 45° as a stepped diagonal. The two patio chimneys each have an outdoor fireplace opening on
    the patio side;
  - **the redwood frame:** posts, the double beam line at 6′-1″ (15 plates) through the major rooms, and the roof beams;
  - **the patio walls:** redwood frames with bands of horizontal glass panels on a 2 ft module up to the beam line, with sliding
    panels of canvas (Q1) and **clerestories** above the beam line under the roof's lower levels;
  - **the two entrances**, at the indented corners, in redwood, under the sleeping baskets. There are laminated board doors
    (6′-1″ × 2′-10″). The north stair is inside the north door and the south stair outside the south entrance (11 risers to
    7′-0″);
  - **the two sleeping baskets:** redwood four-post frames with mitred beams, their floors at 7′-0″ (17–18 plates) over the
    entrances, which they overhang. They have canvas sides, rolled half down **[assumed]**, and a canvas or open top (Q1). Their
    footprints are the porches' on sheet 4: 14′-10″ × 12′-0″ on the north, and the 20′-4″ × 16′-3″ L on the south;
  - **the roof:** flat at 8.5 ft (21 plates), with lower levels over the clerestories. It's covered in green roofing, with the
    redwood board cornice (three boards where there are clerestories), the skylights from sheet 4 and the chimney tops;
  - **the garage** in the north-west corner, with its doors to the driveway;
  - **inside**, as blocky stand-ins **[assumed]** except where marked:
    - the four studios' built-in plywood cabinets and shelves [documented: HABS], with a desk or drafting table in each;
    - Schindler's drafting room, with two drafting tables (Neutra shared it, per the NRHP);
    - the shared kitchen's counters, sink and stove; the guest apartment's kitchenette, bath and bed;
    - the small bathrooms by each entrance;
    - the fireplaces' copper panels on the 45° chimney [documented: HABS];
    - floor cushions, low tables and chairs in the studios;
    - the mattresses in the sleeping baskets.
- **The landscape:**
  - **the west patio's lawn**, open to the west, with the row of square stepping stones;
  - **the east patio's lawn**, closed off by tall hedges on its east and south sides [documented: HABS];
  - **the two sunken gardens** next to the patios: about 3 ft down on the west and about 1.5 ft on the east (Q4);
  - **the tall hedges** round the gardens, about 8–10 ft **[assumed]**;
  - **the bamboo** screening the house from Kings Road, along the lot's street front **[assumed]**, as tall thin clumps of
    stacked round pieces;
  - **the driveway's two concrete strips** along the lot's north side to the garage, and the sidewalk along its south side
    [documented: HABS];
  - the front lawn and the street trees.
- **The usual extras:**
  - a thumbnail;
  - a live card, with its credits: HABS CA-1939 (Library of Congress), the NRHP nomination, OSM, AWS terrain tiles, Wikipedia;
  - its definition added to `DEFINITIONS` in `tests/buildOrder.test.ts`, and to the shared test lists (`cameraGround`, `credits`,
    `houses`, `viewsClear`, `shortlistBuilt`);
  - `npm run stats`.

**Build story** (roles per spec 012):
1. *The lot on Kings Road* (**site**): the flat ground, the street and the neighbours' lots, and the cut for the sunken gardens.
2. *The floor slab* (**foundation**): the one slab that's both foundation and floor, with its 8″ edge, the entry pads, the guest
   patio's slab and the chimneys' footings.
3. *The floors* (**floor**): the floor finish in the rooms and the hearths.
4. *Tilt-up slabs & the redwood frame* (**structure**). The slabs go up one by one along each wall in the 4 ft rhythm, with the
   gaps left open. Then:
   - the four chimney masses;
   - the redwood posts, the double beams at 6′-1″ and the roof beams;
   - the stairs;
   - the sleeping baskets' posts, beams and floors over the entrances.
5. *The studios* (**interior**): this goes in inside the open frame. It's the cabinets, the drafting tables, the kitchen, the
   baths, the fireplaces' copper panels, and the mattresses in the baskets.
6. *Glass, canvas & the clerestories* (**envelope**):
   - the glass and concrete fills in the slits;
   - the redwood-framed glass walls, the sliding canvas panels and the clerestories;
   - the doors, the garage doors and the frame partitions;
   - the baskets' canvas sides.
7. *The roof & the cornice* (**roof**): the roof boards and the green roofing, the lower clerestory roofs, the board cornice, the
   skylights and the chimney tops, and the baskets' tops. Nothing hangs from the roof: HABS found no built-in light fixtures.
8. *Lawns, hedges & bamboo* (**landscape**): the lawns in the patios and the sunken gardens, the stepping stones, the driveway
   strips, the hedges, the bamboo along the street, and the street trees.

**About 2½ minutes** (Q7), like the Lovell Beach House: a single storey of about 3,400 sq ft, with a garden as big again.

## Behavior
- **Home page:** a new live card, with its thumbnail and piece count. The thumbnail looks across the west patio's lawn, past the
  outdoor fireplace's chimney, to the redwood-and-canvas wall of the studios, with the south sleeping basket above it.
- **Viewer:** `/schindler-house/` works like the other houses: intro card, build, scrubbing, views, No roof, Walk, dusk lights, phone
  controls.
- **Views:**
  - *Overview*: over the lot from the south-east, with the pinwheel, its gardens, and the apartment blocks on either side;
  - *The west patio*: on the lawn, looking east into the open canvas wall, with the chimney and its outdoor fireplace (the
    thumbnail's camera);
  - *A studio*: inside one of Schindler's studios, toward the concrete back wall and the light in its slits, with the clerestory
    above the glass wall;
  - *The sleeping basket*: on the roof in the north basket, looking over the roofs to the hedges and the hills;
  - *From Kings Road*: on the sidewalk, through the bamboo to the slab walls;
  - *From above*: the three arms turning round the centre, and each arm's garden.
- **At dusk,** the slits glow as thin vertical lines in the concrete walls, and the clerestories and the canvas walls glow warm.

## Acceptance criteria
**House**
- **A1** [unit] The plan is 79′-4″ east–west and 77′-8″ north–south over all, and the south wing is 44′-8″ wide (each within
  1 ft). The arms enclose two patios. The west patio is enclosed by the house on its north, east and south, and open to the
  west. The east patio is enclosed by the house on its north and west, and by hedges on its east and south.
- **A2** [unit] OSM's ways 391380962 and 391380944 fall at least 85% inside the model's footprint. The model's walls run within
  1.5° of the ways' 89.0° / 179.1° edges. The model's footprint lies wholly between Kings West (way 391380951) and Habitat 825
  (relation 6385162), and west of the Kings Road sidewalk.
- **A3** [unit] Tilt-up walls: every concrete wall is laid as slabs on a 4-stud module, with a slit between each neighbouring pair
  (Q2). Each slit holds glass (clear or frosted) or concrete, never nothing. Every slab rises from the floor slab to the roof's
  underside (8 ft, within 0.5 ft). There are at least 40 slits in all, and at least a third of them are glass.
- **A4** [unit] Heights: the main roof's top is at 8.5 ft and the double beam line at 6′-1″ (each within 0.5 ft). There are
  clerestories between the beam line and the roof along both patios. The entrance halls' ceilings are at 6′-4″ and the baskets'
  floors at 7′-0″ (each within 0.5 ft). The south stair has 11 risers.
- **A5** [unit] The sleeping baskets: there are two, over the north and the south entrances, on four or more redwood posts. The
  north one is 14′-10″ × 12′-0″ and the south one 20′-4″ × 16′-3″ (each within 1 ft), and each overhangs its entrance. In the
  state Q1 picks, their sides are canvas, and the north one has no bathroom.
- **A6** [unit] The chimneys: there are four plain concrete masses at HABS's corners, each rising above the roof. The one on the
  partition wall is a 45° stepped diagonal. Two of them open a fireplace onto a patio.
- **A7** [unit] The patio walls are redwood frames with glass and with sliding canvas panels (Q1): at least one canvas panel on each
  studio's patio side. The floor slab's edge stands 2 plates proud of the ground, and the patios' lawns are level with the floor.
- **A8** [unit] Colours: the slabs and chimneys are one concrete grey, the frame, doors and cornice one redwood, the panels and the
  baskets' sides one canvas white, and the roof green.
- **A9** [unit] Every element is marked **[documented]**, **[scaled]** or **[assumed]**, with at least 10 marks in the interior. The
  baskets' form, the furniture and the plants are marked **[assumed]**.

**Site**
- **A10** [unit] The lot terrain meets the real terrain at its edges. The lot is flat within the real readings: every lot cell within
  30 ft of the house, outside the sunken gardens, is within 2 ft of the slab's level.
- **A11** [unit] No terrain spikes (the spec 010b check).
- **A12** [unit] The definition opts into the urban scenery (`city.maxY`, `flatsBelow` and `chaparral` as tuned). The other houses'
  scenery, models and timelines are unchanged.
- **A13** [unit] The landscape: two sunken gardens below the patios' lawns (Q4), hedges at least 8 ft tall round the east patio,
  bamboo along the street front, the driveway's two strips along the north side, and Kings West and Habitat 825 as massing at
  their OSM heights.

**Model and build**
- **A14** [unit] The model invariants hold: no overlaps, inside the grid, deterministic. Every phase is used, and the build takes
  about 2½ minutes.
- **A15** [unit] `tests/buildOrder.test.ts` covers it: phases in role order, nothing floats, nothing dropped.
- **A16** [unit] The home card is live, with the real piece count, its credits, and the disclaimer from Q6.

**Manual** (in `npm run dev`)
- **A17** [manual] Play the build. The slabs stand in their 4 ft rhythm with open gaps before any glass. The studios are furnished
  inside the open redwood frame. The canvas and glass go in before the roof, and the lawns, hedges and bamboo come last.
- **A18** [manual] The thumbnail and *The west patio* read as the classic photographs: the lawn, the outdoor fireplace's chimney,
  the low redwood-and-canvas wall with its clerestory, and the basket above.
- **A19** [manual] From outside, the slab walls read as separate slabs with light between them, not as one wall with stripes. At
  dusk the slits glow.
- **A20** [manual] *A studio* shows the bare slabs, their slits and the clerestory. *The sleeping basket* shows the roofs, the gardens
  and the neighbours' blocks round them.
- **A21** [manual] The scenery reads as the LA flats: built-up ground and the city beyond the real neighbourhood, and the Hollywood
  Hills to the north, with no city on the hills.
- **A22** [manual] All views, No roof, Walk and the phone controls work. The home page shows the new card live, with its
  thumbnail, and the credits page lists the house.
- **A23** [manual] Performance stays within the Stahl House's numbers at `?dpr=1.75`.

## Out of scope
- **The later changes**, if Q1 picks 1922:
  - the 1952 bedroom in the guest apartment and the 1965 carport;
  - the porches' enclosure and the north bath;
  - the plywood panelling;
  - today's paint.
- **The slabs' taper** (8″ to 4″) and the slits' true 3″ width: both are finer than a stud (Q2).
- **The 1922 neighbourhood.** The lot is shown among today's neighbours, as every house on the site is. The Dodge House across the
  road (Irving Gill, demolished 1970) isn't rebuilt.
- **The furniture's real forms,** including Schindler's own pieces: the furniture is blocky stand-ins.
- **The exact planting:** the species, and each hedge's and clump's real line.
- **The roof's drains, the water pipes** HABS found running across the roof, and the wall heaters.
- **The MAK Center's exhibitions and installations,** and the 2022 roof work as such.

## Open questions
- [x] **Q1: Which state?** *Recommended: as completed on 6 June 1922*, the date FoSH's restoration aims at. It would be built from
  HABS's 1969 measurements, with the changes the NRHP lists taken out:
  - canvas in every sliding panel;
  - the sleeping baskets open, with canvas sides on redwood frames, and no north bath;
  - no 1952 bedroom and no 1965 carport.

  The NRHP says all the changes are "within the original shell", so the shell, the slabs, the roof and the plan are all HABS's.
  Only the baskets' form is [assumed]. That's the house in every history of it, and the one the restoration is bringing back.
  - *Alternative, as HABS measured it (1969):* the porches enclosed, with the north bath, glass in the north studios, the 1952
    bedroom and the carport. Everything is documented, but it isn't the house anyone pictures.
  - *Alternative, as it stands today:* the south porch has been rebuilt, but nothing found says how the north porch, the canvas
    or the gardens stand now, so most of it would be [assumed].
- [x] **Q2: Slits and slabs in studs.** The real slabs are 45″ wide with 3″ joints, and taper from 8″ to 4″. The grid is 1 ft.
  *Recommended: 3-stud slabs with 1-stud slits on the 4-stud module.* Each slit is filled with clear glass, frosted (white
  translucent) glass or concrete, following the elevations. The walls are 1 stud thick, with no taper. The slits come out four
  times too wide, but the rhythm of slab and light is the house's signature, and it reads from every view. The glass is drawn as a
  thin panel inside its cell.
  - *Alternative:* 4-stud slabs with no gaps, the joints only marked by a darker concrete in every fourth column. That's truer to
    the solid back walls, but it loses the light, which is the point.
  - *Alternative:* the slits only where HABS shows glass, with the concrete-filled joints closed solid. This halves the openings,
    but needs each slit read from the full scans first.
- [x] **Q3: Fitting a partial OSM outline.** OSM's way 391380962 covers about half the house, and way 391380944 probably another
  piece of it. Neither covers the south wing. *Recommended: fit both ways by id* against only the rectangles of HABS's plan that
  they trace: the garage and guest wing, and the north band through to the north-east wing. Then check that the whole model sits
  inside the lot between the neighbours (A2). The rotation stays near 0°, as OSM's edges and HABS's north arrow agree. The
  *alternative* is to place the model by hand from the lot lines and Kings Road. That's simpler, but it isn't checked against
  anything traced.
- [x] **Q4: The sunken gardens.** HABS names them, next to the two patios, but draws neither. The 3DEP points show a level area
  about 3 ft below the house to the west, and a hollow of 1–1.5 ft to the east (Research). *Recommended: two level sunken lawns,
  following those readings* [assumed]:
  - one west of the west patio, beyond the stepping stones, 3 ft (7–8 plates) down, in steps of 2 plates;
  - one south-east of the east patio, inside its hedges, about 1.5 ft (4 plates) down.

  Their edges run on the house's 4 ft module.

  The MAK Center's garden plan (FoSH, gift of Mrs. Richard Neutra) would settle where they are and how deep: if you can get a
  readable copy, I'd follow it. The *alternative* is to leave them out and keep the gardens level. That's simpler, but it drops a
  documented feature.
- [x] **Q5: Neighbours.** *Recommended: today's*, from OSM as plain massing: Kings West to the north and Habitat 825 to the south,
  both about 14 m tall. Every house on the site stands among today's neighbours. Here, the blocks pressing on the gardens are also
  part of the house's modern story: they're why Gregory Ain argued it should be moved to the desert. The *alternative* is to clear
  the two lots and show low 1920s houses there. That matches Q1's 1922, but it's invented, since no source maps them beyond the
  1926–31 Sanborn outlines on HABS sheet 1.
- [x] **Q6: Disclaimer.** *Recommended:* "Fan tribute. Not affiliated with the Friends of the Schindler House or the MAK Center for
  Art and Architecture." FoSH owns the house, and the MAK Center runs it and its tours. Naming both, as the Eames House's card
  names the Eames Office and the Eames Foundation, makes clear the tribute isn't theirs. The *alternative* names FoSH alone, as the owner.
- [x] **Q7: Timing.** *Recommended: about 2½ minutes*, like the Lovell Beach House: one storey on a 100 × 200 ft lot, with the
  slabs' rhythm the longest part to watch. The *alternative* is about 3 minutes, if the slabs going up one by one should be
  savoured.

## Implementation notes
- **Files:** `scripts/houses/schindler-house.mjs`; `src/houses/schindler-house/` (`model/layout.ts`, `site.ts`, `house.ts`,
  `interior.ts`, `landscape.ts`, `schindlerHouse.ts`, `lotTerrain.ts` (generated), `phases.ts`, `definition.ts`, `main.ts`,
  `worker.ts`); `schindler-house/index.html`; `public/schindler-house/` (`neighborhood.bin`, `thumbnail.jpg`);
  `tests/schindlerHouse.test.ts`; the registry entry; `PAGES`; the shared test lists (`buildOrder`, `cameraGround`, `credits`,
  `houses`, `shortlistBuilt`, `viewsClear`); `src/houses/stats.ts` (`npm run stats`); `scripts/fetch-neighborhood.mjs` (one
  opt-in, below). `public/og-image.jpg` not remade.
- **The fit (Q3):** both ways by id (`fit.osmIds: [391380962, 391380944]`), against the four rectangles of the plan they trace
  (the garage and guest wing, the band east of it to the long arm, the long arm's middle, the north-east wing's east end).
  Rotation search −4…+2°: best **0°**, offset (19, 43) ft, **IoU 0.911**. The model frame is HABS's (x east from the garage's
  west face, z south from its north face), unturned; the ways' edges run within 1.5° of its axes, and each way is at least 85%
  inside the model's footprint (A2). y = 0 is the top of the slab, at the tiles' reading there
  (64.4 m; 3DEP's point query gave 66.4 m).
- **Data opt-ins:** `exportSelf` (the two ways, for A2), `lotFeatures` (Kings Road comes back as `LOT_ROADS`; no building is
  centred on the lot, so `LOT_BUILDINGS` is empty), and a new one, **`buildingRelations`**: Habitat 825 is a multipolygon of
  untagged ways, so `way["building"]` never saw it and the neighbourhood had a hole south of the lot. With the opt-in the script
  also fetches `relation["building"]` and adds each relation's outer rings as buildings with the relation's tags (no
  courtyards). Off for every other house, so their data is untouched. Kings West (14.1 m) and Habitat 825 (13.8 m) come out at
  their OSM heights within 1 ft (A13).
- **The lot:** x −60…190, z −16…90 (250 × 106 ft): from the back gardens on the next street to the far sidewalk of Kings Road,
  and exactly from Kings West's south face (z −17) to Habitat 825's north face (z 90), so neither neighbour is cut. The spec's
  "about 270 × 135" would have run into both. Kings Road is OSM's line with a 36 ft carriageway and 8 ft sidewalks [assumed].
  The north edge is only 16 ft from the house, so the ground meets the real level there in a short bank (4 ft instead of the
  usual 12) and the driveway stays level.
- **The plan:** 79 × 78 studs over all, the south wing 45 (A1). Arms: garage 20 × 18, guest wing x 0–31 z 17–37, north-east wing
  x 31–79 z 0–20, long arm x 31–48 z 20–78, south wing x 3–48 z 63–78. **The north-east wing's north face is in line with the
  garage's**, as OSM's two ways show; the Research's scaled "3.8 ft north" would make the plan 81½ ft deep against HABS's 77′-8″
  chain. Rooms [assumed where not in the Research]: the Chaces' two studios in the north-east wing round the east patio,
  Pauline's in the long arm and Rudolph's drafting room in the south wing round the west patio, the shared kitchen between the
  halves, the guest room with its kitchenette and bath, a small bath by each entrance.
- **Walls (Q2):** 9 concrete runs of **67 slabs** (3 studs; a run's last slab takes a would-be end slit, so a few are 4) and
  **60 slits**: 20 clear glass, 19 frosted, 21 concrete (65% glass). Each slab is one piece, 20 plates (8.0 ft) high, so they go
  up one by one in the structure phase with the gaps open; the fills go in with the envelope. The patio walls are redwood posts
  every 4 ft with alternating bays of sliding canvas (0–6′-0″) and horizontal glass with redwood bars at 1.2, 2.4, 3.2 and 4.4 ft,
  the double beam at 6′-0″ and clerestory glass above it to the roof. The frosted slits and the canvas panels are drawn as lit
  pieces, so at dusk they glow with the rooms' light (the Behavior's "slits glow as thin vertical lines").
- **Heights:** slab top / roof underside 20 plates (8.0 ft); roof boards and green roofing to 22 (8.8 ft); beam line 15
  (6.0 ft); entrance halls' ceilings 16 (6.4 ft); the baskets' floors 18 (7.2 ft); their mitred beams' top 33 (13.2 ft) under a
  canvas top; the lower roofs over the patio sides at 17 (6.8 ft), 3 ft out; chimneys to 26 (the 45° one to 28). Both stairs have
  11 risers to 18 plates.
- **The entrances and baskets:** the north entrance is the north-east wing's redwood-and-glass west front onto the guest patio,
  its door under the north basket (15 × 12), with the 1-stud stair inside rising through a hole in the basket's floor. The
  south entrance is at the west patio's south-east corner: its door in the south wing's patio wall under the south basket's
  overhang (an L, 20 × 16), the 2-stud stair outside along that wall [assumed: the Research didn't place the door or the stair's
  line]. The baskets' sides: redwood boards from the floor to the roof's level, open above, and canvas rolled down 2 ft from the
  beams [assumed], open where the south stair arrives.
- **Chimneys (A6):** 4 × 4 or 4 × 5 masses at the north-east wing's south-east corner and the guest wing's south-west corner (each
  with a fireplace inside and one on its patio), the south wing's south-west corner (inside only), and the 45° diamond (rows 2, 4,
  6, 6, 4, 2) on the kitchen/studio partition, with a fireplace and copper panel on each side.
- **Gardens (Q4):** the patios' lawns level with the floor; the west sunken garden x −44…−12, z 28…72, stepping down 2 plates a
  stud to 8 plates (3.2 ft); the east one x 80…100, z 24…56, to 4 plates (1.6 ft), inside the east patio's hedges. Hedges 25 plates
  (10 ft); bamboo clumps along x 118–128 with a gap for the driveway; the driveway's two 2-ft strips and the south sidewalk;
  six street trees and four garden trees [assumed].
- **Scenery:** `{ chaparral: true, flatsBelow: 30, city: { maxY: 30 } }` as proposed: from above the lot the hills to the north
  read as chaparral with only the real (OSM) houses on them, and the city runs to the horizon over the flats to the south.
- **Numbers:** **8,185 pieces** (2,353 the house; site 2,414, foundation 355, floor 148, structure 645, interior 209, envelope
  516, roof 480, landscape 3,418); **2:35** at 1× (154.7 s). Flat terrain packs into 8 × 8 pieces, hence the low count.
- **Tests:** `tests/schindlerHouse.test.ts` covers A1–A16 (A15 checks `tests/buildOrder.test.ts`). A15 and A16 failed first for
  the right reasons (not in `buildOrder`, no registry entry); the model's tests were written alongside it and caught the
  north-east wing's slits blocked by roof beams (beams now only over the rooms), the guest chimney standing into the west
  patio's open side, the diamond centred off the half-stud (rows 2, 4, 6, 4, 2) and the ground a plate high by the north edge.
- **Thumbnail:** `/schindler-house/?view=patio&clean&dpr=1&date=2026-03-21`, 1200 × 675, headed Chromium on the GPU; the same
  camera is *The west patio*.
- **Manual checks** (Playwright's Chromium on this machine, `npm run dev` on port 5197; the machine was loaded by three other
  builds):
  - **A17 pass:** at 0:48 the slabs stand along the walls with open gaps and the redwood posts, no glass and no roof; at 1:20 the
    studios are going in under the open beams; at 1:45 the glass and canvas are going in with no roof; at 2:05 the roof boards
    are going on while the patios are still bare soil; the lawns, hedges and bamboo come last (2:22).
  - **A18 pass:** the thumbnail and *The west patio* look across the lawn and the stepping stones, past the guest wing's chimney
    with its outdoor fire, to the redwood frame with canvas and glass bays and the clerestory, the south stair, and the south
    basket above it.
  - **A19 pass:** from the east patio the long arm's street wall reads as separate grey slabs with light between them; at dusk the
    frosted slits glow as thin white lines and the canvas panels glow.
  - **A20 pass:** *A studio* (Rudolph's) shows the bare slab wall and its slits on the left, the patio wall with its clerestory on
    the right, the drafting tables and the chimney ahead. *The sleeping basket* looks out between the side boards and the canvas
    over the roof, the hedges and the bamboo to the neighbours' blocks; the canvas makes it a narrow view.
  - **A21 pass:** looking north, the Hollywood Hills read as chaparral beyond the real neighbourhood; looking south, the city fills
    the flats to the horizon.
  - **A22 partly checked:** all six views open from the views menu; No roof cuts the roof and shows the rooms; Walk starts on the
    west patio and walks; the home page shows the live card with its thumbnail and 8,185 pieces; the credits page lists the house
    with its disclaimer and sources; no console errors. On an iPhone 13 emulation the page loads and shows the finished house, but
    the touch controls weren't exercised.
  - **A23 pass (this machine's GPU):** with `?debug&dpr=1.75`, orbiting the finished house: 60 fps, 1,522,866 triangles, 12 calls;
    the Stahl House at the same settings: 60 fps, 1,885,078 triangles, 14 calls.
- **Changed from the spec's text:** the north-east wing in line with the garage (above); the lot 250 × 106 ft, not 270 × 135;
  `buildingRelations` added to the data script for Habitat 825; the south entrance's door and stair placed on the west patio;
  the frosted slits and canvas drawn as lit pieces; *A studio* is Rudolph's south-wing studio.
- **Usage (spec 018):** not available yet: `npm run usage` reads 0 transcripts on this machine and counts per commit, and this
  work isn't committed.

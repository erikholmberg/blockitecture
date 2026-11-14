# 080 — Centre Pompidou

- **Status:** In progress (approved by Erik 2026-11-13, "Approved", with every recommended answer; built, the phone check and Erik's review of the deviations open)
- **Owner:** Erik
- **House:** centre-pompidou
- **Created:** 2026-11-13
- **Commits:** d0320d3

## Goal
Renzo Piano and Richard Rogers's Centre Georges Pompidou (1971–77) on the Plateau Beaubourg in Paris: the national museum of
modern art, a public library and an exhibition centre in one steel cage, 166 m long. The structure, the pipes and the escalators
are all on the outside, so the floors inside are open from end to end. The pipes on the rue Beaubourg side are painted by what
they carry: blue for air, green for water, yellow for electricity and red for moving people. Up the west front, a glass tube
holding the escalators, the "caterpillar" (*la Chenille*), zigzags over a sloping piazza. It's built block by block on its real
site, with the same viewer, and takes a new live card on the home page. On the dev shortlist (`src/dev/shortlist.ts`) it's ★★★
(`fit: 3`).

The site has several large non-house buildings already (spec 059). This one differs from each in ways the blocks can show:
- **The Neue Nationalgalerie** (spec 057) is also a steel-and-glass museum, but it's one hall under a black roof on eight
  columns, with the structure kept quiet. **Here the structure is the façade:** 28 white columns, 168 cast-steel brackets
  (*gerberettes*), tie rods and cross-bracing, all outside the glass.
- **Trellick Tower** (spec 061) moved its lifts into a separate tower. **Here the services hang on the outside of the building
  itself**, one side for ducts and one for people, and they're coloured by what they do. It's the first building on the site
  that's mostly colour-coded pipes.
- **Habitat 67** (spec 072) and **the Bauhaus Dessau** (spec 076) are large, but they're boxes and glass curtain walls. **This is
  the first "high-tech" building on the site,** and the first whose escalators run outside, in a glass tube up the front.
- **It's the first building in Paris itself** (the Villa Savoye, spec 074, is in Poissy). The city round it is the densest yet: six-
  and seven-storey stone blocks of the Marais and Les Halles on every side, mapped building by building in OSM.
- **The piazza.** Half the site is a public square that slopes down to the building's entrance. The ground under a building has
  never sloped *toward* it before.

## Research (2026-11-13)
**Status today:** the building belongs to the French State and is run by the *Centre national d'art et de culture
Georges-Pompidou*, a national public body under the Ministry of Culture (en.wikipedia: 64.2% of its 2012 budget came from the
Ministry). Its president is Laurent Le Bon (since 2021). Its protections and labels:
- **"Architecture contemporaine remarquable"** since 2016 (Mérimée **ACR0000721**; Wikidata P1435). That's a label, not a
  listing: the building is **not** a *monument historique*. fr.wikipedia also gives it the *Musée de France* label.
- It sits among listed buildings: many of the blocks round the piazza and rue Saint-Merri are *inscrits* (OSM's `ref:mhs` tags),
  and the Église Saint-Merri to the south is *classé*.

**It's closed for works.** The museum and the library (Bpi) closed in March 2025 and the whole building at the end of September
2025, for a renovation planned to last until **2030** (centrepompidou.fr, "Renovation programme"; OSM's way carries
`end_date=2025-03-02`, `opening_date=2030-01-01`):
- the work: asbestos removal from all façades and the replacement of the large windows, fire safety, accessibility, energy, new
  power and fluid networks, corrosion treatment of the structure, new lifts and Forum escalators;
- the cultural side by Moreau Kusunoki with Frida Escobedo, the technical side by AIA Life Designers;
- new terraces on the piazza's north side, a ramp on the south side, and a public roof terrace on level 7's north side; the
  escalators leading to the Chenille move east in the Forum. Nothing found says the Chenille itself changes;
- the timetable's start of works differs between the Centre's pages: "April 2026" (the English programme page) or hoardings and
  scaffolding from January 2026 with "general works from autumn 2026" (the French neighbours' page);
- the budget is given as €262 million (announced 2023), €200 million and €186 million (the 2024 works contract) in different
  sources.
- **The state of the site today wasn't found.** No reporting from 2026 on scaffolding, wrapping or fencing turned up, and no
  recent photograph was examined. See Q1.

**Sources:**
- **en.wikipedia** (*Centre Pompidou*; wikidata **Q178065**), its "Building specifications" table:
  - **166 m long, 60 m wide**; height **42 m** on the rue Beaubourg side and **45.5 m** on the piazza side;
  - 7 levels above ground and 3 below (18 m deep, 180 × 110 m); 103,305 m² of floor;
  - 15,000 t of steel, 50,000 m³ of reinforced concrete, 300,000 m³ of earthworks;
  - 11,000 m² of façades and glass, 7,000 m² of opaque surfaces;
  - the colour code: green for plumbing, blue for climate control, yellow for electricity, red for circulation and safety;
  - before the 1997–2000 renovation, 20% of the eight million yearly visitors rode the outside escalators to the top.
- **fr.wikipedia** (*Centre Pompidou*):
  - 166 m long, "45 m (60 m with the outside escalator)" wide, 42 m high ("52 m on the piazza side"). Its 45 m is the trusses'
    length (below) and its 52 m disagrees with every other source;
  - storeys of **7 m**, except the Forum's **10 m**;
  - the colours: blue for air conditioning, green for water, yellow for electricity, red for the lifts, and **white for the
    ventilation ducts of the underground levels**;
  - the outside escalators "cross the façade in a zigzag".
- **The Centre's own teaching page** (*L'architecture du Centre Pompidou: structure et modules*):
  - **14 portal frames 12.80 m apart**, so **13 bays** (13 × 12.8 = 166.4 m);
  - **28 columns, 49 m high, 85 cm in diameter**, hollow, in three welded sections (once filled with water for stiffness and fire
    protection; the Centre's magazine says water and glycol, replaced in the early 2000s by a coating);
  - **84 beams of 45 m, 75 t each** (six levels of trusses, 14 × 6 = 84);
  - **168 gerberettes, 8 m long, 10 t each**, made by Krupp-Stahlbau (14 frames × 2 sides × 6 levels = 168);
  - **St Andrew's crosses fixed on the gerberettes' noses, two levels high**; tie rods of **22 cm** diameter as counterweights;
  - each glazed bay is 7 m high; the **west façade is transparent and the east façade opaque**; the steel is painted white;
  - 166 × 60 × 42 m.
- **Mérimée ACR0000721** (the label's record):
  - "un parallélépipède de 166 m de long pour 60 m de large et 42 m de haut";
  - beams 12.80 m apart, **only 2.50 m deep for a 48 m span**; fourteen portals; castings 16 cm thick; 65% of the steel cast,
    turned or forged; erected in ten months in 1975;
  - the substructure 166 × 122 m in concrete, the superstructure **166 × 70.45 m** in steel and glass (wider than the 60 m:
    perhaps with the escalator and the duct zone; not explained);
  - the piazza a "vaste esplanade inclinée"; the stairs outside, in the open air;
  - IRCAM: the **1990 tower, 728 m² and 25 m high**, and the old Jules-Ferry and Bains-Douches school buildings (1,969 m²);
  - the colours: red for circulation and walkways, blue for air conditioning, green for water and fire safety, yellow for power.
- **RPBW's project page** (rpbw.com): 7 floors above ground and 3 below; "huge 48 m warren trusses span the full width", each
  joined to the columns by a cast-steel gerberette; floors of about 50 × 170 m clear; the services on the rue Beaubourg front,
  "blue for air, green for water, yellow for electricity and red for vertical circulation"; the lifts and escalators on the
  piazza front, the escalators "zig-zagging through transparent tubes"; half the 2 ha site is the piazza, which "gently slopes
  down to the lower-ground-floor entrance hall". The Fondazione Renzo Piano also gives the gerberette as 8 m and 10 t (one
  secondary source, tboake.com, says 11 t).
- **en.wikipedia** (*Stravinsky Fountain*): by Jean Tinguely and Niki de Saint Phalle, inaugurated 16 March 1983; **16
  sculptures** (Tinguely's in black, Saint Phalle's brightly coloured); a shallow basin of **580 m²** over some of IRCAM's rooms.
- **OSM** (API 0.6 map call, 2026-11-13; Overpass was at capacity). Bearings are true; the frame below is *u* along the long axis
  toward 19.8° (north-north-east) and *v* across it toward 109.8° (east-south-east), from 48.8606 N, 2.3522 E:
  - **The building is way 55503397** ("Centre Georges Pompidou", `building=civic`, `height=42`, `start_date=1977`,
    `wikidata=Q178065`, architects Piano, Rogers, Franchini and Alain). It has no `building:part`s and no `building:levels`.
    - 20 nodes, 10,245 m². Its smallest bounding box is **167.3 × 66.0 m** at 19.8°.
    - The **west (piazza) edge is one straight line of 167.3 m at 199.8°**; the south end runs at 289.8° for 61.6 m; the north
      end at 108.6°. So the long sides lie at **19.8° / 199.8°** and the ends at **109.4° / 289.8°**.
    - In (u, v): u −84.7…82.5 (167 m), v −11.7…49.8 (**61.5 m**). Two oddities: a 12 × 4.6 m block juts west at the north-west
      corner (u 54.8…66.9, v to −16.2), and the north end's west part is set back about 2 m (u 63.7…81.5). **Not identified**;
      they may be the stair or the entrance canopy.
  - **Place Georges-Pompidou** (the piazza) is relation **556816** (`highway=pedestrian`, `surface=sett`, `wikidata=Q3389839`),
    outer way **55507605**: 10,115 m², u −73.6…95.5 by v −69.8…−2.7, so about **169 × 67 m**, as long as the building. Its east
    edge runs at v ≈ −3, about **8.5 m inside the building's west line**: the piazza is traced on under the overhang to the
    glass. Its south-west corner is cut at an angle along rue Saint-Merri.
  - **Seven ventilation stacks** on the piazza are inner ways of the piazza's relation (55503398, 55503400, 55507598, 55507602,
    55507603, 55507610, 55507612): `man_made=chimney`, `chimney:type=ventilation`, `height=7` (sourced "bing; extrapolation,
    survey"), each about **2.4 m across**. They stand in a line along the piazza's west side (v ≈ −65), mostly in pairs, at u
    53.3, 49.6, 15.1, 11.4, −23.4, −26.8 and −58.1. These are the white "trumpet" vents of the underground levels.
  - **The Atelier Brancusi**, way **55503399** (`building:levels=1`, `roof:shape=gabled`, `wikidata=Q60058273`): 23 × 24 m at
    the piazza's north-west corner (u 67…90, v −57…−33). The Centre's neighbours' page says the Maison Pompidou opens in the
    former Atelier Brancusi building on 13 February 2026.
  - **The Stravinsky Fountain** is way **88301107** (`natural=water`, `water=basin`, `height=0.75`, `start_date=1983`,
    `wikidata=Q281309`): **36.0 × 18.1 m**, 650 m² (Wikipedia: 580 m²), its long sides at 28.1°. Its rim is relation 3505086
    (`building=service`, `height=0.5`, outer way 261061264, 37 × 19 m). It lies **30–68 m south of the building's south end**
    (u −153…−115), roughly in line with the west front (v −19…4), in **Place Igor-Stravinsky** (relation 1308199, outer way
    22674199, 2,621 m²).
  - **IRCAM** is only a node (855292325, `amenity=college`, `wikidata=Q579314`) at u −98, v −28, south-west of the building's
    south-west corner. The building ways near it (55750706: 34 m², 5 levels; 55750713: 175 m², 4 levels; 55750745: 231 m², 4
    levels) carry no name or height, so **Piano's 1990 tower isn't identified in OSM**. Seven more ventilation stacks
    (ways 202498507–202498514) and a glass roof (way 227834262, `layer=1`) on Place Igor-Stravinsky serve IRCAM's underground
    rooms.
  - **The streets:** rue Beaubourg (ways 1105156310, 56257425; `highway=secondary`) along the east front at v ≈ 64, about
    **14 m east** of the building; rue du Renard continues it south. Rue Saint-Martin (pedestrian) along the piazza's west side at
    v ≈ −75; rue Rambuteau (pedestrian here) along the north at u ≈ 96; rue Saint-Merri (pedestrian) along the south at u ≈ −95.
    An underground car park (`Parc Beaubourg`) has its entrance on rue Beaubourg.
  - **Round about:** the blocks are mapped from the cadastre, nearly all with `building:levels` (mostly 5–7, some 9), many of them
    multipolygons with courtyards. The Église Saint-Merri (way 55742120, `heritage=2`) is about 100 m south.
- **Terrain:**
  - **IGN RGE ALTI** (the Géoplateforme altimetry API, 2026-11-13, bare ground): the piazza's west edge on rue Saint-Martin at
    **36.0 m**, its middle 33.2 m, the foot of the west front **32.8 m**; rue Beaubourg at the east front **35.4 m**; the piazza's
    north and south ends 35.0 and 33.9 m; 300 m west and east 34.9 and 35.1 m. So Paris is flat here, and **the piazza falls
    about 3.2 m over 56 m toward the building** (about 1 in 17, 3.3°). The west front's foot is about 2.6 m below rue Beaubourg,
    which fits the 45.5 m and 42 m heights on its two sides.
  - **The AWS Terrarium tiles** (z15, the usual source) are **not bare ground here**: the same points read 41–60 m, with the
    building itself a bump of about **+25 m** (59.5 m at its centre against IGN's 34.3 m) and even the far points 7–10 m high.
    The tiles seem to carry roofs in Paris. The data script can't take them as they are (see the approach and Q6).
- **Not obtained:**
  - **Dimensioned plans and sections.** RPBW, RSHP and the Fondazione Renzo Piano publish photographs and texts but no drawings
    that were found; the Fondazione's project PDF wasn't read. So each level's height, the trusses' exact depth and panel count,
    the gerberette's shape, and the column lines' offset from the ends are **[scaled]** or **[assumed]**.
  - **How the 7 m storeys add up.** The figures fit one reading: the Forum (level 0) 10 m high, with level 1 a mezzanine inside
    it, and five storeys of 7 m (levels 2–6) above: 10 + 5 × 7 = **45 m** at the piazza's foot, against the documented 45.5 m;
    and six levels of trusses (under levels 2–6 and the roof) for the 84 beams. That reading is **[assumed]**; no section
    confirms it.
  - **The Chenille's geometry:** the number of flights, which way it climbs, the tube's diameter, and where its galleries run.
    Only "zigzag" and "transparent tubes" are documented. It'll be **[scaled]** from photographs.
  - **The ducts' layout** on the east front: which pipes go where, their sizes, and the colours as numbers. Only the four colours
    by use are documented.
  - **The width discrepancy:** 60 m (most sources), 61.5 m (OSM) and 70.45 m (Mérimée's superstructure).
  - **The piazza's designed slope.** Only "gently slopes" and "inclinée" are published; the figure above is IGN's.
  - **The IRCAM tower's outline and material.** Only 25 m and 728 m² are documented.
  - **The site's state today** (Q1), and **photographs**: Wikimedia Commons (*Centre Pompidou*) has many; none was examined in
    detail for this draft.
  - **The Seine** (about half a kilometre south) wasn't checked in OSM.

## Proposed approach
- **Data:** `scripts/houses/centre-pompidou.mjs`, fitted to OSM way 55503397. Its `wikidata` tag finds it, so no `osmIds` are
  needed.
  - **Rotation:** pinned from the west edge's 199.8° (as spec 061 pinned Trellick's), not searched. The model's grid runs along
    the building, so the columns and bays fall on studs (real rotation per `bearingToTheta()`).
  - **Model frame:** +x along the building from its south end (rue Saint-Merri) to its north end (rue Rambuteau), real 19.8°; +z
    across it from the piazza (west) to rue Beaubourg (east), real 109.8°.
  - **y = 0 is the Forum's floor,** at the foot of the west front (IGN 32.8 m) **[assumed]**: the piazza's lowest point is the
    entrance.
  - **The terrain under the lot** comes from IGN RGE ALTI points rather than the AWS tiles, which carry the roofs here: a plane
    through the IGN readings, plus the piazza's slope. Beyond the lot, the near grid is flattened toward IGN's level with
    `despike`, or replaced by the IGN values. Which of these the script does is Q6. Whatever it does is opt-in, so other houses'
    data stay byte-identical.
- **At the site's scale** (1 stud ≈ 1 ft, a plate = 0.4 ft):
  - a bay of 12.8 m is **42 studs** (42.0 ft), so 13 bays are **546 studs** (166.4 m) **[documented]**;
  - the 48 m span is **157 studs** between column centres **[documented]**, with the gerberettes' outer arms carrying the tie
    line about **20 studs** further out on each side, for about **197 studs** (60 m) overall **[scaled]**;
  - a 7 m storey is **57 plates** (22.8 ft), the Forum's 10 m **82 plates** (32.8 ft); the roof at 82 + 5 × 57 = **367 plates**
    (146.8 ft, 44.7 m) above the Forum's floor **[assumed]**, within 1 m of the documented 45.5 m;
  - the columns are **3 × 3 studs** (85 cm ≈ 2.8 ft) and rise **49 m** in all (about 160 ft, 402 plates) from their footings
    **[documented]**; the trusses are **20 plates** deep (2.5 m) **[documented]**.
- **Large pieces, as at Trellick and Habitat:** the glass walls are laid a storey (or half a storey) at a time, in pieces up to
  16 studs long; the floor slabs in big plates; the trusses' chords in 16-stud pieces, with their diagonals as stepped runs.
  Brick by brick, 7,500 m² a floor over six floors would be several hundred thousand pieces.
- **The building** at `/centre-pompidou/` (per Q1, before the works):
  - **the steel cage** **[documented]**: 14 frames of two white columns each, with a **gerberette** at each truss end on each
    column (168), each 8 m (26 studs) long, pivoting on the column: its short inner arm under the truss, its long outer arm
    carrying the outer tie;
  - **the trusses**: six levels of 14 Warren trusses spanning the 157 studs, 20 plates deep **[documented]**, their panel count
    **[assumed]**;
  - **the ties and the bracing**: the vertical tie rods at the gerberettes' tips down each long front, anchored at the ground;
    St Andrew's crosses between the tips, two storeys high, in every bay of both long fronts **[documented, their exact layout
    scaled]**;
  - **the floors**: concrete slabs on the trusses at levels 2–6 and the roof, the Forum's floor on the ground, and level 1 as a
    mezzanine inside the Forum's height **[assumed]**;
  - **the west front (the piazza)**: transparent glass set back behind the columns **[documented]**; the **Chenille**, a glass
    tube carrying the escalators in a zigzag up the outer zone from the Forum to level 6, flight by flight, with a horizontal glass
    gallery (*coursive*) along the front at each level it reaches **[scaled from photographs]**; the steps' undersides red
    **[assumed]**;
  - **the east front (rue Beaubourg)**: opaque panels **[documented]**, with the services outside them in the outer zone: big
    **blue** air ducts, **green** water pipes, **yellow** electrical conduits and **red** lift and goods-lift shafts, all as square
    stand-ins of 1–4 studs, rising up the front and bending at the roof **[colours documented; layout scaled from photographs]**;
  - **the ends**: glass at the north and south, with the cross-bracing **[assumed]**;
  - **the roof**: the roof slab and its plant rooms, the tops of the blue ducts, and level 7's terrace **[assumed]**;
  - **the Atelier Brancusi** (way 55503399): a plain one-storey exterior with its gabled roof, at the piazza's north-west corner
    **[assumed in everything but its OSM outline]**.
- **The colours:** the cage white; the four service colours as one saturated blue, green, yellow and red each **[documented by
  use; the values assumed]**; the glass as the site's usual glass; the piazza a warm grey-brown sett **[OSM `surface=sett`]**.
- **Inside**, as blocky stand-ins (per Q4):
  - **the Forum** (level 0): the reception desks, the escalators up to the Chenille's start, and the open floor;
  - **the museum** (level 5): white partition walls in the open plan, benches, and plain coloured panels as stand-ins for the
    works (no artwork reproduced);
  - **the Bpi** (level 2): rows of reading tables and low shelving;
  - **level 6**: the restaurant's tables near the north end;
  - every floor's open area otherwise empty. At least 12 interior elements are marked **[assumed]**.
- **The piazza** (the landscape):
  - the setts laid on its real slope, falling about 3.2 m (26 plates) toward the building, in steps of **1 plate every 7 studs**
    **[IGN]**, under the overhang to the glass;
  - the seven white ventilation stacks, 2.4 m (8 studs) across as stepped rounds, 7 m (57 plates) high **[OSM]**;
  - the piazza's edge along rue Saint-Martin and its cut corner along rue Saint-Merri **[OSM]**;
  - a few street trees and bollards where OSM maps them **[OSM]**.
- **The lot:** about **x −35…610, z −200…255 ft** (645 × 455 ft), from just south of the building to the Atelier Brancusi's north
  side, and from rue Saint-Martin to the far kerb of rue Beaubourg. `lotFeatures` (spec 019) brings the Brancusi way in as
  bricks. The occupancy grid at about 430 plates tall comes to **about 63 MB** (Habitat 67: 67.7 MB; spec 072 capped it at 80).
  Taking in the Stravinsky Fountain would need about 200 ft more to the south and about 83 MB, over that cap, so the fountain's
  basin is drawn as water on the terrain instead (Q3).
- **Scenery:** `lowlands` (spec 019), as Trellick and the Bauhaus Dessau use for built-up flat ground: greys and greens, no rock.
  The procedural city stays at its default, which in flat Paris draws nothing; **the city is OSM's own blocks**, drawn as the
  neighbourhood's massing at their `building:levels`.
  - The near data's radius should be checked against the `.bin`'s size: central Paris is mapped parcel by parcel, so 1,200 m
    may hold several times Trellick's buildings (its `.bin` is the largest yet, 861 KB). Start at about **800 m** and widen if
    the file stays near 1 MB **[assumed]**.
  - `waterAreas` (spec 022) brings in the Stravinsky Fountain's basin (way 88301107) and, if the radius reaches it, the Seine.
  - `shadowReach` (spec 061) of about **350 ft**, for 546 ft of building and 150 ft of height **[assumed; tuned in the browser]**.
  - `text.noun: 'centre'` (spec 059), so the numbers panel says "in the centre" (Q8).
- **The usual extras:**
  - a thumbnail;
  - a live card with its credits: OSM, IGN (RGE ALTI), AWS terrain tiles for the far ground, Wikipedia, the Centre Pompidou's
    pages, Mérimée ACR0000721, RPBW;
  - its definition added to `DEFINITIONS` in `tests/buildOrder.test.ts`, and to the shared test lists (`cameraGround`, `credits`,
    `houses`, `viewsClear`, `shortlistBuilt`);
  - `npm run stats`.

**Build story** (roles per spec 012):
1. *The Plateau Beaubourg* (**site**): the lot's ground, the piazza's slope as bare ground, and the dig.
2. *The underground box & the footings* (**foundation**): the top of the three-level concrete substructure, the 28 column
   footings and the tie anchors along both fronts.
3. *The Forum's floor* (**floor**): the floor slab at level 0, under the open sky.
4. *The steel cage* (**structure**), level by level, as it went up in 1975:
   - the 28 columns in their three sections;
   - at each level, the gerberettes onto the columns, then the 14 trusses dropped onto them, then the floor slabs;
   - the tie rods and the St Andrew's crosses down both fronts.
5. *The Forum, the library & the museum* (**interior**): furnished inside the open cage.
6. *The glass, the pipes & the Chenille* (**envelope**):
   - the west front's glass and the east front's opaque panels;
   - the blue, green, yellow and red ducts and shafts up the east front;
   - the Chenille's escalators, tubes and galleries, flight by flight up the west front.
7. *The roof* (**roof**): the roof slab, the plant rooms, the ducts' tops and level 7's terrace; any lights hanging under the top
   floor go in with `b.hanging(P.ROOF, …)`; the Atelier Brancusi's roof.
8. *The piazza* (**landscape**): the setts down the slope, the white ventilation stacks and the trees.

**About 3 minutes** (Q9). The structure phase, the cage, is the longest (about 50 s).

**Piece count and timing risk.** This is the heaviest building yet, and the budget needs watching from the first draft:
- the trusses: 84 trusses of 157 studs, each two chords of about 10 pieces and some 18–20 stepped diagonals, could reach
  **15,000 pieces** alone. If they do, the diagonals become fewer, longer steps (a panel of about 2 bays' depth), or each truss
  becomes chords plus a solid web of 16-stud plates;
- the cross-bracing: 13 bays × 3 two-storey crosses × 2 fronts × 2 diagonals, stepped stud by stud, is about **6,000 pieces**;
  stepping them 2 studs at a time halves it;
- the glass: about 3,500 m² on each long front, in storey-high pieces of up to 16 studs, is roughly 1,500–2,000 pieces a front.

The target, as for Habitat 67: **at most 50,000 pieces in all and 30,000 in the building**, and an occupancy grid of at most
80 MB (A12).

## Behavior
- **Home page:** a new live card, with its thumbnail and piece count. The thumbnail is the classic view from the top of the
  piazza by rue Saint-Martin, looking east and down the slope at the west front: the white cage, the glass, and the Chenille's
  tube zigzagging up it.
- **Viewer:** `/centre-pompidou/` works like the other buildings: intro card, build, scrubbing, views, No roof, Walk, dusk lights,
  phone controls. The numbers panel says "centre" (Q8).
- **Views:**
  - *Overview*: high over the piazza from the north-west, the whole length;
  - *The piazza*: from rue Saint-Martin, down the slope to the west front (the thumbnail's camera);
  - *The Chenille*: inside the top flight of the tube, looking out over the rooftops of Paris;
  - *Rue Beaubourg*: from the street, up at the coloured pipes;
  - *The Forum*: inside, under the mezzanine, toward the escalators;
  - *From above*: the cage on its grid, the piazza beside it, the Marais round it.
- **At dusk,** the glass walls and the Chenille's tube glow warm over the dark piazza.

## Acceptance criteria
**The building**
- **A1** [unit] The building's footprint (its outer tie line to its outer tie line) fits OSM's way 55503397 (IoU ≥ 0.8), with its
  long sides within 1° of the way's 19.8° / 199.8°. It's 546 studs long (166.4 m, within 2 ft) and 60 m wide (within 3 ft).
- **A2** [unit] The cage: 14 frames 42 studs apart, each of two columns 157 studs apart (centre to centre). That's 28 columns of
  3 × 3 studs, each rising unbroken from its footing to above the roof. There are 168 gerberettes, one on each column at each
  of the six truss levels, each 26 studs long (within 1 stud) and reaching past its column on the outside.
- **A3** [unit] Six levels of 14 trusses (84 in all), each spanning between a pair of gerberettes and 20 plates deep (within 2
  plates). The Forum is 82 plates high, levels 2–6 are 57 plates each, and the roof is 45.5 m (within 1 m) above the Forum's
  floor.
- **A4** [unit] Both long fronts have vertical tie rods at the gerberettes' tips, and St Andrew's crosses two storeys high in
  every bay. Every steel piece of the cage (columns, gerberettes, trusses, ties, crosses) is the one white.
- **A5** [unit] The colour code on the east front: the services there use exactly four colours besides the white and the panels,
  a blue, a green, a yellow and a red, each on at least 20 pieces. The ducts stand outside the east front's panels and inside the
  tie line. The east front's panels are opaque and the west front's glass transparent.
- **A6** [unit] The Chenille: a glazed tube outside the west front's glass, starting at the Forum's floor and reaching level 6,
  made of at least five sloped flights that alternate in direction or step up along the front. Each flight rises one storey or
  more, and the tube's every piece rests on the cage.
- **A7** [unit] Every element is marked **[documented]**, **[scaled]** or **[assumed]**, with at least 12 marks in the interior.
  The level-by-level heights and the Chenille's layout are marked **[assumed]** or **[scaled]**, not **[documented]**.

**Site**
- **A8** [unit] The piazza fits OSM's way 55507605 (IoU ≥ 0.75 for the part inside the lot), and its surface falls toward the
  building: the ground at its west edge is 26 plates (within 2) above the Forum's floor. The seven ventilation stacks stand at
  their OSM ways' centres (within 3 ft), each 57 plates high (within 2).
- **A9** [unit] The Atelier Brancusi fits OSM's way 55503399 (IoU ≥ 0.7).
- **A10** [unit] The lot terrain meets the neighbourhood's terrain at its edges, and no terrain sample within 300 ft of the lot is
  more than 10 ft above the IGN level there (the AWS tiles' roofs are gone). No terrain spikes (the spec 010b check).
- **A11** [unit] The definition opts into `scenery.lowlands`, and its `waterAreas` include the Stravinsky Fountain's basin south of
  the lot. The other houses' scenery, data, models and timelines are unchanged.

**Model and build**
- **A12** [unit] The budget: at most 50,000 pieces in all and 30,000 in the building (foundation to roof); the occupancy grid
  (`nx·nz·ny/2` bytes) at most 80 MB.
- **A13** [unit] The model invariants hold: no overlaps, inside the grid, deterministic. Every phase is used, and the build takes
  about 3 minutes.
- **A14** [unit] `tests/buildOrder.test.ts` covers it: phases in role order, nothing floats, nothing dropped.
- **A15** [unit] The home card is live, with the real piece count, its credits, and the disclaimer from Q7. The numbers say
  "centre".

**Manual** (in `npm run dev`)
- **A16** [manual] Play the build. The white cage rises level by level (gerberettes, then trusses, then floors) with no glass, no
  pipes and no Chenille. The furniture goes in inside the open cage. The glass, the coloured pipes and the Chenille follow, then
  the roof, and the piazza's setts and stacks come last.
- **A17** [manual] The thumbnail and *The piazza* read as the classic photographs: the sloping piazza, the white cage, the
  glass, and the Chenille's zigzag tube.
- **A18** [manual] *Rue Beaubourg* reads as the famous back: blue, green, yellow and red pipes on the white frame. The stepped
  diagonals of the trusses and the crosses read as diagonals, not noise.
- **A19** [manual] *The Chenille* looks out over the city's blocks, which stand at their real heights, with no gaps or floating
  buildings next to the lot.
- **A20** [manual] All views, No roof, Walk and the phone controls work. Walk can go down the piazza to the Forum's doors. At dusk
  the glass and the tube glow.
- **A21** [manual] The home page shows the new card live, with its thumbnail. The credits page lists the centre.
- **A22** [manual] Performance at `?dpr=1.75&debug` stays within Casa Malaparte's numbers (spec 031: 3.4M triangles). Report the
  measured fps and triangle count, and the build worker's memory.

## Out of scope
- **The renovation's works and its new design** (Q1): scaffolding, hoardings, the new façades, the level-7 terrace's new use and
  the piazza's new terraces and ramp.
- **The three underground levels:** the car park, the cinemas, the stores and IRCAM's underground rooms. The foundation shows
  only their top.
- **IRCAM's 1990 tower and its school buildings** (Q2), the Stravinsky Fountain's sculptures (only its basin, as water), the
  Église Saint-Merri and the rest of the Marais beyond OSM's massing.
- **The collections.** No artwork is reproduced; the museum's walls hold plain coloured panels.
- The interiors beyond the Forum, one library floor, one museum floor and the restaurant; the real furniture's forms.
- Round sections for the columns, the ducts and the Chenille's tube: they're stepped or square stand-ins.
- Earlier states: the 1977 opening's fittings, and the changes of the 1997–2000 renovation inside.
- The street life on the piazza, and seasons.

## Open questions
- [x] **Q1: Which state?** The building has been closed since September 2025, and works were due to start in 2026. Its state
  today wasn't found. *Recommended: as it stood from 2000 to 2025,* after the first renovation and before the closure. That's the
  building in every famous photograph and in OSM's trace, and nothing in the 2030 design changes its outside much beyond new
  glass.
  - *Alternative:* during the works, with scaffolding and hoardings. That's topical, but undocumented, and it hides the cage.
  - *Alternative:* the 2030 design, from Moreau Kusunoki's published images. Too early: they may change.
- [x] **Q2: Is IRCAM's tower in?** Piano's 1990 tower (25 m, 728 m²) stands on Place Igor-Stravinsky, beside the fountain. OSM
  doesn't identify it, and its outline and material weren't found. *Recommended: out,* drawn as OSM's massing. It'd need the lot
  to grow south by about 200 ft (to about 83 MB of grid, over the 80 MB cap), and most of it would be **[assumed]**.
  - *Alternative:* in, with the fountain's basin in bricks, on a lot stretched south. That needs either a taller cap than 80 MB or a
    lower grid (a lot that's tall only where the building is would be its own engine spec).
- [x] **Q3: The Stravinsky Fountain.** *Recommended: its basin as flat water from OSM (`waterAreas`, spec 022), outside the lot,
  with no sculptures.* The 16 sculptures are artworks by Tinguely and Saint Phalle, still in copyright, and France's freedom of
  panorama doesn't cover them for every use. A coloured blob per sculpture would read as clutter, not as them.
  - *Alternative:* plain coloured stand-ins at their places, if the lot takes the fountain in (Q2's alternative).
- [x] **Q4: How much interior?** *Recommended: the Forum, one library floor (level 2), one museum floor (level 5) and the
  restaurant (level 6),* as blocky stand-ins, and the other floors open and empty. Open floors are the building's point, and the
  glass west front shows them from the piazza.
  - *Alternative, less:* only the Forum. Cheaper, but the transparent front would show six empty floors.
  - *Alternative, more:* every floor furnished. That's several thousand more pieces, against the budget (A12).
- [x] **Q5: How detailed are the trusses and crosses?** They're the biggest risk to the piece count. *Recommended: real Warren
  diagonals, stepped 2 studs at a time, and the crosses stepped 2 studs at a time,* trimmed only if A12's budget fails. They're
  what makes it read as the Pompidou close up.
  - *Alternative:* trusses as chords with a solid web, and crosses as single diagonal pieces where the engine allows. Cheaper,
    but they'd read as beams, not lattice.
- [x] **Q6: The terrain.** The AWS tiles carry Paris's roofs (+7 to +25 m against IGN). *Recommended:* the lot's ground from IGN
  RGE ALTI points (fetched by the data script, opt-in), and the near grid around it `despike`d hard toward the IGN level. The far
  grid stays as it is: from that distance the city's massing covers it.
  - *Alternative:* a flat lot and near grid at IGN's level, with the piazza's slope modelled by hand. Simpler, and Paris is flat
    within ±1.5 m here, but it loses rue Beaubourg's 2.6 m above the Forum.
  - *Alternative:* switch the whole data source to IGN for this house. Better, but it's engine-side work for one building.
- [x] **Q7: Disclaimer.** *Recommended:* "Fan tribute. Not affiliated with the Centre Pompidou." The building belongs to the State
  and the *Centre national d'art et de culture Georges-Pompidou* runs it; it's the body visitors know by that name. The
  architects' practices (RPBW, RSHP) needn't be named, as for the Neue Nationalgalerie's original architect. Whether "Centre
  Pompidou" is a registered mark wasn't checked; the name is used only to say which building this is.
  - *Alternative:* "…Not affiliated with the Centre Pompidou, Renzo Piano Building Workshop or Rogers Stirk Harbour + Partners."
- [x] **Q8: The noun.** *Recommended: "centre"* ("12,345 in the centre", "not the real centre"). "Museum" undersells the library
  and the exhibition halls, and "building" is vague.
- [x] **Q9: Timing and budget.** *Recommended: about 3 minutes, with at most 50,000 pieces (30,000 in the building) and an
  80 MB grid,* as Habitat 67's. It's the largest building yet, so the structure phase gets the most time.
  - *Alternative:* about 3½ minutes, if the cage's level-by-level rhythm feels rushed at 3.
  - *Alternative:* a 40,000-piece cap, which would force Q5's cheaper trusses from the start.
- [x] **Q10: The level heights.** No section was found. *Recommended: the reading in Research (Forum 10 m with a mezzanine at
  level 1, five 7 m storeys, six truss levels),* marked **[assumed]**, since it fits every documented figure (45.5 m, 84 beams,
  168 gerberettes). If Erik can get a published section, it replaces the guess.

## Implementation notes
- **Files:** `scripts/houses/centre-pompidou.mjs`; `scripts/fetch-neighborhood.mjs` (the IGN opt-in); `src/houses/centre-pompidou/`
  (`model/layout.ts`, `site.ts`, `house.ts`, `interior.ts`, `landscape.ts`, `brancusi.ts`, `centrePompidou.ts`, `lotTerrain.ts` and
  `water.ts` (both generated), `phases.ts`, `definition.ts`, `main.ts`, `worker.ts`); `centre-pompidou/index.html`;
  `public/centre-pompidou/` (`neighborhood.bin`, `thumbnail.jpg`); `tests/centrePompidou.test.ts`; the registry entry; `PAGES`;
  `src/houses/stats.ts` (`npm run stats`); the shared test lists (`buildOrder`, `cameraGround`, `credits`, `houses`,
  `shortlistBuilt`, `viewsClear`) and the other houses' opt-in lists (`trellick` A10 `shadowReach`, `bauhausDessau` A15
  `shadowReach` and A14 `exportParts`, `habitat67` A13 `waterAreas`). `public/og-image.jpg` not remade.
- **Data (Q6):** a new opt-in `ign: { resource, grids }` in the data script fetches IGN's RGE ALTI from the Géoplateforme
  altimetry API (`ign_rge_alti_wld`; the resource name in the research, `ige_rgealti_fxx`, is refused), 5,000 points a POST,
  cached in `scripts/.cache`. Both grids come from it, not only the near one: the far grid stayed on the AWS tiles at first in the
  plan, but the renderer cuts the far grid where the near one is, so the tiles' roof-raised far ground (+7 to +10 m) would have
  stood as a step round the near grid's edge. 177,241 near and 58,081 far samples, none missing. y = 0 is pinned at 32.8 m
  (`lotElevationM`). The header credits "Terrain: IGN RGE ALTI" when opted in; other houses' data are byte-identical (A11
  regenerates the Haus am Horn). The HUD's credit line is hard-coded to the AWS tiles (engine), so it still says AWS here.
- **The fit:** found by wikidata (Q178065), rotation pinned at 70.2° (the west edge's 199.8°), offset (278, 35) ft, IoU 0.977
  against the cage's 549 × 198 rectangle. Overpass was at capacity for most of an hour; the main server answered in the end.
  The radius is 800 m: 2,672 buildings, 922 roads, `neighborhood.bin` 634 KB. `waterAreas` (1.2 km) gives 26 areas, the Seine
  (−19.2 ft) and the Stravinsky Fountain's basin (+11.8 ft) among them.
- **The cage:** frames at x = 42i + 1 (columns x 42i…42i + 2), 546 studs from the first to the last, 549 over the end columns
  (OSM's 167.3 m). Column lines z 19…21 and 176…178 (157 apart), tie lines z 0 and 197 (198 studs, 60.4 m). Truss levels at
  82 + 57t plates, the roof at 367 (44.7 m). Gerberettes 26 studs, 8 plates deep at the column and 4 at the tip, their inner
  arms under the floor's edge; the trusses between the inner arms' tips (z 26…171), chords in 16-stud pieces, 18 Warren panels
  of 8 studs each. Columns from −24 to 378 plates (49.0 m), cut where each gerberette's collar takes their place. Crosses in
  every bay of both fronts in tiers g0–g1 (one level), g1–g3 and g3–g5 (two levels), stepped 2 studs at a time; the ends have
  two crosses side by side per tier, stepped 3 at a time [assumed].
- **The Chenille:** five flights, each in its own bay (the first over two), with a bay of level gallery between them, so it
  climbs in a sawtooth from the Forum (x 503) toward the south to level 6 (x 86); galleries run the whole front at levels 2–6.
  A first draft with the flights end to end read as one straight red line from the piazza. The tube's roof edges are white, so
  it reads against the glass.
- **The piazza:** a profile across it from IGN (the median along the front's middle, smoothed over 15 ft and never falling away
  from the building), so the setts lie in straight courses along the front: level for about 60 ft before the glass, then rising
  to 26 plates at rue Saint-Martin. A plane fitted to IGN (first try) put the foot 3 plates above the Forum and the courses on a
  slant, which broke them into about 9,000 pieces; the profile takes 987. The streets are IGN in whole bricks.
- **Numbers:** **37,139 pieces** (24,350 the building, foundation to roof; site 11,802, foundation 2,778, floor 991, structure
  13,693, interior 475, envelope 5,165, roof 1,248 (with the hung lights), landscape 987); **3:01** at 1× (180.7 s). Grid
  655 × 465 × 432 cells, **65.8 MB**. Generation about 1 s in Node.
- **Tests:** `tests/centrePompidou.test.ts` covers A1–A13 and A15 (A14 checks that `buildOrder` lists it). They were written
  before the model was run; the first run failed A6 for a real reason (the escalators' red undersides touched nothing: the
  tube's sides started above them), A8 (the plane's foot, above) and A15 (the card's piece count, not yet recorded).
  `buildOrder` caught the Forum's slab taking the columns' cells (28 dropped columns). `cameraGround` A3 got a 120 s timeout:
  it builds thirty houses in turn, and it ran out at 60 s on a machine shared with three other builds.
- **Changed from the spec's text:**
  - *A8's two plate counts are metres divided by 0.4.* "Falls about 3.2 m (8 plates)" and "7 m (17 plates) high": a plate is
    0.4 ft, so 3.2 m is 26 plates and 7 m is 57. The model follows the metres (the IGN slope, OSM's height=7), and the test checks
    26 ± 2 and 57 ± 2. Erik may prefer lower stacks: OSM's 7 m is sourced "bing; extrapolation". A8 above now reads 26 and 57.
  - *The walk starts halfway down the piazza* (z −95), not at its top: the walker only lands on ground under 4 ft, and the top
    is 10 ft up.
  - *No trees or bollards:* the data script doesn't fetch OSM's trees, and none were added by hand. The car park's small vents
    by rue Beaubourg (OSM ways with no levels) are left out; the lot's other buildings are plain massing.
  - The IRCAM-side blocks that cross the lot's south-west corner are cut at the lot's edge.
  - Dusk: point lights alone lit only a few patches, so strip lights hang under every ceiling along the west front and under the
    galleries' roofs (with the roof, `b.hanging`).
- **Thumbnail:** `/centre-pompidou/?cam=470,40,-196,230,72,80&clean&dpr=1&date=2026-06-21`, 1200 × 675, Playwright's Chromium
  with the Metal GPU (as `scripts/design-shots.mjs`); the same camera is *The piazza*. It was taken before the strip lights went
  in (they show only at dusk).
- **Manual checks** (Chrome on a real GPU, `npm run dev` on port 5190, 1636 × 902):
  - **A16 pass:** at 62 s the white cage stands four levels up with its floors and no glass, pipes or tube; at 100 s the
    furniture is in on the open floors; at 135 s the glass, the coloured pipes and the Chenille are going on; at 158 s the roof
    and its plant rooms are on while the piazza is still bare soil; the setts and stacks come last.
  - **A17 pass (my judgement):** the thumbnail and *The piazza* show the sloping setts, two white stacks, the white cage with its
    crosses, the glass and the red sawtooth of the Chenille.
  - **A18 pass:** *Rue Beaubourg* shows blue ducts, green and yellow pipes and red lift shafts between white ties and crosses;
    the trusses and crosses read as stepped diagonals.
  - **A19 pass:** *The Chenille* looks out over the Marais' blocks at their heights; no gaps or floating buildings beside the lot
    were seen there or from *Overview* and *From above*.
  - **A20 partly:** every view opens (*Overview*, *The piazza*, *The Chenille*, *Rue Beaubourg*, *The Forum*, *From above*,
    which was raised after a first look cut the building off); No roof opens the restaurant floor; Walk goes from the piazza down
    to the Forum's glass (z −95 → 21.3, driven through the walker with W held); at dusk the ceiling strips light every floor
    behind the glass and the galleries (the panes themselves don't glow). Phone controls not checked.
  - **A21 pass:** the home page shows the live card with its thumbnail; the credits page lists the centre and its sources.
  - **A22 pass:** at `?debug&dpr=1.75`, finished (before the 360 strip lights went in): 1,518,842 triangles, 18 calls, 43–58 fps while orbiting (Casa Malaparte:
    3.4M triangles). The build worker's grid is 65.8 MB; the page's JS heap 242 MB.
- **Usage (spec 018):** not separable per building. Specs 078–081 were drafted and built in parallel in one session and
  committed within a minute, and `npm run usage` gives each message to the next commit, so the Schindler House's row (5b1e614)
  holds all four: 941 replies, 1,946 input, 3.7M cache write, 246.4M cache read, 1.09M output. The other three have no row
  of their own.

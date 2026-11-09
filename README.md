# Blockitecture

Famous houses, built block by block in your browser. The home page (`/`) lists the renderings; each one is its own page.

## Houses

| | Page | Status |
|---|---|---|
| **Stahl House** (Case Study House #22), Pierre Koenig, 1959–60 | `/stahl-house/` | live |
| **Eames House** (Case Study House #8), Charles & Ray Eames, 1949 | `/eames-house/` | live |
| **Fallingwater**, Frank Lloyd Wright, 1939 | — | coming soon |

### Stahl House
All 27,222 pieces snap into place on the real Hollywood Hills: the hillside spreads out from the house pad, then the
foundations and pool, the steel frame, the furniture, the glass and walls, the roof, and finally the garden. Orbit
around it, or walk through it while it goes up.

- **Timeline**: play/pause (P), 1×/4×/16× speed, scrub, finish (F), restart
- **Orbit / Walk** (Tab): WASD + mouse, Shift to run, Space to jump; a touch joystick on phones
- **Camera controls**: zoom (+/−), rotate (←/→), home (H), auto-rotate (R), fullscreen, and named views:
  Overview, The famous view, Pool, Hills & basin
- **No roof**: lift the roof off to see inside · **Day / Dusk**: dusk lights up the house over the city
- **Links to a view**: `/stahl-house/?view=famous&light=dusk` (add `&clean` to hide the controls, for screenshots)

### Eames House
The house and studio on their meadow high above the Pacific: the retaining wall and the planted hill, the 7′4″ steel
frame, the grid of colored panels, the eucalyptus row, and the interiors with the Eames furniture documented in the house.
The real Pacific Palisades around it, with Santa Monica Bay below.

### Real surroundings
The surrounding Hollywood Hills and the Sunset Strip are real: buildings and roads from
[OpenStreetMap](https://www.openstreetmap.org/copyright) (© OpenStreetMap contributors, ODbL) and terrain from the
Mapzen / AWS Terrain Tiles, baked into `public/stahl-house/neighborhood.bin` by `node scripts/fetch-neighborhood.mjs`.
Further out, the LA basin is procedural.

## Development

Vite (multi-page) + TypeScript. The 3D scenes are Three.js with procedural geometry; the pages and the viewer
controls are React with [shadcn/ui](https://ui.shadcn.com) components, Tailwind CSS and the Inter font (self-hosted).

```sh
npm install
npm run dev     # http://localhost:5173  (viewer: /stahl-house/?debug for an FPS overlay and window.__viewer)
npm run check   # type-check + tests
npm run build   # static site in dist/ (deployed on Vercel)
```

### Adding a house
1. An entry in `src/houses/index.ts` (`status: 'coming-soon'` shows a placeholder card).
2. The house itself in `src/houses/<slug>/`: its brick model, build phases and a `HouseDefinition` (`definition.ts`), plus
   `main.ts` calling `startViewer()`. The viewer engine in `src/engine/` is shared and knows nothing about any one house.
3. Real-world surroundings: settings in `scripts/houses/<slug>.mjs`, then `node scripts/fetch-neighborhood.mjs <slug>`.
4. When it's live: a page at `<slug>/index.html`, listed in `PAGES` in `vite.config.ts`, and `public/<slug>/thumbnail.jpg`
   (1200 × 675, captured from `/<slug>/?view=…&clean&date=…`).

These are fan tributes in a generic toy-block style and are not affiliated with the LEGO Group, or with the Eames Office, the
Eames Foundation, Herman Miller or Vitra.

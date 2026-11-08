# Blockitecture

Famous houses, built brick by brick in your browser. The home page (`/`) lists the renderings; each one is its own page.

## Houses

| | Page | Status |
|---|---|---|
| **Stahl House** (Case Study House #22), Pierre Koenig, 1959–60 | `/stahl-house/` | live |
| **Eames House** (Case Study House #8), Charles & Ray Eames, 1949 | — | coming soon |
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

The surrounding Hollywood Hills and the Sunset Strip are real: buildings and roads from
[OpenStreetMap](https://www.openstreetmap.org/copyright) (© OpenStreetMap contributors, ODbL) and terrain from the
Mapzen / AWS Terrain Tiles, baked into `public/stahl-house/neighborhood.bin` by `node scripts/fetch-neighborhood.mjs`.
Further out, the LA basin is procedural.

## Development

Vite (multi-page) + TypeScript. The 3D scenes are Three.js with procedural geometry; the pages and the viewer
controls are React with [shadcn/ui](https://ui.shadcn.com) components, Tailwind CSS and the Inter font (self-hosted).

```sh
npm install
npm run dev     # http://localhost:5173  (viewer: /stahl-house/?debug for an FPS overlay)
npm run check   # type-check + tests
npm run build   # static site in dist/ (deployed on Vercel)
```

### Adding a house
1. An entry in `src/houses.ts` (`status: 'coming-soon'` shows a placeholder card).
2. When it's live: a page at `<slug>/index.html`, listed in `PAGES` in `vite.config.ts`, and its files in `public/<slug>/`
   (`thumbnail.jpg`, 1200 × 675, captured from `/<slug>/?view=…&clean`).

These are fan tributes in a generic toy-brick style and are not affiliated with the LEGO Group.

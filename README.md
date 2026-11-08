# Blockitecture

Pierre Koenig's **Stahl House (Case Study House #22, 1959–60)**, built brick by brick in your browser.

Every visitor watches all ~17,800 pieces of the house snap into place on the Hollywood Hills: the hillside, the foundations and pool, the steel frame, the roof, the glass, and finally the furniture. You can orbit around it, or switch to first-person and walk through it while it goes up.

- **Timeline**: play/pause, 1×/4×/16× speed, scrub, finish, restart
- **Orbit / Walk** (Tab): WASD + mouse, Shift to run, Space to jump; a touch joystick on phones
- **Camera controls**: zoom (+/−), rotate (←/→), home (H), auto-rotate (R), fullscreen, and named views:
  Overview, The famous view, Pool, Hills & basin
- **No roof**: lift the roof off to watch the interior being furnished
- **Day / Dusk**: dusk lights up the house over the city

Built with Vite, TypeScript and Three.js. All geometry is generated procedurally.

```sh
npm install
npm run dev     # http://localhost:5173  (add ?debug for an FPS overlay)
npm run build   # static site in dist/
```

The surrounding Hollywood Hills and the Sunset Strip are real: buildings and roads from
[OpenStreetMap](https://www.openstreetmap.org/copyright) (© OpenStreetMap contributors, ODbL) and terrain from the
Mapzen / AWS Terrain Tiles, baked into `public/neighborhood.bin` by `node scripts/fetch-neighborhood.mjs`.
Further out, the LA basin is procedural.

This is a fan tribute in a generic toy-brick style and is not affiliated with the LEGO Group.

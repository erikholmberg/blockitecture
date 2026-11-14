import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { seoPlugin } from './seo.plugin';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/** One HTML entry per page: the home page and each live house (spec 007). */
export const PAGES = {
  home: r('./index.html'),
  'stahl-house': r('./stahl-house/index.html'),
  'eames-house': r('./eames-house/index.html'),
  fallingwater: r('./fallingwater/index.html'),
  'rietveld-schroder-house': r('./rietveld-schroder-house/index.html'),
  'farnsworth-house': r('./farnsworth-house/index.html'),
  'ennis-house': r('./ennis-house/index.html'),
  'casa-malaparte': r('./casa-malaparte/index.html'),
  'kaufmann-desert-house': r('./kaufmann-desert-house/index.html'),
  'lovell-health-house': r('./lovell-health-house/index.html'),
  'casa-luis-barragan': r('./casa-luis-barragan/index.html'),
  'koshino-house': r('./koshino-house/index.html'),
  'sheats-goldstein-residence': r('./sheats-goldstein-residence/index.html'),
  'rose-seidler-house': r('./rose-seidler-house/index.html'),
  'douglas-house': r('./douglas-house/index.html'),
  'church-of-the-light': r('./church-of-the-light/index.html'),
  'lovell-beach-house': r('./lovell-beach-house/index.html'),
  'neue-nationalgalerie': r('./neue-nationalgalerie/index.html'),
  'muuratsalo-experimental-house': r('./muuratsalo-experimental-house/index.html'),
  'sonneveld-house': r('./sonneveld-house/index.html'),
  'trellick-tower': r('./trellick-tower/index.html'),
  'unity-temple': r('./unity-temple/index.html'),
  'haus-am-horn': r('./haus-am-horn/index.html'),
  'glass-house': r('./glass-house/index.html'),
  'villa-savoye': r('./villa-savoye/index.html'),
  'habitat-67': r('./habitat-67/index.html'),
  'barcelona-pavilion': r('./barcelona-pavilion/index.html'),
  'bauhaus-dessau': r('./bauhaus-dessau/index.html'),
  'taliesin-west': r('./taliesin-west/index.html'),
  'gropius-house': r('./gropius-house/index.html'),
  credits: r('./credits/index.html'), // spec 021
};

/** /stahl-house → /stahl-house/ in dev and preview, like vercel.json's trailingSlash in production. */
function pageSlashRedirect(): Plugin {
  const slugs = Object.keys(PAGES).filter((k) => k !== 'home');
  const handle = (req: { url?: string }, res: any, next: () => void) => {
    const m = req.url?.match(/^\/([a-z0-9-]+)(\?.*)?$/);
    if (m && slugs.includes(m[1])) {
      res.statusCode = 308;
      res.setHeader('Location', `/${m[1]}/${m[2] ?? ''}`);
      return res.end();
    }
    next();
  };
  return {
    name: 'page-slash-redirect',
    configureServer: (server) => { server.middlewares.use(handle); },
    configurePreviewServer: (server) => { server.middlewares.use(handle); },
  };
}

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), pageSlashRedirect(), seoPlugin(Object.keys(PAGES))], // seo: spec 053
  resolve: { alias: { '@': r('./src') } },
  build: { target: 'es2022', chunkSizeWarningLimit: 900, rollupOptions: { input: PAGES } },
});

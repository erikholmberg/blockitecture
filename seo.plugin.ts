/**
 * Spec 053: the Vite plugin that adds link previews and readable content to every page, and emits sitemap.xml, robots.txt and
 * llms.txt. The content itself is pure (src/seo/seo.ts); this only wires it in, in `npm run dev` and in the build.
 *
 * The home and credits pages' React and the houses' definitions are loaded with Vite's SSR loader (the dev server's own in dev,
 * a short-lived one in the build), so they resolve `@/` and TSX like the pages do.
 */
import { createServer, type Plugin, type ViteDevServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { llmsTxt, robots, sitemap, transformPage } from './src/seo/seo';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const RENDER = '/src/seo/render.tsx';

type Render = typeof import('./src/seo/render');

/** a page's key in PAGES from its HTML file's path ('/index.html' → 'home'), or null for a page that isn't published */
export function pageOfPath(path: string, pages: string[]): string | null {
  const m = path.match(/^\/(?:([a-z0-9-]+)\/)?index\.html$/);
  if (!m) return null;
  const page = m[1] ?? 'home';
  return pages.includes(page) ? page : null;
}

export function seoPlugin(pages: string[]): Plugin {
  let dev: ViteDevServer | undefined;
  let loader: ViteDevServer | undefined;
  const load = async (): Promise<Render> => {
    const server = dev ?? (loader ??= await createServer({
      configFile: false, root: r('.'), logLevel: 'error', appType: 'custom',
      resolve: { alias: { '@': r('./src') } },
      server: { middlewareMode: true, hmr: false, ws: false },
      optimizeDeps: { noDiscovery: true, include: [] },
    }));
    return (await server.ssrLoadModule(RENDER)) as Render;
  };
  const files: Record<string, () => [string, string]> = {
    '/sitemap.xml': () => [sitemap(pages), 'application/xml'],
    '/robots.txt': () => [robots(), 'text/plain'],
    '/llms.txt': () => [llmsTxt(), 'text/plain'],
  };

  return {
    name: 'seo',
    configureServer(server) {
      dev = server;
      server.middlewares.use((req, res, next) => {
        const f = files[req.url?.split('?')[0] ?? ''];
        if (!f) return next();
        const [body, type] = f();
        res.setHeader('Content-Type', `${type}; charset=utf-8`);
        res.end(body);
      });
    },
    async transformIndexHtml(html, ctx) {
      const page = pageOfPath(ctx.path, pages);
      if (page === null) return transformPage(html, null, {});
      const m = await load();
      const rootHtml = page === 'home' ? m.renderHome() : page === 'credits' ? m.renderCredits() : undefined;
      const text = rootHtml === undefined ? await m.houseText(page) : undefined;
      return transformPage(html, page, { rootHtml, text });
    },
    generateBundle() {
      for (const [path, f] of Object.entries(files)) this.emitFile({ type: 'asset', fileName: path.slice(1), source: f()[0] });
    },
    async closeBundle() {
      await loader?.close();
      loader = undefined;
    },
  };
}

/**
 * Spec 047: generating the model in a Web Worker, so the page's main thread stays free and the loading brick keeps turning
 * (on an iPhone, Safari stops it while the main thread is busy). Each house has a `worker.ts` that calls `serveBuild()` with its
 * own definition, so the engine still imports no house.
 */
import type { HouseDefinition } from '@/engine/house';
import { BuildPayload, buildPayload, transferables } from '@/engine/buildPayload';

/** the worker's global scope, as much of it as this uses (the page's TypeScript lib types `self` as a window) */
type WorkerScope = { onmessage: ((e: MessageEvent) => void) | null; postMessage(message: unknown, transfer: Transferable[]): void };

/** In a house's worker: build the model when asked, and post it back. */
export function serveBuild(house: HouseDefinition) {
  const scope = self as unknown as WorkerScope;
  scope.onmessage = () => {
    const p = buildPayload(house);
    scope.postMessage(p, transferables(p));
  };
}

/** In the page: the model from the house's worker, or (if there's none, or it fails) built here on the main thread. */
export async function generateModel(house: HouseDefinition, makeWorker?: () => Worker): Promise<BuildPayload> {
  if (makeWorker && typeof Worker !== 'undefined') {
    try {
      return await new Promise<BuildPayload>((resolve, reject) => {
        const w = makeWorker();
        w.onmessage = (e: MessageEvent<BuildPayload>) => { resolve(e.data); w.terminate(); };
        w.onerror = (e) => { reject(e); w.terminate(); };
        w.postMessage('build');
      });
    } catch (e) {
      console.warn(`[${house.slug}] the model's worker failed; building on the main thread`, e);
    }
  }
  return buildPayload(house);
}

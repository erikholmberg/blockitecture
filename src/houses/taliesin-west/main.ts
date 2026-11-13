import { startViewer } from '@/engine/viewer';
import { TALIESIN_WEST } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(TALIESIN_WEST, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

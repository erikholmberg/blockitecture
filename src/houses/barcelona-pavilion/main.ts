import { startViewer } from '@/engine/viewer';
import { BARCELONA_PAVILION } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(BARCELONA_PAVILION, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

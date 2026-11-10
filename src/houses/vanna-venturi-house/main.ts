import { startViewer } from '@/engine/viewer';
import { VANNA_VENTURI } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(VANNA_VENTURI, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

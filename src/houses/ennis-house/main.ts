import { startViewer } from '@/engine/viewer';
import { ENNIS } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(ENNIS, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

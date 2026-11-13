import { startViewer } from '@/engine/viewer';
import { VILLA_SAVOYE } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(VILLA_SAVOYE, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

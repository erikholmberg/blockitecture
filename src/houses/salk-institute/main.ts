import { startViewer } from '@/engine/viewer';
import { SALK_INSTITUTE } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(SALK_INSTITUTE, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

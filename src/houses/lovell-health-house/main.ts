import { startViewer } from '@/engine/viewer';
import { LOVELL } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(LOVELL, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

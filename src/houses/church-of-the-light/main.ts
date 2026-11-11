import { startViewer } from '@/engine/viewer';
import { CHURCH_OF_THE_LIGHT } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(CHURCH_OF_THE_LIGHT, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

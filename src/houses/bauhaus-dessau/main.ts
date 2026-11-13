import { startViewer } from '@/engine/viewer';
import { BAUHAUS_DESSAU } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(BAUHAUS_DESSAU, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

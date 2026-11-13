import { startViewer } from '@/engine/viewer';
import { GLASS_HOUSE } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(GLASS_HOUSE, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

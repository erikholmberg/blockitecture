import { startViewer } from '@/engine/viewer';
import { HABITAT_67 } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(HABITAT_67, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

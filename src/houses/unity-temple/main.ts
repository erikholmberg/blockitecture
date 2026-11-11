import { startViewer } from '@/engine/viewer';
import { UNITY_TEMPLE } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(UNITY_TEMPLE, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

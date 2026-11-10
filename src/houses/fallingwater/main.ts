import { startViewer } from '@/engine/viewer';
import { FALLINGWATER } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(FALLINGWATER, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

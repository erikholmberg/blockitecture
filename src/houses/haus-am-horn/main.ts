import { startViewer } from '@/engine/viewer';
import { HAUS_AM_HORN } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(HAUS_AM_HORN, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

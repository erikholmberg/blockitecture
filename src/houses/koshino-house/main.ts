import { startViewer } from '@/engine/viewer';
import { navList } from '@/houses/index';
import { KOSHINO } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(KOSHINO, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }), navList());

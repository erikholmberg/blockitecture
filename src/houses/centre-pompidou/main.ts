import { startViewer } from '@/engine/viewer';
import { navList } from '@/houses/index';
import { CENTRE_POMPIDOU } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(CENTRE_POMPIDOU, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }), navList());

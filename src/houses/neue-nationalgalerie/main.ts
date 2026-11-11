import { startViewer } from '@/engine/viewer';
import { NEUE_NATIONALGALERIE } from './definition';

// spec 047: the model is generated in this house's worker
startViewer(NEUE_NATIONALGALERIE, () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }));

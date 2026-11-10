import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { startAnalytics } from '@/analytics';
import { HOUSES } from '@/houses/index';
import { CreditsPage } from '@/credits/CreditsPage';

startAnalytics(); // spec 052

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CreditsPage houses={HOUSES} />
  </StrictMode>,
);

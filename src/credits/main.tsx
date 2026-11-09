import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { HOUSES } from '@/houses/index';
import { CreditsPage } from '@/credits/CreditsPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CreditsPage houses={HOUSES} />
  </StrictMode>,
);

import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { startAnalytics } from '@/analytics';
import { HOUSES } from '@/houses/index';
import { CreditsPage } from '@/credits/CreditsPage';

startAnalytics(); // spec 052

// spec 053: the page's HTML already holds this tree (rendered at build time, src/seo/render.tsx); React takes it over
hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <CreditsPage houses={HOUSES} />
  </StrictMode>,
);

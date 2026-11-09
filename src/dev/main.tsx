import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { ShortlistPage } from '@/dev/ShortlistPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShortlistPage />
  </StrictMode>,
);

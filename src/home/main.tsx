import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { HOUSES } from '@/houses';
import { HomePage } from './HomePage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomePage houses={HOUSES} />
  </StrictMode>,
);

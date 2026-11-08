import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { HOUSES } from '@/houses/index';
import { HomePage } from '@/home/HomePage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomePage houses={HOUSES} />
  </StrictMode>,
);

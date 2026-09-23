import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LangProvider } from './i18n';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Si hay una versión nueva publicada y esta pestaña pide archivos viejos, recarga una vez
window.addEventListener('vite:preloadError', () => {
  try {
    if (sessionStorage.getItem('temashop_reloaded') === '1') return;
    sessionStorage.setItem('temashop_reloaded', '1');
  } catch {
    /* sin almacenamiento */
  }
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </LangProvider>
  </StrictMode>,
);

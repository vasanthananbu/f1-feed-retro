import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Production Proxy Interceptor
if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    if (url.includes('generativelanguage.googleapis.com')) {
      const proxyUrl = url.replace('https://generativelanguage.googleapis.com', '/api/gemini');
      console.log(`INTERCEPTING_REQUEST // REDIRECTING_TO_PROXY // ${proxyUrl.split('?')[0]}`);
      
      if (typeof input === 'string') {
        input = proxyUrl;
      } else if (input instanceof URL) {
        input = new URL(proxyUrl, window.location.origin);
      } else {
        input = new Request(proxyUrl, input);
      }
    }
    return originalFetch(input, init);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

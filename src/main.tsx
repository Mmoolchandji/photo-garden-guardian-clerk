import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerPwa } from './utils/pwa.ts'
import InstallPrompt from './components/PWA/InstallPrompt.tsx'
import OfflineIndicator from './components/PWA/OfflineIndicator.tsx'
import React from 'react'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <InstallPrompt />
    <OfflineIndicator />
  </React.StrictMode>
);

registerPwa();

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerPwa } from './utils/pwa.ts'
import React from 'react'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

registerPwa();

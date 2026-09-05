import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

window.addEventListener('error', (event) => {
  const rootDiv = document.getElementById('root');
  if (rootDiv && (!rootDiv.children || rootDiv.children.length === 0)) {
    rootDiv.innerHTML = `
      <div style="padding: 40px; color: #dc2626; background: #fff; font-family: sans-serif; min-h-screen: 100vh;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">CloudVault Loading Exception</h2>
        <p style="font-size: 14px; margin-bottom: 16px;">${event.message || 'Script error'}</p>
        <pre style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; overflow: auto;">${event.error?.stack || event.filename || ''}</pre>
        <button onclick="localStorage.clear(); window.location.reload();" style="margin-top: 16px; padding: 8px 16px; background: #1e3a8a; color: white; border: none; border-radius: 6px; cursor: pointer;">
          Reset Session & Reload
        </button>
      </div>
    `;
  }
});

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (err) {
  console.error("React mount error", err);
}


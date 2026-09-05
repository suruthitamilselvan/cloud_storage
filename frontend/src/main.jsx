import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const renderErrorScreen = (title, message, stack) => {
  const rootDiv = document.getElementById('root');
  if (rootDiv) {
    rootDiv.innerHTML = `
      <div style="padding: 40px; color: #dc2626; background: #ffffff; font-family: system-ui, sans-serif; min-height: 100vh; box-sizing: border-box;">
        <h2 style="font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 8px;">${title}</h2>
        <p style="font-size: 14px; color: #1e293b; margin-bottom: 16px; font-weight: 500;">${message || 'Script error'}</p>
        <pre style="background: #f8fafc; color: #334155; padding: 16px; border-radius: 8px; font-size: 12px; border: 1px solid #e2e8f0; overflow: auto; max-height: 300px;">${stack || 'No stack trace available'}</pre>
        <button onclick="localStorage.clear(); window.location.reload();" style="margin-top: 20px; padding: 10px 20px; background: #1e3a8a; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
          Clear Cache & Reload
        </button>
      </div>
    `;
  }
};

window.addEventListener('error', (event) => {
  console.error("Global Error Caught:", event);
  renderErrorScreen(
    "CloudVault Startup Error",
    event.message,
    event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`
  );
});

window.addEventListener('unhandledrejection', (event) => {
  console.error("Unhandled Rejection Caught:", event);
  renderErrorScreen(
    "CloudVault Async Exception",
    event.reason?.message || String(event.reason),
    event.reason?.stack || ''
  );
});

const mountReactApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    setTimeout(mountReactApp, 50);
    return;
  }
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("React Mount Catch:", err);
    renderErrorScreen("React Mount Exception", err.message, err.stack);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountReactApp);
} else {
  mountReactApp();
}

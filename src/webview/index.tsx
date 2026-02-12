import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './global.css';

// Acquire VS Code API for message passing
declare global {
  interface Window {
    acquireVsCodeApi: () => VSCodeAPI;
  }
}

interface VSCodeAPI {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

// Get VS Code API instance (only available once)
export const vscode = window.acquireVsCodeApi();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

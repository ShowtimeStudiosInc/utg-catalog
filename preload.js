// Preload script for Electron security best practices
// This runs in a restricted context between main process and renderer

window.__IPHONE__ = true; // Prevent React Native from interfering

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow safe communication from main to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getAppDataPath: () => ipcRenderer.invoke('get-app-data-path'),
});
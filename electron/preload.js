const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Add secure APIs here if needed in the future
  platform: process.platform
});
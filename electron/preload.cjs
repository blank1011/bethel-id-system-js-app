const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  savePng: (payload) =>
    ipcRenderer.invoke('save-png', payload),
  savePngsBatch: (files, sideFolder) =>
    ipcRenderer.invoke('save-pngs-batch', files, sideFolder),
  saveNumberedSidePngsBatch: (files, sideFolder) =>
    ipcRenderer.invoke('save-numbered-side-pngs', { files, sideFolder }),
});

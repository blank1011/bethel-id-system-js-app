const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  savePng: (dataUrl, studentName, side) =>
    ipcRenderer.invoke('save-png', { dataUrl, studentName, side }),
  savePngsBatch: (files) =>
    ipcRenderer.invoke('save-pngs-batch', files),
});

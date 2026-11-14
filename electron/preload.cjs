const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('quantumNative', {
  isDesktop: true,
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getSystemSpecs: () => ipcRenderer.invoke('system:getSpecs'),
  openMediaDialog: () => ipcRenderer.invoke('dialog:openMedia'),
  saveExportDialog: (defaultName) => ipcRenderer.invoke('dialog:saveExport', defaultName),
  openExternalUrl: (url) => ipcRenderer.invoke('shell:openExternal', url),
  relaunchApp: () => ipcRenderer.invoke('app:relaunch'),
  reloadWindow: () => ipcRenderer.invoke('app:reloadWindow'),
});

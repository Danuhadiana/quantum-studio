const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const os = require('os');

process.on('uncaughtException', (err) => {
  dialog.showErrorBox('Quantum Studio Error', err.stack || err.message);
});

process.on('unhandledRejection', (reason) => {
  dialog.showErrorBox('Quantum Studio Unhandled Rejection', String(reason));
});

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#070a13',
    title: 'Quantum Studio Desktop',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // In production, load the built dist/index.html
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in default OS browser
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIpcHandlers() {
  ipcMain.handle('app:getVersion', () => app.getVersion());

  ipcMain.handle('system:getSpecs', () => ({
    platform: process.platform,
    arch: process.arch,
    cpus: os.cpus().length,
    totalMemoryGb: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1),
    freeMemoryGb: (os.freemem() / (1024 * 1024 * 1024)).toFixed(1),
  }));

  ipcMain.handle('dialog:openMedia', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Media (Video, Audio, Image)',
      properties: ['openFile'],
      filters: [
        { name: 'Media Files', extensions: ['mp4', 'mov', 'mkv', 'webm', 'mp3', 'wav', 'png', 'jpg'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('dialog:saveExport', async (event, defaultName = 'quantum_export_4k.mp4') => {
    if (!mainWindow) return null;
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Rendered Video',
      defaultPath: defaultName,
      filters: [
        { name: 'MP4 Video (*.mp4)', extensions: ['mp4'] },
        { name: 'WebM Video (*.webm)', extensions: ['webm'] },
      ],
    });
    if (result.canceled || !result.filePath) return null;
    return result.filePath;
  });

  ipcMain.handle('shell:openExternal', (event, targetUrl) => {
    if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
      shell.openExternal(targetUrl);
      return true;
    }
    return false;
  });

  ipcMain.handle('app:relaunch', () => {
    app.relaunch();
    app.exit(0);
  });

  ipcMain.handle('app:reloadWindow', () => {
    if (mainWindow) {
      mainWindow.reload();
      return true;
    }
    return false;
  });
}

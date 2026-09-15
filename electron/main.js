import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Electron failed to load window:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Electron window loaded:', startUrl);
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

const formatIndexPrefix = (studentIndex, studentCount) => {
  if (typeof studentIndex !== 'number') return '';
  const width = Math.max(2, String(studentCount || studentIndex).length);
  return `${String(studentIndex).padStart(width, '0')}_`;
};

// ── IPC: Save PNG file ─────────────────────────────────────
ipcMain.handle('save-png', async (event, { dataUrl, studentName, side, studentIndex, studentCount }) => {
  try {
    const picturesDir = app.getPath('pictures');
    const baseDir = path.join(picturesDir, 'Bethel ID Students');
    const safeStudentName = (studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
    const studentDir = path.join(baseDir, safeStudentName);

    // Create directories if they don't exist
    await fs.mkdir(studentDir, { recursive: true });

    const indexPrefix = formatIndexPrefix(studentIndex, studentCount);
    const filename = `${indexPrefix}${safeStudentName}_${side === 'BACK' ? 'BACK' : 'FRONT'}.png`;
    const filePath = path.join(studentDir, filename);

    // Convert data URL to buffer and write
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(filePath, buffer);

    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error saving PNG:', error);
    return { success: false, error: error.message };
  }
});

// ── IPC: Save multiple PNG files (for batch export) ────────
ipcMain.handle('save-pngs-batch', async (event, files, sideFolder) => {
  const results = [];

  const picturesDir = app.getPath('pictures');
  const baseDir = path.join(picturesDir, 'Bethel ID Students');
  const numberedFrontDir = path.join(baseDir, 'Front');
  const numberedBackDir = path.join(baseDir, 'Back');
  await fs.mkdir(numberedFrontDir, { recursive: true });
  await fs.mkdir(numberedBackDir, { recursive: true });

  for (const { dataUrl, studentName, isFront, studentIndex } of files) {
    try {
      const safeStudentName = (studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      const studentDir = path.join(baseDir, safeStudentName);
      await fs.mkdir(studentDir, { recursive: true });

      const side = isFront ? 'FRONT' : 'BACK';
      const studentFilename = `${safeStudentName}_${side}.png`;
      const studentFilePath = path.join(studentDir, studentFilename);

      const numberedDir = sideFolder
        ? path.join(baseDir, sideFolder)
        : isFront
          ? numberedFrontDir
          : numberedBackDir;
      const numberedFilename = `${studentIndex}.png`;
      const numberedFilePath = path.join(numberedDir, numberedFilename);

      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      await Promise.all([
        fs.writeFile(studentFilePath, buffer),
        fs.writeFile(numberedFilePath, buffer),
      ]);

      results.push({ success: true, path: studentFilePath, numberedPath: numberedFilePath });
    } catch (error) {
      console.error('Error saving PNG:', error);
      results.push({ success: false, error: error.message });
    }
  }

  return results;
});

// ── IPC: Save numbered side-only PNG files to separate Front/Back folders ────────
ipcMain.handle('save-numbered-side-pngs', async (event, { files, sideFolder }) => {
  const results = [];

  const picturesDir = app.getPath('pictures');
  const baseDir = path.join(picturesDir, 'Bethel ID Students');
  const numberedDir = path.join(baseDir, sideFolder);
  await fs.mkdir(numberedDir, { recursive: true });

  for (const { dataUrl, studentIndex } of files) {
    try {
      const numberedFilename = `${studentIndex}.png`;
      const numberedFilePath = path.join(numberedDir, numberedFilename);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      await fs.writeFile(numberedFilePath, buffer);
      results.push({ success: true, numberedPath: numberedFilePath });
    } catch (error) {
      console.error('Error saving numbered PNG:', error);
      results.push({ success: false, error: error.message });
    }
  }

  return results;
});

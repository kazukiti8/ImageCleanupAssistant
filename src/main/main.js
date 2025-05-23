// src/main/main.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800, // 初期幅 (この後最大化されるため、大きな影響はありません)
    height: 600, // 初期高さ (この後最大化されるため、大きな影響はありません)
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'), // preload.js のパスも確認
      contextIsolation: true,
      nodeIntegration: false, // セキュリティのため false を推奨
    }
  });

  // index.html の正しいパスを指定します。
  // __dirname は現在のファイル(main.js)があるディレクトリ (src/main) を指します。
  // そこから相対パスで指定します。
  mainWindow.loadFile(path.join(__dirname, '../renderer/html/index.html'));

  // ★★★ 追加点 ★★★
  // ウィンドウを最大化して表示します。
  mainWindow.maximize();

  // デベロッパーツールを開く (開発時)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

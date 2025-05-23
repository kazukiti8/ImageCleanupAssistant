// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron'); // dialog を追加
const path = require('path');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1000, // 少し幅を広げておきます（UI要素が増えるため）
    height: 750, // 少し高さを上げておきます
    minWidth: 800, // 最小幅
    minHeight: 600, // 最小高さ
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools(); // 開発時はコメント解除
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

// フォルダ選択ダイアログを開く処理 (メインプロセス)
async function handleFolderOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'] // フォルダ選択モード
  });
  if (canceled) {
    return null; // キャンセルされた場合はnullを返す
  } else {
    return filePaths[0]; // 選択されたフォルダのパスを返す (単一選択なので最初の要素)
  }
}

// 'open-folder-dialog' IPCメッセージを処理
ipcMain.handle('open-folder-dialog', handleFolderOpen);

// 設定ボタンクリック時の処理 (メインプロセス) - まずはコンソールログ
ipcMain.on('open-settings-dialog', () => {
  console.log('メインプロセス: 設定ダイアログを開くリクエストを受け取りました。');
  // ここで設定ウィンドウを開くなどの処理を将来的に実装
  // 例:
  // const settingsWindow = new BrowserWindow({...});
  // settingsWindow.loadFile('settings.html');
});

// Python連携のためのIPC通信の例 (後で実装)
// ipcMain.handle('run-python-script', async (event, { scriptPath, args }) => {
//   console.log('Pythonスクリプト実行リクエスト受信:', scriptPath, args);
//   // const { spawn } = require('child_process');
//   // return new Promise((resolve, reject) => {
//   //   const pythonProcess = spawn('python', [scriptPath, ...args]);
//   //   let result = '';
//   //   pythonProcess.stdout.on('data', (data) => {
//   //     result += data.toString();
//   //   });
//   //   pythonProcess.stderr.on('data', (data) => {
//   //     console.error(`Python stderr: ${data}`);
//   //   });
//   //   pythonProcess.on('close', (code) => {
//   //     if (code === 0) {
//   //       resolve(result);
//   //     } else {
//   //       reject(new Error(`Python script exited with code ${code}`));
//   //     }
//   //   });
//   // });
// });

// src/main/main.js

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs'); // fsモジュールを追加

// --- 設定ファイルのパス定義 ---
const SETTINGS_FILE_NAME = 'settings.json';
// app.getPath('userData') はアプリが準備できてから呼び出す必要があるため、
// getSettingsFilePath 関数内で呼び出すか、app.whenReady() 以降で定義します。
let settingsFilePath; // app.whenReady() 以降で初期化

// --- デフォルト設定 ---
const defaultSettings = {
  scanSubfolders: true,
  deleteOperation: 'recycleBin', // 'recycleBin' または 'permanently'
  logLevel: 'normal', // 'error', 'normal', 'debug'
  logFilePath: '' // app.whenReady() 以降で初期化
};

// --- 設定ファイルパスを取得する関数 ---
function getSettingsFilePath() {
  if (!settingsFilePath) {
    // app.getPath('userData') は app が準備完了するまで呼び出せないため、
    // この関数が app.whenReady() より前に呼び出される可能性がある場合は注意が必要。
    // 通常は app.whenReady() 以降で settingsFilePath が初期化される想定。
    if (!app.isReady()) {
      // まだ準備ができていない場合は、一時的なパスやエラー処理を検討
      // ここでは、app.whenReady() で settingsFilePath が設定されることを前提とする
      console.warn('getSettingsFilePath called before app is ready. Using potentially uninitialized settingsFilePath.');
    }
    settingsFilePath = path.join(app.getPath('userData'), SETTINGS_FILE_NAME);
  }
  return settingsFilePath;
}

// --- 設定をファイルから読み込む関数 ---
function loadSettingsFromFile() {
  try {
    const filePath = getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const loadedSettings = JSON.parse(fileData);
      // デフォルト設定とマージして、不足しているキーがあっても対応
      return { ...defaultSettings, ...loadedSettings };
    }
    console.log('Settings file not found, returning default settings.'); // メッセージを英語に変更
    return { ...defaultSettings }; // ファイルが存在しない場合はデフォルト設定を返す
  } catch (error) {
    console.error('Failed to load settings file:', error); // メッセージを英語に変更
    return { ...defaultSettings }; // エラー時もデフォルト設定を返す
  }
}

// --- 設定をファイルに保存する関数 ---
function saveSettingsToFile(settings) {
  try {
    const filePath = getSettingsFilePath();
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
    console.log('Settings saved to:', filePath); // メッセージを英語に変更
    return true;
  } catch (error) {
    console.error('Failed to save settings file:', error); // メッセージを英語に変更
    return false;
  }
}


function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/html/index.html'));
  mainWindow.maximize();
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  // settingsFilePath と defaultSettings.logFilePath を app.whenReady() の後で初期化
  settingsFilePath = path.join(app.getPath('userData'), SETTINGS_FILE_NAME);
  defaultSettings.logFilePath = path.join(app.getPath('userData'), 'logs');


  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// フォルダ選択ダイアログを開く処理 (既存のコード)
ipcMain.handle('open-folder-dialog', async (event) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  if (!win) {
    console.error('Parent window not found for dialog.');
    return null;
  }
  try {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: 'フォルダを選択してください', // ダイアログのタイトルは日本語のままでも通常問題ない
      buttonLabel: 'フォルダを選択' // 同上
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    } else {
      console.log('Folder selection was canceled.'); // メッセージを英語に変更
      return null;
    }
  } catch (err) {
    console.error('Error opening folder dialog:', err); // メッセージを英語に変更
    return null;
  }
});

// --- アプリ設定を取得 ---
ipcMain.handle('get-app-settings', async (event) => {
  return loadSettingsFromFile();
});

// --- アプリ設定を保存 ---
ipcMain.handle('save-app-settings', async (event, settings) => {
  return saveSettingsToFile(settings);
});

// --- 初回起動時ガイダンス設定の保存・読み込み ---
// アプリ設定ファイルに含める形で実装します。
// `hideGuidanceOnStartup: true/false` のようなキーで保存します。

ipcMain.handle('get-guidance-setting', async (event) => {
  const settings = loadSettingsFromFile();
  return settings.hideGuidanceOnStartup === true; // booleanで返す
});

ipcMain.handle('save-guidance-setting', async (event, hideGuidance) => {
  let settings = loadSettingsFromFile();
  settings.hideGuidanceOnStartup = hideGuidance;
  return saveSettingsToFile(settings);
});

// --- アプリケーションバージョン取得 ---
ipcMain.handle('get-app-version', async (event) => {
  return app.getVersion();
});

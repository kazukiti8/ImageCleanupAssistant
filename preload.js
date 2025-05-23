// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // レンダラーからメインへメッセージを送信する関数 (既存)
  sendMessage: (message) => ipcRenderer.send('message-from-renderer', message),
  // メインからメッセージを受信するためのリスナー設定関数 (既存)
  onMainMessage: (callback) => ipcRenderer.on('message-from-main', callback),

  // フォルダ選択ダイアログを開くようメインプロセスに要求する関数 (新規追加)
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),

  // 設定ダイアログを開くようメインプロセスに要求する関数 (新規追加)
  openSettingsDialog: () => ipcRenderer.send('open-settings-dialog'),

  // Pythonスクリプト実行をリクエストする関数 (既存の例)
  runPythonScript: (scriptPath, args) => ipcRenderer.invoke('run-python-script', { scriptPath, args })
  // 他に必要なAPIをここに追加していく
});

console.log('プリロードスクリプトがロードされました。electronAPI が公開されています。');

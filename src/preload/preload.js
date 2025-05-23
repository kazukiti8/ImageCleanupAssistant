// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Electronの機能をレンダラープロセスに公開
contextBridge.exposeInMainWorld('electronAPI', {
    // -----------------------------------------------------------------------
    // IPC通信（レンダラー → メイン）
    // -----------------------------------------------------------------------
    
    // メッセージ送信（汎用）
    sendMessage: (message) => ipcRenderer.send('message-from-renderer', message),
    
    // フォルダ選択ダイアログを開く
    openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
    
    // 設定ダイアログを開く
    openSettingsDialog: () => ipcRenderer.send('open-settings-dialog'),
    
    // アプリ設定を保存
    saveAppSettings: (settings) => ipcRenderer.invoke('save-app-settings', settings),
    
    // アプリ設定を取得
    getAppSettings: () => ipcRenderer.invoke('get-app-settings'),
    
    // ガイダンス設定を保存
    saveGuidanceSetting: (dontShow) => ipcRenderer.invoke('save-guidance-setting', dontShow),
    
    // ガイダンス設定を取得
    getGuidanceSetting: () => ipcRenderer.invoke('get-guidance-setting'),
    
    // スキャン処理の実行
    scanFolder: (folderPath, options) => ipcRenderer.invoke('scan-folder', { folderPath, options }),
    
    // 画像ファイル操作
    moveToTrash: (filePaths) => ipcRenderer.invoke('move-to-trash', filePaths),
    deletePermanently: (filePaths) => ipcRenderer.invoke('delete-permanently', filePaths),
    moveFiles: (filePaths, destinationPath) => ipcRenderer.invoke('move-files', { filePaths, destinationPath }),
    
    // エラーログのエクスポート
    exportErrorLog: (errorData, filePath) => ipcRenderer.invoke('export-error-log', { errorData, filePath }),
    
    // アプリケーションバージョン取得
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // -----------------------------------------------------------------------
    // IPC通信（メイン → レンダラー）
    // -----------------------------------------------------------------------
    
    // メインプロセスからのメッセージを受信するためのリスナー設定
    onMainMessage: (callback) => {
        ipcRenderer.on('message-from-main', (_event, message) => callback(message));
        return () => ipcRenderer.removeListener('message-from-main', callback);
    },
    
    // スキャン進捗の受信
    onScanProgress: (callback) => {
        ipcRenderer.on('scan-progress', (_event, progressData) => callback(progressData));
        return () => ipcRenderer.removeListener('scan-progress', callback);
    },
    
    // スキャン結果の受信
    onScanComplete: (callback) => {
        ipcRenderer.on('scan-complete', (_event, results) => callback(results));
        return () => ipcRenderer.removeListener('scan-complete', callback);
    },
    
    // スキャンエラーの受信
    onScanError: (callback) => {
        ipcRenderer.on('scan-error', (_event, error) => callback(error));
        return () => ipcRenderer.removeListener('scan-error', callback);
    },
    
    // ファイル操作の結果受信
    onFileOperationComplete: (callback) => {
        ipcRenderer.on('file-operation-complete', (_event, result) => callback(result));
        return () => ipcRenderer.removeListener('file-operation-complete', callback);
    },
    
    // ファイル操作のエラー受信
    onFileOperationError: (callback) => {
        ipcRenderer.on('file-operation-error', (_event, error) => callback(error));
        return () => ipcRenderer.removeListener('file-operation-error', callback);
    }
});

console.log('プリロードスクリプトがロードされました。electronAPI が公開されています。');
// settingsManager.js - アプリ設定管理用モジュール

/**
 * アプリ設定管理クラス
 */
export class SettingsManager {
    /**
     * コンストラクタ
     * @param {Object} options - 設定オプション
     * @param {string} options.modalOverlayId - モーダルオーバーレイのID
     * @param {string} options.openBtnId - 設定を開くボタンのID
     * @param {string} options.closeBtnId - 閉じるボタンのID
     * @param {string} options.cancelBtnId - キャンセルボタンのID
     * @param {string} options.applyBtnId - 適用ボタンのID
     * @param {string} options.okBtnId - OKボタンのID
     * @param {Object} options.formControls - 設定フォームコントロールのIDマップ
     */
    constructor(options) {
        this.modalOverlay = document.getElementById(options.modalOverlayId || 'settingsModalOverlay');
        this.openBtn = document.getElementById(options.openBtnId || 'settingsBtn');
        this.closeBtn = document.getElementById(options.closeBtnId || 'closeSettingsModalBtn');
        this.cancelBtn = document.getElementById(options.cancelBtnId || 'settingsCancelBtn');
        this.applyBtn = document.getElementById(options.applyBtnId || 'settingsApplyBtn');
        this.okBtn = document.getElementById(options.okBtnId || 'settingsOkBtn');
        
        // 設定フォームコントロール
        this.formControls = options.formControls || {
            scanSubfoldersCheckbox: 'scanSubfolders',
            deleteToRecycleBinRadio: 'deleteToRecycleBin',
            deletePermanentlyRadio: 'deletePermanently',
            logLevelSelect: 'logLevel',
            logFilePathInput: 'logFilePathInput',
            changeLogPathButton: 'changeLogPathButton'
        };
        
        // フォーム要素を取得
        this.formElements = {};
        for (const key in this.formControls) {
            this.formElements[key] = document.getElementById(this.formControls[key]);
        }
        
        // デフォルト設定
        this.defaultSettings = {
            scanSubfolders: true,
            deleteOperation: 'recycleBin',
            logLevel: 'normal',
            logFilePath: this.getDefaultLogPath()
        };
        
        // 現在の設定（初期値はデフォルト設定）
        this.currentSettings = { ...this.defaultSettings };
        
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        // 設定ボタンのイベント設定
        if (this.openBtn) {
            this.openBtn.addEventListener('click', () => {
                this.openSettingsModal();
            });
        }
        
        // 閉じるボタンのイベント設定
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.closeSettingsModal();
            });
        }
        
        // キャンセルボタンのイベント設定
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => {
                this.closeSettingsModal();
            });
        }
        
        // 適用ボタンのイベント設定
        if (this.applyBtn) {
            this.applyBtn.addEventListener('click', () => {
                this.applySettings();
            });
        }
        
        // OKボタンのイベント設定
        if (this.okBtn) {
            this.okBtn.addEventListener('click', () => {
                this.applySettings();
                this.closeSettingsModal();
            });
        }
        
        // ログパス変更ボタンのイベント設定
        if (this.formElements.changeLogPathButton) {
            this.formElements.changeLogPathButton.addEventListener('click', async () => {
                await this.selectLogFolder();
            });
        }
        
        // 初期設定の読み込み
        this.loadSettings();
    }
    
    /**
     * 設定モーダルを開く
     */
    openSettingsModal() {
        console.log('設定モーダルを開きます');
        
        // 現在の設定をフォームに反映
        this.updateFormFromSettings();
        
        if (this.modalOverlay) {
            this.modalOverlay.classList.remove('hidden');
        }
    }
    
    /**
     * 設定モーダルを閉じる
     */
    closeSettingsModal() {
        console.log('設定モーダルを閉じます');
        
        if (this.modalOverlay) {
            this.modalOverlay.classList.add('hidden');
        }
    }
    
    /**
     * 設定をフォームから取得して適用
     */
    applySettings() {
        console.log('設定を適用します');
        
        // フォームから設定を取得
        const newSettings = {
            scanSubfolders: this.formElements.scanSubfoldersCheckbox ? this.formElements.scanSubfoldersCheckbox.checked : this.defaultSettings.scanSubfolders,
            deleteOperation: this.formElements.deleteToRecycleBinRadio && this.formElements.deleteToRecycleBinRadio.checked ? 'recycleBin' : 'permanently',
            logLevel: this.formElements.logLevelSelect ? this.formElements.logLevelSelect.value : this.defaultSettings.logLevel,
            logFilePath: this.formElements.logFilePathInput ? this.formElements.logFilePathInput.value : this.defaultSettings.logFilePath
        };
        
        // 設定を更新
        this.currentSettings = { ...newSettings };
        
        // 設定をElectronのメインプロセスに保存
        this.saveSettings();
    }
    
    /**
     * 設定をElectronのメインプロセスに保存
     */
    saveSettings() {
        if (window.electronAPI && typeof window.electronAPI.saveAppSettings === 'function') {
            window.electronAPI.saveAppSettings(this.currentSettings)
                .then(() => {
                    console.log('設定が保存されました');
                })
                .catch(error => {
                    console.error('設定の保存中にエラーが発生しました:', error);
                });
        } else {
            console.log('設定を保存します（ダミー）:', this.currentSettings);
            // 開発時やElectron APIが利用できない場合はローカルストレージに保存
            try {
                localStorage.setItem('appSettings', JSON.stringify(this.currentSettings));
            } catch (error) {
                console.error('ローカルストレージへの保存中にエラーが発生しました:', error);
            }
        }
    }
    
    /**
     * 設定をElectronのメインプロセスまたはローカルストレージから読み込む
     */
    loadSettings() {
        if (window.electronAPI && typeof window.electronAPI.getAppSettings === 'function') {
            window.electronAPI.getAppSettings()
                .then(settings => {
                    if (settings) {
                        this.currentSettings = { ...this.defaultSettings, ...settings };
                        this.updateFormFromSettings();
                        console.log('設定が読み込まれました');
                    }
                })
                .catch(error => {
                    console.error('設定の読み込み中にエラーが発生しました:', error);
                });
        } else {
            // 開発時やElectron APIが利用できない場合はローカルストレージから読み込み
            try {
                const savedSettings = localStorage.getItem('appSettings');
                if (savedSettings) {
                    this.currentSettings = { ...this.defaultSettings, ...JSON.parse(savedSettings) };
                    this.updateFormFromSettings();
                    console.log('設定がローカルストレージから読み込まれました');
                }
            } catch (error) {
                console.error('ローカルストレージからの読み込み中にエラーが発生しました:', error);
            }
        }
    }
    
    /**
     * 現在の設定をフォームに反映
     */
    updateFormFromSettings() {
        // サブフォルダスキャン設定
        if (this.formElements.scanSubfoldersCheckbox) {
            this.formElements.scanSubfoldersCheckbox.checked = this.currentSettings.scanSubfolders;
        }
        
        // 削除操作設定
        if (this.formElements.deleteToRecycleBinRadio && this.formElements.deletePermanentlyRadio) {
            if (this.currentSettings.deleteOperation === 'recycleBin') {
                this.formElements.deleteToRecycleBinRadio.checked = true;
                this.formElements.deletePermanentlyRadio.checked = false;
            } else {
                this.formElements.deleteToRecycleBinRadio.checked = false;
                this.formElements.deletePermanentlyRadio.checked = true;
            }
        }
        
        // ログレベル設定
        if (this.formElements.logLevelSelect) {
            this.formElements.logLevelSelect.value = this.currentSettings.logLevel;
        }
        
        // ログファイルパス設定
        if (this.formElements.logFilePathInput) {
            this.formElements.logFilePathInput.value = this.currentSettings.logFilePath;
        }
    }
    
    /**
     * デフォルトのログパスを取得
     * @returns {string} デフォルトのログパス
     */
    getDefaultLogPath() {
        // ダミーパス（実際はOSごとに適切なパスを返す処理が必要）
        return 'C:\\Users\\YourName\\AppData\\Local\\ImageCleanupAssistant\\logs';
    }
    
    /**
     * ログフォルダを選択するダイアログを表示
     */
    async selectLogFolder() {
        if (window.electronAPI && typeof window.electronAPI.openFolderDialog === 'function') {
            try {
                const folderPath = await window.electronAPI.openFolderDialog();
                if (folderPath && this.formElements.logFilePathInput) {
                    this.formElements.logFilePathInput.value = folderPath;
                }
            } catch (error) {
                console.error('フォルダ選択中にエラーが発生しました:', error);
            }
        } else {
            console.log('フォルダ選択ダイアログを開きます（ダミー）');
            // 開発時やElectron APIが利用できない場合はダミーパスを設定
            if (this.formElements.logFilePathInput) {
                this.formElements.logFilePathInput.value = this.getDefaultLogPath();
            }
        }
    }
    
    /**
     * 現在の設定を取得
     * @returns {Object} 現在の設定
     */
    getSettings() {
        return { ...this.currentSettings };
    }
    
    /**
     * 設定を更新
     * @param {Object} newSettings - 新しい設定
     * @param {boolean} [saveToStorage=true] - ストレージに保存するかどうか
     */
    updateSettings(newSettings, saveToStorage = true) {
        this.currentSettings = { ...this.currentSettings, ...newSettings };
        
        if (saveToStorage) {
            this.saveSettings();
        }
    }
}

// デフォルト設定でインスタンスをエクスポート（シングルトンパターン）
export default new SettingsManager({
    modalOverlayId: 'settingsModalOverlay',
    openBtnId: 'settingsBtn',
    closeBtnId: 'closeSettingsModalBtn',
    cancelBtnId: 'settingsCancelBtn',
    applyBtnId: 'settingsApplyBtn',
    okBtnId: 'settingsOkBtn',
    formControls: {
        scanSubfoldersCheckbox: 'scanSubfolders',
        deleteToRecycleBinRadio: 'deleteToRecycleBin',
        deletePermanentlyRadio: 'deletePermanently',
        logLevelSelect: 'logLevel',
        logFilePathInput: 'logFilePathInput',
        changeLogPathButton: 'changeLogPathButton'
    }
});
// folderSelector.js - フォルダ選択機能を管理するモジュール

/**
 * フォルダ選択管理クラス
 */
export class FolderSelector {
    /**
     * コンストラクタ
     * @param {Object} options - フォルダ選択設定オプション
     * @param {string} options.buttonId - 選択ボタンのID
     * @param {string} options.displayId - パス表示要素のID
     * @param {Function} options.onFolderSelect - フォルダ選択時のコールバック関数
     */
    constructor(options) {
        this.button = document.getElementById(options.buttonId);
        this.display = document.getElementById(options.displayId);
        this.onFolderSelect = options.onFolderSelect || null;
        this.selectedPath = null;
        this.defaultText = '選択されていません';
        
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        if (!this.button || !this.display) return;
        
        // ボタンクリックイベントの設定
        this.button.addEventListener('click', async () => {
            const path = await this.openFolderDialog();
            if (path) {
                this.setSelectedPath(path);
                
                // フォルダ選択コールバックが設定されていれば呼び出す
                if (typeof this.onFolderSelect === 'function') {
                    this.onFolderSelect(path);
                }
            }
        });
        
        // 初期表示の設定
        this.display.textContent = this.defaultText;
        this.display.title = this.defaultText;
    }
    
    /**
     * フォルダ選択ダイアログを開く
     * @returns {Promise<string|null>} 選択されたパスまたはnull
     */
    async openFolderDialog() {
        try {
            if (window.electronAPI && typeof window.electronAPI.openFolderDialog === 'function') {
                const folderPath = await window.electronAPI.openFolderDialog();
                
                if (folderPath) {
                    console.log('選択されたフォルダ:', folderPath);
                    return folderPath;
                } else {
                    console.log('フォルダ選択がキャンセルされました。');
                    return null;
                }
            } else {
                console.warn('electronAPI.openFolderDialog is not available.');
                
                // 開発モード用のダミーパス
                // this.buttonがtargetFolderBtnであればユーザーのピクチャフォルダ、それ以外なら整理用フォルダ
                const isDummyTargetFolder = this.button && this.button.id === 'targetFolderBtn';
                const dummyPath = isDummyTargetFolder ? "C:\\Users\\DevUser\\Pictures\\SamplePhotos" : "D:\\OrganizedPictures";
                
                console.log('選択されたフォルダ (開発用ダミー):', dummyPath);
                return dummyPath;
            }
        } catch (error) {
            console.error('フォルダ選択中にエラーが発生しました:', error);
            
            // エラー状態をUIに反映
            if (this.display) {
                this.display.textContent = 'エラーが発生しました';
                this.display.title = 'フォルダ選択エラー';
            }
            
            // ステータスバーにエラーメッセージを表示
            const statusBar = document.getElementById('statusBar');
            if (statusBar) {
                statusBar.textContent = 'フォルダ選択エラー';
            }
            
            return null;
        }
    }
    
    /**
     * 選択されたパスを設定
     * @param {string} path - 選択されたパス
     */
    setSelectedPath(path) {
        if (!path || !this.display) return;
        
        this.selectedPath = path;
        this.display.textContent = path;
        this.display.title = path;
    }
    
    /**
     * 選択されたパスを取得
     * @returns {string|null} 選択されたパス
     */
    getSelectedPath() {
        return this.selectedPath;
    }
    
    /**
     * 選択状態をリセット
     */
    reset() {
        this.selectedPath = null;
        
        if (this.display) {
            this.display.textContent = this.defaultText;
            this.display.title = this.defaultText;
        }
    }
    
    /**
     * 選択されているかどうかを確認
     * @returns {boolean} 選択されているかどうか
     */
    isSelected() {
        return !!this.selectedPath;
    }
}

// 対象フォルダ選択機能のインスタンス
export const targetFolderSelector = new FolderSelector({
    buttonId: 'targetFolderBtn',
    displayId: 'targetFolderPath',
    onFolderSelect: (path) => {
        console.log('対象フォルダが選択されました:', path);
        // スキャンボタンの有効化など
        const scanBtn = document.getElementById('scanBtn');
        if (scanBtn) {
            scanBtn.disabled = false;
            scanBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
});

// 移動先フォルダ選択機能のインスタンス
export const outputFolderSelector = new FolderSelector({
    buttonId: 'outputFolderBtn',
    displayId: 'outputFolderPath',
    onFolderSelect: (path) => {
        console.log('移動先フォルダが選択されました:', path);
        // 移動ボタンの有効化など
        const moveBtn = document.getElementById('btnMove');
        if (moveBtn) {
            moveBtn.disabled = false;
            moveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
});

// フォルダ選択機能をまとめたオブジェクトをデフォルトエクスポート
export default {
    targetFolder: targetFolderSelector,
    outputFolder: outputFolderSelector
};
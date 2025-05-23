// tabManager.js - タブ切り替え機能を管理するモジュール

/**
 * タブ管理クラス
 */
export class TabManager {
    /**
     * コンストラクタ
     * @param {Object} options - タブ設定オプション
     * @param {string} options.tabButtonSelector - タブボタンのセレクタ
     * @param {string} options.tabContentSelector - タブコンテンツのセレクタ
     * @param {string} options.activeTabClass - アクティブタブに適用するクラス名
     * @param {string} options.filterPanelSelector - フィルターパネルのセレクタ
     * @param {string} options.currentFilterTabNameId - 現在のフィルタータブ名を表示する要素のID
     * @param {Function} options.onTabChange - タブ変更時のコールバック関数
     */
    constructor(options) {
        this.tabButtons = document.querySelectorAll(options.tabButtonSelector || '.tab-button');
        this.tabContents = document.querySelectorAll(options.tabContentSelector || '.tab-content');
        this.filterPanels = document.querySelectorAll(options.filterPanelSelector || '.filter-options');
        this.currentFilterTabName = document.getElementById(options.currentFilterTabNameId || 'currentFilterTabName');
        this.activeTabClass = options.activeTabClass || 'tab-active';
        this.onTabChange = options.onTabChange || null;
        
        this.activeTabId = null;
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.setActiveTab(button.id);
            });
        });
        
        // 最初のタブをアクティブにする（既にアクティブなタブがあればそれを維持）
        const activeTab = document.querySelector(`.${this.activeTabClass}`);
        if (activeTab) {
            this.setActiveTab(activeTab.id);
        } else if (this.tabButtons.length > 0) {
            this.setActiveTab(this.tabButtons[0].id);
        }
    }
    
    /**
     * アクティブタブを設定
     * @param {string} tabId - アクティブにするタブのID
     */
    setActiveTab(tabId) {
        if (!tabId) return;
        
        // 前回と同じタブがクリックされた場合は何もしない
        if (this.activeTabId === tabId) return;
        
        const button = document.getElementById(tabId);
        if (!button) return;
        
        // すべてのタブボタンからアクティブクラスを削除
        this.tabButtons.forEach(btn => btn.classList.remove(this.activeTabClass));
        
        // クリックされたタブにアクティブクラスを追加
        button.classList.add(this.activeTabClass);
        
        // ターゲットのコンテンツIDを取得
        const targetContentId = button.dataset.targetContent;
        
        // すべてのタブコンテンツを非表示
        this.tabContents.forEach(content => {
            content.classList.toggle('hidden', content.id !== targetContentId);
        });
        
        // すべてのフィルターパネルを非表示
        this.filterPanels.forEach(panel => panel.classList.add('hidden'));
        
        // タブに対応するフィルターパネルIDとタブ名を取得
        let filterPanelId = '';
        let filterTabNameText = '';
        
        switch (tabId) {
            case 'blurTab':
                filterPanelId = 'blurFilterPanel';
                filterTabNameText = 'ブレ画像';
                this.toggleExportErrorLogButton(false);
                this.toggleFooterActions('general');
                this.updateFooterInfo('general');
                break;
            case 'similarTab':
                filterPanelId = 'similarFilterPanel';
                filterTabNameText = '類似画像';
                this.toggleExportErrorLogButton(false);
                this.toggleFooterActions('general');
                this.updateFooterInfo('similar');
                break;
            case 'errorTab':
                filterPanelId = 'errorFilterPanel';
                filterTabNameText = 'エラー';
                this.toggleExportErrorLogButton(true);
                this.toggleFooterActions('error');
                this.updateFooterInfo('error');
                break;
            default:
                break;
        }
        
        // 対応するフィルターパネルを表示
        const targetFilterPanel = document.getElementById(filterPanelId);
        if (targetFilterPanel) targetFilterPanel.classList.remove('hidden');
        
        // フィルタータブ名を更新
        if (this.currentFilterTabName) this.currentFilterTabName.textContent = filterTabNameText;
        
        // アクティブタブIDを更新
        this.activeTabId = tabId;
        
        console.log(`タブ ${tabId} がアクティブになりました。`);
        
        // タブ変更コールバックが設定されていれば呼び出す
        if (typeof this.onTabChange === 'function') {
            this.onTabChange(tabId, targetContentId);
        }
    }
    
    /**
     * エラーログエクスポートボタンの表示切替
     * @param {boolean} show - 表示するか非表示にするか
     */
    toggleExportErrorLogButton(show) {
        const exportErrorLogBtn = document.getElementById('exportErrorLogBtn');
        if (exportErrorLogBtn) {
            exportErrorLogBtn.classList.toggle('hidden', !show);
        }
    }
    
    /**
     * フッターのアクション表示切替
     * @param {string} type - アクションタイプ ('general'または'error')
     */
    toggleFooterActions(type) {
        const generalActions = document.getElementById('generalActions');
        const errorActions = document.getElementById('errorActions');
        
        if (generalActions && errorActions) {
            if (type === 'general') {
                generalActions.classList.remove('hidden');
                errorActions.classList.add('hidden');
            } else if (type === 'error') {
                generalActions.classList.add('hidden');
                errorActions.classList.remove('hidden');
            }
        }
    }
    
    /**
     * フッター情報表示の更新
     * @param {string} type - 情報タイプ ('general', 'similar', 'error')
     */
    updateFooterInfo(type) {
        const footerInfoContainer = document.getElementById('footerInfoContainer');
        if (!footerInfoContainer) return;
        
        switch (type) {
            case 'general':
                footerInfoContainer.innerHTML = `選択中のアイテム: <span id="selectedItemCount" class="font-semibold text-slate-800">0件</span> (合計サイズ: <span id="selectedItemSize" class="font-semibold text-slate-800">0 MB</span>)`;
                break;
            case 'similar':
                footerInfoContainer.innerHTML = `選択中のアイテム: <span id="selectedPairCount" class="font-semibold text-slate-800">0ペア, 0ファイル</span> (合計サイズ: <span id="selectedItemSize" class="font-semibold text-slate-800">0 MB</span>)`;
                break;
            case 'error':
                footerInfoContainer.innerHTML = `選択中のアイテム: <span id="selectedErrorCount" class="font-semibold text-slate-800">0件</span> (エラーリスト)`;
                break;
            default:
                break;
        }
    }
    
    /**
     * 現在のアクティブタブIDを取得
     * @returns {string} アクティブタブID
     */
    getActiveTabId() {
        return this.activeTabId;
    }
    
    /**
     * タブのカウント数を更新
     * @param {string} tabId - タブID ('blurTab', 'similarTab', 'errorTab')
     * @param {number} count - カウント数
     */
    updateTabCount(tabId, count) {
        const countElement = document.getElementById(`${tabId}Count`);
        if (countElement) {
            countElement.textContent = `(${count})`;
        }
    }
    
    /**
     * すべてのタブのカウント数を更新
     * @param {Object} counts - タブごとのカウント数 {blur: number, similar: number, error: number}
     */
    updateAllTabCounts(counts) {
        if (counts.blur !== undefined) this.updateTabCount('blurTab', counts.blur);
        if (counts.similar !== undefined) this.updateTabCount('similarTab', counts.similar);
        if (counts.error !== undefined) this.updateTabCount('errorTab', counts.error);
    }
}

// デフォルト設定でインスタンスをエクスポート（シングルトンパターン）
export default new TabManager({
    tabButtonSelector: '.tab-button',
    tabContentSelector: '.tab-content',
    filterPanelSelector: '.filter-options',
    currentFilterTabNameId: 'currentFilterTabName',
    activeTabClass: 'tab-active',
    onTabChange: (tabId, contentId) => {
        console.log(`タブ変更: ${tabId} -> ${contentId}`);
        // TODO: 必要に応じて追加のアクションを実装
    }
});
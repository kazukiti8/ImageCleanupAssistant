// guidance.js - 初回起動時のガイダンス機能を管理するモジュール

/**
 * ガイダンス管理クラス
 */
export class GuidanceManager {
    /**
     * コンストラクタ
     * @param {Object} options - ガイダンス設定オプション
     * @param {Array} options.steps - ガイダンスステップの配列
     * @param {string} options.modalOverlayId - モーダルオーバーレイのID
     * @param {string} options.spotlightOverlayId - スポットライトオーバーレイのID
     * @param {string} options.titleId - タイトル要素のID
     * @param {string} options.textId - テキスト要素のID
     * @param {string} options.nextBtnId - 次へボタンのID
     * @param {string} options.nextBtnTextId - 次へボタンのテキスト要素のID
     * @param {string} options.nextBtnIconId - 次へボタンのアイコン要素のID
     * @param {string} options.skipBtnId - スキップボタンのID
     * @param {string} options.dontShowAgainContainerId - 「次回から表示しない」コンテナのID
     * @param {string} options.dontShowAgainCheckboxId - 「次回から表示しない」チェックボックスのID
     * @param {Function} options.onComplete - ガイダンス完了時のコールバック関数
     */
    constructor(options) {
        this.steps = options.steps || [];
        this.modalOverlay = document.getElementById(options.modalOverlayId || 'guidanceModalOverlay');
        this.spotlightOverlay = document.getElementById(options.spotlightOverlayId || 'guidanceSpotlightOverlay');
        this.titleElement = document.getElementById(options.titleId || 'guidanceTitle');
        this.textElement = document.getElementById(options.textId || 'guidanceText');
        this.nextBtn = document.getElementById(options.nextBtnId || 'nextGuidanceBtn');
        this.nextBtnText = document.getElementById(options.nextBtnTextId || 'nextGuidanceBtnText');
        this.nextBtnIcon = document.getElementById(options.nextBtnIconId || 'nextGuidanceBtnIcon');
        this.skipBtn = document.getElementById(options.skipBtnId || 'skipGuidanceBtn');
        this.dontShowAgainContainer = document.getElementById(options.dontShowAgainContainerId || 'dontShowAgainContainer');
        this.dontShowAgainCheckbox = document.getElementById(options.dontShowAgainCheckboxId || 'dontShowAgainCheckbox');
        this.onComplete = options.onComplete || null;
        
        this.currentStepIndex = 0;
        this.highlightedElements = [];
        
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.showNextStep();
            });
        }
        
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => {
                this.close();
            });
        }
    }
    
    /**
     * ハイライト表示をクリア
     */
    clearHighlights() {
        this.highlightedElements.forEach(el => {
            if (el) el.classList.remove('highlighted-element');
        });
        this.highlightedElements = [];
        
        if (this.spotlightOverlay) {
            this.spotlightOverlay.classList.add('hidden');
        }
    }
    
    /**
     * スポットライト効果を適用
     * @param {string|Array<string>} targetElementIds - ハイライト対象の要素ID（単一または配列）
     */
    applySpotlight(targetElementIds) {
        this.clearHighlights();
        
        if (!targetElementIds) {
            if (this.spotlightOverlay) this.spotlightOverlay.style.clipPath = '';
            return;
        }
        
        const targets = Array.isArray(targetElementIds) ? targetElementIds : [targetElementIds];
        let pathDef = 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%';
        
        targets.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('highlighted-element');
                this.highlightedElements.push(element);
                const rect = element.getBoundingClientRect();
                pathDef += `, ${rect.left}px ${rect.top}px, ${rect.left}px ${rect.bottom}px, ${rect.right}px ${rect.bottom}px, ${rect.right}px ${rect.top}px, ${rect.left}px ${rect.top}px`;
            }
        });
        
        if (this.spotlightOverlay) {
            this.spotlightOverlay.style.clipPath = pathDef + ')';
            this.spotlightOverlay.classList.remove('hidden');
        }
    }
    
    /**
     * 指定したステップを表示
     * @param {number} stepIndex - 表示するステップのインデックス
     */
    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.close();
            return;
        }
        
        this.currentStepIndex = stepIndex;
        const step = this.steps[stepIndex];
        
        if (this.titleElement) this.titleElement.textContent = step.title;
        if (this.textElement) this.textElement.textContent = step.text;
        
        if (this.nextBtnText) this.nextBtnText.textContent = step.nextButtonText;
        if (this.nextBtnIcon && step.nextButtonIconSvg) this.nextBtnIcon.innerHTML = step.nextButtonIconSvg;
        
        this.applySpotlight(step.targetElementId);
        
        if (this.skipBtn) this.skipBtn.style.display = step.showSkip ? 'flex' : 'none';
        if (this.dontShowAgainContainer) this.dontShowAgainContainer.style.display = step.showDontShowAgain ? 'flex' : 'none';
        
        if (this.modalOverlay) this.modalOverlay.classList.remove('hidden');
    }
    
    /**
     * 次のステップを表示
     */
    showNextStep() {
        this.showStep(this.currentStepIndex + 1);
    }
    
    /**
     * ガイダンスを開始
     */
    start() {
        this.currentStepIndex = 0;
        this.showStep(0);
    }
    
    /**
     * ガイダンスを閉じる
     */
    close() {
        if (this.modalOverlay) this.modalOverlay.classList.add('hidden');
        this.clearHighlights();
        
        const dontShow = this.dontShowAgainCheckbox ? this.dontShowAgainCheckbox.checked : false;
        console.log("ガイダンスを閉じました。'次回から表示しない':", dontShow);
        
        // 設定をElectronのメインプロセスに保存
        if (window.electronAPI && typeof window.electronAPI.saveGuidanceSetting === 'function') {
            window.electronAPI.saveGuidanceSetting(dontShow);
        }
        
        // 完了コールバックが設定されていれば呼び出す
        if (typeof this.onComplete === 'function') {
            this.onComplete(dontShow);
        }
    }
}

// デフォルトのガイダンスステップ
export const defaultGuidanceSteps = [
    {
        title: "イメージクリーンアップアシスタントへようこそ！",
        text: "簡単な操作でPC内の画像をスッキリ整理できます。いくつかの主要なステップをご案内します。",
        targetElementId: null,
        nextButtonText: "次へ",
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
        showSkip: true,
        showDontShowAgain: true
    },
    {
        title: "ステップ1：スキャンするフォルダを選択",
        text: "はじめに、整理したい画像が保存されているフォルダを選びましょう。こちらのボタンから選択できます。",
        targetElementId: "targetFolderBtn",
        nextButtonText: "次へ",
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
        showSkip: false,
        showDontShowAgain: false
    },
    {
        title: "ステップ2：スキャンを開始",
        text: "フォルダを選択したら、このボタンを押して画像のスキャンを開始します。ブレ画像や類似画像などを自動で検出します。",
        targetElementId: "scanBtn",
        nextButtonText: "次へ",
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
        showSkip: false,
        showDontShowAgain: false
    },
    {
        title: "ステップ3：結果を確認",
        text: "スキャンが完了すると、結果がここに表示されます。タブを切り替えて検出された画像を確認し、プレビューで詳細をチェックしましょう。",
        targetElementId: ["tabContainer", "leftPane"],
        nextButtonText: "次へ",
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
        showSkip: false,
        showDontShowAgain: false
    },
    {
        title: "ステップ4：画像を選択して整理",
        text: "整理したい画像をリストで選択し、下のアクションボタンで削除や移動を実行します。不要な画像を安全に整理できます。",
        targetElementId: ["centerPane", "footerActionsContainer"],
        nextButtonText: "次へ",
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
        showSkip: false,
        showDontShowAgain: false
    },
    {
        title: "準備完了！",
        text: "これで基本的な操作は完了です！さっそく画像整理を始めてみましょう。",
        targetElementId: null,
        nextButtonText: "開始する",
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 mr-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12.65 10C12.28 5.96 8.78 3 4.5 3C2.02 3 0 5.02 0 7.5c0 1.74 1.01 3.24 2.43 3.97l.16.08C2.71 12.82 3.81 14 5.03 14c.17 0 .34-.02.5-.05l.16-.03c1.03-.2 1.95-.76 2.59-1.52l.09-.11.05-.1c.55-.81.8-1.75.71-2.71l-.02-.18zm8.92 2.01L19.14 10l2.43-2.43-1.41-1.41L17.72 8.59l-2.43-2.43-1.41 1.41L16.31 10l-2.43 2.43 1.41 1.41L17.72 11.41l2.43 2.43 1.41-1.41zM4.5 12c-1.38 0-2.5-1.12-2.5-2.5S3.12 7 4.5 7s2.5 1.12 2.5 2.5S5.88 12 4.5 12zM12 16c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`,
        showSkip: false,
        showDontShowAgain: true
    }
];

// デフォルト設定でインスタンスをエクスポート（シングルトンパターン）
export default new GuidanceManager({
    steps: defaultGuidanceSteps,
    modalOverlayId: 'guidanceModalOverlay',
    spotlightOverlayId: 'guidanceSpotlightOverlay',
    titleId: 'guidanceTitle',
    textId: 'guidanceText',
    nextBtnId: 'nextGuidanceBtn',
    nextBtnTextId: 'nextGuidanceBtnText',
    nextBtnIconId: 'nextGuidanceBtnIcon',
    skipBtnId: 'skipGuidanceBtn',
    dontShowAgainContainerId: 'dontShowAgainContainer',
    dontShowAgainCheckboxId: 'dontShowAgainCheckbox',
    onComplete: (dontShow) => {
        console.log(`ガイダンスが完了しました。次回から表示しない: ${dontShow}`);
    }
});
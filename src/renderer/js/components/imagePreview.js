// imagePreview.js - 画像プレビュー機能を管理するモジュール

/**
 * 画像プレビュー機能を管理するクラス
 */
export class ImagePreview {
    /**
     * コンストラクタ
     * @param {Object} options - プレビュー設定オプション
     * @param {string} options.previewImageId - メインプレビュー画像のID
     * @param {string} options.previewImage2Id - 比較用プレビュー画像のID（類似画像用）
     * @param {string} options.containerID - プレビュー画像コンテナのID
     * @param {string} options.zoomSliderId - ズームスライダーのID
     * @param {string} options.zoomInputId - ズーム入力フィールドのID
     * @param {string} options.zoomValueDisplayId - ズーム値表示のID
     * @param {string} options.zoomInBtnId - 拡大ボタンのID
     * @param {string} options.zoomOutBtnId - 縮小ボタンのID
     * @param {string} options.resetZoomBtnId - ズームリセットボタンのID
     */
    constructor(options) {
        this.previewImage = document.getElementById(options.previewImageId || 'previewImage');
        this.previewImage2 = document.getElementById(options.previewImage2Id || 'previewImage2');
        this.container = document.getElementById(options.containerID || 'previewImageContainer');
        this.zoomSlider = document.getElementById(options.zoomSliderId || 'zoomSlider');
        this.zoomInput = document.getElementById(options.zoomInputId || 'zoomInput');
        this.zoomValueDisplay = document.getElementById(options.zoomValueDisplayId || 'zoomValueDisplay');
        this.zoomInBtn = document.getElementById(options.zoomInBtnId || 'zoomInBtn');
        this.zoomOutBtn = document.getElementById(options.zoomOutBtnId || 'zoomOutBtn');
        this.resetZoomBtn = document.getElementById(options.resetZoomBtnId || 'resetZoomBtn');
        
        this.currentZoomLevel = 100; // デフォルトズーム値
        this.isSideBySideMode = false; // 2画像を横並びで表示するかのフラグ
        this.isDragging = false; // 画像ドラッグ中フラグ
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        // ズーム関連のイベントリスナー設定
        if (this.zoomSlider) {
            this.zoomSlider.addEventListener('input', (e) => this.updateZoom(e.target.value));
        }
        
        if (this.zoomInput) {
            this.zoomInput.addEventListener('change', (e) => this.updateZoom(e.target.value));
            this.zoomInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.updateZoom(e.target.value);
            });
        }
        
        if (this.zoomInBtn) {
            this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        }
        
        if (this.zoomOutBtn) {
            this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        }
        
        if (this.resetZoomBtn) {
            this.resetZoomBtn.addEventListener('click', () => this.resetZoom());
        }
        
        // ドラッグ＆ドロップによる画像移動の設定
        this.setupImageDragging();
        
        // マウスホイールによるズーム
        if (this.container) {
            this.container.addEventListener('wheel', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    if (e.deltaY < 0) {
                        this.zoomIn(5);
                    } else {
                        this.zoomOut(5);
                    }
                }
            }, { passive: false });
        }
        
        // キーボードショートカットの設定
        document.addEventListener('keydown', (e) => {
            // Ctrl+0でリセット
            if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault();
                this.resetZoom();
            }
            
            // Ctrl++で拡大
            if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                this.zoomIn();
            }
            
            // Ctrl+-で縮小
            if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault();
                this.zoomOut();
            }
        });
    }
    
    /**
     * 画像ドラッグ機能のセットアップ
     */
    setupImageDragging() {
        const setupDraggable = (img) => {
            if (!img) return;
            
            // マウスダウン時の処理
            img.addEventListener('mousedown', (e) => {
                if (this.currentZoomLevel <= 100) return; // ズームイン時のみドラッグ可能
                
                this.isDragging = true;
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
                this.initialOffsetX = this.offsetX || 0;
                this.initialOffsetY = this.offsetY || 0;
                
                img.style.cursor = 'grabbing';
                e.preventDefault();
            });
            
            // タッチスタート時の処理（モバイル対応）
            img.addEventListener('touchstart', (e) => {
                if (this.currentZoomLevel <= 100) return;
                
                this.isDragging = true;
                this.dragStartX = e.touches[0].clientX;
                this.dragStartY = e.touches[0].clientY;
                this.initialOffsetX = this.offsetX || 0;
                this.initialOffsetY = this.offsetY || 0;
                
                e.preventDefault();
            }, { passive: false });
        };
        
        // マウス移動時の処理
        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const dx = e.clientX - this.dragStartX;
            const dy = e.clientY - this.dragStartY;
            
            this.offsetX = this.initialOffsetX + dx;
            this.offsetY = this.initialOffsetY + dy;
            
            this.applyTransform();
            e.preventDefault();
        });
        
        // タッチ移動時の処理
        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            
            const dx = e.touches[0].clientX - this.dragStartX;
            const dy = e.touches[0].clientY - this.dragStartY;
            
            this.offsetX = this.initialOffsetX + dx;
            this.offsetY = this.initialOffsetY + dy;
            
            this.applyTransform();
            e.preventDefault();
        }, { passive: false });
        
        // マウスアップ時の処理
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                if (this.previewImage) this.previewImage.style.cursor = 'grab';
                if (this.previewImage2) this.previewImage2.style.cursor = 'grab';
            }
        });
        
        // タッチエンド時の処理
        document.addEventListener('touchend', () => {
            this.isDragging = false;
        });
        
        // 各画像にドラッグ機能を設定
        setupDraggable(this.previewImage);
        setupDraggable(this.previewImage2);
    }
    
    /**
     * 現在のズームと位置を画像に適用
     */
    applyTransform() {
        const transform = `scale(${this.currentZoomLevel / 100}) translate(${this.offsetX}px, ${this.offsetY}px)`;
        
        if (this.previewImage) {
            this.previewImage.style.transform = transform;
            this.previewImage.style.transformOrigin = 'center center';
        }
        
        if (this.previewImage2 && !this.previewImage2.classList.contains('hidden')) {
            this.previewImage2.style.transform = transform;
            this.previewImage2.style.transformOrigin = 'center center';
        }
    }
    
    /**
     * ズームレベルを更新
     * @param {number|string} value - 新しいズーム値
     */
    updateZoom(value) {
        const val = Math.max(1, Math.min(150, parseInt(value, 10)));
        this.currentZoomLevel = val;
        
        // UI更新
        if (this.zoomSlider) this.zoomSlider.value = val;
        if (this.zoomInput) this.zoomInput.value = val;
        if (this.zoomValueDisplay) this.zoomValueDisplay.textContent = val;
        
        // 100%以下のズームに戻した場合はオフセットをリセット
        if (val <= 100) {
            this.offsetX = 0;
            this.offsetY = 0;
        }
        
        this.applyTransform();
        console.log(`Zoom set to: ${val}%`);
    }
    
    /**
     * ズームイン（拡大）
     * @param {number} increment - 増加量（デフォルト10%）
     */
    zoomIn(increment = 10) {
        this.updateZoom(this.currentZoomLevel + increment);
    }
    
    /**
     * ズームアウト（縮小）
     * @param {number} decrement - 減少量（デフォルト10%）
     */
    zoomOut(decrement = 10) {
        this.updateZoom(this.currentZoomLevel - decrement);
    }
    
    /**
     * ズームをリセット（100%に戻す）
     */
    resetZoom() {
        this.updateZoom(100);
    }
    
    /**
     * プレビュー画像を設定
     * @param {string} imageSrc - 画像のURL
     * @param {Object} imageInfo - 画像の情報
     */
    setPreviewImage(imageSrc, imageInfo = {}) {
        if (!this.previewImage) return;
        
        this.previewImage.src = imageSrc || 'https://placehold.co/300x200/e2e8f0/94a3b8?text=プレビューなし';
        this.previewImage.alt = imageInfo.fileName || 'プレビュー画像';
        this.previewImage.title = imageInfo.filePath || '';
        
        // 2枚目の画像を非表示
        if (this.previewImage2) {
            this.previewImage2.classList.add('hidden');
        }
        
        // コンテナのスタイル調整
        if (this.container) {
            this.container.classList.remove('flex');
        }
        
        this.isSideBySideMode = false;
        this.resetZoom();
    }
    
    /**
     * 2枚の画像を比較表示（類似画像モード）
     * @param {string} imageSrc1 - 1枚目の画像URL
     * @param {string} imageSrc2 - 2枚目の画像URL
     * @param {Object} imageInfo1 - 1枚目の画像情報
     * @param {Object} imageInfo2 - 2枚目の画像情報
     */
    setComparisonImages(imageSrc1, imageSrc2, imageInfo1 = {}, imageInfo2 = {}) {
        if (!this.previewImage || !this.previewImage2) return;
        
        this.previewImage.src = imageSrc1 || 'https://placehold.co/300x200/e2e8f0/94a3b8?text=画像1なし';
        this.previewImage.alt = imageInfo1.fileName || '画像1';
        this.previewImage.title = imageInfo1.filePath || '';
        
        this.previewImage2.src = imageSrc2 || 'https://placehold.co/300x200/e2e8f0/94a3b8?text=画像2なし';
        this.previewImage2.alt = imageInfo2.fileName || '画像2';
        this.previewImage2.title = imageInfo2.filePath || '';
        this.previewImage2.classList.remove('hidden');
        
        // コンテナのスタイル調整
        if (this.container) {
            this.container.classList.add('flex');
        }
        
        this.isSideBySideMode = true;
        this.resetZoom();
    }
}

// デフォルト設定でインスタンスをエクスポート（シングルトンパターン）
export default new ImagePreview({
    previewImageId: 'previewImage',
    previewImage2Id: 'previewImage2',
    containerID: 'previewImageContainer',
    zoomSliderId: 'zoomSlider',
    zoomInputId: 'zoomInput',
    zoomValueDisplayId: 'zoomValueDisplay',
    zoomInBtnId: 'zoomInBtn',
    zoomOutBtnId: 'zoomOutBtn',
    resetZoomBtnId: 'resetZoomBtn'
});
// uiUtils.js - UI操作に関するユーティリティ関数

/**
 * スクロール位置をアニメーションで移動させる
 * @param {Element} element - スクロール対象の要素
 * @param {number} to - スクロール先位置（ピクセル）
 * @param {number} duration - アニメーション時間（ミリ秒）
 */
export function smoothScrollTo(element, to, duration = 300) {
    if (!element) return;
    
    const start = element.scrollTop;
    const change = to - start;
    let currentTime = 0;
    const increment = 20;
    
    const animateScroll = function() {
        currentTime += increment;
        const val = easeInOutQuad(currentTime, start, change, duration);
        element.scrollTop = val;
        if (currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };
    
    // イージング関数
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    animateScroll();
}

/**
 * トーストメッセージを表示する
 * @param {string} message - 表示するメッセージ
 * @param {string} type - メッセージタイプ（'success', 'error', 'warning', 'info'）
 * @param {number} duration - 表示時間（ミリ秒）
 */
export function showToast(message, type = 'info', duration = 3000) {
    // 既存のトーストを取得
    let toastContainer = document.getElementById('toastContainer');
    
    // トーストコンテナがなければ作成
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col space-y-2';
        document.body.appendChild(toastContainer);
    }
    
    // トーストアイテムを作成
    const toast = document.createElement('div');
    toast.className = 'px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 flex items-center space-x-2 opacity-0 translate-y-2';
    
    // タイプに応じたスタイルとアイコンを設定
    let iconSvg = '';
    switch (type) {
        case 'success':
            toast.classList.add('bg-green-100', 'text-green-800', 'border-l-4', 'border-green-500');
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
            break;
        case 'error':
            toast.classList.add('bg-red-100', 'text-red-800', 'border-l-4', 'border-red-500');
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>';
            break;
        case 'warning':
            toast.classList.add('bg-yellow-100', 'text-yellow-800', 'border-l-4', 'border-yellow-500');
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>';
            break;
        default: // info
            toast.classList.add('bg-blue-100', 'text-blue-800', 'border-l-4', 'border-blue-500');
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" /></svg>';
            break;
    }
    
    // トースト内容を設定
    toast.innerHTML = `
        <div class="flex-shrink-0">${iconSvg}</div>
        <div class="flex-grow">${message}</div>
        <button class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    `;
    
    // 閉じるボタンのイベントリスナーを設定
    toast.querySelector('button').addEventListener('click', () => {
        removeToast(toast);
    });
    
    // DOMに追加
    toastContainer.appendChild(toast);
    
    // アニメーション表示
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
        toast.classList.add('opacity-100', 'translate-y-0');
    }, 10);
    
    // 指定時間後に自動的に消す
    const timeoutId = setTimeout(() => {
        removeToast(toast);
    }, duration);
    
    // トースト要素にタイムアウトIDを保持
    toast.dataset.timeoutId = timeoutId;
    
    // トーストを消すヘルパー関数
    function removeToast(toastElement) {
        clearTimeout(parseInt(toastElement.dataset.timeoutId));
        
        toastElement.classList.remove('opacity-100', 'translate-y-0');
        toastElement.classList.add('opacity-0', 'translate-y-2');
        
        setTimeout(() => {
            toastElement.remove();
            if (toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 300);
    }
    
    // トースト要素を返す（外部から操作可能に）
    return toast;
}

/**
 * 要素が表示領域内にあるかどうかを確認
 * @param {Element} element - 確認する要素
 * @param {Element} container - スクロールコンテナ（デフォルトはwindow）
 * @returns {boolean} 表示領域内にあるかどうか
 */
export function isElementInViewport(element, container = null) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    
    if (container) {
        const containerRect = container.getBoundingClientRect();
        return (
            rect.top >= containerRect.top &&
            rect.left >= containerRect.left &&
            rect.bottom <= containerRect.bottom &&
            rect.right <= containerRect.right
        );
    }
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * テーブルヘッダーのソート状態を切り替える
 * @param {Element} headerCell - ソートする列のヘッダーセル
 */
export function toggleSortState(headerCell) {
    if (!headerCell) return;
    
    // ソート状態を取得
    const currentState = headerCell.dataset.sortState || 'none';
    const allHeaders = headerCell.parentElement.querySelectorAll('th');
    
    // すべてのヘッダーからソート状態をクリア
    allHeaders.forEach(header => {
        header.dataset.sortState = 'none';
        
        // ソートアイコンがある場合、デフォルト状態に戻す
        const icon = header.querySelector('svg');
        if (icon) {
            icon.classList.remove('text-blue-500', 'rotate-180');
            icon.classList.add('text-slate-400', 'opacity-50');
        }
    });
    
    // 次のソート状態を設定
    let nextState = 'asc';
    if (currentState === 'asc') {
        nextState = 'desc';
    } else if (currentState === 'desc') {
        nextState = 'none';
    }
    
    // 新しいソート状態を設定
    headerCell.dataset.sortState = nextState;
    
    // ソートアイコンを更新
    const icon = headerCell.querySelector('svg');
    if (icon) {
        if (nextState === 'none') {
            icon.classList.add('text-slate-400', 'opacity-50');
            icon.classList.remove('text-blue-500');
        } else {
            icon.classList.remove('text-slate-400', 'opacity-50');
            icon.classList.add('text-blue-500');
            
            if (nextState === 'desc') {
                icon.classList.add('rotate-180');
            } else {
                icon.classList.remove('rotate-180');
            }
        }
    }
    
    return nextState;
}
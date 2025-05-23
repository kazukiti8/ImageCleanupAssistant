// renderer.js - レンダラープロセスのメインスクリプト
import { showConfirmationDialog, closeConfirmationDialog } from './confirmationDialog.js';
import { formatFileSize, shortenPath } from './utils/fileUtils.js';
import { showToast } from './utils/uiUtils.js';
import imagePreview from './components/imagePreview.js';
import tabManager from './components/tabManager.js';
import guidanceManager from './components/guidance.js';
import settingsManager from './components/settingsManager.js';
import tableManagers from './components/tableManager.js';
import folderSelectors from './components/folderSelector.js';

// アプリケーションの状態
const appState = {
    isScanning: false,
    scanResults: {
        blur: [],
        similar: [],
        error: []
    },
    settings: null,
    selectedItemCount: 0,
    selectedItemSize: 0
};

// ステータスバー要素
const statusBar = document.getElementById('statusBar');

// フッターのアクションボタン
const btnTrash = document.getElementById('btnTrash');
const btnDeletePermanent = document.getElementById('btnDeletePermanent');
const btnMove = document.getElementById('btnMove');
const btnIgnoreError = document.getElementById('btnIgnoreError');
const btnRetryScan = document.getElementById('btnRetryScan');
const appVersionSpan = document.getElementById('appVersion');

// フィルター関連の要素
const blurScoreMinInput = document.getElementById('blurScoreMin');
const blurScoreMaxInput = document.getElementById('blurScoreMax');
const similarityMinInput = document.getElementById('similarityMin');
const similarityMaxInput = document.getElementById('similarityMax');
const errorTypeFilterSelect = document.getElementById('errorTypeFilter');
const applyFilterBtn = document.getElementById('applyFilterBtn');
const resetFilterBtn = document.getElementById('resetFilterBtn');

// 選択アクションボタン
const selectAllBtn = document.getElementById('selectAllBtn');
const deselectAllBtn = document.getElementById('deselectAllBtn');
const exportErrorLogBtn = document.getElementById('exportErrorLogBtn');

// スキャンボタン
const scanBtn = document.getElementById('scanBtn');

/**
 * スキャンを開始する
 */
async function startScan() {
    const targetPath = folderSelectors.targetFolder.getSelectedPath();
    if (!targetPath) {
        showToast('スキャンする対象フォルダを選択してください。', 'warning');
        return;
    }
    
    // スキャン中の状態に更新
    appState.isScanning = true;
    updateUIForScanning(true);
    
    // スキャン設定を取得
    const settings = settingsManager.getSettings();
    const scanSubfolders = settings.scanSubfolders;
    
    // ステータスバーの更新
    if (statusBar) statusBar.textContent = 'スキャン中...';
    
    try {
        // 実際のスキャン処理（ここではモック）
        const results = await mockScanProcess(targetPath, scanSubfolders);
        
        // 結果を保存
        appState.scanResults = results;
        
        // UI表示を更新
        updateScanResultsUI(results);
        
        // スキャン完了を通知
        showToast('スキャンが完了しました。', 'success');
        if (statusBar) statusBar.textContent = 'スキャン完了';
    } catch (error) {
        console.error('スキャン中にエラーが発生しました:', error);
        showToast('スキャン中にエラーが発生しました。', 'error');
        if (statusBar) statusBar.textContent = 'スキャンエラー';
    } finally {
        // スキャン状態を解除
        appState.isScanning = false;
        updateUIForScanning(false);
    }
}

/**
 * モックスキャン処理（実際のスキャン処理はメインプロセス側で実装）
 * @param {string} targetPath - スキャン対象のパス
 * @param {boolean} includeSubfolders - サブフォルダを含めるかどうか
 * @returns {Promise<Object>} スキャン結果
 */
function mockScanProcess(targetPath, includeSubfolders) {
    return new Promise((resolve) => {
        // 実際の実装ではメインプロセス側でスキャンを行う
        // ここではモックデータを返す
        setTimeout(() => {
            const mockResults = {
                blur: [
                    {
                        id: 'blur1',
                        filePath: `${targetPath}\\IMG_VeryLongFileName_001_for_preview.jpg`,
                        fileName: 'IMG_VeryLongFileName_001_for_preview.jpg',
                        fileSize: '2.5 MB',
                        resolution: '1920x1080',
                        takenDate: '2024/04/30 10:30:15',
                        lastModified: '2024/05/01 10:00',
                        blurScore: 95,
                        previewSrc: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=IMG_VeryLongFileName_001_for_preview.jpg'
                    },
                    {
                        id: 'blur2',
                        filePath: `${targetPath}\\another_blurry_photo_example_with_long_name.png`,
                        fileName: 'another_blurry_photo_example_with_long_name.png',
                        fileSize: '1.8 MB',
                        resolution: '1024x768',
                        takenDate: '2024/05/01 14:20:00',
                        lastModified: '2024/05/02 11:00',
                        blurScore: 78,
                        previewSrc: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=another_blurry_photo.png'
                    }
                ],
                similar: [
                    {
                        id: 'similar1',
                        filePath1: `${targetPath}\\GroupA_img1_very_long_name_to_test_truncate.jpg`,
                        fileName1: 'GroupA_img1_very_long_name_to_test_truncate.jpg',
                        fileSize1: '1.2 MB',
                        resolution1: '1920x1080',
                        takenDate1: '2024/03/10 11:00:00',
                        previewSrc1: 'https://placehold.co/280x180/e2e8f0/94a3b8?text=GroupA_img1.jpg',
                        filePath2: `${targetPath}\\GroupA_img2_also_a_long_name_for_testing.jpg`,
                        fileName2: 'GroupA_img2_also_a_long_name_for_testing.jpg',
                        fileSize2: '1.3 MB',
                        resolution2: '1920x1080',
                        takenDate2: '2024/03/10 11:00:05',
                        previewSrc2: 'https://placehold.co/280x180/e2e8f0/94a3b8?text=GroupA_img2.jpg',
                        similarScore: '98%',
                        recommended: 1 // 1=最初の画像を推奨、2=2番目の画像を推奨
                    }
                ],
                error: [
                    {
                        id: 'error1',
                        filePath: `${targetPath}\\corrupted_image_file_example.jpg`,
                        fileName: 'corrupted_image_file_example.jpg',
                        errorType: 'ファイルが破損しています'
                    }
                ]
            };
            
            resolve(mockResults);
        }, 2000); // 2秒後に完了
    });
}

/**
 * スキャン中のUI状態を更新
 * @param {boolean} isScanning - スキャン中かどうか
 */
function updateUIForScanning(isScanning) {
    // スキャンボタンの状態を更新
    if (scanBtn) {
        if (isScanning) {
            scanBtn.disabled = true;
            scanBtn.textContent = 'スキャン中...';
            scanBtn.classList.add('opacity-75');
        } else {
            scanBtn.disabled = false;
            scanBtn.textContent = 'スキャン開始';
            scanBtn.classList.remove('opacity-75');
        }
    }
    
    // フォルダ選択ボタンも無効化
    const targetFolderBtn = document.getElementById('targetFolderBtn');
    const outputFolderBtn = document.getElementById('outputFolderBtn');
    
    if (targetFolderBtn) targetFolderBtn.disabled = isScanning;
    if (outputFolderBtn) outputFolderBtn.disabled = isScanning;
    
    // その他UIの更新
    // ...
}

/**
 * スキャン結果をUIに反映
 * @param {Object} results - スキャン結果
 */
function updateScanResultsUI(results) {
    // タブのカウント数を更新
    tabManager.updateAllTabCounts({
        blur: results.blur.length,
        similar: results.similar.length,
        error: results.error.length
    });
    
    // テーブルの内容をクリア
    tableManagers.blurTable.clearTable();
    tableManagers.similarTable.clearTable();
    tableManagers.errorTable.clearTable();
    
    // ブレ画像テーブルを更新
    results.blur.forEach(item => {
        const rowHtml = createBlurTableRow(item);
        tableManagers.blurTable.addRow(rowHtml);
    });
    
    // 類似画像テーブルを更新
    results.similar.forEach(item => {
        const rowHtml = createSimilarTableRow(item);
        tableManagers.similarTable.addRow(rowHtml);
    });
    
    // エラーテーブルを更新
    results.error.forEach(item => {
        const rowHtml = createErrorTableRow(item);
        tableManagers.errorTable.addRow(rowHtml);
    });
}

/**
 * ブレ画像テーブルの行HTML生成
 * @param {Object} item - ブレ画像項目
 * @returns {string} 行のHTML
 */
function createBlurTableRow(item) {
    return `
        <tr data-id="${item.id}"
            data-filepath="${item.filePath}"
            data-filename="${item.fileName}"
            data-filesize="${item.fileSize}"
            data-resolution="${item.resolution}"
            data-takendate="${item.takenDate}"
            data-lastmodified="${item.lastModified}"
            data-blurscore="${item.blurScore}"
            data-previewsrc="${item.previewSrc}">
            <td class="px-3 py-2"><input type="checkbox" class="blur-item-checkbox rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-4 w-4 mx-auto block"></td>
            <td class="px-3 py-2 text-slate-700 truncate" title="${item.fileName}">${shortenFileName(item.fileName)}</td>
            <td class="px-3 py-2 text-slate-600">${item.fileSize}</td>
            <td class="px-3 py-2 text-slate-600 hidden md:table-cell">${item.lastModified}</td>
            <td class="px-3 py-2 text-slate-600 hidden lg:table-cell">${item.takenDate}</td>
            <td class="px-3 py-2 text-slate-600 hidden lg:table-cell">${item.resolution}</td>
            <td class="px-3 py-2 ${getBlurScoreColorClass(item.blurScore)} font-medium">${item.blurScore}</td>
        </tr>
    `;
}

/**
 * 類似画像テーブルの行HTML生成
 * @param {Object} item - 類似画像項目
 * @returns {string} 行のHTML
 */
function createSimilarTableRow(item) {
    const recommendedHtml = item.recommended === 1 ? `
        <span class="inline-flex items-center" title="アプリによる推奨（主な判断根拠: 解像度が高い）">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mr-1 text-amber-500">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
            </svg>
            ${shortenFileName(item.fileName1)}
        </span>
    ` : shortenFileName(item.fileName1);
    
    const recommendedHtml2 = item.recommended === 2 ? `
        <span class="inline-flex items-center" title="アプリによる推奨（主な判断根拠: 解像度が高い）">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mr-1 text-amber-500">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
            </svg>
            ${shortenFileName(item.fileName2)}
        </span>
    ` : shortenFileName(item.fileName2);
    
    return `
        <tr class="bg-yellow-50 hover:bg-yellow-100"
            data-id="${item.id}"
            data-filepath1="${item.filePath1}"
            data-filename1="${item.fileName1}"
            data-filesize1="${item.fileSize1}"
            data-resolution1="${item.resolution1}"
            data-takendate1="${item.takenDate1}"
            data-previewsrc1="${item.previewSrc1}"
            data-filepath2="${item.filePath2}"
            data-filename2="${item.fileName2}"
            data-filesize2="${item.fileSize2}"
            data-resolution2="${item.resolution2}"
            data-takendate2="${item.takenDate2}"
            data-previewsrc2="${item.previewSrc2}"
            data-similarscore="${item.similarScore}"
            data-recommended="${item.recommended}">
            <td class="px-3 py-2"><input type="checkbox" class="similar-pair-checkbox rounded border-slate-300 text-blue-600 shadow-sm h-4 w-4 mx-auto block"></td>
            <td class="px-3 py-2"><input type="checkbox" class="similar-file1-checkbox rounded border-slate-300 text-blue-600 shadow-sm h-4 w-4 mx-auto block"></td>
            <td class="px-3 py-2 text-slate-700 truncate" title="${item.fileName1}">
                ${recommendedHtml}
            </td>
            <td class="px-3 py-2 text-slate-600 hidden md:table-cell">${item.resolution1}</td>
            <td class="px-3 py-2"><input type="checkbox" class="similar-file2-checkbox rounded border-slate-300 text-blue-600 shadow-sm h-4 w-4 mx-auto block" ${item.recommended === 2 ? '' : 'checked'}></td>
            <td class="px-3 py-2 text-slate-700 truncate" title="${item.fileName2}">
                ${recommendedHtml2}
            </td>
            <td class="px-3 py-2 text-slate-600 hidden md:table-cell">${item.resolution2}</td>
            <td class="px-3 py-2 text-green-600 font-medium">${item.similarScore}</td>
        </tr>
    `;
}

/**
 * エラーテーブルの行HTML生成
 * @param {Object} item - エラー項目
 * @returns {string} 行のHTML
 */
function createErrorTableRow(item) {
    return `
        <tr data-id="${item.id}"
            data-filepath="${item.filePath}"
            data-filename="${item.fileName}"
            data-errortype="${item.errorType}">
            <td class="px-3 py-2"><input type="checkbox" class="error-item-checkbox rounded border-slate-300 text-blue-600 shadow-sm h-4 w-4 mx-auto block"></td>
            <td class="px-3 py-2 text-slate-700 truncate" title="${item.fileName}">${shortenFileName(item.fileName)}</td>
            <td class="px-3 py-2 text-red-600">
                <span class="inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor" class="w-5 h-5 mr-1 text-red-500">
                        <path d="M0 0h24v24H0V0z" fill="none"/>
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/>
                    </svg>
                    ${item.errorType}
                </span>
            </td>
            <td class="px-3 py-2 text-slate-500 truncate hidden sm:table-cell" title="${item.filePath}">${shortenPath(item.filePath)}</td>
        </tr>
    `;
}

/**
 * ファイル名を短縮
 * @param {string} fileName - ファイル名
 * @param {number} maxLength - 最大長（デフォルト30文字）
 * @returns {string} 短縮されたファイル名
 */
function shortenFileName(fileName, maxLength = 30) {
    if (!fileName) return '';
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.lastIndexOf('.') > 0 ? fileName.substring(fileName.lastIndexOf('.')) : '';
    const nameWithoutExt = fileName.substring(0, fileName.length - extension.length);
    
    if (nameWithoutExt.length <= maxLength - 5 - extension.length) {
        return nameWithoutExt + extension;
    }
    
    return nameWithoutExt.substring(0, maxLength - 5 - extension.length) + '...' + extension;
}

/**
 * ブレスコアに応じたカラークラスを取得
 * @param {number} score - ブレスコア
 * @returns {string} カラークラス
 */
function getBlurScoreColorClass(score) {
    if (score >= 90) return 'text-red-500';
    if (score >= 70) return 'text-orange-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-slate-600';
}

/**
 * アクションボタンイベント設定
 */
function setupActionButtons() {
    // 「ゴミ箱へ」ボタン
    if (btnTrash) {
        btnTrash.addEventListener('click', () => {
            const selectedData = {
                count: tableManagers.blurTable.getSelectedCount() + tableManagers.similarTable.getSelectedCount(),
                totalSizeMB: 5.2 // 実際には選択項目から計算
            };
            
            if (selectedData.count === 0) {
                showToast('削除する画像が選択されていません。', 'warning');
                return;
            }
            
            showConfirmationDialog('trash', selectedData, () => {
                console.log('ゴミ箱への移動を実行します。');
                // TODO: メインプロセスに削除処理を依頼
                showToast(`${selectedData.count}件の画像をゴミ箱に移動しました。`, 'success');
            });
        });
    }
    
    // 「完全に削除」ボタン
    if (btnDeletePermanent) {
        btnDeletePermanent.addEventListener('click', () => {
            const selectedData = {
                count: tableManagers.blurTable.getSelectedCount() + tableManagers.similarTable.getSelectedCount(),
                totalSizeMB: 5.2 // 実際には選択項目から計算
            };
            
            if (selectedData.count === 0) {
                showToast('削除する画像が選択されていません。', 'warning');
                return;
            }
            
            showConfirmationDialog('delete', selectedData, () => {
                console.log('完全削除を実行します。');
                // TODO: メインプロセスに削除処理を依頼
                showToast(`${selectedData.count}件の画像を完全に削除しました。`, 'success');
            });
        });
    }
    
    // 「移動」ボタン
    if (btnMove) {
        btnMove.addEventListener('click', () => {
            const outputPath = folderSelectors.outputFolder.getSelectedPath();
            const selectedData = {
                count: tableManagers.blurTable.getSelectedCount() + tableManagers.similarTable.getSelectedCount(),
                totalSizeMB: 5.2, // 実際には選択項目から計算
                moveToPath: outputPath
            };
            
            if (selectedData.count === 0) {
                showToast('移動する画像が選択されていません。', 'warning');
                return;
            }
            
            if (!outputPath) {
                showConfirmationDialog('custom', {
                    title: "移動先未指定",
                    message: "画像の移動先フォルダが選択されていません。\nヘッダーの「移動先フォルダ選択」から指定してください。",
                    confirmText: "OK",
                    dialogIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 0 24 24" width="28px" fill="currentColor" class="w-7 h-7"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>`,
                    dialogIconColorClass: "text-amber-500",
                    confirmBtnClasses: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                }, () => { /* No action on confirm, just close */ });
                return;
            }
            
            showConfirmationDialog('move', selectedData, () => {
                console.log('移動処理を実行します。移動先:', selectedData.moveToPath);
                // TODO: メインプロセスに移動処理を依頼
                showToast(`${selectedData.count}件の画像を移動しました。`, 'success');
            });
        });
    }
    
    // エラー関連のボタン
    if (btnIgnoreError) {
        btnIgnoreError.addEventListener('click', () => {
            const selectedCount = tableManagers.errorTable.getSelectedCount();
            if (selectedCount === 0) {
                showToast('無視するエラー項目が選択されていません。', 'warning');
                return;
            }
            
            showConfirmationDialog('custom', {
                title: "エラー項目を無視",
                message: `選択された ${selectedCount} 件のエラー項目をリストから削除します。\nよろしいですか？`,
                confirmText: "無視する",
                dialogIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 0 24 24" width="28px" fill="currentColor" class="w-7 h-7"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75C21.27 9.12 17.5 4 12 4c-1.4 0-2.73.25-3.98.7L9.65 6.35C10.37 6.13 11.17 6 12 6c.34 0 .67.04 1 .1l-2.42 2.42C10.22 8.88 10 9.41 10 10c0 1.1.9 2 2 2 .59 0 1.12-.22 1.52-.58L16.9 14.8C16.08 15.55 15.07 16 14 16c-2.76 0-5-2.24-5-5 0-.93.25-1.79.68-2.53l-1.45-1.45C3.39 8.09 2 9.84 2 12c0 2.76 2.24 5 5 5 .93 0 1.79-.25 2.53-.68l1.45 1.45C9.91 18.61 8.16 20 6 20c-3.31 0-6-2.69-6-6 0-2.16 1.15-4.05 2.87-5.12L1.39 7.39 2.81 6l18.38 18.38 1.41-1.41L12.05 11.05C12.02 11.36 12 11.68 12 12z"/>`,
                dialogIconColorClass: "text-slate-500",
                confirmBtnClasses: "bg-slate-500 hover:bg-slate-600 focus:ring-slate-500"
            }, () => {
                console.log('エラー項目を無視します。');
                // TODO: エラーリストから削除
                showToast(`${selectedCount}件のエラー項目を無視しました。`, 'success');
            });
        });
    }
    
    if (btnRetryScan) {
        btnRetryScan.addEventListener('click', () => {
            const selectedCount = tableManagers.errorTable.getSelectedCount();
            if (selectedCount === 0) {
                showToast('再スキャンするエラー項目が選択されていません。', 'warning');
                return;
            }
            
            showConfirmationDialog('custom', {
                title: "エラー項目を再スキャン",
                message: `選択された ${selectedCount} 件のエラー項目を再スキャンします。\nよろしいですか？`,
                confirmText: "再スキャン",
                dialogIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 0 24 24" width="28px" fill="currentColor" class="w-7 h-7"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>`,
                dialogIconColorClass: "text-blue-500",
                confirmBtnClasses: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
            }, () => {
                console.log('エラー項目を再スキャンします。');
                // TODO: 再スキャン処理
                showToast(`${selectedCount}件のエラー項目を再スキャンしました。`, 'info');
            });
        });
    }
    
    // エクスポートボタン
    if (exportErrorLogBtn) {
        exportErrorLogBtn.addEventListener('click', () => {
            console.log('エラーログをエクスポートします。');
            // TODO: エラーログのエクスポート処理
            showToast('エラーログをエクスポートしました。', 'success');
        });
    }
    
    // 選択操作ボタン
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const activeTabId = tabManager.getActiveTabId();
            if (activeTabId === 'blurTab') {
                tableManagers.blurTable.toggleSelectAll(true);
            } else if (activeTabId === 'similarTab') {
                tableManagers.similarTable.toggleSelectAll(true);
            } else if (activeTabId === 'errorTab') {
                tableManagers.errorTable.toggleSelectAll(true);
            }
        });
    }
    
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', () => {
            const activeTabId = tabManager.getActiveTabId();
            if (activeTabId === 'blurTab') {
                tableManagers.blurTable.toggleSelectAll(false);
            } else if (activeTabId === 'similarTab') {
                tableManagers.similarTable.toggleSelectAll(false);
            } else if (activeTabId === 'errorTab') {
                tableManagers.errorTable.toggleSelectAll(false);
            }
        });
    }
    
    // スキャンボタン
    if (scanBtn) {
        scanBtn.addEventListener('click', startScan);
    }
}

/**
 * フィルター機能の設定
 */
function setupFilters() {
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            const activeTabId = tabManager.getActiveTabId();
            
            if (activeTabId === 'blurTab') {
                const minScore = parseInt(blurScoreMinInput.value) || 0;
                const maxScore = parseInt(blurScoreMaxInput.value) || 100;
                console.log(`ブレスコアフィルター適用: ${minScore}-${maxScore}`);
                
                // フィルター適用
                // TODO: 実際のフィルター処理
                showToast(`ブレスコア ${minScore}-${maxScore} のフィルターを適用しました。`, 'info');
            } else if (activeTabId === 'similarTab') {
                const minScore = parseInt(similarityMinInput.value) || 0;
                const maxScore = parseInt(similarityMaxInput.value) || 100;
                console.log(`類似度フィルター適用: ${minScore}%-${maxScore}%`);
                
                // フィルター適用
                // TODO: 実際のフィルター処理
                showToast(`類似度 ${minScore}%-${maxScore}% のフィルターを適用しました。`, 'info');
            } else if (activeTabId === 'errorTab') {
                const errorType = errorTypeFilterSelect.value;
                console.log(`エラータイプフィルター適用: ${errorType || 'すべて'}`);
                
                // フィルター適用
                // TODO: 実際のフィルター処理
                showToast(`エラータイプ「${errorType || 'すべて'}」のフィルターを適用しました。`, 'info');
            }
        });
    }
    
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            const activeTabId = tabManager.getActiveTabId();
            
            if (activeTabId === 'blurTab') {
                blurScoreMinInput.value = 0;
                blurScoreMaxInput.value = 100;
            } else if (activeTabId === 'similarTab') {
                similarityMinInput.value = 0;
                similarityMaxInput.value = 100;
            } else if (activeTabId === 'errorTab') {
                errorTypeFilterSelect.value = '';
            }
            
            // フィルターリセット
            // TODO: 実際のフィルターリセット処理
            showToast('フィルターをリセットしました。', 'info');
        });
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. Initializing application...');
    
    // バージョン表示
    if (appVersionSpan) {
        appVersionSpan.textContent = '0.1.0 (デモ版)';
    }
    
    // 各種イベントリスナーの設定
    setupActionButtons();
    setupFilters();
    
    // スキャン初期状態
    updateUIForScanning(false);
    if (statusBar) statusBar.textContent = 'スキャン準備完了';
    
    // ガイダンス表示
    setTimeout(() => {
        guidanceManager.start();
    }, 500);
});

// アプリ終了時の処理
window.addEventListener('beforeunload', () => {
    console.log('Application closing...');
    // TODO: 必要に応じて終了前の処理を追加
});
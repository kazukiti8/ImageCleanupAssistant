// renderer.js

// ヘッダーボタンのイベントリスナー
const targetFolderBtn = document.getElementById('targetFolderBtn');
const targetFolderPathDisplay = document.getElementById('targetFolderPath');
const outputFolderBtn = document.getElementById('outputFolderBtn');
const outputFolderPathDisplay = document.getElementById('outputFolderPath');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModalOverlay = document.getElementById('settingsModalOverlay');
const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
const settingsCancelBtn = document.getElementById('settingsCancelBtn');
const settingsApplyBtn = document.getElementById('settingsApplyBtn');
const settingsOkBtn = document.getElementById('settingsOkBtn');

// 初回ガイダンス関連の要素
const guidanceSpotlightOverlay = document.getElementById('guidanceSpotlightOverlay');
const guidanceModalOverlay = document.getElementById('guidanceModalOverlay');
const guidanceTitle = document.getElementById('guidanceTitle');
const guidanceText = document.getElementById('guidanceText');
const dontShowAgainContainer = document.getElementById('dontShowAgainContainer');
const dontShowAgainCheckbox = document.getElementById('dontShowAgainCheckbox');
const skipGuidanceBtn = document.getElementById('skipGuidanceBtn');
const nextGuidanceBtn = document.getElementById('nextGuidanceBtn');
const nextGuidanceBtnText = document.getElementById('nextGuidanceBtnText');
const nextGuidanceBtnIcon = document.getElementById('nextGuidanceBtnIcon');

// 左ペイン（プレビューエリア）の要素
const previewImageGlobal = document.getElementById('previewImage');
const previewImage2Global = document.getElementById('previewImage2');
const zoomValueDisplayGlobal = document.getElementById('zoomValueDisplay');
const zoomSliderGlobal = document.getElementById('zoomSlider');
const zoomOutBtnGlobal = document.getElementById('zoomOutBtn');
const zoomInputGlobal = document.getElementById('zoomInput');
const zoomInBtnGlobal = document.getElementById('zoomInBtn');
const resetZoomBtnGlobal = document.getElementById('resetZoomBtn');
const infoFileNameGlobal = document.getElementById('infoFileName');
const infoFilePathGlobal = document.getElementById('infoFilePath');
const infoResolutionGlobal = document.getElementById('infoResolution');
const infoFileSizeGlobal = document.getElementById('infoFileSize');
const infoTakenDateGlobal = document.getElementById('infoTakenDate');
const infoBlurScoreContainerGlobal = document.getElementById('infoBlurScoreContainer');
const infoBlurScoreGlobal = document.getElementById('infoBlurScore');
const imageInfoContainer2Global = document.getElementById('imageInfoContainer2');
const infoFileName2Global = document.getElementById('infoFileName2');
const infoFilePath2Global = document.getElementById('infoFilePath2');
const infoResolution2Global = document.getElementById('infoResolution2');
const infoFileSize2Global = document.getElementById('infoFileSize2');
const infoTakenDate2Global = document.getElementById('infoTakenDate2');
const similarScoreContainerGlobal = document.getElementById('similarScoreContainer');
const infoSimilarScoreGlobal = document.getElementById('infoSimilarScore');
const previewImageContainerGlobal = document.getElementById('previewImageContainer');


let currentGuidanceStep = 0;
const guidanceSteps = [
    { title: "イメージクリーンアップアシスタントへようこそ！", text: "簡単な操作でPC内の画像をスッキリ整理できます。いくつかの主要なステップをご案内します。", targetElementId: null, nextButtonText: "次へ", nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`, showSkip: true, showDontShowAgain: true },
    { title: "ステップ1：スキャンするフォルダを選択", text: "はじめに、整理したい画像が保存されているフォルダを選びましょう。こちらのボタンから選択できます。", targetElementId: "targetFolderBtn", nextButtonText: "次へ", nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`, showSkip: false, showDontShowAgain: false },
    { title: "ステップ2：スキャンを開始", text: "フォルダを選択したら、このボタンを押して画像のスキャンを開始します。ブレ画像や類似画像などを自動で検出します。", targetElementId: "scanBtn", nextButtonText: "次へ", nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`, showSkip: false, showDontShowAgain: false },
    { title: "ステップ3：結果を確認", text: "スキャンが完了すると、結果がここに表示されます。タブを切り替えて検出された画像を確認し、プレビューで詳細をチェックしましょう。", targetElementId: ["tabContainer", "leftPane"], nextButtonText: "次へ", nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`, showSkip: false, showDontShowAgain: false },
    { title: "ステップ4：画像を選択して整理", text: "整理したい画像をリストで選択し、下のアクションボタンで削除や移動を実行します。不要な画像を安全に整理できます。", targetElementId: ["centerPane", "footerActionsContainer"], nextButtonText: "次へ", nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`, showSkip: false, showDontShowAgain: false },
    { title: "準備完了！", text: "これで基本的な操作は完了です！さっそく画像整理を始めてみましょう。", targetElementId: null, nextButtonText: "開始する", nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 mr-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12.65 10C12.28 5.96 8.78 3 4.5 3C2.02 3 0 5.02 0 7.5c0 1.74 1.01 3.24 2.43 3.97l.16.08C2.71 12.82 3.81 14 5.03 14c.17 0 .34-.02.5-.05l.16-.03c1.03-.2 1.95-.76 2.59-1.52l.09-.11.05-.1c.55-.81.8-1.75.71-2.71l-.02-.18zm8.92 2.01L19.14 10l2.43-2.43-1.41-1.41L17.72 8.59l-2.43-2.43-1.41 1.41L16.31 10l-2.43 2.43 1.41 1.41L17.72 11.41l2.43 2.43 1.41-1.41zM4.5 12c-1.38 0-2.5-1.12-2.5-2.5S3.12 7 4.5 7s2.5 1.12 2.5 2.5S5.88 12 4.5 12zM12 16c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`, showSkip: false, showDontShowAgain: true }
];

let highlightedElements = [];

function clearHighlights() {
    highlightedElements.forEach(el => {
        if (el) el.classList.remove('highlighted-element');
    });
    highlightedElements = [];
    if(guidanceSpotlightOverlay) guidanceSpotlightOverlay.classList.add('hidden');
}

function applySpotlight(targetElementIds) {
    clearHighlights();
    if (!targetElementIds) {
        if(guidanceSpotlightOverlay) guidanceSpotlightOverlay.style.clipPath = '';
        return;
    }

    const targets = Array.isArray(targetElementIds) ? targetElementIds : [targetElementIds];
    let pathDef = 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%';

    targets.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('highlighted-element');
            highlightedElements.push(element);
            const rect = element.getBoundingClientRect();
            pathDef += `, ${rect.left}px ${rect.top}px, ${rect.left}px ${rect.bottom}px, ${rect.right}px ${rect.bottom}px, ${rect.right}px ${rect.top}px, ${rect.left}px ${rect.top}px`;
        }
    });
    if(guidanceSpotlightOverlay) {
        guidanceSpotlightOverlay.style.clipPath = pathDef + ')';
        guidanceSpotlightOverlay.classList.remove('hidden');
    }
}

function showGuidanceStep(stepIndex) {
    if (stepIndex >= guidanceSteps.length) {
        closeGuidance();
        return;
    }
    currentGuidanceStep = stepIndex;
    const step = guidanceSteps[stepIndex];

    if(guidanceTitle) guidanceTitle.textContent = step.title;
    if(guidanceText) guidanceText.textContent = step.text;
    if(nextGuidanceBtnText) nextGuidanceBtnText.textContent = step.nextButtonText;
    if(nextGuidanceBtnIcon) nextGuidanceBtnIcon.innerHTML = step.nextButtonIconSvg;

    applySpotlight(step.targetElementId);

    if(skipGuidanceBtn) skipGuidanceBtn.style.display = step.showSkip ? 'flex' : 'none';
    if(dontShowAgainContainer) dontShowAgainContainer.style.display = step.showDontShowAgain ? 'flex' : 'none';

    if(guidanceModalOverlay) guidanceModalOverlay.classList.remove('hidden');
}

function closeGuidance() {
    if(guidanceModalOverlay) guidanceModalOverlay.classList.add('hidden');
    clearHighlights();
    console.log("Guidance closed. 'Don't show again' was:", dontShowAgainCheckbox ? dontShowAgainCheckbox.checked : 'N/A');
}

if(nextGuidanceBtn) {
    nextGuidanceBtn.addEventListener('click', () => {
        showGuidanceStep(currentGuidanceStep + 1);
    });
}

if(skipGuidanceBtn) {
    skipGuidanceBtn.addEventListener('click', () => {
        closeGuidance();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'g' && guidanceModalOverlay && guidanceModalOverlay.classList.contains('hidden')) {
        showGuidanceStep(0);
    }
});


if (targetFolderBtn) {
    targetFolderBtn.addEventListener('click', async () => {
        if (window.electronAPI && typeof window.electronAPI.openFolderDialog === 'function') {
            const folderPath = await window.electronAPI.openFolderDialog();
            if (folderPath) {
                targetFolderPathDisplay.textContent = folderPath;
                targetFolderPathDisplay.title = folderPath;
                console.log('対象フォルダ:', folderPath);
            } else {
                console.log('対象フォルダ選択がキャンセルされました。');
            }
        } else {
            console.error('electronAPI.openFolderDialog is not available.');
        }
    });
}

if (outputFolderBtn) {
    outputFolderBtn.addEventListener('click', async () => {
        if (window.electronAPI && typeof window.electronAPI.openFolderDialog === 'function') {
            const folderPath = await window.electronAPI.openFolderDialog();
            if (folderPath) {
                outputFolderPathDisplay.textContent = folderPath;
                outputFolderPathDisplay.title = folderPath;
                console.log('移動先フォルダ:', folderPath);
            } else {
                console.log('移動先フォルダ選択がキャンセルされました。');
            }
        } else {
            console.error('electronAPI.openFolderDialog is not available.');
        }
    });
}

if (settingsBtn && settingsModalOverlay) {
    settingsBtn.addEventListener('click', () => {
        console.log('設定ボタンがクリックされました。設定モーダルを表示します。');
        settingsModalOverlay.classList.remove('hidden');
    });
}

if (closeSettingsModalBtn && settingsModalOverlay) {
    closeSettingsModalBtn.addEventListener('click', () => {
        settingsModalOverlay.classList.add('hidden');
    });
}
if (settingsCancelBtn && settingsModalOverlay) {
    settingsCancelBtn.addEventListener('click', () => {
        settingsModalOverlay.classList.add('hidden');
        console.log('設定モーダル: キャンセルボタンが押されました。');
    });
}
if (settingsApplyBtn && settingsModalOverlay) {
    settingsApplyBtn.addEventListener('click', () => {
        console.log('設定モーダル: 適用ボタンが押されました。');
    });
}
if (settingsOkBtn && settingsModalOverlay) {
    settingsOkBtn.addEventListener('click', () => {
        console.log('設定モーダル: OKボタンが押されました。');
        settingsModalOverlay.classList.add('hidden');
    });
}

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const filterPanels = document.querySelectorAll('.filter-options');
const currentFilterTabName = document.getElementById('currentFilterTabName');
const exportErrorLogBtn = document.getElementById('exportErrorLogBtn');
const generalActions = document.getElementById('generalActions');
const errorActions = document.getElementById('errorActions');
const footerInfoContainer = document.getElementById('footerInfoContainer');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('tab-active'));
        button.classList.add('tab-active');

        tabContents.forEach(content => content.classList.add('hidden'));
        filterPanels.forEach(panel => panel.classList.add('hidden'));

        const targetContentId = button.dataset.targetContent;
        const targetContent = document.getElementById(targetContentId);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }

        let filterPanelId = '';
        let filterTabName = '';
        if (button.id === 'blurTab') {
            filterPanelId = 'blurFilterPanel';
            filterTabName = 'ブレ画像';
            if(exportErrorLogBtn) exportErrorLogBtn.classList.add('hidden');
            if(generalActions) generalActions.classList.remove('hidden');
            if(errorActions) errorActions.classList.add('hidden');
            if(footerInfoContainer) footerInfoContainer.innerHTML = `選択中のアイテム: <span id="selectedItemCount" class="font-semibold text-slate-800">0件</span> (合計サイズ: <span id="selectedItemSize" class="font-semibold text-slate-800">0 MB</span>)`;
        } else if (button.id === 'similarTab') {
            filterPanelId = 'similarFilterPanel';
            filterTabName = '類似画像';
            if(exportErrorLogBtn) exportErrorLogBtn.classList.add('hidden');
            if(generalActions) generalActions.classList.remove('hidden');
            if(errorActions) errorActions.classList.add('hidden');
            if(footerInfoContainer) footerInfoContainer.innerHTML = `選択中のアイテム: <span id="selectedPairCount" class="font-semibold text-slate-800">0ペア, 0ファイル</span> (合計サイズ: <span id="selectedItemSize" class="font-semibold text-slate-800">0 MB</span>)`;
        } else if (button.id === 'errorTab') {
            filterPanelId = 'errorFilterPanel';
            filterTabName = 'エラー';
            if(exportErrorLogBtn) exportErrorLogBtn.classList.remove('hidden');
            if(generalActions) generalActions.classList.add('hidden');
            if(errorActions) errorActions.classList.remove('hidden');
            if(footerInfoContainer) footerInfoContainer.innerHTML = `選択中のアイテム: <span id="selectedErrorCount" class="font-semibold text-slate-800">0件</span> (エラーリスト)`;
        }
        const targetFilterPanel = document.getElementById(filterPanelId);
        if (targetFilterPanel) {
            targetFilterPanel.classList.remove('hidden');
        }
        if(currentFilterTabName) currentFilterTabName.textContent = filterTabName;

        console.log(button.id + 'がクリックされました。表示コンテンツID: ' + targetContentId + ', フィルターパネルID: ' + filterPanelId);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const activeTab = document.querySelector('.tab-button.tab-active');
    if (activeTab) {
        activeTab.click();
    }

    // リストアイテム選択とプレビュー表示の連動
    function setupListInteraction(tableBodyId, itemType) {
        const tableBody = document.getElementById(tableBodyId);
        if (!tableBody) return;

        tableBody.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            if (!row) return;

            document.querySelectorAll('#blurTableBody tr, #similarTableBody tr, #errorTableBody tr').forEach(r => r.classList.remove('selected-row'));
            row.classList.add('selected-row');

            if(previewImageGlobal) previewImageGlobal.src = 'https://placehold.co/300x200/e2e8f0/94a3b8?text=プレビューなし';
            if(previewImage2Global) previewImage2Global.classList.add('hidden');
            if(previewImageContainerGlobal) previewImageContainerGlobal.classList.remove('flex');
            if(infoFileNameGlobal) infoFileNameGlobal.textContent = 'N/A';
            if(infoFileNameGlobal) infoFileNameGlobal.title = 'N/A';
            if(infoFilePathGlobal) infoFilePathGlobal.textContent = 'N/A';
            if(infoFilePathGlobal) infoFilePathGlobal.title = 'N/A';
            if(infoResolutionGlobal) infoResolutionGlobal.textContent = 'N/A';
            if(infoFileSizeGlobal) infoFileSizeGlobal.textContent = 'N/A';
            if(infoTakenDateGlobal) infoTakenDateGlobal.textContent = 'N/A';
            if(infoBlurScoreContainerGlobal) infoBlurScoreContainerGlobal.classList.add('hidden');
            if(imageInfoContainer2Global) imageInfoContainer2Global.classList.add('hidden');
            if(similarScoreContainerGlobal) similarScoreContainerGlobal.classList.add('hidden');


            if (itemType === 'blur') {
                if(previewImageGlobal) previewImageGlobal.src = row.dataset.previewsrc || 'https://placehold.co/300x200/e2e8f0/94a3b8?text=プレビューなし';
                if(infoFileNameGlobal) infoFileNameGlobal.textContent = row.dataset.filename || 'N/A';
                if(infoFileNameGlobal) infoFileNameGlobal.title = row.dataset.filename || 'N/A';
                if(infoFilePathGlobal) infoFilePathGlobal.textContent = row.dataset.filepath ? row.dataset.filepath.substring(0,3) + '...\\' + row.dataset.filename : 'N/A';
                if(infoFilePathGlobal) infoFilePathGlobal.title = row.dataset.filepath || 'N/A';
                if(infoResolutionGlobal) infoResolutionGlobal.textContent = row.dataset.resolution || 'N/A';
                if(infoFileSizeGlobal) infoFileSizeGlobal.textContent = row.dataset.filesize || 'N/A';
                if(infoTakenDateGlobal) infoTakenDateGlobal.textContent = row.dataset.takendate || 'N/A';
                if(infoBlurScoreContainerGlobal && infoBlurScoreGlobal) {
                    infoBlurScoreGlobal.textContent = row.dataset.blurscore || 'N/A';
                    infoBlurScoreContainerGlobal.classList.remove('hidden');
                }
                console.log('ブレ画像選択:', row.dataset.filename);
            } else if (itemType === 'similar') {
                if(previewImageGlobal) previewImageGlobal.src = row.dataset.previewsrc1 || 'https://placehold.co/300x200/e2e8f0/94a3b8?text=画像1なし';
                if(previewImage2Global) {
                    previewImage2Global.src = row.dataset.previewsrc2 || 'https://placehold.co/300x200/e2e8f0/94a3b8?text=画像2なし';
                    previewImage2Global.classList.remove('hidden');
                    if(previewImageContainerGlobal) previewImageContainerGlobal.classList.add('flex');
                }

                if(infoFileNameGlobal) infoFileNameGlobal.textContent = row.dataset.filename1 || 'N/A';
                if(infoFileNameGlobal) infoFileNameGlobal.title = row.dataset.filename1 || 'N/A';
                if(infoFilePathGlobal) infoFilePathGlobal.textContent = row.dataset.filepath1 ? row.dataset.filepath1.substring(0,3) + '...\\' + row.dataset.filename1 : 'N/A';
                if(infoFilePathGlobal) infoFilePathGlobal.title = row.dataset.filepath1 || 'N/A';
                if(infoResolutionGlobal) infoResolutionGlobal.textContent = row.dataset.resolution1 || 'N/A';
                if(infoFileSizeGlobal) infoFileSizeGlobal.textContent = row.dataset.filesize1 || 'N/A';
                if(infoTakenDateGlobal) infoTakenDateGlobal.textContent = row.dataset.takendate1 || 'N/A';

                if(imageInfoContainer2Global) imageInfoContainer2Global.classList.remove('hidden');
                if(infoFileName2Global) infoFileName2Global.textContent = row.dataset.filename2 || 'N/A';
                if(infoFileName2Global) infoFileName2Global.title = row.dataset.filename2 || 'N/A';
                if(infoFilePath2Global) infoFilePath2Global.textContent = row.dataset.filepath2 ? row.dataset.filepath2.substring(0,3) + '...\\' + row.dataset.filename2 : 'N/A';
                if(infoFilePath2Global) infoFilePath2Global.title = row.dataset.filepath2 || 'N/A';
                if(infoResolution2Global) infoResolution2Global.textContent = row.dataset.resolution2 || 'N/A';
                if(infoFileSize2Global) infoFileSize2Global.textContent = row.dataset.filesize2 || 'N/A';
                if(infoTakenDate2Global) infoTakenDate2Global.textContent = row.dataset.takendate2 || 'N/A';

                if(similarScoreContainerGlobal && infoSimilarScoreGlobal) {
                    infoSimilarScoreGlobal.textContent = row.dataset.similarscore || 'N/A';
                    similarScoreContainerGlobal.classList.remove('hidden');
                }
                console.log('類似画像ペア選択:', row.dataset.filename1, row.dataset.filename2);
            } else if (itemType === 'error') {
                if(infoFileNameGlobal) infoFileNameGlobal.textContent = row.dataset.filename || 'N/A';
                if(infoFileNameGlobal) infoFileNameGlobal.title = row.dataset.filename || 'N/A';
                if(infoFilePathGlobal) infoFilePathGlobal.textContent = row.dataset.filepath ? row.dataset.filepath.substring(0,3) + '...\\' + row.dataset.filename : 'N/A';
                if(infoFilePathGlobal) infoFilePathGlobal.title = row.dataset.filepath || 'N/A';
                if(infoResolutionGlobal) infoResolutionGlobal.textContent = `エラー: ${row.dataset.errortype || '不明'}`;
                console.log('エラーアイテム選択:', row.dataset.filename);
            }
        });
    }

    setupListInteraction('blurTableBody', 'blur');
    setupListInteraction('similarTableBody', 'similar');
    setupListInteraction('errorTableBody', 'error');

});

function updateZoom(value) {
    const val = Math.max(1, Math.min(150, parseInt(value, 10)));
    if (zoomSliderGlobal) zoomSliderGlobal.value = val;
    if (zoomInputGlobal) zoomInputGlobal.value = val;
    if (zoomValueDisplayGlobal) zoomValueDisplayGlobal.textContent = val;
    if (previewImageGlobal) {
        previewImageGlobal.style.transform = `scale(${val / 100})`;
        previewImageGlobal.style.transformOrigin = 'center center';
    }
    if (previewImage2Global && !previewImage2Global.classList.contains('hidden')) {
        previewImage2Global.style.transform = `scale(${val / 100})`;
        previewImage2Global.style.transformOrigin = 'center center';
    }
    console.log(`Zoom set to: ${val}%`);
}

if (zoomSliderGlobal) zoomSliderGlobal.addEventListener('input', (e) => updateZoom(e.target.value));
if (zoomInputGlobal) {
    zoomInputGlobal.addEventListener('change', (e) => updateZoom(e.target.value));
    zoomInputGlobal.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            updateZoom(e.target.value);
        }
    });
}
if (zoomInBtnGlobal) zoomInBtnGlobal.addEventListener('click', () => {
    updateZoom(parseInt(zoomInputGlobal.value, 10) + 10);
});
if (zoomOutBtnGlobal) zoomOutBtnGlobal.addEventListener('click', () => {
    updateZoom(parseInt(zoomInputGlobal.value, 10) - 10);
});
if (resetZoomBtnGlobal) resetZoomBtnGlobal.addEventListener('click', () => {
    updateZoom(100);
});
updateZoom(100); // 初期ズーム値

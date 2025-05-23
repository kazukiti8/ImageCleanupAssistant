// renderer.js
import { showConfirmationDialog, closeConfirmationDialog } from './confirmationDialog.js'; // ES Module import

// Get references to various HTML elements in the document
// Header buttons and displays
const targetFolderBtn = document.getElementById('targetFolderBtn');
const targetFolderPathDisplay = document.getElementById('targetFolderPath');
const outputFolderBtn = document.getElementById('outputFolderBtn');
const outputFolderPathDisplay = document.getElementById('outputFolderPath');
const scanBtn = document.getElementById('scanBtn'); // Scan button
const settingsBtn = document.getElementById('settingsBtn');

// Settings Modal elements
const settingsModalOverlay = document.getElementById('settingsModalOverlay');
const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
const settingsCancelBtn = document.getElementById('settingsCancelBtn');
const settingsApplyBtn = document.getElementById('settingsApplyBtn');
const settingsOkBtn = document.getElementById('settingsOkBtn');
// Settings Modal form elements
const scanSubfoldersCheckbox = document.getElementById('scanSubfolders');
const deleteToRecycleBinRadio = document.getElementById('deleteToRecycleBin');
const deletePermanentlyRadio = document.getElementById('deletePermanently');
const logLevelSelect = document.getElementById('logLevel');
const logFilePathInput = document.getElementById('logFilePathInput');
const changeLogPathButton = document.getElementById('changeLogPathButton');


// Guidance Modal elements
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

// Left Pane (Preview Area) elements
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
const imageInfoContainer2Global = document.getElementById('imageInfoContainer2'); // Container for second image info
const infoFileName2Global = document.getElementById('infoFileName2');
const infoFilePath2Global = document.getElementById('infoFilePath2');
const infoResolution2Global = document.getElementById('infoResolution2');
const infoFileSize2Global = document.getElementById('infoFileSize2');
const infoTakenDate2Global = document.getElementById('infoTakenDate2');
const similarScoreContainerGlobal = document.getElementById('similarScoreContainer');
const infoSimilarScoreGlobal = document.getElementById('infoSimilarScore');
const previewImageContainerGlobal = document.getElementById('previewImageContainer');


// Tab and Content elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const filterPanels = document.querySelectorAll('.filter-options');
const currentFilterTabName = document.getElementById('currentFilterTabName');

// Table body elements
const blurTableBody = document.getElementById('blurTableBody');
const similarTableBody = document.getElementById('similarTableBody');
const errorTableBody = document.getElementById('errorTableBody');

// Right Pane (Filter and Actions) elements
const selectAllBtn = document.getElementById('selectAllBtn');
const deselectAllBtn = document.getElementById('deselectAllBtn');
const exportErrorLogBtn = document.getElementById('exportErrorLogBtn');
const blurScoreMinInput = document.getElementById('blurScoreMin');
const blurScoreMaxInput = document.getElementById('blurScoreMax');
const similarityMinInput = document.getElementById('similarityMin');
const similarityMaxInput = document.getElementById('similarityMax');
const errorTypeFilterSelect = document.getElementById('errorTypeFilter');
const applyFilterBtn = document.getElementById('applyFilterBtn');
const resetFilterBtn = document.getElementById('resetFilterBtn');


// Footer elements
const footerInfoContainer = document.getElementById('footerInfoContainer');
const generalActions = document.getElementById('generalActions');
const errorActions = document.getElementById('errorActions');
const btnTrash = document.getElementById('btnTrash');
const btnDeletePermanent = document.getElementById('btnDeletePermanent');
const btnMove = document.getElementById('btnMove');
const btnIgnoreError = document.getElementById('btnIgnoreError');
const btnRetryScan = document.getElementById('btnRetryScan');
const appVersionSpan = document.getElementById('appVersion');
const statusBar = document.getElementById('statusBar');

// Note: Confirmation Dialog elements and their direct listeners are now managed in confirmationDialog.js


// --- Initial Guidance Logic ---
let currentGuidanceStep = 0;
const guidanceSteps = [
    {
        title: "イメージクリーンアップアシスタントへようこそ！", // Welcome to Image Cleanup Assistant!
        text: "簡単な操作でPC内の画像をスッキリ整理できます。いくつかの主要なステップをご案内します。", // You can easily organize images in your PC with simple operations. We will guide you through some main steps.
        targetElementId: null,
        nextButtonText: "次へ", // Next
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
        showSkip: true,
        showDontShowAgain: true
    },
    {
        title: "ステップ1：スキャンするフォルダを選択", // Step 1: Select the folder to scan
        text: "はじめに、整理したい画像が保存されているフォルダを選びましょう。こちらのボタンから選択できます。", // First, let's choose the folder where the images you want to organize are saved. You can select it from this button.
        targetElementId: "targetFolderBtn",
        nextButtonText: "次へ", // Next
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
        showSkip: false,
        showDontShowAgain: false
    },
    {
        title: "ステップ2：スキャンを開始", // Step 2: Start scan
        text: "フォルダを選択したら、このボタンを押して画像のスキャンを開始します。ブレ画像や類似画像などを自動で検出します。", // Once you select a folder, press this button to start scanning images. It will automatically detect blurry images, similar images, etc.
        targetElementId: "scanBtn",
        nextButtonText: "次へ", // Next
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
        showSkip: false,
        showDontShowAgain: false
    },
    {
        title: "ステップ3：結果を確認", // Step 3: Check results
        text: "スキャンが完了すると、結果がここに表示されます。タブを切り替えて検出された画像を確認し、プレビューで詳細をチェックしましょう。", // When the scan is complete, the results will be displayed here. Switch tabs to check the detected images and see details in the preview.
        targetElementId: ["tabContainer", "leftPane"],
        nextButtonText: "次へ", // Next
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
        showSkip: false,
        showDontShowAgain: false
    },
    {
        title: "ステップ4：画像を選択して整理", // Step 4: Select and organize images
        text: "整理したい画像をリストで選択し、下のアクションボタンで削除や移動を実行します。不要な画像を安全に整理できます。", // Select the images you want to organize from the list and use the action buttons below to delete or move them. You can safely organize unnecessary images.
        targetElementId: ["centerPane", "footerActionsContainer"],
        nextButtonText: "次へ", // Next
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 ml-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
        showSkip: false,
        showDontShowAgain: false
    },
    {
        title: "準備完了！", // All set!
        text: "これで基本的な操作は完了です！さっそく画像整理を始めてみましょう。", // Basic operations are now complete! Let's start organizing your images.
        targetElementId: null,
        nextButtonText: "開始する", // Start
        nextButtonIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="w-5 h-5 mr-1"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12.65 10C12.28 5.96 8.78 3 4.5 3C2.02 3 0 5.02 0 7.5c0 1.74 1.01 3.24 2.43 3.97l.16.08C2.71 12.82 3.81 14 5.03 14c.17 0 .34-.02.5-.05l.16-.03c1.03-.2 1.95-.76 2.59-1.52l.09-.11.05-.1c.55-.81.8-1.75.71-2.71l-.02-.18zm8.92 2.01L19.14 10l2.43-2.43-1.41-1.41L17.72 8.59l-2.43-2.43-1.41 1.41L16.31 10l-2.43 2.43 1.41 1.41L17.72 11.41l2.43 2.43 1.41-1.41zM4.5 12c-1.38 0-2.5-1.12-2.5-2.5S3.12 7 4.5 7s2.5 1.12 2.5 2.5S5.88 12 4.5 12zM12 16c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`,
        showSkip: false,
        showDontShowAgain: true
    }
];
let highlightedElements = [];

function clearHighlights() {
    highlightedElements.forEach(el => {
        if (el) el.classList.remove('highlighted-element');
    });
    highlightedElements = [];
    if (guidanceSpotlightOverlay) guidanceSpotlightOverlay.classList.add('hidden');
}

function applySpotlight(targetElementIds) {
    clearHighlights();
    if (!targetElementIds) {
        if (guidanceSpotlightOverlay) guidanceSpotlightOverlay.style.clipPath = '';
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
    if (guidanceSpotlightOverlay) {
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
    if (guidanceTitle) guidanceTitle.textContent = step.title;
    if (guidanceText) guidanceText.textContent = step.text;
    if (nextGuidanceBtnText) nextGuidanceBtnText.textContent = step.nextButtonText;
    if (nextGuidanceBtnIcon) nextGuidanceBtnIcon.innerHTML = step.nextButtonIconSvg;
    applySpotlight(step.targetElementId);
    if (skipGuidanceBtn) skipGuidanceBtn.style.display = step.showSkip ? 'flex' : 'none';
    if (dontShowAgainContainer) dontShowAgainContainer.style.display = step.showDontShowAgain ? 'flex' : 'none';
    if (guidanceModalOverlay) guidanceModalOverlay.classList.remove('hidden');
}

function closeGuidance() {
    if (guidanceModalOverlay) guidanceModalOverlay.classList.add('hidden');
    clearHighlights();
    const dontShow = dontShowAgainCheckbox ? dontShowAgainCheckbox.checked : false;
    console.log("Guidance closed. 'Don't show again' was:", dontShow);
    if (window.electronAPI && typeof window.electronAPI.saveGuidanceSetting === 'function') {
        window.electronAPI.saveGuidanceSetting(dontShow);
    }
}

if (nextGuidanceBtn) {
    nextGuidanceBtn.addEventListener('click', () => {
        showGuidanceStep(currentGuidanceStep + 1);
    });
}
if (skipGuidanceBtn) {
    skipGuidanceBtn.addEventListener('click', () => {
        closeGuidance();
    });
}

// --- Folder Selection Logic ---
async function selectFolder(displayElement) {
    try {
        if (window.electronAPI && typeof window.electronAPI.openFolderDialog === 'function') {
            const folderPath = await window.electronAPI.openFolderDialog();
            if (folderPath) {
                displayElement.textContent = folderPath;
                displayElement.title = folderPath;
                console.log('選択されたフォルダ:', folderPath); // Selected folder:
                return folderPath;
            } else {
                console.log('フォルダ選択がキャンセルされました。'); // Folder selection was cancelled.
                return null;
            }
        } else {
            console.error('electronAPI.openFolderDialog is not available.');
            const dummyPath = displayElement === targetFolderPathDisplay ? "C:\\Users\\DevUser\\Pictures\\SamplePhotos" : "D:\\OrganizedPictures";
            displayElement.textContent = dummyPath;
            displayElement.title = dummyPath;
            console.log('選択されたフォルダ (開発用ダミー):', dummyPath); // Selected folder (dummy for development):
            return dummyPath;
        }
    } catch (error) {
        console.error('フォルダ選択中にエラーが発生しました:', error); // Error occurred during folder selection:
        if(statusBar) statusBar.textContent = 'フォルダ選択エラー'; // Folder selection error
        return null;
    }
}

if (targetFolderBtn) {
    targetFolderBtn.addEventListener('click', () => selectFolder(targetFolderPathDisplay));
}
if (outputFolderBtn) {
    outputFolderBtn.addEventListener('click', () => selectFolder(outputFolderPathDisplay));
}

// --- Settings Modal Logic ---
if (settingsBtn && settingsModalOverlay) {
    settingsBtn.addEventListener('click', () => {
        console.log('設定ボタンクリック。設定モーダル表示。'); // Settings button clicked. Display settings modal.
        // TODO: Load current settings from main process and populate the modal
        settingsModalOverlay.classList.remove('hidden');
    });
}
if (closeSettingsModalBtn) {
    closeSettingsModalBtn.addEventListener('click', () => settingsModalOverlay.classList.add('hidden'));
}
if (settingsCancelBtn) {
    settingsCancelBtn.addEventListener('click', () => {
        settingsModalOverlay.classList.add('hidden');
        console.log('設定モーダル: キャンセル'); // Settings modal: Cancel
    });
}
if (settingsApplyBtn) {
    settingsApplyBtn.addEventListener('click', () => {
        console.log('設定モーダル: 適用'); // Settings modal: Apply
        // TODO: Send settings to main process for saving
        // const currentSettings = {
        //     scanSubfolders: scanSubfoldersCheckbox.checked,
        //     deleteOperation: deleteToRecycleBinRadio.checked ? 'recycleBin' : 'permanently',
        //     logLevel: logLevelSelect.value,
        //     logFilePath: logFilePathInput.value
        // };
        // window.electronAPI.saveAppSettings(currentSettings);
    });
}
if (settingsOkBtn) {
    settingsOkBtn.addEventListener('click', () => {
        console.log('設定モーダル: OK'); // Settings modal: OK
        // TODO: Send settings to main process for saving and then close
        // const currentSettings = { ... };
        // window.electronAPI.saveAppSettings(currentSettings);
        settingsModalOverlay.classList.add('hidden');
    });
}
if (changeLogPathButton) {
    changeLogPathButton.addEventListener('click', async () => {
        if (logFilePathInput) {
            const newPath = await selectFolder(logFilePathInput);
            if (newPath) {
                logFilePathInput.value = newPath;
            }
        } else {
            console.error("logFilePathInput element not found for changeLogPathButton");
        }
    });
}


// --- Tab Switching Logic ---
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('tab-active'));
        button.classList.add('tab-active');
        const targetContentId = button.dataset.targetContent;
        tabContents.forEach(content => {
            content.classList.toggle('hidden', content.id !== targetContentId);
        });
        filterPanels.forEach(panel => panel.classList.add('hidden'));

        let filterPanelId = '';
        let filterTabNameText = '';
        const activeTabId = button.id;

        if (activeTabId === 'blurTab') {
            filterPanelId = 'blurFilterPanel';
            filterTabNameText = 'ブレ画像'; // Blurry Images
            if(exportErrorLogBtn) exportErrorLogBtn.classList.add('hidden');
            if(generalActions) generalActions.classList.remove('hidden');
            if(errorActions) errorActions.classList.add('hidden');
            if(footerInfoContainer) footerInfoContainer.innerHTML = `選択中のアイテム: <span id="selectedItemCount" class="font-semibold text-slate-800">0件</span> (合計サイズ: <span id="selectedItemSize" class="font-semibold text-slate-800">0 MB</span>)`; // Selected items: 0 (Total size: 0 MB)
        } else if (activeTabId === 'similarTab') {
            filterPanelId = 'similarFilterPanel';
            filterTabNameText = '類似画像'; // Similar Images
            if(exportErrorLogBtn) exportErrorLogBtn.classList.add('hidden');
            if(generalActions) generalActions.classList.remove('hidden');
            if(errorActions) errorActions.classList.add('hidden');
            if(footerInfoContainer) footerInfoContainer.innerHTML = `選択中のアイテム: <span id="selectedPairCount" class="font-semibold text-slate-800">0ペア, 0ファイル</span> (合計サイズ: <span id="selectedItemSize" class="font-semibold text-slate-800">0 MB</span>)`; // Selected items: 0 pairs, 0 files (Total size: 0 MB)
        } else if (activeTabId === 'errorTab') {
            filterPanelId = 'errorFilterPanel';
            filterTabNameText = 'エラー'; // Errors
            if(exportErrorLogBtn) exportErrorLogBtn.classList.remove('hidden');
            if(generalActions) generalActions.classList.add('hidden');
            if(errorActions) errorActions.classList.remove('hidden');
            if(footerInfoContainer) footerInfoContainer.innerHTML = `選択中のアイテム: <span id="selectedErrorCount" class="font-semibold text-slate-800">0件</span> (エラーリスト)`; // Selected items: 0 (Error list)
        }

        const targetFilterPanel = document.getElementById(filterPanelId);
        if (targetFilterPanel) targetFilterPanel.classList.remove('hidden');
        if (currentFilterTabName) currentFilterTabName.textContent = filterTabNameText;
        console.log(`${activeTabId}がクリックされました。`); // was clicked.
        // TODO: Implement data loading for the active tab
    });
});

// --- List Item Interaction and Preview Update ---
function setupListInteraction(tableBody, itemType) {
    if (!tableBody) return;
    tableBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (!row) return;

        document.querySelectorAll('#blurTableBody tr, #similarTableBody tr, #errorTableBody tr').forEach(r => r.classList.remove('selected-row'));
        row.classList.add('selected-row');

        // Reset preview area
        if(previewImageGlobal) previewImageGlobal.src = 'https://placehold.co/300x200/e2e8f0/94a3b8?text=プレビューなし'; // No preview
        if(previewImage2Global) previewImage2Global.classList.add('hidden');
        if(previewImageContainerGlobal) previewImageContainerGlobal.classList.remove('flex');

        const infoFileName = document.getElementById('infoFileName');
        const infoFilePath = document.getElementById('infoFilePath');
        const infoResolution = document.getElementById('infoResolution');
        const infoFileSize = document.getElementById('infoFileSize');
        const infoTakenDate = document.getElementById('infoTakenDate');
        const infoBlurScoreContainer = document.getElementById('infoBlurScoreContainer');
        const infoBlurScore = document.getElementById('infoBlurScore');
        const imageInfoContainer2 = document.getElementById('imageInfoContainer2');
        const infoFileName2 = document.getElementById('infoFileName2');
        const infoFilePath2 = document.getElementById('infoFilePath2');
        const infoResolution2 = document.getElementById('infoResolution2');
        const infoFileSize2 = document.getElementById('infoFileSize2');
        const infoTakenDate2 = document.getElementById('infoTakenDate2');
        const similarScoreContainer = document.getElementById('similarScoreContainer');
        const infoSimilarScore = document.getElementById('infoSimilarScore');

        if(infoFileName) { infoFileName.textContent = 'N/A'; infoFileName.title = 'N/A'; }
        if(infoFilePath) { infoFilePath.textContent = 'N/A'; infoFilePath.title = 'N/A'; }
        if(infoResolution) infoResolution.textContent = 'N/A';
        if(infoFileSize) infoFileSize.textContent = 'N/A';
        if(infoTakenDate) infoTakenDate.textContent = 'N/A';
        if(infoBlurScoreContainer) infoBlurScoreContainer.classList.add('hidden');
        if(imageInfoContainer2) imageInfoContainer2.classList.add('hidden');
        if(infoFileName2) { infoFileName2.textContent = 'N/A'; infoFileName2.title = 'N/A'; }
        if(infoFilePath2) { infoFilePath2.textContent = 'N/A'; infoFilePath2.title = 'N/A'; }
        if(infoResolution2) infoResolution2.textContent = 'N/A';
        if(infoFileSize2) infoFileSize2.textContent = 'N/A';
        if(infoTakenDate2) infoTakenDate2.textContent = 'N/A';
        if(similarScoreContainer) similarScoreContainer.classList.add('hidden');
        if(infoSimilarScore) infoSimilarScore.textContent = 'N/A';


        if (itemType === 'blur') {
            if(previewImageGlobal) previewImageGlobal.src = row.dataset.previewsrc || 'https://placehold.co/300x200/e2e8f0/94a3b8?text=プレビューなし'; // No preview
            if(infoFileName) { infoFileName.textContent = row.dataset.filename || 'N/A'; infoFileName.title = row.dataset.filename || 'N/A'; }
            if(infoFilePath) { infoFilePath.textContent = row.dataset.filepath ? `${row.dataset.filepath.substring(0,3)}...\\${row.dataset.filename}` : 'N/A'; infoFilePath.title = row.dataset.filepath || 'N/A'; }
            if(infoResolution) infoResolution.textContent = row.dataset.resolution || 'N/A';
            if(infoFileSize) infoFileSize.textContent = row.dataset.filesize || 'N/A';
            if(infoTakenDate) infoTakenDate.textContent = row.dataset.takendate || 'N/A';
            if(infoBlurScoreContainer && infoBlurScore) {
                infoBlurScore.textContent = row.dataset.blurscore || 'N/A';
                infoBlurScoreContainer.classList.remove('hidden');
            }
        } else if (itemType === 'similar') {
            if(previewImageGlobal) previewImageGlobal.src = row.dataset.previewsrc1 || 'https://placehold.co/300x200/e2e8f0/94a3b8?text=画像1なし'; // No image 1
            if(previewImage2Global) {
                previewImage2Global.src = row.dataset.previewsrc2 || 'https://placehold.co/300x200/e2e8f0/94a3b8?text=画像2なし'; // No image 2
                previewImage2Global.classList.remove('hidden');
                if(previewImageContainerGlobal) previewImageContainerGlobal.classList.add('flex');
            }
            if(infoFileName) { infoFileName.textContent = row.dataset.filename1 || 'N/A'; infoFileName.title = row.dataset.filename1 || 'N/A'; }
            if(infoFilePath) { infoFilePath.textContent = row.dataset.filepath1 ? `${row.dataset.filepath1.substring(0,3)}...\\${row.dataset.filename1}` : 'N/A'; infoFilePath.title = row.dataset.filepath1 || 'N/A'; }
            if(infoResolution) infoResolution.textContent = row.dataset.resolution1 || 'N/A';
            if(infoFileSize) infoFileSize.textContent = row.dataset.filesize1 || 'N/A';
            if(infoTakenDate) infoTakenDate.textContent = row.dataset.takendate1 || 'N/A';
            if(imageInfoContainer2) imageInfoContainer2.classList.remove('hidden');
            if(infoFileName2) { infoFileName2.textContent = row.dataset.filename2 || 'N/A'; infoFileName2.title = row.dataset.filename2 || 'N/A'; }
            if(infoFilePath2) { infoFilePath2.textContent = row.dataset.filepath2 ? `${row.dataset.filepath2.substring(0,3)}...\\${row.dataset.filename2}` : 'N/A'; infoFilePath2.title = row.dataset.filepath2 || 'N/A'; }
            if(infoResolution2) infoResolution2.textContent = row.dataset.resolution2 || 'N/A';
            if(infoFileSize2) infoFileSize2.textContent = row.dataset.filesize2 || 'N/A';
            if(infoTakenDate2) infoTakenDate2.textContent = row.dataset.takendate2 || 'N/A';
            if(similarScoreContainer && infoSimilarScore) {
                infoSimilarScore.textContent = row.dataset.similarscore || 'N/A';
                similarScoreContainer.classList.remove('hidden');
            }
        } else if (itemType === 'error') {
            if(infoFileName) { infoFileName.textContent = row.dataset.filename || 'N/A'; infoFileName.title = row.dataset.filename || 'N/A'; }
            if(infoFilePath) { infoFilePath.textContent = row.dataset.filepath ? `${row.dataset.filepath.substring(0,3)}...\\${row.dataset.filename}` : 'N/A'; infoFilePath.title = row.dataset.filepath || 'N/A'; }
            if(infoResolution) infoResolution.textContent = `エラー: ${row.dataset.errortype || '不明'}`; // Error: Unknown
        }
        console.log(`${itemType} item selected:`, row.dataset.filename || row.dataset.filename1);
    });
}


// --- Zoom Functionality ---
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
        if (e.key === 'Enter') updateZoom(e.target.value);
    });
}
if (zoomInBtnGlobal) zoomInBtnGlobal.addEventListener('click', () => updateZoom(parseInt(zoomInputGlobal.value, 10) + 10));
if (zoomOutBtnGlobal) zoomOutBtnGlobal.addEventListener('click', () => updateZoom(parseInt(zoomInputGlobal.value, 10) - 10));
if (resetZoomBtnGlobal) resetZoomBtnGlobal.addEventListener('click', () => updateZoom(100));


// --- DOMContentLoaded Listener ---
document.addEventListener('DOMContentLoaded', () => {
    const activeTab = document.querySelector('.tab-button.tab-active');
    if (activeTab) activeTab.click();

    if (blurTableBody) setupListInteraction(blurTableBody, 'blur');
    if (similarTableBody) setupListInteraction(similarTableBody, 'similar');
    if (errorTableBody) setupListInteraction(errorTableBody, 'error');

    updateZoom(100); // Set initial zoom

    // Event listeners for action buttons to show confirmation dialogs
    if (btnTrash) {
        btnTrash.addEventListener('click', () => {
            // TODO: Get actual selected items count and size
            const selectedData = { count: 1, totalSizeMB: 5.2 }; // Placeholder data
            showConfirmationDialog('trash', selectedData, () => {
                console.log('Perform trash action confirmed.');
                // TODO: Implement actual trash logic (e.g., IPC call to main process)
            });
        });
    }

    if (btnDeletePermanent) {
        btnDeletePermanent.addEventListener('click', () => {
            const selectedData = { count: 1, totalSizeMB: 2.1 }; // Placeholder data
            showConfirmationDialog('delete', selectedData, () => {
                console.log('Perform permanent delete action confirmed.');
                // TODO: Implement actual delete logic
            });
        });
    }

    if (btnMove) {
        btnMove.addEventListener('click', () => {
            const outputPath = outputFolderPathDisplay ? outputFolderPathDisplay.textContent : "未指定"; // Not specified
            const selectedData = { count: 3, totalSizeMB: 10.0, moveToPath: outputPath }; // Placeholder
            if (!outputFolderPathDisplay || outputPath === "選択されていません" || outputPath === "未指定") { // Not selected / Not specified
                 showConfirmationDialog('custom', {
                    title: "移動先未指定", // Destination not specified
                    message: "画像の移動先フォルダが選択されていません。\nヘッダーの「移動先フォルダ選択」から指定してください。", // Destination folder for images is not selected. Please specify from "Select Destination Folder" in the header.
                    confirmText: "OK",
                    dialogIconSvg: `<svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 0 24 24" width="28px" fill="currentColor" class="w-7 h-7"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>`, // warning_amber
                    dialogIconColorClass: "text-amber-500",
                    confirmBtnClasses: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                }, () => { /* No action on confirm, just close */ });
                return;
            }
            showConfirmationDialog('move', selectedData, () => {
                console.log('Perform move action confirmed. Destination:', selectedData.moveToPath);
                // TODO: Implement actual move logic
            });
        });
    }

    // Example of how to check for guidance display (you'll need to implement the main process part)
    // if (window.electronAPI && typeof window.electronAPI.getGuidanceSetting === 'function') {
    //     window.electronAPI.getGuidanceSetting().then(hideGuidance => {
    //         if (!hideGuidance) {
    //             showGuidanceStep(0);
    //         }
    //     }).catch(err => {
    //         console.error("Error getting guidance setting:", err);
    //         showGuidanceStep(0); // Fallback to show guidance if error
    //     });
    // } else {
    //      // For testing in browser or if API not ready
    //      // showGuidanceStep(0); // Uncomment to test
    // }

    console.log("DOM fully loaded and parsed. Initial setup complete.");
});

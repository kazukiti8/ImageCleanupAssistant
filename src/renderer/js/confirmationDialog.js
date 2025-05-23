// confirmationDialog.js

// Confirmation Dialog elements will be fetched when needed or passed if this becomes a class/object.
// For simplicity in this standalone module, we'll get them directly,
// assuming they exist in the global scope of the HTML where this script is used.

// Icons SVG (Google Fonts Outlined)
const ICONS = {
    info_outline: `<svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 0 24 24" width="28px" fill="currentColor" class="w-7 h-7"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`,
    warning_amber: `<svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 0 24 24" width="28px" fill="currentColor" class="w-7 h-7"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>`,
    delete_outline: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor" class="w-4 h-4"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    delete_forever_outline: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor" class="w-4 h-4"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12 1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    drive_file_move_outline: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor" class="w-4 h-4"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10zm-8-4h2V8h-2v2H8v2h4v2zm2 3l4-4-4-4v3H8v2h4v3z"/></svg>`,
    check_circle_outline: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor" class="w-4 h-4"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`
};

let currentConfirmCallback = null;
let currentCancelCallback = null;

// DOM elements for the dialog are fetched once when the module initializes.
// This assumes the HTML structure is present when this script runs.
const confirmationDialogOverlay = document.getElementById('confirmationDialogOverlay');
const dialogIconContainer = document.getElementById('dialogIconContainer');
const dialogTitle = document.getElementById('dialogTitle');
const dialogMessage = document.getElementById('dialogMessage');
const dialogExtraInfo = document.getElementById('dialogExtraInfo');
const dialogCancelBtn = document.getElementById('dialogCancelBtn');
const dialogConfirmBtn = document.getElementById('dialogConfirmBtn');
const dialogConfirmIconContainer = document.getElementById('dialogConfirmIconContainer');
const dialogConfirmBtnText = document.getElementById('dialogConfirmBtnText');

/**
 * Displays a confirmation dialog with the specified type and data.
 * @param {string} type - The type of confirmation ('trash', 'delete', 'move', or a custom type).
 * @param {object} data - Data for the dialog (e.g., { count: 5, totalSizeMB: 12.3, moveToPath: 'D:/...' }).
 * @param {function} onConfirm - Callback function to execute when the confirm button is clicked.
 * @param {function} [onCancel] - Optional callback function to execute when the cancel button is clicked or dialog is closed.
 */
export function showConfirmationDialog(type, data, onConfirm, onCancel) {
    if (!confirmationDialogOverlay || !dialogTitle || !dialogMessage || !dialogExtraInfo ||
        !dialogConfirmBtn || !dialogCancelBtn || !dialogIconContainer || !dialogConfirmIconContainer || !dialogConfirmBtnText) {
        console.error("Confirmation dialog elements not found. Ensure they are in the HTML.");
        return;
    }

    currentConfirmCallback = onConfirm;
    currentCancelCallback = onCancel;

    let titleText = "確認"; // Confirmation
    let messageText = "";
    let extraInfoText = "";
    let confirmButtonText = "実行"; // Execute
    let confirmIconSvg = ICONS.check_circle_outline;
    let dialogIconSvg = ICONS.info_outline;
    let confirmBtnClasses = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
    let dialogIconColorClass = "text-blue-500";

    const itemCount = data.count || 0;
    const totalSize = data.totalSizeMB || 0;

    switch (type) {
        case 'trash':
            titleText = "画像の削除の確認"; // Confirmation for deleting images
            messageText = `選択された ${itemCount} 件の画像 (合計 ${totalSize} MB) を\nゴミ箱へ移動します。よろしいですか？`; // Move selected X images (total Y MB) to trash. Are you sure?
            confirmButtonText = "ゴミ箱へ移動"; // Move to trash
            confirmIconSvg = ICONS.delete_outline;
            confirmBtnClasses = "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500";
            dialogIconColorClass = "text-amber-500";
            dialogIconSvg = ICONS.info_outline;
            break;
        case 'delete':
            titleText = "画像の完全な削除の確認"; // Confirmation for permanently deleting images
            messageText = `選択された ${itemCount} 件の画像 (合計 ${totalSize} MB) を\n完全に削除します。\n\nこの操作は元に戻すことができません。\n本当によろしいですか？`; // Permanently delete selected X images (total Y MB). This action cannot be undone. Are you absolutely sure?
            confirmButtonText = "完全に削除"; // Delete permanently
            confirmIconSvg = ICONS.delete_forever_outline;
            confirmBtnClasses = "bg-red-600 hover:bg-red-700 focus:ring-red-500";
            dialogIconColorClass = "text-red-500";
            dialogIconSvg = ICONS.warning_amber;
            break;
        case 'move':
            titleText = "画像の移動の確認"; // Confirmation for moving images
            messageText = `選択された ${itemCount} 件の画像 (合計 ${totalSize} MB) を\n以下の場所に移動します。よろしいですか？`; // Move selected X images (total Y MB) to the following location. Are you sure?
            extraInfoText = `移動先: ${data.moveToPath || "未指定"}`; // Destination:
            confirmButtonText = "移動する"; // Move
            confirmIconSvg = ICONS.drive_file_move_outline;
            confirmBtnClasses = "bg-sky-500 hover:bg-sky-600 focus:ring-sky-500";
            dialogIconColorClass = "text-sky-500";
            dialogIconSvg = ICONS.info_outline;
            break;
        default: // For custom dialog types
            titleText = data.title || "確認"; // Confirmation
            messageText = data.message || "実行しますか？"; // Execute?
            extraInfoText = data.extraInfo || "";
            confirmButtonText = data.confirmText || "OK";
            confirmIconSvg = data.confirmIconSvg || ICONS.check_circle_outline;
            dialogIconSvg = data.dialogIconSvg || ICONS.info_outline;
            confirmBtnClasses = data.confirmBtnClasses || "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
            dialogIconColorClass = data.dialogIconColorClass || "text-blue-500";
            break;
    }

    dialogTitle.textContent = titleText;
    dialogMessage.textContent = messageText;
    dialogExtraInfo.textContent = extraInfoText;
    dialogConfirmBtnText.textContent = confirmButtonText;

    dialogConfirmBtn.className = `flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmBtnClasses}`;
    dialogIconContainer.className = dialogIconColorClass;

    dialogIconContainer.innerHTML = dialogIconSvg;
    dialogConfirmIconContainer.innerHTML = confirmIconSvg;

    if (confirmationDialogOverlay) {
        confirmationDialogOverlay.classList.remove('hidden');
    }
}

/**
 * Closes the confirmation dialog.
 */
export function closeConfirmationDialog() {
    if (confirmationDialogOverlay) {
        confirmationDialogOverlay.classList.add('hidden');
    }
    currentConfirmCallback = null;
    currentCancelCallback = null;
}

// Initialize event listeners for the dialog buttons
// These listeners are set up once when the module is imported.
if (dialogConfirmBtn) {
    dialogConfirmBtn.addEventListener('click', () => {
        if (typeof currentConfirmCallback === 'function') {
            currentConfirmCallback();
        }
        closeConfirmationDialog();
    });
}

if (dialogCancelBtn) {
    dialogCancelBtn.addEventListener('click', () => {
        if (typeof currentCancelCallback === 'function') {
            currentCancelCallback();
        }
        closeConfirmationDialog();
    });
}

if (confirmationDialogOverlay) {
    confirmationDialogOverlay.addEventListener('click', (event) => {
        if (event.target === confirmationDialogOverlay) {
            if (typeof currentCancelCallback === 'function') {
                currentCancelCallback();
            }
            closeConfirmationDialog();
        }
    });
}

// tableManager.js - テーブル操作（ソート、フィルタリング、選択）機能を管理するモジュール

/**
 * テーブル管理クラス
 */
export class TableManager {
    /**
     * コンストラクタ
     * @param {Object} options - テーブル設定オプション
     * @param {string} options.tableBodyId - テーブルボディのID
     * @param {string} options.selectAllCheckboxId - 「すべて選択」チェックボックスのID
     * @param {string} options.itemCheckboxSelector - アイテムチェックボックスのセレクタ
     * @param {string} options.headerSelector - ヘッダーセルのセレクタ
     * @param {Function} options.onSelectionChange - 選択変更時のコールバック関数
     * @param {Function} options.onRowClick - 行クリック時のコールバック関数
     * @param {Function} options.onSort - ソート時のコールバック関数
     */
    constructor(options) {
        this.tableBody = document.getElementById(options.tableBodyId);
        this.selectAllCheckbox = document.getElementById(options.selectAllCheckboxId);
        this.itemCheckboxSelector = options.itemCheckboxSelector;
        this.headerSelector = options.headerSelector || 'th';
        this.onSelectionChange = options.onSelectionChange || null;
        this.onRowClick = options.onRowClick || null;
        this.onSort = options.onSort || null;
        
        // 選択された行のデータを格納する配列
        this.selectedRows = [];
        
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        // 「すべて選択」チェックボックスのイベント設定
        if (this.selectAllCheckbox) {
            this.selectAllCheckbox.addEventListener('change', () => {
                this.toggleSelectAll(this.selectAllCheckbox.checked);
            });
        }
        
        // テーブルボディのイベント設定
        if (this.tableBody) {
            // 行クリックイベント
            this.tableBody.addEventListener('click', (event) => {
                const row = event.target.closest('tr');
                if (!row) return;
                
                // チェックボックスのクリックは別途処理
                if (event.target.matches('input[type="checkbox"]')) {
                    const isChecked = event.target.checked;
                    this.updateRowSelection(row, isChecked);
                } else {
                    // 行全体のクリックでその行を選択状態に
                    this.selectRow(row);
                    
                    // 行クリックコールバックが設定されていれば呼び出す
                    if (typeof this.onRowClick === 'function') {
                        this.onRowClick(row);
                    }
                }
            });
            
            // 行チェックボックスの変更イベント
            this.tableBody.addEventListener('change', (event) => {
                if (event.target.matches(this.itemCheckboxSelector)) {
                    const row = event.target.closest('tr');
                    if (row) {
                        this.updateRowSelection(row, event.target.checked);
                    }
                }
            });
        }
        
        // ヘッダーのソートイベント設定
        const headers = document.querySelectorAll(this.headerSelector);
        headers.forEach(header => {
            // ソート可能なヘッダーにのみイベントを追加
            if (header.querySelector('svg')) {
                header.addEventListener('click', () => {
                    this.sortTable(header);
                });
            }
        });
    }
    
    /**
     * 行の選択状態を更新
     * @param {Element} row - 対象の行要素
     * @param {boolean} isSelected - 選択状態
     */
    updateRowSelection(row, isSelected) {
        if (!row) return;
        
        // チェックボックスの状態を更新
        const checkbox = row.querySelector(this.itemCheckboxSelector);
        if (checkbox) {
            checkbox.checked = isSelected;
        }
        
        // 行のデータを取得
        const rowData = this.getRowData(row);
        
        // 選択状態を配列に反映
        if (isSelected) {
            // 既に選択されていなければ追加
            if (!this.isRowSelected(rowData)) {
                this.selectedRows.push(rowData);
            }
        } else {
            // 既に選択されていれば削除
            this.selectedRows = this.selectedRows.filter(item => {
                return !this.isSameRow(item, rowData);
            });
        }
        
        // 「すべて選択」チェックボックスの状態を更新
        this.updateSelectAllCheckbox();
        
        // 選択変更コールバックが設定されていれば呼び出す
        if (typeof this.onSelectionChange === 'function') {
            this.onSelectionChange(this.selectedRows);
        }
    }
    
    /**
     * 行データが既に選択されているかチェック
     * @param {Object} rowData - チェックする行データ
     * @returns {boolean} 選択されているかどうか
     */
    isRowSelected(rowData) {
        return this.selectedRows.some(item => this.isSameRow(item, rowData));
    }
    
    /**
     * 2つの行データが同じかどうかを比較
     * @param {Object} row1 - 比較する行データ1
     * @param {Object} row2 - 比較する行データ2
     * @returns {boolean} 同じ行かどうか
     */
    isSameRow(row1, row2) {
        if (!row1 || !row2) return false;
        
        // ユニークなIDがあればそれで比較
        if (row1.id && row2.id) {
            return row1.id === row2.id;
        }
        
        // ファイルパスで比較
        if (row1.filePath && row2.filePath) {
            return row1.filePath === row2.filePath;
        }
        
        // 類似画像の場合、2つのファイルパスのペアで比較
        if (row1.filePath1 && row2.filePath1 && row1.filePath2 && row2.filePath2) {
            return row1.filePath1 === row2.filePath1 && row1.filePath2 === row2.filePath2;
        }
        
        // その他の場合は文字列化して比較
        return JSON.stringify(row1) === JSON.stringify(row2);
    }
    
    /**
     * 「すべて選択」チェックボックスの状態を更新
     */
    updateSelectAllCheckbox() {
        if (!this.selectAllCheckbox || !this.tableBody) return;
        
        const checkboxes = this.tableBody.querySelectorAll(this.itemCheckboxSelector);
        const checkedCount = this.tableBody.querySelectorAll(`${this.itemCheckboxSelector}:checked`).length;
        
        // すべてのチェックボックスがチェックされているかどうかで状態を設定
        if (checkboxes.length > 0 && checkedCount === checkboxes.length) {
            this.selectAllCheckbox.checked = true;
            this.selectAllCheckbox.indeterminate = false;
        } else if (checkedCount > 0) {
            this.selectAllCheckbox.checked = false;
            this.selectAllCheckbox.indeterminate = true;
        } else {
            this.selectAllCheckbox.checked = false;
            this.selectAllCheckbox.indeterminate = false;
        }
    }
    
    /**
     * すべての行の選択状態を切り替え
     * @param {boolean} isSelected - 選択状態
     */
    toggleSelectAll(isSelected) {
        if (!this.tableBody) return;
        
        const checkboxes = this.tableBody.querySelectorAll(this.itemCheckboxSelector);
        checkboxes.forEach(checkbox => {
            checkbox.checked = isSelected;
            const row = checkbox.closest('tr');
            if (row) {
                this.updateRowSelection(row, isSelected);
            }
        });
    }
    
    /**
     * 行を選択してハイライト表示
     * @param {Element} row - 選択する行要素
     */
    selectRow(row) {
        if (!row || !this.tableBody) return;
        
        // 既存の選択行からハイライトを削除
        const allRows = this.tableBody.querySelectorAll('tr');
        allRows.forEach(r => r.classList.remove('selected-row'));
        
        // 選択行にハイライトを追加
        row.classList.add('selected-row');
    }
    
    /**
     * 行からデータを取得
     * @param {Element} row - データを取得する行要素
     * @returns {Object} 行データ
     */
    getRowData(row) {
        if (!row) return {};
        
        // data-*属性から行データを構築
        const rowData = {};
        
        // すべてのdata属性を取得
        for (const key in row.dataset) {
            rowData[key] = row.dataset[key];
        }
        
        return rowData;
    }
    
    /**
     * テーブルをソート
     * @param {Element} headerCell - ソートするヘッダーセル
     */
    sortTable(headerCell) {
        if (!headerCell || !this.tableBody) return;
        
        // 現在のソート状態を取得
        const currentState = headerCell.dataset.sortState || 'none';
        let nextState = 'asc';
        
        if (currentState === 'asc') {
            nextState = 'desc';
        } else if (currentState === 'desc') {
            nextState = 'none';
        }
        
        // すべてのヘッダーからソート状態をクリア
        const allHeaders = headerCell.parentElement.querySelectorAll(this.headerSelector);
        allHeaders.forEach(header => {
            header.dataset.sortState = 'none';
            const icon = header.querySelector('svg');
            if (icon) {
                icon.classList.remove('text-blue-500', 'rotate-180');
                icon.classList.add('text-slate-400', 'opacity-50');
            }
        });
        
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
        
        // ソートコールバックが設定されていれば呼び出す
        if (typeof this.onSort === 'function') {
            // ヘッダーのインデックスを取得
            const headerIndex = Array.from(allHeaders).indexOf(headerCell);
            
            this.onSort(headerCell.textContent.trim(), nextState, headerIndex);
        } else {
            // コールバックがなければデフォルトのソート処理
            this.defaultSort(headerCell, nextState);
        }
    }
    
    /**
     * デフォルトのソート処理
     * @param {Element} headerCell - ソートするヘッダーセル
     * @param {string} sortState - ソート状態 ('asc', 'desc', 'none')
     */
    defaultSort(headerCell, sortState) {
        if (!headerCell || !this.tableBody || sortState === 'none') return;
        
        const rows = Array.from(this.tableBody.querySelectorAll('tr'));
        
        // ヘッダーのインデックスを取得
        const headerCells = headerCell.parentElement.querySelectorAll(this.headerSelector);
        const columnIndex = Array.from(headerCells).indexOf(headerCell);
        
        // 行をソート
        rows.sort((rowA, rowB) => {
            const cellA = rowA.querySelectorAll('td')[columnIndex];
            const cellB = rowB.querySelectorAll('td')[columnIndex];
            
            if (!cellA || !cellB) return 0;
            
            let valueA = cellA.textContent.trim();
            let valueB = cellB.textContent.trim();
            
            // 数値の場合は数値としてソート
            if (!isNaN(valueA) && !isNaN(valueB)) {
                valueA = parseFloat(valueA);
                valueB = parseFloat(valueB);
            }
            
            // 日付の場合は日付としてソート
            if (valueA.match(/^\d{4}\/\d{2}\/\d{2}/) && valueB.match(/^\d{4}\/\d{2}\/\d{2}/)) {
                valueA = new Date(valueA.replace(/(\d{4})\/(\d{2})\/(\d{2})/, '$1-$2-$3'));
                valueB = new Date(valueB.replace(/(\d{4})\/(\d{2})\/(\d{2})/, '$1-$2-$3'));
            }
            
            // 昇順/降順によってソート方向を変更
            if (sortState === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
        
        // ソートした行を再配置
        rows.forEach(row => {
            this.tableBody.appendChild(row);
        });
    }
    
    /**
     * 選択された行データの配列を取得
     * @returns {Array} 選択された行データの配列
     */
    getSelectedRows() {
        return [...this.selectedRows];
    }
    
    /**
     * 選択された行数を取得
     * @returns {number} 選択された行数
     */
    getSelectedCount() {
        return this.selectedRows.length;
    }
    
    /**
     * 行を追加
     * @param {string} htmlContent - 行のHTML
     */
    addRow(htmlContent) {
        if (!this.tableBody) return;
        
        // 一時的なコンテナを作成してHTMLを解析
        const temp = document.createElement('div');
        temp.innerHTML = htmlContent;
        
        // 作成した行要素をテーブルに追加
        const newRow = temp.firstElementChild;
        if (newRow) {
            this.tableBody.appendChild(newRow);
            
            // 「すべて選択」チェックボックスの状態を更新
            this.updateSelectAllCheckbox();
        }
    }
    
    /**
     * 行を削除
     * @param {string|Element} rowIdentifier - 削除する行のIDまたは行要素
     * @returns {boolean} 削除に成功したかどうか
     */
    removeRow(rowIdentifier) {
        if (!this.tableBody) return false;
        
        let rowToRemove;
        
        if (typeof rowIdentifier === 'string') {
            // IDで行を検索
            rowToRemove = this.tableBody.querySelector(`tr[data-id="${rowIdentifier}"]`);
            
            // IDが見つからない場合はfilePath属性で検索
            if (!rowToRemove) {
                rowToRemove = this.tableBody.querySelector(`tr[data-filepath="${rowIdentifier}"]`);
            }
            
            // それでも見つからない場合はfilePath1属性で検索（類似画像用）
            if (!rowToRemove) {
                rowToRemove = this.tableBody.querySelector(`tr[data-filepath1="${rowIdentifier}"]`);
            }
        } else if (rowIdentifier instanceof Element) {
            rowToRemove = rowIdentifier;
        }
        
        if (rowToRemove) {
            // 選択された行から削除
            const rowData = this.getRowData(rowToRemove);
            this.selectedRows = this.selectedRows.filter(item => !this.isSameRow(item, rowData));
            
            // DOM要素を削除
            rowToRemove.remove();
            
            // 「すべて選択」チェックボックスの状態を更新
            this.updateSelectAllCheckbox();
            
            // 選択変更コールバックが設定されていれば呼び出す
            if (typeof this.onSelectionChange === 'function') {
                this.onSelectionChange(this.selectedRows);
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * テーブルの内容をクリア
     */
    clearTable() {
        if (!this.tableBody) return;
        
        // テーブルの内容をクリア
        this.tableBody.innerHTML = '';
        
        // 選択された行をクリア
        this.selectedRows = [];
        
        // 「すべて選択」チェックボックスの状態を更新
        if (this.selectAllCheckbox) {
            this.selectAllCheckbox.checked = false;
            this.selectAllCheckbox.indeterminate = false;
        }
        
        // 選択変更コールバックが設定されていれば呼び出す
        if (typeof this.onSelectionChange === 'function') {
            this.onSelectionChange(this.selectedRows);
        }
    }
}

/**
 * ブレ画像テーブル用のテーブルマネージャーインスタンスを作成
 * @returns {TableManager} テーブルマネージャーインスタンス
 */
export function createBlurTableManager() {
    return new TableManager({
        tableBodyId: 'blurTableBody',
        selectAllCheckboxId: 'selectAllBlur',
        itemCheckboxSelector: '.blur-item-checkbox',
        onSelectionChange: (selectedRows) => {
            console.log(`ブレ画像テーブル: ${selectedRows.length}件選択されました`);
            updateSelectedItemCount(selectedRows.length);
            updateSelectedItemSize(calculateTotalSize(selectedRows));
        },
        onRowClick: (row) => {
            // プレビュー更新などの処理
            console.log('ブレ画像行がクリックされました:', row);
        },
        onSort: (columnName, sortState, columnIndex) => {
            console.log(`ブレ画像テーブル: ${columnName}を${sortState}でソートします`);
        }
    });
}

/**
 * 類似画像テーブル用のテーブルマネージャーインスタンスを作成
 * @returns {TableManager} テーブルマネージャーインスタンス
 */
export function createSimilarTableManager() {
    return new TableManager({
        tableBodyId: 'similarTableBody',
        selectAllCheckboxId: 'selectAllSimilarPair',
        itemCheckboxSelector: '.similar-pair-checkbox',
        onSelectionChange: (selectedRows) => {
            console.log(`類似画像テーブル: ${selectedRows.length}ペア選択されました`);
            updateSelectedPairCount(selectedRows.length, countSelectedFiles(selectedRows));
            updateSelectedItemSize(calculateTotalSize(selectedRows, true));
        },
        onRowClick: (row) => {
            // プレビュー更新などの処理
            console.log('類似画像行がクリックされました:', row);
        },
        onSort: (columnName, sortState, columnIndex) => {
            console.log(`類似画像テーブル: ${columnName}を${sortState}でソートします`);
        }
    });
}

/**
 * エラーテーブル用のテーブルマネージャーインスタンスを作成
 * @returns {TableManager} テーブルマネージャーインスタンス
 */
export function createErrorTableManager() {
    return new TableManager({
        tableBodyId: 'errorTableBody',
        selectAllCheckboxId: 'selectAllError',
        itemCheckboxSelector: '.error-item-checkbox',
        onSelectionChange: (selectedRows) => {
            console.log(`エラーテーブル: ${selectedRows.length}件選択されました`);
            updateSelectedErrorCount(selectedRows.length);
        },
        onRowClick: (row) => {
            // プレビュー更新などの処理
            console.log('エラー行がクリックされました:', row);
        },
        onSort: (columnName, sortState, columnIndex) => {
            console.log(`エラーテーブル: ${columnName}を${sortState}でソートします`);
        }
    });
}

/**
 * 選択アイテム数を表示要素に更新
 * @param {number} count - 選択アイテム数
 */
function updateSelectedItemCount(count) {
    const countElement = document.getElementById('selectedItemCount');
    if (countElement) {
        countElement.textContent = `${count}件`;
    }
}

/**
 * 選択ペア数とファイル数を表示要素に更新
 * @param {number} pairCount - 選択ペア数
 * @param {number} fileCount - 選択ファイル数
 */
function updateSelectedPairCount(pairCount, fileCount) {
    const countElement = document.getElementById('selectedPairCount');
    if (countElement) {
        countElement.textContent = `${pairCount}ペア, ${fileCount}ファイル`;
    }
}

/**
 * 選択エラーアイテム数を表示要素に更新
 * @param {number} count - 選択エラーアイテム数
 */
function updateSelectedErrorCount(count) {
    const countElement = document.getElementById('selectedErrorCount');
    if (countElement) {
        countElement.textContent = `${count}件`;
    }
}

/**
 * 選択アイテムの合計サイズを表示要素に更新
 * @param {number} sizeInMB - 合計サイズ（MB単位）
 */
function updateSelectedItemSize(sizeInMB) {
    const sizeElement = document.getElementById('selectedItemSize');
    if (sizeElement) {
        sizeElement.textContent = `${sizeInMB.toFixed(1)} MB`;
    }
}

/**
 * 選択された行の合計サイズを計算
 * @param {Array} selectedRows - 選択された行データの配列
 * @param {boolean} [isSimilarTable=false] - 類似画像テーブルかどうか
 * @returns {number} 合計サイズ（MB単位）
 */
function calculateTotalSize(selectedRows, isSimilarTable = false) {
    let totalSize = 0;
    
    selectedRows.forEach(row => {
        if (isSimilarTable) {
            // 類似画像テーブルの場合
            const file1Size = parseFileSize(row.filesize1);
            const file2Size = parseFileSize(row.filesize2);
            
            // 選択されているファイルのみサイズを加算
            const file1Selected = document.querySelector(`.similar-file1-checkbox[data-filepath1="${row.filepath1}"]`)?.checked || false;
            const file2Selected = document.querySelector(`.similar-file2-checkbox[data-filepath2="${row.filepath2}"]`)?.checked || false;
            
            if (file1Selected) totalSize += file1Size;
            if (file2Selected) totalSize += file2Size;
        } else {
            // ブレ画像/エラーテーブルの場合
            totalSize += parseFileSize(row.filesize);
        }
    });
    
    return totalSize;
}

/**
 * ファイルサイズ文字列をMB単位の数値に変換
 * @param {string} sizeStr - ファイルサイズ文字列（例: '2.5 MB'）
 * @returns {number} MB単位のサイズ
 */
function parseFileSize(sizeStr) {
    if (!sizeStr) return 0;
    
    const matches = sizeStr.match(/^([\d.]+)\s*([KMGTPEZY]?B)$/i);
    if (!matches) return 0;
    
    const value = parseFloat(matches[1]);
    const unit = matches[2].toUpperCase();
    
    const units = {
        'B': 1 / (1024 * 1024),
        'KB': 1 / 1024,
        'MB': 1,
        'GB': 1024,
        'TB': 1024 * 1024
    };
    
    return value * (units[unit] || 0);
}

/**
 * 選択されたファイル数をカウント（類似画像テーブル用）
 * @param {Array} selectedRows - 選択された行データの配列
 * @returns {number} 選択されたファイル数
 */
function countSelectedFiles(selectedRows) {
    const selectedFilePaths = new Set();
    
    selectedRows.forEach(row => {
        // 各行の選択状態を確認
        const file1Selected = document.querySelector(`.similar-file1-checkbox[data-filepath1="${row.filepath1}"]`)?.checked || false;
        const file2Selected = document.querySelector(`.similar-file2-checkbox[data-filepath2="${row.filepath2}"]`)?.checked || false;
        
        if (file1Selected) selectedFilePaths.add(row.filepath1);
        if (file2Selected) selectedFilePaths.add(row.filepath2);
    });
    
    return selectedFilePaths.size;
}

// デフォルトのテーブルマネージャーインスタンスをエクスポート
export default {
    blurTable: createBlurTableManager(),
    similarTable: createSimilarTableManager(),
    errorTable: createErrorTableManager()
};
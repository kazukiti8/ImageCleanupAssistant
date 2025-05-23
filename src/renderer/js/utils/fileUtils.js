// fileUtils.js - ファイル操作に関するユーティリティ関数

/**
 * ファイルサイズを人間が読みやすい形式に変換する
 * @param {number} bytes - バイト単位のサイズ
 * @returns {string} 読みやすい形式のサイズ（例：1.2 MB）
 */
export function formatFileSize(bytes) {
    if (bytes === 0 || bytes === undefined || bytes === null) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * 相対パスからファイル名を抽出する
 * @param {string} path - ファイルパス
 * @returns {string} ファイル名
 */
export function getFileNameFromPath(path) {
    if (!path) return '';
    
    // Windowsのパス（バックスラッシュ）とUNIXのパス（スラッシュ）の両方に対応
    const lastSlashIndex = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'));
    
    if (lastSlashIndex === -1) return path; // スラッシュがない場合はパス全体がファイル名
    
    return path.substring(lastSlashIndex + 1);
}

/**
 * パスの表示用に短縮する
 * @param {string} path - 元のパス
 * @param {number} maxLength - 最大表示長さ（デフォルト30文字）
 * @returns {string} 短縮されたパス
 */
export function shortenPath(path, maxLength = 30) {
    if (!path) return '';
    if (path.length <= maxLength) return path;
    
    const fileName = getFileNameFromPath(path);
    const dirPath = path.substring(0, path.length - fileName.length);
    
    // ファイル名自体が長い場合
    if (fileName.length > maxLength - 5) {
        return fileName.substring(0, maxLength - 5) + '...';
    }
    
    // ディレクトリパスを短縮
    const availableLength = maxLength - fileName.length - 5; // 5は "...\" の長さ
    let shortenedDir = '';
    
    if (availableLength > 0) {
        shortenedDir = dirPath.substring(0, 3) + '...' + dirPath.substring(dirPath.length - availableLength);
    } else {
        shortenedDir = dirPath.substring(0, 3) + '...';
    }
    
    return shortenedDir + fileName;
}

/**
 * ファイルの拡張子を取得する
 * @param {string} fileName - ファイル名
 * @returns {string} 拡張子（ドットなし、小文字）
 */
export function getFileExtension(fileName) {
    if (!fileName) return '';
    
    const lastDotIndex = fileName.lastIndexOf('.');
    
    if (lastDotIndex === -1) return ''; // 拡張子なし
    
    return fileName.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * ファイルが画像かどうかを判定する
 * @param {string} fileName - ファイル名
 * @returns {boolean} 画像かどうか
 */
export function isImageFile(fileName) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif', 'heic', 'heif', 'raw', 'svg'];
    const ext = getFileExtension(fileName);
    
    return imageExtensions.includes(ext);
}
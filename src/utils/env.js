/**
 * 判断当前是否处于 Chrome 插件环境
 * @returns {false|chrome.storage.LocalStorageArea}
 */
export const isExtension = () => {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
}
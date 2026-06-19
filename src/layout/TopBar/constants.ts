export const SEARCH_HISTORY_LIMIT = 10;
export const SEARCH_HISTORY_DISPLAY = 5;

export const isSearchHistory = (val: unknown): val is string[] =>
  Array.isArray(val) && val.every((item) => typeof item === 'string');

/** 根据平台返回搜索框快捷键提示文案 */
export function getSearchShortcutLabel(): string {
  if (typeof navigator === 'undefined') return 'Ctrl+K';
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? '⌘K' : 'Ctrl+K';
}

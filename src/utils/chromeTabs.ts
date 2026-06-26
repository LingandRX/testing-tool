import { browser } from 'wxt/browser';

/**
 * Chrome 标签页相关工具函数
 */

/**
 * 获取用户当前正在浏览的标签页。
 * popup 中 `currentWindow` 指向弹窗自身，需优先使用 `lastFocusedWindow`。
 */
export async function getCurrentTab() {
  const [tab] = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  if (tab) {
    return tab;
  }

  const [fallbackTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return fallbackTab;
}

/**
 * 在新标签页中打开扩展页面
 * @param page - 扩展页面路径（如 'popup.html'）
 * @param params - 可选的查询参数
 */
export async function openExtensionPage(
  page: string,
  params?: Record<string, string>,
): Promise<void> {
  try {
    const url = new URL(chrome.runtime.getURL(page));
    if (params) {
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    }
    await chrome.tabs.create({ url: url.toString() });
  } catch (error) {
    console.error('打开扩展页面失败:', error);
  }
}

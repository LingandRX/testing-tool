/**
 * Chrome 标签页相关工具函数
 */

/**
 * 获取当前活动的标签页
 */
export async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
  } catch (error) {
    console.error('获取活动标签页失败:', error);
    return null;
  }
}

/**
 * 获取当前活动的标签页域名
 */
export async function getActiveTabDomain(): Promise<string> {
  const tab = await getActiveTab();
  if (tab?.url) {
    try {
      const url = new URL(tab.url);
      return url.hostname;
    } catch (e) {
      console.error('解析域名失败:', e);
    }
  }
  return '';
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

/**
 * 确保内容脚本已注入
 */
export async function ensureContentScriptInjected(): Promise<boolean> {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) return false;

    // 尝试发送一个简单的探测消息
    try {
      // 这里可以根据实际情况发送一个简单的 Ping 消息
      // 目前暂时保留原有注入逻辑，由调用方决定
      return true;
    } catch (e) {
      // 如果报错，说明没注入，执行注入
      console.log('内容脚本未注入，尝试注入...');
      console.error('注入内容脚本失败:', e);
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/content-scripts/content.js'],
      });
      return true;
    }
  } catch (error) {
    console.error('注入内容脚本失败:', error);
    return false;
  }
}

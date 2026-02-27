import { browser } from 'wxt/browser';

/**
 * 获取当前活动标签页的 ID
 * @returns Promise<number | undefined> 返回活动标签页的 ID，如果未找到则返回 undefined
 */
export async function getActiveTabId(): Promise<number | undefined> {
  const activeTabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const activeTab = activeTabs[0];

  if (!activeTab) {
    throw new Error('No active tab found.');
  }

  // 检查URL是否受限
  if (activeTab?.url) {
    const restrictedProtocols = [
      'chrome:',
      'chrome-extension:',
      'about:',
      'edge:',
      'view-source:',
      'data:',
      'file:',
    ];
    if (restrictedProtocols.some((protocol) => activeTab.url!.startsWith(protocol))) {
      throw new Error(`Cannot send message to a restricted URL: ${activeTab.url}`);
    }
  }

  return activeTab.id;
}
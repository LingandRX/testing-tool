import '../.wxt/types/imports.d.ts';
import { browser } from 'wxt/browser';
import { MessageAction, onMessage, sendMessage } from '@/utils/messages';
import { createAllContextMenus, parseContextMenuClick } from '@/utils/contextMenu';
import { saveContextMenuData } from '@/utils/useContextMenuData';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    createAllContextMenus();
  });

  browser.contextMenus.onClicked.addListener(async (info, _tab) => {
    const result = parseContextMenuClick(info.menuItemId as string, info);

    if (!result.success || !result.data) {
      if (result.error) {
        console.warn('[Context Menu]', result.error);
      }
      return;
    }

    const { featureKey, payload } = result.data;

    try {
      const sidePanelState = await browser.storage.local.get('sidePanelOpen');
      const isSidePanelOpen = sidePanelState.sidePanelOpen === true;

      if (isSidePanelOpen) {
        await sendMessage(MessageAction.CONTEXT_MENU_CLICKED, { featureKey, payload });
        return;
      }
    } catch {
      // sidepanel 未打开或无法通信，继续执行其他方案
    }

    // 保存数据到 storage，popup 打开后会读取
    await saveContextMenuData({ featureKey, payload });

    // 打开 popup 弹窗
    try {
      await browser.action.openPopup();
    } catch (err) {
      // openPopup 在无活动窗口时会失败（如窗口失焦、特殊页面等）
      // 数据已保存到 storage，用户手动打开 popup 仍可正常使用
      console.warn('[Context Menu] 自动打开 popup 失败，请手动点击扩展图标:', err);
      await chrome.storage.local.remove('contextMenu/pendingData');
    }
  });

  // 监听扩展图标点击事件，打开侧边栏
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      try {
        await browser.sidePanel.open({ tabId: tab.id });
      } catch (err) {
        console.error('Failed to open side panel:', err);
      }
    }
  });

  // 使用 @webext-core/messaging 处理消息
  onMessage(MessageAction.RELOAD_TAB, async (message) => {
    const { tabId, delay = 0 } = message.data;

    const executeReload = () => {
      browser.tabs.reload(tabId).catch((err) => {
        console.error('Failed to reload tab:', err);
      });
    };

    if (delay > 0) {
      setTimeout(executeReload, delay);
    } else {
      executeReload();
    }

    return { success: true, message: '刷新请求已接收' };
  });
});

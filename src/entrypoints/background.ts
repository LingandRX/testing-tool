import '../../.wxt/types/imports.d.ts';
import { browser } from 'wxt/browser';
import { MessageAction, onMessage, sendMessage } from '@/utils/messages';
import { createAllContextMenus, parseContextMenuClick } from '@/utils/contextMenu';
import { saveContextMenuData } from '@/utils/useContextMenuData';
import { mainWorldInjectionScript } from '@/utils/rightClickInjection';

export default defineBackground(() => {
  // 1. 扩展初次安装或更新时，注册右键上下文菜单
  browser.runtime.onInstalled.addListener(() => {
    createAllContextMenus();
  });

  // 2. 右键点击路由
  browser.contextMenus.onClicked.addListener(async (info, _tab) => {
    const result = parseContextMenuClick(info.menuItemId as string, info);

    if (!result.success || !result.data) {
      if (result.error) {
        console.warn('[Context Menu Warning]', result.error);
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
    } catch (err) {
      console.debug('[Context Menu] Side panel pipeline is not available:', err);
    }

    await saveContextMenuData({ featureKey, payload });

    try {
      await browser.action.openPopup();
    } catch (err) {
      console.warn('[Context Menu] 自动打开 popup 失败，请手动点击扩展图标，数据已暂存:', err);
    }
  });

  // 扩展图标点击时打开侧边栏
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      try {
        await browser.sidePanel.open({ tabId: tab.id });
      } catch (err) {
        console.error('Failed to open side panel via extension action clicked:', err);
      }
    }
  });

  // 3. 注入主环境脚本（content script 无权访问 chrome.tabs/scripting，委托 background 执行）
  onMessage(MessageAction.INJECT_MAIN_WORLD_SCRIPT, async (message) => {
    const sender = message.sender as chrome.runtime.MessageSender | undefined;
    const tabId = sender?.tab?.id;

    if (!tabId) {
      console.warn('[RightClickRestorer] 注入请求缺少 tabId');
      return { success: false, message: '缺少 tabId' };
    }

    try {
      await browser.scripting.executeScript({
        target: { tabId },
        func: mainWorldInjectionScript,
        world: 'MAIN',
      });

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[RightClickRestorer] 执行脚本失败:', errorMsg);
      return { success: false, message: errorMsg };
    }
  });
});

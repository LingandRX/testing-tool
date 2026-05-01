import '../.wxt/types/imports.d.ts';
import { browser } from 'wxt/browser';
import { MessageAction, onMessage } from '@/utils/messages';

export default defineBackground(() => {
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
      browser.tabs.reload(tabId);
    };

    if (delay > 0) {
      setTimeout(executeReload, delay);
    } else {
      executeReload();
    }

    return { success: true, message: '刷新请求已接收' };
  });
});

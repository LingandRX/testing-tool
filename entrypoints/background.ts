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

  // 监听扩展安装或更新事件
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') {
      console.log('Extension installed for the first time');
    } else if (reason === 'update') {
      console.log('Extension updated to a new version');
    }
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
      console.log('加载完成的 Tab ID:', tabId);
    }
  });

  // 使用 @webext-core/messaging 处理消息
  onMessage(MessageAction.RELOAD_TAB, async (message) => {
    const { tabId, delay = 0 } = message.data;
    console.log('收到刷新标签页请求:', tabId);

    const executeReload = () => {
      browser.tabs
        .reload(tabId)
        .then(() => {
          console.log('标签页刷新成功:', tabId);
        })
        .catch((err) => {
          console.error('刷新标签页失败:', err.message);
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

import '../.wxt/types/imports.d.ts';
import { browser } from 'wxt/browser';
import { type MessagePayload, type MessageResponse } from '@/utils/messages';

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

  // 监听来自 popup/sidepanel 的消息
  chrome.runtime.onMessage.addListener(
    (message: MessagePayload, sender, sendResponse: (response: MessageResponse) => void) => {
      try {
        // 处理跨标签页的消息转发
        if (sender.tab) {
          // 从内容脚本或弹出页面发送的消息
          console.log('收到来自标签页的消息:', message.action);
          sendResponse({ success: true, message: '消息已收到' });
        } else {
          // 从扩展其他部分发送的消息
          console.log('收到来自扩展的消息:', message.action);
          sendResponse({ success: true, message: '消息已收到' });
        }
      } catch (error) {
        console.error('处理消息失败:', error);
        sendResponse({ success: false, message: '处理消息失败' });
      }
    },
  );
});

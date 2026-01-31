import '../.wxt/types/imports.d.ts';
import { browser } from 'wxt/browser';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') {
      // 第一次安装扩展时触发
      console.log('Extension installed for the first time');
    } else if (reason === 'update') {
      // 扩展更新时触发
      console.log('Extension updated to a new version');
    }

    // 给所有已打开的标签页注入 content script
    for (const tab of await browser.tabs.query({})) {
      if (tab.url?.match(/(chrome|chrome-extension):\/\//gi) || !tab.id) {
        continue;
      }

      // 注入 content script
      const res = browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/content-scripts/content.js'],
      });
      console.log('Content script injected on installed/updated:', res);
    }
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // 处理来自其他部分的消息
    console.log('[bg] message received:', msg, sender.tab);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      console.log('[bg] 真正活跃的页面标题是:', currentTab?.title);
      sendResponse({ ok: true, title: currentTab?.title });
    });

    if (msg.type === 'CREATE_OFFSCREEN') {
      console.log('[bg] offscreen created');
      sendResponse({ ok: true });
    }

    if (msg.type === 'DOWNLOAD') {
      console.log('[bg] DOWNLOAD received');
      sendResponse({ ok: true });
    }

    return true;
  });

  // async function _sendToActiveTab(message: {
  //   type: string;
  //   data?: unknown;
  //   activeTabId?: number;
  //   [key: string]: unknown;
  // }) {
  //   const activeTabs = await browser.tabs.query({
  //     active: true,
  //     currentWindow: true,
  //   });
  //   const activeTab = activeTabs[0];
  //   const sendTo = message.activeTabId || activeTab.id;
  //   await browser.tabs.sendMessage(sendTo!, message);
  // }
});

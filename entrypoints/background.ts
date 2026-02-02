import '../.wxt/types/imports.d.ts';
import { browser } from 'wxt/browser';

export default defineBackground(() => {
  // 监听扩展安装或更新事件
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

  // 监听来自 popup script 的消息
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === messages.popup.checkStatus) {
      console.log('[bg] checkStatus received');
      sendToActiveTab({ type: messages.content.checkStatus })
        .then(() => {
          sendResponse({ ok: true });
        })
        .catch(() => {
          sendResponse({ ok: false });
        });
      return true;
    }

    if (msg.type === messages.popup.from.start) {
      console.log('[bg] startRecording received');
      sendToActiveTab({ type: messages.content.to.startRecording })
        .then(async () => {
          await chrome.runtime.sendMessage({ type: messages.popup.to.started });
          sendResponse({ ok: true });
        })
        .catch(() => {
          sendResponse({ ok: false });
        });
    }

    if (msg.type === messages.popup.from.stop) {
      console.log('[bg] stopRecording received');
      sendToActiveTab({ type: messages.content.to.stopRecording })
        .then(async () => {
          await chrome.runtime.sendMessage({ type: messages.popup.to.stoped });
          sendResponse({ ok: true });
        })
        .catch(() => {
          sendResponse({ ok: false });
        });
    }

    return true;
  });

  async function sendToActiveTab(message: {
    type: string;
    data?: unknown;
    activeTabId?: number;
    [key: string]: unknown;
  }) {
    const activeTabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = activeTabs[0];
    const sendTo = message.activeTabId || activeTab.id;
    await chrome.tabs.sendMessage(sendTo!, message);
  }
});

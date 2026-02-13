import '../.wxt/types/imports.d.ts';
import { browser } from 'wxt/browser';
import { downloadHtmlInBackground } from '@/utils/recordUtils.tsx';

const events: unknown[] = [];

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

    // 获取所有标签页
    const tabs = await browser.tabs.query({});

    // 过滤不合法或受限制的 URL
    const targetTabs = tabs.filter((tab) => {
      if (!tab.id || !tab.url) return false;
      // 过滤掉浏览器内部页面和不支持注入的协议
      const restrictedProtocols = [
        'chrome:',
        'chrome-extension:',
        'about:',
        'edge:',
        'view-source:',
      ];
      return !restrictedProtocols.some((protocol) => tab.url!.startsWith(protocol));
    });

    const results = await Promise.allSettled(
      targetTabs.map((tab) =>
        browser.scripting
          .executeScript({
            target: { tabId: tab.id! },
            files: ['/content-scripts/content.js'],
          })
          .catch((err) => {
            console.warn(`Failed to inject script into tab ${tab.id}:`, err.message);
          }),
      ),
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    console.log(
      `Successfully injected content script into ${successCount}/${targetTabs.length} tabs.`,
    );
  });

  // 监听来自 popup script 的消息
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === messages.popup.checkStatus) {
      console.log('[bg] checkStatus received');
      sendToActiveTab({ type: messages.content.checkStatus })
        .then((res) => {
          sendResponse(res);
        })
        .catch((error: Error) => {
          if (error.message.includes('restricted URL')) {
            console.warn('Could not check status: on a restricted page.', error.message);
          } else if (error.message.includes('No active tab found')) {
            console.warn('Could not check status: no active tab found.');
          } else {
            console.error('Failed to check status in content script', error);
          }
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
        .catch((error: Error) => {
          if (error.message.includes('restricted URL')) {
            console.warn('Could not start recording: on a restricted page.', error.message);
          } else if (error.message.includes('No active tab found')) {
            console.warn('Could not start recording: no active tab found.');
          } else {
            console.error('Failed to start recording in content script', error);
          }
          sendResponse({ ok: false });
        });
    }

    if (msg.type === messages.popup.from.stop) {
      console.log('[bg] stopRecording received');
      sendToActiveTab({ type: messages.content.to.stopRecording })
        .then(async () => {
          await chrome.runtime.sendMessage({ type: messages.popup.to.stopped });
          downloadHtmlInBackground(events);
          sendResponse({ ok: true });
        })
        .catch((error: Error) => {
          if (error.message.includes('restricted URL')) {
            console.warn('Could not stop recording: on a restricted page.', error.message);
          } else if (error.message.includes('No active tab found')) {
            console.warn('Could not stop recording: no active tab found.');
          } else {
            console.error('Failed to stop recording in content script', error);
          }
          sendResponse({ ok: false });
        });
    }

    return true;
  });

  // 监听来自 content script 的消息
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === messages.content.from.saveTrackeEvents) {
      console.log('[bg] saveTrackeEvents received:', msg.payload);
      events.push(msg.payload);
      sendResponse({ ok: true });
    }
  });

  onMessage('getStringLength', (message) => {
    return message.data.length;
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

    const sendTo = message.activeTabId || activeTab.id;
    try {
      return await chrome.tabs.sendMessage(sendTo!, message);
    } catch (error) {
      console.error('Error sending message to active tab:', error);
      throw error;
    }
  }
});

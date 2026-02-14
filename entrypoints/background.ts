import '../.wxt/types/imports.d.ts';
import { browser } from 'wxt/browser';
import { downloadHtmlInBackground } from '@/utils/recordUtils.tsx';
import { sendMessage, onMessage } from '@/utils/messages';
import { getActiveTabId } from '@/utils/tabUtils';

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

  chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log('当前活跃的 Tab ID:', activeInfo.tabId);
  });

  chrome.tabs.onUpdated.addListener((tabId) => {
    console.log('加载完成的 Tab ID:', tabId);
  });

  onMessage('popup:check-status', async (message) => {
    console.log(`[background] popup:check-status: ${message}`);
    const obj = {
      active: false,
      startTime: -1,
    };

    try {
      const tabId = await getActiveTabId();
      const result = await sendMessage('content:check-status', undefined, tabId);
      console.log(`[background]111${result}`);
      obj.active = result;
      obj.startTime = new Date().getTime();
    } catch (err) {
      console.error(`[background-err]${err}`);
    }
    return obj;
  });

  onMessage('popup:start', async () => {
    console.log('[bg] startRecording received');
    try {
      const tabId = await getActiveTabId();
      const response = await sendMessage('content:start-recording', undefined, tabId);
      if (response.ok) {
        await sendMessage('popup:started', undefined);
        return { ok: true };
      }
      return { ok: false };
    } catch (error) {
      console.error('Failed to start recording in content script', error);
      return { ok: false };
    }
  });

  onMessage('popup:stop', async () => {
    console.log('[bg] stopRecording received');
    try {
      const tabId = await getActiveTabId();
      const response = await sendMessage('content:stop-recording', undefined, tabId);
      if (response.ok) {
        await sendMessage('popup:stopped', undefined);
        downloadHtmlInBackground(events);
        return { ok: true };
      }
      return { ok: false };
    } catch (error: unknown) {
      console.error('Failed to stop recording in content script', error);
      return { ok: false };
    }
  });

  onMessage('content:save-tracke-events', (eventsList) => {
    console.log('[bg] saveTrackeEvents received:', eventsList);
    events.push(eventsList);
    return true;
  });
});

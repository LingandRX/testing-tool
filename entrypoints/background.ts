import '../.wxt/types/imports.d.ts';
import { browser } from 'wxt/browser';
import { downloadHtmlInBackground } from '@/utils/recordUtils.tsx';
import { sendMessage, onMessage } from '@/utils/messages';
import { getActiveTabId } from '@/utils/tabUtils';

interface RecorderState {
  isRecording: boolean;
  recordingTabId: number | undefined;
  events: unknown[];
  startTime: number | undefined;
}

const STORAGE_KEY = 'recorder_state';

// 从 storage 恢复录制状态
async function loadRecorderState(): Promise<RecorderState> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    return (result[STORAGE_KEY] as RecorderState) || {
      isRecording: false,
      recordingTabId: undefined,
      events: [],
      startTime: undefined,
    };
  } catch (err) {
    console.error('[background] Failed to load recorder state:', err);
    return { isRecording: false, recordingTabId: undefined, events: [], startTime: undefined };
  }
}

// 保存录制状态到 storage
async function saveRecorderState(state: Partial<RecorderState>) {
  try {
    const currentState = await loadRecorderState();
    await browser.storage.local.set({
      [STORAGE_KEY]: { ...currentState, ...state },
    });
  } catch (err) {
    console.error('[background] Failed to save recorder state:', err);
  }
}

export default defineBackground(() => {
  // 监听扩展安装或更新事件
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') {
      console.log('Extension installed for the first time');
    } else if (reason === 'update') {
      console.log('Extension updated to a new version');
    }

    // 获取所有标签页
    const tabs = await browser.tabs.query({});

    // 过滤不合法或受限制的 URL
    const targetTabs = tabs.filter((tab) => {
      if (!tab.id || !tab.url) return false;
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

    // 扩展安装/更新时重置录制状态
    await saveRecorderState({ isRecording: false, recordingTabId: undefined, events: [], startTime: undefined });
  });

  // 监听 Tab 切换 - 如果正在录制且切换到其他 Tab，发出警告
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const state = await loadRecorderState();
    if (state.isRecording && state.recordingTabId !== activeInfo.tabId) {
      console.warn('[background] 录制中切换到其他 Tab，当前 Tab:', activeInfo.tabId, '录制 Tab:', state.recordingTabId);
      // 可选：发送通知给 popup 更新 UI 提示用户
      await sendMessage('popup:tab-changed', { currentTabId: activeInfo.tabId, recordingTabId: state.recordingTabId });
    }
  });

  chrome.tabs.onUpdated.addListener((tabId) => {
    console.log('加载完成的 Tab ID:', tabId);
  });

  // 监听 Tab 关闭 - 如果关闭的是录制中的 Tab，自动停止录制
  chrome.tabs.onRemoved.addListener(async (tabId) => {
    const state = await loadRecorderState();
    if (state.isRecording && state.recordingTabId === tabId) {
      console.warn('[background] 录制中的 Tab 已关闭，自动停止录制');
      // 这里可以调用停止逻辑或通知 popup
      await sendMessage('popup:stopped', undefined);
      await saveRecorderState({ isRecording: false, recordingTabId: undefined, startTime: undefined });
    }
  });

  onMessage('popup:check-status', async () => {
    console.log('[background] popup:check-status');
    const state = await loadRecorderState();
    
    // 如果正在录制，额外检查 content script 的实际状态
    if (state.isRecording && state.recordingTabId) {
      try {
        const result = await sendMessage('content:check-status', undefined, state.recordingTabId);
        console.log('[background] content check-status result:', result);
        // 如果 content script 返回 false，说明状态不同步，需要重置
        if (!result) {
          await saveRecorderState({ isRecording: false, recordingTabId: undefined, startTime: undefined });
          return { active: false, startTime: -1 };
        }
      } catch (err) {
        console.error('[background-err] check-status failed:', err);
        // Content script 可能已被移除（如页面刷新），重置状态
        await saveRecorderState({ isRecording: false, recordingTabId: undefined, startTime: undefined });
        return { active: false, startTime: -1 };
      }
    }
    
    return { active: state.isRecording, startTime: state.startTime ?? -1 };
  });

  onMessage('popup:start', async () => {
    console.log('[bg] startRecording received');
    try {
      // 检查是否已经在录制
      const currentState = await loadRecorderState();
      if (currentState.isRecording) {
        console.warn('[bg] 已经在录制中，无法开始新的录制');
        return { ok: false, error: 'Already recording' };
      }

      const tabId = await getActiveTabId();
      const response = await sendMessage('content:start-recording', undefined, tabId);
      if (response.ok) {
        // 保存录制状态到 storage
        await saveRecorderState({
          isRecording: true,
          recordingTabId: tabId,
          events: [], // 清空旧事件
          startTime: Date.now(),
        });
        await sendMessage('popup:started', undefined);
        return { ok: true };
      }
      return { ok: false, error: response.error };
    } catch (error) {
      console.error('Failed to start recording in content script', error);
      return { ok: false, error: String(error) };
    }
  });

  onMessage('popup:stop', async () => {
    console.log('[bg] stopRecording received');
    try {
      const state = await loadRecorderState();
      
      if (!state.isRecording) {
        console.warn('[bg] 当前不在录制状态');
        return { ok: false, error: 'Not recording' };
      }

      const currentTabId = await getActiveTabId();
      
      // Tab 一致性检查 - 允许一定程度的灵活性
      if (state.recordingTabId !== currentTabId) {
        console.warn(
          `[bg] Tab 不一致：录制 Tab=${state.recordingTabId}, 当前 Tab=${currentTabId}`,
        );
        // 仍然尝试在录制 Tab 上停止（如果该 Tab 还存在）
        // 如果需要在当前 Tab 停止，可以移除这个条件判断
      }

      const targetTabId = state.recordingTabId ?? currentTabId;
      const response = await sendMessage('content:stop-recording', undefined, targetTabId);
      
      if (response.ok) {
        // 下载回放文件
        downloadHtmlInBackground(state.events);
        
        // 清空状态
        await saveRecorderState({
          isRecording: false,
          recordingTabId: undefined,
          events: [],
          startTime: undefined,
        });
        
        await sendMessage('popup:stopped', undefined);
        return { ok: true };
      }
      return { ok: false, error: 'Failed to stop recording in content script' };
    } catch (error: unknown) {
      console.error('Failed to stop recording in content script', error);
      return { ok: false, error: String(error) };
    }
  });

  onMessage('content:save-tracke-events', async (event) => {
    const state = await loadRecorderState();
    if (!state.isRecording) {
      console.warn('[bg] 收到事件但当前不在录制状态，丢弃事件');
      return false;
    }
    
    // 将新事件追加到现有事件列表
    const updatedEvents = [...state.events, event];
    await saveRecorderState({ events: updatedEvents });
    return true;
  });
});

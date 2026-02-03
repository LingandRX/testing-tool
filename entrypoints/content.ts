import '../.wxt/types/imports.d.ts';
import { createRecorder } from '@/utils/useRecorder';

export default defineContentScript({
  // matches: ['*://*.google.com/*'],
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    const recorder = createRecorder();

    // 监听来自 background script 的消息
    chrome.runtime.onMessage.addListener((msg: { type: string }, _sender, sendResponse) => {
      if (msg.type === messages.content.checkStatus) {
        // 检查状态的处理逻辑
        console.log('[content] checkStatus received');
        sendResponse({ ok: true });
      }

      if (msg.type === messages.content.to.startRecording) {
        // 开始录制的处理逻辑
        console.log('[content] startRecording received');
        recorder.startRecord(messages.content.from.saveTrackeEvents);
        sendResponse({ ok: true });
      }

      if (msg.type === messages.content.to.stopRecording) {
        // 停止录制的处理逻辑
        console.log('[content] stopRecording received');
        recorder.stopRecord();
        sendResponse({ ok: true });
      }

      return true;
    });
  },
});

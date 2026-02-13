import '../.wxt/types/imports.d.ts';
import { createRecorder } from '@/utils/useRecorder';

interface IResponse {
  ok: boolean;
  error?: string;
  data?: unknown;
}

export default defineContentScript({
  // matches: ['*://*.google.com/*'],
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    const recorder = createRecorder();
    let isRecording = false;

    onMessage('getStringLength', (message) => {
      console.log(`[content] getStringLength received: ${message.data}`);
    });

    // 监听来自 background script 的消息
    chrome.runtime.onMessage.addListener(
      (msg: { type: string }, _sender, sendResponse: (response: IResponse) => void) => {
        const handleAsyncMessage = async () => {
          try {
            switch (msg.type) {
              // 在这里处理异步消息类型
              case messages.content.checkStatus:
                return { ok: true, data: { isRecording } };

              case messages.content.to.startRecording: {
                const started = await recorder.startRecord(messages.content.from.saveTrackeEvents);

                if (started) {
                  isRecording = true;
                  return { ok: true };
                } else {
                  // 如果启动失败，返回错误信息
                  return { ok: false, error: 'Failed to start recorder' };
                }
              }

              case messages.content.to.stopRecording:
                // 停止录制的处理逻辑
                console.log('[content] stopRecording received');
                recorder.stopRecord();
                isRecording = false;
                return { ok: true };

              default:
                return { ok: false, error: 'Unknown message type' };
            }
          } catch (error) {
            console.error('Error handling message:', error);
            return { ok: false };
          }
        };

        handleAsyncMessage().then((response) => {
          if (sendResponse) {
            sendResponse(response);
          }
        });

        return true;
      },
    );
  },
});

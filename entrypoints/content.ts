import '../.wxt/types/imports.d.ts';

export default defineContentScript({
  // matches: ['*://*.google.com/*'],
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    // 监听来自 background script 的消息
    chrome.runtime.onMessage.addListener((msg: { type: string }, _sender, sendResponse) => {
      if (msg.type === messages.content.checkStatus) {
        console.log('[content] checkStatus received');
        sendResponse({ ok: true });
      } else {
        console.log('[content] unknown message type:', msg.type);
      }

      return true;
    });
  },
});

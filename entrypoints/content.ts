// import { useRecorder } from '../hooks/useRecorder';

export default defineContentScript({
  // matches: ['*://*.google.com/*'],
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    console.log('Content script loaded successfully', { id: browser.runtime.id });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'START_RECORD') {
        // startRecord();
        console.log('Start recording command received in content script');
        sendResponse({ status: 'Recording started' });
      } else if (message.type === 'STOP_RECORD') {
        // stopRecord();
        console.log('Stop recording command received in content script');
        sendResponse({ status: 'Recording stopped' });
      } else {
        console.log('Unknown command received in content script');
        sendResponse({ status: 'Unknown command' });
      }

      return true;
    });
  },
});
